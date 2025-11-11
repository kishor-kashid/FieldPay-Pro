import React, { useState } from 'react';
import { payrollAPI } from '../../services/api';
import AnalyzePayrollWidget from '../../components/AnalyzePayrollWidget';
import ProcessPayrollWidget from '../../components/ProcessPayrollWidget';

const Approve = () => {
  const [exporting, setExporting] = useState(false);
  const [date, setDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  const handleExportCSV = async (format = 'standard') => {
    setExporting(true);
    try {
      const response = await payrollAPI.exportCSV({ date, format });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${date}_${format}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approve & Export</h1>
        <p className="text-gray-600 mt-1">Approve payroll records and export to Paychex</p>
      </div>

      {/* Analyze Payroll Widget (Preview) */}
      <AnalyzePayrollWidget />

      {/* Process Payroll Widget (Commit) */}
      <ProcessPayrollWidget />

      {/* Date Filter & Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  const today = new Date().toISOString().split('T')[0];
                  
                  // Allow any past date or today for approval
                  if (selectedDate <= today) {
                    setDate(selectedDate);
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Select a date to approve payroll records</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative group">
              <button
                disabled={exporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-10">
                <button
                  onClick={() => handleExportCSV('standard')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Standard Format
                </button>
                <button
                  onClick={() => handleExportCSV('detailed')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Detailed Format
                </button>
                <button
                  onClick={() => handleExportCSV('summary')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Summary Format
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Export Instructions</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Review all records and approve individually or in bulk</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Export CSV in the format required by Paychex</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Upload the CSV file to Paychex system</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">4.</span>
            <span>Verify import success in Paychex</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Approve;

