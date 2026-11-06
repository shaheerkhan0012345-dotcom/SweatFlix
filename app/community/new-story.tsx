import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { storyService, StoryMediaType, StoryVisibility } from '../../services/storyService';
import { profileService, UserProfile } from '../../services/profileService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Separate component for video preview using expo-video SDK 57
const StoryVideoPreview: React.FC<{ uri: string }> = ({ uri }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
    try {
      p.play();
    } catch (e) {
      console.warn('Auto-play error in story preview:', e);
    }
  });

  return (
    <View style={styles.videoPreviewContainer}>
      <VideoView
        player={player}
        style={styles.previewMedia}
        contentFit="cover"
        nativeControls={false}
      />
      <View style={styles.videoBadge}>
        <Ionicons name="videocam" size={14} color="#FFFFFF" />
        <Text style={styles.videoBadgeText}>Max 15s</Text>
      </View>
    </View>
  );
};

export default function NewStoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<StoryMediaType>('image');
  const [visibility, setVisibility] = useState<StoryVisibility>('friends');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // User's account visibility restriction check
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user?.id) {
      profileService.getProfile(user.id).then((p) => {
        if (p) {
          setUserProfile(p);
          // If account is private, default to friends (or alert restriction)
          if (p.account_visibility === 'private') {
            setVisibility('friends');
          }
        }
      });
    }
  }, [user?.id]);

  const accountVis = userProfile?.account_visibility || 'public';
  const isPrivateAccount = accountVis === 'private';
  const isFriendsOnlyAccount = accountVis === 'friends';

  // Process & compress photos to max 1080px width, ~0.7 quality
  const processImage = async (rawUri: string) => {
    try {
      setIsProcessing(true);
      const manipulated = await ImageManipulator.manipulateAsync(
        rawUri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setMediaUri(manipulated.uri);
      setMediaBase64(manipulated.base64 || null);
      setMediaType('image');
    } catch (err: any) {
      console.warn('Image manipulation error:', err?.message);
      setMediaUri(rawUri);
      setMediaBase64(null);
      setMediaType('image');
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Take Photo with Camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera permissions in settings to take story photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await processImage(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert('Camera Error', 'Could not open camera: ' + (err?.message || ''));
    }
  };

  // 2. Record Short Video with Camera (Max 15s)
  const handleRecordVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera permissions to record story videos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 15,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setMediaUri(result.assets[0].uri);
        setMediaType('video');
      }
    } catch (err: any) {
      Alert.alert('Camera Error', 'Could not open video recorder: ' + (err?.message || ''));
    }
  };

  // 3. Choose from Gallery (Photo or Video)
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'Please enable gallery permissions to select stories from your library.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        videoMaxDuration: 15,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const asset = result.assets[0];
        const isVideo = asset.type === 'video' || asset.uri.endsWith('.mp4') || asset.uri.endsWith('.mov');
        if (isVideo) {
          setMediaUri(asset.uri);
          setMediaType('video');
        } else {
          await processImage(asset.uri);
        }
      }
    } catch (err: any) {
      Alert.alert('Gallery Error', 'Could not pick media: ' + (err?.message || ''));
    }
  };

  // 4. Share Story
  const handleShareStory = async () => {
    if (!mediaUri) {
      Alert.alert('Media Required', 'Please capture or choose a photo or video for your story.');
      return;
    }

    if (isPrivateAccount) {
      Alert.alert(
        'Account is Private',
        'Your profile privacy is currently set to Private. You cannot share stories. You can change this in Profile > Settings > Privacy Settings.'
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0.2);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 0.9 ? prev + 0.15 : prev));
      }, 300);

      await storyService.createStory({
        userId: user?.id || 'me',
        localUri: mediaUri,
        base64Data: mediaBase64 || undefined,
        mediaType,
        visibility,
      });

      clearInterval(progressInterval);
      setUploadProgress(1);

      // Return to community feed
      router.back();
    } catch (err: any) {
      console.warn('Share story error:', err?.message);
      Alert.alert('Upload Error', err?.message || 'Failed to share story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          activeOpacity={0.7}
          disabled={isUploading}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Story</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Preview / Selection Area */}
        {mediaUri ? (
          <View style={styles.previewCard}>
            {mediaType === 'video' ? (
              <StoryVideoPreview uri={mediaUri} />
            ) : (
              <Image
                source={{ uri: mediaUri }}
                style={styles.previewMedia}
                contentFit="cover"
                transition={200}
              />
            )}

            {/* Retake Floating Button */}
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => setMediaUri(null)}
              activeOpacity={0.8}
              disabled={isUploading}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.retakeBtnText}>Change</Text>
            </TouchableOpacity>

            {/* 24-Hour Expiration Chip */}
            <View style={styles.expirationPill}>
              <Ionicons name="time" size={13} color="#FFFFFF" />
              <Text style={styles.expirationPillText}>Expires in 24 hours</Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.emptyPickerCard,
              { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
            ]}
          >
            <View style={styles.emptyIconCircle}>
              <Ionicons name="sparkles" size={36} color="#E5252A" />
            </View>
            <Text style={[styles.pickerHeadline, { color: colors.text }]}>
              Share Your Fitness Story
            </Text>
            <Text style={[styles.pickerSub, { color: colors.textSecondary }]}>
              Post a workout snapshot or a short video (up to 15s). It disappears automatically after 24 hours.
            </Text>

            {/* Action Buttons: Photo, Video, Gallery */}
            <View style={styles.pickerButtonsCol}>
              <TouchableOpacity
                style={[styles.pickerBtn, { backgroundColor: '#E5252A' }]}
                onPress={handleTakePhoto}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.pickerBtnText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickerBtn, { backgroundColor: '#FF8A1F' }]}
                onPress={handleRecordVideo}
                activeOpacity={0.85}
              >
                <Ionicons name="videocam" size={20} color="#FFFFFF" />
                <Text style={styles.pickerBtnText}>Record Video (Max 15s)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pickerBtnOutline,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
                onPress={handlePickFromGallery}
                activeOpacity={0.85}
              >
                <Ionicons name="images-outline" size={20} color={colors.text} />
                <Text style={[styles.pickerBtnOutlineText, { color: colors.text }]}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isProcessing && (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color="#E5252A" />
            <Text style={[styles.processingText, { color: colors.textSecondary }]}>
              Optimizing media for instant playback...
            </Text>
          </View>
        )}

        {/* Visibility Selector */}
        {mediaUri && (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Who can see this story?</Text>

            {/* Option 1: Friends Only */}
            <TouchableOpacity
              style={[
                styles.visibilityOptionRow,
                visibility === 'friends' && styles.visibilitySelectedRow,
                { borderColor: visibility === 'friends' ? '#E5252A' : colors.border },
              ]}
              onPress={() => setVisibility('friends')}
              activeOpacity={0.8}
            >
              <View style={[styles.visIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="people" size={18} color="#3B82F6" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.visTitle, { color: colors.text }]}>Friends Only</Text>
                <Text style={[styles.visSub, { color: colors.textSecondary }]}>
                  Visible only to accepted fitness friends
                </Text>
              </View>
              <View
                style={[
                  styles.radioCircle,
                  visibility === 'friends' && styles.radioCircleActive,
                ]}
              >
                {visibility === 'friends' && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>

            {/* Option 2: Everyone (Public) */}
            <TouchableOpacity
              style={[
                styles.visibilityOptionRow,
                visibility === 'public' && styles.visibilitySelectedRow,
                {
                  borderColor: visibility === 'public' ? '#E5252A' : colors.border,
                  opacity: isFriendsOnlyAccount || isPrivateAccount ? 0.5 : 1,
                },
              ]}
              onPress={() => {
                if (isFriendsOnlyAccount) {
                  Alert.alert(
                    'Account Privacy Restriction',
                    'Your account visibility is set to Friends Only. Change it to Everyone in Profile > Settings to share public stories.'
                  );
                  return;
                }
                if (isPrivateAccount) {
                  Alert.alert(
                    'Account is Private',
                    'Your account visibility is set to Private. You cannot share public stories.'
                  );
                  return;
                }
                setVisibility('public');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.visIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="globe" size={18} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.visTitle, { color: colors.text }]}>Everyone</Text>
                <Text style={[styles.visSub, { color: colors.textSecondary }]}>
                  Any athlete on SweatFlix can watch
                </Text>
                {isFriendsOnlyAccount && (
                  <Text style={styles.privacyNoticeText}>
                    Locked: Account visibility is set to Friends
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.radioCircle,
                  visibility === 'public' && styles.radioCircleActive,
                ]}
              >
                {visibility === 'public' && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Share Button & Progress */}
        {mediaUri && (
          <View style={styles.footerCol}>
            {isUploading && (
              <View style={styles.uploadProgressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.round(uploadProgress * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.uploadProgressText, { color: colors.textSecondary }]}>
                  Uploading story... {Math.round(uploadProgress * 100)}%
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.shareBtn,
                { backgroundColor: '#E5252A', opacity: isUploading ? 0.7 : 1 },
              ]}
              onPress={handleShareStory}
              disabled={isUploading}
              activeOpacity={0.88}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                  <Text style={styles.shareBtnText}>Share Story</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: 16,
    paddingBottom: 40,
  },
  previewCard: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.52,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  videoPreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.semiBold,
  },
  retakeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  expirationPill: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(229, 37, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  expirationPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  emptyPickerCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pickerHeadline: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  pickerSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  pickerButtonsCol: {
    width: '100%',
    gap: 10,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  pickerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: Typography.weights.bold,
  },
  pickerBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  pickerBtnOutlineText: {
    fontSize: 14,
    fontWeight: Typography.weights.semiBold,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  processingText: {
    fontSize: 12,
  },
  sectionCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  visibilityOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm,
    padding: 12,
  },
  visibilitySelectedRow: {
    backgroundColor: 'rgba(229, 37, 42, 0.05)',
  },
  visIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  visSub: {
    fontSize: 12,
    marginTop: 2,
  },
  privacyNoticeText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 3,
    fontWeight: Typography.weights.semiBold,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#E5252A',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5252A',
  },
  footerCol: {
    gap: 12,
    marginTop: 6,
  },
  uploadProgressContainer: {
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E5252A',
    borderRadius: 3,
  },
  uploadProgressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: BorderRadius.md,
    elevation: 3,
    shadowColor: '#E5252A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Typography.weights.bold,
  },
});
