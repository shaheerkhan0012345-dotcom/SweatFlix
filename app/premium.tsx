import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { usePremium } from '../context/PremiumContext';
import { isTestToolsEnabled } from '../lib/config';

const PRO_FEATURES = [
  {
    icon: 'body' as const,
    title: '3D Anatomical Muscle Activation',
    desc: 'See which muscles fire with real 3D anatomical highlight cues for every movement.',
  },
  {
    icon: 'videocam' as const,
    title: '36+ HD Video Form Guides',
    desc: 'Never guess your form with muscular athlete movement demonstrations on clean white backdrops.',
  },
  {
    icon: 'nutrition' as const,
    title: 'Personalized AI Meal Engine',
    desc: 'Calorie targets & gourmet recipes calculated specifically from your target weight.',
  },
  {
    icon: 'stats-chart' as const,
    title: 'Advanced Analytics & Overload Logs',
    desc: 'Track sets, reps, weight volume, and progression charts seamlessly.',
  },
  {
    icon: 'shield-checkmark' as const,
    title: '100% Ad-Free Focus',
    desc: 'Zero interruptions, pure athletic focus in every single workout.',
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPremium } = usePremium();

  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 15-Minute Countdown Timer for Urgency
  const [countdownSeconds, setCountdownSeconds] = useState(892);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 892));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubscribe = async () => {
    await setPremium(true);
    setSuccessMessage('Welcome to SweatFlix PRO Elite! 👑');
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
    <View style={styles.outerScreen}>
      <ScreenContainer
        scrollable
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 16) + 120 },
        ]}
      >
        {/* 1. Top Header Bar matching recording video */}
        <View style={styles.topBar}>
          <View style={styles.headerBadgeWrap}>
            <View style={styles.vipBadge}>
              <Text style={styles.vipBadgeEmoji}>👑</Text>
              <Text style={styles.vipBadgeText}>SWEATFLIX PRO PASS</Text>
            </View>

            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>70% OFF</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        {/* 2. Urgency Countdown Banner */}
        <View style={styles.urgencyBanner}>
          <Ionicons name="flame" size={16} color={Colors.primary} />
          <Text style={styles.urgencyText}>
            SPECIAL 70% OFF OFFER ENDS IN{' '}
            <Text style={styles.countdownDigits}>{formatCountdown(countdownSeconds)}</Text>
          </Text>
        </View>

        {/* Success Banner */}
        {successMessage && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        )}

        {/* 3. Hero Headline & Social Proof */}
        <View style={styles.heroSection}>
          <Text style={styles.heroHeadline}>
            Shaheer, want to gain 5–10 lbs of body weight?
          </Text>
          <Text style={styles.heroSubheadline}>
            Start a 60–90 day Challenge today. Full access to live 3D muscle anatomy guides, HD
            video movement tutorials, and personalized AI nutrition schedules.
          </Text>

          <View style={styles.socialProofRow}>
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={14} color="#F59E0B" />
              ))}
            </View>
            <Text style={styles.socialProofText}>4.9/5 Rating • 120k+ Active Athletes</Text>
          </View>
        </View>

        {/* 4. 4 Feature Highlights Grid (matching frame 55 from recording) */}
        <View style={styles.proPillGrid}>
          <View style={styles.proPillItem}>
            <View style={styles.proPillIconBox}>
              <Ionicons name="barbell-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.proPillTitle}>Premium 3D Workouts</Text>
            <Text style={styles.proPillSub}>All 36+ 3D video loops</Text>
          </View>

          <View style={styles.proPillItem}>
            <View style={styles.proPillIconBox}>
              <Ionicons name="analytics-outline" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.proPillTitle}>Advanced Analytics</Text>
            <Text style={styles.proPillSub}>Progressive overload logs</Text>
          </View>

          <View style={styles.proPillItem}>
            <View style={styles.proPillIconBox}>
              <Ionicons name="restaurant-outline" size={18} color="#10B981" />
            </View>
            <Text style={styles.proPillTitle}>Personalized Plans</Text>
            <Text style={styles.proPillSub}>Smart calorie & macros</Text>
          </View>

          <View style={styles.proPillItem}>
            <View style={styles.proPillIconBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#6366F1" />
            </View>
            <Text style={styles.proPillTitle}>Ad-Free Experience</Text>
            <Text style={styles.proPillSub}>Pure athletic focus</Text>
          </View>
        </View>

        {/* 5. Plan Selector Cards (Pure White & Athletic Red theme, NOT black) */}
        <View style={styles.plansSection}>
          {/* Yearly Plan (Best Value - 70% Off) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan('yearly')}
            style={[
              styles.planCard,
              selectedPlan === 'yearly' ? styles.planCardSelected : styles.planCardUnselected,
            ]}
          >
            <View style={styles.planCardTopBadge}>
              <Text style={styles.planCardTopBadgeText}>👑 BEST VALUE • 70% SAVINGS • 3 DAYS FREE</Text>
            </View>

            <View style={styles.planCardContent}>
              <View style={styles.planRadioCol}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedPlan === 'yearly' && styles.radioOuterSelected,
                  ]}
                >
                  {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.planDetailsCol}>
                <Text style={styles.planTitle}>Annual Elite Pass</Text>
                <Text style={styles.planSubDesc}>
                  ₹11.52 / Week • Just $7.99 / year <Text style={styles.strikethrough}>$29.99</Text>
                </Text>
                <Text style={styles.planDailySub}>Only $0.02 per day!</Text>
              </View>

              <View style={styles.planPriceCol}>
                <Text style={styles.planPriceNumber}>$7.99</Text>
                <Text style={styles.planPricePeriod}>/year</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan('monthly')}
            style={[
              styles.planCard,
              selectedPlan === 'monthly' ? styles.planCardSelected : styles.planCardUnselected,
            ]}
          >
            <View style={styles.planCardContent}>
              <View style={styles.planRadioCol}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedPlan === 'monthly' && styles.radioOuterSelected,
                  ]}
                >
                  {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.planDetailsCol}>
                <Text style={styles.planTitle}>Monthly Pass</Text>
                <Text style={styles.planSubDesc}>Flexible cadence, cancel anytime</Text>
                <Text style={styles.planDailySub}>Only $0.10 per day</Text>
              </View>

              <View style={styles.planPriceCol}>
                <Text style={styles.planPriceNumber}>$2.99</Text>
                <Text style={styles.planPricePeriod}>/month</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. Feature Details Breakdown Card */}
        <Card style={styles.featuresCard}>
          <Text style={styles.featuresCardTitle}>EVERYTHING INCLUDED IN PRO:</Text>
          {PRO_FEATURES.map((feat) => (
            <View key={feat.title} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Ionicons name={feat.icon} size={18} color={Colors.primary} />
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* 7. Guarantees & Trust Badges */}
        <View style={styles.guaranteeRow}>
          <View style={styles.guaranteeItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
            <Text style={styles.guaranteeText}>30-Day Money Back</Text>
          </View>
          <View style={styles.guaranteeDivider} />
          <View style={styles.guaranteeItem}>
            <Ionicons name="flash-outline" size={20} color={Colors.primary} />
            <Text style={styles.guaranteeText}>Cancel Anytime in 1-Click</Text>
          </View>
          <View style={styles.guaranteeDivider} />
          <View style={styles.guaranteeItem}>
            <Ionicons name="lock-closed-outline" size={20} color="#F59E0B" />
            <Text style={styles.guaranteeText}>256-Bit Encrypted</Text>
          </View>
        </View>

        {/* 8. Athlete Testimonial */}
        <Card style={styles.testimonialCard}>
          <View style={styles.testimonialQuoteRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
            <Text style={styles.testimonialQuote}>
              &ldquo;The 3D anatomical muscle targeting and personalized diet completely changed how I
              train. Dropped 8% body fat in 10 weeks!&rdquo;
            </Text>
          </View>
          <Text style={styles.testimonialAuthor}>— David K., Verified Athlete</Text>
        </Card>

        {/* Restore Purchases */}
        <TouchableOpacity
          onPress={() => Alert.alert('Restore Complete', 'Purchases restored successfully.')}
          style={styles.restoreBtn}
        >
          <Text style={styles.restoreBtnText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Developer Test Mode */}
        {isTestToolsEnabled() && (
          <TouchableOpacity onPress={handleTurnOffTest} style={styles.testModeBtn}>
            <Text style={styles.testModeBtnText}>Developer: Toggle Free Mode</Text>
          </TouchableOpacity>
        )}
      </ScreenContainer>

      {/* 9. Fixed Sticky Bottom Action Bar (Pure White with Athletic Red Button) */}
      <View
        style={[
          styles.stickyBottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 4 },
        ]}
      >
        <TouchableOpacity
          style={styles.subscribeCtaBtn}
          onPress={handleSubscribe}
          activeOpacity={0.88}
        >
          <Text style={styles.subscribeCtaBtnText}>
            {selectedPlan === 'yearly'
              ? 'START 3-DAY FREE TRIAL ▶'
              : 'UNLOCK MONTHLY PRO ▶'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.stickyDisclaimer}>
          {selectedPlan === 'yearly'
            ? '3 Days Free, then $7.99/year (Only $0.02/day). Cancel anytime in account settings.'
            : 'Renews automatically at $2.99/month. Cancel anytime in account settings.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  headerBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  vipBadgeEmoji: {
    fontSize: 14,
  },
  vipBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  discountBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  urgencyText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  countdownDigits: {
    fontWeight: Typography.weights.heavy,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    gap: 8,
  },
  successBannerText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  heroSection: {
    marginVertical: Spacing.sm,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroHeadline: {
    fontSize: 22,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 6,
  },
  heroSubheadline: {
    fontSize: 13,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  socialProofText: {
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  proPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: Spacing.md,
  },
  proPillItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  proPillIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  proPillTitle: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  proPillSub: {
    fontSize: 10,
    color: Colors.textGrey,
    marginTop: 2,
  },
  plansSection: {
    gap: 12,
    marginBottom: Spacing.lg,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  planCardUnselected: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  planCardTopBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    alignItems: 'center',
  },
  planCardTopBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  planCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  planRadioCol: {
    justifyContent: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planDetailsCol: {
    flex: 1,
  },
  planTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  planSubDesc: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  planDailySub: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  planPriceCol: {
    alignItems: 'flex-end',
  },
  planPriceNumber: {
    fontSize: 22,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  planPricePeriod: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  featuresCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.lg,
    gap: 12,
  },
  featuresCardTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    letterSpacing: 1,
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  featureDesc: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 16,
  },
  guaranteeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guaranteeItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  guaranteeText: {
    fontSize: 9,
    color: Colors.textDark,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  guaranteeDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.lg,
  },
  testimonialQuoteRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  testimonialQuote: {
    flex: 1,
    fontSize: 11,
    color: Colors.textDark,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  testimonialAuthor: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    textAlign: 'right',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: Spacing.sm,
  },
  restoreBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: Typography.weights.medium,
  },
  testModeBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  testModeBtnText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  subscribeCtaBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  stickyDisclaimer: {
    fontSize: 10,
    color: Colors.textGrey,
    marginTop: 6,
    textAlign: 'center',
  },
});
