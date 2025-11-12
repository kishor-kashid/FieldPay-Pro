# Mobile App Commands Reference

This document contains all the essential commands for working with the FieldPay-Pro mobile app.

## 📋 Table of Contents

- [Initial Setup](#initial-setup)
- [Development](#development)
- [Dependency Management](#dependency-management)
- [Testing & Debugging](#testing--debugging)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)
- [Common Workflows](#common-workflows)

---

## Initial Setup

### First Time Setup

```bash
# Navigate to mobile directory
cd mobile

# Install all dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env with your configuration
# Add your API URL and Firebase credentials
```

### Environment Variables

Create a `.env` file in the `mobile` directory with:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

---

## Development

### Start Development Server

```bash
# Start Expo development server (default: LAN mode)
npm start
# or
npx expo start

# Start with tunnel (for devices on different networks)
npx expo start --tunnel

# Start with localhost only (for emulator)
npx expo start --localhost

# Start and clear cache
npx expo start --clear

# Start with tunnel and clear cache
npx expo start --tunnel --clear
```

### Platform-Specific Commands

```bash
# Open on Android emulator/device
npm run android
# or
npx expo start --android

# Open on iOS simulator/device
npm run ios
# or
npx expo start --ios

# Open in web browser
npm run web
# or
npx expo start --web
```

### Development Server Options

```bash
# Start with specific port
npx expo start --port 8082

# Start in production mode
npx expo start --no-dev

# Start without opening browser
npx expo start --no-open

# Start with specific host
npx expo start --host tunnel
npx expo start --host lan
npx expo start --host localhost
```

---

## Dependency Management

### Install Dependencies

```bash
# Install a new package (Expo will auto-select compatible version)
npx expo install <package-name>

# Install with legacy peer deps (if version conflicts occur)
npm install --legacy-peer-deps

# Install all dependencies
npm install
```

### Update Dependencies

```bash
# Check for dependency compatibility issues
npx expo install --fix

# Upgrade Expo SDK (manual method)
# 1. Edit package.json: change "expo": "~X.0.0" to "expo": "~Y.0.0"
# 2. Run:
npm install --legacy-peer-deps
npx expo install --fix

# Install specific Expo SDK version
npx expo install expo@~54.0.0
```

### Common Expo Packages

```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler

# Storage
npx expo install @react-native-async-storage/async-storage

# Status Bar
npx expo install expo-status-bar

# Animations
npx expo install react-native-reanimated

# Babel preset
npx expo install babel-preset-expo
```

---

## Testing & Debugging

### Run Diagnostics

```bash
# Check for common issues
npx expo-doctor

# Check environment setup
npx expo config --type public
```

### Clear Cache

```bash
# Clear Metro bundler cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Clear watchman cache (if installed)
watchman watch-del-all

# Clear all caches and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Debugging

```bash
# Start with verbose logging
npx expo start --verbose

# Open React Native debugger
# Press 'j' in Expo CLI to open debugger

# View logs
npx expo start --dev-client
```

---

## Build & Deployment

### Development Builds

```bash
# Build for Android (development)
npx expo run:android

# Build for iOS (development)
npx expo run:ios

# Build for web
npx expo export:web
```

### Production Builds (EAS Build)

```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both platforms
eas build --platform all

# Build with specific profile
eas build --platform android --profile production
```

### Preview Builds

```bash
# Create a preview build
eas build --platform android --profile preview

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

---

## Troubleshooting

### Common Issues

#### SDK Version Mismatch

```bash
# Error: "Project is incompatible with this version of Expo Go"
# Solution: Upgrade project to match Expo Go SDK version
# 1. Check Expo Go version in app store
# 2. Update package.json: "expo": "~54.0.0" (match SDK version)
# 3. Run:
npm install --legacy-peer-deps
npx expo install --fix
```

#### Missing Dependencies

```bash
# Error: "Cannot find module 'babel-preset-expo'"
npx expo install babel-preset-expo

# Error: "Cannot find module 'expo-status-bar'"
npx expo install expo-status-bar

# Fix all missing dependencies
npx expo install --fix
```

#### Network Connection Issues

```bash
# Use tunnel mode if LAN doesn't work
npx expo start --tunnel

# Use localhost for emulator
npx expo start --localhost

# Manual connection in Expo Go:
# 1. Open Expo Go app
# 2. Tap "Enter URL manually"
# 3. Enter: exp://10.0.2.2:8081 (Android emulator)
#    or: exp://localhost:8081 (iOS simulator)
```

#### Metro Bundler Errors

```bash
# Clear cache and restart
npx expo start --clear

# Reset Metro bundler
# Press 'r' in Expo CLI to reload
# Or press 'shift+r' to reload and clear cache
```

#### Node Version Warnings

```bash
# Warning: "Unsupported engine" (requires Node >=20.19.4)
# Solution: Update Node.js to latest LTS version
# Download from: https://nodejs.org/
```

### Reset Everything

```bash
# Complete reset (use with caution)
cd mobile
rm -rf node_modules
rm -rf .expo
rm package-lock.json
npm install
npx expo start --clear
```

---

## Common Workflows

### Daily Development Workflow

```bash
# 1. Start development server
cd mobile
npx expo start --clear

# 2. Open on device/emulator
# Press 'a' for Android
# Press 'i' for iOS
# Press 'w' for web

# 3. Make code changes
# App will auto-reload

# 4. Reload manually if needed
# Press 'r' in Expo CLI
```

### Adding a New Package

```bash
# 1. Install using Expo (recommended)
npx expo install <package-name>

# 2. If package not in Expo registry, use npm
npm install <package-name>

# 3. Check compatibility
npx expo install --fix

# 4. Restart development server
npx expo start --clear
```

### Upgrading Expo SDK

```bash
# 1. Check current SDK version
cat package.json | grep '"expo"'

# 2. Update package.json manually
# Change: "expo": "~49.0.0" to "expo": "~54.0.0"

# 3. Install new SDK
npm install --legacy-peer-deps

# 4. Fix all dependencies
npx expo install --fix

# 5. Check for breaking changes
npx expo-doctor

# 6. Test the app
npx expo start --clear
```

### Testing on Physical Device

```bash
# 1. Ensure device and computer are on same network
# 2. Start Expo with LAN mode
npx expo start

# 3. Scan QR code with Expo Go app
# OR use tunnel mode if networks differ
npx expo start --tunnel
```

### Testing on Emulator/Simulator

```bash
# Android Emulator
# 1. Start Android emulator
# 2. Run:
npx expo start --localhost
# 3. Press 'a' to open in emulator

# iOS Simulator (macOS only)
# 1. Start iOS simulator
# 2. Run:
npx expo start
# 3. Press 'i' to open in simulator
```

---

## Quick Reference

### Keyboard Shortcuts (in Expo CLI)

- `a` - Open on Android
- `i` - Open on iOS
- `w` - Open in web browser
- `r` - Reload app
- `shift+r` - Reload and clear cache
- `m` - Toggle menu
- `j` - Open debugger
- `c` - Clear console
- `?` - Show all commands

### Important Files

- `package.json` - Dependencies and scripts
- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration
- `.env` - Environment variables (not committed)
- `App.js` - Main app entry point

### Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable components
│   ├── screens/       # Screen components
│   ├── navigation/    # Navigation setup
│   ├── services/      # API services
│   ├── context/       # React Context providers
│   ├── i18n/          # Internationalization
│   ├── utils/         # Utility functions
│   └── config/        # Configuration files
├── App.js             # Root component
├── app.json           # Expo config
├── babel.config.js    # Babel config
├── package.json       # Dependencies
└── .env               # Environment variables
```

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Expo SDK 54 Release Notes](https://expo.dev/changelog/)

---

## Notes

- Always use `npx expo install` for Expo packages to ensure version compatibility
- Use `--legacy-peer-deps` flag if you encounter peer dependency conflicts
- Clear cache (`--clear`) when experiencing strange build errors
- Tunnel mode is slower but works across different networks
- LAN mode is faster but requires same network
- Localhost mode is best for emulators/simulators

---

**Last Updated:** November 2025  
**Expo SDK Version:** 54.0.0  
**React Native Version:** 0.81.5

