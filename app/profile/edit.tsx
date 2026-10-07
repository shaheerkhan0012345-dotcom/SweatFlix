import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useOnboarding, FitnessLevelType, MainGoalType } from '../../context/OnboardingContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const FITNESS_LEVELS: FitnessLevelType[] = ['Beginner', 'Intermediate', 'Advanced'];
const MAIN_GOALS: MainGoalType[] = ['Lose weight', 'Build muscle', 'Stay fit'];
const BODY_PARTS = ['Full Body', 'Chest', 'Back', 'Shoulders', 'Arms', 'Abs', 'Legs'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { state: onboardingState, setField, toggleBodyFocus } = useOnboarding();
  const { settings, updateName } = useSettings();
  const { profile, updateProfile } = useAuth();

  const [name, setName] = useState(profile?.name || settings.name || 'Champ');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : onboardingState.age);
  const [height, setHeight] = useState(profile?.height_cm ? String(profile.height_cm) : onboardingState.height);
  const [weight, setWeight] = useState(profile?.weight_kg ? String(profile.weight_kg) : onboardingState.weight);
  const [goalWeight, setGoalWeight] = useState(profile?.goal_kg ? String(profile.goal_kg) : onboardingState.goalWeight);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = async () => {
    await updateName(name);
    setField('age', age);
    setField('height', height);
    setField('weight', weight);
    setField('goalWeight', goalWeight);

    if (profile?.id) {
      await updateProfile({
        name: name.trim() || 'Champ',
        age: age ? parseInt(age, 10) : null,
        height_cm: height ? parseFloat(height) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        goal_kg: goalWeight ? parseFloat(goalWeight) : null,
        level: onboardingState.fitnessLevel || undefined,
        main_goal: onboardingState.mainGoal || undefined,
        body_focus: onboardingState.bodyFocus || undefined,
      });
    }

    setSavedToast(true);
    setTimeout(() => {
      router.back();
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardWrap}
    >
      <ScreenContainer scrollable contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {savedToast && (
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.toastText}>Profile changes saved! 💪</Text>
          </View>
        )}

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#A0A0A0"
            maxLength={25}
          />
        </View>

        {/* Numeric Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Age */}
          <View style={styles.metricBox}>
            <Text style={styles.label}>Age (yrs)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="25"
              maxLength={2}
            />
          </View>

          {/* Height */}
          <View style={styles.metricBox}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={(t) => setHeight(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="175"
              maxLength={3}
            />
          </View>

          {/* Current Weight */}
          <View style={styles.metricBox}>
            <Text style={styles.label}>Current Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={(t) => setWeight(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="75"
              maxLength={3}
            />
          </View>

          {/* Goal Weight */}
          <View style={styles.metricBox}>
            <Text style={styles.label}>Goal Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={goalWeight}
              onChangeText={(t) => setGoalWeight(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="70"
              maxLength={3}
            />
          </View>
        </View>

        {/* Fitness Level Pills */}
        <View style={styles.sectionWrap}>
          <Text style={styles.label}>Fitness Level</Text>
          <View style={styles.pillsRow}>
            {FITNESS_LEVELS.map((level) => {
              const isSelected = onboardingState.fitnessLevel === level;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => setField('fitnessLevel', level)}
                  style={[
                    styles.pill,
                    isSelected ? styles.pillSelected : styles.pillUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected && styles.pillTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Main Goal */}
        <View style={styles.sectionWrap}>
          <Text style={styles.label}>Main Goal</Text>
          <View style={styles.goalsRow}>
            {MAIN_GOALS.map((g) => {
              const isSelected = onboardingState.mainGoal === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setField('mainGoal', g)}
                  style={[
                    styles.goalPill,
                    isSelected ? styles.goalPillSelected : styles.goalPillUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.goalText,
                      isSelected && styles.goalTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Body Focus */}
        <View style={styles.sectionWrap}>
          <Text style={styles.label}>Body Focus Areas</Text>
          <View style={styles.chipsWrap}>
            {BODY_PARTS.map((part) => {
              const isSelected = onboardingState.bodyFocus?.includes(part);
              return (
                <TouchableOpacity
                  key={part}
                  onPress={() => toggleBodyFocus(part)}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {part}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonWrap}>
          <Button
            title="Save Profile"
            variant="primary"
            onPress={handleSave}
          />
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textDark,
    fontWeight: Typography.weights.bold,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricBox: {
    width: '47%',
  },
  sectionWrap: {
    marginBottom: Spacing.md,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillUnselected: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  pillSelected: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  pillTextSelected: {
    color: Colors.primary,
  },
  goalsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  goalPill: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalPillUnselected: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  goalPillSelected: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  goalText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  goalTextSelected: {
    color: Colors.primary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipUnselected: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  buttonWrap: {
    marginTop: Spacing.md,
  },
});
