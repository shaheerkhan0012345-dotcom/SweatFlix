import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { pushNotificationService } from '../services/pushNotificationService';

interface NotificationPermissionModalProps {
  visible: boolean;
  contextReason: 'friend_request' | 'challenge';
  onDismiss: () => void;
  onGranted?: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  visible,
  contextReason,
  onDismiss,
  onGranted,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const isChallenge = contextReason === 'challenge';

  const title = isChallenge ? 'Never Miss a Rep! 🔥' : 'Stay in the Loop! 👋';
  const subtitle = isChallenge
    ? 'Get notified immediately when your opponent accepts your challenge, logs progress, or wins a round.'
    : 'Get notified when athletes accept your friend request, challenge you to a workout, or like your posts.';

  const handleEnable = async () => {
    onDismiss();
    if (user?.id) {
      const granted = await pushNotificationService.requestPermissionsAtNaturalMoment(
        user.id,
        contextReason
      );
      if (granted && onGranted) {
        onGranted();
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Bell Icon Circle */}
          <View style={styles.iconCircle}>
            <Ionicons name="notifications" size={32} color="#FFFFFF" />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                {isChallenge ? 'Real-time challenge score alerts' : 'Friend request & acceptance alerts'}
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Daily workout reminder nudges
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnable}
            activeOpacity={0.88}
          >
            <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
            <Text style={styles.enableButtonText}>Turn on Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notNowButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={[styles.notNowText, { color: colors.textSecondary }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  benefitsList: {
    width: '100%',
    gap: 10,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.xs,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: Typography.weights.bold,
  },
  notNowButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notNowText: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
  },
});
