import React, { useState } from 'react';
import MemberDetailModal from '../../components/MemberDetailModal';

const TeamMembers = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data
  const members = [
    { id: 1, name: 'John Doe', employee_id: 'E001', efficiency: 105, pay: 520, hours: 8.5, status: 'excellent', phone: '555-0101' },
    { id: 2, name: 'Jane Smith', employee_id: 'E002', efficiency: 98, pay: 480, hours: 8.0, status: 'excellent', phone: '555-0102' },
    { id: 3, name: 'Bob Johnson', employee_id: 'E003', efficiency: 92, pay: 450, hours: 8.2, status: 'good', phone: '555-0103' },
    { id: 4, name: 'Alice Brown', employee_id: 'E004', efficiency: 88, pay: 420, hours: 8.0, status: 'good', phone: '555-0104' },
    { id: 5, name: 'Charlie Davis', employee_id: 'E005', efficiency: 78, pay: 380, hours: 7.8, status: 'needs_attention', phone: '555-0105' },
    { id: 6, name: 'Eva Martinez', employee_id: 'E006', efficiency: 94, pay: 460, hours: 8.1, status: 'excellent', phone: '555-0106' },
  ];

  const sortedMembers = [...members].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'efficiency':
        return b.efficiency - a.efficiency;
      case 'pay':
        return b.pay - a.pay;
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-600 mt-1">Detailed view of all crew members</p>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="efficiency">Efficiency</option>
              <option value="pay">Earnings</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{members.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Avg Efficiency</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {(members.reduce((sum, m) => sum + m.efficiency, 0) / members.length).toFixed(0)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Payout</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${members.reduce((sum, m) => sum + m.pay, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Needs Attention</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {members.filter(m => m.status === 'needs_attention').length}
          </p>
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.employee_id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                {member.status === 'excellent' ? '🌟' : member.status === 'good' ? '✓' : '⚠️'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Efficiency:</span>
                <span className={`text-lg font-bold ${
                  member.efficiency >= 95 ? 'text-green-600' :
                  member.efficiency >= 85 ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {member.efficiency}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Pay:</span>
                <span className="text-lg font-bold text-green-600">${member.pay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hours Worked:</span>
                <span className="text-sm font-medium text-gray-900">{member.hours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="text-sm font-medium text-gray-900">{member.phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                View Full Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default TeamMembers;

