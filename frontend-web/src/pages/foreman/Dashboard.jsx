import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { payrollAPI, userAPI } from '../../services/api';
import MemberDetailModal from '../../components/MemberDetailModal';

const ForemanDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [teamData, setTeamData] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [dateError, setDateError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    loadTeamData();
  }, [dateRange]);

  const validateDateRange = () => {
    setDateError('');
    if (!dateRange.start || !dateRange.end) {
      setDateError('Please select both start and end dates');
      return false;
    }
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const todayDate = new Date(today);
    if (startDate > todayDate || endDate > todayDate) {
      setDateError('Dates cannot be in the future');
      return false;
    }
    if (startDate > endDate) {
      setDateError('Start date must be before or equal to end date');
      return false;
    }
    return true;
  };

  const loadTeamData = async () => {
    if (!validateDateRange()) {
      return;
    }

    try {
      setLoading(true);
      setDateError('');
      
      const crewId = user?.crew_id;
      if (!crewId) {
        setTeamData({
          teamName: 'My Team',
          totalPayout: 0,
          members: [],
        });
        setCompliance({
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          anomalies: 0,
          complianceRate: 0,
        });
        return;
      }
      
      // Fetch payroll records for this crew and date range
      const recordsResponse = await payrollAPI.getRecords({ 
        start_date: dateRange.start,
        end_date: dateRange.end,
        crew_id: crewId 
      });
      const records = recordsResponse.data?.records || [];
      
      // Fetch crew members to get additional info (employee_id, phone)
      let crewMembers = [];
      try {
        const usersResponse = await userAPI.getUsers({ crew_id: crewId, role: 'crew_member' });
        crewMembers = usersResponse.data?.data || usersResponse.data?.users || [];
      } catch (error) {
        // Silent fail - crew members optional
      }
      
      // Calculate compliance metrics
      const totalRecords = records.length;
      const approvedRecords = records.filter(r => r.approved === true).length;
      const pendingRecords = records.filter(r => !r.approved && (r.status === 'pending' || r.status === 'pending_review' || r.status === 'calculated')).length;
      const rejectedRecords = records.filter(r => r.status === 'rejected').length;
      const anomalyRecords = records.filter(r => r.has_anomalies === true).length;
      const complianceRate = totalRecords > 0 ? Math.round((approvedRecords / totalRecords) * 100) : 0;
      
      // Calculate total payout
      const totalPayout = records.reduce((sum, r) => sum + (r.total_pay || 0), 0);
      
      // Group records by employee to get member summaries
      const memberMap = {};
      records.forEach(record => {
        const empId = record.employee_id;
        if (!memberMap[empId]) {
          // Find user info for this employee
          const userInfo = crewMembers.find(u => u.id === empId);
          
          memberMap[empId] = {
            id: empId,
            name: record.employee_name || userInfo?.name || 'Unknown',
            employee_id: userInfo?.employee_id || 'N/A',
            phone: userInfo?.phone_number || 'N/A',
            totalPay: 0,
            recordCount: 0,
            approvedCount: 0,
            anomalyCount: 0,
            hasAnomalies: false,
            hours: 0,
          };
        }
        memberMap[empId].totalPay += record.total_pay || 0;
        memberMap[empId].recordCount += 1;
        memberMap[empId].hours += record.hours_worked || 0;
        if (record.approved) memberMap[empId].approvedCount += 1;
        if (record.has_anomalies) {
          memberMap[empId].anomalyCount += 1;
          memberMap[empId].hasAnomalies = true;
        }
      });
      
      // Convert to array and determine status
      const members = Object.values(memberMap).map(member => {
        let status = 'good';
        if (member.hasAnomalies) status = 'needs_attention';
        else if (member.totalPay > 0 && member.recordCount > 0) {
          const avgPay = member.totalPay / member.recordCount;
          // Consider high payers as excellent
          if (avgPay > 500) status = 'excellent';
        }
        
        return {
          ...member,
          pay: Math.round(member.totalPay),
          status: status
        };
      });
      
      // Sort by total pay (descending)
      members.sort((a, b) => b.pay - a.pay);
      
      // Generate alerts
      const newAlerts = [];
      if (pendingRecords > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${pendingRecords} payroll record(s) pending approval`,
        });
      }
      if (anomalyRecords > 0) {
        newAlerts.push({
          type: 'error',
          message: `${anomalyRecords} record(s) have anomalies that need attention`,
        });
      }
      if (complianceRate < 80 && totalRecords > 0) {
        newAlerts.push({
          type: 'warning',
          message: `Compliance rate is ${complianceRate}% - below target`,
        });
      }
      setAlerts(newAlerts);
      
      setTeamData({
        teamName: `Crew ${crewId}`,
        totalPayout: Math.round(totalPayout),
        members: members,
      });
      
      setCompliance({
        total: totalRecords,
        approved: approvedRecords,
        pending: pendingRecords,
        rejected: rejectedRecords,
        anomalies: anomalyRecords,
        complianceRate: complianceRate,
      });
    } catch (error) {
      console.error('Failed to load team data:', error);
      setTeamData({
        teamName: user?.crew_id ? `Crew ${user.crew_id}` : 'My Team',
        totalPayout: 0,
        members: [],
      });
      setCompliance({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        anomalies: 0,
        complianceRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '✓';
      case 'needs_attention': return '⚠️';
      default: return '•';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading team data...</p>
      </div>
    );
  }

  const getComplianceStatus = (rate) => {
    if (rate >= 95) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (rate >= 80) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (rate >= 60) return { text: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{teamData?.teamName} Performance</h1>
        <p className="text-gray-600 mt-1">Team performance and payroll compliance overview</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setDateRange({
                  start: yesterday.toISOString().split('T')[0],
                  end: yesterday.toISOString().split('T')[0],
                });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Yesterday
            </button>
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Last 7 Days
            </button>
          </div>
        </div>
        {dateError && (
          <p className="text-red-600 text-sm mt-2">{dateError}</p>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <p className={`font-medium ${
                alert.type === 'error' ? 'text-red-800' :
                alert.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {alert.type === 'error' ? '⚠️' : 'ℹ️'} {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payout</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${teamData?.totalPayout?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{teamData?.members?.length || 0}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{compliance?.complianceRate || 0}%</p>
            </div>
            <div className="text-3xl">✓</div>
          </div>
        </div>

        <div className={`rounded-lg shadow-md p-6 ${getComplianceStatus(compliance?.complianceRate || 0).bg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-2xl font-bold mt-1 ${getComplianceStatus(compliance?.complianceRate || 0).color}`}>
                {getComplianceStatus(compliance?.complianceRate || 0).text}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Compliance Metrics */}
      {compliance && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payroll Compliance</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-xl font-bold text-gray-900">{compliance.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-xl font-bold text-green-600">{compliance.approved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{compliance.pending}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-xl font-bold text-red-600">{compliance.rejected}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Anomalies</p>
              <p className="text-xl font-bold text-orange-600">{compliance.anomalies}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Performer */}
      {teamData?.members && teamData.members.length > 0 ? (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🏆 Top Performer</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-green-900">{teamData.members[0].name}</p>
              <p className="text-sm text-green-700 mt-1">Highest total payout in selected period!</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">${teamData.members[0].pay?.toLocaleString()}</p>
              <p className="text-sm text-green-700">Total Payout</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Team Members Summary Cards */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h3>
        {teamData?.members && teamData.members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamData.members.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  {getStatusIcon(member.status)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Payout:</span>
                  <span className="font-bold text-green-600">${member.pay?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Records:</span>
                  <span className="font-medium text-gray-900">{member.recordCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Approved:</span>
                  <span className="font-medium text-green-600">{member.approvedCount}</span>
                </div>
                {member.anomalyCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Anomalies:</span>
                    <span className="font-medium text-orange-600">{member.anomalyCount}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedMember(member)}
                className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                View Details
              </button>
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No team member data available</p>
          </div>
        )}
      </div>

      {/* Members Needing Attention */}
      {teamData?.members?.some(m => m.status === 'needs_attention') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Needs Attention</h3>
          <div className="space-y-2">
            {teamData.members
              .filter(m => m.status === 'needs_attention')
              .map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">
                      {member.anomalyCount > 0 ? `${member.anomalyCount} record(s) with anomalies` : 'Low payout'}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                    Follow Up
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/foreman/members')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm font-medium text-gray-800">View All Members</div>
          </button>
          <button
            onClick={() => navigate('/foreman/schedule')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="text-sm font-medium text-gray-800">Today's Schedule</div>
          </button>
          <button
            onClick={() => navigate('/foreman/history')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">📜</div>
            <div className="text-sm font-medium text-gray-800">Performance History</div>
          </button>
        </div>
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

export default ForemanDashboard;


