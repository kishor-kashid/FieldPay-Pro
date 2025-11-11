import React, { useState } from 'react';
import { payrollAPI } from '../../services/api';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  const validateDateRange = () => {
    setDateError('');
    
    if (!dateRange.start || !dateRange.end) {
      setDateError('Please select both start and end dates');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const todayDate = new Date(today);

    // Check if dates are in the future
    if (startDate > todayDate) {
      setDateError('Start date cannot be in the future');
      return false;
    }

    if (endDate > todayDate) {
      setDateError('End date cannot be in the future');
      return false;
    }

    // Check if start date is before end date
    if (startDate > endDate) {
      setDateError('Start date must be before or equal to end date');
      return false;
    }

    return true;
  };

  const loadReportData = async () => {
    // Validate date range before loading
    if (!validateDateRange()) {
      return;
    }

    setLoading(true);
    setDateError('');
    try {
      // Fetch payroll records for the date range
      const recordsResponse = await payrollAPI.getRecords({
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      const records = recordsResponse.data?.records || [];

      if (records.length === 0) {
        setReportData(null);
        setLoading(false);
        return;
      }

      // Group records by date
      const dailyGroups = {};
      records.forEach(record => {
        const date = record.date;
        if (!dailyGroups[date]) {
          dailyGroups[date] = [];
        }
        dailyGroups[date].push(record);
      });

      // Calculate daily totals
      const dailyTotals = Object.keys(dailyGroups)
        .sort()
        .map(date => {
          const dayRecords = dailyGroups[date];
          const totalPay = dayRecords.reduce((sum, r) => sum + (r.total_pay || 0), 0);
          // Efficiency is not stored in payroll_records, so we'll set it to 0
          // In the future, this could be calculated from job completion data
          const avgEfficiency = 0;
          const uniqueEmployees = new Set(dayRecords.map(r => r.employee_id)).size;

          return {
            date,
            totalPay: Math.round(totalPay),
            avgEfficiency: Math.round(avgEfficiency),
            employees: uniqueEmployees
          };
        });

      setReportData({
        dailyTotals
      });
    } catch (error) {
      console.error('Failed to load report data:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Remove auto-loading - reports should only load when user clicks "Generate Report"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Performance trends and cost analysis</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date().toISOString().split('T')[0];
                
                if (selectedDate <= today) {
                  setDateRange({ ...dateRange, start: selectedDate });
                  setDateError(''); // Clear error when date changes
                }
              }}
              max={dateRange.end || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date().toISOString().split('T')[0];
                
                if (selectedDate <= today) {
                  setDateRange({ ...dateRange, end: selectedDate });
                  setDateError(''); // Clear error when date changes
                }
              }}
              min={dateRange.start}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReportData}
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
        {dateError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{dateError}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading report data...</p>
        </div>
      ) : !reportData ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-8">No data available for the selected date range</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Total Payout</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${reportData.dailyTotals.reduce((sum, d) => sum + d.totalPay, 0).toFixed(0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {(reportData.dailyTotals.reduce((sum, d) => sum + d.avgEfficiency, 0) / reportData.dailyTotals.length).toFixed(0)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.dailyTotals.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Avg Employees/Day</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {(reportData.dailyTotals.reduce((sum, d) => sum + d.employees, 0) / reportData.dailyTotals.length).toFixed(0)}
              </p>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Report</h3>
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export PDF
              </button>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Export Excel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

