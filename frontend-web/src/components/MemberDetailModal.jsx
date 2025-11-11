import React from 'react';

const MemberDetailModal = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{member.employee_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Current Performance */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Payout</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">${member.pay?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Records</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{member.recordCount || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold text-purple-600 mt-1 capitalize">
              {member.status?.replace('_', ' ') || 'N/A'}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${member.pay?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Total Payout</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{member.hours?.toFixed(1) || 0}h</p>
              <p className="text-xs text-gray-600 mt-1">Hours Worked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{member.approvedCount || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{member.anomalyCount || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Anomalies</p>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">✓ Strengths</h4>
            <div className="space-y-2">
              {member.pay > 500 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">High Payout</p>
                  <p className="text-xs text-green-700 mt-1">Consistently high earnings</p>
                </div>
              )}
              {member.approvedCount > 0 && member.recordCount === member.approvedCount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">100% Approval Rate</p>
                  <p className="text-xs text-green-700 mt-1">All records approved</p>
                </div>
              )}
              {member.anomalyCount === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">No Anomalies</p>
                  <p className="text-xs text-green-700 mt-1">Clean performance record</p>
                </div>
              )}
              {member.anomalyCount === 0 && member.pay > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">Quality Work</p>
                  <p className="text-xs text-green-700 mt-1">No issues detected</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">⚠️ Areas for Improvement</h4>
            <div className="space-y-2">
              {member.hasAnomalies && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-900">Anomalies Detected</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {member.anomalyCount} record(s) have anomalies that need attention
                  </p>
                </div>
              )}
              {member.pay < 200 && member.recordCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-900">Low Payout</p>
                  <p className="text-xs text-yellow-700 mt-1">Consider reviewing work hours and performance</p>
                </div>
              )}
              {member.approvedCount < member.recordCount && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-900">Pending Approvals</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {member.recordCount - member.approvedCount} record(s) pending approval
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{member.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employee ID</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{member.employee_id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        {member.admin_notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Admin Notes</h4>
            <p className="text-sm text-blue-800">{member.admin_notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
