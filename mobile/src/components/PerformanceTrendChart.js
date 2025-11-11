/**
 * Performance Trend Chart Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Simple bar chart showing performance trend over time.
 * Uses simple View components for visualization.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64; // Account for padding
const CHART_HEIGHT = 200;
const CHART_PADDING = 20;

export default function PerformanceTrendChart({ records }) {
  const { t } = useTranslation();

  if (!records || records.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('history.noData')}</Text>
      </View>
    );
  }

  // Calculate efficiency for each record
  const calculateEfficiency = (record) => {
    if (!record || !record.base_pay) return 0;
    const efficiency = (record.total_pay / record.base_pay) * 100;
    return Math.min(efficiency, 100);
  };

  // Prepare data points (last 7 days for better visibility)
  const recentRecords = records.slice(0, 7).reverse(); // Most recent 7 days, oldest first
  const dataPoints = recentRecords.map(record => calculateEfficiency(record));

  // Find min and max for scaling
  const minValue = Math.min(...dataPoints, 0);
  const maxValue = Math.max(...dataPoints, 100);
  const range = maxValue - minValue || 100;

  // Calculate chart dimensions
  const chartWidth = CHART_WIDTH - (CHART_PADDING * 2);
  const chartHeight = CHART_HEIGHT - (CHART_PADDING * 2);

  // Calculate bar heights
  const barWidth = chartWidth / dataPoints.length - 4; // 4px gap between bars

  return (
    <View style={styles.container}>
      {/* Chart area */}
      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {[0, 25, 50, 75, 100].map((value) => {
            const y = CHART_PADDING + chartHeight - ((value - minValue) / range) * chartHeight;
            return (
              <View key={`label-${value}`} style={[styles.yAxisLabel, { top: y - 10 }]}>
                <Text style={styles.yAxisText}>{value}%</Text>
              </View>
            );
          })}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {dataPoints.map((value, index) => {
            const barHeight = ((value - minValue) / range) * chartHeight;
            const barColor = value >= 90 ? '#10b981' : value >= 75 ? '#3b82f6' : value >= 60 ? '#f59e0b' : '#ef4444';
            
            return (
              <View key={`bar-${index}`} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 2), // Minimum 2px height
                      backgroundColor: barColor,
                      width: barWidth,
                    },
                  ]}
                />
                <Text style={styles.barValue}>{Math.round(value)}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* X-axis labels (dates) */}
      <View style={styles.dateLabelsContainer}>
        {recentRecords.map((record, index) => {
          const date = new Date(record.date);
          const dayLabel = date.getDate();
          return (
            <View key={`date-${index}`} style={styles.dateLabelWrapper}>
              <Text style={styles.dateLabel}>{dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  chartArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    position: 'relative',
  },
  yAxis: {
    width: 40,
    position: 'relative',
  },
  yAxisLabel: {
    position: 'absolute',
    right: 4,
  },
  yAxisText: {
    fontSize: 10,
    color: '#6b7280',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingBottom: CHART_PADDING,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 4,
    marginBottom: 4,
  },
  barValue: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  dateLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginTop: 8,
  },
  dateLabelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});

