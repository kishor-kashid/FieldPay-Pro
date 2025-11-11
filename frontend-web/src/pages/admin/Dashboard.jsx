import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { payrollAPI } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await payrollAPI.getSummary({ date: today });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage payroll processing and system operations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Processing</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : stats?.recordsProcessed || 0}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payout</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {loading ? '...' : `$${(stats?.totalPay || 0).toFixed(0)}`}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Anomalies</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {loading ? '...' : stats?.anomalies || 0}
              </p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {loading ? '...' : `${(stats?.avgEfficiency || 0).toFixed(0)}%`}
              </p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/admin/upload')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center cursor-pointer"
          >
            <div className="text-2xl mb-2">📤</div>
            <div className="text-sm font-medium text-gray-800">Upload Data</div>
          </button>
          <button 
            onClick={() => navigate('/admin/review')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center cursor-pointer"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium text-gray-800">Review Payroll</div>
          </button>
          <button 
            onClick={() => navigate('/admin/approve')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center cursor-pointer"
          >
            <div className="text-2xl mb-2">✓</div>
            <div className="text-sm font-medium text-gray-800">Approve & Export</div>
          </button>
          <button 
            onClick={() => navigate('/admin/users')}
            className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center cursor-pointer"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium text-gray-800">Manage Users</div>
          </button>
        </div>
      </div>

      {/* Recent Activity - Removed hard-coded data */}
      {/* This section can be implemented later with execution logs API */}
    </div>
  );
};

export default AdminDashboard;

