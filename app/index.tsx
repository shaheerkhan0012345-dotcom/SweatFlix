import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { useOnboarding } from '../context/OnboardingContext';

export default function SplashScreen() {
  const router = useRouter();
  const { session, user, profile, isLoading } = useAuth();
  const { state: onboardingState, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    let hasNavigated = false;

    const navigate = () => {
      if (hasNavigated) return;
      hasNavigated = true;

      // 1. If Supabase is not configured yet, fallback to local onboarding check
      if (!isSupabaseConfigured) {
        if (onboardingState.isCompleted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login' as any);
        }
        return;
      }

      // 2. Not logged in -> go to login
      if (!session || !user) {
        router.replace('/login' as any);
        return;
      }

      // 3. Logged in -> check username first (cannot be skipped)
      if (!profile?.username) {
        router.replace('/auth/choose-username' as any);
        return;
      }

      // 4. Check onboarding completion
      if (profile?.onboarding_completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/step1');
      }
    };

    if (!isLoading && !onboardingLoading) {
      // Small timeout to allow root navigator to mount properly
      const timer = setTimeout(navigate, 100);
      return () => clearTimeout(timer);
    }

    // Safety timeout: If auth or profile check takes longer than 2.5s, proceed automatically
    const safetyTimer = setTimeout(() => {
      navigate();
    }, 2500);

    return () => clearTimeout(safetyTimer);
  }, [isLoading, onboardingLoading, session, user, profile?.username, profile?.onboarding_completed, onboardingState.isCompleted, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name="flame" size={54} color="#FFFFFF" />
      </View>
      <Text style={styles.appName}>SWEATFLIX</Text>
      <Text style={styles.tagline}>Stream workouts. Crush goals.</Text>

      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textGrey,
    fontWeight: '500',
  },
  spinnerContainer: {
    marginTop: Spacing.xxl + 10,
  },
});
