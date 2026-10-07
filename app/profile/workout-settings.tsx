import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useSettings, RestTimerOption, UnitsOption } from '../../context/SettingsContext';

const REST_OPTIONS: RestTimerOption[] = [15, 30, 45, 60];

export default function WorkoutSettingsScreen() {
  const router = useRouter();
  const { settings, updateWorkoutSettings } = useSettings();
  const ws = settings.workoutSettings;

  const handleWeeklyGoalChange = (delta: number) => {
    const newVal = Math.min(Math.max(ws.weeklyGoal + delta, 1), 7);
    updateWorkoutSettings({ weeklyGoal: newVal });
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Rest Timer Selector */}
      <Card style={styles.card}>
        <Text style={styles.settingTitle}>Rest Timer Between Sets</Text>
        <Text style={styles.settingDesc}>
          Default rest countdown duration after completing an exercise set.
        </Text>
        <View style={styles.timerRow}>
          {REST_OPTIONS.map((time) => {
            const isSelected = ws.restTimer === time;
            return (
              <TouchableOpacity
                key={time}
                onPress={() => updateWorkoutSettings({ restTimer: time })}
                style={[
                  styles.timerPill,
                  isSelected ? styles.timerPillSelected : styles.timerPillUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.timerText,
                    isSelected && styles.timerTextSelected,
                  ]}
                >
                  {time}s
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Weekly Goal Stepper */}
      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>Weekly Workout Goal</Text>
            <Text style={styles.settingDesc}>
              Target sessions per week shown on Home ring.
            </Text>
          </View>
          <View style={styles.stepperWrap}>
            <TouchableOpacity
              onPress={() => handleWeeklyGoalChange(-1)}
              disabled={ws.weeklyGoal <= 1}
              style={[styles.stepperBtn, ws.weeklyGoal <= 1 && styles.disabledBtn]}
            >
              <Ionicons name="remove" size={18} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{ws.weeklyGoal}</Text>
            <TouchableOpacity
              onPress={() => handleWeeklyGoalChange(1)}
              disabled={ws.weeklyGoal >= 7}
              style={[styles.stepperBtn, ws.weeklyGoal >= 7 && styles.disabledBtn]}
            >
              <Ionicons name="add" size={18} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Units Selector */}
      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>Measurement Units</Text>
            <Text style={styles.settingDesc}>Choose your preferred weight & height scale.</Text>
          </View>
          <View style={styles.unitsToggleWrap}>
            <TouchableOpacity
              onPress={() => updateWorkoutSettings({ units: 'metric' })}
              style={[
                styles.unitOption,
                ws.units === 'metric' && styles.unitOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.unitText,
                  ws.units === 'metric' && styles.unitTextSelected,
                ]}
              >
                kg / cm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateWorkoutSettings({ units: 'imperial' })}
              style={[
                styles.unitOption,
                ws.units === 'imperial' && styles.unitOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.unitText,
                  ws.units === 'imperial' && styles.unitTextSelected,
                ]}
              >
                lb / ft
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Audio & Video Toggles */}
      <Card style={styles.card}>
        {/* Sound Effects */}
        <View style={styles.switchRow}>
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>Sound Effects</Text>
            <Text style={styles.settingDesc}>Play audio chimes on countdown timer finish.</Text>
          </View>
          <Switch
            value={ws.soundEffects}
            onValueChange={(val) => updateWorkoutSettings({ soundEffects: val })}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* Vibration */}
        <View style={styles.switchRow}>
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>Haptic Feedback & Vibration</Text>
            <Text style={styles.settingDesc}>Vibrate phone during workout intervals.</Text>
          </View>
          <Switch
            value={ws.vibration}
            onValueChange={(val) => updateWorkoutSettings({ vibration: val })}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* Auto-Play Videos */}
        <View style={styles.switchRow}>
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>Auto-Play Exercise Videos</Text>
            <Text style={styles.settingDesc}>Automatically play tutorial clips on load.</Text>
          </View>
          <Switch
            value={ws.autoPlayVideos}
            onValueChange={(val) => updateWorkoutSettings({ autoPlayVideos: val })}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  settingDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 16,
  },
  timerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  timerPill: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPillUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  timerPillSelected: {
    backgroundColor: Colors.primary,
  },
  timerText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  timerTextSelected: {
    color: '#FFFFFF',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexOne: {
    flex: 1,
    marginRight: Spacing.md,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 2,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    width: 32,
    textAlign: 'center',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  unitsToggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 2,
  },
  unitOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unitOptionSelected: {
    backgroundColor: Colors.primary,
  },
  unitText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  unitTextSelected: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: Spacing.sm,
  },
});
