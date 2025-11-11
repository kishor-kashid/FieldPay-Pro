/**
 * Migration Runner
 * Helper script to run SQL migrations
 * 
 * Usage: node utils/runMigration.js [migration-file.sql]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/database');

async function runMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`📄 Running migration: ${migrationFile}`);
  console.log('⚠️  Note: Supabase client does not support raw SQL execution.');
  console.log('📝 Please run the migration manually:');
  console.log('   1. Go to Supabase Dashboard → SQL Editor');
  console.log(`   2. Copy contents of: ${migrationPath}`);
  console.log('   3. Paste and execute in SQL Editor\n');
  
  // For reference, show the SQL
  console.log('SQL Content:');
  console.log('─'.repeat(50));
  console.log(sql);
  console.log('─'.repeat(50));
}

// Main
const migrationFile = process.argv[2] || '001_create_tables.sql';
runMigration(migrationFile)
  .then(() => {
    console.log('\n✓ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

