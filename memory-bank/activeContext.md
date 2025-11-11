# Active Context: Clean Scapes P4P System

## Current Work Focus
**Phase**: Frontend Dashboard Enhancement & UI Completion  
**Status**: PR10-PR12 completed - Admin, Manager, and Foreman dashboards implemented and enhanced  
**Date**: After foreman dashboard enhancements and UI consistency fixes

## Recent Changes
- ✅ **Foreman Dashboard Enhancement**: Added comprehensive team performance and payroll compliance overview
  - Date range selector with quick buttons (Yesterday, Last 7 Days)
  - Compliance metrics section (Total, Approved, Pending, Rejected, Anomalies)
  - Compliance rate calculation with status indicators (Excellent/Good/Fair/Needs Attention)
  - Real-time alerts generated from compliance data (pending approvals, anomalies, low compliance rates)
  - Top performer based on total payout (not efficiency)
  - Member cards show: Total Payout, Records Count, Approved Count, Anomaly Count, Hours
  - Quick actions buttons navigate to correct pages
  - Fixed crew_id matching in backend (handles CREW1/foreman1, CREW2/foreman2 mismatches)
  - Fixed "View Details" button to open MemberDetailModal with real data
- ✅ **Foreman TeamMembers Page**: Replaced mock data with API calls
  - Fetches crew members from userAPI
  - Fetches payroll records for selected date
  - Shows real stats: Total Members, Avg Payout, Total Payout, Needs Attention
  - Member cards display real data: payout, hours, records, approved, anomalies
- ✅ **Foreman History Page**: Removed charts, fetches real data
  - Removed Line charts for efficiency and payout trends
  - Fetches real data from database with date range validation
  - Groups records by date
  - Shows summary stats: Avg Daily Payout, Total Payout, Total Records, Best Day
- ✅ **Foreman Schedule Page**: Added date validation (max = today)
- ✅ **MemberDetailModal Fix**: Removed Chart.js dependency
  - Removed 7-day performance chart (was causing "linear scale not registered" error)
  - Updated to use real data: Total Payout, Records, Approved, Anomalies, Hours
  - Dynamic strengths/weaknesses based on actual performance data
  - Added contact information display
- ✅ **Backend API Enhancement**: Updated user management endpoints
  - `/api/users` now accessible to foremen (with automatic crew filtering)
  - Foremen can only see their own crew members
  - Changed from `requireAdminOrManager` to `requireAdminManagerOrForeman`
- ✅ **Backend Payroll Service**: Enhanced crew_id matching
  - Fixed foreman filtering to use `user.crew_id` instead of `user.uid`
  - Added flexible crew_id matching (CREW1 ↔ foreman1, CREW2 ↔ foreman2)
  - Uses `.ilike()` with number extraction for pattern matching
- ✅ **Manager Dashboard Enhancement**: Added comprehensive team performance and payroll compliance overview
  - Date range selector with quick buttons (Yesterday, Last 7 Days)
  - Compliance metrics section (Pending Approval, Approved, Anomalies Detected, Rejected)
  - Compliance rate calculation with status indicators (Excellent/Good/Fair/Needs Attention)
  - Real-time alerts generated from compliance data (pending approvals, anomalies, low compliance rates)
  - Anomaly breakdown by type (shows count per anomaly flag)
  - Crew performance comparison table (Records, Payout, Approved, Anomalies, Compliance per crew)
  - Fixed API response structure for user stats (accessing `response.data.data`)
  - Fixed total employees count (using `crew_members` from stats)
- ✅ **Manager Teams Page Enhancement**: Enhanced crew data calculation and display
  - Date range selector with validation
  - Improved crew_id matching logic (handles CREW1/foreman1, CREW2/foreman2 mismatches)
  - Total payout aggregation across date ranges
  - Top performers aggregation (sums pay across multiple days)
  - Additional metrics in crew modal (Approved count, Anomaly count, Compliance rate, Avg Payout/Record)
  - Better empty state handling with helpful messages
- ✅ **Manager Analytics Page**: Removed all charts, added date range validation, dynamic data from database
- ✅ **Backend API Access**: Updated user management endpoints to allow manager access
  - `/api/users/stats` now accessible to managers (changed from admin-only)
  - `/api/users` now accessible to managers (changed from admin-only)
- ✅ **UI Simplification**: Removed status columns from all payroll tables (PayrollTable, AnalyzePayrollWidget, Approve, History pages)
- ✅ **Approve & Export Page**: Removed Summary Stats section and payroll records table, keeping only Analyze/Process widgets and Export functionality
- ✅ **Reports Section**: Removed hard-coded data, now generates reports dynamically from database based on selected date range
- ✅ **Reports Section**: Removed all charts (Efficiency Trend, Daily Payout, Crew Comparison), keeping only summary cards and export options
- ✅ **Review Payroll Page**: Added crew column to PayrollTable with sorting capability
- ✅ **Review Payroll Page**: Fixed crew filter dropdown to dynamically load crews from database (foremen and payroll records)
- ✅ **Backend Enhancement**: Added date range filtering support (start_date, end_date) to payroll records API
- ✅ **PR #1 Completed**: Project setup (backend, web, mobile initialized)
- ✅ **PR #2 Completed**: Database schema created (6 tables, migrations, seed data)
- ✅ **PR #3 Completed**: Firebase Authentication (middleware, routes, contexts, RBAC)
- ✅ **PR #4 Completed**: Mock External APIs (Service Autopilot, Paychex, data service abstraction)
- ✅ **PR #5 Completed**: P4P Calculation Engine (efficiency, bonuses, penalties, anomaly detection)
- ✅ **PR #6 Completed**: Payroll Processing Routes (analyze, process, approve, export)
- ✅ **PR #7 Completed**: Execution Logging & Optional Cron Service (audit trail, performance metrics, testing cron)
- ✅ **PR #8 Completed**: Notifications System (role-based notifications, web/mobile components)
- ✅ **PR #9 Completed**: User Management (CRUD operations, admin interface, search/filtering)
- ✅ **PR #10 Completed**: Admin Dashboard (dashboard page, analyze/process widgets, quick actions, stats)
- ✅ **PR #11 Completed**: Manager Dashboard (dashboard, teams page, analytics page)
- ✅ **PR #12 Completed**: Foreman Dashboard (dashboard, team members, schedule, history pages)
- ✅ **Unit Tests Implemented**: 65 tests passing (calculation, user, data, notification, CSV export)
- ✅ **Frontend Authentication**: Fixed admin login logout issue (axios interceptor token storage)
- ✅ **Crew Member Access**: Restricted web access for crew members (show invalid credentials)
- ✅ Database users seeded (8 test users)
- ✅ Firebase user creation automation script created
- ✅ Authentication system fully functional
- ✅ Mock API routes implemented (10 endpoints)
- ✅ Data service abstraction layer created
- ✅ Mock data generator utility created
- ✅ Sample CSV files created for future CSV upload feature
- ✅ Calculation service with unit tests (26 tests passing)
- ✅ Comprehensive unit test suite (65 tests total, all passing)
- ✅ Test coverage for critical business logic (calculation engine, CSV export)
- ✅ Console output suppression for cleaner test runs
- ✅ Payroll service with duplicate prevention and reprocess
- ✅ 8 payroll API endpoints with role-based access control
- ✅ CSV export functionality (3 formats)
- ✅ Execution logging service with full audit trail
- ✅ Optional cron service for testing (development only)
- ✅ Notification service with role-based delivery
- ✅ 6 notification API endpoints
- ✅ Web notification components (bell + dropdown)
- ✅ Mobile notification banner component
- ✅ User service with 10 functions (CRUD, search, stats)
- ✅ User management routes (6 endpoints)
- ✅ Admin Users page with statistics dashboard
- ✅ Add/Edit user modals

## Current Tasks
1. ✅ Read and understand project requirements
2. ✅ Create Memory Bank structure
3. ✅ Set up .cursor/rules/ files
4. ✅ PR #1: Project Setup & Initial Configuration
5. ✅ PR #2: Database Schema & Configuration
6. ✅ PR #3: Firebase Authentication Setup
7. ✅ PR #4: Mock External APIs
8. ✅ PR #5: P4P Calculation Engine
9. ✅ PR #6: Payroll Processing Routes
10. ✅ PR #7: Payroll Processing Execution & Logging
11. ✅ PR #8: Notifications System
12. ✅ PR #9: User Management Routes
13. ✅ PR #10: Admin Dashboard
14. ✅ PR #11: Manager Dashboard
15. ✅ PR #12: Foreman Dashboard
16. ✅ Unit Tests: Backend unit tests (65 tests, all passing)
17. ✅ Frontend Authentication: Fixed token storage and axios interceptor
18. ⏳ **NEXT**: PR #13: Crew Member Mobile Screens

## Next Steps

### Immediate (PR #13 - NEXT)
1. ⏳ Build crew member mobile screens (dashboard, breakdown, history, profile, help)
2. ⏳ Implement bilingual support (EN/ES) for mobile app
3. ⏳ Add navigation setup for mobile app

### Recent Completions
- ✅ Manager dashboard with team performance and payroll compliance overview
- ✅ Manager Teams page with enhanced crew data calculation
- ✅ Manager Analytics page simplified (charts removed, dynamic data)
- ✅ Backend API access expanded for managers (user stats and user list)

### Short-term (PRs #13-15)
1. ⏳ **NEXT**: Build crew member mobile screens
2. ⏳ Add CSV upload functionality (PR #14)
3. ⏳ Implement charts and analytics enhancements
4. ⏳ Add error handling and validation improvements

### Medium-term (PRs #9-15)
1. ⏳ Create user management
2. ⏳ Build web dashboards (Admin, Manager, Foreman)
3. ⏳ Implement payroll processing widgets (Analyze & Process)
4. ⏳ Add CSV upload functionality

### Long-term (PRs #13-25)
1. Build mobile app (bilingual)
2. Add charts and analytics
3. Implement CSV upload/processing
4. Error handling and validation
5. Testing and documentation
6. Deployment setup
7. Final polish

## Active Decisions & Considerations

### Architecture Decisions
- ✅ Using Supabase for database (PostgreSQL)
- ✅ Using Firebase for authentication
- ✅ Using Express.js for backend API
- ✅ Using React for web frontend
- ✅ Using React Native + Expo for mobile
- ✅ Mock APIs for development (switch to real APIs later)
- ✅ Data service abstraction layer for seamless API switching
- ✅ Environment-driven configuration (USE_MOCK flag)

### Development Approach
- ✅ Breaking work into 25 focused PRs
- ✅ Starting with backend infrastructure
- ✅ Building web dashboards before mobile app
- ✅ Using mock data for development

### Pending Decisions
- Real API integration timeline (after MVP)
- Analytics and reporting depth

### Decided
- **Backend Deployment**: Firebase Cloud Functions
- **Frontend Deployment**: Firebase Hosting
- **Payroll Processing**: Manual trigger by admins (no automatic scheduling)
  - Two-button approach: "Analyze Payroll" (preview) and "Process Payroll" (commit)
  - Duplicate prevention with reprocess option
- **Mobile**: Development only - tested on Expo Go (no production build)
- **Deployment Timeline**: After full development and local testing complete
- **Database**: Supabase PostgreSQL with 6 tables (users, jobs, timesheets, payroll_records, notifications, execution_logs)
- **Authentication**: Firebase Auth with JWT tokens, role-based access control
- **Test Users**: 8 users seeded (admin, manager, 2 foremen, 4 crew) with default password `password123`

## Current Blockers
None at this time.

## Active Questions
1. ✅ **RESOLVED**: Backend hosting - Firebase Cloud Functions
2. When to switch from mock to real APIs? (After MVP)
3. What level of analytics is needed for MVP?
4. Should we implement offline support in mobile app (v2)?

## Key Files to Reference
- `PRD_Clean_Scapes_Rebuild_PayforPerformance_P4P_as_an_Automated_Web_.md` - Product requirements
- `p4p_task_list.md` - Complete development task breakdown
- `p4p_architecture_diagram.mermaid` - System architecture diagram
- `memory-bank/projectbrief.md` - Project foundation
- `memory-bank/systemPatterns.md` - Architecture patterns

## Development Notes
- All development should follow the 25 PR structure
- Each PR should be focused and testable
- Mock APIs should be used until real integrations are ready
- Bilingual support (EN/ES) is critical for mobile app
- Payroll processing is manual (admin-triggered), not automatic
- Two-button payroll approach: Analyze (preview) and Process (commit)
- Duplicate payroll prevention with UNIQUE constraint on (employee_id, date)
- Notifications only sent after "Process Payroll", not "Analyze Payroll"
- Firebase users can be auto-created with `CREATE_FIREBASE_USERS=true` in backend/.env
- Test credentials: All users have password `password123` (see docs/TEST_CREDENTIALS.md)
- Mock APIs available at `/mock/service-autopilot/*` and `/mock/paychex/*` when USE_MOCK=true
- Data service (`dataService.js`) provides unified interface for fetching external data
- Sample CSV files in `mock-data/` directory for testing CSV upload feature (PR #21)
- **Calculation engine**: Efficiency, bonuses (100% & 50% multipliers), penalties (5% late, 2% long lunch)
- **Anomaly detection**: Flags efficiency < 60% or > 120%, missing data, negative pay
- **Payroll endpoints**: POST /analyze (preview), POST /process (commit), GET /records, GET /export
- **Unit tests**: 26 tests for calculation service, all passing
- **CSV export**: 3 formats available (standard, detailed, summary)
- **Execution logging**: Complete audit trail with performance metrics, error tracking, reprocess references
- **Optional cron service**: Testing-only automated payroll processing (ENABLE_CRON=true, development only)
- **Notifications**: Role-based system (admin, manager, foreman, crew) with 6 API endpoints
- **Web notifications**: Bell icon with badge + dropdown component (auto-refresh every 30s)
- **Mobile notifications**: Animated banner component with auto-show/hide
- **Notification delivery**: Only after "Process Payroll" (not "Analyze Payroll")
- **User management**: Complete CRUD operations with 6 API endpoints
- **User service**: 10 functions (CRUD, search by role/crew, statistics)
- **Admin Users page**: Statistics dashboard, search/filter, CRUD operations
- **User modals**: Add and Edit user forms with validation
- **Unit tests**: 65 tests passing (calculation: 26, CSV: 23, user: 13, data: 2, notification: 1)
- **Test quality**: Core business logic fully tested, console output suppressed
- **Frontend dashboards**: Admin, Manager, and Foreman dashboards fully implemented with all pages
- **Frontend routing**: Nested routes with role-based layouts (AdminLayout, ManagerLayout, ForemanLayout)
- **Authentication flow**: Firebase client SDK with AuthContext, token storage in localStorage for axios interceptor
- **Crew member restriction**: Crew members cannot access web app (show invalid credentials message)
- **Token management**: Firebase ID token stored as `authToken` in localStorage for axios interceptor compatibility
- **Axios interceptor**: Request interceptor adds `authToken` from localStorage, response interceptor handles 401 redirects
- **Login flow**: Polling mechanism waits for user profile to load before role-based redirection
- **Backend notification fix**: Changed `req.user.uid` to `req.user.id` in notification routes for correct database queries
- **Payroll calculation simplified**: Removed efficiency and performance bonuses, formula is now: Total Pay = Base Pay - Penalties
- **Base Rate column**: Added to payroll tables (PayrollTable, Review, Approve pages) showing hourly rate
- **Database schema**: Comprehensive schema file (`000_comprehensive_schema.sql`) with all tables and constraints
- **Reset-seed script**: `resetAndSeed.js` script to delete all data and regenerate users + payroll data in one go
- **Crew members expanded**: 10 crew members total, divided into 2 groups (4 and 6 members)
- **Total penalties mapping**: Fixed to ensure `total_penalties` is properly mapped from database `penalties` field
- **UI Simplification**: Status columns removed from all payroll tables and widgets for cleaner interface
- **Approve & Export Page**: Streamlined to focus on payroll analysis, processing, and export (removed summary stats and records table)
- **Reports Section**: Dynamic report generation from database with date range filtering, charts removed for simplicity
- **Review Payroll Page**: Crew column added with sorting, dynamic crew filter dropdown populated from database
- **Backend API Enhancement**: Payroll records endpoint now supports date range filtering (start_date, end_date query parameters)
- **Manager Dashboard**: Comprehensive compliance and performance overview with date range analysis, real-time alerts, anomaly breakdown, and crew comparison
- **Manager Teams Page**: Enhanced crew data calculation with date range support, improved crew_id matching (CREW1/foreman1), aggregated metrics, and better empty states
- **Manager Analytics Page**: Simplified UI (charts removed), dynamic data generation, date range validation
- **Backend API Access**: User management endpoints (`/api/users`, `/api/users/stats`) now accessible to managers and foremen (not just admins)
- **Data Generation Script**: Consolidated setup script (`setupDatabase.js`) for comprehensive database initialization (delete, seed users, process payroll, mark previous as approved)
- **Foreman Dashboard**: Comprehensive compliance and performance overview with date range analysis, real-time alerts, anomaly breakdown, member cards with real data
- **Foreman Teams Page**: Real data from API, date range support, member cards with performance metrics
- **Foreman History Page**: Simplified UI (charts removed), dynamic data generation, date range validation
- **Foreman Schedule Page**: Date validation added
- **MemberDetailModal**: Chart.js removed, uses real performance data, dynamic strengths/weaknesses
- **Backend Crew Matching**: Enhanced crew_id matching logic to handle CREW1/foreman1, CREW2/foreman2 mismatches using number extraction

## Communication Notes
- Project is for Clean Scapes ($7M landscaping company)
- Target users: Crew members, foremen, admins, managers
- Success metrics: <15 min processing, >99.5% accuracy, daily feedback
- Timeline: 25 PRs to completion

