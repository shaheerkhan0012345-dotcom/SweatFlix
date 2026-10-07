import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../i18n';
import { Colors } from '../constants/theme';
import { AuthProvider } from '../context/AuthContext';
import { OnboardingProvider } from '../context/OnboardingContext';
import { HomeProgressProvider } from '../context/HomeProgressContext';
import { PremiumProvider } from '../context/PremiumContext';
import { CustomWorkoutsProvider } from '../context/CustomWorkoutsContext';
import { SettingsProvider } from '../context/SettingsContext';
import { HealthMetricsProvider } from '../context/HealthMetricsContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function RootLayout() {
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
                    <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerStyle: {
                      backgroundColor: Colors.background,
                    },
                    headerTintColor: Colors.primary,
                    headerTitleStyle: {
                      fontWeight: '700',
                      color: Colors.textDark,
                    },
                    headerShadowVisible: false,
                    contentStyle: {
                      backgroundColor: Colors.background,
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
                </Stack>
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
