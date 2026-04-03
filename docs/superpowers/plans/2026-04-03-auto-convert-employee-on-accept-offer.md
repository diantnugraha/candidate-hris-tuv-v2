# Auto Convert Candidate to Employee on Accept Offer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a candidate accepts their onboarding offer, automatically create an Employee record, User account, and send a welcome email with login credentials.

**Architecture:** Implement the existing stub `convertToEmployee()` in `candidateService.ts` to gather candidate/onboarding/employee-request data, map it to `CreateEmployeeServiceData`, and call `employeeService.createEmployee()` (which internally handles user creation and welcome email). Fire-and-forget from `acceptOnboarding()`.

**Tech Stack:** Fastify, Prisma, TypeScript, Mailgun (email)

**Spec:** `docs/superpowers/specs/2026-04-03-auto-convert-employee-on-accept-offer-design.md`

**Backend repo:** `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api`

---

### Task 1: Add `nationality` and `jobTitleId` to Employee Service/Repository types

**Files:**
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/services/employeeService.ts:13-40` (CreateEmployeeServiceData)
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/repositories/employeeRepository.ts:26-54` (CreateEmployeeData)
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/repositories/employeeRepository.ts:155-195` (create function)
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/services/employeeService.ts:119-163` (createEmployee — forward jobTitleId)

- [ ] **Step 1: Add `nationality` and `jobTitleId` to `CreateEmployeeServiceData`**

In `src/services/employeeService.ts`, add two fields to the type (around line 33, after `ethnic`):

```typescript
export type CreateEmployeeServiceData = {
  // ... existing fields ...
  ethnic?: string
  nationality?: string    // NEW
  jobTitleId?: number      // NEW — will be converted to BigInt in repository
  motherName?: string
  // ... rest ...
}
```

- [ ] **Step 2: Add `jobTitleId` to `CreateEmployeeData`**

In `src/repositories/employeeRepository.ts`, add to the type (around line 47, after `nationality`):

```typescript
export type CreateEmployeeData = {
  // ... existing fields ...
  nationality?: string
  jobTitleId?: number      // NEW
  motherName?: string
  // ... rest ...
}
```

- [ ] **Step 3: Map `jobTitleId` in repository `create()` function**

In `src/repositories/employeeRepository.ts`, add after line 181 (`nationality` mapping):

```typescript
if (data.jobTitleId !== undefined) createData.jobTitleId = BigInt(data.jobTitleId)
```

- [ ] **Step 4: Verify service-to-repository passthrough**

No code change needed. `employeeService.createEmployee()` passes `data` directly to `employeeRepository.create(data)` at line 144. Since both types now have matching `nationality` and `jobTitleId` fields, the spread passes them through automatically.

- [ ] **Step 5: Compile check**

```bash
cd /Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api && npx tsc --noEmit
```

Expected: No errors related to `nationality` or `jobTitleId`.

- [ ] **Step 6: Commit**

```bash
git add src/services/employeeService.ts src/repositories/employeeRepository.ts
git commit -m "feat: add nationality and jobTitleId to employee creation types"
```

---

### Task 2: Fix `autoCreateUserForEmployee` superiorId bug

**Files:**
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/services/employeeService.ts:190`

- [ ] **Step 1: Fix the field reference**

In `src/services/employeeService.ts` line 190, change:

```typescript
// BEFORE
superiorId: employee.employeeSuperiorId ?? undefined

// AFTER
superiorId: employee.superiorId ?? undefined
```

The Employee Prisma model field is `superiorId`, not `employeeSuperiorId`.

- [ ] **Step 2: Compile check**

```bash
cd /Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/employeeService.ts
git commit -m "fix: correct superiorId field reference in autoCreateUserForEmployee"
```

---

### Task 3: Add `CONVERSION_FAILED` notification type + switch case

**Files:**
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/constants/recruitmentNotificationConstants.ts`
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/services/recruitmentNotificationHelper.ts:18-39` (buildNotificationContent switch)

- [ ] **Step 1: Add the new notification type constant**

In `src/constants/recruitmentNotificationConstants.ts`, add to `RECRUITMENT_NOTIFICATION_TYPE` (after line 5):

```typescript
export const RECRUITMENT_NOTIFICATION_TYPE = {
  BIODATA_SUBMITTED: 'recruitment_biodata_submitted',
  ASSESSOR_ASSIGNED: 'recruitment_assessor_assigned',
  INTERVIEW_USER_COMPLETED: 'recruitment_interview_user_completed',
  ONBOARDING_ACCEPTED: 'recruitment_onboarding_accepted',
  CONVERSION_FAILED: 'recruitment_conversion_failed',  // NEW
} as const
```

Add to `RECRUITMENT_NOTIFICATION_CONFIG` (after line 30):

```typescript
[RECRUITMENT_NOTIFICATION_TYPE.CONVERSION_FAILED]: {
  label: 'Employee Conversion Failed',
  color: '#dc2626',
},
```

- [ ] **Step 2: Add switch case in `buildNotificationContent()`**

In `src/services/recruitmentNotificationHelper.ts`, add a new case in the switch statement (after the `ONBOARDING_ACCEPTED` case, before the closing `}`):

```typescript
    case RECRUITMENT_NOTIFICATION_TYPE.CONVERSION_FAILED:
      return {
        title: 'Employee Conversion Failed',
        message: `Failed to automatically convert candidate ${candidateName} to employee. Manual conversion may be required.`,
      }
```

- [ ] **Step 3: Compile check**

```bash
cd /Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/constants/recruitmentNotificationConstants.ts src/services/recruitmentNotificationHelper.ts
git commit -m "feat: add CONVERSION_FAILED recruitment notification type and handler"
```

---

### Task 4: Implement `convertToEmployee()` body

**Files:**
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/services/candidateService.ts:1591-1633`

- [ ] **Step 1: Add import for employeeService**

At the top of `src/services/candidateService.ts`, add import (after the existing `employeeRepository` import at line 10):

```typescript
import * as employeeService from './employeeService.js'
```

- [ ] **Step 2: Replace the `convertToEmployee()` stub**

Replace lines 1591-1633 with:

```typescript
// ==================== Convert to Employee ====================

export async function convertToEmployee(candidateId: number): Promise<{ success: boolean; message: string }> {
  // Check if candidate exists
  const candidateResult = await candidateRepository.findById(candidateId)
  if (candidateResult.isFailure()) {
    throw new Error(candidateResult.error)
  }

  const candidate = candidateResult.getValue()
  if (!candidate) {
    throw new NotFoundError('Candidate not found')
  }

  // Idempotency guard: check if employee with this email already exists
  if (candidate.email) {
    const emailExistsResult = await employeeRepository.emailExists(candidate.email)
    if (emailExistsResult.isSuccess() && emailExistsResult.getValue()) {
      return { success: true, message: 'Employee already exists for this candidate' }
    }
  }

  // Check if all assessments passed
  const passedResult = await candidateAssessmentRepository.hasPassedAllAssessments(candidateId)
  if (passedResult.isFailure()) {
    throw new Error(passedResult.error)
  }

  if (!passedResult.getValue()) {
    throw new BadRequestError('Candidate must pass all assessments before converting to employee')
  }

  // Check if onboarding is complete
  const onboardingCompleteResult = await onboardingRepository.isOnboardingComplete(candidateId)
  if (onboardingCompleteResult.isFailure()) {
    throw new Error(onboardingCompleteResult.error)
  }

  if (!onboardingCompleteResult.getValue()) {
    throw new BadRequestError('Onboarding must be complete (job placement, at least 1 facility, at least 1 program)')
  }

  // Gather candidate detail (job_title_id, employee_request_id)
  const detailResult = await candidateDetailRepository.findByCandidateId(candidateId)
  if (detailResult.isFailure()) {
    throw new Error(detailResult.error)
  }
  const detail = detailResult.getValue()
  if (!detail) {
    throw new NotFoundError('Candidate detail not found')
  }

  // Gather onboarding data (job_placement, join_date)
  const onboardingResult = await onboardingRepository.findOnboardingByCandidateId(candidateId)
  if (onboardingResult.isFailure()) {
    throw new Error(onboardingResult.error)
  }
  const onboarding = onboardingResult.getValue()
  if (!onboarding) {
    throw new NotFoundError('Onboarding not found')
  }

  // Gather employee request data (departmentId)
  const employeeRequestId = parseInt(detail.employee_request_id, 10)
  const empRequestResult = await employeeRequestRepository.findById(employeeRequestId)
  let departmentId: number | undefined
  if (empRequestResult.isSuccess()) {
    const empRequest = empRequestResult.getValue()
    departmentId = empRequest?.departmentId ?? undefined
  }

  // Parse join_date (String? -> Date), fallback to current date
  let joinDate: Date = new Date()
  if (onboarding.join_date) {
    const parsed = new Date(onboarding.join_date)
    if (!isNaN(parsed.getTime())) {
      joinDate = parsed
    }
  }

  // Map candidate gender enum to string
  const genderMap: Record<string, string> = { M: 'M', F: 'F' }
  const gender = candidate.gender ? (genderMap[candidate.gender] ?? candidate.gender) : undefined

  // Create employee via employeeService (handles user creation + welcome email internally)
  const employee = await employeeService.createEmployee({
    name: candidate.fullname,
    email: candidate.email,
    gender,
    nik: candidate.id_no || undefined,
    birthDate: candidate.birth_date ?? undefined,
    maritalStatus: candidate.marrital_status || undefined,
    religion: candidate.religion || undefined,
    ethnic: candidate.ethnic_group ?? undefined,
    nationality: candidate.citizenship || undefined,
    address: candidate.address || undefined,
    contact: candidate.mobile_phone || undefined,
    location: onboarding.job_placement || undefined,
    joinDate,
    departmentId,
    jobTitleId: detail.job_title_id,
    status: 'active',
  })

  return {
    success: true,
    message: `Employee record created successfully (ID: ${employee.employeeId})`
  }
}
```

- [ ] **Step 3: Compile check**

```bash
cd /Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/services/candidateService.ts
git commit -m "feat: implement convertToEmployee with candidate-to-employee data mapping"
```

---

### Task 5: Add fire-and-forget call in `acceptOnboarding()`

**Files:**
- Modify: `/Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api/src/services/candidateService.ts:1582-1589` (end of acceptOnboarding)

- [ ] **Step 1: Add fire-and-forget conversion call**

In `src/services/candidateService.ts`, in the `acceptOnboarding()` function, insert before the `// Fetch with relations` comment (around line 1582):

```typescript
  // Fire-and-forget: convert candidate to employee + create user + send welcome email
  convertToEmployee(candidateId).catch(async (err) => {
    console.error(`[CONVERT-EMPLOYEE] Failed to convert candidate ${candidateId} to employee:`, err instanceof Error ? err.message : err)

    // Notify HR about conversion failure
    try {
      const invitedBy = await candidateDetailRepository.getInvitedBy(candidateId)
      if (invitedBy) {
        const candidateResult = await candidateRepository.findById(candidateId)
        const candidateName = candidateResult.isSuccess()
          ? candidateResult.getValue()?.fullname || 'Unknown'
          : 'Unknown'

        await sendRecruitmentNotification({
          type: RECRUITMENT_NOTIFICATION_TYPE.CONVERSION_FAILED,
          candidateId,
          candidateName,
          targetUserIds: [invitedBy],
        })
      }
    } catch (notifErr) {
      console.error('[CONVERT-EMPLOYEE] Failed to send conversion failure notification:', notifErr)
    }
  })
```

Insert this block right before the `// Fetch with relations` comment (line 1582).

- [ ] **Step 2: Compile check**

```bash
cd /Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Manual test**

Test the full flow:
1. Have a candidate with completed onboarding (all assessments passed, job placement + facilities + programs set)
2. Log in as the candidate on the frontend
3. Click "Confirm & Accept Offer"
4. Verify:
   - `onboardingAcceptedAt` is set in `candidate_recruitment_onboarding` table
   - New record created in `employee_list` table with mapped candidate data
   - New record created in `user_rest` table with employee email
   - Welcome email received at candidate email with login credentials
   - HR receives in-app notification about onboarding acceptance
5. Try accepting again — should get "already accepted" error (idempotent)

- [ ] **Step 4: Commit**

```bash
git add src/services/candidateService.ts
git commit -m "feat: trigger auto employee conversion on onboarding acceptance"
```

---

### Task 6: Final verification

- [ ] **Step 1: Full compile check**

```bash
cd /Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api && npx tsc --noEmit
```

- [ ] **Step 2: Verify all changes**

```bash
cd /Users/diantnugraha/Documents/Documents/Development/recruitment-hris-api && git log --oneline -5
```

Expected commits (newest first):
1. `feat: trigger auto employee conversion on onboarding acceptance`
2. `feat: implement convertToEmployee with candidate-to-employee data mapping`
3. `feat: add CONVERSION_FAILED recruitment notification type and handler`
4. `fix: correct superiorId field reference in autoCreateUserForEmployee`
5. `feat: add nationality and jobTitleId to employee creation types`
