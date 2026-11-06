import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
export interface WeeklyGroceryModalProps {
  visible: boolean;
  onClose: () => void;
  initialWeek?: number;
  cuisine?: 'american' | 'indian' | 'pakistani' | 'chinese' | 'british' | 'asian';
  currencySymbol?: string;
}

interface GroceryCategoryItem {
  name: string;
  totalQuantity: string;
  costUsd: number;
}

interface GroceryCategory {
  categoryName: string;
  items: GroceryCategoryItem[];
}

export const WeeklyGroceryModal: React.FC<WeeklyGroceryModalProps> = ({
  visible,
  onClose,
  initialWeek = 1,
  cuisine = 'asian',
  currencySymbol = '$',
}) => {
  const { colors, isDarkMode } = useTheme();
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Generate grocery data based on active cuisine in USD ($)
  const groceryData = useMemo(() => {
    if (cuisine === 'american') {
      const americanCategories: GroceryCategory[] = [
        {
          categoryName: '🥩 Fresh Lean Proteins',
          items: [
            { name: 'Boneless Skinless Chicken Breasts', totalQuantity: '3.5 lbs (1.6 kg)', costUsd: 14.50 },
            { name: 'Fresh Atlantic Salmon Fillets', totalQuantity: '1.5 lbs (4 fillets)', costUsd: 16.80 },
            { name: 'Lean Ground Turkey (93/7)', totalQuantity: '2 lbs (900g)', costUsd: 9.80 },
            { name: 'Grade-A Large Farm Eggs', totalQuantity: '2 Cartons (24 eggs)', costUsd: 6.40 },
            { name: 'Solid White Albacore Tuna', totalQuantity: '4 Cans (5 oz each)', costUsd: 7.20 },
          ],
        },
        {
          categoryName: '🥔 Complex Carbs & Whole Grains',
          items: [
            { name: 'Old-Fashioned Rolled Oats', totalQuantity: '1 Tub (32 oz)', costUsd: 4.20 },
            { name: 'Organic Tri-Color Quinoa', totalQuantity: '1 Bag (16 oz)', costUsd: 4.50 },
            { name: 'Fresh Sweet Potatoes', totalQuantity: '5 Medium tubers', costUsd: 4.00 },
            { name: 'Whole Wheat Sourdough Bread', totalQuantity: '1 Artisan Loaf', costUsd: 4.80 },
            { name: 'Whole Wheat Large Tortilla Wraps', totalQuantity: '1 Pack (8 wraps)', costUsd: 3.60 },
          ],
        },
        {
          categoryName: '🥦 Fresh Farm Produce & Fruits',
          items: [
            { name: 'Fresh Broccoli Crowns & Asparagus', totalQuantity: '2 Bunches', costUsd: 5.60 },
            { name: 'Organic Baby Spinach & Salad Greens', totalQuantity: '1 Large Tub (16 oz)', costUsd: 5.00 },
            { name: 'Fresh Hass Avocados', totalQuantity: '4 Medium', costUsd: 4.80 },
            { name: 'Honeycrisp Apples & Cavendish Bananas', totalQuantity: '6 Apples + 1 Bunch', costUsd: 6.20 },
            { name: 'Fresh Blueberries / Strawberries', totalQuantity: '2 Pints (12 oz)', costUsd: 6.50 },
          ],
        },
        {
          categoryName: '🥛 Dairy & Healthy Fats',
          items: [
            { name: 'Plain Non-Fat Greek Yogurt', totalQuantity: '1 Tub (32 oz)', costUsd: 5.20 },
            { name: '2% Low-Fat Cottage Cheese', totalQuantity: '1 Tub (24 oz)', costUsd: 3.80 },
            { name: 'Raw Californian Almonds', totalQuantity: '1 Bag (12 oz)', costUsd: 6.00 },
            { name: '100% Natural Creamy Peanut Butter', totalQuantity: '1 Jar (16 oz)', costUsd: 3.40 },
          ],
        },
      ];

      const totalEstimatedUsd = americanCategories.reduce(
        (sum, cat) => sum + cat.items.reduce((s, i) => s + i.costUsd, 0),
        0
      );

      return {
        categories: americanCategories,
        totalEstimatedUsd: Number(totalEstimatedUsd.toFixed(2)),
      };
    }

    // Asian cuisine staples in realistic USD pricing
    const asianCategories: GroceryCategory[] = [
      {
        categoryName: '🍜 Asian Noodles & Complex Carbs',
        items: [
          { name: 'Fragrant Jasmine & Aged Basmati Rice', totalQuantity: '5 lbs (2.3 kg)', costUsd: 6.80 },
          { name: 'Japanese Fresh Ramen & Soba Noodles', totalQuantity: '3 Packs (12 oz)', costUsd: 5.20 },
          { name: 'Vietnamese / Thai Flat Rice Noodles', totalQuantity: '2 Packs (16 oz)', costUsd: 3.80 },
          { name: 'Steamed Bao Buns & Dumpling Wrappers', totalQuantity: '2 Packs (16 pcs)', costUsd: 4.60 },
          { name: 'Rolled Oats & Whole Wheat Atta', totalQuantity: '2 lbs (900g)', costUsd: 3.50 },
        ],
      },
      {
        categoryName: '🥢 Fresh Proteins, Fish & Tofu',
        items: [
          { name: 'Fresh Atlantic Salmon Fillets', totalQuantity: '1.5 lbs (4 fillets)', costUsd: 15.90 },
          { name: 'Boneless Skinless Chicken Breasts & Thighs', totalQuantity: '3.5 lbs (1.6 kg)', costUsd: 13.80 },
          { name: 'Extra Firm Organic Tofu & Edamame', totalQuantity: '3 Blocks + 1 Bag', costUsd: 6.20 },
          { name: 'Grade-A Large Farm Eggs', totalQuantity: '2 Cartons (24 eggs)', costUsd: 6.20 },
          { name: 'Yellow Moong & Toor Lentils (Dal)', totalQuantity: '2 lbs (900g)', costUsd: 3.90 },
        ],
      },
      {
        categoryName: '🥬 Asian Farm Greens & Aromatics',
        items: [
          { name: 'Baby Bok Choy & Chinese Gai Lan Broccoli', totalQuantity: '2 Bunches', costUsd: 4.80 },
          { name: 'Napa Cabbage & Fresh Bean Sprouts', totalQuantity: '1 Head + 1 Bag', costUsd: 4.20 },
          { name: 'Fresh Ginger Root, Garlic & Thai Chilies', totalQuantity: '1 Fresh Basket', costUsd: 3.60 },
          { name: 'Thai Basil, Fresh Mint & Green Scallions', totalQuantity: '4 Bunches', costUsd: 3.90 },
          { name: 'Ripe Papayas & Sweet Mangoes', totalQuantity: '4 Portions', costUsd: 5.50 },
        ],
      },
      {
        categoryName: '🍶 Sauces, Broths & Healthy Pantry',
        items: [
          { name: 'Low-Sodium Tamari & Light Soy Sauce', totalQuantity: '1 Bottle (16 oz)', costUsd: 3.80 },
          { name: 'Pure Toasted Sesame Oil & Mirin', totalQuantity: '2 Bottles', costUsd: 6.40 },
          { name: 'Light Coconut Milk & Miso Paste', totalQuantity: '2 Cans + 1 Tub', costUsd: 5.20 },
          { name: 'Japanese Matcha Green Tea & Spiced Chai', totalQuantity: '1 Tin / Box', costUsd: 6.00 },
          { name: 'Roasted Peanuts, Cashews & Seaweed (Nori)', totalQuantity: '2 Packs', costUsd: 4.90 },
        ],
      },
    ];

    const totalEstimatedUsd = asianCategories.reduce(
      (sum, cat) => sum + cat.items.reduce((s, i) => s + i.costUsd, 0),
      0
    );

    return {
      categories: asianCategories,
      totalEstimatedUsd: Number(totalEstimatedUsd.toFixed(2)),
    };
  }, [cuisine]);

  const toggleCheck = (itemKey: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const totalCheckedCount = useMemo(() => {
    return Object.values(checkedItems).filter(Boolean).length;
  }, [checkedItems]);

  const allItemsCount = useMemo(() => {
    return groceryData.categories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [groceryData]);

  const handleCopyList = () => {
    const cuisineLabels: Record<string, string> = {
      american: 'American Meals',
      indian: 'Indian Meals',
      pakistani: 'Pakistani Meals',
      chinese: 'Chinese Meals',
      british: 'British Meals',
      asian: 'Pan-Asian Meals',
    };
    const cLabel = cuisineLabels[cuisine] || 'Athletic Meals';
    Alert.alert(
      'Weekly Grocery List Ready! 🛒',
      `Week ${selectedWeek} shopping list for ${cLabel}.\nTotal Estimated Bill: $${groceryData.totalEstimatedUsd.toFixed(2)} USD`
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {cuisine === 'american' ? 'American Supermarket Essentials' : 'Asian Market Fresh Staples'} 🛒
              </Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                Week {selectedWeek} aggregated fresh staples in USD ($)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Week Selector Chips */}
          <View style={styles.weekSelectorRow}>
            {[1, 2, 3, 4].map((wk) => {
              const isSelected = selectedWeek === wk;
              return (
                <TouchableOpacity
                  key={wk}
                  style={[
                    styles.weekChip,
                    {
                      backgroundColor: isSelected
                        ? Colors.primary
                        : isDarkMode
                        ? '#1E293B'
                        : '#F1F5F9',
                      borderColor: isSelected ? Colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedWeek(wk)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.weekChipText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    Week {wk} (Days {(wk - 1) * 7 + 1}-{wk * 7})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Budget Total Summary Card */}
          <View style={[styles.totalBanner, { backgroundColor: isDarkMode ? '#1E293B' : '#ECFDF5', borderColor: '#10B981' }]}>
            <View style={styles.totalLeft}>
              <Text style={styles.totalLabel}>Estimated Week {selectedWeek} Total</Text>
              <Text style={styles.totalAmount}>${groceryData.totalEstimatedUsd.toFixed(2)} USD</Text>
            </View>
            <View style={styles.totalRight}>
              <Text style={styles.dailyAvg}>~${(groceryData.totalEstimatedUsd / 7).toFixed(2)} / day</Text>
              <Text style={styles.checkedProgressText}>
                {totalCheckedCount}/{allItemsCount} Items Bought
              </Text>
            </View>
          </View>

          {/* Categorized Items Scroll */}
          <ScrollView style={styles.groceryScroll} showsVerticalScrollIndicator={false}>
            {groceryData.categories.map((cat, catIdx) => (
              <View key={catIdx} style={styles.categorySection}>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>{cat.categoryName}</Text>
                <View
                  style={[
                    styles.itemsCard,
                    { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  ]}
                >
                  {cat.items.map((item, itemIdx) => {
                    const itemKey = `w${selectedWeek}-${catIdx}-${itemIdx}`;
                    const isChecked = !!checkedItems[itemKey];

                    return (
                      <TouchableOpacity
                        key={itemIdx}
                        style={[
                          styles.itemRow,
                          itemIdx < cat.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                        ]}
                        onPress={() => toggleCheck(itemKey)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.itemLeft}>
                          <Ionicons
                            name={isChecked ? 'checkbox' : 'square-outline'}
                            size={20}
                            color={isChecked ? '#10B981' : '#94A3B8'}
                          />
                          <View style={styles.itemTextCol}>
                            <Text
                              style={[
                                styles.itemName,
                                { color: isChecked ? colors.textSecondary : colors.text },
                                isChecked && styles.itemNameChecked,
                              ]}
                            >
                              {item.name}
                            </Text>
                            <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
                              Quantity: {item.totalQuantity}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.itemPrice, { color: isChecked ? '#10B981' : Colors.primary }]}>
                          ${item.costUsd.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.actionBtn} onPress={handleCopyList} activeOpacity={0.88}>
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Share / Save Grocery List</Text>
            </TouchableOpacity>
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
    height: '88%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.heavy,
  },
  headerSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  weekSelectorRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  weekChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekChipText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  totalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  totalLeft: {
    flex: 1,
  },
  totalLabel: {
    fontSize: Typography.sizes.xs,
    color: '#047857',
    fontWeight: Typography.weights.bold,
  },
  totalAmount: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: '#065F46',
    marginTop: 2,
  },
  totalRight: {
    alignItems: 'flex-end',
  },
  dailyAvg: {
    fontSize: Typography.sizes.xs,
    color: '#047857',
    fontWeight: Typography.weights.semiBold,
  },
  checkedProgressText: {
    fontSize: Typography.sizes.xs,
    color: '#059669',
    fontWeight: Typography.weights.heavy,
    marginTop: 2,
  },
  groceryScroll: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    marginBottom: Spacing.xs,
  },
  itemsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  itemTextCol: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  itemName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
  },
  itemQty: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
  },
});
