import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { WeeklyActivityChart } from '../../components/WeeklyActivityChart';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import { useHomeProgress, getTodayDayIndex } from '../../context/HomeProgressContext';
import { usePremium } from '../../context/PremiumContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useHealthMetrics } from '../../context/HealthMetricsContext';
import { isTestToolsEnabled } from '../../lib/config';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { state: onboardingState } = useOnboarding();
  const { progress } = useHomeProgress();
  const { isPremium } = usePremium();
  const { settings, resetAllData } = useSettings();
  const { profile, signOut, deleteAccount } = useAuth();
  const { metrics, bmi, bmiCategory } = useHealthMetrics();

  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const displayName = profile?.name || settings.name || 'Champ';
  const isImperial = settings.workoutSettings.units === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Format weights based on profile/onboarding units
  const rawCurrentWeight = metrics.currentWeightKg || profile?.weight_kg || parseFloat(onboardingState.weight) || 72;
  const rawGoalWeight = metrics.targetWeightKg || profile?.goal_kg || parseFloat(onboardingState.goalWeight) || 70;
  const displayCurrentWeight = isImperial
    ? `${Math.round(rawCurrentWeight * 2.20462)} ${weightUnit}`
    : `${rawCurrentWeight} ${weightUnit}`;
  const displayGoalWeight = isImperial
    ? `${Math.round(rawGoalWeight * 2.20462)} ${weightUnit}`
    : `${rawGoalWeight} ${weightUnit}`;

  const totalCalories = progress.totalKcal || progress.completedCount * 280;
  const totalWorkouts = progress.totalWorkouts || progress.completedCount;
  const todayIndex = getTodayDayIndex();
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleRateUs = async () => {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      } else {
        Alert.alert(
          'Rate SweatFlix ⭐',
          'Thank you for using SweatFlix! In-app rating dialogs are active in app store production builds.'
        );
      }
    } catch {
      Alert.alert('Rate SweatFlix', 'Thank you for your rating and feedback!');
    }
  };

  const handleConfirmReset = async () => {
    setShowResetModal(false);
    await resetAllData();
    router.replace('/');
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login' as any);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    await deleteAccount();
    await resetAllData();
    router.replace('/login' as any);
  };

  return (
    <ScreenContainer scrollable edges={['left', 'right']} contentContainerStyle={styles.container}>
      {/* 1. Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{displayName}</Text>
              {isPremium ? (
                <View style={styles.proPill}>
                  <Text style={styles.proPillText}>👑 PRO</Text>
                </View>
              ) : (
                <View style={styles.freePill}>
                  <Text style={styles.freePillText}>{t('profile.freeMember')}</Text>
                </View>
              )}
            </View>
            <Text style={styles.userSub}>
              {onboardingState.fitnessLevel || 'Fitness Enthusiast'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            style={styles.editProfileBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={14} color={Colors.primary} />
            <Text style={styles.editProfileBtnText}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 2. Stats Tiles (2x2 Grid + Streak Tile) */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          {/* Current Weight */}
          <Card style={styles.statTile}>
            <Ionicons name="speedometer-outline" size={20} color={Colors.primary} />
            <Text style={styles.statVal}>{displayCurrentWeight}</Text>
            <Text style={styles.statLabel}>{t('profile.stats.currentWeight')}</Text>
          </Card>

          {/* Goal Weight */}
          <Card style={styles.statTile}>
            <Ionicons name="flag-outline" size={20} color={Colors.accent} />
            <Text style={styles.statVal}>{displayGoalWeight}</Text>
            <Text style={styles.statLabel}>{t('profile.stats.goalWeight')}</Text>
          </Card>

          {/* Calories Burned */}
          <Card style={styles.statTile}>
            <Ionicons name="flame-outline" size={20} color="#FF5A00" />
            <Text style={styles.statVal}>{totalCalories} kcal</Text>
            <Text style={styles.statLabel}>{t('profile.stats.caloriesBurned')}</Text>
          </Card>

          {/* Workouts Done */}
          <Card style={styles.statTile}>
            <Ionicons name="barbell-outline" size={20} color={Colors.primary} />
            <Text style={styles.statVal}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>{t('profile.stats.workoutsDone')}</Text>
          </Card>

          {/* BMI Tile */}
          <Card style={styles.statTile}>
            <Ionicons name="fitness-outline" size={20} color="#10B981" />
            <Text style={styles.statVal}>{bmi}</Text>
            <Text style={styles.statLabel}>{bmiCategory}</Text>
          </Card>

          {/* Hydration Tile */}
          <Card style={styles.statTile}>
            <Ionicons name="water-outline" size={20} color="#0284C7" />
            <Text style={styles.statVal}>{metrics.waterIntakeMl} ml</Text>
            <Text style={styles.statLabel}>Water Today</Text>
          </Card>
        </View>

        {/* Streak Tile */}
        <Card style={styles.streakTile}>
          <View style={styles.streakLeft}>
            <View style={styles.streakIconCircle}>
              <Ionicons name="flame" size={24} color="#FF5A00" />
            </View>
            <View>
              <Text style={styles.streakVal}>{progress.streak} Days</Text>
              <Text style={styles.streakLabel}>{t('profile.stats.currentStreak')}</Text>
            </View>
          </View>
          <Text style={styles.streakEncourage}>
            {progress.streak > 0 ? 'Consistency is key! 🔥' : 'Start your streak today!'}
          </Text>
        </Card>
      </View>

      {/* 3. Progress Chart */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{t('profile.chart.title')}</Text>
          <Text style={styles.chartSub}>{t('profile.chart.sub')}</Text>
        </View>
        <WeeklyActivityChart
          completedDays={progress.completedDays}
          todayIndex={todayIndex}
        />
      </Card>

      {/* 4. Premium Card */}
      {isPremium ? (
        <Card style={styles.premiumActiveCard}>
          <View style={styles.premiumTop}>
            <Ionicons name="diamond" size={22} color="#FF6B00" />
            <Text style={styles.premiumActiveTitle}>{t('profile.premium.activeTitle')}</Text>
          </View>
          <Text style={styles.premiumActiveSub}>{t('profile.premium.activeSub')}</Text>
        </Card>
      ) : (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/premium')}
          style={styles.premiumBannerCard}
        >
          <View style={styles.premiumBannerTop}>
            <View style={styles.crownCircle}>
              <Ionicons name="diamond" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.premiumBannerTextWrap}>
              <Text style={styles.premiumBannerTitle}>{t('profile.premium.bannerTitle')}</Text>
              <Text style={styles.premiumBannerSub}>{t('profile.premium.bannerSub')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* 5. Grouped Settings Sections */}
      <View style={styles.settingsGroup}>
        {/* Workout Settings */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/profile/workout-settings')}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#FFEAEA' }]}>
              <Ionicons name="fitness-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.workoutSettings')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
        </TouchableOpacity>

        {/* General Settings */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/profile/general-settings')}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#EBF3FF' }]}>
              <Ionicons name="options-outline" size={18} color="#208AEF" />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.generalSettings')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
        </TouchableOpacity>

        {/* Language */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/profile/language')}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#FFF5E5' }]}>
              <Ionicons name="globe-outline" size={18} color="#FF8A1F" />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.language')}</Text>
          </View>
          <View style={styles.rowRightBadge}>
            <Text style={styles.rowRightText}>English</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Support & Ads */}
      <View style={styles.settingsGroup}>
        {/* Feedback */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/profile/feedback')}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#F0EBF9' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#7B42BC" />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.feedback')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
        </TouchableOpacity>

        {/* Rate Us */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleRateUs}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#FFFBE6' }]}>
              <Ionicons name="star-outline" size={18} color="#F5A623" />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.rateUs')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
        </TouchableOpacity>

        {/* Remove Ads */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/profile/remove-ads')}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="ban-outline" size={18} color="#2E7D32" />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.removeAds')}</Text>
          </View>
          <View style={styles.rowRightBadge}>
            {settings.adsRemoved || isPremium ? (
              <Text style={styles.activeTag}>REMOVED</Text>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
          </View>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.settingsGroup}>
        {/* Privacy Policy */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/profile/privacy')}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textDark} />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.privacy')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
        </TouchableOpacity>

        {/* Terms of Service */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/profile/terms')}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="document-text-outline" size={18} color={Colors.textDark} />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.terms')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.textDark} />
            </View>
            <Text style={styles.settingsRowLabel}>{t('profile.sections.version')}</Text>
          </View>
          <Text style={styles.versionText}>v1.0.0 (Build 57)</Text>
        </View>

        {/* Delete Account & Data */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowDeleteModal(true)}
          style={styles.settingsRow}
        >
          <View style={styles.settingsRowLeft}>
            <View style={[styles.settingsIconWrap, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="trash-outline" size={18} color="#D32F2F" />
            </View>
            <Text style={[styles.settingsRowLabel, { color: '#D32F2F', fontWeight: '600' }]}>
              Delete my account and data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textGrey} />
        </TouchableOpacity>
      </View>

      {/* 6. Log Out & Reset All Data */}
      <View style={styles.actionsSection}>
        <Button
          title={t('profile.actions.logout')}
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        {isTestToolsEnabled() && (
          <TouchableOpacity
            onPress={() => setShowResetModal(true)}
            style={styles.resetLink}
            activeOpacity={0.7}
          >
            <Text style={styles.resetLinkText}>{t('profile.actions.resetData')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reset Confirmation Modal */}
      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="warning" size={28} color="#FF3B30" />
            </View>
            <Text style={styles.modalTitle}>{t('profile.actions.resetConfirmTitle')}</Text>
            <Text style={styles.modalSub}>{t('profile.actions.resetConfirmSub')}</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowResetModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>{t('profile.actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmReset}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmBtnText}>{t('profile.actions.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconCircle, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="trash" size={28} color="#D32F2F" />
            </View>
            <Text style={styles.modalTitle}>Delete Account & Data?</Text>
            <Text style={styles.modalSub}>
              This will permanently delete your cloud profile, workout records, challenge history, and sign you out. This action cannot be undone.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={[styles.modalConfirmBtn, { backgroundColor: '#D32F2F' }]}
              >
                <Text style={styles.modalConfirmBtnText}>Delete Permanently</Text>
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
    paddingBottom: 88, // Tab bar clearance
  },
  headerCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  proPill: {
    backgroundColor: '#FFF2E5',
    borderWidth: 1,
    borderColor: '#FF8A1F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  proPillText: {
    color: '#FF6B00',
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
  },
  freePill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  freePillText: {
    color: Colors.textGrey,
    fontSize: 9,
    fontWeight: Typography.weights.bold,
  },
  userSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEAEA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  editProfileBtnText: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  statsSection: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statTile: {
    width: '48%',
    padding: Spacing.md,
    alignItems: 'flex-start',
    marginVertical: 0,
  },
  statVal: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },
  streakTile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FFF9F5',
    borderColor: '#FFE0CC',
    borderWidth: 1.5,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEAD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: '#FF5A00',
  },
  streakLabel: {
    fontSize: 11,
    color: Colors.textGrey,
  },
  streakEncourage: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
  chartCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  chartHeader: {
    marginBottom: Spacing.sm,
  },
  chartTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
  },
  chartSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    marginTop: 2,
  },
  premiumActiveCard: {
    backgroundColor: '#FFFBF7',
    borderColor: '#FFD9B3',
    borderWidth: 1.5,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  premiumTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  premiumActiveTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    color: '#FF6B00',
  },
  premiumActiveSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  premiumBannerCard: {
    backgroundColor: '#FF7A00',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  premiumBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  premiumBannerTextWrap: {
    flex: 1,
  },
  premiumBannerTitle: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.heavy,
    fontSize: Typography.sizes.sm,
  },
  premiumBannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 2,
  },
  settingsGroup: {
    backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.card,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textDark,
  },
  rowRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowRightText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  activeTag: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  versionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
  },
  actionsSection: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
  },
  resetLink: {
    paddingVertical: Spacing.md,
  },
  resetLinkText: {
    fontSize: Typography.sizes.xs,
    color: '#FF3B30',
    fontWeight: Typography.weights.semiBold,
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
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
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
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
  },
});
