/**
 * Authentication Context
 * Clean Scapes P4P System - Mobile App
 * 
 * Manages authentication state with AsyncStorage persistence.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import axios from 'axios';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

// AsyncStorage keys
const USER_PROFILE_KEY = '@user_profile';
const AUTH_TOKEN_KEY = '@auth_token';

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
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

  /**
   * Load user profile from AsyncStorage
   */
  useEffect(() => {
    loadStoredProfile();
  }, []);

  /**
   * Load stored user profile from AsyncStorage
   */
  async function loadStoredProfile() {
    try {
      const storedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Failed to load stored profile:', error);
    }
  }

  /**
   * Save user profile to AsyncStorage
   */
  async function saveProfile(profile) {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  /**
   * Clear stored profile
   */
  async function clearStoredProfile() {
    try {
      await AsyncStorage.removeItem(USER_PROFILE_KEY);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear stored profile:', error);
    }
  }

  /**
   * Login with email and password
   */
  async function login(email, password) {
    if (!auth) {
      const errorMessage = 'Firebase authentication is not configured. Please check your .env file.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user profile from backend
      const idToken = await getIdToken(userCredential.user);
      
      // Set token for API requests
      setAuthToken(idToken);
      
      // Store token
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
      
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
    if (!auth) {
      // If auth is not configured, just clear local state
      setUserProfile(null);
      setAuthToken(null);
      await clearStoredProfile();
      return;
    }

    try {
      setError(null);
      await signOut(auth);
      setUserProfile(null);
      
      // Clear API token
      setAuthToken(null);
      
      await clearStoredProfile();
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

      if (response.data.success) {
        setUserProfile(response.data.user);
        await saveProfile(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
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
        await saveProfile(response.data.user);
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
    if (!currentUser) {
      // Try to get stored token
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        setAuthToken(storedToken);
      }
      return storedToken;
    }
    try {
      const token = await getIdToken(currentUser);
      // Store token for offline use
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      // Set token for API requests
      setAuthToken(token);
      return token;
    } catch (error) {
      console.error('Failed to get ID token:', error);
      // Try to get stored token
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        setAuthToken(storedToken);
      }
      return storedToken;
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    // If Firebase auth is not configured, skip auth state listener
    if (!auth) {
      console.warn('⚠️ Firebase auth not configured. Skipping auth state listener.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile when user logs in
        try {
          const idToken = await getIdToken(user);
          // Set token for API requests
          setAuthToken(idToken);
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
          await fetchUserProfile(idToken);
        } catch (error) {
          console.error('Failed to fetch profile on auth state change:', error);
          // Try to use stored profile
          await loadStoredProfile();
        }
      } else {
        setUserProfile(null);
        // Clear API token
        setAuthToken(null);
        await clearStoredProfile();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
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

