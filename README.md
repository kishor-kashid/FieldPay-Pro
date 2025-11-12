# FieldPay-Pro - Clean Scapes P4P System

**Automated Pay-for-Performance Platform + Bilingual Crew Mobile App**

FieldPay-Pro is an automated Pay-for-Performance (P4P) system for Clean Scapes, a $7 million landscaping and maintenance company. The system automates payroll processing, calculates performance-based pay, and provides real-time bilingual feedback to field crews.

## 🎯 Project Overview

This system replaces the manual P4P process that required ~4 hours/day of administrative work with an automated solution that processes payroll in under 15 minutes while providing daily performance feedback to crews.

### Key Features

- **Automated Payroll Processing**: Daily automated processing at 10:30 AM
- **Performance-Based Calculations**: Efficiency scores, bonuses, and penalties
- **Web Dashboards**: Role-based dashboards for Admin, Manager, and Foreman
- **Bilingual Mobile App**: English/Spanish mobile app for crew members
- **Real-Time Notifications**: Role-specific notifications for all users
- **CSV Export**: Paychex-compatible CSV export for payroll integration

## 🏗️ Architecture

The system consists of three main components:

1. **Backend API** (Node.js + Express)
   - RESTful API with Supabase database
   - Firebase Authentication
   - P4P calculation engine
   - Scheduled jobs (cron)
   - Mock APIs for development

2. **Web Dashboard** (React + Tailwind CSS)
   - Admin dashboard (upload, review, approve, users, reports)
   - Manager dashboard (analytics, teams, reports)
   - Foreman dashboard (team management, schedules, history)

3. **Mobile App** (React Native + Expo)
   - Bilingual interface (English/Spanish)
   - Performance scores and payout breakdowns
   - 30-day performance history
   - Real-time notifications

## 📋 Prerequisites

- **Node.js** v18+ and npm
- **Supabase** account (for database)
- **Firebase** account (for authentication)
- **Expo CLI** (for mobile development): `npm install -g expo-cli`

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd FieldPay-Pro
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase and Firebase credentials
npm run dev
```

The backend server will run on `http://localhost:3000`

### 3. Web Frontend Setup

```bash
cd frontend-web
npm install
cp .env.example .env
# Edit .env with your API URL and Firebase credentials
npm start
```

The web app will run on `http://localhost:3001`

### 4. Mobile App Setup

```bash
cd mobile
npm install
cp .env.example .env
# Edit .env with your API URL and Firebase credentials
npm start
```

Use Expo Go app on your phone to scan the QR code, or run on iOS/Android simulators.

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
USE_MOCK=true
ENABLE_CRON=true
```

### Web Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Mobile App (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## 📁 Project Structure

```
FieldPay-Pro/
├── backend/              # Node.js + Express API
│   ├── config/           # Configuration files
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   └── tests/            # Test files
├── frontend-web/         # React web dashboard
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API services
│   │   └── context/      # React context
├── mobile/               # React Native mobile app
│   ├── src/
│   │   ├── screens/      # Screen components
│   │   ├── components/   # Reusable components
│   │   ├── navigation/   # Navigation setup
│   │   └── i18n/         # Translations
├── memory-bank/          # Project documentation
├── docs/                  # Additional documentation
└── mock-data/            # Mock data files
```

## 🧪 Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

**Web Frontend:**
```bash
cd frontend-web
npm install
npm start  # Runs on http://localhost:3001
```

**Mobile App:**
```bash
cd mobile
npm install
npm start  # Opens Expo DevTools
```

### Running Tests

**Backend Tests:**
```bash
cd backend
npm test  # Run all tests
npm test -- --coverage  # Run with coverage report
```

**Test Coverage:**
- 65 unit tests covering critical business logic
- Calculation service: 26 tests
- CSV exporter: 23 tests
- User service: 13 tests
- Data service: 2 tests
- Notification service: 1 test

### Mock APIs

During development, the system uses mock APIs for Service Autopilot and Paychex. Set `USE_MOCK=true` in backend `.env.local` to enable mock data.

Mock API endpoints:
- `/mock/service-autopilot/*` - Mock Service Autopilot endpoints
- `/mock/paychex/*` - Mock Paychex endpoints

## 📚 Documentation

- **API Documentation**: `docs/API.md` - Complete API endpoint documentation
- **Architecture Documentation**: `docs/ARCHITECTURE.md` - System architecture and data flow
- **Database Schema**: `docs/DATABASE.md` - Database schema and relationships
- **Deployment Guide**: `docs/DEPLOYMENT.md` - Deployment instructions
- **Product Requirements**: `PRD_Clean_Scapes_Rebuild_PayforPerformance.md`
- **Task List**: `p4p_task_list.md` (25 PRs breakdown)
- **Architecture Diagram**: `p4p_architecture_diagram.mermaid`
- **Memory Bank**: `memory-bank/` directory
- **Project Rules**: `.cursor/rules/` directory

## 🎯 Success Metrics

- **Processing Time**: <15 minutes (from 4 hours)
- **Data Accuracy**: >99.5%
- **Feedback Delivery**: Before next shift starts
- **Engagement**: >10% increase in foreman engagement and on-time starts

## 👥 User Roles

- **Admin**: Full system access, approve payroll, manage users
- **Manager**: Analytics and reports, company-wide view
- **Foreman**: Team management, crew member details
- **Crew Member**: Own performance data (mobile app only)

## 🔐 Security

- Firebase Authentication for user login
- JWT tokens for API authentication
- Role-based access control (RBAC)
- Environment variables for sensitive data
- Input validation and sanitization

## 🧮 P4P Calculation

The system calculates performance-based pay using a simplified formula:

- **Base Pay**: Hours Worked × Base Rate
- **Penalties**: 
  - Late clock-in (>7:00 AM): 5% of base pay
  - Long lunch (>1 hour): 2% of base pay
- **Total Pay**: Base Pay - Total Penalties
- **Anomaly Detection**: Flags missing data, negative pay, unusual patterns

**Note**: Efficiency bonuses have been removed. The formula is now: `Total Pay = Base Pay - Penalties`

## 📱 Mobile App Features

- Bilingual interface (English/Spanish toggle)
- Yesterday's performance score with star rating
- Detailed payout breakdown
- Job-by-job efficiency breakdown
- 30-day performance history
- Real-time notifications

## 🚢 Deployment

The system is deployed on Firebase:
- **Backend**: Firebase Cloud Functions (serverless) ✅ **DEPLOYED**
  - Function URL: `https://us-central1-fieldpay-pro.cloudfunctions.net/api`
  - Runtime: Node.js 20
- **Web Frontend**: Firebase Hosting ✅ **DEPLOYED**
  - Hosting URL: `https://fieldpay-pro.web.app` (or `https://fieldpay-pro.firebaseapp.com`)
  - React Router configured with proper redirects
  - Production build optimized and deployed
- **Payroll Processing**: Manual trigger by admins via web dashboard (no automatic scheduling)
- **Mobile**: Development only - tested on Expo Go (no production build needed)

**Deployment Commands:**
```bash
# Deploy backend
cd backend
npm run deploy

# Deploy frontend
cd frontend-web
npm run build
cd ..
firebase deploy --only hosting

# Or use deployment scripts
bash scripts/deploy-all.sh      # Deploy both
bash scripts/deploy-backend.sh  # Backend only
bash scripts/deploy-frontend.sh # Frontend only
```

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 📝 Development Roadmap

The project is broken down into 25 Pull Requests:

1. ✅ Project Setup & Initial Configuration
2. Database Schema & Configuration
3. Firebase Authentication Setup
4. Mock External APIs
5. P4P Calculation Engine
6. Payroll Processing Routes
7. Scheduled Jobs (Cron)
8. Notifications System
9. User Management
10-12. Web Dashboards (Admin, Manager, Foreman)
13-19. Mobile App (i18n, auth, screens)
20-25. Charts, CSV upload, testing, deployment, polish

## 🤝 Contributing

This is a private project for Clean Scapes. For questions or issues, contact the development team.

## 📄 License

Proprietary - Clean Scapes

## 🙏 Acknowledgments

Built for Clean Scapes to automate their Pay-for-Performance system and improve crew engagement and administrative efficiency.

---

## 📊 Project Status

**Status**: Feature Completion & Polish  
**Version**: 1.0.0  
**Last Updated**: 2025

### Completed Features
- ✅ Backend API with all core services
- ✅ Web dashboards (Admin, Manager, Foreman)
- ✅ Mobile app (all core screens)
- ✅ CSV upload functionality
- ✅ Error handling and validation
- ✅ Comprehensive documentation
- ✅ Backend deployed to Firebase Cloud Functions
- ✅ Frontend deployed to Firebase Hosting

### In Progress
- ⏳ Final polish and testing (PR #25)

### Tech Stack
- **Backend**: Node.js 20, Express.js, Firebase Cloud Functions, Supabase (PostgreSQL)
- **Web Frontend**: React, Tailwind CSS, React Router
- **Mobile**: React Native, Expo SDK 54, React Navigation
- **Testing**: Jest (65 tests passing)
- **Authentication**: Firebase Authentication
- **Database**: Supabase PostgreSQL
