# Database Schema Documentation
## Clean Scapes P4P System

This document describes the database schema for the Pay-for-Performance (P4P) system.

## Database: Supabase (PostgreSQL)

## Tables Overview

1. [users](#users-table)
2. [jobs](#jobs-table)
3. [timesheets](#timesheets-table)
4. [payroll_records](#payroll_records-table)
5. [notifications](#notifications-table)
6. [execution_logs](#execution_logs-table)

---

## users Table

Stores user accounts with role-based access control.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| role | VARCHAR(50) | NOT NULL, CHECK | User role: admin, manager, foreman, crew_member |
| name | VARCHAR(255) | NOT NULL | User's full name |
| employee_id | VARCHAR(50) | UNIQUE | Employee ID (optional) |
| crew_id | VARCHAR(50) | | Crew assignment (for foremen and crew members) |
| preferred_language | VARCHAR(10) | DEFAULT 'en', CHECK | Language preference: 'en' or 'es' |
| base_rate | DECIMAL(10, 2) | | Hourly base rate for crew members |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record last update timestamp |

### Indexes

- `idx_users_email` - On email (for login lookups)
- `idx_users_role` - On role (for role-based queries)
- `idx_users_crew_id` - On crew_id (for crew filtering)
- `idx_users_employee_id` - On employee_id (for employee lookups)

### Relationships

- Referenced by: `timesheets.employee_id`, `payroll_records.employee_id`, `notifications.user_id`, `execution_logs.triggered_by`

---

## jobs Table

Stores job data from Service Autopilot.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| external_id | VARCHAR(255) | | Service Autopilot job ID |
| date | DATE | NOT NULL | Job date |
| crew_id | VARCHAR(50) | | Assigned crew |
| service_type | VARCHAR(100) | | Type of service (Mowing, Trimming, etc.) |
| client | VARCHAR(255) | | Client name |
| budgeted_hours | DECIMAL(10, 2) | | Expected hours for job |
| actual_hours | DECIMAL(10, 2) | | Actual hours worked |
| status | VARCHAR(50) | DEFAULT 'pending' | Job status |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record last update timestamp |

### Indexes

- `idx_jobs_date` - On date (for date range queries)
- `idx_jobs_crew_id` - On crew_id (for crew filtering)
- `idx_jobs_external_id` - On external_id (for external system lookups)
- `idx_jobs_date_crew` - Composite on (date, crew_id) (for crew daily queries)

### Relationships

- None (standalone table, referenced by application logic)

---

## timesheets Table

Stores timesheet data from Paychex.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| employee_id | UUID | NOT NULL, FK → users.id | Employee reference |
| date | DATE | NOT NULL | Timesheet date |
| clock_in | TIME | | Clock-in time |
| clock_out | TIME | | Clock-out time |
| lunch_start | TIME | | Lunch break start time |
| lunch_end | TIME | | Lunch break end time |
| total_hours | DECIMAL(10, 2) | | Total hours worked |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record last update timestamp |

### Constraints

- `UNIQUE(employee_id, date)` - Prevents duplicate timesheets for same employee/date

### Indexes

- `idx_timesheets_employee_id` - On employee_id (for employee lookups)
- `idx_timesheets_date` - On date (for date range queries)
- `idx_timesheets_employee_date` - Composite on (employee_id, date) (for employee daily queries)

### Relationships

- Foreign Key: `employee_id` → `users.id` (CASCADE on delete)

---

## payroll_records Table

Stores calculated payroll results.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| employee_id | UUID | NOT NULL, FK → users.id | Employee reference |
| date | DATE | NOT NULL | Payroll date |
| hours_worked | DECIMAL(10, 2) | | Total hours worked |
| base_pay | DECIMAL(10, 2) | | Base pay (hours × rate) |
| efficiency_score | DECIMAL(5, 2) | | Efficiency percentage (budgeted/actual) |
| performance_bonus | DECIMAL(10, 2) | DEFAULT 0 | Performance bonus amount |
| penalties | DECIMAL(10, 2) | DEFAULT 0 | Total penalties (late, long lunch) |
| total_pay | DECIMAL(10, 2) | | Final pay amount (base + bonus - penalties) |
| status | VARCHAR(50) | DEFAULT 'pending', CHECK | Status: pending, approved, rejected |
| admin_notes | TEXT | | Admin notes/comments |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record last update timestamp |

### Constraints

- `UNIQUE(employee_id, date)` - **Prevents duplicate payroll records** (critical for duplicate prevention)
- `CHECK (status IN ('pending', 'approved', 'rejected'))` - Validates status values

### Indexes

- `idx_payroll_records_employee_id` - On employee_id (for employee lookups)
- `idx_payroll_records_date` - On date (for date range queries)
- `idx_payroll_records_status` - On status (for status filtering)
- `idx_payroll_records_employee_date` - Composite on (employee_id, date) (for employee daily queries)
- `idx_payroll_records_date_status` - Composite on (date, status) (for date/status filtering)

### Relationships

- Foreign Key: `employee_id` → `users.id` (CASCADE on delete)

---

## notifications Table

Stores in-app notifications for all users.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | NOT NULL, FK → users.id | User reference |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | | Notification message |
| link | VARCHAR(500) | | Link to relevant page |
| read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT NOW() | Notification creation timestamp |

### Indexes

- `idx_notifications_user_id` - On user_id (for user notification queries)
- `idx_notifications_read` - On read (for unread count queries)
- `idx_notifications_user_read` - Composite on (user_id, read) (for user unread queries)
- `idx_notifications_created_at` - On created_at (for sorting by date)

### Relationships

- Foreign Key: `user_id` → `users.id` (CASCADE on delete)

---

## execution_logs Table

Stores payroll processing execution history.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| execution_date | DATE | NOT NULL | Date of payroll being processed |
| start_time | TIMESTAMP | NOT NULL | Processing start time |
| end_time | TIMESTAMP | | Processing end time |
| records_processed | INTEGER | DEFAULT 0 | Number of records processed |
| status | VARCHAR(50) | NOT NULL, CHECK | Status: success, failed, partial |
| error_message | TEXT | | Error message if failed |
| triggered_by | UUID | FK → users.id | Admin who triggered processing |
| is_reprocess | BOOLEAN | DEFAULT FALSE | Whether this is a reprocess |
| original_execution_id | UUID | FK → execution_logs.id | Reference to original execution if reprocess |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

### Constraints

- `CHECK (status IN ('success', 'failed', 'partial'))` - Validates status values

### Indexes

- `idx_execution_logs_execution_date` - On execution_date (for date queries)
- `idx_execution_logs_status` - On status (for status filtering)
- `idx_execution_logs_triggered_by` - On triggered_by (for admin queries)
- `idx_execution_logs_is_reprocess` - On is_reprocess (for reprocess queries)
- `idx_execution_logs_created_at` - On created_at (for sorting)

### Relationships

- Foreign Key: `triggered_by` → `users.id` (SET NULL on delete)
- Foreign Key: `original_execution_id` → `execution_logs.id` (SET NULL on delete)

---

## Database Relationships Diagram

```
users
  ├── timesheets (employee_id)
  ├── payroll_records (employee_id)
  ├── notifications (user_id)
  └── execution_logs (triggered_by)

execution_logs
  └── execution_logs (original_execution_id) [self-reference for reprocess]
```

## Key Constraints

### Unique Constraints
- `users.email` - One account per email
- `users.employee_id` - One account per employee ID
- `timesheets(employee_id, date)` - One timesheet per employee per day
- `payroll_records(employee_id, date)` - **One payroll record per employee per day** (prevents duplicates)

### Foreign Key Constraints
- All foreign keys use appropriate CASCADE/SET NULL behavior
- Referential integrity maintained automatically

## Performance Considerations

- All frequently queried fields have indexes
- Composite indexes for common query patterns
- Unique constraints also serve as indexes
- Timestamps indexed for sorting and filtering

## Migration Notes

- Run `backend/migrations/001_create_tables.sql` to create all tables
- Use `backend/utils/seedData.js` to populate sample data
- All tables use UUID primary keys for better distribution
- Triggers automatically update `updated_at` timestamps

## Environment Variables Required

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key (for admin operations)
```

