import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Svg, { Polyline, Polygon, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useHealthMetrics } from '../../context/HealthMetricsContext';
import { useTheme } from '../../context/ThemeContext';

export const HomeWeightChart: React.FC = () => {
  const { metrics, logWeight, bmi, bmiCategory } = useHealthMetrics();
  const { colors, isDarkMode } = useTheme();

  const currentWeight = metrics.currentWeightKg || 72.5;
  const targetWeight = metrics.targetWeightKg || 70.0;
  const diffKg = Number((currentWeight - targetWeight).toFixed(1));

  // Quick weight logger input state
  const [prevCurrentWeight, setPrevCurrentWeight] = useState(currentWeight);
  const [inputWeight, setInputWeight] = useState(currentWeight.toFixed(1));
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync input if external weight changes
  if (prevCurrentWeight !== currentWeight) {
    setPrevCurrentWeight(currentWeight);
    setInputWeight(currentWeight.toFixed(1));
  }

  // Use real recorded points (no fake past data)
  const pointsData = React.useMemo(() => {
    const history = metrics.weightHistory || [];
    if (history.length === 0) {
      return [{ label: 'Today', val: currentWeight }];
    }
    const sliced = history.slice(-7);
    return sliced.map((item, idx) => {
      const isLast = idx === sliced.length - 1;
      let label = `D${idx + 1}`;
      if (item.date) {
        const parts = item.date.split('-');
        if (parts.length === 3) {
          label = `${parts[1]}/${parts[2]}`;
        }
      }
      if (isLast) label = 'Today';
      return {
        label,
        val: item.weight,
      };
    });
  }, [metrics.weightHistory, currentWeight]);

  // Chart calculation
  const chartHeight = 85;
  const chartWidth = 280; // normalized coordinate space
  const minVal = Math.min(...pointsData.map((p) => p.val), targetWeight) - 0.8;
  const maxVal = Math.max(...pointsData.map((p) => p.val), targetWeight) + 0.8;
  const range = maxVal - minVal || 1;

  const pointsCoordinates = pointsData.map((p, idx) => {
    const x = pointsData.length === 1 ? chartWidth / 2 : (idx / (pointsData.length - 1 || 1)) * (chartWidth - 20) + 10;
    const y = chartHeight - ((p.val - minVal) / range) * (chartHeight - 20) - 10;
    return { x, y, val: p.val, label: p.label };
  });

  const polylinePoints = pointsCoordinates.length === 1
    ? `10,${pointsCoordinates[0].y} ${chartWidth - 10},${pointsCoordinates[0].y}`
    : pointsCoordinates.map((p) => `${p.x},${p.y}`).join(' ');
  const polygonPoints = `10,${chartHeight} ${polylinePoints} ${chartWidth - 10},${chartHeight}`;

  const targetY = chartHeight - ((targetWeight - minVal) / range) * (chartHeight - 20) - 10;

  const handleStep = (step: number) => {
    const next = Math.max(30, Math.min(250, Number((parseFloat(inputWeight) + step).toFixed(1))));
    setInputWeight(next.toFixed(1));
  };

  const handleSaveWeight = async () => {
    const parsed = parseFloat(inputWeight);
    if (!isNaN(parsed) && parsed > 30 && parsed < 250) {
      await logWeight(parsed);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? '#131B2A' : '#FFFFFF',
          borderColor: isDarkMode ? '#1E2D4A' : '#E0E7FF',
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? '#1E2A4A' : '#EEF2FF' }]}>
            <Ionicons name="speedometer" size={18} color="#6366F1" />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Weight Journey</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
              {currentWeight.toFixed(1)} kg • Target {targetWeight.toFixed(1)} kg
            </Text>
          </View>
        </View>

        {/* BMI Category Pill */}
        <View
          style={[
            styles.bmiPill,
            { backgroundColor: isDarkMode ? '#1E2A4A' : '#EEF2FF' },
          ]}
        >
          <Ionicons name="fitness" size={12} color="#6366F1" />
          <Text style={styles.bmiPillText}>
            {bmi} BMI • {bmiCategory}
          </Text>
        </View>
      </View>

      {/* Metric Callouts */}
      <View style={styles.calloutRow}>
        <View style={styles.calloutItem}>
          <Text style={[styles.calloutLabel, { color: colors.textMuted }]}>Current</Text>
          <Text style={[styles.calloutVal, { color: colors.text }]}>{currentWeight.toFixed(1)} <Text style={styles.unitText}>kg</Text></Text>
        </View>
        <View style={styles.calloutItem}>
          <Text style={[styles.calloutLabel, { color: colors.textMuted }]}>Goal</Text>
          <Text style={[styles.calloutVal, { color: '#6366F1' }]}>{targetWeight.toFixed(1)} <Text style={styles.unitText}>kg</Text></Text>
        </View>
        <View style={styles.calloutItem}>
          <Text style={[styles.calloutLabel, { color: colors.textMuted }]}>To Goal</Text>
          <Text style={[styles.calloutVal, { color: diffKg <= 0 ? '#10B981' : '#F59E0B' }]}>
            {diffKg <= 0 ? 'Goal Reached 🎉' : `${diffKg} kg left`}
          </Text>
        </View>
      </View>

      {/* SVG Line & Area Chart */}
      <View style={styles.chartWrapper}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Defs>
            <LinearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Target line */}
          <Line
            x1="0"
            y1={targetY}
            x2={chartWidth}
            y2={targetY}
            stroke="#10B981"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />

          {/* Shaded Area Under Curve */}
          <Polygon points={polygonPoints} fill="url(#weightGrad)" />

          {/* Trend Polyline */}
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on points */}
          {pointsCoordinates.map((p, idx) => (
            <Circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === pointsCoordinates.length - 1 ? 5 : 3.5}
              fill={idx === pointsCoordinates.length - 1 ? '#6366F1' : '#A5B4FC'}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          ))}
        </Svg>

        {/* Labels row under points */}
        <View style={styles.labelsRow}>
          {pointsCoordinates.map((p, idx) => (
            <Text
              key={idx}
              style={[
                styles.chartLabelText,
                { color: idx === pointsCoordinates.length - 1 ? '#6366F1' : colors.textMuted },
                idx === pointsCoordinates.length - 1 && styles.chartLabelToday,
              ]}
            >
              {p.label}
            </Text>
          ))}
        </View>
      </View>

      {/* Interactive Quick Logger Stepper */}
      <View
        style={[
          styles.loggerBox,
          {
            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.loggerTitle, { color: colors.textSecondary }]}>Log Today&apos;s Weight:</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={[styles.stepBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}
            onPress={() => handleStep(-0.1)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.weightInput, { color: colors.text }]}
              value={inputWeight}
              onChangeText={setInputWeight}
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>kg</Text>
          </View>

          <TouchableOpacity
            style={[styles.stepBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}
            onPress={() => handleStep(0.1)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: isSavedRecently ? '#10B981' : '#6366F1' },
            ]}
            onPress={handleSaveWeight}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isSavedRecently ? 'checkmark' : 'cloud-upload-outline'}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.saveBtnText}>
              {isSavedRecently ? 'Saved!' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  bmiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  bmiPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  calloutItem: {
    alignItems: 'flex-start',
  },
  calloutLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  calloutVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chartWrapper: {
    marginBottom: 14,
    marginTop: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  chartLabelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartLabelToday: {
    fontWeight: '800',
  },
  loggerBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  loggerTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  weightInput: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 50,
    paddingVertical: 4,
  },
  inputUnit: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

