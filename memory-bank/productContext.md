# Product Context: Clean Scapes P4P System

## Why This Project Exists
Clean Scapes operates a $7 million landscaping and maintenance business with field crews that need transparent, timely feedback on their performance-based compensation. The current manual system creates friction, delays, and errors that impact both administrative efficiency and crew motivation.

## Problems It Solves

### 1. Administrative Burden
- **Current State**: 4 hours/day of manual data entry and reconciliation
- **Solution**: Automated data collection and processing reduces to <15 minutes
- **Impact**: Frees up 3.75 hours/day for strategic work

### 2. Data Accuracy Issues
- **Current State**: Manual entry leads to calculation errors and pay discrepancies
- **Solution**: Automated calculation engine with validation and anomaly detection
- **Impact**: >99.5% accuracy target, reducing payroll disputes

### 3. Delayed Feedback
- **Current State**: Crews receive performance feedback days after work completion
- **Solution**: Automated daily processing at 10:30 AM with immediate notifications
- **Impact**: Feedback before next shift starts, improving motivation and performance

### 4. Lack of Transparency
- **Current State**: Crews don't understand how their pay is calculated
- **Solution**: Bilingual mobile app showing detailed breakdown of scores, bonuses, penalties
- **Impact**: Increased trust, motivation, and on-time performance

### 5. Language Barrier
- **Current State**: Many crew members speak Spanish as primary language
- **Solution**: Fully bilingual mobile app (English/Spanish toggle)
- **Impact**: All crew members can understand their performance and compensation

## How It Should Work

### Daily Workflow
1. **10:30 AM**: Automated cron job triggers payroll processing
2. **Data Collection**: System fetches job data from Service Autopilot and timesheet data from Paychex
3. **Calculation**: P4P engine calculates efficiency, bonuses, and penalties for each employee
4. **Storage**: Results stored in Supabase database with anomaly flags
5. **Notifications**: Role-specific notifications sent to all users
6. **Review**: Admins review flagged items and approve payroll
7. **Export**: Approved payroll exported to Paychex-compatible CSV
8. **Feedback**: Crew members view their scores and payouts in mobile app

### User Experience Goals

#### Crew Members (Mobile App)
- **Primary Goal**: Understand performance and compensation
- **Key Features**:
  - Yesterday's performance score with star rating (1-5 stars)
  - Detailed payout breakdown (base pay, bonuses, penalties)
  - Job-by-job efficiency breakdown
  - 30-day performance history with trends
  - Bilingual interface (EN/ES toggle)
  - Real-time notifications when results are available

#### Foremen (Web Dashboard)
- **Primary Goal**: Manage and motivate team effectively
- **Key Features**:
  - Team performance overview (yesterday)
  - Individual crew member performance cards
  - Team efficiency trends
  - Schedule view with job assignments
  - Member detail views with 7-day performance charts

#### Managers (Web Dashboard)
- **Primary Goal**: Strategic oversight and decision-making
- **Key Features**:
  - Company-wide performance statistics
  - Crew comparison charts
  - Performance trend analytics
  - Cost per job analysis
  - Alerts for underperforming crews

#### Admins (Web Dashboard)
- **Primary Goal**: Efficient payroll processing and system management
- **Key Features**:
  - Modern login page with enhanced UI ✅ **IMPLEMENTED**
    - Animated background with floating blob animations
    - Real-time form validation with field-level error messages
    - Password visibility toggle
    - Enhanced error display with icons and animations
    - Loading states with spinner animation
    - Professional styling and responsive design
  - CSV upload for Service Autopilot and Paychex data ✅ **IMPLEMENTED**
    - Drag-and-drop file upload interface
    - CSV validation and parsing
    - Data preview before processing
    - Automatic data storage in database
  - Payroll review table with anomaly flags
  - Bulk approval workflow
  - Manual payroll processing trigger
  - User management (CRUD operations)
  - CSV export for Paychex integration
  - System settings and calculation rules configuration

## Business Value
- **Time Savings**: 3.75 hours/day = ~18.75 hours/week = ~75 hours/month
- **Error Reduction**: >99.5% accuracy reduces payroll disputes and corrections
- **Employee Engagement**: Transparent feedback increases motivation and performance
- **Scalability**: Automated system can handle growth without proportional admin overhead
- **Compliance**: Automated calculations ensure consistent application of P4P rules

## User Personas

### Maria (Crew Member)
- **Age**: 32
- **Language**: Spanish (primary), English (basic)
- **Tech Comfort**: Moderate (uses smartphone daily)
- **Needs**: Understand her daily pay, see what affects her score, improve performance
- **Pain Points**: Doesn't understand why pay varies, wants to earn more bonuses

### Carlos (Foreman)
- **Age**: 45
- **Language**: Bilingual (English/Spanish)
- **Tech Comfort**: Moderate
- **Needs**: See team performance, identify underperformers, motivate crew
- **Pain Points**: Hard to track individual performance, delayed feedback makes coaching difficult

### Sarah (Admin)
- **Age**: 28
- **Language**: English
- **Tech Comfort**: High
- **Needs**: Process payroll quickly, catch errors, export to Paychex
- **Pain Points**: Manual work is tedious and error-prone, takes too much time

### Michael (Manager)
- **Age**: 50
- **Language**: English
- **Tech Comfort**: Moderate
- **Needs**: Company-wide insights, identify trends, make strategic decisions
- **Pain Points**: Hard to see big picture, need better analytics

