# Technical Context: Clean Scapes P4P System

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Admin SDK
- **Scheduling**: node-cron
- **File Processing**: csv-parser
- **Security**: bcrypt, jsonwebtoken
- **Environment**: dotenv
- **HTTP Client**: axios (for external API calls)

### Web Frontend
- **Framework**: React
- **Build Tool**: Create React App or Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, react-chartjs-2
- **HTTP Client**: Axios
- **State Management**: React Context API

### Mobile App
- **Framework**: React Native
- **Platform**: Expo
- **Navigation**: React Navigation (Stack, Bottom Tabs)
- **Internationalization**: react-i18next
- **Storage**: @react-native-async-storage/async-storage
- **HTTP Client**: Axios
- **State Management**: React Context API

### Infrastructure
- **Database Hosting**: Supabase (PostgreSQL)
- **Database Schema**: 6 tables (users, jobs, timesheets, payroll_records, notifications, execution_logs)
- **Authentication Service**: Firebase Authentication (Email/Password)
- **Authentication Backend**: Firebase Admin SDK
- **File Storage**: Firebase Storage (for CSV uploads, planned)
- **Web Hosting**: Firebase Hosting (planned)
- **Backend Hosting**: Firebase Cloud Functions (planned)

## Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Git
- Supabase account
- Firebase account
- Expo CLI (for mobile development)

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase User Creation (optional, for development)
CREATE_FIREBASE_USERS=true

# External APIs
USE_MOCK=true
SERVICE_AUTOPILOT_API_URL=
PAYCHEX_API_URL=
SERVICE_AUTOPILOT_API_KEY=
PAYCHEX_API_KEY=

# Optional Testing Cron (development only)
ENABLE_CRON=false
CRON_SCHEDULE="30 10 * * *"  # 10:30 AM daily (for testing only)
```

#### Web Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
```

#### Mobile App (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Project Structure

### Backend Structure
```
backend/
├── config/
│   ├── api.js              # External API configuration
│   ├── calculationRules.js # P4P calculation rules
│   ├── cron.js             # Cron job configuration
│   ├── database.js         # Supabase client
│   └── firebase.js         # Firebase Admin SDK
├── middleware/
│   ├── auth.js             # JWT verification
│   ├── errorHandler.js     # Global error handling
│   ├── roleCheck.js        # RBAC middleware
│   └── validation.js       # Request validation
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── notifications.js    # Notification routes
│   ├── payroll.js          # Payroll routes
│   ├── upload.js           # CSV upload routes
│   ├── users.js            # User management routes
│   └── mock/               # Mock API routes (dev only)
│       ├── paychex.js
│       └── serviceAutopilot.js
├── services/
│   ├── calculationService.js  # P4P calculation engine
│   ├── cronService.js          # Scheduled jobs
│   ├── dataService.js          # External API abstraction
│   ├── notificationService.js   # Notification management
│   ├── payrollService.js       # Payroll orchestration
│   └── userService.js          # User management
├── utils/
│   ├── csvExporter.js      # CSV export utility
│   ├── csvParser.js        # CSV parsing utility
│   ├── mockDataGenerator.js # Mock data generation
│   └── seedData.js         # Database seeding
├── tests/
│   ├── calculationService.test.js
│   └── routes/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

### Web Frontend Structure
```
frontend-web/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin-specific components
│   │   ├── manager/        # Manager-specific components
│   │   ├── foreman/        # Foreman-specific components
│   │   └── shared/         # Shared components
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── admin/
│   │   ├── manager/
│   │   └── foreman/
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validation.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tailwind.config.js
```

### Mobile App Structure
```
mobile/
├── assets/
├── src/
│   ├── components/
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── LanguageContext.js
│   ├── i18n/
│   │   ├── en.json
│   │   ├── es.json
│   │   └── index.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── BreakdownScreen.js
│   │   ├── HistoryScreen.js
│   │   ├── ProfileScreen.js
│   │   └── HelpScreen.js
│   ├── services/
│   │   ├── api.js
│   │   └── auth.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── storage.js
│   │   └── validation.js
│   └── App.js
├── .env
├── .env.example
├── .gitignore
├── app.json
└── package.json
```

## Dependencies

### Backend Key Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "node-cron": "^3.0.2",
  "firebase-admin": "^11.11.0",
  "@supabase/supabase-js": "^2.38.4",
  "csv-parser": "^3.0.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "axios": "^1.6.2"
}
```

### Web Frontend Key Dependencies
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "tailwindcss": "^3.3.6"
}
```

### Mobile App Key Dependencies
```json
{
  "react-native": "expo version",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/stack": "^6.3.20",
  "react-i18next": "^13.5.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "axios": "^1.6.2"
}
```

## Technical Constraints

### Performance Requirements
- Process ~50 employees daily within 10 minutes
- API response times <2 seconds for dashboard queries
- Mobile app should load dashboard in <3 seconds

### Scalability Considerations
- Database indexes on frequently queried fields
- Connection pooling for Supabase
- Efficient query patterns (avoid N+1 queries)
- Pagination for large data sets

### Security Requirements
- All API endpoints require authentication (except login)
- Role-based access control enforced at middleware level
- Environment variables for sensitive data
- HTTPS in production
- Input validation and sanitization

### Compatibility
- Web: Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile: iOS 13+, Android 8+
- Node.js: v18+ recommended

## Development Workflow

### Local Development
1. Start Supabase local instance (or use cloud)
2. Start backend: `npm run dev` (port 3000)
3. Start web frontend: `npm start` (port 3001)
4. Start mobile: `expo start` (Expo Go app)

### Testing Strategy
- Unit tests for calculation service
- Integration tests for API routes
- Manual testing for UI/UX
- Mock data for development

### Deployment Strategy
- **Backend**: Firebase Cloud Functions (serverless)
  - Express.js API adapted for Cloud Functions
  - Manual payroll processing trigger (no automatic scheduling)
  - Environment variables via Firebase Functions config
- **Web**: Build → Firebase Hosting
  - React build output deployed to Firebase Hosting
  - React Router redirects configured
- **Mobile**: Development only
  - Tested on Expo Go during development
  - No production build or deployment needed

**Note**: Deployment will be done after full development and local testing are complete.

## External Integrations

### Current (Mock) ✅ IMPLEMENTED
- **Service Autopilot**: Mock API at `/mock/service-autopilot/*` (4 endpoints)
  - GET `/mock/service-autopilot/jobs` - Fetch jobs by date
  - GET `/mock/service-autopilot/jobs/:job_id` - Fetch specific job
  - GET `/mock/service-autopilot/crews` - List all crews
  - GET `/mock/service-autopilot/assignments` - Fetch job assignments
- **Paychex**: Mock API at `/mock/paychex/*` (4 endpoints)
  - GET `/mock/paychex/timesheets` - Fetch timesheets by date
  - GET `/mock/paychex/timesheets/:employee_id` - Fetch employee timesheet
  - GET `/mock/paychex/employees` - List all employees
  - GET `/mock/paychex/pay-rates` - Fetch pay rates
- **Data Service**: `dataService.js` provides unified interface for both APIs
- **Mock Data Generator**: `mockDataGenerator.js` generates realistic test data

### Future (Production)
- **Service Autopilot**: Real API integration (switch via USE_MOCK=false)
- **Paychex**: Real API integration or CSV export (switch via USE_MOCK=false)

## Implemented Backend Services ✅

### Calculation Service (`calculationService.js`)
- `calculateEfficiency()` - Compute efficiency percentage from budgeted vs actual hours
- `calculateBasePay()` - Base pay from hours worked × rate
- `applyBonuses()` - 100% bonus (>100% efficiency) + 50% bonus (95-100% efficiency)
- `applyPenalties()` - 5% late penalty (after 7:00 AM), 2% long lunch penalty (>1 hour)
- `detectAnomalies()` - Flag efficiency <60% or >120%, missing data, negative pay
- `calculatePayroll()` - Orchestrates full calculation with job-by-job breakdown
- **Testing**: 26 unit tests covering all scenarios

### Payroll Service (`payrollService.js`)
- `analyzePayroll(date)` - Preview calculations without saving (safe to run multiple times)
- `processPayroll(date)` - Commit to database with duplicate prevention
- `getPayrollRecords(filters)` - Retrieve records with role-based filtering
- `approvePayroll(recordId)` - Mark record as approved
- `getSummary(date)` - Aggregate statistics for a payroll date
- **Features**: Duplicate detection, reprocess support, anomaly flagging

### CSV Exporter (`csvExporter.js`)
- `generatePaychexCSV(records, format)` - Export in 3 formats:
  - `standard`: Paychex-compatible format (employee_id, date, total_pay)
  - `detailed`: Full breakdown with efficiency, bonuses, penalties
  - `summary`: Aggregated totals and statistics

### Payroll API Routes (`routes/payroll.js`) ✅ **IMPLEMENTED**
- POST `/api/payroll/analyze` - Preview payroll (no DB writes, no notifications) - Admin only
- POST `/api/payroll/process` - Process payroll (commit to DB) - Admin only
- GET `/api/payroll/records` - Get payroll records (role-based filtering) - All roles
- GET `/api/payroll/records/:id` - Get specific record - Role-based
- PUT `/api/payroll/records/:id/approve` - Approve record - Admin/Manager only
- GET `/api/payroll/export` - Export CSV (3 formats) - Admin/Manager only
- GET `/api/payroll/summary` - Get summary statistics - Admin/Manager only
- DELETE `/api/payroll/records/:id` - Delete record (for reprocessing) - Admin only

## Known Technical Decisions

1. **Supabase over Firebase Firestore**: Better SQL support for complex queries
2. **Firebase Auth**: Industry standard, easy integration
3. **Expo for Mobile**: Faster development, easier deployment
4. **Mock APIs First**: Develop without external dependencies ✅ **IMPLEMENTED**
5. **RESTful API**: Simple, well-understood pattern
6. **React Context over Redux**: Simpler state management for this use case
7. **Data Service Abstraction**: Unified interface for external APIs, easy switching between mock/real ✅ **IMPLEMENTED**
8. **Environment-Driven Configuration**: USE_MOCK flag controls API selection without code changes ✅ **IMPLEMENTED**
9. **P4P Calculation Engine**: Rule-based with anomaly detection ✅ **IMPLEMENTED**
10. **Two-Mode Payroll Processing**: Analyze (preview) vs Process (commit) for safety ✅ **IMPLEMENTED**
11. **Role-Based Data Access**: Crew members see own data, foremen see crew, managers/admins see all ✅ **IMPLEMENTED**

