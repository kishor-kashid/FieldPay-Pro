-- ============================================
-- Clean Scapes P4P System - Comprehensive Database Schema
-- Migration: 000_comprehensive_schema.sql
-- Description: Creates all tables with all required fields
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'foreman', 'crew_member')),
  name VARCHAR(255) NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  crew_id VARCHAR(50),
  preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'es')),
  base_rate DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_crew_id ON users(crew_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(255),
  date DATE NOT NULL,
  crew_id VARCHAR(50),
  service_type VARCHAR(100),
  client VARCHAR(255),
  budgeted_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for jobs table
CREATE INDEX idx_jobs_date ON jobs(date);
CREATE INDEX idx_jobs_crew_id ON jobs(crew_id);
CREATE INDEX idx_jobs_external_id ON jobs(external_id);
CREATE INDEX idx_jobs_date_crew ON jobs(date, crew_id);

-- ============================================
-- TIMESHEETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  lunch_start TIME,
  lunch_end TIME,
  total_hours DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Indexes for timesheets table
CREATE INDEX idx_timesheets_employee_id ON timesheets(employee_id);
CREATE INDEX idx_timesheets_date ON timesheets(date);
CREATE INDEX idx_timesheets_employee_date ON timesheets(employee_id, date);

-- ============================================
-- PAYROLL_RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked DECIMAL(10, 2),
  base_rate DECIMAL(10, 2),
  base_pay DECIMAL(10, 2),
  late_penalty DECIMAL(10, 2) DEFAULT 0,
  long_lunch_penalty DECIMAL(10, 2) DEFAULT 0,
  penalties DECIMAL(10, 2) DEFAULT 0,
  total_pay DECIMAL(10, 2),
  has_anomalies BOOLEAN DEFAULT FALSE,
  anomaly_flags TEXT[],
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'pending_review', 'calculated')),
  approved BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  crew_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Indexes for payroll_records table
CREATE INDEX idx_payroll_records_employee_id ON payroll_records(employee_id);
CREATE INDEX idx_payroll_records_date ON payroll_records(date);
CREATE INDEX idx_payroll_records_status ON payroll_records(status);
CREATE INDEX idx_payroll_records_employee_date ON payroll_records(employee_id, date);
CREATE INDEX idx_payroll_records_date_status ON payroll_records(date, status);
CREATE INDEX idx_payroll_records_crew_id ON payroll_records(crew_id);
CREATE INDEX idx_payroll_records_has_anomalies ON payroll_records(has_anomalies);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- EXECUTION_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  records_processed INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'processing')),
  error_message TEXT,
  triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_reprocess BOOLEAN DEFAULT FALSE,
  original_execution_id UUID REFERENCES execution_logs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for execution_logs table
CREATE INDEX idx_execution_logs_execution_date ON execution_logs(execution_date);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);
CREATE INDEX idx_execution_logs_triggered_by ON execution_logs(triggered_by);
CREATE INDEX idx_execution_logs_is_reprocess ON execution_logs(is_reprocess);
CREATE INDEX idx_execution_logs_created_at ON execution_logs(created_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_records_updated_at BEFORE UPDATE ON payroll_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Clean Scapes P4P Database Schema created successfully!';
  RAISE NOTICE 'Tables created: users, jobs, timesheets, payroll_records, notifications, execution_logs';
END $$;

