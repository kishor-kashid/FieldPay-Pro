/**
 * Auth Service
 * Clean Scapes P4P System - Mobile App
 * 
 * Authentication service wrapper for Firebase and backend API.
 * Note: Most auth logic is in AuthContext, this provides convenience methods.
 */

import { signInWithEmailAndPassword, signOut, getIdToken } from 'firebase/auth';
import { auth } from '../config/firebase';
import { setAuthToken } from './api';
import { saveToken, getToken, clearAll } from '../utils/storage';

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User credential
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(userCredential.user);
    
    // Save token to storage
    await saveToken(idToken);
    
    // Set token for API requests
    setAuthToken(idToken);
    
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await signOut(auth);
    
    // Clear token
    setAuthToken(null);
    
    // Clear storage
    await clearAll();
  } catch (error) {
    throw new Error(error.message || 'Logout failed');
  }
}

/**
 * Get current user's ID token
 * @returns {Promise<string|null>} ID token or null
 */
export async function getAuthToken() {
  try {
    const user = auth.currentUser;
    if (!user) {
      // Try to get stored token
      return await getToken();
    }
    
    const token = await getIdToken(user);
    
    // Save token
    await saveToken(token);
    
    // Set token for API requests
    setAuthToken(token);
    
    return token;
  } catch (error) {
    console.error('Failed to get token:', error);
    // Try to get stored token as fallback
    return await getToken();
  }
}

/**
 * Save token to storage and set for API
 * @param {string} token - ID token
 * @returns {Promise<void>}
 */
export async function saveAuthToken(token) {
  await saveToken(token);
  setAuthToken(token);
}

