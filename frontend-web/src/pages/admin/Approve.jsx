import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import PayrollTable from '../../components/PayrollTable';
import ProcessPayrollWidget from '../../components/ProcessPayrollWidget';

const Approve = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [date, setDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadRecords();
  }, [date]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await payrollAPI.getRecords({ date, status: 'pending' });
      setRecords(response.data.records || []);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(r => r.id));
    }
  };

  const handleSelectRecord = (recordId) => {
    if (selectedRecords.includes(recordId)) {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    } else {
      setSelectedRecords([...selectedRecords, recordId]);
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(
        selectedRecords.map(id => payrollAPI.approveRecord(id, 'Bulk approved'))
      );
      setSelectedRecords([]);
      loadRecords();
    } catch (error) {
      console.error('Failed to approve records:', error);
    }
  };

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

      {/* Reprocess Widget */}
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
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {selectedRecords.length === records.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {selectedRecords.length > 0 && (
              <button
                onClick={handleBulkApprove}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve Selected ({selectedRecords.length})
              </button>
            )}
            <div className="relative group">
              <button
                disabled={exporting || records.length === 0}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{records.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Payout</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${records.reduce((sum, r) => sum + (r.total_pay || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">With Anomalies</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {records.filter(r => r.has_anomaly).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Selected</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{selectedRecords.length}</p>
        </div>
      </div>

      {/* Payroll Records with Checkboxes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading records...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRecords.length === records.length && records.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className={record.has_anomaly ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => handleSelectRecord(record.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employee_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.hours_worked?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.efficiency_score?.toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${record.total_pay?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.has_anomaly && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠️ Review
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={async () => {
                          await payrollAPI.approveRecord(record.id, 'Individually approved');
                          loadRecords();
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {records.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending records for approval</p>
            </div>
          )}
        </div>
      )}

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

