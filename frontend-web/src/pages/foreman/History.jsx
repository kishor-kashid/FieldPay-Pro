import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

const History = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Mock historical data
  const historicalData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Team Efficiency (%)',
        data: [92, 94, 93, 96],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Target (90%)',
        data: [90, 90, 90, 90],
        borderColor: 'rgb(34, 197, 94)',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const payoutData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Total Team Payout ($)',
        data: [3800, 4100, 3950, 4350],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const recentRecords = [
    { date: '2024-01-10', efficiency: 96, payout: 4350, members: 6, jobsCompleted: 5 },
    { date: '2024-01-09', efficiency: 94, payout: 4200, members: 6, jobsCompleted: 4 },
    { date: '2024-01-08', efficiency: 93, payout: 4100, members: 6, jobsCompleted: 5 },
    { date: '2024-01-07', efficiency: 95, payout: 4280, members: 6, jobsCompleted: 4 },
    { date: '2024-01-06', efficiency: 91, payout: 3950, members: 5, jobsCompleted: 4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance History</h1>
        <p className="text-gray-600 mt-1">Historical team performance and trends</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Load History
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Avg Efficiency</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">94%</p>
          <p className="text-xs text-green-600 mt-1">↑ +2% from last period</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Payout</p>
          <p className="text-2xl font-bold text-green-600 mt-1">$16,600</p>
          <p className="text-xs text-green-600 mt-1">↑ +5% from last period</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Jobs Completed</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">18</p>
          <p className="text-xs text-gray-500 mt-1">In selected period</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Best Day</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">96%</p>
          <p className="text-xs text-gray-500 mt-1">Jan 10, 2024</p>
        </div>
      </div>

      {/* Efficiency Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Efficiency Trend</h3>
        <Line
          data={historicalData}
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

      {/* Payout Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Payout Trend</h3>
        <Line
          data={payoutData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
            },
          }}
        />
      </div>

      {/* Recent Records Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Performance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Payout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${
                      record.efficiency >= 95 ? 'text-green-600' :
                      record.efficiency >= 85 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {record.efficiency}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${record.payout.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.members}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.jobsCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.efficiency >= 95 ? 'bg-green-100 text-green-800' :
                      record.efficiency >= 85 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.efficiency >= 95 ? 'Excellent' : record.efficiency >= 85 ? 'Good' : 'Fair'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
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
    </div>
  );
};

export default History;

