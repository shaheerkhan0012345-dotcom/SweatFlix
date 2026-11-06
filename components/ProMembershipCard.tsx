import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';
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
  const athleteName = profile?.name || settings?.name || 'Shaheer';

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
        isDarkMode && {
          backgroundColor: '#161F30',
          borderColor: '#2A1A24',
        },
        style,
      ]}
    >
      {/* Top Banner Row: Squircle Crown + Urgency Copy */}
      <View style={styles.topRow}>
        <View style={styles.crownSquircle}>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>

        <View style={styles.headlineWrap}>
          <Text style={[styles.headlineText, isDarkMode && { color: colors.text }]}>
            {athleteName}, want to gain 5–10 lbs weight?
          </Text>
          <Text style={[styles.subheadlineText, isDarkMode && { color: colors.textSecondary }]}>
            Start a 60–90 day plan today —{' '}
            <Text style={styles.limitedOfferText}>limited offer $7.99/year</Text>
          </Text>
        </View>
      </View>

      {/* 4 Feature Circles Row (exact match to video recording frames 025/030/055) */}
      <View style={styles.featurePillsRow}>
        <View style={styles.featureItem}>
          <View style={[styles.featureIconCircle, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Ionicons name="barbell" size={17} color={Colors.primary} />
          </View>
          <Text style={[styles.featureLabel, isDarkMode && { color: colors.text }]}>Premium Workouts</Text>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIconCircle, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Ionicons name="analytics" size={17} color={Colors.accent} />
          </View>
          <Text style={[styles.featureLabel, isDarkMode && { color: colors.text }]}>Advanced Analytics</Text>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIconCircle, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Ionicons name="restaurant" size={17} color="#10B981" />
          </View>
          <Text style={[styles.featureLabel, isDarkMode && { color: colors.text }]}>Personalized Plans</Text>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIconCircle, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Ionicons name="ban" size={17} color="#6366F1" />
          </View>
          <Text style={[styles.featureLabel, isDarkMode && { color: colors.text }]}>Ad-Free Experience</Text>
        </View>
      </View>

      {/* Prominent Action Button: Upgrade Now > */}
      <View style={styles.upgradeBtn}>
        <Text style={styles.upgradeBtnText}>Upgrade Now ›</Text>
      </View>

      {/* Footer Trust Badge */}
      <View style={styles.footerRow}>
        <Ionicons name="shield-checkmark" size={13} color="#10B981" />
        <Text style={[styles.footerText, isDarkMode && { color: colors.textMuted }]}>Cancel anytime • No hidden charges</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginVertical: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  crownSquircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
    fontSize: 24,
  },
  headlineWrap: {
    flex: 1,
  },
  headlineText: {
    fontSize: 14,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    lineHeight: 19,
  },
  subheadlineText: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 16,
  },
  limitedOfferText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  featurePillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: Spacing.sm,
    paddingHorizontal: 4,
  },
  featureItem: {
    alignItems: 'center',
    width: '24%',
  },
  featureIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 5,
  },
  featureLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 13,
  },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
    color: Colors.textGrey,
  },
});
