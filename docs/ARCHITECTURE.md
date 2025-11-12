# Architecture Documentation
## Clean Scapes P4P System

This document describes the system architecture, data flow, and component descriptions for the FieldPay-Pro system.

## System Overview

FieldPay-Pro is a three-tier application consisting of:
1. **Backend API** (Node.js + Express + Firebase Cloud Functions)
2. **Web Dashboard** (React + Tailwind CSS)
3. **Mobile App** (React Native + Expo)

## High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Web Dashboard │         │   Mobile App    │         │  External APIs  │
│   (React)       │         │ (React Native)  │         │ (Service Auto,  │
│                 │         │                 │         │    Paychex)      │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │                           │                           │
         └───────────────┬────────────┴───────────────────────────┘
                         │
                         │ HTTP/REST API
                         │
         ┌───────────────▼───────────────┐
         │    Backend API (Express)      │
         │  Firebase Cloud Functions    │
         │                               │
         ├── Authentication (Firebase) │
         ├── Business Logic Services   │
         ├── Data Access Layer         │
         └───────────────┬───────────────┘
                         │
                         │ PostgreSQL
                         │
         ┌───────────────▼───────────────┐
         │    Supabase Database         │
         │    (PostgreSQL)              │
         └──────────────────────────────┘
```

## Component Architecture

### Backend Layer

#### 1. API Routes (`backend/routes/`)
- **auth.js**: Authentication and profile management
- **payroll.js**: Payroll processing, analysis, and export
- **users.js**: User management (CRUD operations)
- **notifications.js**: Notification management
- **upload.js**: CSV file upload handling

#### 2. Middleware (`backend/middleware/`)
- **auth.js**: JWT token verification using Firebase Admin SDK
- **roleCheck.js**: Role-based access control (RBAC)
- **validation.js**: Request validation middleware
- **errorHandler.js**: Global error handling middleware

#### 3. Services (`backend/services/`)
- **calculationService.js**: P4P calculation engine
  - Efficiency calculations
  - Penalty detection (late clock-in, long lunch)
  - Anomaly detection
- **payrollService.js**: Payroll processing orchestration
  - Analyze payroll (preview mode)
  - Process payroll (commit to database)
  - Record retrieval with role-based filtering
- **dataService.js**: External API abstraction layer
  - Unified interface for Service Autopilot and Paychex
  - Switches between mock and real APIs
- **notificationService.js**: Notification management
  - Role-based notification creation
  - Notification CRUD operations
- **userService.js**: User management
  - User CRUD operations
  - Search and filtering
  - Statistics
- **executionLogService.js**: Audit trail for payroll processing
- **cronService.js**: Optional scheduled jobs (testing only)

#### 4. Utilities (`backend/utils/`)
- **csvParser.js**: CSV parsing and validation
- **csvExporter.js**: CSV export generation (3 formats)
- **formatters.js**: Data formatting utilities

#### 5. Configuration (`backend/config/`)
- **database.js**: Supabase client configuration
- **firebase.js**: Firebase Admin SDK configuration
- **calculationRules.js**: P4P calculation rules and settings

### Frontend Layer (Web)

#### 1. Pages (`frontend-web/src/pages/`)
- **Login.jsx**: Authentication page
- **admin/**: Admin dashboard pages
  - Dashboard, Upload, Review, Approve, Users, Reports, Settings
- **manager/**: Manager dashboard pages
  - Dashboard, Teams, Analytics
- **foreman/**: Foreman dashboard pages
  - Dashboard, TeamMembers, Schedule, History

#### 2. Components (`frontend-web/src/components/`)
- **Layouts**: AdminLayout, ManagerLayout, ForemanLayout
- **Shared**: Sidebar, NotificationBell, NotificationDropdown
- **Forms**: AddUserModal, EditUserModal
- **Data Display**: PayrollTable, AnalyzePayrollWidget, ProcessPayrollWidget
- **File Upload**: FileUpload, CSVPreview
- **Error Handling**: ErrorBoundary

#### 3. Services (`frontend-web/src/services/`)
- **api.js**: Axios instance with interceptors
  - Authentication header injection
  - Error handling
  - API method exports (authAPI, payrollAPI, userAPI, etc.)

#### 4. Context (`frontend-web/src/context/`)
- **AuthContext.js**: Authentication state management
  - Login/logout
  - User profile
  - Token management

### Mobile Layer

#### 1. Screens (`mobile/src/screens/`)
- **LoginScreen.js**: Authentication
- **DashboardScreen.js**: Yesterday's performance
- **BreakdownScreen.js**: Detailed pay calculation
- **HistoryScreen.js**: 30-day performance history
- **ProfileScreen.js**: User profile and settings
- **HelpScreen.js**: FAQ and help

#### 2. Components (`mobile/src/components/`)
- **ScoreCard.js**: Performance score with star rating
- **PayoutBreakdown.js**: Pay breakdown display
- **QuickStats.js**: Quick statistics cards
- **JobBreakdownCard.js**: Individual job details
- **PerformanceTrendChart.js**: Performance trend visualization
- **HistoryCard.js**: History item display
- **NotificationBanner.js**: In-app notification banner
- **LanguageToggle.js**: Language switcher

#### 3. Navigation (`mobile/src/navigation/`)
- **AppNavigator.js**: Root navigator
- **AuthNavigator.js**: Authentication flow
- **MainNavigator.js**: Main app navigation (bottom tabs)

#### 4. Context (`mobile/src/context/`)
- **AuthContext.js**: Authentication state with AsyncStorage
- **LanguageContext.js**: Language preference management

#### 5. i18n (`mobile/src/i18n/`)
- **en.json**: English translations
- **es.json**: Spanish translations
- **index.js**: react-i18next configuration

## Data Flow

### Payroll Processing Flow

```
1. Admin triggers "Analyze Payroll" or "Process Payroll"
   │
   ├─► POST /api/payroll/analyze (preview) or /api/payroll/process (commit)
   │
2. Backend fetches data from external APIs (or mock APIs)
   │
   ├─► dataService.getJobData(date)
   ├─► dataService.getTimesheetData(date)
   │
3. Backend calculates payroll for each employee
   │
   ├─► calculationService.calculateEmployeePayroll(employee, jobs, timesheet)
   │   ├─► Calculate base pay (hours × rate)
   │   ├─► Apply penalties (late clock-in, long lunch)
   │   ├─► Calculate total pay (base pay - penalties)
   │   └─► Detect anomalies
   │
4. If "Process Payroll":
   │
   ├─► Save records to database (payroll_records table)
   ├─► Create execution log
   ├─► Generate notifications for all roles
   └─► Return results to frontend
   │
5. Frontend displays results
   │
   └─► Admin reviews and approves records
```

### Authentication Flow

```
1. User enters credentials in Login page
   │
2. Firebase Authentication (client-side)
   │
   ├─► Firebase returns ID token
   │
3. Client stores token in localStorage (web) or AsyncStorage (mobile)
   │
4. Client includes token in Authorization header for API requests
   │
   ├─► Authorization: Bearer <firebase-id-token>
   │
5. Backend middleware verifies token
   │
   ├─► authenticateToken middleware
   │   ├─► Verify token with Firebase Admin SDK
   │   ├─► Extract user information
   │   └─► Attach user to request object
   │
6. Backend fetches user profile from database
   │
   ├─► Get user role, crew_id, etc.
   │
7. Role-based access control
   │
   └─► roleCheck middleware enforces permissions
```

### Notification Flow

```
1. Payroll processing completes
   │
2. notificationService.createPayrollNotifications()
   │
   ├─► Create notifications for each role:
   │   ├─► Admin: "Review needed for X records"
   │   ├─► Manager: "Payroll summary for date"
   │   ├─► Foreman: "Team performance results"
   │   └─► Crew: "Your performance score: X"
   │
3. Notifications stored in database
   │
4. Frontend polls for notifications
   │
   ├─► GET /api/notifications (every 30 seconds)
   │
5. Frontend displays notifications
   │
   ├─► Web: NotificationBell with badge
   └─► Mobile: NotificationBanner
```

## Database Schema

### Tables

1. **users**: User accounts with roles
2. **jobs**: Job data from Service Autopilot
3. **timesheets**: Timesheet data from Paychex
4. **payroll_records**: Calculated payroll records
5. **notifications**: In-app notifications
6. **execution_logs**: Payroll processing audit trail

See `docs/DATABASE.md` for detailed schema documentation.

## Security Architecture

### Authentication
- **Firebase Authentication**: Email/password authentication
- **JWT Tokens**: Firebase ID tokens for API authentication
- **Token Verification**: Firebase Admin SDK on backend

### Authorization
- **Role-Based Access Control (RBAC)**: Four roles (admin, manager, foreman, crew_member)
- **Middleware Protection**: All routes protected by authentication and role checks
- **Data Filtering**: Automatic filtering based on user role

### Data Security
- **Environment Variables**: Sensitive data stored in environment variables
- **Input Validation**: Request validation middleware
- **Error Handling**: Secure error messages (no sensitive data exposed)

## Deployment Architecture

### Backend
- **Platform**: Firebase Cloud Functions
- **Runtime**: Node.js 20
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Authentication

### Web Frontend
- **Platform**: Firebase Hosting (planned)
- **Build**: React production build
- **Static Assets**: Served from Firebase CDN

### Mobile App
- **Platform**: Expo (development only)
- **Testing**: Expo Go app
- **Production**: Not deployed (development/testing only)

## External Integrations

### Service Autopilot
- **Purpose**: Job data (job assignments, budgeted hours, locations)
- **Integration**: REST API or CSV upload
- **Mock Mode**: Available for development

### Paychex
- **Purpose**: Timesheet data (clock-in/out, hours worked)
- **Integration**: REST API or CSV upload
- **Export**: CSV export for payroll import
- **Mock Mode**: Available for development

## Error Handling

### Backend
- **Global Error Handler**: Catches all errors, formats responses
- **Error Logging**: Logs errors with context (path, method, timestamp)
- **Error Types**: Network, authentication, authorization, validation, server errors

### Frontend
- **ErrorBoundary**: Catches React errors, displays fallback UI
- **API Error Handling**: Interceptors handle network and HTTP errors
- **User Feedback**: User-friendly error messages

## Performance Considerations

### Backend
- **Database Indexing**: Indexes on frequently queried fields
- **Query Optimization**: Efficient database queries with proper filtering
- **Caching**: Not currently implemented (future enhancement)

### Frontend
- **Code Splitting**: React lazy loading for routes
- **Asset Optimization**: Minified production builds
- **API Polling**: 30-second intervals for notifications

## Scalability

### Current Capacity
- **Users**: Designed for ~50 employees
- **Processing**: <15 minutes for full payroll processing
- **Concurrent Users**: Supports multiple concurrent users

### Future Enhancements
- **Caching Layer**: Redis for frequently accessed data
- **Queue System**: For handling large batch operations
- **CDN**: For static asset delivery
- **Database Replication**: For high availability

## Monitoring and Logging

### Logging
- **Backend**: Console logging with structured format
- **Execution Logs**: Audit trail in database
- **Error Logging**: Error details logged for debugging

### Monitoring
- **Firebase Functions**: Built-in monitoring and logging
- **Database**: Supabase dashboard for query monitoring
- **Custom Metrics**: Execution statistics endpoint

## Development Workflow

### Local Development
1. Backend: `npm run dev` (nodemon auto-reload)
2. Web: `npm start` (React dev server)
3. Mobile: `npm start` (Expo DevTools)

### Testing
- **Unit Tests**: Jest for backend services
- **Test Coverage**: 65 tests covering critical business logic
- **Mock APIs**: Available for offline development

### Deployment
- **Backend**: `npm run deploy` (Firebase Functions)
- **Web**: `npm run build` then deploy to Firebase Hosting
- **Mobile**: Development only (no production deployment)

## Technology Stack Summary

### Backend
- Node.js 20
- Express.js
- Firebase Admin SDK
- Supabase (PostgreSQL)
- Jest (testing)

### Web Frontend
- React
- Tailwind CSS
- React Router
- Axios
- Firebase Client SDK

### Mobile
- React Native
- Expo SDK 54
- React Navigation
- react-i18next
- Axios

### Infrastructure
- Firebase (Authentication, Cloud Functions, Hosting)
- Supabase (Database)
- GitHub (Version Control)

---

For more detailed information, see:
- **API Documentation**: `docs/API.md`
- **Database Schema**: `docs/DATABASE.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Product Requirements**: `PRD_Clean_Scapes_Rebuild_PayforPerformance_P4P_as_an_Automated_Web_.md`

