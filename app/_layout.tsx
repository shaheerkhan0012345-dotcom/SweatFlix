import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import '../i18n';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { OnboardingProvider } from '../context/OnboardingContext';
import { HomeProgressProvider } from '../context/HomeProgressContext';
import { PremiumProvider } from '../context/PremiumContext';
import { CustomWorkoutsProvider } from '../context/CustomWorkoutsContext';
import { SettingsProvider } from '../context/SettingsContext';
import { HealthMetricsProvider } from '../context/HealthMetricsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { pushNotificationService } from '../services/pushNotificationService';
import { LeagueResultModal } from '../components/LeagueResultModal';

// Suppress known development warning in Expo Go where push requires a standalone build
LogBox.ignoreLogs([
  '`expo-notifications` functionality is not fully supported in Expo Go',
  '[expo-notifications] Push notifications',
  'Push notifications (remote notifications) are unavailable in Expo Go',
]);

function LayoutNavigator() {
  const { isDarkMode, colors } = useTheme();
  const { user } = useAuth();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    try {
      // 1. Configure Android channel
      pushNotificationService.configureChannel().catch(() => {});

      // 2. Cold-start check: user tapped notification while app was closed
      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (response) {
            pushNotificationService.handleNotificationResponse(response);
          }
        })
        .catch(() => {});

      // 3. Foreground notifications listener
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        // Foreground notifications display alert/sound per setNotificationHandler
      });

      // 4. Response listener (push tap)
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        pushNotificationService.handleNotificationResponse(response);
      });
    } catch (e) {
      console.log('[LayoutNavigator] Notification listeners skipped in current runtime:', e);
    }

    return () => {
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch {}
    };
  }, []);

  // Refresh push token for authenticated user if permission has already been granted
  useEffect(() => {
    if (user?.id) {
      pushNotificationService
        .checkPermissions()
        .then((granted) => {
          if (granted) {
            pushNotificationService.registerTokenForUser(user.id).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            color: colors.text,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
                  <Stack.Screen
                    name="index"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="login"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="onboarding/step1"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="onboarding/step2"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="onboarding/step3"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="exercise-detail"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="create-workout"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="workout-detail"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/edit"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/workout-settings"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/general-settings"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/language"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/feedback"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/remove-ads"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/privacy"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/terms"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="active-workout"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="premium"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                    }}
                  />
                  <Stack.Screen
                    name="community/new-post"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                    }}
                  />
                  <Stack.Screen
                    name="auth/choose-username"
                    options={{
                      headerShown: false,
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen
                    name="community/search-users"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="community/friends"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="community/post-detail"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="user/[id]"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="community/challenges"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="community/new-challenge"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                    }}
                  />
                  <Stack.Screen
                    name="community/challenge-detail"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="community/leaderboard"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="community/new-story"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                    }}
                  />
                  <Stack.Screen
                    name="community/story-viewer"
                    options={{
                      headerShown: false,
                      animation: 'fade',
                    }}
                  />
                  <Stack.Screen
                    name="community/notifications"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="community/league"
                    options={{
                      headerShown: false,
                    }}
                  />
        </Stack>
        <LeagueResultModal />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });
  const [fontTimeout, setFontTimeout] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setFontTimeout(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontError && !fontTimeout) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E5252A" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AuthProvider>
          <OnboardingProvider>
            <PremiumProvider>
              <SettingsProvider>
                <HealthMetricsProvider>
                  <HomeProgressProvider>
                    <CustomWorkoutsProvider>
                      <ThemeProvider>
                        <LayoutNavigator />
                      </ThemeProvider>
                    </CustomWorkoutsProvider>
                  </HomeProgressProvider>
                </HealthMetricsProvider>
              </SettingsProvider>
            </PremiumProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
