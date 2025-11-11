/**
 * Auth Navigator
 * Clean Scapes P4P System - Mobile App
 * 
 * Stack navigator for authentication screens (login, etc.).
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide header for login screen
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

