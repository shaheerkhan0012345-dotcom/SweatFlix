import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../services/feedbackService';

type FeedbackCategory = 'Bug' | 'Suggestion' | 'Workout content' | 'Other';

const CATEGORIES: FeedbackCategory[] = ['Suggestion', 'Bug', 'Workout content', 'Other'];

export default function FeedbackScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<FeedbackCategory>('Suggestion');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const trimmedMessage = message.trim();
  const isValid = rating > 0 && trimmedMessage.length >= 10 && trimmedMessage.length <= 500;

  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback(user?.id || null, rating, category, trimmedMessage);
      setIsSubmitted(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (e) {
      console.error('Failed to save feedback:', e);
      Alert.alert('Error', 'Unable to record feedback right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
          <Text style={styles.headerTitle}>{t('feedback.title')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <Text style={styles.sectionSubtitle}>{t('feedback.subtitle')}</Text>

        {isSubmitted ? (
          <Card style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>{t('feedback.success')}</Text>
            <Text style={styles.successSubtitle}>
              We read every review to make SweatFlix stronger for everyone.
            </Text>
          </Card>
        ) : (
          <>
            {/* Star Rating Card */}
            <Card style={styles.card}>
              <Text style={styles.label}>{t('feedback.ratingPrompt')}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                    style={styles.starTouch}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? '#FFB800' : Colors.textGrey}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Category Chips Card */}
            <Card style={styles.card}>
              <Text style={styles.label}>{t('feedback.categoryPrompt')}</Text>
              <View style={styles.chipsRow}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Message Box Card */}
            <Card style={styles.card}>
              <View style={styles.messageHeaderRow}>
                <Text style={styles.label}>{t('feedback.messagePrompt')}</Text>
                <Text
                  style={[
                    styles.counterText,
                    trimmedMessage.length < 10 && styles.counterUnder,
                    trimmedMessage.length > 500 && styles.counterOver,
                  ]}
                >
                  {trimmedMessage.length}/500
                </Text>
              </View>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholder={t('feedback.messagePlaceholder')}
                placeholderTextColor={Colors.textGrey}
                value={message}
                onChangeText={setMessage}
                maxLength={500}
              />
              {trimmedMessage.length > 0 && trimmedMessage.length < 10 && (
                <Text style={styles.validationHint}>
                  Please enter at least 10 characters.
                </Text>
              )}
            </Card>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? 'Sending...' : t('feedback.submit')}
                onPress={handleSubmit}
                disabled={!isValid || isSubmitting}
              />
            </View>
          </>
        )}
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    paddingBottom: Spacing.xxl + 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textGrey,
    marginBottom: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  label: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  starTouch: {
    padding: Spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipUnselected: {
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  chipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.primary,
  },
  chipTextUnselected: {
    color: Colors.textDark,
  },
  messageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  counterText: {
    ...Typography.caption,
    color: Colors.textGrey,
    fontWeight: '600',
  },
  counterUnder: {
    color: Colors.accent,
  },
  counterOver: {
    color: Colors.primary,
  },
  textArea: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.textDark,
    minHeight: 120,
    lineHeight: 22,
  },
  validationHint: {
    ...Typography.caption,
    color: Colors.accent,
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  successCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#F8FFF9',
    borderColor: '#C3E6CD',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.circle,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: 20,
  },
});
