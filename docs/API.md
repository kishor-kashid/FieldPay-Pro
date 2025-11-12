# API Documentation
## Clean Scapes P4P System

This document describes all API endpoints for the FieldPay-Pro backend.

**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://us-central1-fieldpay-pro.cloudfunctions.net/api`

## Authentication

All protected endpoints require authentication via Firebase JWT token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### Authentication Flow

1. Client authenticates with Firebase Authentication (client-side)
2. Client receives Firebase ID token
3. Client includes token in `Authorization: Bearer <token>` header for all API requests
4. Backend verifies token using Firebase Admin SDK
5. Backend extracts user information and role from token

---

## Authentication Endpoints

### POST /api/auth/login

**Description**: Login endpoint (handled by Firebase client SDK). This endpoint is mainly for documentation - actual login happens client-side.

**Authentication**: None

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "message": "Please use Firebase client SDK for login. Send the ID token to protected endpoints.",
  "instructions": "After Firebase login, include the ID token in Authorization header: Bearer <token>"
}
```

---

### POST /api/auth/logout

**Description**: Logout endpoint (handled by Firebase client SDK). This endpoint can be used for server-side cleanup if needed.

**Authentication**: Required

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "message": "Logout successful (client-side). Server-side cleanup completed if needed."
}
```

---

### GET /api/auth/profile

**Description**: Get authenticated user's profile information.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "employee_id": "EMP001",
    "crew_id": "CREW1",
    "preferred_language": "en",
    "base_rate": 25.00,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### PATCH /api/auth/language

**Description**: Update user's preferred language.

**Authentication**: Required

**Request Body**:
```json
{
  "language": "es"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Language preference updated",
  "data": {
    "preferred_language": "es"
  }
}
```

---

## Payroll Endpoints

### POST /api/payroll/analyze

**Description**: Analyze payroll without saving (preview mode). Safe to run multiple times.

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "date": "2024-11-10"
}
```

**Response**:
```json
{
  "success": true,
  "date": "2024-11-10",
  "recordsProcessed": 10,
  "records": [
    {
      "employee_id": "user-uuid",
      "date": "2024-11-10",
      "base_pay": 200.00,
      "total_penalties": 10.00,
      "total_pay": 190.00,
      "efficiency": 0.95,
      "anomalies": []
    }
  ]
}
```

---

### POST /api/payroll/process

**Description**: Process and save payroll to database. Creates payroll records and sends notifications.

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "date": "2024-11-10",
  "reprocess": false
}
```

**Response**:
```json
{
  "success": true,
  "date": "2024-11-10",
  "recordsProcessed": 10,
  "recordsStored": 10,
  "notificationsSent": 40,
  "message": "Payroll processed successfully"
}
```

---

### GET /api/payroll/records

**Description**: Get payroll records with optional filters. Role-based filtering applied automatically.

**Authentication**: Required

**Query Parameters**:
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `start_date` (optional): Start date for range filter (YYYY-MM-DD)
- `end_date` (optional): End date for range filter (YYYY-MM-DD)
- `employee_id` (optional): Filter by employee ID
- `crew_id` (optional): Filter by crew ID
- `approved` (optional): Filter by approval status (true/false)
- `limit` (optional): Limit number of results (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "record-uuid",
      "employee_id": "user-uuid",
      "date": "2024-11-10",
      "base_pay": 200.00,
      "total_penalties": 10.00,
      "total_pay": 190.00,
      "base_rate": 25.00,
      "approved": false,
      "anomalies": [],
      "created_at": "2024-11-11T10:00:00Z"
    }
  ]
}
```

**Role-Based Access**:
- **Crew Members**: Only see their own records
- **Foremen**: See records for their crew members
- **Managers/Admins**: See all records

---

### GET /api/payroll/records/:id

**Description**: Get specific payroll record by ID.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "record-uuid",
    "employee_id": "user-uuid",
    "date": "2024-11-10",
    "base_pay": 200.00,
    "total_penalties": 10.00,
    "total_pay": 190.00,
    "base_rate": 25.00,
    "approved": false,
    "anomalies": [],
    "job_breakdown": [],
    "created_at": "2024-11-11T10:00:00Z"
  }
}
```

---

### PUT /api/payroll/records/:id/approve

**Description**: Approve a payroll record.

**Authentication**: Required (Admin or Manager only)

**Request Body**:
```json
{
  "admin_notes": "Approved after review"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payroll record approved",
  "data": {
    "id": "record-uuid",
    "approved": true,
    "admin_notes": "Approved after review"
  }
}
```

---

### DELETE /api/payroll/records/:id

**Description**: Delete a payroll record (for reprocessing).

**Authentication**: Required (Admin only)

**Response**:
```json
{
  "success": true,
  "message": "Payroll record deleted"
}
```

---

### GET /api/payroll/export

**Description**: Export payroll records to CSV format.

**Authentication**: Required (Admin or Manager only)

**Query Parameters**:
- `date` (optional): Export records for specific date
- `start_date` (optional): Start date for range export
- `end_date` (optional): End date for range export
- `format` (optional): CSV format - `standard`, `detailed`, or `summary` (default: `standard`)

**Response**: CSV file download

---

### GET /api/payroll/summary

**Description**: Get payroll summary statistics.

**Authentication**: Required (Admin or Manager only)

**Query Parameters**:
- `date` (optional): Summary for specific date
- `start_date` (optional): Start date for range summary
- `end_date` (optional): End date for range summary

**Response**:
```json
{
  "success": true,
  "data": {
    "date": "2024-11-10",
    "total_records": 10,
    "total_base_pay": 2000.00,
    "total_penalties": 100.00,
    "total_pay": 1900.00,
    "approved_count": 8,
    "pending_count": 2,
    "anomaly_count": 1
  }
}
```

---

### GET /api/payroll/executions

**Description**: Get execution logs for payroll processing.

**Authentication**: Required (Admin only)

**Query Parameters**:
- `limit` (optional): Limit number of results (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `status` (optional): Filter by status (success, error, in_progress)

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "execution-uuid",
      "execution_date": "2024-11-10",
      "start_time": "2024-11-11T10:30:00Z",
      "end_time": "2024-11-11T10:35:00Z",
      "status": "success",
      "records_processed": 10,
      "triggered_by": "admin-uuid",
      "reprocess": false
    }
  ]
}
```

---

### GET /api/payroll/executions/:id

**Description**: Get specific execution log by ID.

**Authentication**: Required (Admin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "execution-uuid",
    "execution_date": "2024-11-10",
    "start_time": "2024-11-11T10:30:00Z",
    "end_time": "2024-11-11T10:35:00Z",
    "status": "success",
    "records_processed": 10,
    "triggered_by": "admin-uuid",
    "reprocess": false,
    "error_message": null,
    "performance_metrics": {}
  }
}
```

---

### GET /api/payroll/executions/stats

**Description**: Get execution statistics.

**Authentication**: Required (Admin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "total_executions": 100,
    "successful_executions": 95,
    "failed_executions": 5,
    "average_processing_time": 300,
    "total_records_processed": 1000
  }
}
```

---

## User Management Endpoints

### GET /api/users

**Description**: Get all users with optional filters.

**Authentication**: Required (Admin, Manager, or Foreman)

**Query Parameters**:
- `role` (optional): Filter by role (admin, manager, foreman, crew_member)
- `crew_id` (optional): Filter by crew ID
- `search` (optional): Search by name, email, or employee_id

**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "crew_member",
      "employee_id": "EMP001",
      "crew_id": "CREW1",
      "preferred_language": "en",
      "base_rate": 25.00
    }
  ]
}
```

**Role-Based Access**:
- **Foremen**: Only see their own crew members
- **Managers/Admins**: See all users

---

### GET /api/users/stats

**Description**: Get user statistics.

**Authentication**: Required (Admin or Manager only)

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 50,
    "by_role": {
      "admin": 2,
      "manager": 3,
      "foreman": 5,
      "crew_member": 40
    },
    "crew_members": 40
  }
}
```

---

### GET /api/users/:id

**Description**: Get specific user by ID.

**Authentication**: Required (Admin can view any user, others can only view themselves)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "crew_member",
    "employee_id": "EMP001",
    "crew_id": "CREW1",
    "preferred_language": "en",
    "base_rate": 25.00,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /api/users

**Description**: Create new user.

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "role": "crew_member",
  "employee_id": "EMP002",
  "crew_id": "CREW1",
  "preferred_language": "en",
  "base_rate": 25.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-uuid",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "crew_member"
  }
}
```

---

### PATCH /api/users/:id

**Description**: Update user information.

**Authentication**: Required (Admin can update all fields, users can update limited fields)

**Request Body**:
```json
{
  "name": "Jane Smith",
  "base_rate": 26.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user-uuid",
    "name": "Jane Smith",
    "base_rate": 26.00
  }
}
```

---

### DELETE /api/users/:id

**Description**: Delete user.

**Authentication**: Required (Admin only, cannot delete self)

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Notification Endpoints

### GET /api/notifications

**Description**: Get all notifications for the authenticated user.

**Authentication**: Required

**Query Parameters**:
- `read` (optional): Filter by read status (true/false)
- `type` (optional): Filter by notification type
- `limit` (optional): Limit number of results (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "notification-uuid",
      "user_id": "user-uuid",
      "type": "payroll_processed",
      "title": "Payroll Processed",
      "message": "Your payroll for 2024-11-10 has been processed.",
      "read": false,
      "link": "/payroll/records",
      "created_at": "2024-11-11T10:00:00Z"
    }
  ]
}
```

---

### GET /api/notifications/unread

**Description**: Get count of unread notifications.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "count": 3
}
```

---

### PATCH /api/notifications/:id/read

**Description**: Mark notification as read.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PATCH /api/notifications/read-all

**Description**: Mark all notifications as read.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### DELETE /api/notifications/:id

**Description**: Delete specific notification.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### DELETE /api/notifications/read

**Description**: Delete all read notifications.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "All read notifications deleted"
}
```

---

## Upload Endpoints

### POST /api/upload/service-autopilot

**Description**: Upload Service Autopilot CSV file with job data.

**Authentication**: Required (Admin only)

**Request**: multipart/form-data
- `file`: CSV file (max 10MB)

**Response**:
```json
{
  "success": true,
  "message": "Service Autopilot data uploaded successfully",
  "data": {
    "recordsProcessed": 50,
    "recordsStored": 50,
    "errors": [],
    "preview": [
      {
        "external_id": "JOB-001",
        "date": "2024-11-10",
        "crew_id": "CREW1",
        "service_type": "Full Service",
        "budgeted_hours": 4.0,
        "actual_hours": 3.5
      }
    ]
  }
}
```

---

### POST /api/upload/paychex

**Description**: Upload Paychex CSV file with timesheet data.

**Authentication**: Required (Admin only)

**Request**: multipart/form-data
- `file`: CSV file (max 10MB)

**Response**:
```json
{
  "success": true,
  "message": "Paychex data uploaded successfully",
  "data": {
    "recordsProcessed": 50,
    "recordsStored": 50,
    "missingEmployees": [],
    "errors": [],
    "preview": [
      {
        "employee_id": "EMP001",
        "date": "2024-11-10",
        "clock_in": "07:00:00",
        "clock_out": "15:00:00",
        "total_hours": 8.0,
        "base_rate": 25.00
      }
    ]
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `401`: Unauthorized - Invalid or missing authentication token
- `403`: Forbidden - User does not have permission for this action
- `400`: Bad Request - Invalid request data
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

---

## Versioning

API versioning is not currently implemented. All endpoints are under `/api/`.

---

## Mock APIs

During development, mock APIs are available at:
- `/mock/service-autopilot/*` - Mock Service Autopilot endpoints
- `/mock/paychex/*` - Mock Paychex endpoints

Set `USE_MOCK=true` in backend `.env` to enable mock data generation.

