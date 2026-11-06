import { Platform, Linking, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { notificationService } from './notificationService';

// Configure how notifications appear when app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STORAGE_KEY_PROMPTED = '@sweatflix_notif_prompted';
const STORAGE_KEY_SAVED_TOKEN = '@sweatflix_saved_push_token';
const WORKOUT_REMINDER_ID = 'sweatflix_daily_workout_reminder';
export const NOTIFICATION_CHANNEL_ID = 'sweatflix_notifications';

export const pushNotificationService = {
  /**
   * Configure Android Notification Channel with athletic red accent color
   */
  async configureChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        const isExpoGo =
          Constants.appOwnership === 'expo' ||
          (Constants as any).executionEnvironment === 'storeClient';
        if (isExpoGo) {
          return;
        }

        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
          name: 'SweatFlix Notifications',
          description: 'Updates on friend requests, 1v1 challenges, likes and daily workout reminders.',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#E5252A',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });
      } catch (err: any) {
        console.log('[pushNotificationService] Channel config skipped in Expo Go:', err?.message);
      }
    }
  },

  /**
   * Check current push notification permission status
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Request push notification permissions with an explanation prompt at a natural moment
   * (e.g. after sending a friend request or creating a challenge).
   * Never prompts on initial app launch.
   */
  async requestPermissionsAtNaturalMoment(
    userId: string,
    contextReason: 'friend_request' | 'challenge' | 'settings'
  ): Promise<boolean> {
    try {
      // 1. Check existing permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') {
        await this.registerTokenForUser(userId);
        return true;
      }

      // 2. If previously denied and invoked from settings, offer device settings link
      if (existingStatus === 'denied' && contextReason === 'settings') {
        Alert.alert(
          'Notifications are Disabled',
          'Please enable notifications in your device settings to receive friend challenge updates and streak alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      // 3. Request system permission
      const { status } = await Notifications.requestPermissionsAsync();
      await AsyncStorage.setItem(STORAGE_KEY_PROMPTED, 'true');

      if (status === 'granted') {
        await this.registerTokenForUser(userId);
        return true;
      } else {
        if (contextReason === 'settings') {
          Alert.alert(
            'Notifications Disabled',
            'You will not receive live challenge invites or friend requests until notifications are enabled.',
            [
              { text: 'OK', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
        return false;
      }
    } catch (err: any) {
      console.warn('requestPermissions error:', err?.message);
      return false;
    }
  },

  /**
   * Fetch the Expo Push Token and register it in Supabase push_tokens
   */
  async registerTokenForUser(userId: string): Promise<string | null> {
    if (!userId) return null;

    // Push notifications only work on real physical devices
    if (!Device.isDevice) {
      console.log('[pushNotificationService] Push notifications require a physical device.');
      return null;
    }

    const isExpoGo =
      Constants.appOwnership === 'expo' ||
      (Constants as any).executionEnvironment === 'storeClient';
    if (isExpoGo && Platform.OS === 'android') {
      return null;
    }

    try {
      await this.configureChannel();

      // Get Expo Project ID
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      const token = tokenData.data;
      if (token) {
        // Save locally
        await AsyncStorage.setItem(STORAGE_KEY_SAVED_TOKEN, token);
        // Save to Supabase backend
        await notificationService.registerPushToken(userId, token, Platform.OS);
        return token;
      }
    } catch (err: any) {
      console.warn('[pushNotificationService] Token retrieval error:', err?.message);
    }

    return null;
  },

  /**
   * Remove token on logout
   */
  async unregisterToken(): Promise<void> {
    try {
      const savedToken = await AsyncStorage.getItem(STORAGE_KEY_SAVED_TOKEN);
      if (savedToken) {
        await notificationService.removePushToken(savedToken);
        await AsyncStorage.removeItem(STORAGE_KEY_SAVED_TOKEN);
      }
    } catch (err: any) {
      console.warn('[pushNotificationService] Unregister token error:', err?.message);
    }
  },

  /**
   * Handle incoming push tap / deep link navigation
   */
  handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    if (!data || !data.type) return;

    const notifType = data.type;
    const refId = data.ref_id ? String(data.ref_id) : undefined;

    switch (notifType) {
      case 'friend_request':
      case 'friend_accepted':
        router.push('/community/friends' as any);
        break;

      case 'challenge_invite':
      case 'challenge_accepted':
      case 'challenge_entry':
      case 'challenge_result':
        if (refId) {
          router.push({
            pathname: '/community/challenge-detail',
            params: { id: refId },
          });
        } else {
          router.push('/community/challenges' as any);
        }
        break;

      case 'post_like':
        if (refId) {
          router.push({
            pathname: '/community/post-detail',
            params: { id: refId },
          });
        } else {
          router.push('/(tabs)/community' as any);
        }
        break;

      case 'workout_reminder':
        router.push('/(tabs)' as any);
        break;

      default:
        router.push('/community/notifications' as any);
        break;
    }
  },

  /**
   * Make workout reminder from Step 6 real:
   * Schedules a daily local notification at the chosen time ("Time to sweat! Your workout is ready"),
   * and cancels or reschedules it when the setting or time changes.
   */
  async scheduleWorkoutReminder(enabled: boolean, timeStr: string): Promise<void> {
    try {
      // 1. Cancel existing scheduled workout reminder
      await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});

      if (!enabled) {
        console.log('[pushNotificationService] Workout reminders disabled.');
        return;
      }

      // Ensure notification channel is active on Android
      await this.configureChannel();

      // 2. Parse time string: e.g. "08:00 AM", "07:30 PM", "18:00"
      const { hour, minute } = this.parseTimeString(timeStr);

      // 3. Schedule recurring daily local notification
      await Notifications.scheduleNotificationAsync({
        identifier: WORKOUT_REMINDER_ID,
        content: {
          title: 'SweatFlix 💪',
          body: 'Time to sweat! Your workout is ready.',
          sound: 'default',
          color: '#E5252A',
          data: { type: 'workout_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      console.log(`[pushNotificationService] Daily workout reminder scheduled for ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    } catch (err: any) {
      console.warn('[pushNotificationService] scheduleWorkoutReminder error:', err?.message);
    }
  },

  /**
   * Helper to parse time strings like "08:00 AM" or "18:30" into { hour, minute }
   */
  parseTimeString(timeStr: string): { hour: number; minute: number } {
    let hour = 8;
    let minute = 0;

    if (!timeStr) return { hour, minute };

    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');

    const parts = clean.replace(/[APM\s]/g, '').split(':');
    if (parts.length >= 1) {
      const parsedH = parseInt(parts[0], 10);
      if (!isNaN(parsedH)) {
        hour = parsedH;
        if (isPM && hour < 12) hour += 12;
        if (isAM && hour === 12) hour = 0;
      }
    }

    if (parts.length >= 2) {
      const parsedM = parseInt(parts[1], 10);
      if (!isNaN(parsedM)) {
        minute = parsedM;
      }
    }

    return { hour, minute };
  },
};
