import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import PayrollTable from '../../components/PayrollTable';

const Review = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    status: '',
    crew_id: '',
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [noteModal, setNoteModal] = useState({ open: false, record: null, note: '' });

  useEffect(() => {
    loadRecords();
  }, [filters]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await payrollAPI.getRecords(filters);
      setRecords(response.data.records || []);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const handleAddNote = (record) => {
    setNoteModal({ open: true, record, note: record.admin_notes || '' });
  };

  const handleSaveNote = async () => {
    try {
      await payrollAPI.approveRecord(noteModal.record.id, noteModal.note);
      setNoteModal({ open: false, record: null, note: '' });
      loadRecords();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Review Payroll</h1>
        <p className="text-gray-600 mt-1">Review and flag payroll records before approval</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Crew</label>
            <select
              value={filters.crew_id}
              onChange={(e) => setFilters({ ...filters, crew_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Crews</option>
              <option value="1">Crew 1</option>
              <option value="2">Crew 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{records.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Anomalies</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {records.filter(r => r.has_anomaly).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {records.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {records.filter(r => r.status === 'approved').length}
          </p>
        </div>
      </div>

      {/* Payroll Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading records...</p>
        </div>
      ) : (
        <PayrollTable
          records={records}
          onViewDetails={handleViewDetails}
          onAddNote={handleAddNote}
        />
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Payroll Details</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee</p>
                  <p className="font-medium">{selectedRecord.employee_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours Worked</p>
                  <p className="font-medium">{selectedRecord.hours_worked?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="font-medium">{selectedRecord.efficiency_score?.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Base Pay</p>
                  <p className="font-medium">${selectedRecord.base_pay?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bonus</p>
                  <p className="font-medium text-green-600">${selectedRecord.performance_bonus?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Penalties</p>
                  <p className="font-medium text-red-600">${selectedRecord.penalties?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pay</p>
                  <p className="font-medium text-lg">${selectedRecord.total_pay?.toFixed(2)}</p>
                </div>
              </div>

              {selectedRecord.admin_notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedRecord.admin_notes}</p>
                  </div>
                </div>
              )}

              {selectedRecord.anomaly_reason && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-1">⚠️ Anomaly Detected</p>
                  <p className="text-sm text-yellow-700">{selectedRecord.anomaly_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Admin Note</h3>
            <textarea
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Enter notes about this payroll record..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setNoteModal({ open: false, record: null, note: '' })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;

