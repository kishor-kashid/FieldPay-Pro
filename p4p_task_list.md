# Clean Scapes P4P System - Development Task List

## Project Overview
This document outlines all development tasks broken down by Pull Requests (PRs) for the Pay-for-Performance (P4P) automated web platform and bilingual crew mobile app.

---

## PR #1: Project Setup & Initial Configuration

### Objective
Set up the foundational project structure, dependencies, and development environment.

### Tasks

#### Backend Setup
- [ ] Initialize Node.js project
  - **Files**: `backend/package.json`
  - Create project directory structure
  - Initialize npm with `npm init`
  
- [ ] Install backend dependencies
  - **Files**: `backend/package.json`
  - express, cors, dotenv, node-cron
  - firebase-admin, @supabase/supabase-js
  - csv-parser, bcrypt, jsonwebtoken
  
- [ ] Create environment configuration
  - **Files**: `backend/.env`, `backend/.env.example`
  - Set up environment variables (PORT, NODE_ENV, USE_MOCK, etc.)
  
- [ ] Set up project folder structure
  - **Files**: Create all backend directories
  - `config/`, `routes/`, `services/`, `middleware/`, `utils/`, `routes/mock/`

#### Web Frontend Setup
- [ ] Initialize React project
  - **Files**: `frontend-web/package.json`
  - Create React app with create-react-app or Vite
  
- [ ] Install web dependencies
  - **Files**: `frontend-web/package.json`
  - react-router-dom, axios, chart.js, react-chartjs-2, tailwindcss
  
- [ ] Configure Tailwind CSS
  - **Files**: `frontend-web/tailwind.config.js`, `frontend-web/src/index.css`
  
- [ ] Create web folder structure
  - **Files**: Create all web directories
  - `pages/`, `components/`, `services/`, `context/`, `utils/`

#### Mobile App Setup
- [ ] Initialize React Native project with Expo
  - **Files**: `mobile/package.json`, `mobile/app.json`
  
- [ ] Install mobile dependencies
  - **Files**: `mobile/package.json`
  - @react-navigation/native, @react-navigation/bottom-tabs, @react-navigation/stack
  - react-i18next, @react-native-async-storage/async-storage, axios
  
- [ ] Create mobile folder structure
  - **Files**: Create all mobile directories
  - `screens/`, `components/`, `navigation/`, `i18n/`, `services/`, `utils/`

#### Documentation
- [ ] Create README.md
  - **Files**: `README.md`
  - Project description, tech stack, setup instructions
  
- [ ] Create .gitignore files
  - **Files**: `backend/.gitignore`, `frontend-web/.gitignore`, `mobile/.gitignore`
  
- [ ] Initialize Git repository
  - **Files**: `.git/`
  - First commit with project structure

---

## PR #2: Database Schema & Configuration

### Objective
Set up Supabase database with all required tables and relationships.

### Tasks

#### Supabase Setup
- [ ] Create Supabase project
  - Access Supabase dashboard and create new project
  
- [ ] Configure database connection
  - **Files**: `backend/config/database.js`
  - Create Supabase client configuration
  - Set up connection pooling

#### Database Tables
- [ ] Create users table
  - **Files**: `backend/config/database.js` or SQL migration file
  - Fields: id, email, role, name, employee_id, crew_id, preferred_language, base_rate, created_at, updated_at
  - Set up constraints and indexes
  
- [ ] Create payroll_records table
  - **Files**: SQL migration file or database config
  - Fields: id, employee_id, date, hours_worked, base_pay, efficiency_score, performance_bonus, penalties, total_pay, status, admin_notes, created_at
  - Add unique constraint: UNIQUE(employee_id, date) to prevent duplicates
  
- [ ] Create jobs table
  - **Files**: SQL migration file
  - Fields: id, external_id, date, crew_id, service_type, client, budgeted_hours, actual_hours, status
  
- [ ] Create timesheets table
  - **Files**: SQL migration file
  - Fields: id, employee_id, date, clock_in, clock_out, lunch_start, lunch_end, total_hours
  
- [ ] Create notifications table
  - **Files**: SQL migration file
  - Fields: id, user_id, type, title, message, link, read, created_at

#### Database Documentation
- [ ] Document database schema
  - **Files**: `docs/DATABASE.md`
  - Table structures, relationships, indexes
  
- [ ] Create seed data script
  - **Files**: `backend/utils/seedData.js`
  - Mock users, sample payroll records

---

## PR #3: Firebase Authentication Setup

### Objective
Implement Firebase Authentication for user login and role-based access control.

### Tasks

#### Firebase Configuration
- [ ] Set up Firebase project
  - Create Firebase project in console
  - Enable Authentication
  
- [ ] Configure Firebase in backend
  - **Files**: `backend/config/firebase.js`
  - Initialize Firebase Admin SDK
  - Set up service account credentials
  
- [ ] Configure Firebase in web frontend
  - **Files**: `frontend-web/src/config/firebase.js`
  - Initialize Firebase client SDK
  
- [ ] Configure Firebase in mobile app
  - **Files**: `mobile/src/config/firebase.js`
  - Initialize Firebase for React Native

#### Authentication Middleware
- [ ] Create auth middleware
  - **Files**: `backend/middleware/auth.js`
  - Verify JWT tokens
  - Extract user information from token
  
- [ ] Create role-based access middleware
  - **Files**: `backend/middleware/roleCheck.js`
  - Check user roles (admin, manager, foreman, crew_member)
  - Protect routes based on permissions

#### Authentication Routes
- [ ] Create auth routes
  - **Files**: `backend/routes/auth.js`
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/auth/profile
  - PATCH /api/auth/language

#### Authentication Context
- [ ] Create auth context for web
  - **Files**: `frontend-web/src/context/AuthContext.js`
  - Manage authentication state
  - Login/logout functions
  
- [ ] Create auth context for mobile
  - **Files**: `mobile/src/context/AuthContext.js`
  - Manage authentication state with AsyncStorage

---

## PR #4: Mock External APIs

### Objective
Create mock Service Autopilot and Paychex APIs for development and testing.

### Tasks

#### Mock Service Autopilot API
- [ ] Create mock SA routes
  - **Files**: `backend/routes/mock/serviceAutopilot.js`
  - GET /mock/service-autopilot/jobs
  - Return realistic job data structure
  
- [ ] Generate mock job data
  - **Files**: `backend/utils/mockDataGenerator.js`
  - Create function to generate sample jobs
  - Include crew assignments, budgeted vs actual hours

#### Mock Paychex API
- [ ] Create mock Paychex routes
  - **Files**: `backend/routes/mock/paychex.js`
  - GET /mock/paychex/timesheets
  - Return realistic timesheet data
  
- [ ] Generate mock timesheet data
  - **Files**: `backend/utils/mockDataGenerator.js`
  - Create function to generate sample timesheets
  - Include clock in/out, lunch breaks, rates

#### Data Service Layer
- [ ] Create data service abstraction
  - **Files**: `backend/services/dataService.js`
  - getJobData(date) - fetch from mock or real API
  - getTimesheetData(date) - fetch from mock or real API
  - Switch between mock and real based on config
  
- [ ] Create API configuration
  - **Files**: `backend/config/api.js`
  - Mock vs real API URLs
  - API keys configuration

#### Mock Data Files
- [ ] Create sample CSV files
  - **Files**: `mock-data/service_autopilot_jobs.csv`
  - Sample job data in CSV format
  
- [ ] Create sample timesheet CSV
  - **Files**: `mock-data/paychex_timesheets.csv`
  - Sample timesheet data in CSV format
  
- [ ] Create mock users data
  - **Files**: `mock-data/mock_users.json`
  - Sample users for all roles (admin, manager, foreman, crew members)

---

## PR #5: P4P Calculation Engine

### Objective
Implement the core business logic for performance-based payroll calculations.

### Tasks

#### Calculation Service
- [ ] Create calculation service
  - **Files**: `backend/services/calculationService.js`
  - Core P4P calculation logic
  
- [ ] Implement efficiency calculation
  - **Files**: `backend/services/calculationService.js`
  - Calculate: budgeted_hours / actual_hours
  - Handle multiple jobs per employee
  
- [ ] Implement penalty calculations
  - **Files**: `backend/services/calculationService.js`
  - Late penalty (clock_in > 7:00 AM)
  - Long lunch penalty (lunch > 30 minutes)
  
- [ ] Implement bonus calculations
  - **Files**: `backend/services/calculationService.js`
  - Performance bonus based on efficiency
  - Apply multipliers to base pay
  
- [ ] Calculate final payroll
  - **Files**: `backend/services/calculationService.js`
  - Total = base_pay + bonuses - penalties

#### Anomaly Detection
- [ ] Create anomaly detection logic
  - **Files**: `backend/services/calculationService.js`
  - Flag efficiency < 60%
  - Flag efficiency > 120%
  - Flag missing data
  - Flag negative pay amounts

#### Calculation Rules Configuration
- [ ] Create rules configuration
  - **Files**: `backend/config/calculationRules.js`
  - Define late penalty percentage
  - Define long lunch penalty
  - Define bonus thresholds
  - Define service type budgeted hours

#### Unit Tests
- [ ] Write calculation tests
  - **Files**: `backend/tests/calculationService.test.js`
  - Test efficiency calculations
  - Test penalty logic
  - Test bonus logic
  - Test edge cases

---

## PR #6: Payroll Processing Routes

### Objective
Create API endpoints for payroll analysis (preview) and processing (commit) with duplicate prevention and reprocess functionality.

### Tasks

#### Payroll Routes
- [ ] Create payroll routes file
  - **Files**: `backend/routes/payroll.js`
  
- [ ] Implement analyze payroll endpoint (Preview)
  - **Files**: `backend/routes/payroll.js`
  - POST /api/payroll/analyze
  - Admin-only endpoint (role check middleware)
  - Calculate payroll without saving to database
  - Accept date parameter (defaults to yesterday)
  - Return preview results (calculations, anomalies, summary)
  - No database writes, no notifications
  
- [ ] Implement process payroll endpoint (Commit)
  - **Files**: `backend/routes/payroll.js`
  - POST /api/payroll/process
  - Admin-only endpoint (role check middleware)
  - Save calculated payroll to database
  - Accept date parameter (defaults to yesterday)
  - Check for existing records (duplicate prevention)
  - Return processing results (records processed, errors, execution time)
  - Log execution to database
  - Trigger notifications after successful save
  
- [ ] Implement duplicate prevention logic
  - **Files**: `backend/services/payrollService.js`
  - Check if payroll records exist for given date
  - Return existing record count if duplicates found
  - Support reprocess flag (delete existing, process again)
  - Log reprocess actions separately
  
- [ ] Implement reprocess functionality
  - **Files**: `backend/services/payrollService.js`
  - Delete existing payroll records for date
  - Process payroll again
  - Mark execution log as "reprocessed"
  - Include original execution reference
  
- [ ] Implement get payroll records endpoint
  - **Files**: `backend/routes/payroll.js`
  - GET /api/payroll/records
  - Filter by date, employee, crew, status
  
- [ ] Implement get single payroll record
  - **Files**: `backend/routes/payroll.js`
  - GET /api/payroll/records/:id
  - Return detailed breakdown
  
- [ ] Implement approve payroll endpoint
  - **Files**: `backend/routes/payroll.js`
  - PATCH /api/payroll/records/:id/approve
  - Admin only - approve calculated payroll
  - Add admin notes
  
- [ ] Implement bulk approve endpoint
  - **Files**: `backend/routes/payroll.js`
  - POST /api/payroll/approve-all
  - Approve multiple records at once

#### Processing Service
- [ ] Create payroll processing service
  - **Files**: `backend/services/payrollService.js`
  - analyzePayroll(date) - Calculate without saving (preview)
  - processPayroll(date, options) - Save to database (commit)
  - Orchestrate full payroll processing flow
  - Call data services, calculation service
  - Store results in database (only in processPayroll)
  - Trigger notifications (only after successful processPayroll, not analyzePayroll)

#### CSV Export
- [ ] Implement CSV export functionality
  - **Files**: `backend/utils/csvExporter.js`
  - Generate Paychex-compatible CSV
  - Include all payroll fields
  
- [ ] Create export endpoint
  - **Files**: `backend/routes/payroll.js`
  - GET /api/payroll/export
  - Return CSV file for download

---

## PR #7: Payroll Processing Execution & Logging

### Objective
Implement payroll processing execution tracking, logging, and optional testing cron. Payroll processing is triggered manually by admins via the web dashboard (not automatically scheduled).

### Tasks

#### Execution Logging Service
- [ ] Create execution logging service
  - **Files**: `backend/services/executionLogService.js`
  - Log payroll processing executions
  - Store: start time, end time, records processed, status, errors
  - Query execution history
  
- [ ] Create execution logs table
  - **Files**: Database migration or Supabase setup
  - Fields: id, execution_date, start_time, end_time, records_processed, status, error_message, triggered_by, is_reprocess, original_execution_id, created_at
  - Track reprocess actions separately

#### Optional Testing Cron (Development Only)
- [ ] Create optional cron service for testing
  - **Files**: `backend/services/cronService.js`
  - Set up node-cron scheduler (optional, for testing only)
  - Only runs if ENABLE_CRON=true and NODE_ENV=development
  - Schedule job for testing (configurable via CRON_SCHEDULE)
  
- [ ] Register optional cron jobs in server
  - **Files**: `backend/server.js`
  - Initialize cron service only if enabled
  - Log when cron is enabled/disabled
  - Note: Production uses manual trigger only
  
- [ ] Create cron job configuration
  - **Files**: `backend/config/cron.js`
  - Define cron schedules (for testing)
  - Enable/disable cron via environment variable
  - Default: ENABLE_CRON=false

#### Error Handling & Logging
- [ ] Implement execution error handling
  - **Files**: `backend/services/payrollService.js`
  - Catch and log errors during processing (both analyze and process)
  - Store errors in execution logs
  - Send admin notifications on failures (only for processPayroll, not analyzePayroll)
  - Handle duplicate constraint violations gracefully
  
- [ ] Create execution history endpoint
  - **Files**: `backend/routes/payroll.js`
  - GET /api/payroll/executions - get execution history
  - Filter by date range, status
  - Admin only

---

## PR #8: Notifications System

### Objective
Implement in-app notification system for all user roles.

### Tasks

#### Notification Service
- [ ] Create notification service
  - **Files**: `backend/services/notificationService.js`
  - createNotification(userId, type, title, message, link)
  - getNotifications(userId)
  - markAsRead(notificationId)
  
- [ ] Implement notification creation logic
  - **Files**: `backend/services/notificationService.js`
  - Create notifications for admins (payroll ready for review, anomalies detected)
  - Create notifications for managers (daily summary)
  - Create notifications for foremen (team results)
  - Create notifications for crew members (personal scores)
  - Create error notifications for admins (processing failures)
  - Note: Notifications only sent after "Process Payroll" (not after "Analyze Payroll")

#### Notification Routes
- [ ] Create notification routes
  - **Files**: `backend/routes/notifications.js`
  - GET /api/notifications - get all notifications for user
  - GET /api/notifications/unread - get unread count
  - PATCH /api/notifications/:id/read - mark as read
  - DELETE /api/notifications/:id - delete notification

#### Notification Integration
- [ ] Integrate notifications with payroll processing
  - **Files**: `backend/services/payrollService.js`
  - Trigger notifications ONLY after "Process Payroll" completes successfully
  - Do NOT send notifications after "Analyze Payroll" (preview only)
  - Create role-specific notifications
  - Send error notifications to admins if processing fails
  - Include reprocess indicator in notifications if applicable

#### Notification Components (Web)
- [ ] Create notification bell component
  - **Files**: `frontend-web/src/components/NotificationBell.jsx`
  - Show unread count badge
  - Dropdown with recent notifications
  
- [ ] Create notification dropdown
  - **Files**: `frontend-web/src/components/NotificationDropdown.jsx`
  - List notifications
  - Mark as read on click
  - Link to relevant pages

#### Notification Components (Mobile)
- [ ] Create notification banner component
  - **Files**: `mobile/src/components/NotificationBanner.js`
  - Show notification on home screen
  - Tap to view details

---

## PR #9: User Management

### Objective
Implement user CRUD operations and management interface.

### Tasks

#### User Routes
- [ ] Create user routes
  - **Files**: `backend/routes/users.js`
  - GET /api/users - list all users (admin only)
  - GET /api/users/:id - get single user
  - POST /api/users - create new user (admin only)
  - PATCH /api/users/:id - update user
  - DELETE /api/users/:id - deactivate user (admin only)

#### User Service
- [ ] Create user service
  - **Files**: `backend/services/userService.js`
  - CRUD operations for users
  - Password hashing
  - Role assignment

#### User Management Page (Admin)
- [ ] Create users list page
  - **Files**: `frontend-web/src/pages/admin/Users.jsx`
  - Display all users in table
  - Filter by role, crew
  - Search by name/email
  
- [ ] Create add user modal
  - **Files**: `frontend-web/src/components/AddUserModal.jsx`
  - Form to create new user
  - Select role, assign crew (if applicable)
  
- [ ] Create edit user modal
  - **Files**: `frontend-web/src/components/EditUserModal.jsx`
  - Update user information
  - Change role, crew assignment
  - Reset password

---

## PR #10: Admin Dashboard - Web

### Objective
Build the complete admin web dashboard with all management features.

### Tasks

#### Login Page
- [ ] Create login page
  - **Files**: `frontend-web/src/pages/Login.jsx`
  - Email and password fields
  - Form validation
  - Call authentication API
  - Redirect based on user role

#### Admin Layout
- [ ] Create admin layout component
  - **Files**: `frontend-web/src/components/AdminLayout.jsx`
  - Sidebar navigation
  - Top navbar with user info and notifications
  - Main content area
  
- [ ] Create sidebar component
  - **Files**: `frontend-web/src/components/Sidebar.jsx`
  - Navigation menu: Dashboard, Upload, Review, Approve, Users, Reports, Settings
  - Active link highlighting

#### Admin Dashboard (Home)
- [ ] Create admin dashboard page
  - **Files**: `frontend-web/src/pages/admin/Dashboard.jsx`
  - Processing status widget
  - Today's summary statistics
  - Quick action buttons
  - Recent activity feed
  - Performance trend chart
  
- [ ] Create analyze payroll widget
  - **Files**: `frontend-web/src/components/AnalyzePayrollWidget.jsx`
  - Date picker (defaults to yesterday)
  - "Analyze Payroll" button
  - Preview results table (calculations without saving)
  - Summary statistics (total employees, total pay, anomalies)
  - Anomaly flags display
  - No database writes, safe to run multiple times
  
- [ ] Create process payroll widget
  - **Files**: `frontend-web/src/components/ProcessPayrollWidget.jsx`
  - Date picker (defaults to yesterday)
  - "Process Payroll" button
  - Processing status indicator (idle, processing, success, error)
  - Duplicate detection: If payroll already processed for date
    - Show warning: "Payroll already processed for this date"
    - Display existing record count
    - Offer "Reprocess" button (with confirmation modal)
  - Reprocess confirmation modal
    - Warn about deleting existing records
    - Require explicit confirmation
    - Process again after confirmation
  - Last execution timestamp display
  - Execution results summary (records processed, errors)
  - Error messages display if processing failed
  - Link to execution history

#### Upload Page
- [ ] Create upload page
  - **Files**: `frontend-web/src/pages/admin/Upload.jsx`
  - CSV upload for Service Autopilot data
  - CSV upload for Paychex data
  - Drag-and-drop interface
  - File validation
  - Preview data before processing
  
- [ ] Create CSV parser utility
  - **Files**: `backend/utils/csvParser.js`
  - Parse uploaded CSV files
  - Validate data format
  - Return structured data

#### Review Page
- [ ] Create review page
  - **Files**: `frontend-web/src/pages/admin/Review.jsx`
  - Table of all processed payroll records
  - Filter by crew, date, status
  - Sort by any column
  - Flag anomalies visually
  - Add notes/comments
  
- [ ] Create payroll table component
  - **Files**: `frontend-web/src/components/PayrollTable.jsx`
  - Display employee data: name, crew, hours, efficiency, pay
  - Row actions: view details, add note

#### Approve Page
- [ ] Create approve page
  - **Files**: `frontend-web/src/pages/admin/Approve.jsx`
  - Review flagged items
  - Approve individually or in bulk
  - Override calculations (manual adjustments)
  - Add admin notes
  - Export CSV for Paychex
  
- [ ] Integrate payroll widgets in Dashboard
  - **Files**: `frontend-web/src/pages/admin/Dashboard.jsx`
  - Include AnalyzePayrollWidget (preview)
  - Include ProcessPayrollWidget (commit)
  - Display both widgets prominently
  - Show workflow: Analyze first, then Process
  
- [ ] Integrate payroll widgets in Approve page
  - **Files**: `frontend-web/src/pages/admin/Approve.jsx`
  - Include ProcessPayrollWidget for reprocessing if needed
  - Show existing payroll records
  - Allow reprocess if corrections needed

#### Reports Page
- [ ] Create reports page
  - **Files**: `frontend-web/src/pages/admin/Reports.jsx`
  - Date range selector
  - Crew comparison charts
  - Individual performance trends
  - Cost analysis
  - Export to PDF/Excel

#### Settings Page
- [ ] Create settings page
  - **Files**: `frontend-web/src/pages/admin/Settings.jsx`
  - Configure calculation rules (late penalty %, long lunch penalty, bonus thresholds)
  - Set budgeted hours for service types
  - Notification settings
  - Business hours

#### API Service (Web)
- [ ] Create API service
  - **Files**: `frontend-web/src/services/api.js`
  - Axios configuration
  - Authentication header injection
  - API endpoints: login, payroll, users, notifications
  - Error handling

---

## PR #11: Manager Dashboard - Web

### Objective
Build the manager web dashboard for viewing analytics and reports.

### Tasks

#### Manager Layout
- [ ] Create manager layout component
  - **Files**: `frontend-web/src/components/ManagerLayout.jsx`
  - Sidebar with limited navigation
  - Top navbar with notifications
  
- [ ] Create manager routing
  - **Files**: `frontend-web/src/App.js`
  - Route to manager dashboard based on role

#### Manager Overview Page
- [ ] Create manager overview page
  - **Files**: `frontend-web/src/pages/manager/Dashboard.jsx`
  - Company-wide statistics
  - All crews performance summary
  - Efficiency trends chart
  - Cost per job analysis
  - Alerts for underperforming crews

#### Teams Page
- [ ] Create teams page
  - **Files**: `frontend-web/src/pages/manager/Teams.jsx`
  - List of all crews
  - Click crew to see detailed breakdown
  - Individual crew member performance within crew
  - Crew comparisons

#### Analytics Page
- [ ] Create analytics page
  - **Files**: `frontend-web/src/pages/manager/Analytics.jsx`
  - Advanced charts and graphs
  - Performance heatmaps
  - Seasonal analysis
  - Export capabilities
  
- [ ] Create performance chart component
  - **Files**: `frontend-web/src/components/PerformanceChart.jsx`
  - Line/bar chart using Chart.js
  - Display performance trends over time

---

## PR #12: Foreman Dashboard - Web

### Objective
Build the foreman web dashboard for managing their assigned crew.

### Tasks

#### Foreman Layout
- [ ] Create foreman layout component
  - **Files**: `frontend-web/src/components/ForemanLayout.jsx`
  - Sidebar with team-focused navigation
  - Top navbar
  
- [ ] Create foreman routing
  - **Files**: `frontend-web/src/App.js`
  - Route to foreman dashboard based on role

#### My Team Page (Home)
- [ ] Create foreman dashboard page
  - **Files**: `frontend-web/src/pages/foreman/Dashboard.jsx`
  - Team performance overview (yesterday)
  - Team average efficiency score
  - Total team payout
  - Summary cards for each member
  - Alerts for underperformers

#### Team Members Page
- [ ] Create team members page
  - **Files**: `frontend-web/src/pages/foreman/TeamMembers.jsx`
  - Detailed list of all crew members
  - Individual performance cards
  - Click member to see detailed breakdown
  - Sort by performance, name, earnings
  - Filter by date range
  
- [ ] Create member detail view
  - **Files**: `frontend-web/src/components/MemberDetailModal.jsx`
  - Last 7 days performance chart
  - Strengths/weaknesses
  - Attendance record
  - Admin notes

#### Schedule Page
- [ ] Create schedule page
  - **Files**: `frontend-web/src/pages/foreman/Schedule.jsx`
  - Today's assigned jobs
  - Job locations
  - Estimated time per job
  - Crew assignments
  - Client contact info

#### History Page
- [ ] Create history page
  - **Files**: `frontend-web/src/pages/foreman/History.jsx`
  - Team performance over last 30 days
  - Line chart showing trends
  - Best/worst days highlighted
  - Week-over-week comparison

---

## PR #13: Mobile App - i18n Setup

### Objective
Set up internationalization (i18n) for bilingual support in the mobile app.

### Tasks

#### Translation Files
- [ ] Create English translation file
  - **Files**: `mobile/src/i18n/en.json`
  - All English text for the app
  - Organized by screen/component
  
- [ ] Create Spanish translation file
  - **Files**: `mobile/src/i18n/es.json`
  - All Spanish translations
  - Match structure of en.json

#### i18n Configuration
- [ ] Set up i18n library
  - **Files**: `mobile/src/i18n/index.js`
  - Initialize react-i18next
  - Load translation files
  - Configure language detection
  - Set fallback language

#### Language Context
- [ ] Create language context
  - **Files**: `mobile/src/context/LanguageContext.js`
  - Manage current language state
  - Provide language switching function
  - Save preference to AsyncStorage
  
- [ ] Create storage utility for language
  - **Files**: `mobile/src/utils/storage.js`
  - saveLanguage(lang)
  - getLanguage()
  - Use AsyncStorage

#### Language Toggle Component
- [ ] Create language toggle component
  - **Files**: `mobile/src/components/LanguageToggle.js`
  - Toggle switch between English and Spanish
  - Display flags (🇺🇸 🇲🇽)
  - Update context on toggle

---

## PR #14: Mobile App - Authentication & Navigation

### Objective
Implement mobile app authentication and navigation structure.

### Tasks

#### Navigation Setup
- [ ] Configure React Navigation
  - **Files**: `mobile/src/navigation/AppNavigator.js`
  - Set up Stack Navigator
  - Set up Bottom Tab Navigator
  
- [ ] Create auth navigation
  - **Files**: `mobile/src/navigation/AuthNavigator.js`
  - Login screen navigation
  
- [ ] Create main navigation
  - **Files**: `mobile/src/navigation/MainNavigator.js`
  - Bottom tabs: Home, History, Profile
  - Stack navigation for details screens

#### Login Screen
- [ ] Create login screen
  - **Files**: `mobile/src/screens/LoginScreen.js`
  - Email and password inputs
  - Language toggle
  - Login button
  - Form validation
  - Call authentication API
  - Save token to AsyncStorage
  
- [ ] Create auth service for mobile
  - **Files**: `mobile/src/services/auth.js`
  - login(email, password)
  - logout()
  - getToken()
  - saveToken(token)

#### API Service (Mobile)
- [ ] Create API service for mobile
  - **Files**: `mobile/src/services/api.js`
  - Axios configuration
  - Authentication header injection
  - API endpoints
  - Error handling

---

## PR #15: Mobile App - Crew Member Dashboard

### Objective
Build the main dashboard screen showing yesterday's performance.

### Tasks

#### Dashboard Screen
- [ ] Create dashboard screen
  - **Files**: `mobile/src/screens/DashboardScreen.js`
  - Fetch yesterday's payroll data
  - Display performance score with stars
  - Show payout breakdown
  - Quick stats (hours, jobs, on time, lunch)
  - Buttons to view full breakdown and history
  
- [ ] Create score card component
  - **Files**: `mobile/src/components/ScoreCard.js`
  - Large percentage display
  - Star rating (1-5 stars based on score)
  - Motivational message (great job, keep improving, etc.)
  - Use translations

#### Payout Breakdown Component
- [ ] Create payout breakdown component
  - **Files**: `mobile/src/components/PayoutBreakdown.js`
  - Base pay
  - Performance bonus
  - Penalties (if any)
  - Total
  - Use currency formatting

#### API Integration
- [ ] Implement API call for crew member data
  - **Files**: `mobile/src/services/api.js`
  - GET /api/payroll/my-score
  - Fetch crew member's own payroll data

---

## PR #16: Mobile App - Breakdown Screen

### Objective
Build the detailed breakdown screen showing how pay was calculated.

### Tasks

#### Breakdown Screen
- [ ] Create breakdown screen
  - **Files**: `mobile/src/screens/BreakdownScreen.js`
  - Date display
  - Base pay calculation section
  - Performance bonus section
  - Job-by-job breakdown
  - Efficiency per job
  - Deductions section (late, long lunch)
  - Final total
  
- [ ] Create job breakdown component
  - **Files**: `mobile/src/components/JobBreakdownCard.js`
  - Job name/type
  - Budgeted vs actual hours
  - Efficiency percentage
  - Visual indicator (✅ or ⚠️)

#### Formatting Utilities
- [ ] Create currency formatter
  - **Files**: `mobile/src/utils/formatters.js`
  - formatCurrency(amount, language)
  - Use Intl.NumberFormat
  
- [ ] Create date formatter
  - **Files**: `mobile/src/utils/formatters.js`
  - formatDate(date, language)
  - Use locale-based formatting

---

## PR #17: Mobile App - History Screen

### Objective
Build the history screen showing past 30 days of performance.

### Tasks

#### History Screen
- [ ] Create history screen
  - **Files**: `mobile/src/screens/HistoryScreen.js`
  - Fetch last 30 days of payroll data
  - Display performance trend chart
  - Show average, best day, total earned
  - List recent days with scores
  - Load more functionality
  
- [ ] Create performance trend component
  - **Files**: `mobile/src/components/PerformanceTrendChart.js`
  - Line chart showing performance over time
  - Use react-native-chart-kit or similar
  
- [ ] Create history card component
  - **Files**: `mobile/src/components/HistoryCard.js`
  - Display single day's performance
  - Date, score, stars, payout
  - Tap to view details

#### API Integration
- [ ] Implement API call for history
  - **Files**: `mobile/src/services/api.js`
  - GET /api/payroll/my-history
  - Fetch crew member's historical data

---

## PR #18: Mobile App - Profile & Settings

### Objective
Build the profile screen with settings and language preference.

### Tasks

#### Profile Screen
- [ ] Create profile screen
  - **Files**: `mobile/src/screens/ProfileScreen.js`
  - User avatar
  - Display name, employee ID
  - Email, phone, crew
  - Language preference toggle
  - Settings options (notifications, change password, help)
  - Logout button
  
- [ ] Implement update language preference
  - **Files**: `mobile/src/screens/ProfileScreen.js`
  - Call API to update user preference
  - Save to AsyncStorage
  - Update context

#### Help/FAQ Screen
- [ ] Create help screen
  - **Files**: `mobile/src/screens/HelpScreen.js`
  - Frequently asked questions
  - How pay is calculated
  - What affects score
  - Why penalized
  - How to improve
  - Contact office information
  - Use collapsible sections
  - Bilingual content

---

## PR #19: Mobile App - Notifications

### Objective
Implement in-app notifications for crew members.

### Tasks

#### Notification Banner
- [ ] Create notification banner component
  - **Files**: `mobile/src/components/NotificationBanner.js`
  - Show at top of dashboard when new results available
  - Display: "New Results Available!"
  - Show performance score preview
  - Tap to dismiss or view details
  
- [ ] Integrate notifications into dashboard
  - **Files**: `mobile/src/screens/DashboardScreen.js`
  - Fetch unread notifications on screen load
  - Display banner if new notifications exist
  - Mark as read when viewed

#### Notification Badge
- [ ] Add notification badge to tab icon
  - **Files**: `mobile/src/navigation/MainNavigator.js`
  - Show unread count on home tab
  - Update badge when notifications are read

---

## PR #20: Web Dashboard - Charts & Analytics

### Objective
Enhance all dashboards with interactive charts and data visualizations.

### Tasks

#### Chart Components
- [ ] Create performance trend chart
  - **Files**: `frontend-web/src/components/PerformanceTrendChart.jsx`
  - Line chart showing performance over time
  - Use Chart.js and react-chartjs-2
  - Responsive design
  
- [ ] Create crew comparison chart
  - **Files**: `frontend-web/src/components/CrewComparisonChart.jsx`
  - Bar chart comparing crews
  - Show efficiency, total pay, etc.
  
- [ ] Create efficiency distribution chart
  - **Files**: `frontend-web/src/components/EfficiencyDistributionChart.jsx`
  - Histogram of efficiency scores
  - Show distribution across company

#### Analytics Integration
- [ ] Add charts to admin dashboard
  - **Files**: `frontend-web/src/pages/admin/Dashboard.jsx`
  - Performance trend (last 7 days)
  - Today's summary stats
  
- [ ] Add charts to manager analytics
  - **Files**: `frontend-web/src/pages/manager/Analytics.jsx`
  - Multiple chart types
  - Crew comparisons
  - Performance heatmaps
  
- [ ] Add charts to foreman history
  - **Files**: `frontend-web/src/pages/foreman/History.jsx`
  - Team performance trend
  - Individual member comparisons

---

## PR #21: CSV Upload & Processing

### Objective
Implement CSV file upload functionality for manual data import.

### Tasks

#### File Upload Component
- [ ] Create file upload component
  - **Files**: `frontend-web/src/components/FileUpload.jsx`
  - Drag-and-drop area
  - File input button
  - File validation (CSV only)
  - Show file name and size
  - Remove file option
  
- [ ] Create CSV preview component
  - **Files**: `frontend-web/src/components/CSVPreview.jsx`
  - Display first 10 rows of uploaded CSV
  - Show column headers
  - Validate data format

#### Upload Processing
- [ ] Implement CSV upload endpoint
  - **Files**: `backend/routes/upload.js`
  - POST /api/upload/service-autopilot
  - POST /api/upload/paychex
  - Accept file upload (multipart/form-data)
  - Parse and validate CSV
  - Store data temporarily or in database
  
- [ ] Create CSV parsing utility
  - **Files**: `backend/utils/csvParser.js`
  - parseServiceAutopilotCSV(file)
  - parsePaychexCSV(file)
  - Validate required columns
  - Return structured data

#### Upload Integration
- [ ] Integrate upload into admin workflow
  - **Files**: `frontend-web/src/pages/admin/Upload.jsx`
  - Upload both CSV files
  - Show preview of both
  - Button to process payroll with uploaded data
  - Clear uploads after processing

---

## PR #22: Error Handling & Validation

### Objective
Implement comprehensive error handling and data validation across the application.

### Tasks

#### Backend Error Handling
- [ ] Create error handling middleware
  - **Files**: `backend/middleware/errorHandler.js`
  - Catch all errors
  - Format error responses
  - Log errors
  
- [ ] Implement validation middleware
  - **Files**: `backend/middleware/validation.js`
  - Validate request bodies
  - Check required fields
  - Validate data types
  
- [ ] Add error handling to all routes
  - **Files**: All route files in `backend/routes/`
  - Wrap async functions with try-catch
  - Return appropriate error codes and messages

#### Frontend Error Handling
- [ ] Create error boundary component (Web)
  - **Files**: `frontend-web/src/components/ErrorBoundary.jsx`
  - Catch React errors
  - Display fallback UI
  
- [ ] Implement form validation (Web)
  - **Files**: `frontend-web/src/utils/validation.js`
  - Email validation
  - Required field validation
  - Number range validation
  
- [ ] Add error handling to API calls (Web)
  - **Files**: `frontend-web/src/services/api.js`
  - Display error messages to user
  - Handle network errors
  - Handle authentication errors (401, 403)

#### Mobile Error Handling
- [ ] Implement form validation (Mobile)
  - **Files**: `mobile/src/utils/validation.js`
  - Email validation
  - Required field validation
  
- [ ] Add error handling to API calls (Mobile)
  - **Files**: `mobile/src/services/api.js`
  - Display error messages to user
  - Handle network errors
  - Handle authentication errors

---

## PR #23: Testing & Documentation

### Objective
Add tests and comprehensive documentation for the project.

### Tasks

#### Backend Tests
- [ ] Set up testing framework
  - **Files**: `backend/package.json`
  - Install Jest or Mocha
  
- [ ] Write calculation service tests
  - **Files**: `backend/tests/calculationService.test.js`
  - Test efficiency calculations
  - Test penalty logic
  - Test bonus logic
  - Test edge cases
  
- [ ] Write API route tests
  - **Files**: `backend/tests/routes/`
  - Test authentication
  - Test payroll processing
  - Test user management

#### Documentation
- [ ] Create API documentation
  - **Files**: `docs/API.md`
  - Document all API endpoints
  - Request/response examples
  - Authentication requirements
  
- [ ] Document database schema
  - **Files**: `docs/DATABASE.md`
  - Table structures
  - Relationships
  - Indexes
  
- [ ] Create architecture documentation
  - **Files**: `docs/ARCHITECTURE.md`
  - System architecture diagram
  - Data flow diagrams
  - Component descriptions
  
- [ ] Update README with setup instructions
  - **Files**: `README.md`
  - Installation steps
  - Environment setup
  - Running the application
  - Tech stack overview

#### Code Comments
- [ ] Add JSDoc comments to all services
  - **Files**: All files in `backend/services/`
  - Function descriptions
  - Parameter types
  - Return types
  
- [ ] Add comments to complex logic
  - **Files**: `backend/services/calculationService.js`
  - Explain calculation formulas
  - Document business rules

---

## PR #24: Deployment Setup

### Objective
Configure the application for Firebase deployment (Backend: Cloud Functions, Frontend: Firebase Hosting) and create deployment documentation.

**Note**: Deployment will be done after full development and local testing are complete.

### Tasks

#### Firebase Project Setup
- [ ] Initialize Firebase project
  - **Files**: `firebase.json`, `.firebaserc`
  - Create Firebase project in console
  - Link local project to Firebase
  - Configure Firebase CLI
  
- [ ] Set up Firebase project structure
  - **Files**: `firebase.json`
  - Configure functions directory
  - Configure hosting directory
  - Set up project ID

#### Backend Deployment (Firebase Cloud Functions)
- [ ] Install Firebase Functions dependencies
  - **Files**: `backend/functions/package.json`
  - Install firebase-functions, firebase-admin
  - Install express adapter for Cloud Functions
  
- [ ] Adapt Express server for Cloud Functions
  - **Files**: `backend/functions/index.js`
  - Convert server.js to Cloud Function format
  - Export Express app as HTTP function
  - Handle CORS for Cloud Functions
  - Set up function routing
  
- [ ] Note: No automatic scheduling needed
  - Payroll processing is triggered manually by admins
  - No Cloud Scheduler setup required
  - Manual trigger available via admin dashboard
  - API endpoint: POST /api/payroll/process (admin only)
  
- [ ] Set up environment variables for Cloud Functions
  - **Files**: `backend/functions/.env.sample`
  - Document required environment variables
  - Configure Firebase Functions config:set commands
  - Set production database URLs
  - Set production API keys
  
- [ ] Create deployment script
  - **Files**: `backend/functions/package.json`
  - Add deploy script
  - Add function-specific scripts

#### Web Frontend Deployment (Firebase Hosting)
- [ ] Configure Firebase Hosting
  - **Files**: `firebase.json`
  - Set public directory to `frontend-web/build`
  - Configure redirects for React Router
  - Set up 404 fallback to index.html
  
- [ ] Configure Firebase project for hosting
  - **Files**: `.firebaserc`
  - Link frontend-web to Firebase project
  
- [ ] Add production build script
  - **Files**: `frontend-web/package.json`
  - Ensure build script is optimized
  - Add pre-deploy script if needed
  
- [ ] Configure production environment
  - **Files**: `frontend-web/.env.production`
  - Set production API URL (Cloud Functions URL)
  - Set production Firebase config
  - Update API service to use production endpoints
  
- [ ] Test production build locally
  - **Files**: `frontend-web/`
  - Run `npm run build`
  - Test build output
  - Verify all assets load correctly

#### Mobile App (Development Only)
- [ ] Configure app for development
  - **Files**: `mobile/app.json`
  - Set app name, version for Expo Go
  - Configure development API URL
  - Note: App will be tested on Expo Go only, no production build needed

#### Deployment Scripts & Automation
- [ ] Create deployment scripts
  - **Files**: `scripts/deploy.sh` or `package.json` scripts
  - Backend deployment script
  - Frontend deployment script
  - Combined deployment script
  
- [ ] Set up pre-deployment checks
  - **Files**: `scripts/pre-deploy-check.js`
  - Verify environment variables are set
  - Check build outputs exist
  - Validate configuration files

#### Deployment Documentation
- [ ] Create deployment guide
  - **Files**: `docs/DEPLOYMENT.md`
  - Firebase project setup steps
  - Backend Cloud Functions deployment
  - Frontend Firebase Hosting deployment
  - Cloud Scheduler configuration
  - Environment variable setup
  - Database migration steps (if needed)
  - Post-deployment verification
  - Note: Mobile app is development-only (Expo Go testing)
  
- [ ] Create production checklist
  - **Files**: `docs/PRODUCTION_CHECKLIST.md`
  - Pre-deployment checklist
  - Security considerations
  - Performance optimizations
  - Monitoring setup
  - Backup procedures
  - Rollback plan
  
- [ ] Document manual payroll processing
  - **Files**: `docs/MANUAL_PAYROLL_PROCESSING.md`
  - How to trigger payroll processing from admin dashboard
  - API endpoint documentation
  - Execution history and logging
  - Error handling and troubleshooting
  - Optional testing cron setup (development only)

#### Post-Deployment Tasks
- [ ] Verify all endpoints work
  - Test API endpoints
  - Test authentication
  - Test manual payroll processing trigger
  
- [ ] Set up monitoring
  - Configure Firebase Functions logs
  - Set up error alerts
  - Monitor payroll processing executions
  - Set up alerts for processing failures
  
- [ ] Update documentation with production URLs
  - **Files**: `README.md`, `docs/DEPLOYMENT.md`
  - Add production URLs
  - Update setup instructions

---

## PR #25: Final Polish & Bug Fixes

### Objective
Final review, polish, and bug fixes before project completion.

### Tasks

#### Code Review & Refactoring
- [ ] Review all backend code
  - **Files**: All backend files
  - Refactor duplicated code
  - Improve naming conventions
  - Remove commented code
  
- [ ] Review all frontend code
  - **Files**: All frontend files
  - Consistent styling
  - Remove unused imports
  - Optimize components

#### UI/UX Polish
- [ ] Polish web dashboard UI
  - **Files**: All web page files
  - Consistent spacing and alignment
  - Loading states for all async operations
  - Empty states (no data messages)
  - Success/error toast messages
  
- [ ] Polish mobile app UI
  - **Files**: All mobile screen files
  - Consistent styling
  - Smooth transitions
  - Loading indicators
  - Error messages

#### Bug Fixes
- [ ] Fix any identified bugs
  - **Files**: Various files as needed
  - Test all user flows
  - Fix edge cases
  - Handle error scenarios
  
- [ ] Cross-browser testing (Web)
  - Test on Chrome, Firefox, Safari, Edge
  - Fix any browser-specific issues
  
- [ ] Cross-device testing (Mobile)
  - Test on iOS and Android
  - Test on different screen sizes
  - Fix any platform-specific issues

#### Performance Optimization
- [ ] Optimize API response times
  - **Files**: Backend route files
  - Add database indexes
  - Optimize queries
  
- [ ] Optimize frontend performance
  - **Files**: Frontend component files
  - Lazy loading
  - Code splitting
  - Image optimization

#### Final Documentation
- [ ] Update all documentation
  - **Files**: All docs files and README
  - Ensure accuracy
  - Add screenshots/GIFs
  - Update tech stack details
  
- [ ] Create demo video script
  - **Files**: `docs/DEMO_SCRIPT.md`
  - Step-by-step demo walkthrough
  - Key features to highlight

---

## Post-Development Tasks

### After All PRs Complete

- [ ] Create comprehensive README with screenshots
- [ ] Record demo video (3-5 minutes)
- [ ] Deploy to production (live demo link)
- [ ] Create GitHub repository description
- [ ] Add repository topics/tags
- [ ] Test entire application end-to-end
- [ ] Gather feedback and iterate

---

## Notes

- Each PR should be focused on a single feature or component
- Write clear commit messages for each change
- Test thoroughly before creating PR
- Keep PRs reasonably sized (not too large)
- Document any breaking changes or migrations needed
- Update .env.example files when adding new environment variables

---

## File Structure Reference

```
p4p-system/
│
├── backend/
│   ├── config/
│   │   ├── api.js
│   │   ├── calculationRules.js
│   │   ├── cron.js
│   │   ├── database.js
│   │   └── firebase.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── roleCheck.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notifications.js
│   │   ├── payroll.js
│   │   ├── upload.js
│   │   ├── users.js
│   │   └── mock/
│   │       ├── paychex.js
│   │       └── serviceAutopilot.js
│   ├── services/
│   │   ├── calculationService.js
│   │   ├── cronService.js
│   │   ├── dataService.js
│   │   ├── notificationService.js
│   │   ├── payrollService.js
│   │   └── userService.js
│   ├── tests/
│   │   ├── calculationService.test.js
│   │   └── routes/
│   ├── utils/
│   │   ├── csvExporter.js
│   │   ├── csvParser.js
│   │   ├── mockDataGenerator.js
│   │   └── seedData.js
│   ├── .env
│   ├── .env.example
│   ├── .env.production
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend-web/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddUserModal.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── CSVPreview.jsx
│   │   │   ├── CrewComparisonChart.jsx
│   │   │   ├── EditUserModal.jsx
│   │   │   ├── EfficiencyDistributionChart.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── ForemanLayout.jsx
│   │   │   ├── ManagerLayout.jsx
│   │   │   ├── MemberDetailModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   ├── PayoutBreakdown.jsx
│   │   │   ├── PayrollTable.jsx
│   │   │   ├── PerformanceChart.jsx
│   │   │   ├── PerformanceTrendChart.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Approve.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   ├── Review.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── Upload.jsx
│   │   │   │   └── Users.jsx
│   │   │   ├── foreman/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── History.jsx
│   │   │   │   ├── Schedule.jsx
│   │   │   │   └── TeamMembers.jsx
│   │   │   └── manager/
│   │   │       ├── Analytics.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       └── Teams.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validation.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .env
│   ├── .env.example
│   ├── .env.production
│   ├── .gitignore
│   ├── package.json
│   └── tailwind.config.js
│
├── mobile/
│   ├── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HistoryCard.js
│   │   │   ├── JobBreakdownCard.js
│   │   │   ├── LanguageToggle.js
│   │   │   ├── NotificationBanner.js
│   │   │   ├── PayoutBreakdown.js
│   │   │   ├── PerformanceTrendChart.js
│   │   │   └── ScoreCard.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── LanguageContext.js
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   └── index.js
│   │   ├── navigation/
│   │   │   ├── AppNavigator.js
│   │   │   ├── AuthNavigator.js
│   │   │   └── MainNavigator.js
│   │   ├── screens/
│   │   │   ├── BreakdownScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── HelpScreen.js
│   │   │   ├── HistoryScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   └── ProfileScreen.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── storage.js
│   │   │   └── validation.js
│   │   └── App.js
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── app.json
│   └── package.json
│
├── mock-data/
│   ├── employees.json
│   ├── mock_users.json
│   ├── paychex_timesheets.csv
│   └── service_autopilot_jobs.csv
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DEMO_SCRIPT.md
│   ├── DEPLOYMENT.md
│   ├── MOBILE_BUILD.md
│   └── PRODUCTION_CHECKLIST.md
│
├── .gitignore
└── README.md
```

---
