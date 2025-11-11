/**
 * Comprehensive Database Setup Script
 * 
 * This script does everything in one go:
 * 1. Deletes all previous data from database
 * 2. Seeds users
 * 3. Creates Firebase Authentication accounts (if enabled)
 * 4. Processes payroll for a date range (configurable)
 * 5. Marks previous dates as approved/paid
 * 
 * Usage: npm run setup-db
 * 
 * Environment Variables:
 * - CREATE_FIREBASE_USERS=true (to create Firebase accounts)
 * - USE_MOCK=true (to use mock APIs for payroll processing)
 */

require('dotenv').config({ path: '.env' });
const { supabase } = require('../config/database');
const { seedUsers } = require('../utils/seedData');
const { createFirebaseUsers } = require('../utils/createFirebaseUsers');
const { processPayroll } = require('../services/payrollService');
const { getUserByEmail } = require('../services/userService');

// Configuration
const CONFIG = {
  // Date range for payroll processing (YYYY-MM-DD format)
  // Set to null to skip payroll processing
  PAYROLL_START_DATE: '2025-11-01',
  PAYROLL_END_DATE: '2025-11-09', // or use yesterday: null
  
  // Number of days to process (if PAYROLL_END_DATE is null, calculates from start date)
  PAYROLL_DAYS: 9,
  
  // Mark previous dates as approved/paid
  MARK_PREVIOUS_AS_PAID: true,
  
  // Create Firebase users
  CREATE_FIREBASE_USERS: process.env.CREATE_FIREBASE_USERS === 'true'
};

/**
 * Delete all data from database
 */
async function deleteAllData() {
  console.log('🗑️  Step 1: Deleting all data from database...\n');
  console.log('   Note: If this fails, run RESET_DATABASE_SQL.sql in Supabase SQL Editor\n');
  
  try {
    const deleteTable = async (tableName) => {
      let deleted = 0;
      let hasMore = true;
      
      while (hasMore) {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1000);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          hasMore = false;
          break;
        }
        
        const ids = data.map(r => r.id);
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .in('id', ids);
        
        if (deleteError) throw deleteError;
        
        deleted += ids.length;
        process.stdout.write(`\r   Deleting ${tableName}... ${deleted} records`);
      }
      
      if (deleted > 0) {
        console.log(`\r   ✅ Deleted ${tableName}: ${deleted} records`);
      } else {
        console.log(`   ✅ ${tableName}: Already empty`);
      }
    };
    
    await deleteTable('payroll_records');
    await deleteTable('execution_logs');
    await deleteTable('notifications');
    await deleteTable('timesheets');
    await deleteTable('jobs');
    await deleteTable('users');
    
    console.log('\n✅ All data deleted successfully!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Error deleting data:', error);
    console.error('\n💡 Alternative: Run RESET_DATABASE_SQL.sql in Supabase SQL Editor');
    throw error;
  }
}

/**
 * Seed users into database
 */
async function seedUsersData() {
  console.log('🌱 Step 2: Seeding users...\n');
  
  try {
    await seedUsers();
    console.log('✅ Users seeded successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

/**
 * Create Firebase Authentication accounts
 */
async function createFirebaseAccounts() {
  if (!CONFIG.CREATE_FIREBASE_USERS) {
    console.log('⏭️  Step 3: Skipping Firebase user creation');
    console.log('   (Set CREATE_FIREBASE_USERS=true in .env to enable)\n');
    return true;
  }
  
  console.log('🔐 Step 3: Creating Firebase Authentication accounts...\n');
  
  try {
    await createFirebaseUsers();
    console.log('✅ Firebase users created successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Error creating Firebase users:', error);
    // Don't throw - Firebase creation is optional
    console.log('⚠️  Continuing without Firebase users...\n');
    return false;
  }
}

/**
 * Generate date range for payroll processing
 */
function generateDateRange() {
  if (!CONFIG.PAYROLL_START_DATE) {
    return [];
  }
  
  const startDate = new Date(CONFIG.PAYROLL_START_DATE);
  let endDate;
  
  if (CONFIG.PAYROLL_END_DATE) {
    endDate = new Date(CONFIG.PAYROLL_END_DATE);
  } else {
    // Calculate end date from start date + number of days
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (CONFIG.PAYROLL_DAYS - 1));
  }
  
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Process payroll for date range
 */
async function processPayrollData() {
  const dates = generateDateRange();
  
  if (dates.length === 0) {
    console.log('⏭️  Step 4: Skipping payroll processing (no date range configured)\n');
    return { success: 0, failed: 0, errors: [] };
  }
  
  console.log(`📊 Step 4: Processing payroll for ${dates.length} dates...`);
  console.log(`   Date range: ${dates[0]} to ${dates[dates.length - 1]}\n`);
  
  try {
    // Get admin user ID
    const adminUser = await getUserByEmail('admin@cleanscapes.com');
    if (!adminUser) {
      throw new Error('Admin user not found. Please check seed data.');
    }
    const adminUserId = adminUser.id;
    console.log(`   👤 Using admin user ID: ${adminUserId}\n`);
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const date of dates) {
      try {
        console.log(`   📅 Processing ${date}...`);
        
        // Process payroll with reprocess option to overwrite if exists
        const result = await processPayroll(date, adminUserId, { reprocess: true });
        
        if (result.success) {
          const recordCount = result.summary?.successful_calculations || 0;
          const totalPayout = result.summary?.total_payout || 0;
          console.log(`      ✅ ${recordCount} records created, Total: $${totalPayout.toFixed(2)}`);
          results.success++;
        } else {
          console.log(`      ❌ ${result.error}`);
          results.failed++;
          results.errors.push({ date, error: result.error });
        }
      } catch (error) {
        console.error(`      ❌ ${error.message}`);
        results.failed++;
        results.errors.push({ date, error: error.message });
      }
    }
    
    console.log('\n   📊 Payroll Processing Summary:');
    console.log(`      ✅ Success: ${results.success} days`);
    console.log(`      ❌ Failed: ${results.failed} days`);
    if (results.errors.length > 0) {
      console.log('\n      Errors:');
      results.errors.forEach(({ date, error }) => {
        console.log(`        - ${date}: ${error}`);
      });
    }
    console.log('');
    
    return results;
  } catch (error) {
    console.error('❌ Error processing payroll:', error);
    throw error;
  }
}

/**
 * Mark previous dates as approved/paid
 */
async function markPreviousDatesAsPaid() {
  if (!CONFIG.MARK_PREVIOUS_AS_PAID) {
    console.log('⏭️  Step 5: Skipping marking previous dates as paid\n');
    return { updated_count: 0 };
  }
  
  console.log('✅ Step 5: Marking previous dates as approved/paid...\n');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    
    console.log(`   📅 Marking all records before ${todayString} as approved...`);
    
    const { data, error } = await supabase
      .from('payroll_records')
      .update({
        status: 'approved',
        approved: true,
        updated_at: new Date().toISOString()
      })
      .lt('date', todayString)
      .select();
    
    if (error) {
      throw error;
    }
    
    const updatedCount = data ? data.length : 0;
    console.log(`   ✅ Marked ${updatedCount} records as approved/paid`);
    
    // Show summary by date
    if (data && data.length > 0) {
      const datesCount = {};
      data.forEach(record => {
        const date = record.date;
        datesCount[date] = (datesCount[date] || 0) + 1;
      });
      
      console.log('\n   📊 Summary by date:');
      Object.keys(datesCount).sort().forEach(date => {
        console.log(`      ${date}: ${datesCount[date]} records`);
      });
    }
    
    console.log('');
    return { updated_count: updatedCount };
  } catch (error) {
    console.error('❌ Error marking previous dates as paid:', error);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('='.repeat(70));
  console.log('🚀 COMPREHENSIVE DATABASE SETUP');
  console.log('='.repeat(70));
  console.log('\n⚠️  This will:');
  console.log('   1. DELETE ALL DATA from database');
  console.log('   2. Seed users');
  if (CONFIG.CREATE_FIREBASE_USERS) {
    console.log('   3. Create Firebase Authentication accounts');
  } else {
    console.log('   3. Skip Firebase user creation (set CREATE_FIREBASE_USERS=true to enable)');
  }
  if (CONFIG.PAYROLL_START_DATE) {
    console.log(`   4. Process payroll for ${CONFIG.PAYROLL_START_DATE} to ${CONFIG.PAYROLL_END_DATE || 'calculated'}`);
  } else {
    console.log('   4. Skip payroll processing (configure PAYROLL_START_DATE to enable)');
  }
  if (CONFIG.MARK_PREVIOUS_AS_PAID) {
    console.log('   5. Mark previous dates as approved/paid');
  } else {
    console.log('   5. Skip marking previous dates as paid');
  }
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // Step 1: Delete all data
    await deleteAllData();
    
    // Step 2: Seed users
    await seedUsersData();
    
    // Step 3: Create Firebase users (if enabled)
    await createFirebaseAccounts();
    
    // Step 4: Process payroll
    const payrollResults = await processPayrollData();
    
    // Step 5: Mark previous dates as paid
    const paidResults = await markPreviousDatesAsPaid();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Final summary
    console.log('='.repeat(70));
    console.log('✅ DATABASE SETUP COMPLETED!');
    console.log('='.repeat(70));
    console.log('\n📋 Summary:');
    console.log(`   ⏱️  Total time: ${duration} seconds`);
    console.log(`   👥 Users: Seeded`);
    if (CONFIG.CREATE_FIREBASE_USERS) {
      console.log(`   🔐 Firebase Users: Created`);
    }
    if (CONFIG.PAYROLL_START_DATE) {
      console.log(`   📊 Payroll Records: ${payrollResults.success} days processed`);
    }
    if (CONFIG.MARK_PREVIOUS_AS_PAID) {
      console.log(`   ✅ Approved Records: ${paidResults.updated_count} records marked as paid`);
    }
    console.log('\n💡 Next Steps:');
    console.log('   - Login with admin@cleanscapes.com / password123');
    console.log('   - Process daily payroll using Admin Dashboard');
    console.log('   - Mock APIs will generate data on-the-fly for daily processing');
    console.log('');
    
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ DATABASE SETUP FAILED!');
    console.error('='.repeat(70));
    console.error('\nError:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Check database connection in .env');
    console.error('   - Verify Supabase credentials');
    console.error('   - Run RESET_DATABASE_SQL.sql manually if needed');
    console.error('');
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  setupDatabase,
  deleteAllData,
  seedUsersData,
  createFirebaseAccounts,
  processPayrollData,
  markPreviousDatesAsPaid
};

