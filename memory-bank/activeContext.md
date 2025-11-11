# Active Context: Clean Scapes P4P System

## Current Work Focus
**Phase**: Core Business Logic Development  
**Status**: Calculation engine and payroll processing complete, ready for execution logging  
**Date**: After PR #5 & PR #6 completion

## Recent Changes
- ✅ **PR #1 Completed**: Project setup (backend, web, mobile initialized)
- ✅ **PR #2 Completed**: Database schema created (6 tables, migrations, seed data)
- ✅ **PR #3 Completed**: Firebase Authentication (middleware, routes, contexts, RBAC)
- ✅ **PR #4 Completed**: Mock External APIs (Service Autopilot, Paychex, data service abstraction)
- ✅ **PR #5 Completed**: P4P Calculation Engine (efficiency, bonuses, penalties, anomaly detection)
- ✅ **PR #6 Completed**: Payroll Processing Routes (analyze, process, approve, export)
- ✅ Database users seeded (8 test users)
- ✅ Firebase user creation automation script created
- ✅ Authentication system fully functional
- ✅ Mock API routes implemented (10 endpoints)
- ✅ Data service abstraction layer created
- ✅ Mock data generator utility created
- ✅ Sample CSV files created for future CSV upload feature
- ✅ Calculation service with unit tests (26 tests passing)
- ✅ Payroll service with duplicate prevention and reprocess
- ✅ 8 payroll API endpoints with role-based access control
- ✅ CSV export functionality (3 formats)

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
10. ⏳ **NEXT**: PR #7: Payroll Processing Execution & Logging

## Next Steps

### Immediate (PR #7 - NEXT)
1. Implement execution logging service
2. Track payroll processing history
3. Log execution results and errors
4. Create execution log queries
5. Optional: Add testing cron job (development only)

### Short-term (PRs #7-10)
1. ⏳ **NEXT**: Implement payroll execution logging
2. ⏳ Build notifications system
3. ⏳ Create user management routes
4. ⏳ Build admin dashboard (analyze & process widgets)

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

## Communication Notes
- Project is for Clean Scapes ($7M landscaping company)
- Target users: Crew members, foremen, admins, managers
- Success metrics: <15 min processing, >99.5% accuracy, daily feedback
- Timeline: 25 PRs to completion

