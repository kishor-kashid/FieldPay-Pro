import React, { useState } from 'react';
import { payrollAPI } from '../services/api';

const AnalyzePayrollWidget = () => {
  const [date, setDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await payrollAPI.analyze(date);
      setResults(response.data);
    } catch (err) {
      console.error('Analyze error:', err);
      setError(err.response?.data?.error || 'Failed to analyze payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        📊 Analyze Payroll (Preview)
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Preview calculations without saving to database. Safe to run multiple times.
      </p>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="analyze-date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            id="analyze-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
          <button
            onClick={handleAnalyze}
            disabled={loading || !date}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Payroll'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-600">{results.summary?.totalEmployees || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Pay</p>
              <p className="text-2xl font-bold text-green-600">
                ${(results.summary?.totalPay || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Anomalies</p>
              <p className="text-2xl font-bold text-yellow-600">{results.summary?.anomalies || 0}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pay</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.records?.map((record, index) => (
                    <tr key={index} className={record.has_anomaly ? 'bg-yellow-50' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.employee_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.hours_worked?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.efficiency_score?.toFixed(0)}%</td>
                      <td className="px-4 py-3 text-sm text-green-600">${record.performance_bonus?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-red-600">${record.penalties?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">${record.total_pay?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        {record.has_anomaly && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠️ Anomaly
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
            <p className="text-sm">
              ℹ️ This is a preview. No data has been saved to the database. Use "Process Payroll" to save results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzePayrollWidget;

