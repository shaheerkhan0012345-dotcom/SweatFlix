import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { ASIAN_REPLACEMENTS } from '../data/asianDietData';
import { AMERICAN_REPLACEMENTS } from '../data/americanDietData';

export interface MealReplacementModalProps {
  visible: boolean;
  onClose: () => void;
  originalMeal: any;
  cuisine?: 'american' | 'indian' | 'pakistani' | 'chinese' | 'british' | 'asian';
  currencySymbol?: string;
  onSelectAlternative: (replacement: any) => void;
}


export const MealReplacementModal: React.FC<MealReplacementModalProps> = ({
  visible,
  onClose,
  originalMeal,
  cuisine = 'asian',
  currencySymbol = '$',
  onSelectAlternative,
}: MealReplacementModalProps) => {
  const { colors, isDarkMode } = useTheme();

  if (!originalMeal) return null;

  const mealType = originalMeal.type || 'lunch';

  // Choose alternatives based on cuisine (Asian or American)
  let alternatives: any[] = [];
  if (cuisine === 'american') {
    const amList = (AMERICAN_REPLACEMENTS as any)[mealType] || AMERICAN_REPLACEMENTS.lunch;
    alternatives = amList;
  } else {
    const asList = (ASIAN_REPLACEMENTS as any)[mealType] || ASIAN_REPLACEMENTS.lunch;
    alternatives = asList;
  }

  const origCost = originalMeal.costUsd || 4.50;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Replace {originalMeal.type.toUpperCase()}
              </Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                Current: {originalMeal.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {cuisine === 'american'
                ? 'Choose a high-protein, wholesome American alternative for your plan:'
                : 'Choose a vibrant, macro-balanced Pan-Asian alternative for your plan:'}
            </Text>

            {alternatives.map((alt) => {
              const altCost = alt.costUsd || 4.50;
              const costDiff = Number((altCost - origCost).toFixed(2));

              return (
                <TouchableOpacity
                  key={alt.id}
                  style={[
                    styles.altCard,
                    { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  ]}
                  onPress={() => {
                    onSelectAlternative(alt);
                    onClose();
                  }}
                  activeOpacity={0.88}
                >
                  <View style={styles.altCardTop}>
                    <Text style={[styles.altCardTitle, { color: colors.text }]}>{alt.title}</Text>
                    <View style={styles.altCostBadge}>
                      <Text style={styles.altCostBadgeText}>
                        ${altCost.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.altCardSub, { color: colors.textSecondary }]}>{alt.subtitle}</Text>

                  {/* Macros Pills */}
                  <View style={styles.altMacrosRow}>
                    <View style={styles.macroPill}>
                      <Text style={[styles.macroPillVal, { color: Colors.primary }]}>{alt.baseKcal}</Text>
                      <Text style={styles.macroPillLabel}>Kcal</Text>
                    </View>
                    <View style={styles.macroPill}>
                      <Text style={[styles.macroPillVal, { color: '#6366F1' }]}>{alt.baseProtein}g</Text>
                      <Text style={styles.macroPillLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroPill}>
                      <Text style={[styles.macroPillVal, { color: '#F59E0B' }]}>{alt.baseCarbs}g</Text>
                      <Text style={styles.macroPillLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroPill}>
                      <Text style={[styles.macroPillVal, { color: '#10B981' }]}>{alt.baseFat}g</Text>
                      <Text style={styles.macroPillLabel}>Fat</Text>
                    </View>
                  </View>

                  {/* Savings / Difference Badge */}
                  <View style={styles.altCardFooter}>
                    <Text style={[styles.costDiffText, { color: costDiff <= 0 ? '#10B981' : '#F59E0B' }]}>
                      {costDiff < -0.1
                        ? `💸 Saves $${Math.abs(costDiff).toFixed(2)} compared to current meal`
                        : Math.abs(costDiff) <= 0.1
                        ? `⚖️ Similar estimated cost ($${altCost.toFixed(2)})`
                        : `+$${costDiff.toFixed(2)} for premium cuts/ingredients`}
                    </Text>
                    <View style={styles.selectBtn}>
                      <Text style={styles.selectBtnText}>Select Meal ▶</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '80%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.heavy,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  contentScroll: {
    padding: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 17,
  },
  altCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  altCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  altCardTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    flex: 1,
    marginRight: 8,
  },
  altCostBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  altCostBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: Typography.weights.heavy,
  },
  altCardSub: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  altMacrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    marginBottom: 10,
  },
  macroPill: {
    alignItems: 'center',
  },
  macroPillVal: {
    fontSize: 12,
    fontWeight: Typography.weights.heavy,
  },
  macroPillLabel: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  altCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  costDiffText: {
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
    flex: 1,
  },
  selectBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
});
