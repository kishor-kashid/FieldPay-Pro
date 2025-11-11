/**
 * Firebase Admin SDK Configuration
 * Clean Scapes P4P System
 * 
 * Initializes Firebase Admin SDK for server-side authentication operations.
 */

// Load environment variables (for local testing only, ignore errors in Cloud Functions)
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  // Ignore dotenv errors in Cloud Functions environment
}

const admin = require('firebase-admin');

let firebaseApp = null;

/**
 * Get environment variables from Firebase Functions config or process.env
 * This allows the code to work both locally and in Firebase Cloud Functions
 */
function getEnvConfig() {
  // Try to load Firebase Functions config (only available in Cloud Functions)
  let functionsConfig = {};
  try {
    const functions = require('firebase-functions');
    functionsConfig = functions.config();
  } catch (error) {
    // Not in Cloud Functions environment, use process.env
  }

  return {
    projectId: functionsConfig.env?.firebase_project_id || process.env.FIREBASE_PROJECT_ID,
    privateKey: functionsConfig.env?.firebase_private_key || process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: functionsConfig.env?.firebase_client_email || process.env.FIREBASE_CLIENT_EMAIL,
  };
}

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  const config = getEnvConfig();

  // Validate required configuration
  if (!config.projectId || !config.privateKey || !config.clientEmail) {
    throw new Error('Firebase Admin SDK credentials not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env or Firebase config');
  }

  try {
    // Initialize Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        privateKey: config.privateKey.replace(/\\n/g, '\n'),
        clientEmail: config.clientEmail
      })
    });

    console.log('✅ Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Get Firebase Admin instance
 */
function getFirebaseAdmin() {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin;
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object>} Decoded token with user information
 */
async function verifyIdToken(idToken) {
  try {
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} Firebase user record
 */
async function getUserByEmail(email) {
  try {
    const admin = getFirebaseAdmin();
    const user = await admin.auth().getUserByEmail(email);
    return user;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * Create Firebase user
 * @param {Object} userData - User data (email, password, displayName, etc.)
 * @returns {Promise<Object>} Created Firebase user
 */
async function createUser(userData) {
  try {
    const admin = getFirebaseAdmin();
    const user = await admin.auth().createUser(userData);
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Set custom claims for a user
 * @param {string} uid - Firebase user UID
 * @param {Object} claims - Custom claims (role, employee_id, crew_id, etc.)
 */
async function setCustomClaims(uid, claims) {
  try {
    const admin = getFirebaseAdmin();
    await admin.auth().setCustomUserClaims(uid, claims);
  } catch (error) {
    throw error;
  }
}

/**
 * Delete Firebase user
 * @param {string} uid - Firebase user UID
 */
async function deleteUser(uid) {
  try {
    const admin = getFirebaseAdmin();
    await admin.auth().deleteUser(uid);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  verifyIdToken,
  getUserByEmail,
  createUser,
  setCustomClaims,
  deleteUser
};

