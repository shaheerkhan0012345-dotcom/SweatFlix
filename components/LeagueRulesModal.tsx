import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { LEAGUE_TIER_ORDER, TIER_CONFIGS } from '../services/leagueService';

interface LeagueRulesModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LeagueRulesModal: React.FC<LeagueRulesModalProps> = ({ visible, onClose }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
              borderColor: isDarkMode ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          {/* Grab handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.iconCircle}>
                <Ionicons name="trophy" size={20} color="#FF8A1F" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>How Leagues Work</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Rule 1: Weekly 30-Player Cohorts */}
            <View style={styles.ruleCard}>
              <View style={styles.ruleNumberCircle}>
                <Text style={styles.ruleNumberText}>1</Text>
              </View>
              <View style={styles.ruleTextWrap}>
                <Text style={[styles.ruleTitle, { color: colors.text }]}>
                  Weekly 30-Player Groups
                </Text>
                <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>
                  When you earn your first points of the week, you are placed in a league of about 30 athletes in your same division.
                </Text>
              </View>
            </View>

            {/* Rule 2: Top 5 Promotion */}
            <View style={styles.ruleCard}>
              <View style={[styles.ruleNumberCircle, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="arrow-up" size={14} color="#EA580C" />
              </View>
              <View style={styles.ruleTextWrap}>
                <Text style={[styles.ruleTitle, { color: '#EA580C' }]}>
                  Promotion Zone (Top 5)
                </Text>
                <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>
                  Finish in the top 5 players on Sunday at 23:59 UTC to move up to the next division.
                </Text>
              </View>
            </View>

            {/* Rule 3: Bottom 5 Demotion */}
            <View style={styles.ruleCard}>
              <View style={[styles.ruleNumberCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="arrow-down" size={14} color="#DC2626" />
              </View>
              <View style={styles.ruleTextWrap}>
                <Text style={[styles.ruleTitle, { color: '#DC2626' }]}>
                  Demotion Zone (Bottom 5)
                </Text>
                <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>
                  The bottom 5 active players move down one division. Bronze athletes cannot fall below Bronze. Players with 0 points are not active and are never demoted.
                </Text>
              </View>
            </View>

            {/* Rule 4: Weekly Champion Rewards */}
            <View style={styles.ruleCard}>
              <View style={[styles.ruleNumberCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="ribbon" size={14} color="#D97706" />
              </View>
              <View style={styles.ruleTextWrap}>
                <Text style={[styles.ruleTitle, { color: '#D97706' }]}>
                  Weekly Champion Reward
                </Text>
                <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>
                  Finish 1st place in a league with at least 10 active players to win <Text style={{ fontWeight: '700' }}>7 Days of Free Premium</Text> and the prestigious <Text style={{ fontWeight: '700' }}>Champion Crown 👑</Text> for the whole week!
                </Text>
              </View>
            </View>

            {/* Tiers List */}
            <Text style={[styles.sectionHeading, { color: colors.text }]}>League Divisions</Text>
            <View style={styles.tierGrid}>
              {LEAGUE_TIER_ORDER.map((tierName, idx) => {
                const meta = TIER_CONFIGS[tierName];
                return (
                  <View
                    key={tierName}
                    style={[
                      styles.tierRow,
                      {
                        backgroundColor: isDarkMode ? '#1E293B' : meta.lightBg,
                        borderColor: meta.borderColor,
                      },
                    ]}
                  >
                    <View style={styles.tierLeft}>
                      <View style={[styles.tierIconBadge, { backgroundColor: meta.color }]}>
                        <Ionicons name={meta.icon as any} size={14} color="#FFFFFF" />
                      </View>
                      <View>
                        <Text style={[styles.tierRowName, { color: meta.color }]}>
                          {meta.tier}
                        </Text>
                        <Text style={[styles.tierRowDesc, { color: colors.textSecondary }]}>
                          {meta.description}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.tierIndex, { color: colors.textSecondary }]}>
                      Tier {idx + 1}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Reset Time Notice */}
            <View
              style={[
                styles.noticeBox,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                Resets every Monday at 00:00 UTC. Your weekly points reset back to zero for the new week&apos;s battle.
              </Text>
            </View>
          </ScrollView>

          {/* Got it button */}
          <TouchableOpacity
            style={styles.gotItBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.gotItBtnText}>Got it, let&apos;s climb! 🔥</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: 10,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF2E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  ruleNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  ruleNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  ruleTextWrap: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  ruleDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 10,
  },
  tierGrid: {
    gap: 8,
    marginBottom: 16,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  tierIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tierRowName: {
    fontSize: 13,
    fontWeight: '800',
  },
  tierRowDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
  tierIndex: {
    fontSize: 11,
    fontWeight: '700',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: 4,
  },
  noticeText: {
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 8,
    flex: 1,
  },
  gotItBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: 8,
  },
  gotItBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
