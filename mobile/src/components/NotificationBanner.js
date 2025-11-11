/**
 * Notification Banner Component (Mobile)
 * Clean Scapes P4P System - Mobile App
 * 
 * Displays notification banner on dashboard when new results are available.
 * Shows at top of screen with tap to view details or dismiss.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { notificationAPI } from '../services/api';

const NotificationBanner = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const [notification, setNotification] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  // Hide banner animation
  const hideBanner = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setNotification(null);
    });
  }, [fadeAnim, slideAnim]);

  // Show banner animation
  const showBanner = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true
      })
    ]).start();

    // Auto-hide after 10 seconds
    setTimeout(hideBanner, 10000);
  }, [fadeAnim, slideAnim, hideBanner]);

  // Fetch latest unread notification
  const fetchLatestNotification = useCallback(async () => {
    if (!currentUser) return;

    try {
      const response = await notificationAPI.getNotifications({ 
        read: false, 
        limit: 1 
      });

      // Backend returns: { success: true, data: [...] } or { success: true, notifications: [...] }
      const notifications = response.data?.data || response.data?.notifications || [];
      
      if (notifications && notifications.length > 0) {
        const newNotification = notifications[0];
        // Only show if it's a different notification
        setNotification((prev) => {
          if (!prev || prev.id !== newNotification.id) {
            return newNotification;
          }
          return prev;
        });
      } else {
        setNotification(null);
      }
    } catch (error) {
      // Silently fail - don't show errors for notifications
      console.error('Error fetching notification:', error);
    }
  }, [currentUser]);
  
  // Show banner when notification is set
  useEffect(() => {
    if (notification) {
      showBanner();
    }
  }, [notification, showBanner]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!currentUser || !notificationId) return;

    try {
      await notificationAPI.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [currentUser]);

  // Handle notification tap
  const handleNotificationTap = useCallback(() => {
    if (notification) {
      markAsRead(notification.id);
      
      // Navigate based on notification link or type
      if (notification.link) {
        // Parse the link and navigate accordingly
        if (notification.link.includes('dashboard') || notification.link.includes('/dashboard')) {
          navigation.navigate('Home', { screen: 'Dashboard' });
        } else if (notification.link.includes('history') || notification.link.includes('/history')) {
          navigation.navigate('History', { screen: 'History' });
        } else if (notification.link.includes('breakdown') || notification.link.includes('/breakdown')) {
          // Extract recordId or date from link if available
          navigation.navigate('Home', { 
            screen: 'Breakdown',
            params: { recordId: notification.record_id || notification.data?.record_id }
          });
        }
      } else {
        // Default: navigate to dashboard
        navigation.navigate('Home', { screen: 'Dashboard' });
      }
      
      hideBanner();
    }
  }, [notification, markAsRead, navigation]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    if (notification) {
      markAsRead(notification.id);
    }
    hideBanner();
  }, [notification, markAsRead, hideBanner]);

  useEffect(() => {
    if (currentUser) {
      fetchLatestNotification();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchLatestNotification, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchLatestNotification]);

  // Get banner color based on notification type
  const getBannerColor = (type) => {
    switch (type) {
      case 'success':
        return '#10B981'; // green
      case 'warning':
        return '#F59E0B'; // yellow/amber
      case 'error':
        return '#EF4444'; // red
      default:
        return '#3B82F6'; // blue
    }
  };

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.banner,
          { backgroundColor: getBannerColor(notification.type) }
        ]}
        onPress={handleNotificationTap}
        activeOpacity={0.9}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon(notification.type)}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title || t('notifications.newResults')}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message || t('notifications.newResultsDescription')}
          </Text>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 16,
    right: 16,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default NotificationBanner;

