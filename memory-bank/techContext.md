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
- **Database Hosting**: Supabase
- **Authentication Service**: Firebase Authentication
- **File Storage**: Firebase Storage (for CSV uploads)
- **Web Hosting**: Firebase Hosting (planned)
- **Backend Hosting**: TBD (Node.js server)

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
SUPABASE_KEY=your_supabase_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# External APIs
USE_MOCK=true
SERVICE_AUTOPILOT_API_URL=
PAYCHEX_API_URL=
SERVICE_AUTOPILOT_API_KEY=
PAYCHEX_API_KEY=

# Cron
ENABLE_CRON=true
CRON_SCHEDULE="30 10 * * *"  # 10:30 AM daily
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
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
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
  "jsonwebtoken": "^9.0.2"
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

### Current (Mock)
- **Service Autopilot**: Mock API at `/mock/service-autopilot/*`
- **Paychex**: Mock API at `/mock/paychex/*`

### Future (Production)
- **Service Autopilot**: Real API integration
- **Paychex**: Real API integration or CSV export

## Known Technical Decisions

1. **Supabase over Firebase Firestore**: Better SQL support for complex queries
2. **Firebase Auth**: Industry standard, easy integration
3. **Expo for Mobile**: Faster development, easier deployment
4. **Mock APIs First**: Develop without external dependencies
5. **RESTful API**: Simple, well-understood pattern
6. **React Context over Redux**: Simpler state management for this use case

