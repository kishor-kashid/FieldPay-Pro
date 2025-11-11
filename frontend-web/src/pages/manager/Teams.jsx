import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { payrollAPI, userAPI } from '../../services/api';

const Teams = () => {
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCrewsData();
  }, []);

  const loadCrewsData = async () => {
    try {
      setLoading(true);
      
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Fetch all users to get crew information
      const usersResponse = await userAPI.getUsers();
      const users = usersResponse.data?.users || [];

      // Get all foremen (they represent crews)
      const foremen = users.filter(u => u.role === 'foreman');
      
      // Fetch payroll records for yesterday
      const recordsResponse = await payrollAPI.getRecords({ date: yesterdayStr });
      const records = recordsResponse.data?.records || [];

      // Group records by crew_id
      const crewDataMap = {};
      
      foremen.forEach(foreman => {
        const crewId = foreman.crew_id || foreman.id;
        const crewRecords = records.filter(r => r.crew_id === crewId);
        const crewMembers = users.filter(u => u.crew_id === crewId && u.role === 'crew_member');
        
        if (crewRecords.length > 0 || crewMembers.length > 0) {
          const avgEfficiency = crewRecords.length > 0
            ? crewRecords.reduce((sum, r) => sum + (r.efficiency || 0), 0) / crewRecords.length * 100
            : 0;
          
          const totalPayout = crewRecords.reduce((sum, r) => sum + (r.total_pay || 0), 0);
          
          // Get top 3 performers
          const topMembers = [...crewRecords]
            .filter(r => r.efficiency !== null)
            .sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0))
            .slice(0, 3)
            .map(r => ({
              name: r.employee_name || 'Unknown',
              efficiency: Math.round((r.efficiency || 0) * 100),
              pay: Math.round(r.total_pay || 0)
            }));

          let status = 'good';
          if (avgEfficiency >= 95) status = 'excellent';
          else if (avgEfficiency < 85) status = 'needs_improvement';

          crewDataMap[crewId] = {
            id: crewId,
            name: `Crew ${crewId}`,
            foreman: foreman.name || 'Unknown',
            members: crewMembers.length,
            avgEfficiency: Math.round(avgEfficiency),
            totalPayout: Math.round(totalPayout),
            status: status,
            topMembers: topMembers
          };
        }
      });

      setCrews(Object.values(crewDataMap));
    } catch (error) {
      console.error('Failed to load crews data:', error);
      setCrews([]);
    } finally {
      setLoading(false);
    }
  };

  const comparisonData = crews.length > 0 ? {
    labels: crews.map(c => c.name),
    datasets: [
      {
        label: 'Average Efficiency (%)',
        data: crews.map(c => c.avgEfficiency),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  } : null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_improvement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'needs_improvement': return 'Needs Improvement';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading teams data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
        <p className="text-gray-600 mt-1">View and compare crew performance</p>
      </div>

      {/* Crew Comparison Chart */}
      {comparisonData && crews.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Crew Efficiency Comparison</h3>
          <Bar
            data={comparisonData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-8">No crew data available</p>
        </div>
      )}

      {/* Crew Cards */}
      {crews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {crews.map((crew) => (
          <div
            key={crew.id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCrew(crew)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{crew.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crew.status)}`}>
                {getStatusLabel(crew.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Foreman:</span>
                <span className="font-medium text-gray-900">{crew.foreman}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Members:</span>
                <span className="font-medium text-gray-900">{crew.members}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Efficiency:</span>
                <span className="font-medium text-blue-600">{crew.avgEfficiency}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Payout:</span>
                <span className="font-medium text-green-600">${crew.totalPayout.toLocaleString()}</span>
              </div>
            </div>

            <button className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
              View Details
            </button>
          </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-8">No crews found</p>
        </div>
      )}

      {/* Detailed Crew View Modal */}
      {selectedCrew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{selectedCrew.name}</h3>
                <p className="text-gray-600 mt-1">Foreman: {selectedCrew.foreman}</p>
              </div>
              <button
                onClick={() => setSelectedCrew(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Crew Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{selectedCrew.members}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{selectedCrew.avgEfficiency}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Payout</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">${selectedCrew.totalPayout.toLocaleString()}</p>
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Performers</h4>
              {selectedCrew.topMembers && selectedCrew.topMembers.length > 0 ? (
                <div className="space-y-3">
                  {selectedCrew.topMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">Efficiency: {member.efficiency}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${member.pay}</p>
                      <p className="text-xs text-gray-500">Daily Pay</p>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No performance data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;

