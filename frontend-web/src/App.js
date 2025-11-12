import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';

// Layouts
import AdminLayout from './components/AdminLayout';
import ManagerLayout from './components/ManagerLayout';
import ForemanLayout from './components/ForemanLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Upload from './pages/admin/Upload';
import Review from './pages/admin/Review';
import Approve from './pages/admin/Approve';
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import Teams from './pages/manager/Teams';
import Analytics from './pages/manager/Analytics';

// Foreman Pages
import ForemanDashboard from './pages/foreman/Dashboard';
import TeamMembers from './pages/foreman/TeamMembers';
import Schedule from './pages/foreman/Schedule';
import History from './pages/foreman/History';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="review" element={<Review />} />
            <Route path="approve" element={<Approve />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Manager Routes */}
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="teams" element={<Teams />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Foreman Routes */}
          <Route path="/foreman" element={<ForemanLayout />}>
            <Route index element={<Navigate to="/foreman/dashboard" replace />} />
            <Route path="dashboard" element={<ForemanDashboard />} />
            <Route path="members" element={<TeamMembers />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="history" element={<History />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

