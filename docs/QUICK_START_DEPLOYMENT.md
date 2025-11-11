# Quick Start Deployment Guide

Deploy FieldPay Pro to Firebase in 15 minutes.

---

## 🎯 Prerequisites (5 min)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Create Firebase Project
Go to https://console.firebase.google.com/ and create a new project.

---

## 🚀 Deploy in 3 Steps (10 min)

### Step 1: Configure Firebase Project (2 min)

Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### Step 2: Set Environment Variables (5 min)

```bash
# Required variables - replace with your actual values
firebase functions:config:set supabase.url="https://your-project.supabase.co"
firebase functions:config:set supabase.key="your_supabase_anon_key"
firebase functions:config:set supabase.service_role_key="your_service_role_key"
firebase functions:config:set firebase.project_id="your-firebase-project-id"
firebase functions:config:set firebase.client_email="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
firebase functions:config:set app.node_env="production"
firebase functions:config:set app.use_mock="true"

# For Firebase private key (escape newlines):
firebase functions:config:set firebase.private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 3: Deploy (3 min)

```bash
# Deploy backend
cd backend
npm install
npm run deploy
cd ..

# Update frontend with API URL (copy from deployment output)
# Edit frontend-web/.env.production with your Functions URL

# Deploy frontend
cd frontend-web
npm install
npm run build
cd ..
firebase deploy --only hosting
```

---

## ✅ Verify Deployment (2 min)

### Test Backend
```bash
curl https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api/health
```

Should return:
```json
{"status":"ok","timestamp":"...","environment":"production","platform":"Firebase Cloud Functions"}
```

### Test Frontend
Open https://YOUR-PROJECT-ID.web.app and login.

### Update Mobile App
Edit `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api
```

Restart Expo:
```bash
cd mobile
npx expo start --clear
```

---

## 🎉 Done!

Your app is now deployed:
- **Backend API:** https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api
- **Web App:** https://YOUR-PROJECT-ID.web.app
- **Mobile App:** Connected to deployed backend

---

## 🆘 Troubleshooting

### Functions won't deploy
```bash
# Check you're logged in
firebase login

# Check project is linked
firebase use --add
```

### Environment variables not working
```bash
# View current config
firebase functions:config:get

# Re-set any missing variables
```

### Frontend can't reach API
- Check `frontend-web/.env.production` has correct URL
- Rebuild: `npm run build`
- Redeploy: `firebase deploy --only hosting`

---

## 📚 Next Steps

- Review full [Deployment Guide](./DEPLOYMENT.md)
- Complete [Production Checklist](./PRODUCTION_CHECKLIST.md)
- Set up monitoring in Firebase Console
- Train users on the system

