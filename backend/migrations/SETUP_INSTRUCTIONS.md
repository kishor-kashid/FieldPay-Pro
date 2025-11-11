# Database Setup Instructions

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project Name: `fieldpay-pro` (or your choice)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

## Step 2: Get Connection Details

1. In Supabase Dashboard, go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## Step 3: Update Environment Variables

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Step 4: Run Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click "New Query"
3. Open `backend/migrations/001_create_tables.sql`
4. Copy the entire SQL content
5. Paste into SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Verify tables were created in **Table Editor**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

## Step 5: Verify Tables

1. Go to Supabase Dashboard → **Table Editor**
2. Verify these tables exist:
   - ✅ users
   - ✅ jobs
   - ✅ timesheets
   - ✅ payroll_records
   - ✅ notifications
   - ✅ execution_logs

## Step 6: Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

This will populate the database with sample users and jobs for testing.

## Troubleshooting

### "Table already exists" error
- Tables may have been created already
- Check Table Editor to verify
- Safe to ignore if tables exist

### Connection errors
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check that project is active in Supabase Dashboard
- Ensure network allows connections to Supabase

### Migration fails
- Check SQL syntax in Supabase SQL Editor
- Verify you have proper permissions
- Check Supabase logs for detailed error messages

## Next Steps

After database setup is complete:
- ✅ PR #2 is done
- ➡️ Move to PR #3: Firebase Authentication Setup

## Test User Credentials

After running the seed script with Firebase user creation:
- All users have default password: **password123**
- Admin: `admin@cleanscapes.com` / `password123`
- Manager: `manager@cleanscapes.com` / `password123`
- Foremen: `foreman1@cleanscapes.com` / `password123`, `foreman2@cleanscapes.com` / `password123`
- Crew: `crew1@cleanscapes.com` / `password123`, etc.

**⚠️ IMPORTANT**: Change passwords in Firebase Console for production use!

