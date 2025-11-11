# System Patterns: Clean Scapes P4P System

## Architecture Overview
The system follows a **modular microservices architecture** with clear separation of concerns:
- **Client Layer**: Web (React) and Mobile (React Native) applications
- **API Layer**: Express.js RESTful API with middleware pipeline
- **Service Layer**: Business logic services (calculation, payroll, notifications)
- **Data Layer**: Supabase PostgreSQL database
- **External Layer**: Mock APIs (Service Autopilot, Paychex) for development

## Key Design Patterns

### 1. Service-Oriented Architecture
**Pattern**: Business logic separated into dedicated services
- `calculationService.js` - P4P calculation engine
- `payrollService.js` - Payroll processing orchestration
- `dataService.js` - External API abstraction
- `notificationService.js` - Notification management
- `userService.js` - User management
- `cronService.js` - Scheduled job management

**Rationale**: Single responsibility, testability, maintainability

### 2. Middleware Pipeline
**Pattern**: Request processing through middleware chain
```
Request → Auth Middleware → Role Check → Validation → Route Handler → Error Handler
```

**Components**:
- `auth.js` - JWT token verification
- `roleCheck.js` - Role-based access control (RBAC)
- `validation.js` - Request body validation
- `errorHandler.js` - Global error handling

**Rationale**: Security, validation, and error handling centralized

### 3. Data Abstraction Layer
**Pattern**: Service abstraction for external APIs
- `dataService.js` provides unified interface ✅ **IMPLEMENTED**
- Switches between mock and real APIs based on `USE_MOCK` environment variable
- Handles API failures gracefully
- Functions: `getJobData()`, `getTimesheetData()`, `getJobAssignments()`, `getPayrollData()`, `getEmployees()`, `getCrews()`
- When `USE_MOCK=true`, uses local mock data generator or mock API routes
- When `USE_MOCK=false`, fetches from real external APIs

**Rationale**: Easy switching between development (mock) and production (real) APIs without code changes

### 4. Role-Based Access Control (RBAC)
**Pattern**: Four-tier role system with middleware protection
- **admin**: Full system access, approve payroll, manage users
- **manager**: Analytics and reports, company-wide view
- **foreman**: Team management, crew member details
- **crew_member**: Own performance data only (mobile app)

**Implementation**:
- `authenticateToken` middleware verifies Firebase JWT tokens
- `roleCheck.js` provides role-based middleware (`requireAdmin`, `requireRole`, etc.)
- Custom claims in Firebase tokens store role information
- Database users table stores role for server-side validation
- Middleware checks user role before route access

### 5. Calculation Engine Pattern ✅ **IMPLEMENTED**
**Pattern**: Rule-based calculation with anomaly detection
```
Input: Job Data + Timesheet Data
  ↓
Calculate Efficiency (budgeted_hours / actual_hours)
  ↓
Apply Bonuses (based on efficiency thresholds)
  ↓
Apply Penalties (late clock-in, long lunch)
  ↓
Calculate Total Pay (base_pay + bonuses - penalties)
  ↓
Detect Anomalies (efficiency <60% or >120%, missing data, negative pay)
  ↓
Output: Payroll Record with flags
```

**Implementation:**
- `calculationRules.js` - Configuration for penalties (5% late, 2% long lunch), bonuses (100% & 50% multipliers)
- `calculationService.js` - Core calculation logic with 6 main functions
- 26 unit tests covering all scenarios and edge cases
- Handles multiple jobs per employee with job-by-job breakdown

**Rationale**: Consistent, auditable calculations with error detection

### 6. Notification Pattern
**Pattern**: Event-driven notifications after key actions
- After "Process Payroll" (commit): Notify admins (review needed), managers (summary), foremen (team results), crew (personal scores)
- After "Analyze Payroll" (preview): NO notifications (preview only, no data saved)
- Role-specific notification types and content
- Stored in database for persistence
- Error notifications sent to admins only

**Rationale**: Keep all users informed without manual communication, but only when data is actually saved

### 7. Payroll Processing Pattern ✅ **IMPLEMENTED**
**Pattern**: Manual admin-triggered payroll processing (no automatic scheduling)
- Two-button approach:
  - **Analyze Payroll**: Preview calculations without saving (safe to run multiple times)
  - **Process Payroll**: Commit to database (with duplicate prevention)
- Duplicate prevention: UNIQUE constraint on `(employee_id, date)` in `payroll_records` table
- Reprocess functionality: Admin can delete existing records and reprocess
- Execution logging: All executions logged in `execution_logs` table
- Optional testing cron: `node-cron` available for development testing (ENABLE_CRON=true)
- Notifications: Only sent after "Process Payroll" completes, not after "Analyze Payroll"

**Implementation:** 
- ✅ `payrollService.analyzePayroll()` - Preview calculations (no DB writes, no notifications)
- ✅ `payrollService.processPayroll()` - Commit to database with duplicate detection
- ✅ 8 API endpoints: analyze, process, get records, approve, export, summary
- ✅ Role-based access: crew members see own, foremen see crew, managers/admins see all
- ✅ CSV export in 3 formats (standard, detailed, summary)
- 📋 `executionLogService` - Track processing history (PR #7)
- 📋 Optional `cronService.js` for development testing only (PR #7)

## Component Relationships

### Backend Structure
```
server.js
  ├── Express App
  ├── Middleware Stack
  ├── Routes
  │   ├── /api/auth/*
  │   ├── /api/payroll/*
  │   ├── /api/users/*
  │   ├── /api/notifications/*
  │   ├── /api/upload/*
  │   └── /mock/* (development only)
  ├── Services
  │   ├── calculationService
  │   ├── payrollService
  │   ├── dataService
  │   ├── notificationService
  │   ├── userService
  │   └── cronService
  └── Utilities
      ├── csvParser
      ├── csvExporter
      └── mockDataGenerator
```

### Frontend Structure (Web)
```
App.js
  ├── AuthContext (global auth state)
  ├── Routes
  │   ├── /login
  │   ├── /admin/* (AdminLayout)
  │   ├── /manager/* (ManagerLayout)
  │   └── /foreman/* (ForemanLayout)
  └── Components
      ├── Shared (NotificationBell, etc.)
      ├── Admin (PayrollTable, etc.)
      ├── Manager (PerformanceChart, etc.)
      └── Foreman (MemberDetailModal, etc.)
```

### Mobile App Structure
```
App.js
  ├── AuthContext
  ├── LanguageContext
  ├── Navigation
  │   ├── AuthNavigator (Login)
  │   └── MainNavigator (Bottom Tabs)
  │       ├── Home (Dashboard)
  │       ├── History
  │       └── Profile
  └── Screens
      ├── LoginScreen
      ├── DashboardScreen
      ├── BreakdownScreen
      ├── HistoryScreen
      ├── ProfileScreen
      └── HelpScreen
```

## Data Flow Patterns

### Payroll Processing Flow
1. **Trigger**: Admin clicks "Process Payroll" button (manual, no automatic scheduling)
2. **Analyze Step** (optional preview): `payrollService.analyzePayroll()` calculates without saving
3. **Process Step**: `payrollService.processPayroll()` commits to database
4. **Data Collection**: `dataService` fetches from Service Autopilot and Paychex
5. **Calculation**: `calculationService` processes each employee
6. **Duplicate Check**: Verify no existing records for date (UNIQUE constraint)
7. **Storage**: `payrollService` saves results to Supabase
8. **Execution Logging**: Log execution to `execution_logs` table
9. **Notifications**: `notificationService` creates role-specific notifications (only after Process, not Analyze)
10. **Response**: API returns processing summary

### User Authentication Flow
1. **Login**: User authenticates via Firebase Auth
2. **Token**: Firebase returns JWT token
3. **Storage**: Token stored in client (localStorage/AsyncStorage)
4. **Requests**: Token included in Authorization header
5. **Verification**: `auth` middleware verifies token on each request
6. **Role Check**: `roleCheck` middleware validates permissions

### CSV Upload Flow
1. **Upload**: Admin uploads CSV via web interface
2. **Validation**: Backend validates file format and required columns
3. **Parsing**: `csvParser` utility processes file
4. **Storage**: Data stored temporarily or in database
5. **Processing**: Used in next payroll processing run

## Database Schema Patterns

### Core Tables
- `users` - User accounts with roles and preferences
- `payroll_records` - Calculated payroll results
- `jobs` - Service Autopilot job data
- `timesheets` - Paychex timesheet data
- `notifications` - In-app notifications

### Relationships
- `payroll_records.employee_id` → `users.id`
- `jobs.crew_id` → `users.crew_id` (for foremen)
- `notifications.user_id` → `users.id`

## Security Patterns

### Authentication
- Firebase Authentication for user login
- JWT tokens for API authentication
- Token expiration and refresh handling

### Authorization
- Role-based middleware checks
- Route-level permission enforcement
- User can only access own data (crew members)

### Data Protection
- Environment variables for sensitive config
- Secure API endpoints (HTTPS)
- Input validation and sanitization

## Error Handling Patterns

### Backend
- Global error handler middleware
- Try-catch blocks in async route handlers
- Structured error responses with appropriate HTTP codes
- Error logging for debugging

### Frontend
- Error boundaries for React components
- API error handling with user-friendly messages
- Form validation with clear feedback
- Loading states for async operations

## Testing Patterns

### Unit Tests
- Calculation service logic
- Utility functions
- Data transformations

### Integration Tests
- API route testing
- Database operations
- Service interactions

### Mock Data
- ✅ Mock Service Autopilot API (`/mock/service-autopilot/*`) - 4 endpoints
- ✅ Mock Paychex API (`/mock/paychex/*`) - 4 endpoints
- ✅ Mock data generator (`mockDataGenerator.js`) - Generates realistic test data
- ✅ Sample CSV files (`mock-data/`) - For CSV upload testing
- Seed data for development

## Deployment Patterns

### Environment Configuration
- Development: Mock APIs (USE_MOCK=true), local database, local Express server
- Production: Real APIs (USE_MOCK=false), production database, Firebase Cloud Functions
- Environment variables control behavior
- Mock APIs automatically registered when `USE_MOCK=true` in server.js

### Build Process
- **Backend**: Express.js adapted for Firebase Cloud Functions
  - No traditional build needed
  - Deploy via `firebase deploy --only functions`
  - Environment variables via Firebase Functions config
- **Web**: React build → Firebase Hosting
  - `npm run build` creates static files
  - Deploy via `firebase deploy --only hosting`
- **Mobile**: Development only
  - Tested on Expo Go
  - No production build needed

### Payroll Processing Pattern
- **Manual Trigger**: Admins trigger payroll processing via web dashboard
  - POST /api/payroll/process endpoint (admin only)
  - Date selector (defaults to yesterday)
  - Processing status and results displayed in UI
  - Execution history logged in database
- **Optional Testing Cron**: node-cron available for development testing
  - Only enabled if ENABLE_CRON=true and NODE_ENV=development
  - Not used in production
  - Useful for automated testing scenarios

