import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { SectionTitle } from '../../components/SectionTitle';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import {
  useOnboarding,
  FitnessLevelType,
  MainGoalType,
} from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';

const FITNESS_LEVELS: { label: FitnessLevelType; desc: string }[] = [
  { label: 'Beginner', desc: 'New to working out' },
  { label: 'Intermediate', desc: 'Workout 2-3x / week' },
  { label: 'Advanced', desc: 'Consistent training 4+ years' },
];

const MAIN_GOALS: { label: MainGoalType; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  { label: 'Lose weight', icon: 'flame-outline', desc: 'Burn fat and get leaner' },
  { label: 'Build muscle', icon: 'barbell-outline', desc: 'Increase strength & hypertrophy' },
  { label: 'Stay fit', icon: 'heart-outline', desc: 'Maintain health and energy' },
];

export default function OnboardingStep3Screen() {
  const router = useRouter();
  const { state, setField, saveAndCompleteOnboarding } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);

  // Validation helpers
  const ageNum = parseInt(state.age, 10);
  const heightNum = parseFloat(state.height);
  const weightNum = parseFloat(state.weight);
  const goalWeightNum = parseFloat(state.goalWeight);

  const isAgeValid = !isNaN(ageNum) && ageNum >= 10 && ageNum <= 90;
  const isHeightValid = !isNaN(heightNum) && heightNum >= 100 && heightNum <= 250;
  const isWeightValid = !isNaN(weightNum) && weightNum >= 30 && weightNum <= 300;
  const isGoalWeightValid = !isNaN(goalWeightNum) && goalWeightNum >= 30 && goalWeightNum <= 300;

  const isAllValid =
    isAgeValid &&
    isHeightValid &&
    isWeightValid &&
    isGoalWeightValid &&
    state.fitnessLevel !== null &&
    state.mainGoal !== null;

  const { refreshProfile } = useAuth();

  const handleFinish = async () => {
    if (!isAllValid || submitting) return;
    setSubmitting(true);
    try {
      await saveAndCompleteOnboarding();
      await refreshProfile();
      router.replace('/(tabs)');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          bounces={true}
          overScrollMode="always"
        >
        <OnboardingProgressBar
          currentStep={3}
          totalSteps={3}
          showBack
          onBack={() => router.back()}
        />

        <SectionTitle
          title="Tell us about you"
          subtitle="Enter your physical metrics and targets to calculate calibrated training."
          style={styles.header}
        />

        {/* Numeric Fields */}
        <View style={styles.inputsGrid}>
          {/* Age */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Age</Text>
            <View style={[styles.inputBox, state.age && !isAgeValid && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor="#A0A0A0"
                value={state.age}
                onChangeText={(text) => setField('age', text.replace(/[^0-9]/g, ''))}
                maxLength={2}
              />
              <Text style={styles.unitText}>yrs</Text>
            </View>
            {state.age !== '' && !isAgeValid && (
              <Text style={styles.errorText}>Must be between 10 - 90</Text>
            )}
          </View>

          {/* Height */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Height</Text>
            <View style={[styles.inputBox, state.height && !isHeightValid && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="175"
                placeholderTextColor="#A0A0A0"
                value={state.height}
                onChangeText={(text) => setField('height', text.replace(/[^0-9]/g, ''))}
                maxLength={3}
              />
              <Text style={styles.unitText}>cm</Text>
            </View>
            {state.height !== '' && !isHeightValid && (
              <Text style={styles.errorText}>Must be between 100 - 250</Text>
            )}
          </View>

          {/* Current Weight */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Current Weight</Text>
            <View style={[styles.inputBox, state.weight && !isWeightValid && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="70"
                placeholderTextColor="#A0A0A0"
                value={state.weight}
                onChangeText={(text) => setField('weight', text.replace(/[^0-9]/g, ''))}
                maxLength={3}
              />
              <Text style={styles.unitText}>kg</Text>
            </View>
            {state.weight !== '' && !isWeightValid && (
              <Text style={styles.errorText}>Must be between 30 - 300</Text>
            )}
          </View>

          {/* Goal Weight */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Goal Weight</Text>
            <View style={[styles.inputBox, state.goalWeight && !isGoalWeightValid && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="68"
                placeholderTextColor="#A0A0A0"
                value={state.goalWeight}
                onChangeText={(text) => setField('goalWeight', text.replace(/[^0-9]/g, ''))}
                maxLength={3}
              />
              <Text style={styles.unitText}>kg</Text>
            </View>
            {state.goalWeight !== '' && !isGoalWeightValid && (
              <Text style={styles.errorText}>Must be between 30 - 300</Text>
            )}
          </View>
        </View>

        {/* Fitness Level */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>Fitness Level</Text>
          <View style={styles.pillRow}>
            {FITNESS_LEVELS.map((level) => {
              const isSelected = state.fitnessLevel === level.label;

              return (
                <TouchableOpacity
                  key={level.label}
                  activeOpacity={0.8}
                  onPress={() => setField('fitnessLevel', level.label)}
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
                    {level.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Main Goal */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>Main Goal</Text>
          <View style={styles.goalsList}>
            {MAIN_GOALS.map((goal) => {
              const isSelected = state.mainGoal === goal.label;

              return (
                <TouchableOpacity
                  key={goal.label}
                  activeOpacity={0.8}
                  onPress={() => setField('mainGoal', goal.label)}
                  style={[
                    styles.goalCard,
                    isSelected ? styles.goalCardSelected : styles.goalCardUnselected,
                  ]}
                >
                  <View
                    style={[
                      styles.goalIconWrap,
                      isSelected && styles.goalIconWrapSelected,
                    ]}
                  >
                    <Ionicons
                      name={goal.icon}
                      size={24}
                      color={isSelected ? Colors.primary : Colors.textDark}
                    />
                  </View>
                  <View style={styles.goalTextWrap}>
                    <Text
                      style={[
                        styles.goalTitle,
                        isSelected && styles.goalTitleSelected,
                      ]}
                    >
                      {goal.label}
                    </Text>
                    <Text style={styles.goalDesc}>{goal.desc}</Text>
                  </View>
                  <View style={styles.goalCheckWrap}>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={Colors.primary}
                      />
                    ) : (
                      <View style={styles.unselectedRadio} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.bottomButtons}>
          <Button
            title="Start my journey"
            variant="primary"
            loading={submitting}
            disabled={!isAllValid || submitting}
            onPress={handleFinish}
          />
          <Button
            title="Back"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 48,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  inputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputCard: {
    width: '47%',
  },
  inputLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputError: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F5',
  },
  textInput: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  unitText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGrey,
    fontWeight: Typography.weights.semiBold,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: Typography.weights.semiBold,
    marginTop: 4,
  },
  sectionWrap: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
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
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  pillTextSelected: {
    color: Colors.primary,
  },
  goalsList: {
    gap: Spacing.sm,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    minHeight: 68,
  },
  goalCardUnselected: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  goalCardSelected: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  goalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  goalIconWrapSelected: {
    backgroundColor: '#FFE5E5',
  },
  goalTextWrap: {
    flex: 1,
  },
  goalTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  goalTitleSelected: {
    color: Colors.primary,
  },
  goalDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
  },
  goalCheckWrap: {
    marginLeft: Spacing.sm,
  },
  unselectedRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
  },
  bottomButtons: {
    marginTop: Spacing.xl,
    paddingBottom: 36,
    gap: Spacing.sm,
  },
});
