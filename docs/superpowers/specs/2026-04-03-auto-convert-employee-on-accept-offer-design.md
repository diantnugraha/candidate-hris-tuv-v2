# Auto Convert Candidate to Employee on Accept Offer

## Problem

When a candidate clicks "Confirm & Accept Offer", the backend currently only:
1. Sets `onboardingAcceptedAt` timestamp
2. Updates employee request status to 7 (completed)
3. Sends in-app notification to HR

It does **not** create an Employee record, User account, or send a welcome email with login credentials.

The `convertToEmployee()` function exists as a stub with TODO comments at `src/services/candidateService.ts:1593-1633`.

## Decision Summary

| Decision | Choice |
|----------|--------|
| Trigger | Automatic on accept offer (no HR approval needed) |
| Email | Welcome email with login credentials via existing `sendWelcomeEmail()` (called internally by `userRestService.createUser()`) |
| User role | Default `roleId: 1` (Employee) via existing `autoCreateUserForEmployee()` |
| Error handling | Fire-and-forget async; accept offer succeeds regardless of conversion outcome |
| Approach | Integrate directly in `acceptOnboarding` flow (no event system) |

## Design

### Flow

```
acceptOnboarding(candidateId)
  +-- [EXISTING] Set onboardingAcceptedAt timestamp
  +-- [EXISTING] Update employee request status -> 7
  +-- [EXISTING] Send in-app notification to HR
  +-- [NEW] fire-and-forget: convertToEmployee(candidateId)
        |
        +-- Validate: candidate exists, all assessments passed, onboarding complete
        |
        +-- Gather data:
        |   +-- CandidateRecruitment -> personal info
        |   +-- candidate_recruitment_detail -> job_title_id, employee_request_id (String, must parse to Number)
        |   +-- candidate_recruitment_onboarding -> job_placement, join_date (String?, must parse to Date)
        |   +-- EmployeeRequest -> departmentId (nullable)
        |
        +-- Map & create Employee via employeeService.createEmployee()
        |
        +-- employeeService.createEmployee() internally:
            +-- Create Employee record (UUID auto-generated)
            +-- autoCreateUserForEmployee() -> generate random password, create User (roleId: 1)
            +-- userRestService.createUser() internally calls sendWelcomeEmail()
```

### Data Mapping: Candidate -> Employee

| Employee Field | Source | Source Field | Notes |
|----------------|--------|-------------|-------|
| name | CandidateRecruitment | fullname | |
| email | CandidateRecruitment | email | |
| gender | CandidateRecruitment | gender | CandidateGender enum ("M"/"F") -> string, verify compatibility with existing Employee records |
| nik | CandidateRecruitment | id_no | |
| birthDate | CandidateRecruitment | birth_date | DateTime?, can be null |
| maritalStatus | CandidateRecruitment | marrital_status | |
| religion | CandidateRecruitment | religion | |
| ethnic | CandidateRecruitment | ethnic_group | Nullable |
| nationality | CandidateRecruitment | citizenship | **Requires adding `nationality` to `CreateEmployeeServiceData`** |
| address | CandidateRecruitment | address | |
| contact | CandidateRecruitment | mobile_phone | |
| jobTitleId | candidate_recruitment_detail | job_title_id | **Requires adding `jobTitleId` to both `CreateEmployeeServiceData` and `CreateEmployeeData`**. Int -> BigInt conversion needed |
| location | candidate_recruitment_onboarding | job_placement | |
| joinDate | candidate_recruitment_onboarding | join_date | String? -> Date. Must validate non-null and parseable, fallback to current date if null |
| departmentId | EmployeeRequest | departmentId | Nullable (Int?), Employee may have no department |
| status | hardcoded | "active" | |

### Prerequisite Fixes

These must be done before implementing `convertToEmployee()`:

1. **Add `nationality` to `CreateEmployeeServiceData`** in `employeeService.ts` and forward to repository
2. **Add `jobTitleId` to both `CreateEmployeeServiceData` and `CreateEmployeeData`** and map to `Employee.jobTitleId` in repository `create()` function
3. **Fix `autoCreateUserForEmployee()` bug** at `employeeService.ts:190` — `employee.employeeSuperiorId` should be `employee.superiorId` (pre-existing bug)

### Type Conversion Notes

- `candidate_recruitment_detail.employee_request_id` is `String @db.Text` — must use `Number()` or `parseInt()` when passing to repository functions that expect `number`
- `candidate_recruitment_onboarding.join_date` is `String? @db.VarChar(20)` — must parse to `Date` with defensive handling for null/unparseable values
- `candidate_recruitment_detail.job_title_id` is `Int` — Employee's `jobTitleId` is `BigInt`, conversion needed via `BigInt()`

### Error Handling

- `convertToEmployee()` is called as fire-and-forget: `.catch()` logs error with `[CONVERT-EMPLOYEE]` prefix
- If conversion fails, `acceptOnboarding` still succeeds — candidate sees "Offer accepted"
- On conversion failure, send in-app notification to HR (reuse `sendRecruitmentNotification`) with type `CONVERSION_FAILED` so HR can investigate and manually convert if needed

### Duplicate Prevention

- Check at start of `convertToEmployee()`: query for existing Employee with same email before proceeding. If found, log and return early (idempotent)
- `employeeService.createEmployee()` also checks for email duplicates as a second guard (`ConflictError`)

## Files Modified

| File | Change |
|------|--------|
| `src/services/employeeService.ts` | Add `nationality` and `jobTitleId` to `CreateEmployeeServiceData`, forward to repository |
| `src/repositories/employeeRepository.ts` | Add `jobTitleId` to `CreateEmployeeData`, map in `create()` function |
| `src/services/employeeService.ts` | Fix `employee.employeeSuperiorId` -> `employee.superiorId` in `autoCreateUserForEmployee()` |
| `src/services/candidateService.ts` | Implement `convertToEmployee()` body + add fire-and-forget call at end of `acceptOnboarding()` |

## Reused Existing Infrastructure

- `employeeService.createEmployee()` — creates employee record, triggers `autoCreateUserForEmployee()` which calls `userRestService.createUser()` (which internally sends welcome email via Mailgun)
- `candidateRepository.findById()` — fetch candidate personal data
- `candidateDetailRepository` — fetch job_title_id and employee_request_id
- `onboardingRepository.findOnboardingByCandidateId()` — fetch onboarding data (job_placement, join_date)
- `employeeRequestRepository` — fetch departmentId
- `sendRecruitmentNotification()` — notify HR on conversion failure

## Out of Scope

- No frontend changes needed (accept offer UI already works)
- No new email template (reuses existing welcome email)
- No new API endpoint (conversion happens server-side automatically)
- No event system infrastructure
