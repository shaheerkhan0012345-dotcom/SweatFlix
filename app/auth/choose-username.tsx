import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';

export default function ChooseUsernameScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const debounceTimerRef = useRef<any>(null);

  // Prevent back navigation on Android (cannot be skipped)
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleChangeText = (text: string) => {
    // Force lowercase, remove spaces and @ prefix
    const clean = text.toLowerCase().replace(/\s/g, '').replace(/^@/, '');
    setUsername(clean);
    setIsAvailable(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!clean) {
      setErrorText(null);
      setChecking(false);
      return;
    }

    const validation = profileService.validateUsername(clean);
    if (!validation.valid) {
      setErrorText(validation.error || 'Invalid username format');
      setChecking(false);
      return;
    }

    setErrorText(null);
    setChecking(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const result = await profileService.checkUsernameAvailable(clean, user?.id);
        setChecking(false);
        if (result.available) {
          setIsAvailable(true);
          setErrorText(null);
        } else {
          setIsAvailable(false);
          setErrorText(result.error || 'Username is already taken');
        }
      } catch {
        setChecking(false);
        setErrorText('Could not check availability. Try again.');
      }
    }, 350);
  };

  const handleSubmit = async () => {
    if (!username || !isAvailable || submitting || !user?.id) return;

    try {
      setSubmitting(true);
      const res = await profileService.updateUsername(user.id, username);
      if (!res.success) {
        setErrorText(res.error || 'Failed to claim username');
        setIsAvailable(false);
        setSubmitting(false);
        return;
      }

      await refreshProfile();

      // Proceed forward based on onboarding status
      if (profile?.onboarding_completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/step1');
      }
    } catch (e: any) {
      setErrorText(e?.message || 'Failed to save username. Please try again.');
      setSubmitting(false);
    }
  };

  const isButtonDisabled = !username || !isAvailable || checking || submitting;

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Flame Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="at" size={42} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Choose your @username</Text>
          <Text style={styles.subtitle}>
            Pick a unique handle for your profile, community workout posts, and friend requests.
          </Text>

          {/* Input Card */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                errorText ? styles.inputWrapperError : isAvailable ? styles.inputWrapperSuccess : null,
              ]}
            >
              <Text style={styles.atSymbol}>@</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={handleChangeText}
                placeholder="your_handle"
                placeholderTextColor={Colors.textGrey}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {checking ? (
                <ActivityIndicator size="small" color={Colors.primary} style={styles.indicator} />
              ) : isAvailable ? (
                <Ionicons name="checkmark-circle" size={22} color="#10B981" style={styles.indicator} />
              ) : errorText ? (
                <Ionicons name="close-circle" size={22} color="#EF4444" style={styles.indicator} />
              ) : null}
            </View>

            {/* Availability / Error Feedback */}
            {errorText ? (
              <View style={styles.feedbackRow}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            ) : isAvailable ? (
              <View style={styles.feedbackRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.successText}>@{username} is available!</Text>
              </View>
            ) : null}

            {/* Helper rules */}
            <View style={styles.rulesCard}>
              <Text style={styles.rulesHeader}>Username rules:</Text>
              <Text style={styles.ruleItem}>• 3 to 20 characters</Text>
              <Text style={styles.ruleItem}>• Lowercase letters (a-z) and numbers (0-9)</Text>
              <Text style={styles.ruleItem}>• Underscores (_) and periods (.) allowed</Text>
              <Text style={styles.ruleItem}>• Unique across all SweatFlix athletes</Text>
            </View>
          </View>

          {/* Action Button */}
          <Button
            title={submitting ? 'Claiming Handle...' : 'Continue'}
            onPress={handleSubmit}
            disabled={isButtonDisabled}
            loading={submitting}
            style={styles.continueBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl + 10,
    paddingBottom: Spacing.xl,
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputWrapperSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  atSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    paddingVertical: 0,
  },
  indicator: {
    marginLeft: Spacing.xs,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs + 2,
    paddingHorizontal: Spacing.xs,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 6,
  },
  successText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 6,
  },
  rulesCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  rulesHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  ruleItem: {
    fontSize: 12,
    color: Colors.textGrey,
    lineHeight: 18,
  },
  continueBtn: {
    width: '100%',
    height: 54,
  },
});
