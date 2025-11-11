import React, { useState, useEffect } from 'react';
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
import { payrollAPI, userAPI } from '../../services/api';

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
  const [loading, setLoading] = useState(true);
  const [efficiencyTrendData, setEfficiencyTrendData] = useState(null);
  const [costPerJobData, setCostPerJobData] = useState(null);
  const [performanceDistributionData, setPerformanceDistributionData] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load efficiency trend (weekly data)
      await loadEfficiencyTrend();
      
      // Load cost per job and performance distribution
      await loadDistributionData();
      
      // Load insights
      await loadInsights();
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEfficiencyTrend = async () => {
    try {
      const usersResponse = await userAPI.getUsers();
      const users = usersResponse.data?.users || [];
      const foremen = users.filter(u => u.role === 'foreman').slice(0, 3);
      
      const labels = [];
      const datasets = [];
      
      // Initialize datasets for each crew
      foremen.forEach((foreman, index) => {
        datasets[index] = {
          label: `Crew ${foreman.crew_id || foreman.id}`,
          data: [],
          borderColor: index === 0 ? 'rgb(59, 130, 246)' : index === 1 ? 'rgb(34, 197, 94)' : 'rgb(251, 146, 60)',
          backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : index === 1 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 146, 60, 0.1)',
        };
      });
      
      // Get last 4 weeks
      for (let week = 3; week >= 0; week--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (week * 7));
        labels.push(`Week ${4 - week}`);
        
        const dateStr = weekStart.toISOString().split('T')[0];
        
        // Get summary for this date (company-wide average)
        try {
          const response = await payrollAPI.getSummary({ date: dateStr });
          const avgEff = response.data?.avgEfficiencyPercentage || 0;
          
          // Use same average for all crews (simplified - would need per-crew breakdown)
          datasets.forEach(dataset => {
            dataset.data.push(avgEff);
          });
        } catch (error) {
          // If no data for this date, push 0
          datasets.forEach(dataset => {
            dataset.data.push(0);
          });
        }
      }
      
      setEfficiencyTrendData({
        labels,
        datasets: datasets.filter(d => d.data.length > 0)
      });
    } catch (error) {
      console.error('Error loading efficiency trend:', error);
      setEfficiencyTrendData(null);
    }
  };

  const loadDistributionData = async () => {
    try {
      // Get records for the date range
      const recordsResponse = await payrollAPI.getRecords({
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      const records = recordsResponse.data?.records || [];
      
      // Performance distribution
      const excellent = records.filter(r => r.efficiency && r.efficiency >= 0.95).length;
      const good = records.filter(r => r.efficiency && r.efficiency >= 0.85 && r.efficiency < 0.95).length;
      const fair = records.filter(r => r.efficiency && r.efficiency >= 0.75 && r.efficiency < 0.85).length;
      const needsImprovement = records.filter(r => r.efficiency && r.efficiency < 0.75).length;
      
      setPerformanceDistributionData({
        labels: ['Excellent (>95%)', 'Good (85-95%)', 'Fair (75-85%)', 'Needs Improvement (<75%)'],
        datasets: [
          {
            data: [excellent, good, fair, needsImprovement],
            backgroundColor: [
              'rgba(34, 197, 94, 0.6)',
              'rgba(59, 130, 246, 0.6)',
              'rgba(251, 146, 60, 0.6)',
              'rgba(239, 68, 68, 0.6)',
            ],
          },
        ],
      });
      
      // Cost per job - simplified (would need job type data from backend)
      setCostPerJobData(null); // Removed hard-coded data
    } catch (error) {
      console.error('Error loading distribution data:', error);
    }
  };

  const loadInsights = async () => {
    try {
      // Get summary for date range
      const recordsResponse = await payrollAPI.getRecords({
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      const records = recordsResponse.data?.records || [];
      
      if (records.length === 0) {
        setInsights(null);
        return;
      }
      
      // Calculate highest efficiency
      const maxEfficiency = Math.max(...records.map(r => (r.efficiency || 0) * 100));
      const maxRecord = records.find(r => (r.efficiency || 0) * 100 === maxEfficiency);
      
      // Calculate improvement (simplified)
      const avgEfficiency = records.reduce((sum, r) => sum + (r.efficiency || 0), 0) / records.length * 100;
      
      setInsights({
        highestEfficiency: Math.round(maxEfficiency),
        highestCrew: maxRecord?.crew_id || 'N/A',
        avgEfficiency: Math.round(avgEfficiency),
        costSavings: 0 // Would need budget comparison
      });
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading analytics data...</p>
      </div>
    );
  }

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
            <button 
              onClick={loadAnalyticsData}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {insights ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium mb-2">Highest Efficiency</h3>
            <p className="text-3xl font-bold">{insights.highestEfficiency}%</p>
            <p className="text-sm mt-1">{insights.highestCrew}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium mb-2">Average Efficiency</h3>
            <p className="text-3xl font-bold">{insights.avgEfficiency}%</p>
            <p className="text-sm mt-1">Last 30 days</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium mb-2">Cost Savings</h3>
            <p className="text-3xl font-bold">N/A</p>
            <p className="text-sm mt-1">Requires budget data</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-8">No insights data available</p>
        </div>
      )}

      {/* Efficiency Trend */}
      {efficiencyTrendData ? (
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
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-8">No efficiency trend data available</p>
        </div>
      )}

      {/* Cost and Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost per Job Type - Removed hard-coded data */}
        {/* This requires job type breakdown from backend */}
        
        {performanceDistributionData ? (
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
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-center py-8">No distribution data available</p>
          </div>
        )}
      </div>

      {/* Seasonal Analysis - Removed hard-coded data */}
      {/* This section requires historical data aggregation from backend */}

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

