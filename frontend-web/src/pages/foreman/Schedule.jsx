import React, { useState } from 'react';

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock schedule data
  const jobs = [
    {
      id: 1,
      client: 'Green Valley HOA',
      location: '123 Park Ave, Springfield',
      service: 'Lawn Mowing',
      estimatedTime: '2.5 hours',
      assignedMembers: ['John Doe', 'Jane Smith'],
      startTime: '08:00 AM',
      budgetedHours: 2.5,
      status: 'scheduled',
    },
    {
      id: 2,
      client: 'Maple Street Plaza',
      location: '456 Maple St, Springfield',
      service: 'Hedge Trimming',
      estimatedTime: '1.5 hours',
      assignedMembers: ['Bob Johnson', 'Alice Brown'],
      startTime: '10:30 AM',
      budgetedHours: 1.5,
      status: 'scheduled',
    },
    {
      id: 3,
      client: 'Riverside Park',
      location: '789 River Rd, Springfield',
      service: 'Cleanup & Maintenance',
      estimatedTime: '3 hours',
      assignedMembers: ['Charlie Davis', 'Eva Martinez'],
      startTime: '01:00 PM',
      budgetedHours: 3.0,
      status: 'in_progress',
    },
    {
      id: 4,
      client: 'Sunset Gardens',
      location: '321 Sunset Blvd, Springfield',
      service: 'Installation',
      estimatedTime: '4 hours',
      assignedMembers: ['John Doe', 'Bob Johnson', 'Jane Smith'],
      startTime: '08:00 AM',
      budgetedHours: 4.0,
      status: 'completed',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return '📅';
      case 'in_progress': return '🔄';
      case 'completed': return '✓';
      default: return '•';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Schedule</h1>
        <p className="text-gray-600 mt-1">Today's assigned jobs and crew assignments</p>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Print Schedule
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {jobs.filter(j => j.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {jobs.filter(j => j.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {jobs.filter(j => j.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{job.client}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)} {job.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">📍 {job.location}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">{job.startTime}</p>
                <p className="text-xs text-gray-500 mt-1">{job.estimatedTime}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Service Type</p>
                <p className="text-sm font-medium text-gray-900">{job.service}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Budgeted Hours</p>
                <p className="text-sm font-medium text-gray-900">{job.budgetedHours}h</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Crew Size</p>
                <p className="text-sm font-medium text-gray-900">{job.assignedMembers.length} members</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Assigned Crew:</p>
              <div className="flex flex-wrap gap-2">
                {job.assignedMembers.map((member, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                  >
                    {member}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                View Map
              </button>
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                Contact Client
              </button>
              {job.status === 'scheduled' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  Start Job
                </button>
              )}
              {job.status === 'in_progress' && (
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
                  Complete Job
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Notes Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">📝 Important Notes</h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• Weather forecast: Sunny, 75°F - Good conditions for outdoor work</li>
          <li>• Riverside Park job requires specialized equipment - check van inventory</li>
          <li>• Sunset Gardens client prefers afternoon work (after 1 PM)</li>
        </ul>
      </div>
    </div>
  );
};

export default Schedule;

