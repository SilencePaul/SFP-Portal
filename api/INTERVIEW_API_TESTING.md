# Interview API Testing Guide

## Overview

The Interview API implements role-based access control with the following logic:

### Admin Capabilities

- Create interviews (select application + interviewer)
- Read all interviews
- Update any interview field (time, result, final_decision)
- Delete interviews

### Interviewer Capabilities

- Read only interviews assigned to them
- Set interview_time (can only be set once, cannot update after set)
- Enter interview_result
- **Cannot** set final_decision (admin only)

## Schema

```javascript
{
  id: INTEGER,
  application_id: INTEGER (FK to applications),
  volunteer_id: INTEGER (FK to volunteers - the interviewer),
  volunteer_name: STRING,
  interview_time: DATE (can only be set once),
  interview_result: TEXT,
  final_decision: ENUM("pending", "approved", "rejected") - default "pending"
}
```

## API Endpoints

### 1. Get All Interviews

**Admin**: Sees all interviews  
**Interviewer**: Sees only assigned interviews

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# Save the token, then:
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:5000/api/interviews
```

```bash
# Login as interviewer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "interviewer@example.com", "password": "password123"}'

# Interviewer only sees their assigned interviews
curl -H "Authorization: Bearer <interviewer_token>" \
  http://localhost:5000/api/interviews
```

### 2. Get Interview by ID

**Admin**: Can view any interview  
**Interviewer**: Can only view assigned interviews (403 if not assigned)

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/interviews/1
```

### 3. Get Interviews by Application (Admin Only)

```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:5000/api/interviews/application/1
```

### 4. Create Interview (Admin Only)

Requires `application_id` and `volunteer_id` (interviewer).  
Optionally set `interview_time`.

```bash
curl -X POST http://localhost:5000/api/interviews \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "volunteer_id": 3,
    "interview_time": "2025-11-20T14:00:00Z"
  }'
```

### 5. Update Interview

**Admin**: Can update all fields (time, result, final_decision)  
**Interviewer**: Can set time (once) and result, but NOT final_decision

#### Interviewer sets time (can only do this once)

```bash
curl -X PATCH http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer <interviewer_token>" \
  -H "Content-Type: application/json" \
  -d '{"interview_time": "2025-11-22T10:00:00Z"}'
```

#### Interviewer enters result

```bash
curl -X PATCH http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer <interviewer_token>" \
  -H "Content-Type: application/json" \
  -d '{"interview_result": "Applicant is very responsible and has experience with dogs."}'
```

#### Admin sets final decision

```bash
curl -X PATCH http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"final_decision": "approved"}'
```

#### Trying to update time again (will fail)

```bash
curl -X PATCH http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer <interviewer_token>" \
  -H "Content-Type: application/json" \
  -d '{"interview_time": "2025-11-23T15:00:00Z"}'

# Response: 400 "Interview time already set and cannot be updated"
```

### 6. Delete Interview (Admin Only)

```bash
curl -X DELETE http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer <admin_token>"
```

## Test Workflow

### Step 1: Create an application first

You need an application to create an interview.

```bash
# Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}' | jq -r '.token')

# Create application
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "animal_id": "SFP-001",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "416-555-1234",
    "address": "123 Main St",
    "city": "Toronto",
    "state": "ON",
    "zip_code": "M1A 1A1",
    "household_type": "House",
    "has_children": true,
    "children_ages": "5, 8",
    "has_other_pets": false,
    "experience_with_pets": "I have owned dogs for 10 years",
    "hours_away": "4-6",
    "reason_for_adoption": "Looking for a family companion",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "416-555-5678",
    "agreed_to_terms": true
  }'
```

### Step 2: Create interview as admin

```bash
# Get interviewer volunteer_id (should be 3 from seeds)
curl -X POST http://localhost:5000/api/interviews \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "volunteer_id": 3
  }'
```

### Step 3: Interviewer logs in and sets time

```bash
INTERVIEWER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "interviewer@example.com", "password": "password123"}' | jq -r '.token')

# Set interview time
curl -X PATCH http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer $INTERVIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interview_time": "2025-11-25T14:00:00Z"}'
```

### Step 4: Interviewer enters result after interview

```bash
curl -X PATCH http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer $INTERVIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interview_result": "Excellent candidate. Home is safe and applicant has great experience with pets."}'
```

### Step 5: Admin reviews and approves

```bash
curl -X PATCH http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"final_decision": "approved"}'
```

## Error Cases to Test

### Interviewer tries to access non-assigned interview

```bash
# Create interview for another interviewer, then try to access as first interviewer
# Should return 403 Forbidden
```

### Interviewer tries to update time twice

```bash
# Set time once, try to set again - should return 400
```

### Interviewer tries to set final_decision

```bash
curl -X PATCH http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer $INTERVIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"final_decision": "approved"}'
# Should return 403 "Only admin can set final decision"
```

### Non-admin tries to create interview

```bash
curl -X POST http://localhost:5000/api/interviews \
  -H "Authorization: Bearer $INTERVIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "volunteer_id": 3
  }'
# Should return 403 Forbidden
```

## Notes

- Interview time can only be set once (immutable after first set)
- Only admin can set final_decision
- Interviewers can only see/update interviews assigned to them
- Admin has full CRUD access to all interviews
