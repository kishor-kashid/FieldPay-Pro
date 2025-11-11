import React from 'react';
import { Line } from 'react-chartjs-2';

const MemberDetailModal = ({ member, onClose }) => {
  if (!member) return null;

  // Mock 7-day performance data
  const performanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Efficiency (%)',
        data: [92, 95, 88, 94, 97, 93, member.efficiency],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Target (90%)',
        data: [90, 90, 90, 90, 90, 90, 90],
        borderColor: 'rgb(34, 197, 94)',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{member.name}</h3>
            <p className="text-gray-600 mt-1">ID: {member.employee_id || member.id}</p>
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
            <p className="text-sm text-gray-600">Current Efficiency</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{member.efficiency}%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Daily Pay</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${member.pay}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold text-purple-600 mt-1 capitalize">{member.status?.replace('_', ' ')}</p>
          </div>
        </div>

        {/* 7-Day Performance Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">7-Day Performance Trend</h4>
          <Line
            data={performanceData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 110,
                },
              },
            }}
          />
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">✓ Strengths</h4>
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900">Time Management</p>
                <p className="text-xs text-green-700 mt-1">Consistently on time</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900">Quality Work</p>
                <p className="text-xs text-green-700 mt-1">Few customer complaints</p>
              </div>
              {member.efficiency >= 95 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">High Efficiency</p>
                  <p className="text-xs text-green-700 mt-1">Above target performance</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">⚠️ Areas for Improvement</h4>
            <div className="space-y-2">
              {member.efficiency < 90 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-900">Efficiency Below Target</p>
                  <p className="text-xs text-yellow-700 mt-1">Focus on speed without compromising quality</p>
                </div>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-900">Lunch Break Duration</p>
                <p className="text-xs text-yellow-700 mt-1">Occasionally exceeds allowed time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Record */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Attendance Record (Last 30 Days)</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">28</p>
              <p className="text-xs text-gray-600 mt-1">Days Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">2</p>
              <p className="text-xs text-gray-600 mt-1">Days Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">0</p>
              <p className="text-xs text-gray-600 mt-1">Days Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">93%</p>
              <p className="text-xs text-gray-600 mt-1">Attendance Rate</p>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        {member.admin_notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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

