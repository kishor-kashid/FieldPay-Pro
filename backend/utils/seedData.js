/**
 * Seed Data Script
 * Clean Scapes P4P System
 * 
 * This script populates the database with sample data for development and testing.
 * Run this after creating the database tables.
 */

require('dotenv').config({ path: '.env.local' });
const { supabase } = require('../config/database');

// Sample users data
const sampleUsers = [
  {
    email: 'admin@cleanscapes.com',
    role: 'admin',
    name: 'Admin User',
    employee_id: 'ADM001',
    preferred_language: 'en',
    base_rate: 0
  },
  {
    email: 'manager@cleanscapes.com',
    role: 'manager',
    name: 'Manager User',
    employee_id: 'MGR001',
    preferred_language: 'en',
    base_rate: 0
  },
  {
    email: 'foreman1@cleanscapes.com',
    role: 'foreman',
    name: 'John Foreman',
    employee_id: 'FRM001',
    crew_id: 'CREW1',
    preferred_language: 'en',
    base_rate: 25.00
  },
  {
    email: 'foreman2@cleanscapes.com',
    role: 'foreman',
    name: 'Carlos Foreman',
    employee_id: 'FRM002',
    crew_id: 'CREW2',
    preferred_language: 'es',
    base_rate: 25.00
  },
  {
    email: 'crew1@cleanscapes.com',
    role: 'crew_member',
    name: 'Maria Rodriguez',
    employee_id: 'EMP001',
    crew_id: 'CREW1',
    preferred_language: 'es',
    base_rate: 18.00
  },
  {
    email: 'crew2@cleanscapes.com',
    role: 'crew_member',
    name: 'Juan Martinez',
    employee_id: 'EMP002',
    crew_id: 'CREW1',
    preferred_language: 'es',
    base_rate: 18.00
  },
  {
    email: 'crew3@cleanscapes.com',
    role: 'crew_member',
    name: 'Mike Johnson',
    employee_id: 'EMP003',
    crew_id: 'CREW2',
    preferred_language: 'en',
    base_rate: 20.00
  },
  {
    email: 'crew4@cleanscapes.com',
    role: 'crew_member',
    name: 'Sarah Williams',
    employee_id: 'EMP004',
    crew_id: 'CREW2',
    preferred_language: 'en',
    base_rate: 19.00
  },
  {
    email: 'crew5@cleanscapes.com',
    role: 'crew_member',
    name: 'Miguel Hernandez',
    employee_id: 'EMP005',
    crew_id: 'CREW1',
    preferred_language: 'es',
    base_rate: 17.00
  },
  {
    email: 'crew6@cleanscapes.com',
    role: 'crew_member',
    name: 'Sofia Ramirez',
    employee_id: 'EMP006',
    crew_id: 'CREW1',
    preferred_language: 'es',
    base_rate: 18.00
  },
  {
    email: 'crew7@cleanscapes.com',
    role: 'crew_member',
    name: 'Diego Torres',
    employee_id: 'EMP007',
    crew_id: 'CREW2',
    preferred_language: 'es',
    base_rate: 17.50
  },
  {
    email: 'crew8@cleanscapes.com',
    role: 'crew_member',
    name: 'Isabella Flores',
    employee_id: 'EMP008',
    crew_id: 'CREW2',
    preferred_language: 'es',
    base_rate: 18.50
  },
  {
    email: 'crew9@cleanscapes.com',
    role: 'crew_member',
    name: 'Luis Morales',
    employee_id: 'EMP009',
    crew_id: 'CREW2',
    preferred_language: 'es',
    base_rate: 19.00
  },
  {
    email: 'crew10@cleanscapes.com',
    role: 'crew_member',
    name: 'Carmen Diaz',
    employee_id: 'EMP010',
    crew_id: 'CREW2',
    preferred_language: 'es',
    base_rate: 18.00
  }
];

// Sample jobs data
const sampleJobs = [
  {
    external_id: 'JOB001',
    date: new Date().toISOString().split('T')[0],
    crew_id: 'CREW1',
    service_type: 'Mowing',
    client: 'ABC Corporation',
    budgeted_hours: 2.0,
    actual_hours: 1.8,
    status: 'completed'
  },
  {
    external_id: 'JOB002',
    date: new Date().toISOString().split('T')[0],
    crew_id: 'CREW1',
    service_type: 'Trimming',
    client: 'XYZ Company',
    budgeted_hours: 1.5,
    actual_hours: 1.5,
    status: 'completed'
  },
  {
    external_id: 'JOB003',
    date: new Date().toISOString().split('T')[0],
    crew_id: 'CREW2',
    service_type: 'Full Service',
    client: 'DEF Industries',
    budgeted_hours: 4.0,
    actual_hours: 3.5,
    status: 'completed'
  }
];

/**
 * Seed users into the database
 */
async function seedUsers() {
  console.log('Seeding users...');
  
  for (const user of sampleUsers) {
    const { data, error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'email' });
    
    if (error) {
      console.error(`Error seeding user ${user.email}:`, error);
    } else {
      console.log(`✓ Seeded user: ${user.email}`);
    }
  }
}

/**
 * Seed jobs into the database
 */
async function seedJobs() {
  console.log('Seeding jobs...');
  
  for (const job of sampleJobs) {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job);
    
    if (error) {
      console.error(`Error seeding job ${job.external_id}:`, error);
    } else {
      console.log(`✓ Seeded job: ${job.external_id}`);
    }
  }
}

/**
 * Main seed function
 */
async function seed() {
  try {
    console.log('Starting database seeding...\n');
    
    await seedUsers();
    console.log('');
    
    await seedJobs();
    console.log('');
    
    console.log('✓ Database seeding completed!');
    
    // Optionally create Firebase users
    if (process.env.CREATE_FIREBASE_USERS === 'true') {
      console.log('\n' + '='.repeat(50));
      console.log('Creating Firebase Authentication accounts...');
      console.log('='.repeat(50) + '\n');
      
      const { createFirebaseUsers } = require('./createFirebaseUsers');
      await createFirebaseUsers();
    } else {
      console.log('\n💡 Tip: Set CREATE_FIREBASE_USERS=true in .env to create Firebase accounts');
      console.log('   Then run: node utils/createFirebaseUsers.js\n');
    }
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('\nSeeding process finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seed, seedUsers, seedJobs };

