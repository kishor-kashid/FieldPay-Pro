/**
 * Authentication Context
 * Clean Scapes P4P System - Web Frontend
 * 
 * Manages authentication state and provides auth methods to components.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const AuthContext = createContext();

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  /**
   * Login with email and password
   */
  async function login(email, password) {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user profile from backend
      const idToken = await getIdToken(userCredential.user);
      await fetchUserProfile(idToken);
      
      return userCredential.user;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout current user
   */
  async function logout() {
    try {
      setError(null);
      await signOut(auth);
      setUserProfile(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    } catch (error) {
      const errorMessage = error.message || 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetch user profile from backend
   */
  async function fetchUserProfile(idToken) {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      if (response.data.success || response.data.user) {
        const userData = response.data.user;
        setUserProfile(userData);
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        // Also store the Firebase ID token for axios interceptor
        localStorage.setItem('authToken', idToken);
        return userData;
      }
    } catch (error) {
      // Don't throw - allow user to stay logged in even if profile fetch fails
    }
  }

  /**
   * Update user's preferred language
   */
  async function updateLanguage(language) {
    try {
      setError(null);
      const idToken = await getIdToken(currentUser);
      
      const response = await axios.patch(
        `${API_URL}/auth/language`,
        { preferred_language: language },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      if (response.data.success) {
        setUserProfile(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update language';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user's ID token
   */
  async function getToken() {
    if (!currentUser) return null;
    try {
      const token = await getIdToken(currentUser);
      // Update the token in localStorage for axios interceptor
      localStorage.setItem('authToken', token);
      return token;
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile when user logs in
        try {
          const idToken = await getIdToken(user);
          await fetchUserProfile(idToken);
        } catch (error) {
          // Silent fail - allow user to stay logged in
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    user: userProfile, // Alias for compatibility
    userProfile,
    login,
    logout,
    updateLanguage,
    getToken,
    loading,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

