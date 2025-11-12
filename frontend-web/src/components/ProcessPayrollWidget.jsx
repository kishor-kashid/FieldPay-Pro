import React, { useState } from 'react';
import { payrollAPI } from '../services/api';

const ProcessPayrollWidget = () => {
  const [date, setDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error, duplicate
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showReprocessModal, setShowReprocessModal] = useState(false);

  const validateDate = () => {
    if (!date) {
      setError('Please select a date');
      return false;
    }

    // Validate date is not in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
      setError('Cannot process payroll for future dates');
      return false;
    }

    return true;
  };

  const handleProcess = async (reprocess = false) => {
    // Validate date before processing
    if (!validateDate()) {
      setStatus('error');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('processing');
    setResults(null);

    try {
      // Note: Backend handles deletion of existing records when reprocess=true
      // No need to manually delete records here
      const response = await payrollAPI.process(date, reprocess);
      setResults(response.data);
      setStatus('success');
      setShowReprocessModal(false);
    } catch (err) {
      console.error('Process error:', err);
      
      if (err.response?.data?.error?.includes('already processed')) {
        setStatus('duplicate');
        setError(err.response.data.error);
        // Try to fetch existing records
        try {
          const recordsResponse = await payrollAPI.getRecords({ date });
          setResults({ existingRecords: recordsResponse.data.records });
        } catch (fetchErr) {
          console.error('Failed to fetch existing records:', fetchErr);
        }
      } else {
        setStatus('error');
        setError(err.response?.data?.error || 'Failed to process payroll');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = () => {
    setShowReprocessModal(true);
  };

  const confirmReprocess = () => {
    handleProcess(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        ⚡ Process Payroll (Commit)
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Save calculations to database and send notifications. One-time processing per date.
      </p>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="process-date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            id="process-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError(''); // Clear error when date changes
            }}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            disabled={loading}
          />
          {error && !loading && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
          <button
            onClick={() => handleProcess(false)}
            disabled={loading || !date}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Process Payroll'}
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      {status === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800 mr-3"></div>
            <p className="text-sm">Processing payroll...</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm font-medium">✓ Payroll processed successfully!</p>
          <p className="text-sm mt-1">
            Records processed: {results?.recordsProcessed || 0} | 
            Notifications sent: {results?.notificationsSent || 0}
          </p>
          {results?.executionLog && (
            <p className="text-sm mt-1">
              Execution ID: {results.executionLog.id} | 
              Duration: {results.executionLog.processing_time || 'N/A'}
            </p>
          )}
        </div>
      )}

      {status === 'duplicate' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm font-medium">⚠️ Payroll already processed for this date</p>
          <p className="text-sm mt-1">{error}</p>
          {results?.existingRecords && (
            <p className="text-sm mt-1">Existing records: {results.existingRecords.length}</p>
          )}
          <button
            onClick={handleReprocess}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            Reprocess Payroll
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm font-medium">✗ Error processing payroll</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Reprocess Confirmation Modal */}
      {showReprocessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Confirm Reprocess
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              This will delete all existing payroll records for {date} and process again. 
              This action cannot be undone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg mb-4">
              <p className="text-xs">
                ⚠️ Warning: Existing records will be permanently deleted.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReprocessModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmReprocess}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Reprocess
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Execution Info */}
      {status === 'idle' && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          <p className="text-sm">
            💡 Tip: Run "Analyze Payroll" first to preview results before processing.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessPayrollWidget;

