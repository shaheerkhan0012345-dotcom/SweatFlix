import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { usePremium } from '../context/PremiumContext';
import { useSettings } from '../context/SettingsContext';

export const AdBanner: React.FC = () => {
  const router = useRouter();
  const { isPremium } = usePremium();
  const { settings } = useSettings();

  // If user is premium or has removed ads, do not render banner
  if (isPremium || settings.adsRemoved) {
    return null;
  }

  return (
    <View style={styles.adCard}>
      <View style={styles.adHeader}>
        <View style={styles.adTag}>
          <Text style={styles.adTagText}>ADVERTISEMENT</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/profile/remove-ads')}
          style={styles.removeAdsLink}
          activeOpacity={0.7}
        >
          <Text style={styles.removeAdsLinkText}>Remove ads ✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.adBody}>
        <View style={styles.iconCircle}>
          <Ionicons name="barbell" size={24} color="#777777" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.adTitle}>Elite Protein & Workout Gear</Text>
          <Text style={styles.adSub}>
            Premium supplements to accelerate muscle recovery.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  adCard: {
    backgroundColor: '#EAEAEA',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#DCDCDC',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  adTag: {
    backgroundColor: '#D0D0D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adTagText: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    color: '#555555',
    letterSpacing: 0.5,
  },
  removeAdsLink: {
    paddingVertical: 2,
  },
  removeAdsLinkText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
  },
  adBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  adTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: '#333333',
  },
  adSub: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
});

export default AdBanner;
