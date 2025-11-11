import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Mock data for charts
  const efficiencyTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Crew 1',
        data: [95, 96, 94, 97],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'Crew 2',
        data: [92, 91, 93, 92],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      },
      {
        label: 'Crew 3',
        data: [85, 87, 86, 88],
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
      },
    ],
  };

  const costPerJobData = {
    labels: ['Mowing', 'Trimming', 'Cleanup', 'Installation', 'Maintenance'],
    datasets: [
      {
        label: 'Average Cost ($)',
        data: [150, 80, 200, 500, 120],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(251, 146, 60, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(236, 72, 153, 0.6)',
        ],
      },
    ],
  };

  const performanceDistributionData = {
    labels: ['Excellent (>95%)', 'Good (85-95%)', 'Fair (75-85%)', 'Needs Improvement (<75%)'],
    datasets: [
      {
        data: [35, 40, 20, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(251, 146, 60, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
      },
    ],
  };

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
              Update Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium mb-2">Highest Efficiency</h3>
          <p className="text-3xl font-bold">97%</p>
          <p className="text-sm mt-1">Crew 1 - Week 4</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium mb-2">Most Improved</h3>
          <p className="text-3xl font-bold">+3.5%</p>
          <p className="text-sm mt-1">Crew 3 - Last 30 days</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium mb-2">Cost Savings</h3>
          <p className="text-3xl font-bold">$2,400</p>
          <p className="text-sm mt-1">Vs. Budgeted Hours</p>
        </div>
      </div>

      {/* Efficiency Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Crew Efficiency Trends</h3>
        <Line
          data={efficiencyTrendData}
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

      {/* Cost and Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost per Job Type</h3>
          <Bar
            data={costPerJobData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Distribution</h3>
          <Doughnut
            data={performanceDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
              },
            }}
          />
        </div>
      </div>

      {/* Seasonal Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Seasonal Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Best Performing Months</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900">September</span>
                <span className="text-sm font-bold text-green-600">96.5%</span>
              </div>
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900">August</span>
                <span className="text-sm font-bold text-green-600">95.8%</span>
              </div>
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900">July</span>
                <span className="text-sm font-bold text-green-600">94.2%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Areas for Improvement</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Winter Months</span>
                <span className="text-sm font-bold text-yellow-600">-12% Efficiency</span>
              </div>
              <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Rainy Days</span>
                <span className="text-sm font-bold text-yellow-600">-8% Efficiency</span>
              </div>
              <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Monday Mornings</span>
                <span className="text-sm font-bold text-yellow-600">-5% Efficiency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

