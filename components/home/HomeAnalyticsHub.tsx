import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/theme';
import { HomeWaterChart } from './HomeWaterChart';
import { HomeWorkoutChart } from './HomeWorkoutChart';
import { HomeWeightChart } from './HomeWeightChart';
import { useHealthMetrics } from '../../context/HealthMetricsContext';
import { useHomeProgress } from '../../context/HomeProgressContext';

type TabType = 'water' | 'workout' | 'weight' | 'diet';

export const HomeAnalyticsHub: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('water');
  const { metrics } = useHealthMetrics();
  const { progress } = useHomeProgress();

  const tabs: { id: TabType; label: string; icon: any; color: string; badge: string }[] = [
    {
      id: 'water',
      label: 'Water',
      icon: 'water',
      color: '#0284C7',
      badge: `${(metrics.waterIntakeMl / 1000).toFixed(1)}L`,
    },
    {
      id: 'workout',
      label: 'Workouts',
      icon: 'barbell',
      color: Colors.primary,
      badge: `${progress.completedDays?.length || 0}/4`,
    },
    {
      id: 'weight',
      label: 'Weight',
      icon: 'speedometer',
      color: '#6366F1',
      badge: `${metrics.currentWeightKg.toFixed(1)}kg`,
    },
    {
      id: 'diet',
      label: 'Diet',
      icon: 'restaurant',
      color: '#10B981',
      badge: `${metrics.caloriesConsumed}kcal`,
    },
  ];

  return (
    <View style={styles.hubContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Live Analytics &amp; Reports
          </Text>
          <View style={styles.livePulseDot} />
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Real-time tracking
        </Text>
      </View>

      {/* Segmented Control Tabs */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDarkMode ? '#111827' : '#F1F5F9',
            borderColor: colors.border,
          },
        ]}
      >
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                isSelected && [
                  styles.tabItemActive,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    shadowColor: tab.color,
                  },
                ],
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={isSelected ? tab.color : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isSelected ? colors.text : colors.textSecondary },
                  isSelected && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.tabMiniBadge,
                  {
                    backgroundColor: isSelected
                      ? isDarkMode
                        ? '#0F172A'
                        : '#F1F5F9'
                      : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabMiniBadgeText,
                    { color: isSelected ? tab.color : colors.textMuted },
                  ]}
                >
                  {tab.badge}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Render Selected Interactive Chart */}
      <View style={styles.activeChartContainer}>
        {activeTab === 'water' && <HomeWaterChart />}
        {activeTab === 'workout' && <HomeWorkoutChart />}
        {activeTab === 'weight' && <HomeWeightChart />}
        {activeTab === 'diet' && (
          <View
            style={[
              styles.dietOverviewCard,
              {
                backgroundColor: isDarkMode ? '#131F1D' : '#FFFFFF',
                borderColor: isDarkMode ? '#1F3D36' : '#DCFCE7',
              },
            ]}
          >
            {/* Diet Header */}
            <View style={styles.dietHeaderRow}>
              <View style={styles.titleWithIcon}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: isDarkMode ? '#1B4D3E' : '#DCFCE7' },
                  ]}
                >
                  <Ionicons name="restaurant" size={18} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Daily Macro &amp; Calorie Goal
                  </Text>
                  <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                    {metrics.caloriesConsumed} of {metrics.caloriesTarget} kcal consumed
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.calPercentPill,
                  { backgroundColor: isDarkMode ? '#1B4D3E' : '#DCFCE7' },
                ]}
              >
                <Text style={styles.calPercentText}>
                  {Math.round((metrics.caloriesConsumed / (metrics.caloriesTarget || 2200)) * 100)}%
                </Text>
              </View>
            </View>

            {/* Macro Bars */}
            <View style={styles.macroBarsList}>
              {/* Protein */}
              <View style={styles.macroBarItem}>
                <View style={styles.macroBarHeader}>
                  <Text style={[styles.macroLabel, { color: colors.text }]}>Protein</Text>
                  <Text style={[styles.macroValue, { color: colors.textSecondary }]}>
                    {metrics.proteinGrams}g / {metrics.proteinTarget}g
                  </Text>
                </View>
                <View style={[styles.macroTrack, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
                  <View
                    style={[
                      styles.macroFill,
                      {
                        width: `${Math.min(100, Math.round((metrics.proteinGrams / (metrics.proteinTarget || 140)) * 100))}%`,
                        backgroundColor: '#EF4444',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.macroBarItem}>
                <View style={styles.macroBarHeader}>
                  <Text style={[styles.macroLabel, { color: colors.text }]}>Carbohydrates</Text>
                  <Text style={[styles.macroValue, { color: colors.textSecondary }]}>
                    {metrics.carbsGrams}g / {metrics.carbsTarget}g
                  </Text>
                </View>
                <View style={[styles.macroTrack, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
                  <View
                    style={[
                      styles.macroFill,
                      {
                        width: `${Math.min(100, Math.round((metrics.carbsGrams / (metrics.carbsTarget || 230)) * 100))}%`,
                        backgroundColor: '#F59E0B',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Healthy Fats */}
              <View style={styles.macroBarItem}>
                <View style={styles.macroBarHeader}>
                  <Text style={[styles.macroLabel, { color: colors.text }]}>Healthy Fats</Text>
                  <Text style={[styles.macroValue, { color: colors.textSecondary }]}>
                    {metrics.fatGrams}g / {metrics.fatTarget}g
                  </Text>
                </View>
                <View style={[styles.macroTrack, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
                  <View
                    style={[
                      styles.macroFill,
                      {
                        width: `${Math.min(100, Math.round((metrics.fatGrams / (metrics.fatTarget || 65)) * 100))}%`,
                        backgroundColor: '#3B82F6',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hubContainer: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 11,
  },
  tabItemActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  tabMiniBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  tabMiniBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  activeChartContainer: {
    position: 'relative',
  },
  dietOverviewCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  dietHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  calPercentPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calPercentText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
  macroBarsList: {
    gap: 10,
  },
  macroBarItem: {},
  macroBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  macroTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 4,
  },
});

