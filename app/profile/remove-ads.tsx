import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { usePremium } from '../../context/PremiumContext';
import { isTestToolsEnabled } from '../../lib/config';

export default function RemoveAdsScreen() {
  const router = useRouter();
  const { settings, setAdsRemoved } = useSettings();
  const { isPremium } = usePremium();
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const areAdsRemoved = isPremium || settings.adsRemoved;

  const handleRemoveAds = async () => {
    await setAdsRemoved(true);
    setSuccessBanner('Ads removed! 🎉');
    Alert.alert('Success', 'Ads removed! 🎉 Enjoy your ad-free SweatFlix experience.');
  };

  const handleResetAds = async () => {
    await setAdsRemoved(false);
    setSuccessBanner(null);
    Alert.alert('Test Mode', 'Ads restored! The placeholder banner will appear in Explore.');
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
        <Text style={styles.headerTitle}>Remove Ads</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Hero Icon */}
      <View style={styles.heroSection}>
        <View style={styles.heroIconBadge}>
          <Ionicons name="sparkles" size={38} color={Colors.accent} />
        </View>
        <Text style={styles.headline}>Enjoy SweatFlix ad-free</Text>
        <Text style={styles.subheadline}>
          Train with zero interruptions, cleaner screens, and focused workout flow.
        </Text>
      </View>

      {/* Status Card if Already Removed */}
      {areAdsRemoved ? (
        <Card style={styles.activeCard}>
          <View style={styles.activeHeader}>
            <Ionicons name="checkmark-circle" size={32} color="#2E7D32" />
            <View style={styles.activeTextWrap}>
              <Text style={styles.activeTitle}>Ads are already removed</Text>
              <Text style={styles.activeDesc}>
                {isPremium
                  ? 'Your SweatFlix PRO membership includes 100% ad-free experience.'
                  : 'You have permanently removed ads on this device.'}
              </Text>
            </View>
          </View>
        </Card>
      ) : (
        <>
          {/* Benefits Card */}
          <Card style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>What you get:</Text>
            
            <View style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>Zero banners or popup interruptions</Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>Distraction-free workout library browsing</Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>Smooth & fast navigation across all tabs</Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>Support independent fitness app development</Text>
            </View>
          </Card>

          {/* Pricing Card */}
          <Card style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <View>
                <Text style={styles.purchaseLabel}>One-time purchase</Text>
                <Text style={styles.purchaseSub}>Pay once, ad-free forever</Text>
              </View>
              <Text style={styles.priceTag}>$1.99</Text>
            </View>

            <Button
              title="Remove ads"
              onPress={handleRemoveAds}
              style={styles.purchaseButton}
            />
          </Card>
        </>
      )}

      {/* Success Banner if freshly purchased */}
      {successBanner && (
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerText}>{successBanner}</Text>
        </View>
      )}

      {/* Test Control Section */}
      {isTestToolsEnabled() && (
        <View style={styles.testSection}>
          <Text style={styles.testHeading}>Developer Testing</Text>
          <TouchableOpacity
            onPress={handleResetAds}
            style={styles.resetButton}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.textGrey} />
            <Text style={styles.resetButtonText}>Reset ads (test)</Text>
          </TouchableOpacity>
          <Text style={styles.testNote}>
            Tap this to re-enable the Ad placeholder on Explore.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xxl + 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  heroIconBadge: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.circle,
    backgroundColor: '#FFF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headline: {
    ...Typography.h1,
    fontSize: 24,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subheadline: {
    ...Typography.bodyMedium,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 22,
  },
  activeCard: {
    backgroundColor: '#F8FFF9',
    borderColor: '#C3E6CD',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  activeTextWrap: {
    flex: 1,
  },
  activeTitle: {
    ...Typography.h3,
    color: '#2E7D32',
    marginBottom: 2,
  },
  activeDesc: {
    ...Typography.bodySmall,
    color: Colors.textDark,
  },
  benefitsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  benefitsTitle: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...Typography.bodyMedium,
    color: Colors.textDark,
    flex: 1,
  },
  pricingCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  purchaseLabel: {
    ...Typography.h3,
    color: Colors.textDark,
  },
  purchaseSub: {
    ...Typography.caption,
    color: Colors.textGrey,
    marginTop: 2,
  },
  priceTag: {
    ...Typography.h1,
    color: Colors.primary,
    fontSize: 26,
  },
  purchaseButton: {
    width: '100%',
  },
  bannerContainer: {
    backgroundColor: '#E8F5E9',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  bannerText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: '#2E7D32',
  },
  testSection: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  testHeading: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textGrey,
    marginBottom: Spacing.sm,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textGrey,
  },
  testNote: {
    ...Typography.caption,
    color: Colors.textGrey,
    marginTop: Spacing.xs,
  },
});
