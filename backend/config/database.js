/**
 * Supabase Database Configuration
 * Clean Scapes P4P System
 */

// Load environment variables (for local testing only, ignore errors in Cloud Functions)
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  // Ignore dotenv errors in Cloud Functions environment
}

const { createClient } = require('@supabase/supabase-js');

/**
 * Get environment variables from Firebase Functions config or process.env
 * This allows the code to work both locally and in Firebase Cloud Functions
 */
function getSupabaseConfig() {
  // Try to load Firebase Functions config (only available in Cloud Functions)
  let functionsConfig = {};
  try {
    const functions = require('firebase-functions');
    functionsConfig = functions.config();
  } catch (error) {
    // Not in Cloud Functions environment, use process.env
  }

  const url = functionsConfig.supabase?.url || process.env.SUPABASE_URL;
  const key = functionsConfig.supabase?.key || process.env.SUPABASE_KEY;

  // Validate required configuration
  if (!url) {
    throw new Error('SUPABASE_URL is required in environment variables or Firebase config');
  }

  if (!key) {
    throw new Error('SUPABASE_KEY is required in environment variables or Firebase config');
  }

  return { url, key };
}

// Create Supabase client
const config = getSupabaseConfig();
const supabaseUrl = config.url;
const supabaseKey = config.key;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected on first run)
      console.error('Database connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

module.exports = {
  supabase,
  testConnection
};

