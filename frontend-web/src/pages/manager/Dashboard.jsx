import React, { useState, useEffect } from 'react';
import { payrollAPI, userAPI } from '../../services/api';
import PerformanceChart from '../../components/PerformanceChart';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get yesterday's date for default summary
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Fetch payroll summary
      const summaryResponse = await payrollAPI.getSummary({ date: yesterdayStr });
      const summary = summaryResponse.data;

      // Fetch user stats
      const userStatsResponse = await userAPI.getStats();
      const userStats = userStatsResponse.data;

      // Fetch recent payroll records to find top/underperformers
      const recordsResponse = await payrollAPI.getRecords({ 
        date: yesterdayStr,
        limit: 100 
      });
      const records = recordsResponse.data?.records || [];

      // Calculate top performer
      const sortedByEfficiency = [...records]
        .filter(r => r.efficiency !== null)
        .sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0));
      const topPerformer = sortedByEfficiency[0] ? {
        name: sortedByEfficiency[0].employee_name || 'Unknown',
        efficiency: Math.round((sortedByEfficiency[0].efficiency || 0) * 100)
      } : null;

      // Find underperformers (efficiency < 80%)
      const underperformers = records
        .filter(r => r.efficiency !== null && r.efficiency < 0.8)
        .slice(0, 5)
        .map(r => ({
          name: r.employee_name || 'Unknown',
          efficiency: Math.round(r.efficiency * 100),
          crew: r.crew_id || 'Unknown'
        }));

      // Get crew count from user stats
      const activeCrews = userStats?.by_role?.foreman || 0;

      setStats({
        totalEmployees: userStats?.total || 0,
        avgEfficiency: summary?.avgEfficiencyPercentage || 0,
        totalPayout: summary?.totalPayout || 0,
        activeCrews: activeCrews,
        topPerformer: topPerformer,
        underperformers: underperformers,
      });

      // Generate weekly efficiency trend (last 7 days)
      const weeklyData = await generateWeeklyTrend();
      setChartData(weeklyData);

      // Alerts would come from notifications or anomaly detection
      setAlerts([]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats({
        totalEmployees: 0,
        avgEfficiency: 0,
        totalPayout: 0,
        activeCrews: 0,
        topPerformer: null,
        underperformers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyTrend = async () => {
    try {
      const days = [];
      const efficiencyData = [];
      
      // Get data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        try {
          const response = await payrollAPI.getSummary({ date: dateStr });
          const avgEff = response.data?.avgEfficiencyPercentage || 0;
          efficiencyData.push(avgEff);
        } catch (error) {
          efficiencyData.push(0);
        }
      }

      return {
        labels: days,
        datasets: [
          {
            label: 'Company Avg Efficiency',
            data: efficiencyData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Target (90%)',
            data: [90, 90, 90, 90, 90, 90, 90],
            borderColor: 'rgb(34, 197, 94)',
            borderDash: [5, 5],
            pointRadius: 0,
          },
        ],
      };
    } catch (error) {
      console.error('Error generating weekly trend:', error);
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Company Avg Efficiency',
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Target (90%)',
            data: [90, 90, 90, 90, 90, 90, 90],
            borderColor: 'rgb(34, 197, 94)',
            borderDash: [5, 5],
            pointRadius: 0,
          },
        ],
      };
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manager Overview</h1>
        <p className="text-gray-600 mt-1">Company-wide performance and analytics</p>
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
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.avgEfficiency}%</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payout</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${(stats?.totalPayout || 0).toLocaleString()}</p>
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
      </div>

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
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs mt-1">{alert.crew}</p>
                  </div>
                  <button className="text-xs underline">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Trend */}
      {chartData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Efficiency Trend</h3>
          <PerformanceChart data={chartData} height={300} />
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
                Efficiency: {stats.topPerformer.efficiency}%
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
                      <p className="text-xs text-red-700 mt-1">{emp.crew}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{emp.efficiency}%</p>
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

      {/* Crew Summary - Removed hard-coded data */}
      {/* This section can be implemented later with crew aggregation API */}
    </div>
  );
};

export default ManagerDashboard;

