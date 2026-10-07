import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { SectionTitle } from '../../components/SectionTitle';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';

interface BodyPartOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const BODY_PARTS: BodyPartOption[] = [
  { id: 'Chest', label: 'Chest', icon: 'barbell-outline' },
  { id: 'Back', label: 'Back', icon: 'shield-outline' },
  { id: 'Shoulders', label: 'Shoulders', icon: 'body-outline' },
  { id: 'Arms', label: 'Arms', icon: 'fitness-outline' },
  { id: 'Abs', label: 'Abs', icon: 'flash-outline' },
  { id: 'Legs', label: 'Legs', icon: 'walk-outline' },
];

export default function OnboardingStep2Screen() {
  const router = useRouter();
  const { state, toggleBodyFocus } = useOnboarding();

  const isFullBodySelected = state.bodyFocus.includes('Full Body');
  const hasSelection = state.bodyFocus.length > 0;

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <OnboardingProgressBar
          currentStep={2}
          totalSteps={3}
          showBack
          onBack={() => router.back()}
        />

        <SectionTitle
          title="What do you want to focus on?"
          subtitle="Choose Full Body or select specific target muscle groups."
          style={styles.header}
        />

        {/* Hero Card: Full Body */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleBodyFocus('Full Body')}
          style={[
            styles.fullBodyCard,
            isFullBodySelected ? styles.fullBodySelected : styles.fullBodyUnselected,
          ]}
        >
          <View style={styles.fullBodyLeft}>
            <View
              style={[
                styles.fullBodyIconWrap,
                isFullBodySelected && styles.fullBodyIconWrapActive,
              ]}
            >
              <Ionicons
                name="flame"
                size={30}
                color={isFullBodySelected ? Colors.primary : Colors.accent}
              />
            </View>
            <View style={styles.fullBodyTextWrap}>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>MOST POPULAR</Text>
              </View>
              <Text
                style={[
                  styles.fullBodyTitle,
                  isFullBodySelected && styles.fullBodyTitleActive,
                ]}
              >
                Full Body
              </Text>
              <Text style={styles.fullBodySubtitle}>
                Complete balanced workout plan hitting every muscle group
              </Text>
            </View>
          </View>

          <View style={styles.checkIconWrap}>
            {isFullBodySelected ? (
              <Ionicons name="checkmark-circle" size={26} color={Colors.primary} />
            ) : (
              <View style={styles.unselectedRadio} />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionSubtitle}>Or focus on specific zones:</Text>

        {/* Specific Muscle Group Cards */}
        <View style={styles.grid}>
          {BODY_PARTS.map((part) => {
            const isSelected = state.bodyFocus.includes(part.label);

            return (
              <TouchableOpacity
                key={part.id}
                activeOpacity={0.8}
                onPress={() => toggleBodyFocus(part.label)}
                style={[
                  styles.gridItem,
                  isSelected ? styles.gridItemSelected : styles.gridItemUnselected,
                ]}
              >
                <View
                  style={[
                    styles.gridIconWrap,
                    isSelected && styles.gridIconWrapSelected,
                  ]}
                >
                  <Ionicons
                    name={part.icon}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.textDark}
                  />
                </View>
                <Text
                  style={[
                    styles.gridLabel,
                    isSelected && styles.gridLabelSelected,
                  ]}
                >
                  {part.label}
                </Text>
                {isSelected && (
                  <View style={styles.itemCheckBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomButtons}>
          <Button
            title="Continue"
            variant="primary"
            disabled={!hasSelection}
            onPress={() => router.push('/onboarding/step3')}
          />
          <Button
            title="Back"
            variant="secondary"
            onPress={() => router.back()}
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
    marginBottom: Spacing.md,
  },
  fullBodyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.lg,
  },
  fullBodyUnselected: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  fullBodySelected: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  fullBodyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fullBodyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  fullBodyIconWrapActive: {
    backgroundColor: '#FFE5E5',
  },
  fullBodyTextWrap: {
    flex: 1,
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  fullBodyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  fullBodyTitleActive: {
    color: Colors.primary,
  },
  fullBodySubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 16,
  },
  checkIconWrap: {
    marginLeft: Spacing.sm,
  },
  unselectedRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    position: 'relative',
    minHeight: 64,
  },
  gridItemUnselected: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  gridItemSelected: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  gridIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  gridIconWrapSelected: {
    backgroundColor: '#FFE5E5',
  },
  gridLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    flex: 1,
  },
  gridLabelSelected: {
    color: Colors.primary,
  },
  itemCheckBadge: {
    marginLeft: 'auto',
  },
  bottomButtons: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: 36,
    gap: Spacing.sm,
  },
});
