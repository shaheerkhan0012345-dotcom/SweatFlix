import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Share,
  useWindowDimensions,
  Alert,
  Image as RNImage,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import {
  aiDietService,
  ChatMessage,
  ProposedMeal,
  DietContextPayload,
  SUGGESTED_QUESTIONS,
} from '../services/aiDietService';
import { FOOD_IMAGES } from '../data/pakistaniDietData';
import { resolveSafeImageSource } from '../constants/mealImages';

interface FloatingAiDietCoachProps {
  contextPayload: DietContextPayload;
  onViewRecipe: (meal: any) => void;
  onSaveMeal: (meal: any) => void;
  onReplaceMeal: (meal: any) => void;
}

const SafeMealImage = ({ source, style, contentFit, ...rest }: any) => {
  const Component: any = ExpoImage || RNImage;
  return (
    <Component
      source={source}
      style={style}
      resizeMode={contentFit || 'cover'}
      contentFit={contentFit || 'cover'}
      {...rest}
    />
  );
};

let messageCounter = 0;
function createMessageId(): string {
  messageCounter += 1;
  return `msg_${Date.now()}_${messageCounter}`;
}

export const FloatingAiDietCoach: React.FC<FloatingAiDietCoachProps> = ({
  contextPayload,
  onViewRecipe,
  onSaveMeal,
  onReplaceMeal,
}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  // Panel visibility
  const [isOpen, setIsOpen] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollViewRef = useRef<any>(null);

  // Load chat history on initial mount
  useEffect(() => {
    let isCurrent = true;
    const init = async () => {
      const history = await aiDietService.loadChatHistory();
      if (isCurrent && history.length > 0) {
        setMessages(history);
      }
    };
    init();
    return () => {
      isCurrent = false;
    };
  }, []);

  // Save chat history when messages change
  const persistMessages = useCallback(async (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    await aiDietService.saveChatHistory(newMessages);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isOpen]);

  // Send a message
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || inputText).trim();
    if (!rawText || isLoading) return;

    setInputText('');

    const userMsg: ChatMessage = {
      id: createMessageId(),
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    await persistMessages(updatedHistory);
    setIsLoading(true);

    try {
      const result = await aiDietService.sendMessage(rawText, updatedHistory, contextPayload);

      const aiMsg: ChatMessage = {
        id: createMessageId(),
        sender: 'assistant',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mealProposal: result.proposal,
      };

      await persistMessages([...updatedHistory, aiMsg]);
    } catch (err: any) {
      const errorText = err.message || 'Something went wrong while contacting AI service.';
      const errorMsg: ChatMessage = {
        id: createMessageId(),
        sender: 'assistant',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        canRetry: true,
      };
      await persistMessages([...updatedHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry last failed user prompt
  const handleRetry = (msgIndex: number) => {
    // Find the preceding user message
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        const textToRetry = messages[i].text;
        // Clean history by removing both the error card and the preceding user query
        const cleaned = messages.filter((_, idx) => idx !== msgIndex && idx !== i);
        persistMessages(cleaned);
        handleSendMessage(textToRetry);
        return;
      }
    }
  };

  // Copy message text
  const handleCopy = async (message: ChatMessage) => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message.text);
      } else {
        await Share.share({ message: message.text });
      }
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  // Clear conversation with confirmation
  const handleClearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear your chat history with the AI Diet Coach?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await aiDietService.clearChatHistory();
            setMessages([]);
          },
        },
      ]
    );
  };

  // Action handlers for meal proposal inside chat
  const handleProposalViewRecipe = (proposal: ProposedMeal) => {
    const pakistaniMeal = aiDietService.convertToPakistaniMeal(proposal);
    onViewRecipe(pakistaniMeal);
  };

  const handleProposalSave = (proposal: ProposedMeal) => {
    const pakistaniMeal = aiDietService.convertToPakistaniMeal(proposal);
    onSaveMeal(pakistaniMeal);
    Alert.alert('Meal Saved! ⭐', `"${proposal.title}" has been added to your saved meals.`);
  };

  const handleProposalReplace = (proposal: ProposedMeal) => {
    const pakistaniMeal = aiDietService.convertToPakistaniMeal(proposal);
    onReplaceMeal(pakistaniMeal);
    Alert.alert('Meal Plan Updated! 🔄', `"${proposal.title}" is now added to your active day plan.`);
  };

  // Floating trigger button positioning: Bottom-Right viewport directly above bottom navigation bar & Profile tab
  const bottomNavHeight = 62 + Math.max(insets.bottom, Platform.OS === 'android' ? 28 : 20);
  const floatingBtnStyle = [
    styles.floatingButton,
    {
      bottom: bottomNavHeight + 12,
      right: 16,
      backgroundColor: Colors.primary,
    },
  ];

  return (
    <>
      {/* 1. Persistent Floating Button (Bottom-Right, just above Profile tab) */}
      {!isOpen && (
        <TouchableOpacity
          style={floatingBtnStyle}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open AI Diet Coach chat panel"
        >
          <View style={styles.floatingInner}>
            <View style={styles.robotIconBubble}>
              <Ionicons name="sparkles" size={17} color="#FFFFFF" />
            </View>
            <Text style={styles.floatingButtonLabel}>AI Diet Coach</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 2. Chat Panel (Desktop Floating Window or Mobile Full Screen Modal) */}
      {isOpen && (
        <View
          style={[
            styles.panelContainer,
            isDesktop
              ? [
                  styles.desktopPanel,
                  {
                    bottom: bottomNavHeight + 16,
                    right: 20,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]
              : [
                  styles.mobilePanel,
                  {
                    top: Math.max(10, insets.top + 8),
                    bottom: Math.max(10, insets.bottom + 8),
                    backgroundColor: colors.surface,
                  },
                ],
          ]}
        >
          {/* Header */}
          <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.panelHeaderLeft}>
              <View style={[styles.avatarBubble, { backgroundColor: Colors.primary }]}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={[styles.panelTitle, { color: colors.text }]}>AI Diet Coach</Text>
                  <View style={styles.aiBadge}>
                    <View style={styles.aiBadgeDot} />
                    <Text style={styles.aiBadgeText}>Gemini AI</Text>
                  </View>
                </View>
                <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
                  {contextPayload.currency || 'USD ($)'} • {contextPayload.goal || 'Fitness & Nutrition'}
                </Text>
              </View>
            </View>

            {/* Header Controls */}
            <View style={styles.panelHeaderActions}>
              {/* Clear History Button */}
              {messages.length > 0 && (
                <TouchableOpacity
                  style={[styles.headerIconBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
                  onPress={handleClearConversation}
                  accessibilityLabel="Clear Conversation"
                >
                  <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}

              {/* Close Panel Button */}
              <TouchableOpacity
                style={[styles.headerIconBtn, styles.headerCloseBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
                onPress={() => setIsOpen(false)}
                accessibilityLabel="Close Chat Panel"
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Conversation Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageScroll}
            contentContainerStyle={styles.messageScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Empty State with Suggested Questions */}
            {messages.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#3B1824' : '#FFEAEA' }]}>
                  <Ionicons name="nutrition" size={32} color={Colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  How can I help your diet today?
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Ask me about affordable meal swaps, grocery budgeting, high-protein snacks, or customized Asian and American recipes.
                </Text>

                <View style={styles.suggestionsContainer}>
                  <Text style={[styles.suggestionsHeading, { color: colors.textSecondary }]}>
                    SUGGESTED QUESTIONS:
                  </Text>
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.suggestedChip,
                        {
                          backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handleSendMessage(q)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={13} color={Colors.primary} />
                      <Text style={[styles.suggestedChipText, { color: colors.text }]}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Message Bubbles */}
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userMessageRow : styles.assistantMessageRow,
                  ]}
                >
                  {!isUser && (
                    <View style={[styles.botAvatarMini, { backgroundColor: Colors.primary }]}>
                      <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: Colors.primary }]
                        : [
                            styles.assistantBubble,
                            {
                              backgroundColor: msg.isError
                                ? isDarkMode
                                  ? '#451A1A'
                                  : '#FEF2F2'
                                : isDarkMode
                                ? '#1E293B'
                                : '#F8FAFC',
                              borderColor: msg.isError ? '#EF4444' : colors.border,
                            },
                          ],
                    ]}
                  >
                    {/* Message Text */}
                    <Text
                      style={[
                        styles.messageText,
                        { color: isUser ? '#FFFFFF' : colors.text },
                        msg.isError && { color: '#DC2626' },
                      ]}
                      selectable
                    >
                      {msg.text}
                    </Text>

                    {/* Meal Proposal Rich Card (Requirement 7) */}
                    {msg.mealProposal && (
                      <View
                        style={[
                          styles.proposalCard,
                          {
                            backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.proposalHeader}>
                          <SafeMealImage
                            source={resolveSafeImageSource(msg.mealProposal.image, FOOD_IMAGES.fallback)}
                            style={styles.proposalThumb}
                            contentFit="cover"
                          />
                          <View style={{ flex: 1 }}>
                            <View style={styles.proposalBadgeRow}>
                              <View style={[styles.proposalTypeBadge, { backgroundColor: '#10B98118' }]}>
                                <Text style={styles.proposalTypeBadgeText}>
                                  {msg.mealProposal.type.toUpperCase()}
                                </Text>
                              </View>
                              <Text style={styles.proposalCostText}>
                                {msg.mealProposal.currency || contextPayload.currency || '$'} {Number(msg.mealProposal.cost || 0).toFixed(2)}
                              </Text>
                            </View>
                            <Text style={[styles.proposalTitle, { color: colors.text }]} numberOfLines={2}>
                              {msg.mealProposal.title}
                            </Text>
                            <Text style={[styles.proposalPortion, { color: colors.textSecondary }]}>
                              {msg.mealProposal.portion}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.proposalMacroRow}>
                          <Text style={[styles.proposalMacroText, { color: colors.text }]}>
                            🔥 {msg.mealProposal.baseKcal} kcal
                          </Text>
                          <Text style={[styles.proposalMacroText, { color: Colors.primary }]}>
                            💪 {msg.mealProposal.baseProtein}g protein
                          </Text>
                        </View>

                        {/* Working Action Buttons */}
                        <View style={styles.proposalActionButtons}>
                          <TouchableOpacity
                            style={[styles.proposalBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
                            onPress={() => handleProposalViewRecipe(msg.mealProposal!)}
                          >
                            <Ionicons name="book-outline" size={13} color={colors.text} />
                            <Text style={[styles.proposalBtnText, { color: colors.text }]}>View Recipe</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.proposalBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
                            onPress={() => handleProposalSave(msg.mealProposal!)}
                          >
                            <Ionicons name="star-outline" size={13} color="#D97706" />
                            <Text style={[styles.proposalBtnText, { color: colors.text }]}>Save Meal</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.proposalBtn, styles.proposalPrimaryBtn, { backgroundColor: '#10B981' }]}
                            onPress={() => handleProposalReplace(msg.mealProposal!)}
                          >
                            <Ionicons name="swap-horizontal" size={13} color="#FFFFFF" />
                            <Text style={[styles.proposalBtnText, { color: '#FFFFFF', fontWeight: '700' }]}>
                              Add to Plan
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Bubble Footer: Timestamp & Tools */}
                    <View style={styles.bubbleFooter}>
                      <Text
                        style={[
                          styles.timestampText,
                          { color: isUser ? '#FFFFFF99' : colors.textSecondary },
                        ]}
                      >
                        {msg.timestamp}
                      </Text>

                      {!isUser && (
                        <View style={styles.bubbleActionsRow}>
                          <TouchableOpacity
                            style={styles.bubbleActionBtn}
                            onPress={() => handleCopy(msg)}
                            accessibilityLabel="Copy response"
                          >
                            <Ionicons
                              name={copiedId === msg.id ? 'checkmark' : 'copy-outline'}
                              size={13}
                              color={copiedId === msg.id ? '#10B981' : colors.textSecondary}
                            />
                            {copiedId === msg.id && (
                              <Text style={styles.copiedFeedbackText}>Copied</Text>
                            )}
                          </TouchableOpacity>

                          {msg.canRetry && (
                            <TouchableOpacity
                              style={styles.retryBtn}
                              onPress={() => handleRetry(index)}
                              accessibilityLabel="Retry request"
                            >
                              <Ionicons name="refresh" size={12} color="#EF4444" />
                              <Text style={styles.retryBtnText}>Retry</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <View style={[styles.messageRow, styles.assistantMessageRow]}>
                <View style={[styles.botAvatarMini, { backgroundColor: Colors.primary }]}>
                  <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                </View>
                <View
                  style={[
                    styles.messageBubble,
                    styles.loadingBubble,
                    { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  ]}
                >
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    AI Diet Coach is thinking...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
          >
            <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    color: colors.text,
                    borderColor: colors.border,
                    maxHeight: 100,
                  },
                ]}
                placeholder="Ask about meals, recipes, or budget..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendMessage()}
                multiline
                editable={!isLoading}
                returnKeyType={Platform.OS === 'web' ? 'default' : 'send'}
                onKeyPress={(e: any) => {
                  if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor:
                      inputText.trim().length > 0 && !isLoading ? Colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSendMessage()}
                disabled={inputText.trim().length === 0 || isLoading}
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={inputText.trim().length > 0 && !isLoading ? '#FFFFFF' : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    zIndex: 9999,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
        cursor: 'pointer',
      },
    }),
  },
  floatingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  robotIconBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  panelContainer: {
    position: 'absolute',
    zIndex: 10000,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      },
    }),
  },
  desktopPanel: {
    width: 440,
    height: 620,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  mobilePanel: {
    left: 10,
    right: 10,
    borderRadius: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98118',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  aiBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  panelSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  panelHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCloseBtn: {
    marginLeft: 4,
  },
  messageScroll: {
    flex: 1,
  },
  messageScrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 8,
  },
  suggestionsHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  suggestedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  suggestedChipText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 6,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  botAvatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomLeftRadius: 4,
  },
  loadingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  proposalCard: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: 10,
  },
  proposalHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  proposalThumb: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#0F172A15',
  },
  proposalBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  proposalTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  proposalTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  proposalCostText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  proposalTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  proposalPortion: {
    fontSize: 11,
    marginTop: 2,
  },
  proposalMacroRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  proposalMacroText: {
    fontSize: 11,
    fontWeight: '600',
  },
  proposalActionButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  proposalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  proposalPrimaryBtn: {
    flex: 1.2,
  },
  proposalBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  timestampText: {
    fontSize: 10,
  },
  bubbleActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bubbleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  copiedFeedbackText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  retryBtnText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 4,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10001,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  keyModalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  keyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  keyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyModalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  keyModalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  keyModalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  keyTextInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 8,
  },
  activeKeyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  activeKeyStatusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  keyModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.sm,
  },
  keyCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  keyCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  keySaveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  keySaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
