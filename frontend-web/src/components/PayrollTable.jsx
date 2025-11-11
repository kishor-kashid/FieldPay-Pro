import React, { useState } from 'react';

const PayrollTable = ({ records, onAddNote, onViewDetails }) => {
  const [sortField, setSortField] = useState('employee_name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return multiplier;
    if (bVal == null) return -multiplier;
    
    if (typeof aVal === 'string') {
      return multiplier * aVal.localeCompare(bVal);
    }
    return multiplier * (aVal - bVal);
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('employee_name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Employee {sortField === 'employee_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('hours_worked')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Hours {sortField === 'hours_worked' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('base_rate')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Base Rate {sortField === 'base_rate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('total_penalties')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Penalties {sortField === 'total_penalties' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('total_pay')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Total Pay {sortField === 'total_pay' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('crew_id')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Crew {sortField === 'crew_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRecords.map((record) => (
              <tr key={record.id} className={record.has_anomaly ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.employee_name || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.hours_worked?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${record.base_rate?.toFixed(2) || '0.00'}/hr
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  ${record.total_penalties?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${record.total_pay?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.crew_id || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onViewDetails(record)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onAddNote(record)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Note
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedRecords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No payroll records found</p>
        </div>
      )}
    </div>
  );
};

export default PayrollTable;

