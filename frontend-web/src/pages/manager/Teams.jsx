import React, { useState, useEffect } from 'react';
import { payrollAPI, userAPI } from '../../services/api';

const Teams = () => {
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    loadCrewsData();
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

  const loadCrewsData = async () => {
    if (!validateDateRange()) {
      return;
    }

    try {
      setLoading(true);
      setDateError('');

      // Fetch all users to get crew information
      const usersResponse = await userAPI.getUsers();
      // API returns { success: true, count: number, data: users[] }
      const users = usersResponse.data?.data || usersResponse.data || [];

      // Get all foremen (they represent crews)
      const foremen = users.filter(u => u.role === 'foreman');
      
      // Fetch payroll records for the date range
      const recordsResponse = await payrollAPI.getRecords({ 
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      const records = recordsResponse.data?.records || [];

      // Group records by crew_id
      const crewDataMap = {};
      
      foremen.forEach(foreman => {
        // Normalize crew_id values for matching (handle strings, numbers, nulls)
        const foremanCrewId = foreman.crew_id ? String(foreman.crew_id).trim() : null;
        const foremanId = foreman.id ? String(foreman.id) : null;
        
        // Match records by crew_id - try multiple formats
        const crewRecords = records.filter(r => {
          const recordCrewId = r.crew_id ? String(r.crew_id).trim() : null;
          
          // Try exact match with foreman's crew_id
          if (foremanCrewId && recordCrewId === foremanCrewId) {
            return true;
          }
          
          // Try case-insensitive match
          if (foremanCrewId && recordCrewId && 
              foremanCrewId.toLowerCase() === recordCrewId.toLowerCase()) {
            return true;
          }
          
          // Try matching with foreman's id (if crew_id is not set)
          if (!foremanCrewId && foremanId && recordCrewId === foremanId) {
            return true;
          }
          
          // Extract numbers from crew_id strings and match
          // e.g., "CREW1" -> 1, "foreman1" -> 1, "CREW2" -> 2, "foreman2" -> 2
          if (foremanCrewId && recordCrewId) {
            const foremanNumMatch = foremanCrewId.match(/\d+/);
            const recordNumMatch = recordCrewId.match(/\d+/);
            if (foremanNumMatch && recordNumMatch) {
              const foremanNum = parseInt(foremanNumMatch[0], 10);
              const recordNum = parseInt(recordNumMatch[0], 10);
              if (foremanNum === recordNum) {
                return true;
              }
            }
          }
          
          // Try numeric comparison if both are numeric
          if (foremanCrewId && recordCrewId) {
            const foremanNum = parseInt(foremanCrewId, 10);
            const recordNum = parseInt(recordCrewId, 10);
            if (!isNaN(foremanNum) && !isNaN(recordNum) && foremanNum === recordNum) {
              return true;
            }
          }
          
          // Try matching patterns: CREW1/foreman1, CREW2/foreman2, etc.
          // Extract the number and check if they match
          if (foremanCrewId && recordCrewId) {
            // Pattern: "CREW" + number or "foreman" + number
            const foremanPattern = foremanCrewId.match(/^(?:crew|foreman)(\d+)$/i);
            const recordPattern = recordCrewId.match(/^(?:crew|foreman)(\d+)$/i);
            if (foremanPattern && recordPattern) {
              if (foremanPattern[1] === recordPattern[1]) {
                return true;
              }
            }
          }
          
          return false;
        });
        
        // Match crew members
        const crewMembers = users.filter(u => {
          if (u.role !== 'crew_member') return false;
          const userCrewId = u.crew_id ? String(u.crew_id).trim() : null;
          
          if (foremanCrewId && userCrewId === foremanCrewId) {
            return true;
          }
          if (!foremanCrewId && foremanId && userCrewId === foremanId) {
            return true;
          }
          
          return false;
        });
        
        // Always create crew entry if there are members, even if no records
        if (crewMembers.length > 0 || crewRecords.length > 0) {
          // Calculate total payout across all dates in range
          const totalPayout = crewRecords.reduce((sum, r) => sum + (r.total_pay || 0), 0);
          
          // Aggregate top performers by total pay across all dates
          // Group by employee and sum their pay
          const employeePayMap = {};
          crewRecords.forEach(r => {
            const empName = r.employee_name || 'Unknown';
            if (!employeePayMap[empName]) {
              employeePayMap[empName] = {
                name: empName,
                totalPay: 0,
                recordCount: 0
              };
            }
            employeePayMap[empName].totalPay += r.total_pay || 0;
            employeePayMap[empName].recordCount++;
          });
          
          // Get top 3 performers by total pay across date range
          const topMembers = Object.values(employeePayMap)
            .sort((a, b) => b.totalPay - a.totalPay)
            .slice(0, 3)
            .map(emp => ({
              name: emp.name,
              pay: Math.round(emp.totalPay),
              recordCount: emp.recordCount
            }));

          // Calculate average payout per record
          const avgPayoutPerRecord = crewRecords.length > 0 
            ? totalPayout / crewRecords.length 
            : 0;

          // Status based on anomalies, payout, or compliance
          let status = 'good';
          const hasAnomalies = crewRecords.some(r => r.has_anomalies);
          const approvedCount = crewRecords.filter(r => r.approved).length;
          const complianceRate = crewRecords.length > 0 
            ? (approvedCount / crewRecords.length) * 100 
            : 0;
          
          if (hasAnomalies) status = 'needs_improvement';
          else if (complianceRate >= 90) status = 'excellent';
          else if (complianceRate >= 80) status = 'good';

          // Use a consistent key for the crew
          const crewKey = foremanCrewId || foremanId || 'unknown';
          
          crewDataMap[crewKey] = {
            id: crewKey,
            name: foreman.crew_id ? `Crew ${foreman.crew_id}` : (foreman.id ? `Crew ${foreman.id}` : 'Unknown Crew'),
            foreman: foreman.name || 'Unknown',
            members: crewMembers.length,
            totalPayout: Math.round(totalPayout),
            totalRecords: crewRecords.length,
            avgPayoutPerRecord: Math.round(avgPayoutPerRecord),
            status: status,
            topMembers: topMembers,
            approvedCount: approvedCount,
            anomalyCount: crewRecords.filter(r => r.has_anomalies).length,
            crewId: foremanCrewId || foremanId // Store for reference
          };
        }
      });

      setCrews(Object.values(crewDataMap));
    } catch (error) {
      console.error('Failed to load crews data:', error);
      setCrews([]);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_improvement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'needs_improvement': return 'Needs Improvement';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading teams data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
        <p className="text-gray-600 mt-1">View and compare crew performance</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date().toISOString().split('T')[0];
                if (selectedDate <= today) {
                  setDateRange({ ...dateRange, start: selectedDate });
                  setDateError('');
                }
              }}
              max={dateRange.end || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date().toISOString().split('T')[0];
                if (selectedDate <= today) {
                  setDateRange({ ...dateRange, end: selectedDate });
                  setDateError('');
                }
              }}
              min={dateRange.start}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setDateRange({
                  start: yesterday.toISOString().split('T')[0],
                  end: yesterday.toISOString().split('T')[0]
                });
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Yesterday
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                setDateRange({
                  start: weekAgo.toISOString().split('T')[0],
                  end: today.toISOString().split('T')[0]
                });
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Last 7 Days
            </button>
          </div>
        </div>
        {dateError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{dateError}</p>
          </div>
        )}
      </div>

      {/* Crew Cards */}
      {crews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {crews.map((crew) => (
          <div
            key={crew.id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCrew(crew)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{crew.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crew.status)}`}>
                {getStatusLabel(crew.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Foreman:</span>
                <span className="font-medium text-gray-900">{crew.foreman}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Members:</span>
                <span className="font-medium text-gray-900">{crew.members}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Efficiency:</span>
                <span className="font-medium text-blue-600">N/A</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Payout:</span>
                <span className="font-medium text-green-600">${crew.totalPayout.toLocaleString()}</span>
              </div>
              {crew.totalRecords > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Records:</span>
                  <span className="font-medium text-gray-900">{crew.totalRecords}</span>
                </div>
              )}
            </div>

            <button className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
              View Details
            </button>
          </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center py-8">No crews found</p>
        </div>
      )}

      {/* Detailed Crew View Modal */}
      {selectedCrew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{selectedCrew.name}</h3>
                <p className="text-gray-600 mt-1">Foreman: {selectedCrew.foreman}</p>
              </div>
              <button
                onClick={() => setSelectedCrew(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Crew Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{selectedCrew.members}</p>
                {selectedCrew.totalRecords > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{selectedCrew.totalRecords} records</p>
                )}
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Avg Payout/Record</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${selectedCrew.avgPayoutPerRecord?.toLocaleString() || '0'}
                </p>
                {selectedCrew.totalRecords > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Per record</p>
                )}
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Payout</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">${selectedCrew.totalPayout.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Date range total</p>
              </div>
            </div>

            {/* Additional Stats */}
            {selectedCrew.totalRecords > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{selectedCrew.approvedCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedCrew.totalRecords > 0 
                      ? Math.round(((selectedCrew.approvedCount || 0) / selectedCrew.totalRecords) * 100) 
                      : 0}% compliance
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Anomalies</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{selectedCrew.anomalyCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Need review</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">{selectedCrew.totalRecords}</p>
                  <p className="text-xs text-gray-500 mt-1">In date range</p>
                </div>
              </div>
            )}

            {/* Top Performers */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Performers</h4>
              {selectedCrew.topMembers && selectedCrew.topMembers.length > 0 ? (
                <div className="space-y-3">
                  {selectedCrew.topMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      {member.recordCount > 1 && (
                        <p className="text-xs text-gray-500 mt-1">{member.recordCount} records</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${member.pay?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-gray-500">
                        {member.recordCount > 1 ? 'Total Pay' : 'Daily Pay'}
                      </p>
                    </div>
                  </div>
                  ))}
                </div>
              ) : selectedCrew.totalRecords === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    No payroll records found for this crew in the selected date range ({dateRange.start} to {dateRange.end}).
                  </p>
                  <p className="text-yellow-700 text-xs mt-2">
                    Try selecting a different date range or ensure payroll has been processed for this crew.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No performance data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;

