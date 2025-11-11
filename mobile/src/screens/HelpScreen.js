/**
 * Help Screen
 * Clean Scapes P4P System - Mobile App
 * 
 * Help and FAQ screen with collapsible sections.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';

export default function HelpScreen() {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const faqSections = [
    {
      key: 'howPayCalculated',
      question: t('help.howPayCalculated'),
      answer: t('help.howPayCalculatedAnswer'),
    },
    {
      key: 'whatAffectsScore',
      question: t('help.whatAffectsScore'),
      answer: t('help.whatAffectsScoreAnswer'),
    },
    {
      key: 'whyPenalized',
      question: t('help.whyPenalized'),
      answer: t('help.whyPenalizedAnswer'),
    },
    {
      key: 'howToImprove',
      question: t('help.howToImprove'),
      answer: t('help.howToImproveAnswer'),
    },
    {
      key: 'contactOffice',
      question: t('help.contactOffice'),
      answer: t('help.contactOfficeAnswer'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('help.title')}</Text>
      </View>

      <View style={styles.content}>
        {faqSections.map((section) => {
          const isExpanded = expandedSections[section.key];
          
          return (
            <View key={section.key} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleSection(section.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{section.question}</Text>
                <FontAwesome
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#6b7280"
                />
              </TouchableOpacity>
              
              {isExpanded && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{section.answer}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

