/**
 * Firebase Configuration
 * Clean Scapes P4P System - Mobile App
 * 
 * Initializes Firebase for React Native using Expo.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// Note: For Expo, Firebase Auth persistence is handled automatically

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Validate configuration
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId;

if (!isFirebaseConfigured) {
  console.error('⚠️ Firebase configuration is missing. Please check your .env file.');
  console.error('Required variables:');
  console.error('  - EXPO_PUBLIC_FIREBASE_API_KEY');
  console.error('  - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  console.error('  - EXPO_PUBLIC_FIREBASE_PROJECT_ID');
}

// Initialize Firebase (will throw error if config is invalid)
let app;
let auth;

try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    // Initialize Firebase Authentication
    // For Expo, Firebase Auth automatically handles persistence
    auth = getAuth(app);
  } else {
    // Create a mock auth object to prevent crashes
    console.warn('⚠️ Firebase not configured. Authentication will not work.');
    auth = null;
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  auth = null;
}

export { auth };
export default app;

