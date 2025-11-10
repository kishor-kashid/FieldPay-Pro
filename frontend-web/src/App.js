import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components - will be implemented in later PRs
const Login = () => <div className="p-8">Login Page (Coming Soon)</div>;
const AdminDashboard = () => <div className="p-8">Admin Dashboard (Coming Soon)</div>;
const ManagerDashboard = () => <div className="p-8">Manager Dashboard (Coming Soon)</div>;
const ForemanDashboard = () => <div className="p-8">Foreman Dashboard (Coming Soon)</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/manager/*" element={<ManagerDashboard />} />
        <Route path="/foreman/*" element={<ForemanDashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

