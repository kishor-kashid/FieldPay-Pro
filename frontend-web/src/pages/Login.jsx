import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Use AuthContext login which handles Firebase auth and fetches profile
      console.log('Starting login process...');
      await login(email, password);
      console.log('Login completed, waiting for profile...');

      // Poll for user profile with retries
      let retries = 0;
      const maxRetries = 15;
      const checkInterval = 300; // Check every 300ms
      
      const checkProfile = setInterval(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        retries++;
        
        console.log(`Profile check attempt ${retries}:`, storedUser);
        
        // Check if user data is available
        if (storedUser && storedUser.role) {
          clearInterval(checkProfile);
          console.log('Profile loaded successfully, role:', storedUser.role);
          
          // Check if crew member - they should not access web app
          if (storedUser.role === 'crew_member') {
            console.log('Crew member detected, denying access');
            setError('Invalid email or password');
            setLoading(false);
            // Logout the user
            logout();
            return;
          }
          
          // Redirect based on role
          console.log('Redirecting user based on role:', storedUser.role);
          switch (storedUser.role) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'manager':
              navigate('/manager/dashboard');
              break;
            case 'foreman':
              navigate('/foreman/dashboard');
              break;
            default:
              console.error('Unknown role:', storedUser.role);
              setError('Invalid user role. Please contact your administrator.');
              setLoading(false);
          }
        } else if (retries >= maxRetries) {
          // Timeout after max retries
          clearInterval(checkProfile);
          console.error('Profile load timeout after', maxRetries, 'attempts');
          setError('Failed to load user profile. Please try again.');
          setLoading(false);
          logout();
        }
      }, checkInterval);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FieldPay-Pro</h1>
          <p className="text-gray-600">Clean Scapes P4P System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default test password: <code className="bg-gray-100 px-2 py-1 rounded">password123</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

