# November 2025 Sample Data Setup

This directory contains complete sample data for **November 1-10, 2025** with 10 crew members split into 2 crews.

## Overview

### Crew Distribution
- **Foreman 1's Crew** (4 members):
  - EMP-CREW-001: Juan Garcia
  - EMP-CREW-002: Maria Lopez
  - EMP-CREW-005: Miguel Hernandez
  - EMP-CREW-006: Sofia Ramirez

- **Foreman 2's Crew** (6 members):
  - EMP-CREW-003: Carlos Rodriguez
  - EMP-CREW-004: Ana Martinez
  - EMP-CREW-007: Diego Torres
  - EMP-CREW-008: Isabella Flores
  - EMP-CREW-009: Luis Morales
  - EMP-CREW-010: Carmen Diaz

### Data Included
- **Jobs**: 120 jobs (12 per day × 10 days)
- **Timesheets**: 100 timesheets (10 crew members × 10 days)
- **Date Range**: November 1-10, 2025

### Realistic Variations
The data includes realistic variations to test the P4P system:
- ✅ Some employees arrive late (7:15 AM vs 6:45 AM) → triggers late penalty
- ✅ Some take long lunch breaks (45 min vs 30 min) → triggers lunch penalty
- ✅ Varied work hours (8.0 to 8.25 hours)
- ✅ Different service types with varying budgeted hours
- ✅ Some jobs marked as requiring additional cleanup

## Setup Instructions

### Option 1: Using Admin Web UI (Recommended)

1. **Add New Crew Members First**
   ```bash
   # In Supabase SQL Editor, run:
   backend/migrations/002_add_crew_members.sql
   ```

2. **Upload Jobs CSV**
   - Log in to Admin dashboard
   - Go to **Upload** page
   - Upload `november_2025_jobs.csv` as Service Autopilot data
   - System will parse and store jobs

3. **Upload Timesheets CSV**
   - Still on **Upload** page
   - Upload `november_2025_timesheets.csv` as Paychex data
   - System will parse and store timesheets

4. **Process Payroll for Each Day**
   - Go to **Review** page
   - For each date (Nov 1-10):
     - Select the date
     - Click "Analyze Payroll"
     - Review the calculations
     - Click "Process Payroll" to save

### Option 2: Using API Endpoints

1. **Add New Crew Members**
   ```bash
   # Run SQL migration
   psql -h YOUR_DB_HOST -U postgres -d postgres -f backend/migrations/002_add_crew_members.sql
   ```

2. **Create Users in Firebase**
   ```bash
   # For each new crew member (crew5-crew10), create Firebase auth account
   # Use Admin UI "Users" page or Firebase Console
   ```

3. **Process Each Day via API**
   ```bash
   # Set your admin token
   TOKEN="your_firebase_admin_token"
   
   # Process each day
   for day in {01..10}; do
     curl -X POST http://localhost:5000/api/payroll/process \
       -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json" \
       -d "{\"date\": \"2025-11-${day}\"}"
   done
   ```

### Option 3: Direct Database Import

1. **Add Crew Members**
   ```sql
   -- Run: backend/migrations/002_add_crew_members.sql
   ```

2. **Import Jobs**
   ```sql
   -- In psql or Supabase SQL Editor:
   \copy jobs(external_id, date, crew_id, service_type, client, budgeted_hours, status, notes) 
   FROM 'mock-data/november_2025_jobs.csv' 
   WITH CSV HEADER;
   ```

3. **Import Timesheets** (requires UUID mapping)
   ```sql
   -- Create temp table
   CREATE TEMP TABLE temp_timesheets (
     employee_id VARCHAR(50),
     employee_name VARCHAR(255),
     date DATE,
     clock_in TIME,
     clock_out TIME,
     lunch_start TIME,
     lunch_end TIME,
     hours_worked DECIMAL(10,2),
     base_rate DECIMAL(10,2),
     crew_id VARCHAR(50),
     status VARCHAR(50)
   );
   
   -- Load CSV
   \copy temp_timesheets FROM 'mock-data/november_2025_timesheets.csv' WITH CSV HEADER;
   
   -- Insert with UUID mapping
   INSERT INTO timesheets (employee_id, date, clock_in, clock_out, lunch_start, lunch_end, total_hours)
   SELECT 
     u.id, t.date, t.clock_in, t.clock_out, t.lunch_start, t.lunch_end, t.hours_worked
   FROM temp_timesheets t
   JOIN users u ON u.employee_id = t.employee_id
   ON CONFLICT (employee_id, date) DO NOTHING;
   ```

4. **Process Payroll**
   ```bash
   # Use API or Admin UI to process each day
   ```

## Verification

After setup, verify the data:

### Check User Count
```sql
SELECT 
  role,
  COUNT(*) as count
FROM users
GROUP BY role;
```

Expected output:
```
role         | count
-------------|------
admin        | 1
manager      | 1
foreman      | 2
crew_member  | 10
```

### Check Crew Distribution
```sql
SELECT 
  crew_id,
  COUNT(*) as member_count,
  STRING_AGG(name, ', ' ORDER BY name) as members
FROM users 
WHERE role = 'crew_member'
GROUP BY crew_id;
```

Expected output:
```
crew_id   | member_count | members
----------|--------------|----------------------------------
foreman1  | 4            | Juan Garcia, Maria Lopez, ...
foreman2  | 6            | Ana Martinez, Carlos Rodriguez, ...
```

### Check Jobs Count
```sql
SELECT COUNT(*) FROM jobs WHERE date BETWEEN '2025-11-01' AND '2025-11-10';
```
Expected: **120 jobs**

### Check Timesheets Count
```sql
SELECT COUNT(*) FROM timesheets WHERE date BETWEEN '2025-11-01' AND '2025-11-10';
```
Expected: **100 timesheets**

### Check Payroll Records
```sql
SELECT 
  date,
  COUNT(*) as records,
  ROUND(AVG(efficiency_score) * 100, 2) as avg_efficiency,
  ROUND(SUM(total_pay), 2) as total_payout
FROM payroll_records
WHERE date BETWEEN '2025-11-01' AND '2025-11-10'
GROUP BY date
ORDER BY date;
```

## Expected Dashboard Metrics

Once all data is processed, your dashboards will show:

### Admin Dashboard
- **Total Employees**: 10 crew members
- **Pending Approval**: ~10-15 records (those with anomalies)
- **Daily Payout**: ~$1,400-$1,500 per day
- **Average Efficiency**: 85-95%

### Manager Dashboard
- **Total Employees**: 10
- **Active Crews**: 2
- **Avg Efficiency**: 85-95%
- **Top Performer**: Varies by day
- **Underperformers**: Those with efficiency < 80%

### Foreman Dashboards
- **Foreman 1**: 4 team members, varies by performance
- **Foreman 2**: 6 team members, varies by performance

### Reports & Analytics
- **10-day trend line**: Shows efficiency and payout variations
- **Crew comparison**: Foreman1 vs Foreman2
- **Performance distribution**: Bell curve of efficiency scores
- **Daily variations**: Realistic ups and downs

## Troubleshooting

### "Payroll already exists for this date"
```bash
# Use reprocess flag
curl -X POST http://localhost:5000/api/payroll/process \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"date": "2025-11-01", "reprocess": true}'
```

### "User not found" errors
- Make sure all 10 crew members are created in both:
  1. Database (users table)
  2. Firebase Authentication

### "No jobs found for date"
- Verify jobs CSV was uploaded correctly
- Check `external_id` format matches expectations
- Ensure `crew_id` values match foreman IDs

### Efficiency calculations seem off
- Verify `budgeted_hours` in jobs table
- Check `actual_hours` in timesheets
- Ensure job assignments link employees to jobs correctly

## Data Characteristics

### Service Types Distribution
- **Full Service**: 4.0 hours budgeted
- **Landscaping**: 6.0 hours budgeted
- **Maintenance**: 3.0 hours budgeted
- **Mowing**: 2.0 hours budgeted
- **Trimming & Edging**: 1.5 hours budgeted
- **Cleanup**: 1.0 hours budgeted

### Performance Patterns
- Most employees work 8.0 hours
- Some work 8.25 hours (varying patterns)
- Late arrivals: ~20% of timesheets
- Long lunches: ~15% of timesheets
- These patterns result in realistic efficiency scores and penalties

### Expected Payroll Breakdown per Day
- **Base Pay**: ~$1,440 (10 employees × 8 hrs × $18 avg)
- **Bonuses**: ~$50-100 (high performers)
- **Penalties**: ~$10-30 (late arrivals, long lunches)
- **Total Payout**: ~$1,400-$1,500

## Next Steps

1. ✅ Add 6 new crew members
2. ✅ Update mock data generator
3. ✅ Create November 2025 data files
4. 🔄 **Upload and process the data** (follow instructions above)
5. 🔄 **Verify dashboards display dynamic data**
6. 🔄 **Test filtering by date ranges**
7. 🔄 **Verify crew comparisons work correctly**

## Files in This Package

- `mock_users.json` - Updated with all 14 users (4 admin/manager/foreman + 10 crew)
- `november_2025_jobs.csv` - 120 jobs for Nov 1-10
- `november_2025_timesheets.csv` - 100 timesheets for Nov 1-10
- `NOVEMBER_2025_DATA_README.md` - This file
- `../backend/migrations/002_add_crew_members.sql` - SQL to add new crew members
- `../backend/migrations/003_seed_november_2025_data.sql` - SQL helper script
- `../backend/utils/mockDataGenerator.js` - Updated with all 10 crew members

## Support

If you encounter issues:
1. Check backend logs: `npm run dev` in `backend/` directory
2. Check frontend console for API errors
3. Verify Firebase authentication is working
4. Ensure database migrations ran successfully
5. Check that all environment variables are set correctly

