/**
 * App Navigator
 * Clean Scapes P4P System - Mobile App
 * 
 * Root navigator that switches between Auth and Main navigators based on auth state.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Show loading screen while checking auth state
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

