import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCustomWorkouts } from '../../context/CustomWorkoutsContext';
import { communityService, PostVisibility } from '../../services/communityService';

const DEFAULT_WORKOUT_SUGGESTIONS = [
  'Full Body Burn',
  'Chest Blast',
  'Core Crusher 3D',
  'Leg Day Strength',
  'Arm Pump & Biceps',
  'Morning Cardio Session',
  'HIIT Fat Burn',
];

export default function NewPostScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { customWorkouts } = useCustomWorkouts();

  const accountVis = profile?.account_visibility || 'public';

  // Form State: defaults to account setting
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<PostVisibility>(accountVis as PostVisibility);
  const [isUploading, setIsUploading] = useState(false);

  // Modals
  const [showPickerSheet, setShowPickerSheet] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  // Pick from Camera
  const handleTakePhoto = async () => {
    setShowPickerSheet(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Needed',
          'SweatFlix needs access to your camera so you can take and share daily workout photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await processAndSetImage(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Camera error:', err?.message);
      Alert.alert('Camera Error', 'Unable to capture photo. Please try choosing from your gallery.');
    }
  };

  // Pick from Media Library
  const handlePickFromLibrary = async () => {
    setShowPickerSheet(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Access',
          'SweatFlix needs photo library permissions to select and share your workout pictures.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await processAndSetImage(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Gallery error:', err?.message);
      Alert.alert('Gallery Error', 'Unable to pick photo from library.');
    }
  };

  // Resize and compress with expo-image-manipulator (max 1080px width, quality 0.7)
  const processAndSetImage = async (rawUri: string) => {
    try {
      setIsUploading(true);
      const manipulated = await ImageManipulator.manipulateAsync(
        rawUri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setSelectedImageUri(manipulated.uri);
      setSelectedImageBase64(manipulated.base64 || null);
    } catch (err: any) {
      console.warn('Image manipulation error:', err?.message);
      // Fallback to raw URI if manipulation fails
      setSelectedImageUri(rawUri);
      setSelectedImageBase64(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Post
  const handleSharePost = async () => {
    if (!selectedImageUri) {
      Alert.alert('Photo Required', 'Please select or capture a workout photo to share.');
      return;
    }

    try {
      setIsUploading(true);
      await communityService.createPost({
        userId: user?.id || 'guest',
        localImageUri: selectedImageUri,
        base64Data: selectedImageBase64 || undefined,
        caption: caption.trim() || undefined,
        workoutName: selectedWorkout || undefined,
        visibility,
      });

      // Success: return to feed
      router.back();
    } catch (err: any) {
      console.warn('Share post error:', err?.message);
      Alert.alert('Upload Error', err?.message || 'Failed to share post. Please check your internet connection.');
    } finally {
      setIsUploading(false);
    }
  };

  // Combine custom workouts with default suggestions
  const allWorkouts = Array.from(
    new Set([
      ...(customWorkouts || []).map((w) => w.name),
      ...DEFAULT_WORKOUT_SUGGESTIONS,
    ])
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Navigation Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Workout Post</Text>
        <TouchableOpacity
          onPress={handleSharePost}
          disabled={!selectedImageUri || isUploading}
          style={[
            styles.shareTopBtn,
            (!selectedImageUri || isUploading) && styles.shareTopBtnDisabled,
          ]}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.shareTopBtnText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Picker Preview Area (4:5 Ratio) */}
        <TouchableOpacity
          style={[
            styles.imagePickerBox,
            { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
          ]}
          onPress={() => setShowPickerSheet(true)}
          activeOpacity={0.88}
        >
          {selectedImageUri ? (
            <>
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.previewImage}
                contentFit="cover"
              />
              <View style={styles.changeBadge}>
                <Ionicons name="camera-reverse" size={16} color="#FFFFFF" />
                <Text style={styles.changeBadgeText}>Change Photo</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyPickerContent}>
              <View style={styles.cameraIconCircle}>
                <Ionicons name="camera" size={36} color={Colors.primary} />
              </View>
              <Text style={[styles.pickerPromptTitle, { color: colors.text }]}>
                Add Workout Photo
              </Text>
              <Text style={[styles.pickerPromptSub, { color: colors.textSecondary }]}>
                Tap to take a picture or choose from library (4:5 vertical)
              </Text>
              <View style={styles.pickOptionsRow}>
                <View style={styles.pickOptionPill}>
                  <Ionicons name="camera-outline" size={14} color={Colors.primary} />
                  <Text style={styles.pickOptionPillText}>Camera</Text>
                </View>
                <View style={styles.pickOptionPill}>
                  <Ionicons name="images-outline" size={14} color={Colors.primary} />
                  <Text style={styles.pickOptionPillText}>Gallery</Text>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption Box with Character Counter */}
        <View style={styles.captionSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Caption</Text>
          <View
            style={[
              styles.captionInputContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.captionInput, { color: colors.text }]}
              placeholder="What did you crush today? How was your form?"
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={300}
              value={caption}
              onChangeText={setCaption}
            />
            <Text style={[styles.charCounter, { color: caption.length > 280 ? Colors.primary : colors.textSecondary }]}>
              {caption.length}/300
            </Text>
          </View>
        </View>

        {/* Tag Workout (Optional Chip) */}
        <View style={styles.workoutSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Tag Workout (Optional)</Text>
          <TouchableOpacity
            style={[
              styles.workoutChip,
              { backgroundColor: colors.surface, borderColor: selectedWorkout ? Colors.primary : colors.border },
            ]}
            onPress={() => setShowWorkoutModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="barbell-outline"
              size={18}
              color={selectedWorkout ? Colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.workoutChipText,
                { color: selectedWorkout ? Colors.primary : colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {selectedWorkout || 'Select Workout Routine'}
            </Text>
            {selectedWorkout ? (
              <TouchableOpacity
                onPress={() => setSelectedWorkout(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Visibility Selector */}
        <View style={styles.visibilitySection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Who Can See This?</Text>
          <View style={styles.visibilityPillsRow}>
            {[
              { key: 'public', label: 'Everyone', icon: 'earth-outline' },
              { key: 'friends', label: 'Friends', icon: 'people-outline' },
              { key: 'private', label: 'Only me', icon: 'lock-closed-outline' },
            ].map((v) => {
              const isSelected = visibility === v.key;

              // Rule: A post's visibility can never be set more open than the account's visibility
              let isDisabled = false;
              if (accountVis === 'private' && v.key !== 'private') {
                isDisabled = true;
              } else if (accountVis === 'friends' && v.key === 'public') {
                isDisabled = true;
              }

              return (
                <TouchableOpacity
                  key={v.key}
                  disabled={isDisabled}
                  style={[
                    styles.visibilityPill,
                    {
                      backgroundColor: isDisabled
                        ? isDarkMode
                          ? '#1E293B'
                          : '#F1F5F9'
                        : isSelected
                        ? isDarkMode
                          ? '#7F1D1D'
                          : '#FFEAEA'
                        : colors.surface,
                      borderColor: isSelected ? Colors.primary : colors.border,
                      opacity: isDisabled ? 0.45 : 1,
                    },
                  ]}
                  onPress={() => setVisibility(v.key as PostVisibility)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isDisabled ? 'lock-closed' : (v.icon as any)}
                    size={14}
                    color={isSelected ? Colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.visibilityPillText,
                      { color: isSelected ? Colors.primary : colors.textSecondary },
                    ]}
                  >
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {accountVis !== 'public' && (
            <Text style={styles.accountVisNotice}>
              * Limited by your {accountVis === 'friends' ? 'Friends only' : 'Private'} account privacy setting.
            </Text>
          )}
        </View>

        {/* Safety Note */}
        <View style={styles.safetyBox}>
          <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
          <Text style={styles.safetyText}>
            Be respectful. No nudity, hate or spam.
          </Text>
        </View>

        {/* Big Bottom Share Button */}
        <TouchableOpacity
          style={[
            styles.shareBottomBtn,
            (!selectedImageUri || isUploading) && styles.shareBottomBtnDisabled,
          ]}
          onPress={handleSharePost}
          disabled={!selectedImageUri || isUploading}
          activeOpacity={0.88}
        >
          {isUploading ? (
            <View style={styles.uploadingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.shareBottomBtnText}>Sharing to Community...</Text>
            </View>
          ) : (
            <Text style={styles.shareBottomBtnText}>Share Post</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1: CHOOSE PHOTO SOURCE (Camera vs Gallery) */}
      {/* ========================================================================= */}
      <Modal visible={showPickerSheet} transparent animationType="slide">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowPickerSheet(false)}
        >
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetDragBar} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Workout Photo</Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#FFEAEA' }]}>
                <Ionicons name="camera" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetOptionTitle, { color: colors.text }]}>Take Photo</Text>
                <Text style={[styles.sheetOptionSub, { color: colors.textSecondary }]}>
                  Use your phone camera to capture your session
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handlePickFromLibrary}
              activeOpacity={0.7}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="images" size={22} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetOptionTitle, { color: colors.text }]}>
                  Choose from Gallery
                </Text>
                <Text style={[styles.sheetOptionSub, { color: colors.textSecondary }]}>
                  Select an existing gym or workout picture
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetCancelBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              onPress={() => setShowPickerSheet(false)}
            >
              <Text style={[styles.sheetCancelBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: WORKOUT SELECTOR PICKER */}
      {/* ========================================================================= */}
      <Modal visible={showWorkoutModal} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={[styles.workoutModalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.workoutModalHeader}>
              <Text style={[styles.workoutModalTitle, { color: colors.text }]}>Select Workout</Text>
              <TouchableOpacity onPress={() => setShowWorkoutModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }}>
              {allWorkouts.map((workoutTitle) => {
                const isSelected = selectedWorkout === workoutTitle;
                return (
                  <TouchableOpacity
                    key={workoutTitle}
                    style={[
                      styles.workoutOptionRow,
                      { borderColor: colors.border },
                      isSelected && { backgroundColor: isDarkMode ? '#1E293B' : '#FFF2E5' },
                    ]}
                    onPress={() => {
                      setSelectedWorkout(workoutTitle);
                      setShowWorkoutModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="barbell"
                      size={18}
                      color={isSelected ? Colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.workoutOptionText,
                        { color: isSelected ? Colors.primary : colors.text },
                      ]}
                    >
                      {workoutTitle}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  shareTopBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
  },
  shareTopBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  shareTopBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 60,
  },
  imagePickerBox: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  changeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyPickerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  cameraIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  pickerPromptTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  pickerPromptSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  pickOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF2E5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pickOptionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  captionSection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  captionInputContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  captionInput: {
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 6,
  },
  workoutSection: {
    marginBottom: Spacing.lg,
  },
  workoutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: 8,
  },
  workoutChipText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  visibilitySection: {
    marginBottom: Spacing.lg,
  },
  visibilityPillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  visibilityPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    gap: 6,
  },
  visibilityPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  safetyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  shareBottomBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  shareBottomBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  shareBottomBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetDragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  sheetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sheetOptionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetCancelBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetCancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  workoutModalCard: {
    margin: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: 40,
  },
  workoutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  workoutModalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  workoutOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    borderBottomWidth: 1,
  },
  workoutOptionText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  accountVisNotice: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
