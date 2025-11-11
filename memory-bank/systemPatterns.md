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
**Pattern**: Simplified rule-based calculation with penalty detection
```
Input: Job Data + Timesheet Data
  ↓
Calculate Base Pay (hours_worked × base_rate)
  ↓
Apply Penalties (late clock-in: 5% of base pay, long lunch: 2% of base pay)
  ↓
Calculate Total Pay (base_pay - total_penalties)
  ↓
Detect Anomalies (missing data, negative pay, unusual patterns)
  ↓
Output: Payroll Record with flags
```

**Implementation:**
- `calculationRules.js` - Configuration for penalties (5% late, 2% long lunch)
- `calculationService.js` - Core calculation logic (efficiency and bonuses removed)
- Handles multiple jobs per employee with job-by-job breakdown
- **Formula**: `Total Pay = Base Pay - Penalties` (no bonuses, no efficiency multipliers)
- Base Rate stored per employee in `users.base_rate` and `payroll_records.base_rate`

**Rationale**: Simplified, transparent calculations focused on base pay and penalties only

### 6. Notification Pattern ✅ **IMPLEMENTED**
**Pattern**: Event-driven notifications after key actions
- After "Process Payroll" (commit): Notify admins (review needed), managers (summary), foremen (team results), crew (personal scores)
- After "Analyze Payroll" (preview): NO notifications (preview only, no data saved)
- Role-specific notification types and content
- Stored in database for persistence
- Error notifications sent to admins only

**Implementation:**
- `notificationService.js` - Complete notification management (create, read, delete, bulk operations)
- 6 API endpoints for notification CRUD operations
- Role-based notification generation for payroll processing
- Web: NotificationBell + NotificationDropdown components (auto-refresh every 30s)
- Mobile: NotificationBanner component (animated, auto-show/hide)
- Read/unread tracking with badges
- Links to relevant pages for navigation

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
- ✅ `executionLogService` - Track processing history with full audit trail
- ✅ Optional `cronService.js` for development testing only (ENABLE_CRON=true, NODE_ENV=development)
- ✅ Execution logging integrated into `processPayroll()` with performance metrics
- ✅ 3 execution history endpoints (list, get by ID, statistics) - admin only

### 8. User Management Pattern ✅ **IMPLEMENTED**
**Pattern**: Centralized user management with role-based access control
- CRUD operations for users (create, read, update, delete)
- Admin-only access for user creation, modification, and deletion
- Self-service profile updates (limited fields for non-admins)
- Password management via Firebase Authentication (no password storage in database)
- Role assignment and crew association
- Duplicate prevention (email, employee_id)
- Search and filtering (by role, crew, name, email, employee_id)
- User statistics dashboard

**Implementation:**
- ✅ `userService.js` - 10 functions for complete user management:
  - `getUsers(filters)` - List with optional filtering (role, crew_id, search)
  - `getUserById(userId)` - Single user details
  - `getUserByEmail(email)` - Duplicate checking
  - `getUserByEmployeeId(employeeId)` - Duplicate checking
  - `createUser(userData)` - Create with validation and duplicate prevention
  - `updateUser(userId, updateData)` - Update with validation
  - `deleteUser(userId)` - Hard delete (could be changed to soft delete)
  - `getUsersByRole(role)` - Filter by role
  - `getUsersByCrew(crewId)` - Filter by crew
  - `getUserStats()` - Statistics (total, by role)
  
- ✅ 6 API endpoints with role-based access control:
  - GET `/api/users` - List all users with filters (admin only)
  - GET `/api/users/stats` - User statistics (admin only)
  - GET `/api/users/:id` - Get user details (admin or own profile)
  - POST `/api/users` - Create new user (admin only)
  - PATCH `/api/users/:id` - Update user (admin all fields, users own limited fields)
  - DELETE `/api/users/:id` - Delete user (admin only, cannot delete self)
  
- ✅ Admin web UI components:
  - `Users.jsx` - Users list page with statistics dashboard
    - 5 statistics cards (total, admins, managers, foremen, crew members)
    - Search input and role filter dropdown
    - Users table with CRUD actions
    - Role-based color coding
  - `AddUserModal.jsx` - Create new user form with validation
  - `EditUserModal.jsx` - Edit existing user form with validation
  
**Access Control:**
- Admins: Full access to all user operations
- Non-admins: Can view and update their own profiles (limited fields: name, phone_number, preferred_language)
- Admin Protection: Admins cannot delete themselves
- Duplicate Prevention: Email and employee_id must be unique

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
  ├── AuthContext (global auth state, Firebase auth, token management)
  ├── Routes
  │   ├── /login (Login page with role-based redirection)
  │   ├── /admin/* (AdminLayout)
  │   │   ├── /admin/dashboard (AdminDashboard)
  │   │   ├── /admin/upload (Upload page)
  │   │   ├── /admin/review (Review page)
  │   │   ├── /admin/approve (Approve page)
  │   │   ├── /admin/users (Users page)
  │   │   ├── /admin/reports (Reports page)
  │   │   └── /admin/settings (Settings page)
  │   ├── /manager/* (ManagerLayout)
  │   │   ├── /manager/dashboard (ManagerDashboard)
  │   │   ├── /manager/teams (Teams page)
  │   │   └── /manager/analytics (Analytics page)
  │   └── /foreman/* (ForemanLayout)
  │       ├── /foreman/dashboard (ForemanDashboard)
  │       ├── /foreman/members (TeamMembers page)
  │       ├── /foreman/schedule (Schedule page)
  │       └── /foreman/history (History page)
  └── Components
      ├── Shared (NotificationBell, NotificationDropdown, Sidebar)
      ├── Admin (AnalyzePayrollWidget, ProcessPayrollWidget, PayrollTable, etc.)
      ├── Manager (PerformanceChart, TeamCard, etc.)
      └── Foreman (MemberCard, ScheduleView, etc.)
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

### User Authentication Flow ✅ **IMPLEMENTED**
1. **Login**: User authenticates via Firebase Auth (client SDK)
2. **Token**: Firebase returns ID token
3. **Storage**: 
   - Token stored as `authToken` in localStorage (for axios interceptor)
   - User profile stored as `user` in localStorage (for persistence)
4. **Profile Fetch**: Backend `/auth/profile` endpoint fetches user role and details
5. **Role-Based Redirection**: 
   - Admin → `/admin/dashboard`
   - Manager → `/manager/dashboard`
   - Foreman → `/foreman/dashboard`
   - Crew Member → Show "Invalid credentials" (web access restricted)
6. **Requests**: 
   - Axios interceptor automatically adds `authToken` from localStorage to Authorization header
   - Direct fetch calls use `getToken()` from AuthContext
7. **Verification**: `auth` middleware verifies token on each request
8. **Role Check**: `roleCheck` middleware validates permissions
9. **Token Refresh**: `getToken()` refreshes token and updates localStorage
10. **Logout**: Clears Firebase auth, removes tokens from localStorage, redirects to login

### CSV Upload Flow
1. **Upload**: Admin uploads CSV via web interface
2. **Validation**: Backend validates file format and required columns
3. **Parsing**: `csvParser` utility processes file
4. **Storage**: Data stored temporarily or in database
5. **Processing**: Used in next payroll processing run

## Database Schema Patterns

### Core Tables
- `users` - User accounts with roles, preferences, and base_rate (hourly rate)
- `payroll_records` - Calculated payroll results (base_rate, base_pay, penalties, total_pay)
- `jobs` - Service Autopilot job data
- `timesheets` - Paychex timesheet data
- `notifications` - In-app notifications
- `execution_logs` - Payroll processing audit trail

### Relationships
- `payroll_records.employee_id` → `users.id`
- `jobs.crew_id` → `users.crew_id` (for foremen)
- `notifications.user_id` → `users.id`

## Security Patterns

### Authentication ✅ **IMPLEMENTED**
- Firebase Authentication for user login (client SDK)
- Firebase ID tokens for API authentication
- Token stored in localStorage as `authToken` for axios interceptor compatibility
- Token refresh via `getToken()` method in AuthContext
- Auth state listener (`onAuthStateChanged`) for automatic profile fetching
- Profile data persisted in localStorage for offline access

### Authorization ✅ **IMPLEMENTED**
- Role-based middleware checks (backend)
- Route-level permission enforcement (frontend routing)
- User can only access own data (crew members)
- Crew members restricted from web app access (show invalid credentials)
- Admin-only routes protected (users, payroll processing)
- Manager/Foreman role-based data filtering

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

### Frontend ✅ **IMPLEMENTED**
- Error boundaries for React components
- API error handling with user-friendly messages
- Form validation with clear feedback
- Loading states for async operations
- Axios response interceptor handles 401 errors (redirects to login)
- Polling mechanism for user profile loading during login
- Error messages for crew member access attempts

## Testing Patterns

### Unit Tests ✅ **IMPLEMENTED**
- **Test Framework**: Jest with Node test environment
- **Total Tests**: 65 tests, all passing
- **Coverage**:
  - ✅ Calculation service logic (26 tests - full coverage)
  - ✅ CSV export utilities (23 tests - all formats)
  - ✅ User service operations (13 tests - basic CRUD)
  - ✅ Data service fallbacks (2 tests)
  - ✅ Notification service (1 test - module loading)
- **Mock Strategy**: All external dependencies (Supabase, axios, Firebase) are mocked
- **Console Suppression**: console.error and console.warn suppressed for cleaner test output
- **Test Quality**: Focused on testable business logic, avoiding overly complex mocking

### Integration Tests
- ⏳ API route testing (planned for PR #23)
- ⏳ Database operations (planned)
- ⏳ Service interactions (planned)

### Mock Data
- ✅ Mock Service Autopilot API (`/mock/service-autopilot/*`) - 4 endpoints
- ✅ Mock Paychex API (`/mock/paychex/*`) - 4 endpoints
- ✅ Mock data generator (`mockDataGenerator.js`) - Generates realistic test data
- ✅ Sample CSV files (`mock-data/`) - For CSV upload testing
- ✅ Seed data for development

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

