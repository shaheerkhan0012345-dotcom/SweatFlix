import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useSettings, SupportedLanguage } from '../../context/SettingsContext';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  isAvailable: boolean;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (US)', isAvailable: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isAvailable: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isAvailable: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isAvailable: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isAvailable: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isAvailable: false },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { settings, setLanguage } = useSettings();

  const handleSelectLanguage = (lang: LanguageOption) => {
    if (!lang.isAvailable) return;
    setLanguage(lang.code);
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
        <Text style={styles.headerTitle}>{t('language.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <Text style={styles.sectionSubtitle}>{t('language.subtitle')}</Text>

      {/* Language Options List */}
      <View style={styles.listContainer}>
        {LANGUAGES.map((lang) => {
          const isSelected = settings.language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={lang.isAvailable ? 0.7 : 1}
              onPress={() => handleSelectLanguage(lang)}
              style={[
                styles.langRow,
                isSelected && styles.langRowSelected,
                !lang.isAvailable && styles.langRowDisabled,
              ]}
            >
              <View style={styles.langInfo}>
                <Text
                  style={[
                    styles.langName,
                    isSelected && styles.langNameSelected,
                    !lang.isAvailable && styles.langNameDisabled,
                  ]}
                >
                  {lang.name}
                </Text>
                <Text style={styles.langNative}>{lang.nativeName}</Text>
              </View>

              <View style={styles.actionContainer}>
                {!lang.isAvailable ? (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>{t('language.comingSoon')}</Text>
                  </View>
                ) : (
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.textGrey}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={22} color={Colors.accent} />
          <Text style={styles.infoText}>{t('language.note')}</Text>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  listContainer: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  langRowSelected: {
    backgroundColor: Colors.primaryLight,
  },
  langRowDisabled: {
    opacity: 0.75,
  },
  langInfo: {
    flex: 1,
  },
  langName: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textDark,
  },
  langNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  langNameDisabled: {
    color: Colors.textGrey,
  },
  langNative: {
    ...Typography.caption,
    color: Colors.textGrey,
    marginTop: 2,
  },
  actionContainer: {
    marginLeft: Spacing.md,
  },
  comingSoonBadge: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  comingSoonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textGrey,
    fontSize: 11,
  },
  infoCard: {
    padding: Spacing.md,
    backgroundColor: '#FFF9F0',
    borderWidth: 1,
    borderColor: '#FFE2B8',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textDark,
    flex: 1,
    lineHeight: 18,
  },
});
