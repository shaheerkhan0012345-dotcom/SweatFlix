import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { PakistaniMeal } from '../data/pakistaniDietData';

export interface AiDietAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  activeMeal?: PakistaniMeal | null;
  dayNumber?: number;
  userBudgetPkr?: number;
  onApplySubstitution?: (newMealTitle: string, newIngredients: string[], savingsPkr: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  substitutionOffer?: {
    title: string;
    description: string;
    ingredients: string[];
    savingsPkr: number;
    proteinGrams: number;
  };
}

const QUICK_SUGGESTIONS = [
  'How to get 100g protein under Rs. 350?',
  'Cheap substitute for chicken in Pakistan?',
  'Is eating 3 eggs daily safe?',
  'Affordable dairy alternatives for muscle gain?',
  'How to boost iron absorption from daal?',
];

let globalMessageCounter = 0;
const generateUniqueId = (prefix: string) => `${prefix}-${++globalMessageCounter}`;

const getInitialContextMessages = (
  activeMeal?: PakistaniMeal | null,
  dayNumber?: number,
  userBudgetPkr: number = 450
): ChatMessage[] => {
  if (activeMeal) {
    const mealCost = activeMeal.ingredients.reduce((s, i) => s + i.costPkr, 0);
    return [
      {
        id: generateUniqueId('init'),
        sender: 'ai',
        text: `Assalam-o-Alaikum! I'm your Pakistani Diet & Budget AI Assistant 🇵🇰.\n\nYou're looking at Day ${dayNumber || 1} ${activeMeal.type.toUpperCase()}: **${activeMeal.title}** (Est. Rs. ${mealCost}).\n\nWould you like an affordable ingredient substitution, tips to increase protein without extra cost, or preparation guidance?`,
        timestamp: 'Just now',
        substitutionOffer: activeMeal.title.toLowerCase().includes('chicken')
          ? {
              title: 'Double Masoor Daal + 1 Boiled Egg',
              description: 'Saves ~Rs. 60 while delivering 28g of clean protein!',
              ingredients: [
                'Red Masoor Daal (90g raw) - Rs. 28',
                '1 Farm Egg - Rs. 28',
                '2 Whole Wheat Rotis - Rs. 14',
                'Cucumber Salad & Tadka - Rs. 15',
              ],
              savingsPkr: 55,
              proteinGrams: 28,
            }
          : undefined,
      },
    ];
  }
  return [
    {
      id: generateUniqueId('init'),
      sender: 'ai',
      text: `Assalam-o-Alaikum! I'm your Pakistani Budget Diet AI 🇵🇰.\n\nI specialize in helping you hit your fitness goals (muscle gain, fat loss, or general health) using locally available Pakistani foods like daal, chana, lobia, seasonal sabzi, and eggs within your daily budget (Rs. ${userBudgetPkr}/day).\n\nHow can I help you customize your meal plan today?`,
      timestamp: 'Just now',
    },
  ];
};

const AiDietAssistantContent: React.FC<AiDietAssistantModalProps> = ({
  onClose,
  activeMeal,
  dayNumber,
  userBudgetPkr = 450,
  onApplySubstitution,
}) => {
  const { colors, isDarkMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getInitialContextMessages(activeMeal, dayNumber, userBudgetPkr)
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: generateUniqueId('u'),
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = '';
      let subOffer: ChatMessage['substitutionOffer'] | undefined;

      if (lower.includes('100g protein') || lower.includes('high protein under')) {
        reply =
          `Here is the ultimate Pakistani 100g Protein Budget Blueprint under Rs. 350:\n\n` +
          `1. 3 Farm Eggs (Breakfast): 18g Protein • ~Rs. 84\n` +
          `2. 100g Raw Moong/Chana Daal (Lunch): 24g Protein • ~Rs. 32\n` +
          `3. 100g Raw Lobia or Kala Chana (Dinner): 22g Protein • ~Rs. 32\n` +
          `4. 4 Whole Wheat Rotis (Atta contains 12% protein): 16g Protein • ~Rs. 28\n` +
          `5. 50g Roasted Chana / 1 Glass Lassi (Snack): 12g Protein • ~Rs. 25\n\n` +
          `Total Protein: ~102g Protein\nTotal Estimated Cost: Rs. 201 - Rs. 235!\n` +
          `Tip: Squeeze fresh lemon over daal and chana — Vitamin C increases non-heme plant iron absorption by over 300%.`;
      } else if (lower.includes('substitute') || lower.includes('chicken') || lower.includes('meat') || lower.includes('expensive')) {
        reply =
          `Smart Pakistani Substitution Advice 💡:\n\n` +
          `• When chicken is costly (Rs. 700+/kg), the best protein-per-rupee replacements are:\n` +
          `1. **Lobia (Black-Eyed Peas / Red Kidney Beans)**: 24g protein per 100g raw at only Rs. 34/100g.\n` +
          `2. **Kala Chana (Black Chickpeas)**: Extremely high in fiber and iron, costs Rs. 32/100g.\n` +
          `3. **Eggs**: Complete amino acid profile with highest bioavailability.\n\n` +
          `Would you like to apply a Daal + Egg combo to your current meal to save money?`;
        subOffer = {
          title: 'Spiced Lobia Curry & 1 Boiled Egg',
          description: 'Saves Rs. 55 compared to chicken while retaining 26g protein.',
          ingredients: [
            'Lobia Beans (80g) - Rs. 26',
            '1 Boiled Egg - Rs. 28',
            '2 Whole Wheat Rotis - Rs. 14',
            'Curry Masala Base - Rs. 18',
          ],
          savingsPkr: 55,
          proteinGrams: 26,
        };
      } else if (lower.includes('egg') || lower.includes('cholesterol') || lower.includes('safe')) {
        reply =
          `Yes, eating 2 to 3 whole eggs daily is safe and highly recommended for healthy active individuals in Pakistan 🥚.\n\n` +
          `Modern clinical research shows dietary cholesterol has minimal impact on blood cholesterol for 75% of the population. The yolk is rich in Choline (brain function), Vitamin D, B12, and healthy fats that support testosterone production.\n\n` +
          `Budget Tip: In Pakistani winters, egg prices rise. You can mix 1 egg with 35g Besan (gram flour) to make a high-protein Anda-Besan Chilla at half the price!`;
      } else if (lower.includes('milk') || lower.includes('dairy') || lower.includes('oats')) {
        reply =
          `Affordable Dairy & Grain Alternatives in Pakistan 🥛:\n\n` +
          `• **Instead of packaged milk (Rs. 290/L)**: Buy fresh loose milk (Gawala/Khula Doodh) for ~Rs. 190-210/L, or make fresh Dahi (yogurt) at home.\n` +
          `• **Instead of imported oats (Rs. 500+/box)**: Buy loose Chakki Daliya (cracked wheat) or Jau ka Daliya (barley porridge) for only Rs. 160-200/kg. They have identical beta-glucan fiber and complex carbohydrates.`;
      } else {
        reply =
          `Great question! In Pakistani nutrition, combining pulses (daal, chana, lobia) with whole wheat roti or rice creates a complementary protein with all 9 essential amino acids.\n\n` +
          `To stay within Rs. ${userBudgetPkr}/day:\n` +
          `1. Buy seasonal sabzi (palak, tori, kaddu, bhindi) from weekly Sunday/Friday bachat bazaars.\n` +
          `2. Pre-boil chickpeas and beans in bulk to save gas and prep time.\n` +
          `3. Use 1 teaspoon of oil per meal instead of deep swimming curries — you save oil and reduce unnecessary calories!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId('ai'),
          sender: 'ai',
          text: reply,
          timestamp: 'Just now',
          substitutionOffer: subOffer,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.modalBackdrop}
    >
      <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={styles.botIconCircle}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>AI Diet Assistant</Text>
                <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                  Pakistani Nutrition & Budget Expert 🇵🇰
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubbleWrap,
                    isAi ? styles.messageBubbleWrapAi : styles.messageBubbleWrapUser,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isAi
                        ? [styles.messageBubbleAi, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]
                        : [styles.messageBubbleUser, { backgroundColor: Colors.primary }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        { color: isAi ? colors.text : '#FFFFFF' },
                      ]}
                    >
                      {m.text}
                    </Text>

                    {/* Interactive Substitution Card if Offered */}
                    {m.substitutionOffer && onApplySubstitution && (
                      <View style={[styles.subCard, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: '#10B981' }]}>
                        <View style={styles.subCardTop}>
                          <Ionicons name="swap-horizontal-outline" size={16} color="#10B981" />
                          <Text style={styles.subCardTitle}>{m.substitutionOffer.title}</Text>
                        </View>
                        <Text style={[styles.subCardDesc, { color: colors.textSecondary }]}>
                          {m.substitutionOffer.description}
                        </Text>
                        <View style={styles.subIngredientsList}>
                          {m.substitutionOffer.ingredients.map((ing, idx) => (
                            <Text key={idx} style={[styles.subIngredientItem, { color: colors.text }]}>
                              • {ing}
                            </Text>
                          ))}
                        </View>
                        <TouchableOpacity
                          style={styles.applySubBtn}
                          onPress={() => {
                            if (m.substitutionOffer) {
                              onApplySubstitution(
                                m.substitutionOffer.title,
                                m.substitutionOffer.ingredients,
                                m.substitutionOffer.savingsPkr
                              );
                              onClose();
                            }
                          }}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="checkmark-circle" size={15} color="#FFFFFF" />
                          <Text style={styles.applySubBtnText}>
                            Apply to Plan (Save Rs. {m.substitutionOffer.savingsPkr})
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.messageTime, { color: colors.textSecondary }]}>{m.timestamp}</Text>
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.typingWrap, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={[styles.typingText, { color: colors.textSecondary }]}>AI Assistant is typing tips...</Text>
              </View>
            )}
          </ScrollView>

          {/* Quick Prompts Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsRow}
          >
            {QUICK_SUGGESTIONS.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.quickPromptChip,
                  { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                ]}
                onPress={() => handleSendMessage(q)}
                activeOpacity={0.75}
              >
                <Text style={[styles.quickPromptText, { color: Colors.primary }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chat Input Bar */}
          <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[
                styles.textInputField,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Ask diet question or substitute..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: inputText.trim() ? Colors.primary : '#94A3B8' },
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
  );
};

export const AiDietAssistantModal: React.FC<AiDietAssistantModalProps> = (props) => {
  if (!props.visible) return null;
  return (
    <Modal visible={props.visible} animationType="slide" transparent>
      <AiDietAssistantContent
        key={`${props.activeMeal?.id || 'general'}-${props.dayNumber || 1}`}
        {...props}
      />
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
    height: '85%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
  },
  headerSub: {
    fontSize: 11,
  },
  closeBtn: {
    padding: 4,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
    gap: 12,
  },
  messageBubbleWrap: {
    maxWidth: '85%',
  },
  messageBubbleWrapAi: {
    alignSelf: 'flex-start',
  },
  messageBubbleWrapUser: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleAi: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  messageBubbleUser: {
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  messageTime: {
    fontSize: 9,
    marginTop: 3,
    marginHorizontal: 4,
  },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 11,
  },
  subCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  subCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  subCardTitle: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: '#10B981',
  },
  subCardDesc: {
    fontSize: 11,
    marginBottom: 6,
  },
  subIngredientsList: {
    marginBottom: 8,
    gap: 2,
  },
  subIngredientItem: {
    fontSize: 11,
  },
  applySubBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
  },
  applySubBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  quickPromptsRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 8,
  },
  quickPromptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  textInputField: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
