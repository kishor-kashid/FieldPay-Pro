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
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing. Please check your .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
// For Expo, Firebase Auth automatically handles persistence
const auth = getAuth(app);

export { auth };
export default app;

