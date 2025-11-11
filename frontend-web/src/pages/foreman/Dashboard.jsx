import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { payrollAPI } from '../../services/api';

const ForemanDashboard = () => {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      // Mock data for now
      const mockData = {
        teamName: user?.crew_id ? `Crew ${user.crew_id}` : 'My Team',
        date: 'Yesterday',
        avgEfficiency: 94,
        totalPayout: 4200,
        members: [
          { id: 1, name: 'John Doe', efficiency: 105, pay: 520, status: 'excellent' },
          { id: 2, name: 'Jane Smith', efficiency: 98, pay: 480, status: 'excellent' },
          { id: 3, name: 'Bob Johnson', efficiency: 92, pay: 450, status: 'good' },
          { id: 4, name: 'Alice Brown', efficiency: 88, pay: 420, status: 'good' },
          { id: 5, name: 'Charlie Davis', efficiency: 78, pay: 380, status: 'needs_attention' },
        ],
      };
      setTeamData(mockData);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '✓';
      case 'needs_attention': return '⚠️';
      default: return '•';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{teamData?.teamName} Performance</h1>
        <p className="text-gray-600 mt-1">{teamData?.date}'s Performance Summary</p>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Average</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{teamData?.avgEfficiency}%</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payout</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${teamData?.totalPayout?.toLocaleString()}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{teamData?.members?.length}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
      </div>

      {/* Top Performer */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">🏆 Top Performer - Yesterday</h3>
        {teamData?.members?.[0] && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-green-900">{teamData.members[0].name}</p>
              <p className="text-sm text-green-700 mt-1">Outstanding performance! Keep it up!</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{teamData.members[0].efficiency}%</p>
              <p className="text-sm text-green-700">Efficiency</p>
            </div>
          </div>
        )}
      </div>

      {/* Team Members Summary Cards */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamData?.members?.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  {getStatusIcon(member.status)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className={`font-bold ${
                    member.efficiency >= 95 ? 'text-green-600' :
                    member.efficiency >= 85 ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {member.efficiency}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Daily Pay:</span>
                  <span className="font-bold text-green-600">${member.pay}</span>
                </div>
              </div>
              <button className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {teamData?.members?.some(m => m.status === 'needs_attention') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Needs Attention</h3>
          <div className="space-y-2">
            {teamData.members
              .filter(m => m.status === 'needs_attention')
              .map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">Efficiency below target: {member.efficiency}%</p>
                  </div>
                  <button className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                    Follow Up
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm font-medium text-gray-800">View All Members</div>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-sm font-medium text-gray-800">Today's Schedule</div>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
            <div className="text-2xl mb-2">📜</div>
            <div className="text-sm font-medium text-gray-800">Performance History</div>
          </button>
          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium text-gray-800">Team Analytics</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForemanDashboard;

