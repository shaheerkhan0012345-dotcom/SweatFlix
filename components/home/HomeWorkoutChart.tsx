import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useHomeProgress } from '../../context/HomeProgressContext';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/theme';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const HomeWorkoutChart: React.FC = () => {
  const { progress, isTodayDone, markTodayAsDone } = useHomeProgress();
  const { colors, isDarkMode } = useTheme();

  // Determine current day of week (0 = Mon, 6 = Sun)
  const todayRaw = new Date().getDay();
  const todayIndex = todayRaw === 0 ? 6 : todayRaw - 1;

  const completedDays = progress.completedDays || [];
  const weeklyTarget = progress.weeklyTarget || 4;
  const completedCount = completedDays.length;
  const streak = progress.streak || 0;
  const totalKcal = progress.totalKcal || (completedCount * 280);

  const chartHeight = 85;
  const maxCal = 400;

  // Realistic calorie/intensity data for the 7 days
  const weekData = DAY_LABELS.map((label, idx) => {
    const isCompleted = completedDays.includes(idx);
    const isToday = idx === todayIndex;
    const isPast = idx < todayIndex;

    let cal = 0;
    if (isCompleted) {
      cal = 280 + ((idx * 35) % 100);
    } else if (isToday) {
      cal = isTodayDone ? 310 : 0;
    }

    return {
      label,
      idx,
      isCompleted: isCompleted || (isToday && isTodayDone),
      isToday,
      isPast,
      cal,
    };
  });

  const handleStartToday = () => {
    router.push({
      pathname: '/workout-detail',
      params: { id: 'chest-blast' },
    });
  };

  const handleQuickMarkDone = async () => {
    if (isTodayDone) return;
    await markTodayAsDone('Daily Routine', 280);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? '#1E1418' : '#FFFFFF',
          borderColor: isDarkMode ? '#3B1822' : '#FFE4E6',
        },
      ]}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? '#3D1518' : '#FFE4E6' }]}>
            <Ionicons name="barbell" size={18} color={Colors.primary} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Workout Consistency</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
              {completedCount} of {weeklyTarget} Days Done • {streak} Day Streak 🔥
            </Text>
          </View>
        </View>

        {/* Streak Pill */}
        <View
          style={[
            styles.streakPill,
            { backgroundColor: isDarkMode ? '#3A2E12' : '#FEF3C7' },
          ]}
        >
          <Ionicons name="flame" size={13} color="#D97706" />
          <Text style={styles.streakPillText}>
            {streak}d Streak
          </Text>
        </View>
      </View>

      {/* SVG & Bar Chart */}
      <View style={styles.chartWrapper}>
        <View style={styles.chartSvgContainer}>
          <Svg width="100%" height={chartHeight} style={styles.svg}>
            {/* Target line */}
            <Line
              x1="0"
              y1={chartHeight * 0.3}
              x2="100%"
              y2={chartHeight * 0.3}
              stroke="#F43F5E"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.4"
            />
          </Svg>

          {/* Columns */}
          <View style={styles.barsContainer}>
            {weekData.map((item) => {
              const barH = item.isCompleted
                ? Math.max(25, (item.cal / maxCal) * chartHeight)
                : item.isToday
                ? 14
                : 8;

              return (
                <View key={item.label} style={styles.col}>
                  {item.isCompleted ? (
                    <View style={styles.doneIconBox}>
                      <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    </View>
                  ) : item.isToday ? (
                    <View style={styles.todayLiveIndicator}>
                      <Text style={styles.todayLiveDot}>•</Text>
                    </View>
                  ) : (
                    <View style={{ height: 14 }} />
                  )}

                  <View
                    style={[
                      styles.barTrack,
                      {
                        height: chartHeight,
                        backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                        borderColor: item.isToday ? Colors.primary : 'transparent',
                        borderWidth: item.isToday ? 1 : 0,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barH,
                          backgroundColor: item.isCompleted
                            ? Colors.primary
                            : item.isToday
                            ? '#FDA4AF'
                            : isDarkMode
                            ? '#334155'
                            : '#E2E8F0',
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.dayLabel,
                      { color: item.isToday ? Colors.primary : colors.textSecondary },
                      item.isToday && styles.dayLabelToday,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Burn & Volume Highlights */}
      <View
        style={[
          styles.statsRow,
          { backgroundColor: isDarkMode ? '#171115' : '#FFF5F5' },
        ]}
      >
        <View style={styles.statMini}>
          <Text style={[styles.statMiniVal, { color: Colors.primary }]}>{totalKcal}</Text>
          <Text style={[styles.statMiniLabel, { color: colors.textSecondary }]}>kcal Burned</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDarkMode ? '#332228' : '#FEE2E2' }]} />
        <View style={styles.statMini}>
          <Text style={[styles.statMiniVal, { color: '#0284C7' }]}>{completedCount * 35}</Text>
          <Text style={[styles.statMiniLabel, { color: colors.textSecondary }]}>Active Min</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDarkMode ? '#332228' : '#FEE2E2' }]} />
        <View style={styles.statMini}>
          <Text style={[styles.statMiniVal, { color: '#10B981' }]}>
            {Math.round((completedCount / weeklyTarget) * 100)}%
          </Text>
          <Text style={[styles.statMiniLabel, { color: colors.textSecondary }]}>Goal Met</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: Colors.primary }]}
          onPress={handleStartToday}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={14} color="#FFFFFF" />
          <Text style={styles.primaryActionBtnText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.markDoneBtn,
            {
              backgroundColor: isTodayDone
                ? isDarkMode
                  ? '#133529'
                  : '#DCFCE7'
                : isDarkMode
                ? '#1E293B'
                : '#F1F5F9',
              borderColor: isTodayDone ? '#10B981' : colors.border,
            },
          ]}
          onPress={handleQuickMarkDone}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isTodayDone ? 'checkmark-circle' : 'checkmark-done-outline'}
            size={16}
            color={isTodayDone ? '#10B981' : colors.text}
          />
          <Text
            style={[
              styles.markDoneBtnText,
              { color: isTodayDone ? '#10B981' : colors.text },
            ]}
          >
            {isTodayDone ? 'Done Today ✓' : 'Mark Done'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
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
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  chartWrapper: {
    marginBottom: 12,
  },
  chartSvgContainer: {
    height: 110,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  svg: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    bottom: 22,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingHorizontal: 4,
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  doneIconBox: {
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  todayLiveIndicator: {
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayLiveDot: {
    color: Colors.primary,
    fontSize: 18,
    lineHeight: 14,
    fontWeight: '900',
  },
  barTrack: {
    width: 22,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayLabelToday: {
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  statMini: {
    alignItems: 'center',
  },
  statMiniVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  statMiniLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  markDoneBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  markDoneBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

