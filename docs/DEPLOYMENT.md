# Deployment Guide - FieldPay Pro

This guide covers deploying the Clean Scapes P4P System to Firebase (Cloud Functions + Hosting).

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- Supabase database set up
- Firebase Authentication configured

---

## 🚀 Quick Start Deployment

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Link to Your Firebase Project

```bash
# Initialize Firebase in the project root
firebase init

# Select:
# - Functions
# - Hosting
#
# When prompted:
# - Use existing project
# - JavaScript (not TypeScript)
# - ESLint: No
# - Install dependencies: Yes
# - Public directory: frontend-web/build
# - Single-page app: Yes
# - GitHub deploys: No (for now)
```

### 4. Update `.firebaserc` with Your Project ID

```json
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

---

## 📦 Backend Deployment (Firebase Cloud Functions)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Environment Variables

Firebase Cloud Functions uses Firebase config for environment variables:

```bash
# Supabase
firebase functions:config:set supabase.url="https://your-project.supabase.co"
firebase functions:config:set supabase.key="your_supabase_anon_key"
firebase functions:config:set supabase.service_role_key="your_service_role_key"

# Firebase Admin (use "env" namespace - "firebase" is reserved by Firebase)
firebase functions:config:set env.firebase_project_id="your-firebase-project-id"
firebase functions:config:set env.firebase_private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
firebase functions:config:set env.firebase_client_email="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"

# App Configuration
firebase functions:config:set app.node_env="production"
firebase functions:config:set app.use_mock="false"

# View all config
firebase functions:config:get
```

**Note:** For the private key, ensure you preserve the `\n` characters for line breaks.

### Step 3: Deploy Functions

```bash
# From project root
cd backend
npm run deploy

# Or use Firebase CLI directly
firebase deploy --only functions
```

### Step 4: Get Your Functions URL

After deployment, Firebase will show:
```
✔  Deploy complete!

Function URL (api): https://us-central1-your-project-id.cloudfunctions.net/api
```

**Save this URL** - you'll need it for the frontend and mobile app.

---

## 🌐 Frontend Deployment (Firebase Hosting)

### Step 1: Update Production Environment

Edit `frontend-web/.env.production`:

```env
REACT_APP_API_URL=https://us-central1-your-project-id.cloudfunctions.net/api
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Step 2: Build Frontend

```bash
cd frontend-web
npm install
npm run build
```

### Step 3: Deploy to Hosting

```bash
# From project root
firebase deploy --only hosting

# Or deploy both functions and hosting
firebase deploy
```

### Step 4: Access Your Web App

```
✔  Deploy complete!

Hosting URL: https://your-project-id.web.app
```

---

## 📱 Mobile App Configuration

Update `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://us-central1-your-project-id.cloudfunctions.net/api
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Restart Expo:
```bash
cd mobile
npx expo start --clear
```

---

## 🔍 Verification

### Test Backend API

```bash
# Health check
curl https://us-central1-your-project-id.cloudfunctions.net/api/health

# Should return:
# {"status":"ok","timestamp":"...","environment":"production","platform":"Firebase Cloud Functions"}
```

### Test Authentication

```bash
# Should return token missing error (expected)
curl https://us-central1-your-project-id.cloudfunctions.net/api/auth/verify

# Should return:
# {"success":false,"error":"Token missing"}
```

### Test Web App

1. Open `https://your-project-id.web.app`
2. Login with test credentials
3. Navigate through dashboards
4. Verify all features work

### Test Mobile App

1. Open Expo Go app
2. Scan QR code
3. Login with test credentials
4. Verify dashboard loads

---

## 🔄 Update Deployment

### Update Backend Only

```bash
cd backend
npm run deploy
```

### Update Frontend Only

```bash
cd frontend-web
npm run build
firebase deploy --only hosting
```

### Update Both

```bash
# Build frontend
cd frontend-web
npm run build
cd ..

# Deploy both
firebase deploy
```

---

## 📊 Monitoring & Logs

### View Function Logs

```bash
# Real-time logs
firebase functions:log

# Or view in Firebase Console
# https://console.firebase.google.com/project/your-project-id/functions
```

### View Hosting Logs

```bash
# View in Firebase Console
# https://console.firebase.google.com/project/your-project-id/hosting
```

---

## 🐛 Troubleshooting

### Functions Not Deploying

```bash
# Check Node version (should be 18)
node --version

# Clear cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
npm run deploy
```

### Environment Variables Not Working

```bash
# View current config
firebase functions:config:get

# Test locally with emulator
cd backend
firebase emulators:start --only functions
```

### Frontend Not Loading API Data

1. Check `frontend-web/.env.production` has correct API URL
2. Rebuild: `npm run build`
3. Redeploy: `firebase deploy --only hosting`
4. Check browser console for errors

### CORS Errors

The backend `index.js` has CORS enabled for all origins:
```javascript
app.use(cors({ origin: true }));
```

If issues persist, check Firebase Functions logs.

---

## 💰 Cost Estimation

### Firebase Free Tier Limits

- **Cloud Functions:**
  - 2M invocations/month
  - 400K GB-seconds, 200K GHz-seconds
  - 5GB outbound networking

- **Hosting:**
  - 10 GB storage
  - 360 MB/day data transfer

**For ~50 employees:**
- Estimated: 1,000-5,000 API calls/day
- Well within free tier limits

---

## 🔐 Security Checklist

- [ ] Environment variables set in Firebase Functions config
- [ ] Firebase Authentication rules configured
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enforced (automatic with Firebase)
- [ ] API keys not exposed in frontend code
- [ ] Admin routes protected with middleware
- [ ] CORS configured properly

---

## 📚 Additional Resources

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev)

---

## 🆘 Support

For issues or questions:
1. Check Firebase Console logs
2. Check Supabase logs
3. Review this deployment guide
4. Check project documentation in `/docs`

