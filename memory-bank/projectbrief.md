# Project Brief: Clean Scapes P4P System

## Project Overview
**Project Name:** FieldPay-Pro (Clean Scapes Pay-for-Performance System)  
**Organization:** Clean Scapes  
**Project Type:** Automated Web Platform + Bilingual Mobile App  
**Industry:** Landscaping & Maintenance ($7M company)

## Core Problem
The current Pay-for-Performance (P4P) process is entirely manual, involving:
- Manual data transfer between Service Autopilot, Paychex, and P4PSoftware.com
- ~4 hours/day of manual administrative work
- Error-prone data entry and calculations
- Delayed feedback to field crews (often days after work completion)
- Reduced crew motivation due to lack of transparency

## Core Solution
Build an automated P4P system that:
1. **Automates** data collection from Service Autopilot and Paychex
2. **Calculates** performance-based pay using rule engine (efficiency, bonuses, penalties)
3. **Provides** real-time feedback via web dashboards and bilingual mobile app
4. **Runs** automated daily processing at 10:30 AM
5. **Exports** approved payroll data back to Paychex

## Project Goals
1. **Reduce Manual Processing**: From ~4 hours/day to <15 minutes
2. **Improve Accuracy**: Achieve >99.5% data accuracy
3. **Enhance Feedback**: Daily performance feedback before next shift starts
4. **Increase Engagement**: >10% increase in foreman engagement and on-time starts

## Target Users
- **Field Crew Members**: Bilingual (EN/ES) mobile app users needing performance transparency
- **Foremen**: Team managers requiring real-time team performance metrics
- **Administrative Staff**: Need automated payroll processing with minimal manual work
- **Managers**: Require company-wide analytics and strategic insights

## Success Metrics
- Processing time: <15 minutes (from 4 hours)
- Data accuracy: >99.5%
- Feedback delivery: Before next shift starts
- Engagement: >10% increase in foreman engagement and on-time starts
- System uptime: 99.9% availability

## Project Scope
### In Scope
- Automated data collection (Service Autopilot, Paychex)
- P4P calculation engine (efficiency, bonuses, penalties)
- Web dashboards (Admin, Manager, Foreman roles)
- Bilingual mobile app (English/Spanish)
- Automated daily processing (10:30 AM cron job)
- CSV export for Paychex integration
- Notification system for all user roles
- Mock APIs for development/testing

### Out of Scope
- Third-party payroll integrations beyond Paychex (v1)
- Offline functionality in mobile app
- Custom hardware solutions
- On-premise installations

## Key Constraints
- Must handle ~50 employees daily
- Process data within 10 minutes
- Support bilingual interface (English/Spanish)
- Maintain data security and compliance
- Use mock data for development/testing

## Project Timeline
Development broken down into 25 Pull Requests covering:
1. Project setup & configuration
2. Database & authentication
3. Core calculation engine
4. Web dashboards (3 roles)
5. Mobile app (bilingual)
6. Automation & notifications
7. Testing, deployment, polish

## Project Status
**Current Phase:** Mobile App Development & Production Integration  
**Completed PRs:** #1-18, #24 (Setup, Database, Auth, Mock APIs, Calculation Engine, Payroll, Execution Logging, Notifications, User Management, Admin Dashboard, Manager Dashboard, Foreman Dashboard, Mobile App i18n, Mobile App Auth & Navigation, Mobile App Dashboard, Breakdown, History, Profile & Settings, Deployment Setup)  
**Recent Enhancements:** 
- Mobile app: All core screens implemented (Dashboard, Breakdown, History, Profile, Help)
- Backend deployed to Firebase Cloud Functions (production-ready)
- Fixed language update endpoint (403 error resolved)
- Mobile app connected to production API
- All screens fully bilingual (EN/ES)
- Manager dashboard with compliance metrics, Teams page with enhanced calculations, Analytics page simplified
- Foreman dashboard with compliance metrics, TeamMembers page with real data, History page simplified, Schedule page with validation
- MemberDetailModal fixed (Chart.js removed, real data display)
- Backend crew_id matching enhanced (handles CREW1/foreman1 mismatches)
- Backend API access expanded (foremen can access user endpoints for their crew)  
**Backend Progress:** 85% complete (includes unit tests, deployed to production)  
**Web Frontend Progress:** 80% complete (All dashboards enhanced with compliance features and real data)  
**Mobile Progress:** 85% complete (All core screens implemented, production-ready)  
**Testing:** 65 unit tests passing (calculation, user, data, notification, CSV export)  
**Next Steps:** PR #19 - Mobile App Notifications (in-app notifications screen)

