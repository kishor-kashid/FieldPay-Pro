# Deployment Scripts

Automated scripts for deploying FieldPay Pro to Firebase.

---

## 📁 Scripts

### `deploy-all.sh`
Deploy both backend and frontend in one command.

```bash
./scripts/deploy-all.sh
```

**What it does:**
1. Installs backend dependencies
2. Deploys backend to Cloud Functions
3. Installs frontend dependencies
4. Builds frontend production bundle
5. Deploys frontend to Firebase Hosting

**Use when:** Full deployment or major updates

---

### `deploy-backend.sh`
Deploy only the backend API to Cloud Functions.

```bash
./scripts/deploy-backend.sh
```

**What it does:**
1. Installs backend dependencies
2. Deploys to Firebase Cloud Functions

**Use when:** Backend code changes only

---

### `deploy-frontend.sh`
Deploy only the frontend to Firebase Hosting.

```bash
./scripts/deploy-frontend.sh
```

**What it does:**
1. Installs frontend dependencies
2. Builds production bundle
3. Deploys to Firebase Hosting

**Use when:** Frontend code or UI changes only

---

## 🚀 Usage

### First Time Setup

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Update Project ID:**
   Edit `.firebaserc` with your Firebase project ID

4. **Set Environment Variables:**
   ```bash
   firebase functions:config:set supabase.url="your_url"
   firebase functions:config:set supabase.key="your_key"
   # ... (see docs/DEPLOYMENT.md for full list)
   ```

### Making Scripts Executable (Mac/Linux)

```bash
chmod +x scripts/deploy-*.sh
```

### Running on Windows

Use Git Bash or WSL:
```bash
bash scripts/deploy-all.sh
```

---

## 📝 Pre-Deployment Checklist

Before running deployment scripts:

- [ ] All tests passing: `npm test`
- [ ] Environment variables configured
- [ ] `.firebaserc` updated with project ID
- [ ] Production config files updated
- [ ] Changes committed to git
- [ ] Team notified of deployment

---

## 🔍 Verification

After deployment, verify:

```bash
# Test backend health
curl https://us-central1-YOUR-PROJECT.cloudfunctions.net/api/health

# Test frontend
open https://YOUR-PROJECT.web.app
```

---

## 🐛 Troubleshooting

### Permission Denied

```bash
chmod +x scripts/deploy-*.sh
```

### Firebase Not Logged In

```bash
firebase login
```

### Deployment Failed

Check logs:
```bash
firebase functions:log
```

View in Firebase Console:
https://console.firebase.google.com/project/YOUR-PROJECT/functions

---

## 📚 Documentation

For detailed deployment instructions, see:
- [Quick Start Guide](../docs/QUICK_START_DEPLOYMENT.md)
- [Full Deployment Guide](../docs/DEPLOYMENT.md)
- [Production Checklist](../docs/PRODUCTION_CHECKLIST.md)

