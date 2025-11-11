# Mock API Routes

This directory contains mock implementations of external APIs used by the Clean Scapes P4P system.

## Overview

During development, we use mock APIs to simulate Service Autopilot and Paychex without requiring actual API credentials. This allows for faster development, easier testing, and offline work.

## Configuration

Set `USE_MOCK=true` in your `.env` file to enable mock APIs.

```env
USE_MOCK=true
```

## Mock Service Autopilot API

**Base URL:** `http://localhost:3000/mock/service-autopilot`

### Endpoints

#### GET /mock/service-autopilot/jobs
Fetch job data for a specific date.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to yesterday.
- `crew_id` (optional): Filter jobs by crew ID.

**Example Request:**
```bash
GET /mock/service-autopilot/jobs?date=2024-11-10
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "job_id": "JOB-2024-11-10-001",
        "date": "2024-11-10",
        "location": "Oak Park Plaza",
        "service_type": "Full Service",
        "budgeted_hours": 4.0,
        "crew_id": "foreman1",
        "status": "completed",
        "notes": null
      }
    ],
    "total": 12,
    "date": "2024-11-10"
  },
  "meta": {
    "source": "mock_service_autopilot",
    "generated_at": "2024-11-11T10:00:00.000Z"
  }
}
```

#### GET /mock/service-autopilot/jobs/:job_id
Fetch specific job details.

**Example Request:**
```bash
GET /mock/service-autopilot/jobs/JOB-2024-11-10-001
```

#### GET /mock/service-autopilot/crews
Fetch list of all crews.

**Example Request:**
```bash
GET /mock/service-autopilot/crews
```

#### GET /mock/service-autopilot/assignments
Fetch job assignments (which employees worked which jobs).

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to yesterday.

**Example Request:**
```bash
GET /mock/service-autopilot/assignments?date=2024-11-10
```

## Mock Paychex API

**Base URL:** `http://localhost:3000/mock/paychex`

### Endpoints

#### GET /mock/paychex/timesheets
Fetch timesheet data for a specific date.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to yesterday.
- `employee_id` (optional): Filter timesheets by employee ID.

**Example Request:**
```bash
GET /mock/paychex/timesheets?date=2024-11-10
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "timesheets": [
      {
        "employee_id": "crew1",
        "employee_name": "Juan Garcia",
        "date": "2024-11-10",
        "clock_in": "2024-11-10T07:15:00.000Z",
        "clock_out": "2024-11-10T16:15:00.000Z",
        "lunch_start": "2024-11-10T12:00:00.000Z",
        "lunch_end": "2024-11-10T12:45:00.000Z",
        "hours_worked": 9,
        "base_rate": 18.00,
        "crew_id": "foreman1",
        "status": "approved"
      }
    ],
    "summary": {
      "total_employees": 4,
      "total_hours": 34,
      "total_cost": 612.50,
      "avg_hours": "8.50"
    },
    "date": "2024-11-10"
  },
  "meta": {
    "source": "mock_paychex",
    "generated_at": "2024-11-11T10:00:00.000Z"
  }
}
```

#### GET /mock/paychex/timesheets/:employee_id
Fetch specific employee's timesheet.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to yesterday.

**Example Request:**
```bash
GET /mock/paychex/timesheets/crew1?date=2024-11-10
```

#### GET /mock/paychex/employees
Fetch list of all employees.

**Example Request:**
```bash
GET /mock/paychex/employees
```

#### GET /mock/paychex/pay-rates
Fetch employee pay rates.

**Example Request:**
```bash
GET /mock/paychex/pay-rates
```

## Mock Data

The mock APIs generate realistic data based on:
- 4 crew members (2 per team)
- 2 foremen leading separate crews
- 12 jobs per day across various service types
- Varying performance metrics (some on-time, some late, varying efficiency)

### Sample Data Files

Sample CSV files are available in the `mock-data/` directory:
- `service_autopilot_jobs.csv` - Sample job data
- `paychex_timesheets.csv` - Sample timesheet data
- `mock_users.json` - Sample user data

## Testing the Mock APIs

### Using curl (bash/Linux/Mac):
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test mock Service Autopilot
curl http://localhost:3000/mock/service-autopilot/jobs

# Test mock Paychex
curl http://localhost:3000/mock/paychex/timesheets
```

### Using PowerShell (Windows):
```powershell
# Test health endpoint
Invoke-WebRequest -Uri http://localhost:3000/health | Select-Object -ExpandProperty Content

# Test mock Service Autopilot
Invoke-WebRequest -Uri http://localhost:3000/mock/service-autopilot/jobs | Select-Object -ExpandProperty Content

# Test mock Paychex
Invoke-WebRequest -Uri http://localhost:3000/mock/paychex/timesheets | Select-Object -ExpandProperty Content
```

## Data Service Abstraction

The `dataService.js` provides a unified interface for fetching data from either mock or real APIs:

```javascript
const { getJobData, getTimesheetData, getPayrollData } = require('../services/dataService');

// Fetch jobs (will use mock or real API based on USE_MOCK env var)
const jobs = await getJobData('2024-11-10');

// Fetch timesheets
const timesheets = await getTimesheetData('2024-11-10');

// Fetch all payroll data at once
const payrollData = await getPayrollData('2024-11-10');
```

## Switching to Real APIs

To switch from mock to real APIs:

1. Set `USE_MOCK=false` in `.env`
2. Configure real API credentials:
   ```env
   SERVICE_AUTOPILOT_API_URL=https://api.serviceautopilot.com/v1
   SERVICE_AUTOPILOT_API_KEY=your_api_key
   PAYCHEX_API_URL=https://api.paychex.com/v1
   PAYCHEX_API_KEY=your_api_key
   ```
3. Restart the server

No code changes required - the `dataService` will automatically use the real APIs.

