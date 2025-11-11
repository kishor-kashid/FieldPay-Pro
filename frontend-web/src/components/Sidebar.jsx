import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role = 'admin' }) => {
  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/upload', label: 'Upload Data', icon: '📤' },
    { path: '/admin/review', label: 'Review Payroll', icon: '📋' },
    { path: '/admin/approve', label: 'Approve & Export', icon: '✓' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  const managerLinks = [
    { path: '/manager/dashboard', label: 'Overview', icon: '📊' },
    { path: '/manager/teams', label: 'Teams', icon: '👥' },
    { path: '/manager/analytics', label: 'Analytics', icon: '📈' },
  ];

  const foremanLinks = [
    { path: '/foreman/dashboard', label: 'My Team', icon: '👥' },
    { path: '/foreman/members', label: 'Team Members', icon: '👤' },
    { path: '/foreman/schedule', label: 'Schedule', icon: '📅' },
    { path: '/foreman/history', label: 'History', icon: '📜' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'manager' ? managerLinks : foremanLinks;

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">FieldPay-Pro</h1>
        <p className="text-gray-400 text-sm mt-1 capitalize">{role} Portal</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

