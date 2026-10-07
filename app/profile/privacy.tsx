import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <Text style={styles.lastUpdated}>Last updated: October 2026</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionHeading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          SweatFlix is designed with local-first privacy. All personal metrics such as your body focus,
          weight, height, and custom workout configurations are saved locally on your device using encrypted
          app storage.
        </Text>

        <Text style={styles.sectionHeading}>2. Fitness & Activity Data</Text>
        <Text style={styles.paragraph}>
          Your streak calculation, workout completion timestamps, and calorie estimates remain stored
          exclusively on your phone. We do not sell or trade your fitness information to advertisers.
        </Text>

        <Text style={styles.sectionHeading}>3. Subscriptions & Payments</Text>
        <Text style={styles.paragraph}>
          Any in-app purchases or subscription upgrades are managed directly through Apple App Store or Google
          Play Store billing systems. SweatFlix never receives or stores your credit card credentials.
        </Text>

        <Text style={styles.sectionHeading}>4. Data Deletion</Text>
        <Text style={styles.paragraph}>
          You can completely wipe all local fitness data, settings, and workout history at any time using
          the &quot;Reset All App Data&quot; option found in your Profile tab.
        </Text>

        <Text style={styles.sectionHeading}>5. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about our privacy policies or data handling, reach out to support@sweatflix.app.
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
