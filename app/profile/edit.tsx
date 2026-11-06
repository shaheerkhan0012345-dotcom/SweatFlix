import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useOnboarding, FitnessLevelType, MainGoalType } from '../../context/OnboardingContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { getAvatarColor } from '../../services/communityService';

const FITNESS_LEVELS: FitnessLevelType[] = ['Beginner', 'Intermediate', 'Advanced'];
const MAIN_GOALS: MainGoalType[] = ['Lose weight', 'Build muscle', 'Stay fit'];
const BODY_PARTS = ['Full Body', 'Chest', 'Back', 'Shoulders', 'Arms', 'Abs', 'Legs'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { state: onboardingState, setField, toggleBodyFocus } = useOnboarding();
  const { settings, updateName } = useSettings();
  const { profile, user, refreshProfile, updateProfile } = useAuth();

  // Basic Info
  const [name, setName] = useState(profile?.name || settings.name || 'Champ');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedLocalAvatar, setSelectedLocalAvatar] = useState<string | null>(null);

  // Metrics
  const [age, setAge] = useState(profile?.age ? String(profile.age) : onboardingState.age);
  const [height, setHeight] = useState(
    profile?.height_cm ? String(profile.height_cm) : onboardingState.height
  );
  const [weight, setWeight] = useState(
    profile?.weight_kg ? String(profile.weight_kg) : onboardingState.weight
  );
  const [goalWeight, setGoalWeight] = useState(
    profile?.goal_kg ? String(profile.goal_kg) : onboardingState.goalWeight
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const debounceRef = useRef<any>(null);

  const handleUsernameChange = (text: string) => {
    const clean = text.toLowerCase().replace(/\s/g, '').replace(/^@/, '');
    setUsername(clean);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!clean) {
      setUsernameError('Username is required');
      setUsernameChecking(false);
      return;
    }

    const validation = profileService.validateUsername(clean);
    if (!validation.valid) {
      setUsernameError(validation.error || 'Invalid username');
      setUsernameChecking(false);
      return;
    }

    if (clean === profile?.username) {
      setUsernameError(null);
      setUsernameChecking(false);
      return;
    }

    setUsernameChecking(true);
    setUsernameError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await profileService.checkUsernameAvailable(clean, user?.id);
        setUsernameChecking(false);
        if (!res.available) {
          setUsernameError(res.error || 'Username is already taken');
        } else {
          setUsernameError(null);
        }
      } catch {
        setUsernameChecking(false);
      }
    }, 350);
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Permission Needed',
          'Please allow camera roll access to select a profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const sourceUri = result.assets[0].uri;

        // Resize & compress with expo-image-manipulator (max 800px, JPEG quality 0.75, <2MB)
        const manipulated = await ImageManipulator.manipulateAsync(
          sourceUri,
          [{ resize: { width: 800, height: 800 } }],
          { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
        );

        setSelectedLocalAvatar(manipulated.uri);
      }
    } catch (e: any) {
      Alert.alert('Image Error', e?.message || 'Could not pick image');
    }
  };

  const handleSave = async () => {
    if (saving) return;

    if (usernameError) {
      Alert.alert('Invalid Username', usernameError);
      return;
    }

    try {
      setSaving(true);

      // 1. Upload avatar if changed
      let finalAvatarUrl = profile?.avatar_url || null;
      if (selectedLocalAvatar && user?.id) {
        try {
          finalAvatarUrl = await profileService.uploadAvatar(user.id, selectedLocalAvatar);
        } catch (uploadErr: any) {
          console.warn('Avatar upload failed:', uploadErr);
          Alert.alert('Avatar Notice', 'Could not upload photo to storage. Other changes will be saved.');
        }
      }

      // 2. Update username if changed
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername && cleanUsername !== profile?.username && user?.id) {
        const userRes = await profileService.updateUsername(user.id, cleanUsername);
        if (!userRes.success) {
          setSaving(false);
          Alert.alert('Username Error', userRes.error || 'Failed to update username');
          return;
        }
      }

      // 3. Update local settings & onboarding contexts
      await updateName(name);
      setField('age', age);
      setField('height', height);
      setField('weight', weight);
      setField('goalWeight', goalWeight);

      // 4. Update profile in database
      if (profile?.id) {
        await updateProfile({
          name: name.trim() || 'Champ',
          bio: bio.trim() || null,
          avatar_url: finalAvatarUrl,
          age: age ? parseInt(age, 10) : null,
          height_cm: height ? parseFloat(height) : null,
          weight_kg: weight ? parseFloat(weight) : null,
          goal_kg: goalWeight ? parseFloat(goalWeight) : null,
          level: onboardingState.fitnessLevel || undefined,
          main_goal: onboardingState.mainGoal || undefined,
          body_focus: onboardingState.bodyFocus || undefined,
        });
      }

      await refreshProfile();

      setSavedToast(true);
      setTimeout(() => {
        router.back();
      }, 700);
    } catch (e: any) {
      Alert.alert('Save Error', e?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const currentDisplayAvatar = selectedLocalAvatar || profile?.avatar_url || null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardWrap}
    >
      <ScreenContainer scrollable contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {savedToast && (
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.toastText}>Profile changes saved! 💪</Text>
          </View>
        )}

        {/* Avatar Picker Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarPickerTouch}
            onPress={handlePickAvatar}
            activeOpacity={0.8}
          >
            {currentDisplayAvatar ? (
              <Image source={{ uri: currentDisplayAvatar }} style={styles.avatarLarge} />
            ) : (
              <View
                style={[
                  styles.avatarInitialLarge,
                  { backgroundColor: getAvatarColor(profile?.id || 'self') },
                ]}
              >
                <Text style={styles.avatarInitialLargeText}>
                  {(name || 'C').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Username Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>@username</Text>
          <View style={styles.usernameInputWrap}>
            <Text style={styles.atSymbol}>@</Text>
            <TextInput
              style={styles.usernameInput}
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="username"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            {usernameChecking ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : usernameError ? (
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            ) : username.length >= 3 ? (
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            ) : null}
          </View>
          {usernameError && <Text style={styles.errorSubtext}>{usernameError}</Text>}
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#A0A0A0"
            maxLength={25}
          />
        </View>

        {/* Bio Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelCounterRow}>
            <Text style={styles.label}>Bio</Text>
            <Text style={styles.counterText}>{bio.length}/150</Text>
          </View>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell friends about your fitness goals and workout routine..."
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={3}
            maxLength={150}
          />
        </View>

        {/* Numeric Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Age */}
          <View style={styles.metricBox}>
            <Text style={styles.label}>Age (yrs)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="25"
              maxLength={2}
            />
          </View>

          {/* Height */}
          <View style={styles.metricBox}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={(t) => setHeight(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="175"
              maxLength={3}
            />
          </View>

          {/* Current Weight */}
          <View style={styles.metricBox}>
            <Text style={styles.label}>Current Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={(t) => setWeight(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="75"
              maxLength={3}
            />
          </View>

          {/* Goal Weight */}
          <View style={styles.metricBox}>
            <Text style={styles.label}>Goal Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={goalWeight}
              onChangeText={(t) => setGoalWeight(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="70"
              maxLength={3}
            />
          </View>
        </View>

        {/* Fitness Level Pills */}
        <View style={styles.sectionWrap}>
          <Text style={styles.label}>Fitness Level</Text>
          <View style={styles.pillsRow}>
            {FITNESS_LEVELS.map((level) => {
              const isSelected = onboardingState.fitnessLevel === level;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => setField('fitnessLevel', level)}
                  style={[
                    styles.pill,
                    isSelected ? styles.pillSelected : styles.pillUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected && styles.pillTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Main Goal */}
        <View style={styles.sectionWrap}>
          <Text style={styles.label}>Main Goal</Text>
          <View style={styles.goalsRow}>
            {MAIN_GOALS.map((g) => {
              const isSelected = onboardingState.mainGoal === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setField('mainGoal', g)}
                  style={[
                    styles.goalPill,
                    isSelected ? styles.goalPillSelected : styles.goalPillUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.goalText,
                      isSelected && styles.goalTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Body Focus */}
        <View style={styles.sectionWrap}>
          <Text style={styles.label}>Body Focus Areas</Text>
          <View style={styles.chipsWrap}>
            {BODY_PARTS.map((part) => {
              const isSelected = onboardingState.bodyFocus?.includes(part);
              return (
                <TouchableOpacity
                  key={part}
                  onPress={() => toggleBodyFocus(part)}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {part}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonWrap}>
          <Button
            title={saving ? 'Saving Changes...' : 'Save Profile'}
            variant="primary"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          />
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarPickerTouch: {
    position: 'relative',
    marginBottom: Spacing.xs + 2,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5E7EB',
  },
  avatarInitialLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialLargeText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  labelCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 12,
    color: Colors.textGrey,
  },
  input: {
    backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: Typography.sizes.md,
    color: Colors.textDark,
  },
  usernameInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.card,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  atSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textDark,
    paddingVertical: 0,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
  bioInput: {
    minHeight: 76,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm + 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
  },
  sectionWrap: {
    marginBottom: Spacing.md,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pill: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillUnselected: {
    backgroundColor: Colors.cardLight,
    borderColor: 'transparent',
  },
  pillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  goalsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  goalPill: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  goalPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalPillUnselected: {
    backgroundColor: Colors.cardLight,
    borderColor: 'transparent',
  },
  goalText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
  },
  goalTextSelected: {
    color: '#FFFFFF',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: Colors.cardLight,
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textGrey,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  buttonWrap: {
    marginTop: Spacing.md,
  },
});
