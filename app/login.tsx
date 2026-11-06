import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { isTestToolsEnabled } from '../lib/config';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, sendPasswordReset, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid && (mode === 'login' || name.trim().length > 0);

  const formatErrorMessage = (rawError: string): string => {
    const lower = rawError.toLowerCase();
    if (lower.includes('invalid login credentials')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (lower.includes('user already registered') || lower.includes('already exists')) {
      return 'An account with this email already exists. Please log in.';
    }
    if (lower.includes('network') || lower.includes('fetch failed') || lower.includes('failed to fetch')) {
      return 'No internet connection. Please check your network and try again.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Please confirm your email address or disable email confirmation in Supabase.';
    }
    return rawError;
  };

  const handleSubmit = async () => {
    if (!isFormValid || isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.replace('/');
      } else {
        const data: any = await signUp(email, password, name);
        if (data?.session) {
          router.replace('/onboarding/step1');
        } else {
          Alert.alert(
            'Check Your Email',
            'Your account was created! If email confirmation is enabled in your Supabase project, please check your inbox to confirm your email, then log in.',
            [{ text: 'Go to Log In', onPress: () => setMode('login') }]
          );
        }
      }
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('already registered')) {
        setErrorMessage(msg);
        setMode('login');
      } else {
        setErrorMessage(formatErrorMessage(msg || 'Authentication failed. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isEmailValid) {
      Alert.alert('Email Required', 'Please enter your valid email address to receive password reset instructions.');
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordReset(email);
      Alert.alert('Email Sent', `Password reset instructions have been sent to ${email.trim()}.`);
    } catch (e: any) {
      Alert.alert('Reset Failed', formatErrorMessage(e?.message || 'Unable to send reset email.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.replace('/');
    } catch (e: any) {
      Alert.alert(
        'Google Sign-In',
        e?.message || 'Google Sign-In is not configured yet. Please sign in with email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenContainer scrollable contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.flameCircle}>
            <Ionicons name="flame" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>SWEATFLIX</Text>
          <Text style={styles.brandSub}>
            {mode === 'login' ? 'Welcome back! Ready to sweat?' : 'Create your account to start streaming workouts.'}
          </Text>
        </View>

        {!isSupabaseConfigured && isTestToolsEnabled() && (
          <Card style={styles.demoBanner}>
            <View style={styles.demoBannerRow}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.accent} />
              <Text style={styles.demoBannerText}>
                Supabase credentials not configured in .env. Enter your keys or test offline.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.replace('/onboarding/step1')}
              style={styles.demoBypassButton}
              activeOpacity={0.7}
            >
              <Text style={styles.demoBypassText}>Continue in Test Mode →</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Mode Selector Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
            onPress={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
              Log In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, mode === 'signup' && styles.tabButtonActive]}
            onPress={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert Box */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#D32F2F" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Input Fields Card */}
        <Card style={styles.formCard}>
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={Colors.textGrey} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex Hunter"
                  placeholderTextColor={Colors.textGrey}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textGrey} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={Colors.textGrey}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {email.length > 0 && !isEmailValid && (
              <Text style={styles.fieldError}>Please enter a valid email address.</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>Password</Text>
              {mode === 'login' && (
                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textGrey} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="At least 8 characters"
                placeholderTextColor={Colors.textGrey}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeTouch}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textGrey}
                />
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 8 && (
              <Text style={styles.fieldError}>Password must be at least 8 characters.</Text>
            )}
          </View>

          {/* Primary Submit Button */}
          <View style={styles.buttonWrapper}>
            <Button
              title={mode === 'login' ? 'Log In' : 'Create Account'}
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!isFormValid || isLoading}
            />
          </View>
        </Card>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google OAuth Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.googleButtonText}>Continue with Google (Coming Soon)</Text>
        </TouchableOpacity>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing.xxl + 20,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  flameCircle: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGrey,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  demoBanner: {
    backgroundColor: '#FFF8F0',
    borderColor: '#FFE0B2',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  demoBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  demoBannerText: {
    fontSize: 12,
    color: Colors.textDark,
    flex: 1,
    lineHeight: 16,
  },
  demoBypassButton: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  demoBypassText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.textGrey,
  },
  tabTextActive: {
    color: Colors.textDark,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FFEBEE',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    fontSize: 13,
    color: '#D32F2F',
    flex: 1,
    fontWeight: '500',
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: Colors.textDark,
  },
  eyeTouch: {
    padding: Spacing.xs,
  },
  fieldError: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 4,
  },
  buttonWrapper: {
    marginTop: Spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: 12,
    color: Colors.textGrey,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 50,
    borderRadius: BorderRadius.button,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 40,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
});
