import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

const REMINDER_TIMES = ['07:00 AM', '08:00 AM', '12:00 PM', '06:00 PM', '08:00 PM'];

export default function GeneralSettingsScreen() {
  const router = useRouter();
  const { settings, updateGeneralSettings, clearCache } = useSettings();
  const gs = settings.generalSettings;

  const [showClearModal, setShowClearModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClearCacheConfirm = async () => {
    setShowClearModal(false);
    await clearCache();
    setToastMessage('App cache cleared! 🧹');
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

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
        <Text style={styles.headerTitle}>General Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastCard}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Notifications Card */}
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDesc}>
              Receive streak milestones and challenge updates.
            </Text>
          </View>
          <Switch
            value={gs.notifications}
            onValueChange={(val) => updateGeneralSettings({ notifications: val })}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>
      </Card>

      {/* Workout Reminders Card */}
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>Daily Workout Reminders</Text>
            <Text style={styles.settingDesc}>
              Get a gentle nudge to stay consistent with your routine.
            </Text>
          </View>
          <Switch
            value={gs.workoutReminders}
            onValueChange={(val) => updateGeneralSettings({ workoutReminders: val })}
            trackColor={{ false: '#DDDDDD', true: Colors.primary }}
          />
        </View>

        {gs.workoutReminders && (
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>Reminder Time</Text>
            <View style={styles.timeChipsRow}>
              {REMINDER_TIMES.map((time) => {
                const isSelected = gs.reminderTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    onPress={() => updateGeneralSettings({ reminderTime: time })}
                    style={[
                      styles.timeChip,
                      isSelected ? styles.timeChipSelected : styles.timeChipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        isSelected && styles.timeTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </Card>

      {/* Storage & Cache */}
      <Card style={styles.card}>
        <Text style={styles.settingTitle}>Storage & Memory</Text>
        <Text style={styles.settingDesc}>
          Free up temporary video thumbnail and asset storage.
        </Text>
        <TouchableOpacity
          onPress={() => setShowClearModal(true)}
          style={styles.clearCacheBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.primary} />
          <Text style={styles.clearCacheBtnText}>Clear Cached Files</Text>
        </TouchableOpacity>
      </Card>

      {/* Clear Cache Modal */}
      <Modal visible={showClearModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Clear Temporary Cache?</Text>
            <Text style={styles.modalSub}>
              This will remove temporary cache files. Your workouts and settings will NOT be lost.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowClearModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearCacheConfirm}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmBtnText}>Clear Cache</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  settingDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  flexOne: {
    flex: 1,
    marginRight: Spacing.md,
  },
  timeSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  timeLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  timeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  timeChipUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  timeChipSelected: {
    backgroundColor: Colors.primary,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  clearCacheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFEAEA',
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    marginTop: Spacing.md,
  },
  clearCacheBtnText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  modalSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    fontSize: Typography.sizes.sm,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
  },
});
