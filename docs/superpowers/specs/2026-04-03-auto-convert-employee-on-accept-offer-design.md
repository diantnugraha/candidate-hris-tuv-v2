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
| Email | Welcome email with login credentials via existing `sendWelcomeEmail()` |
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
        |   +-- candidate_recruitment_detail -> job_title_id, employee_request_id
        |   +-- candidate_recruitment_onboarding -> job_placement, join_date
        |   +-- EmployeeRequest -> departmentId
        |
        +-- Map & create Employee via employeeService.createEmployee()
        |
        +-- employeeService.createEmployee() internally:
            +-- Create Employee record (UUID auto-generated)
            +-- autoCreateUserForEmployee() -> generate random password, create User (roleId: 1)
            +-- sendWelcomeEmail() -> email + password to candidate
```

### Data Mapping: Candidate -> Employee

| Employee Field | Source | Source Field |
|----------------|--------|-------------|
| name | CandidateRecruitment | fullname |
| email | CandidateRecruitment | email |
| gender | CandidateRecruitment | gender |
| nik | CandidateRecruitment | id_no |
| birthDate | CandidateRecruitment | birth_date |
| maritalStatus | CandidateRecruitment | marrital_status |
| religion | CandidateRecruitment | religion |
| ethnic | CandidateRecruitment | ethnic_group |
| nationality | CandidateRecruitment | citizenship |
| address | CandidateRecruitment | address |
| contact | CandidateRecruitment | mobile_phone |
| location | candidate_recruitment_onboarding | job_placement |
| joinDate | candidate_recruitment_onboarding | join_date (parsed to Date) |
| departmentId | EmployeeRequest | departmentId |
| status | hardcoded | "active" |

### Error Handling

- `convertToEmployee()` is called as fire-and-forget: `.catch()` logs error with `[CONVERT-EMPLOYEE]` prefix
- If conversion fails, `acceptOnboarding` still succeeds — candidate sees "Offer accepted"
- HR already receives in-app notification and can manually follow up if conversion fails

### Duplicate Prevention

- `employeeService.createEmployee()` already checks for email duplicates (`ConflictError`)
- If candidate was already converted, fire-and-forget fails silently (logged)
- No additional guard needed

## Files Modified

| File | Change |
|------|--------|
| `src/services/candidateService.ts` | 1. Implement `convertToEmployee()` body (replace TODOs). 2. Add fire-and-forget call at end of `acceptOnboarding()` |

Only 1 file modified. Reuses existing `employeeService.createEmployee()` which handles employee creation, user account creation, and welcome email sending.

## Reused Existing Infrastructure

- `employeeService.createEmployee()` — creates employee record
- `autoCreateUserForEmployee()` — generates random password, creates user with roleId 1
- `userRestService.createUser()` — creates user, sends welcome email
- `emailService.sendWelcomeEmail()` — sends credentials via Mailgun
- `candidateRepository.findById()` — fetch candidate data
- `candidateDetailRepository` — fetch job title and employee request linkage
- `onboardingRepository.findOnboardingByCandidateId()` — fetch onboarding data
- `employeeRequestRepository` — fetch department info

## Out of Scope

- No frontend changes needed (accept offer UI already works)
- No new email template (reuses existing welcome email)
- No new API endpoint (conversion happens server-side automatically)
- No event system infrastructure
