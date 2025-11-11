import React, { useState } from 'react';
import { payrollAPI, userAPI } from '../../services/api';

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [insights, setInsights] = useState(null);

  // Remove auto-loading - analytics should only load when user clicks "Update Analysis"

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

  const loadAnalyticsData = async () => {
    // Validate date range before loading
    if (!validateDateRange()) {
      return;
    }

    try {
      setLoading(true);
      setDateError('');
      
      // Load insights
      await loadInsights();
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      // Get summary for date range
      const recordsResponse = await payrollAPI.getRecords({
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      const records = recordsResponse.data?.records || [];
      
      if (records.length === 0) {
        setInsights(null);
        return;
      }
      
      // Calculate highest payout (efficiency not stored)
      const maxPayout = Math.max(...records.map(r => r.total_pay || 0));
      const maxRecord = records.find(r => (r.total_pay || 0) === maxPayout);
      
      // Calculate average payout
      const avgPayout = records.reduce((sum, r) => sum + (r.total_pay || 0), 0) / records.length;
      
      setInsights({
        highestPayout: Math.round(maxPayout),
        highestCrew: maxRecord?.crew_id || 'N/A',
        avgPayout: Math.round(avgPayout),
        totalRecords: records.length
      });
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-600 mt-1">Detailed performance analysis and insights</p>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Period</h3>
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
                  setDateError('');
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
                  setDateError('');
                }
              }}
              min={dateRange.start}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={loadAnalyticsData}
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Update Analysis'}
            </button>
          </div>
        </div>
        {dateError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{dateError}</p>
          </div>
        )}
      </div>

      {/* Key Insights */}
      {insights ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium mb-2">Highest Payout</h3>
            <p className="text-3xl font-bold">${insights.highestPayout?.toLocaleString() || '0'}</p>
            <p className="text-sm mt-1">Crew {insights.highestCrew}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium mb-2">Average Payout</h3>
            <p className="text-3xl font-bold">${insights.avgPayout?.toLocaleString() || '0'}</p>
            <p className="text-sm mt-1">Per record</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium mb-2">Total Records</h3>
            <p className="text-3xl font-bold">{insights.totalRecords || 0}</p>
            <p className="text-sm mt-1">In date range</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-8">No insights data available</p>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Analytics</h3>
        <div className="flex space-x-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Download PDF Report
          </button>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export to Excel
          </button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Schedule Email Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

