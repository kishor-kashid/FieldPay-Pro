import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import PerformanceChart from '../../components/PerformanceChart';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for now
      const mockStats = {
        totalEmployees: 50,
        avgEfficiency: 94,
        totalPayout: 52000,
        activeCrews: 3,
        topPerformer: { name: 'John Doe', efficiency: 105 },
        underperformers: [
          { name: 'Jane Smith', efficiency: 72, crew: 'Crew 1' },
          { name: 'Bob Johnson', efficiency: 68, crew: 'Crew 2' },
        ],
      };
      setStats(mockStats);

      const mockAlerts = [
        { type: 'warning', message: 'Crew 2 efficiency below 80% for 3 consecutive days', crew: 'Crew 2' },
        { type: 'info', message: 'New employee onboarded in Crew 1', crew: 'Crew 1' },
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Company Avg Efficiency',
        data: [92, 94, 91, 95, 93, 96, 94],
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Efficiency Trend</h3>
        <PerformanceChart data={chartData} height={300} />
      </div>

      {/* Top & Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Performer</h3>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-lg font-semibold text-green-900">{stats?.topPerformer?.name}</p>
            <p className="text-sm text-green-700 mt-1">
              Efficiency: {stats?.topPerformer?.efficiency}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Needs Attention</h3>
          <div className="space-y-3">
            {stats?.underperformers?.map((emp, index) => (
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
        </div>
      </div>

      {/* Crew Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Crew Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crew</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Payout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Crew 1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">96%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$18,500</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Excellent
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Crew 2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">16</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">92%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$16,200</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Good
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Crew 3</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">16</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">85%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$14,800</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Needs Improvement
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

