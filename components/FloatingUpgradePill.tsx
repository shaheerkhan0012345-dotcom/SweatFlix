import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/theme';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';

interface FloatingUpgradePillProps {
  bottomOffset?: number;
}

export function FloatingUpgradePill({ bottomOffset = 64 }: FloatingUpgradePillProps) {
  const router = useRouter();
  const { isPremium } = usePremium();
  const { isDarkMode, colors } = useTheme();

  // If user is already premium, hide the upgrade pill
  if (isPremium) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push('/premium')}
        style={[
          styles.pillContainer,
          isDarkMode && {
            backgroundColor: '#161F30',
            borderColor: '#2A1A24',
          },
        ]}
      >
        <View style={[styles.crownCircle, isDarkMode && { backgroundColor: '#2A1A24', borderColor: '#3A2430' }]}>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.mainText, isDarkMode && { color: colors.text }]}>Unlock Full Access</Text>
          <Text style={styles.subText}>Only $0.02 / Day</Text>
        </View>

        <View style={styles.arrowCircle}>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    gap: 10,
  },
  crownCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownEmoji: {
    fontSize: 14,
  },
  textWrap: {
    justifyContent: 'center',
  },
  mainText: {
    fontSize: 12,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  subText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  arrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
