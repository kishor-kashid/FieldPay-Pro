/**
 * Profile Screen
 * Clean Scapes P4P System - Mobile App
 * 
 * Profile screen with user info, language preference, settings, and logout.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import LanguageToggle from '../components/LanguageToggle';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { userProfile, logout } = useAuth();
  const { currentLanguage, switchLanguage } = useLanguage();
  const [updatingLanguage, setUpdatingLanguage] = useState(false);

  // Update language preference when language changes
  const handleLanguageChange = async (newLanguage) => {
    try {
      setUpdatingLanguage(true);
      
      // Switch language in context (this also saves to storage)
      await switchLanguage(newLanguage);
      
      // Update language preference on server
      if (userProfile?.id) {
        await authAPI.updateLanguage(newLanguage);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert(t('common.error'), t('errors.networkError'));
    } finally {
      setUpdatingLanguage(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{userProfile.name || 'User'}</Text>
        <Text style={styles.role}>{userProfile.role || 'Crew Member'}</Text>
      </View>

      {/* User Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.title')}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('profile.name')}</Text>
          <Text style={styles.infoValue}>{userProfile.name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('profile.email')}</Text>
          <Text style={styles.infoValue}>{userProfile.email || 'N/A'}</Text>
        </View>

        {userProfile.employee_id && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.employeeId')}</Text>
            <Text style={styles.infoValue}>{userProfile.employee_id}</Text>
          </View>
        )}

        {userProfile.crew_id && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.crew')}</Text>
            <Text style={styles.infoValue}>{userProfile.crew_id}</Text>
          </View>
        )}
      </View>

      {/* Language Preference */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <LanguageToggle
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          disabled={updatingLanguage}
        />
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.settingLabel}>{t('profile.help')}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            Alert.alert(
              t('profile.changePassword'),
              t('profile.changePasswordNote')
            );
          }}
        >
          <Text style={styles.settingLabel}>{t('profile.changePassword')}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.about')}</Text>
        <Text style={styles.aboutText}>
          {t('profile.version')}: 1.0.0
        </Text>
        <Text style={styles.aboutText}>
          FieldPay Pro - Clean Scapes P4P System
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
  },
  settingArrow: {
    fontSize: 24,
    color: '#6b7280',
  },
  aboutText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    margin: 16,
    marginTop: 24,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
