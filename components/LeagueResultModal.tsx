import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LeagueResult, leagueService, LEAGUE_TIER_ORDER } from '../services/leagueService';

interface LeagueResultModalProps {
  forcedResult?: LeagueResult | null;
  onDismiss?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LeagueResultModal: React.FC<LeagueResultModalProps> = ({
  forcedResult,
  onDismiss,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { user, refreshProfile } = useAuth();

  const [fetchedResult, setFetchedResult] = useState<LeagueResult | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const activeResult = forcedResult ?? fetchedResult;
  const isVisible = Boolean(activeResult && activeResult.id !== dismissedId);

  // Pulse animation for reward / promotion
  const [pulseAnim] = useState(() => new Animated.Value(0.95));

  useEffect(() => {
    let isCurrent = true;
    if (!forcedResult) {
      leagueService
        .getUnseenResult(user?.id)
        .then((unseen) => {
          if (isCurrent && unseen) {
            setFetchedResult(unseen);
          }
        })
        .catch(() => {});
    }
    return () => {
      isCurrent = false;
    };
  }, [forcedResult, user?.id]);

  useEffect(() => {
    if (isVisible) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [isVisible, pulseAnim]);

  if (!isVisible || !activeResult) return null;

  const result = activeResult;

  const oldTierMeta = leagueService.getTierMeta(result.old_tier);
  const newTierMeta = leagueService.getTierMeta(result.new_tier);

  const oldIdx = LEAGUE_TIER_ORDER.indexOf(result.old_tier);
  const newIdx = LEAGUE_TIER_ORDER.indexOf(result.new_tier);

  const isPromoted = newIdx > oldIdx;
  const isDemoted = newIdx < oldIdx;
  const isChampion = result.rank === 1;

  const handleClaim = async () => {
    if (result.id) {
      setDismissedId(result.id);
      await leagueService.markResultSeen(result.id);
    }
    // Refresh user profile so reward_premium_until and league_tier update in state
    if (refreshProfile) {
      refreshProfile().catch(() => {});
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClaim}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialogContainer,
            {
              backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
              borderColor: isChampion ? '#F59E0B' : isPromoted ? '#EA580C' : isDarkMode ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          {/* Header Icon with Glowing circle */}
          <Animated.View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isChampion ? '#FEF3C7' : isPromoted ? '#FFEDD5' : isDemoted ? '#FEE2E2' : '#F1F5F9',
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons
              name={isChampion ? 'trophy' : isPromoted ? 'sparkles' : isDemoted ? 'trending-down' : 'shield-checkmark'}
              size={48}
              color={isChampion ? '#D97706' : isPromoted ? '#EA580C' : isDemoted ? '#DC2626' : Colors.primary}
            />
          </Animated.View>

          {/* Title */}
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            {isChampion
              ? 'WEEKLY CHAMPION! 👑'
              : isPromoted
              ? 'PROMOTED! 🚀'
              : isDemoted
              ? 'DIVISION RESET'
              : 'LEAGUE RECAP'}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isChampion
              ? `You conquered your ${result.old_tier} league at Rank #1!`
              : isPromoted
              ? `Awesome hustle! You placed Rank #${result.rank} and advanced to the next league.`
              : isDemoted
              ? `You placed Rank #${result.rank}. You will battle in ${result.new_tier} this week.`
              : `You maintained your spot in ${result.old_tier} at Rank #${result.rank}.`}
          </Text>

          {/* Tier Transition Card */}
          <View
            style={[
              styles.transitionCard,
              {
                backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                borderColor: isDarkMode ? '#334155' : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.tierBox}>
              <View style={[styles.smallIconCircle, { backgroundColor: oldTierMeta.color }]}>
                <Ionicons name={oldTierMeta.icon as any} size={14} color="#FFFFFF" />
              </View>
              <Text style={[styles.tierName, { color: oldTierMeta.color }]}>
                {oldTierMeta.tier}
              </Text>
              <Text style={[styles.tierLabel, { color: colors.textSecondary }]}>Previous</Text>
            </View>

            <View style={styles.arrowWrap}>
              <Ionicons
                name={isPromoted ? 'arrow-forward' : isDemoted ? 'arrow-forward' : 'remove'}
                size={22}
                color={isPromoted ? '#EA580C' : isDemoted ? '#DC2626' : '#94A3B8'}
              />
            </View>

            <View style={styles.tierBox}>
              <View style={[styles.smallIconCircle, { backgroundColor: newTierMeta.color }]}>
                <Ionicons name={newTierMeta.icon as any} size={14} color="#FFFFFF" />
              </View>
              <Text style={[styles.tierName, { color: newTierMeta.color }]}>
                {newTierMeta.tier}
              </Text>
              <Text style={[styles.tierLabel, { color: colors.textSecondary }]}>Current</Text>
            </View>
          </View>

          {/* Champion Reward Card */}
          {result.reward_text && (
            <View
              style={[
                styles.rewardCard,
                {
                  backgroundColor: isDarkMode ? '#2E1E05' : '#FFFBEB',
                  borderColor: '#F59E0B',
                },
              ]}
            >
              <Ionicons name="gift" size={20} color="#D97706" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.rewardCardTitle}>Reward Unlocked!</Text>
                <Text style={styles.rewardCardSub}>{result.reward_text}</Text>
              </View>
            </View>
          )}

          {/* Rank Badge */}
          <View style={styles.rankPill}>
            <Text style={styles.rankPillText}>Finished #{result.rank} in your group</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.claimBtn,
              {
                backgroundColor: isChampion ? '#D97706' : Colors.primary,
              },
            ]}
            onPress={handleClaim}
            activeOpacity={0.85}
          >
            <Text style={styles.claimBtnText}>
              {isChampion ? 'Claim Rewards & Start Week 🎉' : 'Start This Week 🔥'}
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialogContainer: {
    width: Math.min(SCREEN_WIDTH - 40, 360),
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  transitionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 14,
  },
  tierBox: {
    alignItems: 'center',
    flex: 1,
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '800',
  },
  tierLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  arrowWrap: {
    paddingHorizontal: 8,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 14,
  },
  rewardCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  rewardCardSub: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 15,
  },
  rankPill: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 16,
  },
  rankPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  claimBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
