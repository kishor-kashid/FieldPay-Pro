import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { payrollAPI } from '../../services/api';

const History = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgPayout: 0,
    totalPayout: 0,
    totalRecords: 0,
    bestDay: null,
  });
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    loadHistory();
  }, [dateRange]);

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
    if (startDate > todayDate || endDate > todayDate) {
      setDateError('Dates cannot be in the future');
      return false;
    }
    if (startDate > endDate) {
      setDateError('Start date must be before or equal to end date');
      return false;
    }
    return true;
  };

  const loadHistory = async () => {
    if (!validateDateRange()) {
      return;
    }

    try {
      setLoading(true);
      setDateError('');
      
      const crewId = user?.crew_id;
      if (!crewId) {
        setRecords([]);
        setStats({ avgPayout: 0, totalPayout: 0, totalRecords: 0, bestDay: null });
        return;
      }

      // Fetch payroll records for the date range
      const recordsResponse = await payrollAPI.getRecords({ 
        start_date: dateRange.start,
        end_date: dateRange.end,
        crew_id: crewId 
      });
      const allRecords = recordsResponse.data?.records || [];

      // Group records by date
      const recordsByDate = {};
      allRecords.forEach(record => {
        const date = record.date;
        if (!recordsByDate[date]) {
          recordsByDate[date] = {
            date: date,
            records: [],
            totalPayout: 0,
            memberCount: 0,
            approvedCount: 0,
            anomalyCount: 0,
          };
        }
        recordsByDate[date].records.push(record);
        recordsByDate[date].totalPayout += record.total_pay || 0;
        if (record.approved) recordsByDate[date].approvedCount += 1;
        if (record.has_anomalies) recordsByDate[date].anomalyCount += 1;
      });

      // Get unique member count per date
      Object.keys(recordsByDate).forEach(date => {
        const uniqueMembers = new Set(recordsByDate[date].records.map(r => r.employee_id));
        recordsByDate[date].memberCount = uniqueMembers.size;
      });

      // Convert to array and sort by date (descending)
      const recordsList = Object.values(recordsByDate).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      // Calculate stats
      const totalPayout = recordsList.reduce((sum, r) => sum + r.totalPayout, 0);
      const avgPayout = recordsList.length > 0 ? totalPayout / recordsList.length : 0;
      const bestDay = recordsList.length > 0 
        ? recordsList.reduce((best, current) => 
            current.totalPayout > best.totalPayout ? current : best
          )
        : null;

      setRecords(recordsList);
      setStats({
        avgPayout: Math.round(avgPayout),
        totalPayout: Math.round(totalPayout),
        totalRecords: allRecords.length,
        bestDay: bestDay,
      });
    } catch (error) {
      console.error('Failed to load history:', error);
      setRecords([]);
      setStats({ avgPayout: 0, totalPayout: 0, totalRecords: 0, bestDay: null });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading performance history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance History</h1>
        <p className="text-gray-600 mt-1">Historical team performance and trends</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Last 30 Days
            </button>
          </div>
        </div>
        {dateError && (
          <p className="text-red-600 text-sm mt-2">{dateError}</p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Avg Daily Payout</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">${stats.avgPayout.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Payout</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${stats.totalPayout.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalRecords}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Best Day</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.bestDay ? `$${Math.round(stats.bestDay.totalPayout).toLocaleString()}` : 'N/A'}
          </p>
          {stats.bestDay && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(stats.bestDay.date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Recent Records Table */}
      {records.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No performance records found for the selected date range.</p>
          <p className="text-gray-400 text-sm mt-2">Try selecting a different date range or ensure payroll has been processed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Performance Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Payout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anomalies</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${Math.round(record.totalPayout).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.memberCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {record.approvedCount} / {record.records.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.anomalyCount > 0 ? (
                        <span className="text-orange-600 font-medium">{record.anomalyCount}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Options */}
      {records.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Export History</h3>
          <div className="flex space-x-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Download PDF Report
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Export to CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
