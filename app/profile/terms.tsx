import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export default function TermsOfServiceScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <Text style={styles.lastUpdated}>Last updated: October 2026</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionHeading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, accessing, or using SweatFlix, you agree to comply with and be bound by these
          Terms of Service. If you do not agree, please do not use the application.
        </Text>

        <Text style={styles.sectionHeading}>2. Health & Exercise Disclaimer</Text>
        <Text style={styles.paragraph}>
          The workout videos, training routines, and calorie estimations provided by SweatFlix are intended
          for informational and fitness guidance only. Please consult a qualified medical physician before
          starting any vigorous training routine, especially if you have pre-existing medical conditions.
        </Text>

        <Text style={styles.sectionHeading}>3. Subscriptions & Digital Products</Text>
        <Text style={styles.paragraph}>
          SweatFlix PRO subscriptions and one-time Ad-Free purchases provide full access to premium video
          guides and features. Billing terms follow Apple and Google standard consumer refund terms.
        </Text>

        <Text style={styles.sectionHeading}>4. Code of Conduct</Text>
        <Text style={styles.paragraph}>
          Users agree not to decompile, reverse-engineer, or redistribute application assets, videos, or
          proprietary instructional content without written consent.
        </Text>

        <Text style={styles.sectionHeading}>5. Contact & Support</Text>
        <Text style={styles.paragraph}>
          Questions regarding these terms can be directed to legal@sweatflix.app.
        </Text>
      </Card>
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
    marginBottom: Spacing.xs,
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
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textGrey,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
  },
  sectionHeading: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  paragraph: {
    ...Typography.bodyMedium,
    color: Colors.textDark,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
});
