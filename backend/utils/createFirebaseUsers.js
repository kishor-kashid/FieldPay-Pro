/**
 * Firebase User Creation Script
 * Clean Scapes P4P System
 * 
 * This script creates Firebase Authentication accounts for all users in the database.
 * Uses default password "password123" for development/testing.
 * 
 * Usage: node utils/createFirebaseUsers.js
 * 
 * Environment Variables:
 * - CREATE_FIREBASE_USERS=true (enable Firebase user creation)
 * - FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL (Firebase Admin SDK)
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const { supabase } = require('../config/database');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;
  
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('❌ Firebase Admin SDK credentials not configured');
    console.error('   Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env');
    process.exit(1);
  }
  
  try {
    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized\n');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

/**
 * Create Firebase Auth user for a database user
 */
async function createFirebaseUser(user) {
  try {
    // Check if user already exists in Firebase
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(user.email);
      console.log(`⏭️  User already exists in Firebase: ${user.email}`);
      return { exists: true, uid: firebaseUser.uid };
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Create new Firebase user
    const defaultPassword = 'password123';
    firebaseUser = await admin.auth().createUser({
      email: user.email,
      password: defaultPassword,
      displayName: user.name,
      disabled: false
    });
    
    console.log(`✅ Created Firebase user: ${user.email} (UID: ${firebaseUser.uid})`);
    
    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(firebaseUser.uid, {
      role: user.role,
      employee_id: user.employee_id,
      crew_id: user.crew_id || null
    });
    
    console.log(`   ✓ Set custom claims: role=${user.role}`);
    
    return { exists: false, uid: firebaseUser.uid };
  } catch (error) {
    console.error(`❌ Error creating Firebase user ${user.email}:`, error.message);
    return { error: error.message };
  }
}

/**
 * Get all users from database
 */
async function getDatabaseUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('email');
  
  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Main function to create Firebase users
 */
async function createFirebaseUsers() {
  if (process.env.CREATE_FIREBASE_USERS !== 'true') {
    console.log('⚠️  CREATE_FIREBASE_USERS is not set to "true"');
    console.log('   Set CREATE_FIREBASE_USERS=true in .env to enable Firebase user creation\n');
    return;
  }
  
  initializeFirebase();
  
  console.log('📋 Fetching users from database...');
  const users = await getDatabaseUsers();
  
  if (users.length === 0) {
    console.log('⚠️  No users found in database. Run seed script first: npm run seed');
    return;
  }
  
  console.log(`Found ${users.length} users in database\n`);
  console.log('🔐 Creating Firebase Authentication accounts...');
  console.log('   Default password: password123\n');
  
  const results = {
    created: 0,
    existing: 0,
    errors: 0
  };
  
  for (const user of users) {
    const result = await createFirebaseUser(user);
    
    if (result.error) {
      results.errors++;
    } else if (result.exists) {
      results.existing++;
    } else {
      results.created++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${results.created}`);
  console.log(`   ⏭️  Already exists: ${results.existing}`);
  console.log(`   ❌ Errors: ${results.errors}`);
  console.log('='.repeat(50));
  console.log('\n💡 Default password for all users: password123');
  console.log('   Change passwords in Firebase Console for production!\n');
}

// Run if called directly
if (require.main === module) {
  createFirebaseUsers()
    .then(() => {
      console.log('✓ Firebase user creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Firebase user creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createFirebaseUsers, createFirebaseUser, initializeFirebase };

