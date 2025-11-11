/**
 * Main Navigator
 * Clean Scapes P4P System - Mobile App
 * 
 * Bottom tab navigator for main app screens (Home, History, Profile)
 * with Stack Navigator for detail screens (Breakdown, Help).
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

// Tab Screens
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Stack Screens
import BreakdownScreen from '../screens/BreakdownScreen';
import HelpScreen from '../screens/HelpScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Dashboard tab (includes Breakdown)
function DashboardStack() {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Breakdown"
        component={BreakdownScreen}
        options={{
          title: t('breakdown.title'),
          headerBackTitle: t('common.back'),
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for History tab (includes Breakdown)
function HistoryStack() {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Breakdown"
        component={BreakdownScreen}
        options={{
          title: t('breakdown.title'),
          headerBackTitle: t('common.back'),
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for Profile tab (includes Help)
function ProfileStack() {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: t('help.title'),
          headerBackTitle: t('common.back'),
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{
          title: t('dashboard.title'),
          tabBarLabel: t('dashboard.title'),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          title: t('history.title'),
          tabBarLabel: t('history.title'),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: t('profile.title'),
          tabBarLabel: t('profile.title'),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

