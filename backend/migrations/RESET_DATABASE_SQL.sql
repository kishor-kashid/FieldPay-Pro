-- Reset Database - Delete All Data
-- Run this in Supabase SQL Editor if the script fails
-- This deletes all data but keeps table structure

-- Delete in correct order (respecting foreign key constraints)
DELETE FROM payroll_records;
DELETE FROM execution_logs;
DELETE FROM notifications;
DELETE FROM timesheets;
DELETE FROM jobs;
DELETE FROM users;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM jobs) as jobs_count,
  (SELECT COUNT(*) FROM timesheets) as timesheets_count,
  (SELECT COUNT(*) FROM payroll_records) as payroll_records_count,
  (SELECT COUNT(*) FROM notifications) as notifications_count,
  (SELECT COUNT(*) FROM execution_logs) as execution_logs_count;

