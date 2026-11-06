import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

interface ProMembershipCardProps {
  onPress?: () => void;
  style?: object;
}

export function ProMembershipCard({ onPress, style }: ProMembershipCardProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const { settings } = useSettings();
  const { isDarkMode, colors } = useTheme();
  const athleteName = profile?.name || settings?.name || 'Athlete';

  // Breathing pulse animation for card border & button glow
  const pulseAnim = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withTiming(1.02, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withTiming(0.9, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulseAnim, glowOpacity]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: pulseAnim.value }],
  }));

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/premium');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#131926' : '#FFFFFF',
          borderColor: isDarkMode ? '#2D3748' : '#FEE2E2',
        },
        style,
      ]}
    >
      {/* Animated Subtle Ambient Glow Line */}
      <Animated.View
        style={[
          styles.glowHighlight,
          {
            borderColor: Colors.primary,
          },
          animatedGlowStyle,
        ]}
      />

      {/* Top Tag: LIMITED TIME OFFER */}
      <View style={styles.topBadgeRow}>
        <View style={styles.urgencyPill}>
          <View style={styles.livePulseDot} />
          <Text style={styles.urgencyPillText}>LIMITED TIME VIP PASS • SAVE 80%</Text>
        </View>
        <View style={styles.pricePill}>
          <Text style={styles.pricePillText}>$7.99 / year</Text>
        </View>
      </View>

      {/* Hero Row: Squircle Crown + Personalized Headline */}
      <View style={styles.topRow}>
        <View style={styles.crownSquircle}>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>

        <View style={styles.headlineWrap}>
          <Text style={[styles.headlineText, { color: colors.text }]}>
            {athleteName}, unlock your dream physique with PRO
          </Text>
          <Text style={[styles.subheadlineText, { color: colors.textSecondary }]}>
            Full 3D muscle targeting, AI diet coach &amp; live health analytics.
          </Text>
        </View>
      </View>

      {/* 4 Feature Badges Grid */}
      <View style={styles.featurePillsRow}>
        <View style={styles.featureItem}>
          <View
            style={[
              styles.featureIconCircle,
              { backgroundColor: isDarkMode ? '#1E293B' : '#FFF0F0' },
            ]}
          >
            <Ionicons name="barbell" size={17} color={Colors.primary} />
          </View>
          <Text style={[styles.featureLabel, { color: colors.text }]}>3D Workouts</Text>
        </View>

        <View style={styles.featureItem}>
          <View
            style={[
              styles.featureIconCircle,
              { backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7' },
            ]}
          >
            <Ionicons name="analytics" size={17} color="#D97706" />
          </View>
          <Text style={[styles.featureLabel, { color: colors.text }]}>Live Analytics</Text>
        </View>

        <View style={styles.featureItem}>
          <View
            style={[
              styles.featureIconCircle,
              { backgroundColor: isDarkMode ? '#1E293B' : '#ECFDF5' },
            ]}
          >
            <Ionicons name="restaurant" size={17} color="#10B981" />
          </View>
          <Text style={[styles.featureLabel, { color: colors.text }]}>AI Diet Plans</Text>
        </View>

        <View style={styles.featureItem}>
          <View
            style={[
              styles.featureIconCircle,
              { backgroundColor: isDarkMode ? '#1E293B' : '#EEF2FF' },
            ]}
          >
            <Ionicons name="ban" size={17} color="#6366F1" />
          </View>
          <Text style={[styles.featureLabel, { color: colors.text }]}>100% Ad-Free</Text>
        </View>
      </View>

      {/* Prominent High-Conversion Action Button */}
      <View style={[styles.upgradeBtn, { backgroundColor: Colors.primary }]}>
        <Ionicons name="sparkles" size={15} color="#FFFFFF" />
        <Text style={styles.upgradeBtnText}>Upgrade to SweatFlix PRO ›</Text>
      </View>

      {/* Footer Trust Badge */}
      <View style={styles.footerRow}>
        <Ionicons name="shield-checkmark" size={13} color="#10B981" />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Cancel anytime • Instant activation • 7-day money-back guarantee
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    marginVertical: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  glowHighlight: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    borderWidth: 1.5,
    pointerEvents: 'none',
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  urgencyPillText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  pricePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pricePillText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  crownSquircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#FF8A1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8A1F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  crownEmoji: {
    fontSize: 26,
  },
  headlineWrap: {
    flex: 1,
  },
  headlineText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  subheadlineText: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  featurePillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  featureLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
