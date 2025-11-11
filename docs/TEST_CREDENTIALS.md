# Test User Credentials
## Clean Scapes P4P System

This document contains test user credentials for development and testing.

## ⚠️ Security Warning

**These credentials are for DEVELOPMENT/TESTING ONLY!**

- Default password is used for all test users
- Change all passwords before production deployment
- Never commit actual production credentials

## Default Password

All test users have the default password: **`password123`**

## Test Users

### Admin
- **Email**: `admin@cleanscapes.com`
- **Password**: `password123`
- **Role**: Admin
- **Access**: Full system access

### Manager
- **Email**: `manager@cleanscapes.com`
- **Password**: `password123`
- **Role**: Manager
- **Access**: Analytics and reports

### Foremen

#### Foreman 1 (English)
- **Email**: `foreman1@cleanscapes.com`
- **Password**: `password123`
- **Role**: Foreman
- **Crew**: CREW1
- **Language**: English

#### Foreman 2 (Spanish)
- **Email**: `foreman2@cleanscapes.com`
- **Password**: `password123`
- **Role**: Foreman
- **Crew**: CREW2
- **Language**: Spanish

### Crew Members

#### Crew 1 (Spanish)
- **Email**: `crew1@cleanscapes.com`
- **Password**: `password123`
- **Role**: Crew Member
- **Crew**: CREW1
- **Name**: Maria Rodriguez
- **Language**: Spanish

#### Crew 2 (Spanish)
- **Email**: `crew2@cleanscapes.com`
- **Password**: `password123`
- **Role**: Crew Member
- **Crew**: CREW1
- **Name**: Juan Martinez
- **Language**: Spanish

#### Crew 3 (English)
- **Email**: `crew3@cleanscapes.com`
- **Password**: `password123`
- **Role**: Crew Member
- **Crew**: CREW2
- **Name**: Mike Johnson
- **Language**: English

#### Crew 4 (English)
- **Email**: `crew4@cleanscapes.com`
- **Password**: `password123`
- **Role**: Crew Member
- **Crew**: CREW2
- **Name**: Sarah Williams
- **Language**: English

## How to Create These Users

### Option 1: Automatic (Recommended)

1. Set in `.env`:
   ```env
   CREATE_FIREBASE_USERS=true
   ```

2. Run seed script:
   ```bash
   npm run seed
   ```
   
   This will:
   - Create users in database
   - Create Firebase Auth accounts
   - Set default password for all

### Option 2: Manual

1. Run database seed:
   ```bash
   npm run seed
   ```

2. Create Firebase users separately:
   ```bash
   npm run create-firebase-users
   ```

### Option 3: Firebase Console

1. Go to Firebase Console → Authentication
2. Add users manually with emails above
3. Set password: `password123`
4. Set custom claims for roles (admin, manager, etc.)

## Changing Passwords

### For Individual Users
1. Go to Firebase Console → Authentication
2. Find user by email
3. Click "Reset Password" or "Change Password"

### For All Users (Bulk)
Use Firebase Admin SDK script to update passwords programmatically.

## Production Checklist

Before deploying to production:
- [ ] Change all default passwords
- [ ] Remove or secure this file
- [ ] Set up proper password policies
- [ ] Enable 2FA for admin accounts
- [ ] Review and update user roles
- [ ] Remove test users if not needed

