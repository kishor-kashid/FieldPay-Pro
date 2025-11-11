import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { payrollAPI, userAPI } from '../../services/api';
import MemberDetailModal from '../../components/MemberDetailModal';

const TeamMembers = () => {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgPayout: 0,
    totalPayout: 0,
    needsAttention: 0,
  });

  useEffect(() => {
    loadTeamMembers();
  }, [filterDate]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      
      const crewId = user?.crew_id;
      if (!crewId) {
        setMembers([]);
        setStats({ total: 0, avgPayout: 0, totalPayout: 0, needsAttention: 0 });
        return;
      }

      // Fetch crew members from users API
      const usersResponse = await userAPI.getUsers({ crew_id: crewId, role: 'crew_member' });
      const users = usersResponse.data?.data || usersResponse.data?.users || [];
      
      // Fetch payroll records for the selected date
      const recordsResponse = await payrollAPI.getRecords({ 
        date: filterDate,
        crew_id: crewId 
      });
      const records = recordsResponse.data?.records || [];

      // Combine user data with payroll records
      const membersData = users.map(user => {
        const userRecords = records.filter(r => r.employee_id === user.id);
        const totalPay = userRecords.reduce((sum, r) => sum + (r.total_pay || 0), 0);
        const hasAnomalies = userRecords.some(r => r.has_anomalies === true);
        const approvedCount = userRecords.filter(r => r.approved === true).length;
        
        let status = 'good';
        if (hasAnomalies) status = 'needs_attention';
        else if (totalPay > 500) status = 'excellent';
        
        return {
          id: user.id,
          name: user.name || 'Unknown',
          employee_id: user.employee_id || 'N/A',
          pay: Math.round(totalPay),
          hours: userRecords.reduce((sum, r) => sum + (r.hours_worked || 0), 0),
          status: status,
          phone: user.phone_number || 'N/A',
          recordCount: userRecords.length,
          approvedCount: approvedCount,
          hasAnomalies: hasAnomalies,
        };
      });

      // Calculate stats
      const totalPayout = membersData.reduce((sum, m) => sum + m.pay, 0);
      const avgPayout = membersData.length > 0 ? totalPayout / membersData.length : 0;
      const needsAttention = membersData.filter(m => m.status === 'needs_attention').length;

      setMembers(membersData);
      setStats({
        total: membersData.length,
        avgPayout: Math.round(avgPayout),
        totalPayout: Math.round(totalPayout),
        needsAttention: needsAttention,
      });
    } catch (error) {
      console.error('Failed to load team members:', error);
      setMembers([]);
      setStats({ total: 0, avgPayout: 0, totalPayout: 0, needsAttention: 0 });
    } finally {
      setLoading(false);
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'pay':
        return b.pay - a.pay;
      case 'status':
        const statusOrder = { 'excellent': 3, 'good': 2, 'needs_attention': 1 };
        return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading team members...</p>
      </div>
    );
  }

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
              max={new Date().toISOString().split('T')[0]}
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
              <option value="pay">Earnings</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setFilterDate(yesterday.toISOString().split('T')[0]);
              }}
              className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Yesterday
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Avg Payout</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">${stats.avgPayout}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Payout</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${stats.totalPayout.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Needs Attention</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.needsAttention}</p>
        </div>
      </div>

      {/* Member Cards */}
      {members.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No team members found for the selected date.</p>
          <p className="text-gray-400 text-sm mt-2">Try selecting a different date or ensure payroll has been processed.</p>
        </div>
      ) : (
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
                  <span className="text-sm text-gray-600">Total Payout:</span>
                  <span className="text-lg font-bold text-green-600">${member.pay.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hours Worked:</span>
                  <span className="text-sm font-medium text-gray-900">{member.hours.toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Records:</span>
                  <span className="text-sm font-medium text-gray-900">{member.recordCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved:</span>
                  <span className="text-sm font-medium text-green-600">{member.approvedCount}</span>
                </div>
                {member.hasAnomalies && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Anomalies:</span>
                    <span className="text-sm font-medium text-orange-600">Yes</span>
                  </div>
                )}
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
      )}

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
