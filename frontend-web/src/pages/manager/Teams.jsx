import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';

const Teams = () => {
  const [selectedCrew, setSelectedCrew] = useState(null);

  const crews = [
    {
      id: 1,
      name: 'Crew 1',
      foreman: 'Carlos Rodriguez',
      members: 18,
      avgEfficiency: 96,
      totalPayout: 18500,
      status: 'excellent',
      topMembers: [
        { name: 'John Doe', efficiency: 105, pay: 1200 },
        { name: 'Mike Smith', efficiency: 102, pay: 1150 },
        { name: 'Tom Brown', efficiency: 98, pay: 1050 },
      ],
    },
    {
      id: 2,
      name: 'Crew 2',
      foreman: 'Maria Garcia',
      members: 16,
      avgEfficiency: 92,
      totalPayout: 16200,
      status: 'good',
      topMembers: [
        { name: 'Sarah Johnson', efficiency: 99, pay: 1100 },
        { name: 'David Lee', efficiency: 95, pay: 1000 },
        { name: 'Alex Wong', efficiency: 91, pay: 950 },
      ],
    },
    {
      id: 3,
      name: 'Crew 3',
      foreman: 'James Wilson',
      members: 16,
      avgEfficiency: 85,
      totalPayout: 14800,
      status: 'needs_improvement',
      topMembers: [
        { name: 'Chris Taylor', efficiency: 92, pay: 980 },
        { name: 'Pat Martinez', efficiency: 87, pay: 920 },
        { name: 'Jordan White', efficiency: 82, pay: 880 },
      ],
    },
  ];

  const comparisonData = {
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
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
        <p className="text-gray-600 mt-1">View and compare crew performance</p>
      </div>

      {/* Crew Comparison Chart */}
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

      {/* Crew Cards */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;

