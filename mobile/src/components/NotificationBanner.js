/**
 * Notification Banner Component (Mobile)
 * Displays notification banner on home screen with tap to view details
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const NotificationBanner = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [notification, setNotification] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  // Fetch latest unread notification
  const fetchLatestNotification = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications?read=false&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const newNotification = data.data[0];
          // Only show if it's a different notification
          if (!notification || notification.id !== newNotification.id) {
            setNotification(newNotification);
            showBanner();
          }
        } else {
          setNotification(null);
        }
      }
    } catch (error) {
      console.error('Error fetching notification:', error);
    }
  };

  // Show banner animation
  const showBanner = () => {
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
  };

  // Hide banner animation
  const hideBanner = () => {
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
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle notification tap
  const handleNotificationTap = () => {
    if (notification) {
      markAsRead(notification.id);
      
      // Navigate based on notification type
      if (notification.link) {
        // Parse the link and navigate accordingly
        // This is a simplified version - you may need more complex routing
        if (notification.link.includes('dashboard')) {
          navigation.navigate('Dashboard');
        } else if (notification.link.includes('history')) {
          navigation.navigate('History');
        }
      }
      
      hideBanner();
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    if (notification) {
      markAsRead(notification.id);
    }
    hideBanner();
  };

  useEffect(() => {
    if (user) {
      fetchLatestNotification();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchLatestNotification, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

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
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
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

