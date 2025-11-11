import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Mock data for now - would fetch from API
      const mockData = {
        dailyTotals: [
          { date: '2024-01-01', totalPay: 5000, avgEfficiency: 95, employees: 50 },
          { date: '2024-01-02', totalPay: 5200, avgEfficiency: 92, employees: 50 },
          { date: '2024-01-03', totalPay: 4800, avgEfficiency: 98, employees: 48 },
          { date: '2024-01-04', totalPay: 5100, avgEfficiency: 94, employees: 51 },
          { date: '2024-01-05', totalPay: 5300, avgEfficiency: 96, employees: 52 },
        ],
        crewComparison: [
          { crew: 'Crew 1', avgEfficiency: 95, totalPay: 12500 },
          { crew: 'Crew 2', avgEfficiency: 92, totalPay: 11800 },
          { crew: 'Crew 3', avgEfficiency: 88, totalPay: 10200 },
        ],
      };
      setReportData(mockData);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const efficiencyChartData = reportData ? {
    labels: reportData.dailyTotals.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Average Efficiency (%)',
        data: reportData.dailyTotals.map(d => d.avgEfficiency),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  } : null;

  const payoutChartData = reportData ? {
    labels: reportData.dailyTotals.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Payout ($)',
        data: reportData.dailyTotals.map(d => d.totalPay),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  } : null;

  const crewComparisonData = reportData ? {
    labels: reportData.crewComparison.map(c => c.crew),
    datasets: [
      {
        label: 'Average Efficiency (%)',
        data: reportData.crewComparison.map(c => c.avgEfficiency),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Performance trends and cost analysis</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Date Range</h3>
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
            <button
              onClick={loadReportData}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading report data...</p>
        </div>
      ) : reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Total Payout</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${reportData.dailyTotals.reduce((sum, d) => sum + d.totalPay, 0).toFixed(0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {(reportData.dailyTotals.reduce((sum, d) => sum + d.avgEfficiency, 0) / reportData.dailyTotals.length).toFixed(0)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.dailyTotals.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600">Avg Employees/Day</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {(reportData.dailyTotals.reduce((sum, d) => sum + d.employees, 0) / reportData.dailyTotals.length).toFixed(0)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Efficiency Trend</h3>
              {efficiencyChartData && (
                <Line
                  data={efficiencyChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Payout</h3>
              {payoutChartData && (
                <Bar
                  data={payoutChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: false },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Crew Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Crew Comparison</h3>
            {crewComparisonData && (
              <Bar
                data={crewComparisonData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Report</h3>
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export PDF
              </button>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Export Excel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

