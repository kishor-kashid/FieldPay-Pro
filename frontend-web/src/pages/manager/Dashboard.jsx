import React, { useState, useEffect } from 'react';
import { payrollAPI, userAPI } from '../../services/api';

const ManagerDashboard = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [stats, setStats] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    loadDashboardData();
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

  const loadDashboardData = async () => {
    if (!validateDateRange()) {
      return;
    }

    try {
      setLoading(true);
      setDateError('');
      
      // Fetch payroll records for the date range
      const recordsResponse = await payrollAPI.getRecords({ 
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      const records = recordsResponse.data?.records || [];

      // Fetch user stats (with error handling)
      let userStats = null;
      try {
        const userStatsResponse = await userAPI.getStats();
        // Backend returns: { success: true, data: { total_users, admins, managers, foremen, crew_members } }
        userStats = userStatsResponse.data?.data || userStatsResponse.data;
      } catch (error) {
        console.warn('Failed to fetch user stats:', error);
      }

      // Calculate compliance metrics
      const totalRecords = records.length;
      const approvedRecords = records.filter(r => r.approved === true).length;
      const pendingRecords = records.filter(r => !r.approved && (r.status === 'pending' || r.status === 'pending_review' || r.status === 'calculated')).length;
      const rejectedRecords = records.filter(r => r.status === 'rejected').length;
      const anomalyRecords = records.filter(r => r.has_anomalies === true).length;
      const complianceRate = totalRecords > 0 ? Math.round((approvedRecords / totalRecords) * 100) : 0;

      // Calculate anomaly breakdown
      const anomalyBreakdown = {};
      records.forEach(r => {
        if (r.anomaly_flags && Array.isArray(r.anomaly_flags)) {
          r.anomaly_flags.forEach(flag => {
            anomalyBreakdown[flag] = (anomalyBreakdown[flag] || 0) + 1;
          });
        }
      });

      // Calculate top performer (by total pay since efficiency is not stored)
      const sortedByPay = [...records]
        .filter(r => r.total_pay !== null && r.total_pay !== undefined)
        .sort((a, b) => (b.total_pay || 0) - (a.total_pay || 0));
      const topPerformer = sortedByPay[0] ? {
        name: sortedByPay[0].employee_name || 'Unknown',
        pay: Math.round(sortedByPay[0].total_pay || 0),
        crew: sortedByPay[0].crew_id || 'Unknown'
      } : null;

      // Find underperformers (by anomalies or low pay)
      const underperformers = records
        .filter(r => r.has_anomalies || (r.total_pay && r.total_pay < 100))
        .slice(0, 5)
        .map(r => ({
          name: r.employee_name || 'Unknown',
          pay: Math.round(r.total_pay || 0),
          crew: r.crew_id || 'Unknown',
          hasAnomaly: r.has_anomalies || false
        }));

      // Calculate crew performance
      const crewPerformance = {};
      records.forEach(r => {
        const crewId = r.crew_id || 'Unknown';
        if (!crewPerformance[crewId]) {
          crewPerformance[crewId] = {
            crewId,
            totalRecords: 0,
            totalPayout: 0,
            anomalies: 0,
            approved: 0
          };
        }
        crewPerformance[crewId].totalRecords++;
        crewPerformance[crewId].totalPayout += r.total_pay || 0;
        if (r.has_anomalies) crewPerformance[crewId].anomalies++;
        if (r.approved) crewPerformance[crewId].approved++;
      });

      // Calculate totals
      const totalPayout = records.reduce((sum, r) => sum + (r.total_pay || 0), 0);
      // Backend returns: { total_users, admins, managers, foremen, crew_members }
      const activeCrews = userStats?.foremen || Object.keys(crewPerformance).length;

      setStats({
        totalEmployees: userStats?.crew_members || 0,
        totalPayout: totalPayout,
        activeCrews: activeCrews,
        topPerformer: topPerformer,
        underperformers: underperformers,
        crewPerformance: Object.values(crewPerformance)
      });

      setCompliance({
        totalRecords,
        approvedRecords,
        pendingRecords,
        rejectedRecords,
        anomalyRecords,
        complianceRate,
        anomalyBreakdown
      });

      // Generate alerts from compliance data
      const newAlerts = [];
      if (pendingRecords > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${pendingRecords} payroll record${pendingRecords > 1 ? 's' : ''} pending approval`,
          crew: 'All Crews',
          priority: pendingRecords > 10 ? 'high' : 'medium'
        });
      }
      if (anomalyRecords > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${anomalyRecords} record${anomalyRecords > 1 ? 's' : ''} with anomalies detected`,
          crew: 'All Crews',
          priority: anomalyRecords > 5 ? 'high' : 'medium'
        });
      }
      if (complianceRate < 80 && totalRecords > 0) {
        newAlerts.push({
          type: 'warning',
          message: `Low compliance rate: ${complianceRate}% (Target: 80%+)`,
          crew: 'All Crews',
          priority: 'high'
        });
      }
      if (rejectedRecords > 0) {
        newAlerts.push({
          type: 'info',
          message: `${rejectedRecords} record${rejectedRecords > 1 ? 's' : ''} rejected`,
          crew: 'All Crews',
          priority: 'medium'
        });
      }
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats({
        totalEmployees: 0,
        totalPayout: 0,
        activeCrews: 0,
        topPerformer: null,
        underperformers: [],
        crewPerformance: []
      });
      setCompliance({
        totalRecords: 0,
        approvedRecords: 0,
        pendingRecords: 0,
        rejectedRecords: 0,
        anomalyRecords: 0,
        complianceRate: 0,
        anomalyBreakdown: {}
      });
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  const getComplianceStatus = (rate) => {
    if (rate >= 90) return { color: 'green', label: 'Excellent' };
    if (rate >= 80) return { color: 'blue', label: 'Good' };
    if (rate >= 60) return { color: 'yellow', label: 'Fair' };
    return { color: 'red', label: 'Needs Attention' };
  };

  const complianceStatus = compliance ? getComplianceStatus(compliance.complianceRate) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Overview</h1>
          <p className="text-gray-600 mt-1">Team performance and payroll compliance</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setDateRange({
                  start: yesterday.toISOString().split('T')[0],
                  end: yesterday.toISOString().split('T')[0]
                });
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Yesterday
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                setDateRange({
                  start: weekAgo.toISOString().split('T')[0],
                  end: today.toISOString().split('T')[0]
                });
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Last 7 Days
            </button>
          </div>
        </div>
        {dateError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{dateError}</p>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalEmployees}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payout</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${(stats?.totalPayout || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{compliance?.totalRecords || 0} records</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Crews</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.activeCrews}</p>
            </div>
            <div className="text-3xl">🚛</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className={`text-2xl font-bold mt-1 ${
                complianceStatus?.color === 'green' ? 'text-green-600' :
                complianceStatus?.color === 'blue' ? 'text-blue-600' :
                complianceStatus?.color === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {compliance?.complianceRate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{complianceStatus?.label || 'N/A'}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
      </div>

      {/* Compliance Metrics */}
      {compliance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{compliance.pendingRecords}</p>
                <p className="text-xs text-gray-500 mt-1">Requires action</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{compliance.approvedRecords}</p>
                <p className="text-xs text-gray-500 mt-1">of {compliance.totalRecords}</p>
              </div>
              <div className="text-3xl">✓</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{compliance.anomalyRecords}</p>
                <p className="text-xs text-gray-500 mt-1">Need review</p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{compliance.rejectedRecords}</p>
                <p className="text-xs text-gray-500 mt-1">Records</p>
              </div>
              <div className="text-3xl">✗</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔔 Alerts & Notifications</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.type === 'warning'
                    ? alert.priority === 'high'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs mt-1">{alert.crew}</p>
                  </div>
                  {alert.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">High Priority</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Breakdown */}
      {compliance && compliance.anomalyRecords > 0 && Object.keys(compliance.anomalyBreakdown).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Anomaly Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(compliance.anomalyBreakdown).map(([flag, count]) => (
              <div key={flag} className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900">{flag}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{count}</p>
                <p className="text-xs text-red-700 mt-1">occurrences</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top & Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Performer</h3>
          {stats?.topPerformer ? (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-lg font-semibold text-green-900">{stats.topPerformer.name}</p>
              <p className="text-sm text-green-700 mt-1">
                Total Pay: ${stats.topPerformer.pay?.toLocaleString() || '0'}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Needs Attention</h3>
          {stats?.underperformers && stats.underperformers.length > 0 ? (
            <div className="space-y-3">
              {stats.underperformers.map((emp, index) => (
                <div key={index} className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-red-900">{emp.name}</p>
                      <p className="text-xs text-red-700 mt-1">{emp.crew} {emp.hasAnomaly ? '(Anomaly)' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">${emp.pay?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">No underperformers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Crew Performance Comparison */}
      {stats?.crewPerformance && stats.crewPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Crew Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anomalies</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.crewPerformance.map((crew, index) => {
                  const crewComplianceRate = crew.totalRecords > 0 
                    ? Math.round((crew.approved / crew.totalRecords) * 100) 
                    : 0;
                  const crewStatus = getComplianceStatus(crewComplianceRate);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {crew.crewId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {crew.totalRecords}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Math.round(crew.totalPayout).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {crew.approved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {crew.anomalies}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          crewStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                          crewStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          crewStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {crewComplianceRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;

