/**
 * Main Navigator
 * Clean Scapes P4P System - Mobile App
 * 
 * Bottom tab navigator for main app screens (Home, History, Profile)
 * with Stack Navigator for detail screens (Breakdown, Help).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

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

// Notification Badge Component
function NotificationBadge({ count }) {
  if (!count || count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export default function MainNavigator() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationAPI.getUnreadCount();
      const count = response.data?.count || response.data?.unread_count || 0;
      setUnreadCount(count);
    } catch (error) {
      // Silently fail - don't show errors for notification count
      console.error('Error fetching unread count:', error);
    }
  }, [currentUser]);

  // Fetch count on mount and when user changes
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Listen for navigation focus to refresh count
  const handleTabFocus = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

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
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: size, color }}>🏠</Text>
              <NotificationBadge count={unreadCount} />
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabFocus,
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

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

