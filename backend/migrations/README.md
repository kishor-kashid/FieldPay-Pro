# Database Migrations

This directory contains SQL migration files for setting up the Clean Scapes P4P System database.

## Migration Files

- `001_create_tables.sql` - Creates all required tables, indexes, and triggers

## How to Run Migrations

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `001_create_tables.sql`
4. Run the SQL script

### Option 2: Using Supabase CLI
```bash
supabase db push
```

### Option 3: Using psql
```bash
psql -h your-db-host -U postgres -d postgres -f backend/migrations/001_create_tables.sql
```

## Tables Created

1. **users** - User accounts with roles
2. **jobs** - Service Autopilot job data
3. **timesheets** - Paychex timesheet data
4. **payroll_records** - Calculated payroll results
5. **notifications** - In-app notifications
6. **execution_logs** - Payroll processing execution history

## Notes

- All tables use UUID primary keys
- Foreign key relationships are set up
- Unique constraints prevent duplicate records
- Indexes are created for performance
- Triggers automatically update `updated_at` timestamps

