import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Spacing, Typography } from '../constants/theme';

interface WeeklyActivityChartProps {
  completedDays: number[]; // 0 = Mon, ..., 6 = Sun
  todayIndex: number; // 0 = Mon, ..., 6 = Sun
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({
  completedDays,
  todayIndex,
}) => {
  const hasData = completedDays.length > 0;

  if (!hasData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No workout activity recorded this week yet.</Text>
      </View>
    );
  }

  const chartHeight = 80;
  const barWidth = 18;
  const barRadius = 6;

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {DAY_LABELS.map((label, index) => {
          const isDone = completedDays.includes(index);
          const isToday = index === todayIndex;

          const barH = isDone ? (isToday ? 70 : 60) : 10;
          const barColor = isDone
            ? isToday
              ? Colors.accent
              : Colors.primary
            : '#EAEAEA';

          return (
            <View key={label} style={styles.col}>
              <View style={[styles.svgWrapper, { height: chartHeight }]}>
                <Svg width={barWidth} height={chartHeight}>
                  <Rect
                    x={0}
                    y={chartHeight - barH}
                    width={barWidth}
                    height={barH}
                    rx={barRadius}
                    ry={barRadius}
                    fill={barColor}
                  />
                </Svg>
              </View>
              <Text
                style={[
                  styles.label,
                  isToday && styles.labelToday,
                  isDone && styles.labelDone,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 105,
    paddingTop: Spacing.xs,
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  svgWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textGrey,
  },
  labelToday: {
    color: Colors.accent,
    fontWeight: Typography.weights.bold,
  },
  labelDone: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  emptyContainer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    fontStyle: 'italic',
  },
});

export default WeeklyActivityChart;
