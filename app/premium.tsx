import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { usePremium } from '../context/PremiumContext';
import { isTestToolsEnabled } from '../lib/config';

const BENEFITS = [
  {
    icon: 'lock-open-outline' as const,
    title: 'All Premium Exercises Unlocked',
    desc: 'Access full HD video guides for all 36+ specialized routines.',
  },
  {
    icon: 'flame-outline' as const,
    title: 'Advanced Workout Programs',
    desc: 'Tailored weekly schedules for rapid muscle building and fat loss.',
  },
  {
    icon: 'ban-outline' as const,
    title: '100% Ad-Free Experience',
    desc: 'Enjoy uninterrupted, laser-focused workouts without interruptions.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Create Unlimited Custom Workouts',
    desc: 'Build, sequence, and customize your own workout routines.',
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const { isPremium, setPremium } = usePremium();

  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubscribe = async () => {
    await setPremium(true);
    setSuccessMessage("You're Premium now! 🎉");
    setTimeout(() => {
      router.back();
    }, 1200);
  };

  const handleTurnOffTest = async () => {
    await setPremium(false);
    setSuccessMessage('Premium turned off (Test mode)');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Bar with Close (X) Button */}
      <View style={styles.topBar}>
        <View style={styles.proCrownBadge}>
          <Ionicons name="diamond" size={14} color="#FF6B00" />
          <Text style={styles.proCrownText}>SWEATFLIX PRO</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Success Notification Banner */}
      {successMessage && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
          <Text style={styles.successBannerText}>{successMessage}</Text>
        </View>
      )}

      {/* Headline & Motivating Subtitle */}
      <View style={styles.headerArea}>
        <Text style={styles.headline}>Go Premium</Text>
        <Text style={styles.subheadline}>
          Unlock your true athletic potential with unrestricted access to every exercise,
          video tutorial, and pro feature.
        </Text>
      </View>

      {/* Benefits List */}
      <Card style={styles.benefitsCard}>
        {BENEFITS.map((benefit, index) => (
          <View key={benefit.title} style={styles.benefitRow}>
            <View style={styles.benefitIconCircle}>
              <Ionicons name={benefit.icon} size={20} color={Colors.primary} />
            </View>
            <View style={styles.benefitTextWrap}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDesc}>{benefit.desc}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Subscription Plans */}
      <View style={styles.plansSection}>
        {/* Yearly Plan (Best Value) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedPlan('yearly')}
          style={[
            styles.planCard,
            selectedPlan === 'yearly' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
        >
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE • SAVE 50%</Text>
          </View>

          <View style={styles.planCardContent}>
            <View>
              <Text style={styles.planName}>Annual Subscription</Text>
              <Text style={styles.planBilled}>Billed yearly ($4.99/mo)</Text>
            </View>
            <View style={styles.planPriceWrap}>
              <Text style={styles.planPrice}>$59.99</Text>
              <Text style={styles.planPeriod}>/yr</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Monthly Plan */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedPlan('monthly')}
          style={[
            styles.planCard,
            selectedPlan === 'monthly' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
        >
          <View style={styles.planCardContent}>
            <View>
              <Text style={styles.planName}>Monthly Subscription</Text>
              <Text style={styles.planBilled}>Flexible, cancel anytime</Text>
            </View>
            <View style={styles.planPriceWrap}>
              <Text style={styles.planPrice}>$9.99</Text>
              <Text style={styles.planPeriod}>/mo</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Subscribe Button */}
      <Button
        title={isPremium ? 'Already Subscribed (Tap to Reconfirm)' : 'Subscribe Now'}
        variant="primary"
        style={styles.subscribeButton}
        onPress={handleSubscribe}
      />

      {/* Restore Purchase Text Button */}
      <TouchableOpacity
        onPress={() => alert('Purchases restored successfully.')}
        style={styles.restoreButton}
        activeOpacity={0.7}
      >
        <Text style={styles.restoreText}>Restore purchase</Text>
      </TouchableOpacity>

      {/* Temporary Test Toggle */}
      {isTestToolsEnabled() && (
        <View style={styles.testSection}>
          <TouchableOpacity
            onPress={handleTurnOffTest}
            style={styles.testButton}
            activeOpacity={0.7}
          >
            <Text style={styles.testButtonText}>
              {isPremium ? 'Turn Premium OFF (test)' : 'Current Status: Free Member'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  proCrownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#FFD199',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  proCrownText: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
  },
  successBannerText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  headerArea: {
    marginBottom: Spacing.lg,
  },
  headline: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheadline: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGrey,
    lineHeight: 20,
  },
  benefitsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderColor: '#EFEFEF',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: Spacing.xs,
  },
  benefitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    lineHeight: 16,
  },
  plansSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  planCard: {
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    position: 'relative',
  },
  planCardUnselected: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  planCardSelected: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  planCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  planName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  planBilled: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
  },
  planPriceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    fontWeight: Typography.weights.bold,
  },
  subscribeButton: {
    height: 54,
    marginTop: Spacing.xs,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  restoreText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textDecorationLine: 'underline',
  },
  testSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  testButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  testButtonText: {
    fontSize: 11,
    color: Colors.textGrey,
    fontWeight: Typography.weights.semiBold,
  },
});
