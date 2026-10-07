import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { SectionTitle } from '../../components/SectionTitle';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useOnboarding, GenderType } from '../../context/OnboardingContext';

interface GenderOption {
  label: GenderType;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const GENDER_OPTIONS: GenderOption[] = [
  {
    label: 'Male',
    icon: 'man',
    description: 'Tailored workouts calibrated for male metabolic rate.',
  },
  {
    label: 'Female',
    icon: 'woman',
    description: 'Targeted routines designed for female physiology.',
  },
  {
    label: 'Other',
    icon: 'person',
    description: 'Customized progression based on your fitness goals.',
  },
];

export default function OnboardingStep1Screen() {
  const router = useRouter();
  const { state, setGender } = useOnboarding();

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <OnboardingProgressBar currentStep={1} totalSteps={3} />

        <SectionTitle
          title="What's your gender?"
          subtitle="We'll personalize your workouts."
          style={styles.header}
        />

        <View style={styles.optionsList}>
          {GENDER_OPTIONS.map((item) => {
            const isSelected = state.gender === item.label;

            return (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.8}
                onPress={() => setGender(item.label)}
                style={[
                  styles.optionCard,
                  isSelected ? styles.selectedCard : styles.unselectedCard,
                ]}
              >
                <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
                  <Ionicons
                    name={item.icon}
                    size={28}
                    color={isSelected ? Colors.primary : Colors.textDark}
                  />
                </View>

                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.selectedLabel,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.optionDescription}>{item.description}</Text>
                </View>

                <View style={styles.checkContainer}>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
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

        <View style={styles.bottomButtons}>
          <Button
            title="Continue"
            variant="primary"
            disabled={!state.gender}
            onPress={() => router.push('/onboarding/step2')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  optionsList: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    minHeight: 84,
  },
  unselectedCard: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  selectedCard: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  selectedIconContainer: {
    backgroundColor: '#FFE5E5',
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 2,
  },
  selectedLabel: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    lineHeight: 16,
  },
  checkContainer: {
    marginLeft: Spacing.sm,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: Spacing.sm,
    paddingBottom: 32,
  },
});
