# Mock Data Files

This directory contains sample data files for the Clean Scapes P4P system development and testing.

## Files

### service_autopilot_jobs.csv
Sample job data from Service Autopilot system.

**Columns:**
- `job_id`: Unique job identifier (format: JOB-YYYY-MM-DD-###)
- `date`: Job date (YYYY-MM-DD)
- `location`: Job site location
- `service_type`: Type of service performed
- `budgeted_hours`: Expected hours to complete the job
- `crew_id`: Crew/foreman assigned to the job
- `status`: Job status (completed, in_progress, etc.)
- `notes`: Optional notes about the job

### paychex_timesheets.csv
Sample timesheet data from Paychex system.

**Columns:**
- `employee_id`: Unique employee identifier
- `employee_name`: Employee full name
- `date`: Work date (YYYY-MM-DD)
- `clock_in`: Clock-in timestamp (ISO 8601)
- `clock_out`: Clock-out timestamp (ISO 8601)
- `lunch_start`: Lunch break start time (ISO 8601)
- `lunch_end`: Lunch break end time (ISO 8601)
- `hours_worked`: Total hours worked
- `base_rate`: Employee's base hourly rate
- `crew_id`: Crew/foreman the employee belongs to
- `status`: Timesheet status (approved, pending, etc.)

### mock_users.json
Sample user data for all role types.

**Structure:**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@cleanscapes.com",
      "role": "admin|manager|foreman|crew_member",
      "name": "Full Name",
      "employee_id": "EMP-XXX-###",
      "crew_id": "crew_identifier",
      "preferred_language": "en|es",
      "base_rate": 0.00,
      "created_at": "timestamp"
    }
  ],
  "metadata": {
    "description": "Description of the data",
    "total_users": 8,
    "roles": { "admin": 1, "manager": 1, "foreman": 2, "crew_member": 4 },
    "default_password": "password123"
  }
}
```

## User Roles

The mock data includes 8 users across 4 role types:

### Admin (1 user)
- **Email:** admin@cleanscapes.com
- **Access:** Full system access, payroll approval, user management
- **Role in P4P:** Process and approve payroll, manage system settings

### Manager (1 user)
- **Email:** manager@cleanscapes.com
- **Access:** Company-wide analytics and reports
- **Role in P4P:** View performance metrics, analyze trends

### Foremen (2 users)
- **Email:** foreman1@cleanscapes.com, foreman2@cleanscapes.com
- **Access:** Team management, crew member performance
- **Role in P4P:** Monitor team performance, motivate crew members

### Crew Members (4 users)
- **Email:** crew1-4@cleanscapes.com
- **Access:** Own performance data only (mobile app)
- **Role in P4P:** View personal performance scores and payouts

## Crews

The mock data includes 2 crews:

### Team Alpha (foreman1)
- Foreman: Roberto Santos
- Members: Juan Garcia (crew1), Maria Lopez (crew2)

### Team Bravo (foreman2)
- Foreman: David Chen
- Members: Carlos Rodriguez (crew3), Ana Martinez (crew4)

## Mock Data Characteristics

The mock data is designed to test various scenarios:

### Performance Variations
- **High Performers:** Some employees consistently meet or exceed efficiency targets
- **Average Performers:** Some employees perform at 90-100% efficiency
- **Low Performers:** Some days have efficiency below 90% (triggers alerts)

### Penalty Scenarios
- **Late Clock-in:** Some employees clock in after 7:00 AM (penalty applied)
- **Long Lunch:** Some employees take lunch breaks > 30 minutes (penalty applied)
- **On-time:** Some employees arrive on time and take appropriate lunch breaks

### Job Variations
- **Service Types:** Full Service, Mowing, Trimming, Cleanup, Landscaping, Maintenance
- **Budgeted Hours:** Range from 1 hour (Cleanup) to 6 hours (Landscaping)
- **Crew Distribution:** Jobs distributed between both crews

## Using Mock Data

### In Development
The backend mock APIs automatically generate this data on-demand when `USE_MOCK=true` is set in the environment.

### In Testing
These CSV files can be used to test CSV upload functionality in the admin dashboard.

### In Database Seeding
The `mock_users.json` file provides reference data for database seeding scripts.

## Default Credentials

All mock users share the same default password for development:
- **Password:** `password123`

⚠️ **Security Note:** In production, users must be required to change their password on first login.

## Generating New Mock Data

To generate new mock data for different dates, use the mock API endpoints:

```bash
# Generate jobs for a specific date
GET /mock/service-autopilot/jobs?date=2024-11-15

# Generate timesheets for a specific date
GET /mock/paychex/timesheets?date=2024-11-15
```

The mock data generator in `backend/utils/mockDataGenerator.js` can also be used programmatically:

```javascript
const { generateMockDataForDate } = require('./utils/mockDataGenerator');

const mockData = generateMockDataForDate(new Date('2024-11-15'));
console.log(mockData);
```

## Notes

- Dates in CSV files use ISO 8601 format for timestamps
- All monetary values are in USD
- Hours are represented as decimal numbers (e.g., 8.5 hours = 8 hours 30 minutes)
- Mock data is consistent across API calls for the same date

