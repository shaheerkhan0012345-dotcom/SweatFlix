import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  storyService,
  UserStoryGroup,
  StoryViewerUser,
} from '../../services/storyService';
import { getAvatarColor } from '../../services/communityService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHOTO_DURATION_MS = 5000;

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return '1d ago';
  } catch {
    return '';
  }
}

// Video Player component for story playback
const StoryVideoContent: React.FC<{
  uri: string;
  isPaused: boolean;
  onEnded: () => void;
  onDurationDetermined?: (durationMs: number) => void;
}> = ({ uri, isPaused, onEnded, onDurationDetermined }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
    try {
      p.play();
    } catch (e) {
      console.warn('Video play error:', e);
    }
  });

  useEffect(() => {
    if (isPaused) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPaused, player]);

  return (
    <VideoView
      player={player}
      style={styles.fullMedia}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

export default function StoryViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ initialUserId?: string }>();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [groups, setGroups] = useState<UserStoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation pointers
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Playback timer state
  const [isPaused, setIsPaused] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const progressIntervalRef = useRef<any>(null);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  // Modals
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [viewersList, setViewersList] = useState<StoryViewerUser[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Load all active stories
  useEffect(() => {
    let isMounted = true;
    storyService
      .getActiveStories(user?.id || 'me')
      .then((loadedGroups) => {
        if (!isMounted) return;
        setGroups(loadedGroups);
        setLoading(false);

        // Position at requested initial user
        if (params.initialUserId) {
          const idx = loadedGroups.findIndex((g) => g.user_id === params.initialUserId);
          if (idx >= 0) {
            setCurrentUserIndex(idx);
            // If user has unwatched stories, jump to first unwatched story
            const firstUnwatched = loadedGroups[idx].stories.findIndex((s) => !s.is_viewed);
            setCurrentStoryIndex(firstUnwatched >= 0 ? firstUnwatched : 0);
          }
        }
      })
      .catch((e) => {
        console.warn('Failed to load stories:', e);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [user?.id, params.initialUserId]);

  const currentGroup = groups[currentUserIndex];
  const currentStory = currentGroup?.stories?.[currentStoryIndex];
  const isOwnStory = currentGroup?.is_own;

  // Auto-record view in story_views when story becomes active
  useEffect(() => {
    if (currentStory && user?.id) {
      storyService
        .recordView(currentStory.id, user.id)
        .then(() => {
          setGroups((prev) =>
            prev.map((g, gIdx) => {
              if (gIdx !== currentUserIndex) return g;
              return {
                ...g,
                stories: g.stories.map((s, sIdx) =>
                  sIdx === currentStoryIndex ? { ...s, is_viewed: true } : s
                ),
              };
            })
          );
        })
        .catch((e) => console.warn('Record view error:', e));
    }
  }, [currentStory, user?.id, currentUserIndex, currentStoryIndex]);

  // Advance to next story / next user
  const handleAdvanceNext = useCallback(() => {
    if (!currentGroup) return;

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      // Next story in current user group
      setMediaError(false);
      setCurrentStoryIndex((prev) => prev + 1);
      setStoryProgress(0);
    } else if (currentUserIndex < groups.length - 1) {
      // Next user group
      setMediaError(false);
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      setStoryProgress(0);
    } else {
      // Reached the end of all stories: close viewer
      router.back();
    }
  }, [currentGroup, currentStoryIndex, currentUserIndex, groups.length, router]);

  // Go back to previous story / previous user
  const handleGoBack = useCallback(() => {
    setMediaError(false);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setStoryProgress(0);
    } else if (currentUserIndex > 0) {
      const prevGroup = groups[currentUserIndex - 1];
      setCurrentUserIndex((prev) => prev - 1);
      setCurrentStoryIndex(Math.max(0, prevGroup.stories.length - 1));
      setStoryProgress(0);
    } else {
      // At the very beginning: restart current story
      setStoryProgress(0);
    }
  }, [currentStoryIndex, currentUserIndex, groups]);

  // Main timer for current story
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (!currentStory || isPaused || showViewersModal || showMenuModal || showReportModal) {
      return;
    }

    const duration =
      currentStory.media_type === 'video' ? 15000 : PHOTO_DURATION_MS;
    const intervalTime = 50;
    const step = intervalTime / duration;

    progressIntervalRef.current = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 1) {
          clearInterval(progressIntervalRef.current);
          handleAdvanceNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [
    currentStory,
    isPaused,
    showViewersModal,
    showMenuModal,
    showReportModal,
    handleAdvanceNext,
  ]);

  // Viewers list modal for own story
  const handleOpenViewers = useCallback(async () => {
    if (!currentStory) return;
    setIsPaused(true);
    setShowViewersModal(true);
    setLoadingViewers(true);
    try {
      const viewers = await storyService.getStoryViewers(currentStory.id);
      setViewersList(viewers);
    } catch (e) {
      console.warn('Viewers load error:', e);
    } finally {
      setLoadingViewers(false);
    }
  }, [currentStory]);

  // Touch & Swipe gestures
  const handleTouchStart = useCallback((e: any) => {
    touchStartY.current = e.nativeEvent.pageY;
    touchStartTime.current = e.nativeEvent.timestamp || Date.now();
    setIsPaused(true);
  }, []);

  const handleTouchEnd = useCallback((e: any) => {
    setIsPaused(false);
    const deltaY = e.nativeEvent.pageY - touchStartY.current;
    const now = e.nativeEvent.timestamp || Date.now();
    const duration = now - touchStartTime.current;

    // Swipe down gesture to dismiss (dragged down > 80px)
    if (deltaY > 80) {
      router.back();
      return;
    }

    // Swipe up gesture on own story to show viewers
    if (deltaY < -80 && isOwnStory) {
      handleOpenViewers();
      return;
    }

    // Tap detection (quick press < 250ms with minimal move)
    if (duration < 250 && Math.abs(deltaY) < 20) {
      const tapX = e.nativeEvent.pageX;
      if (tapX < SCREEN_WIDTH * 0.3) {
        handleGoBack();
      } else {
        handleAdvanceNext();
      }
    }
  }, [handleAdvanceNext, handleGoBack, handleOpenViewers, isOwnStory, router]);

  // Delete own story
  const handleDeleteStory = () => {
    if (!currentStory || !user?.id) return;
    setIsPaused(true);

    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story? It will be removed for all athletes immediately.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setIsPaused(false) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const targetStoryId = currentStory.id;
              const targetMediaPath = currentStory.media_path;

              // Delete from backend & storage
              await storyService.deleteStory({
                storyId: targetStoryId,
                userId: user.id,
                mediaPath: targetMediaPath,
              });

              // Remove from local state
              setGroups((prevGroups) => {
                return prevGroups
                  .map((g, gIdx) => {
                    if (gIdx !== currentUserIndex) return g;
                    const remainingStories = g.stories.filter((s) => s.id !== targetStoryId);
                    return { ...g, stories: remainingStories };
                  })
                  .filter((g) => g.stories.length > 0);
              });

              // Adjust pointers or exit if no stories left
              if (currentGroup.stories.length <= 1) {
                if (currentUserIndex < groups.length - 1) {
                  setCurrentStoryIndex(0);
                  setStoryProgress(0);
                } else {
                  router.back();
                }
              } else {
                setCurrentStoryIndex((prev) => Math.max(0, prev - 1));
                setStoryProgress(0);
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete story');
              setIsPaused(false);
            }
          },
        },
      ]
    );
  };

  // Report story
  const handleConfirmReport = async (reason: string) => {
    if (!currentStory) return;
    setShowReportModal(false);
    try {
      await storyService.reportStory({
        storyId: currentStory.id,
        reporterId: user?.id || 'me',
        reason,
      });
      Alert.alert('Report Received', 'Thank you for keeping SweatFlix safe.');
      handleAdvanceNext();
    } catch (e) {
      console.warn('Report error:', e);
    }
  };

  // Block author
  const handleBlockAuthor = () => {
    if (!currentGroup || !user?.id) return;
    setShowMenuModal(false);
    Alert.alert(
      `Block ${currentGroup.user_name}?`,
      'You will no longer see stories or posts from this athlete.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setIsPaused(false) },
        {
          text: 'Block User',
          style: 'destructive',
          onPress: async () => {
            await storyService.blockUser({
              blockerId: user.id,
              blockedId: currentGroup.user_id,
            });

            // Remove all stories from this user
            setGroups((prev) => prev.filter((_, gIdx) => gIdx !== currentUserIndex));
            if (currentUserIndex < groups.length - 1) {
              setCurrentStoryIndex(0);
              setStoryProgress(0);
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#E5252A" />
      </View>
    );
  }

  if (!currentGroup || !currentStory) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.noStoryText}>No active stories available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const authorInitial = (currentGroup.user_name || 'A').charAt(0).toUpperCase();

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" />

      {/* Main Touch Area for Hold-to-pause and Taps */}
      <View
        style={styles.mediaContainer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render Image or Video */}
        {currentStory.media_type === 'video' ? (
          <StoryVideoContent
            uri={currentStory.media_url}
            isPaused={isPaused}
            onEnded={handleAdvanceNext}
          />
        ) : (
          <View style={styles.imageWrapper}>
            {mediaLoading && (
              <View style={styles.mediaLoaderCenter}>
                <ActivityIndicator size="large" color="#E5252A" />
              </View>
            )}
            <Image
              source={{ uri: currentStory.media_url }}
              style={styles.fullMedia}
              contentFit="cover"
              onLoadStart={() => {
                setMediaLoading(true);
                setMediaError(false);
              }}
              onLoad={() => {
                setMediaLoading(false);
                setMediaError(false);
              }}
              onError={(e) => {
                setMediaLoading(false);
                setMediaError(true);
                console.warn('Story image load error:', e, 'URL:', currentStory.media_url);
              }}
            />
            {mediaError && (
              <View style={styles.errorCenterContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#E5252A" />
                <Text style={styles.errorMainText}>Unable to load story</Text>
                <Text style={styles.errorSubText}>
                  This story was uploaded before the fix and contains no media.
                </Text>
                {isOwnStory && (
                  <TouchableOpacity
                    style={styles.deleteStoryButton}
                    onPress={handleDeleteStory}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.deleteStoryButtonText}>Delete This Story</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Gradient Vignette Overlays for Crisp Header & Footer Readability */}
      <View style={styles.topVignette} pointerEvents="none" />
      <View style={styles.bottomVignette} pointerEvents="none" />

      {/* Top Header Controls */}
      <View style={styles.headerOverlay} pointerEvents="box-none">
        {/* Progress Bar Segments */}
        <View style={styles.progressBarRow}>
          {currentGroup.stories.map((s, idx) => {
            let widthPercent = 0;
            if (idx < currentStoryIndex) {
              widthPercent = 100;
            } else if (idx === currentStoryIndex) {
              widthPercent = Math.min(100, Math.round(storyProgress * 100));
            } else {
              widthPercent = 0;
            }

            return (
              <View key={s.id || idx} style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${widthPercent}%` }]} />
              </View>
            );
          })}
        </View>

        {/* Author Info & Actions */}
        <View style={styles.authorBar}>
          <View style={styles.authorInfoLeft}>
            {currentGroup.avatar_url ? (
              <Image source={{ uri: currentGroup.avatar_url }} style={styles.authorAvatar} />
            ) : (
              <View
                style={[
                  styles.authorAvatarFallback,
                  { backgroundColor: getAvatarColor(currentGroup.user_id) },
                ]}
              >
                <Text style={styles.authorAvatarInitial}>{authorInitial}</Text>
              </View>
            )}

            <View style={{ marginLeft: 10 }}>
              <Text style={styles.authorNameText} numberOfLines={1}>
                {isOwnStory ? 'Your story' : currentGroup.user_name}
              </Text>
              <Text style={styles.timeAgoText}>{formatTimeAgo(currentStory.created_at)}</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            {/* Delete button on own story */}
            {isOwnStory && (
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={handleDeleteStory}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* "..." Menu on someone else's story */}
            {!isOwnStory && (
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={() => {
                  setIsPaused(true);
                  setShowMenuModal(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* Close 'X' Button */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Bar: Eye Viewers Count on Own Story */}
      {isOwnStory && (
        <View style={styles.bottomBarOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.viewersBadgeBtn}
            onPress={handleOpenViewers}
            activeOpacity={0.8}
          >
            <Ionicons name="eye" size={16} color="#FFFFFF" />
            <Text style={styles.viewersBadgeText}>
              {currentStory.views_count || viewersList.length || 0} views
            </Text>
            <Ionicons name="chevron-up" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEWERS LIST MODAL (Own Story) */}
      {/* ========================================================================= */}
      <Modal visible={showViewersModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="eye" size={18} color={Colors.primary} />
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Story Viewers</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowViewersModal(false);
                  setIsPaused(false);
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {loadingViewers ? (
              <View style={styles.loadingCenter}>
                <ActivityIndicator size="small" color="#E5252A" />
              </View>
            ) : viewersList.length === 0 ? (
              <View style={styles.emptyViewersContainer}>
                <Ionicons name="people-outline" size={36} color={colors.textSecondary} />
                <Text style={[styles.emptyViewersText, { color: colors.textSecondary }]}>
                  No views yet. Check back soon!
                </Text>
              </View>
            ) : (
              <View style={styles.viewersListContainer}>
                {viewersList.map((viewer) => (
                  <View key={viewer.id} style={styles.viewerRow}>
                    {viewer.avatar_url ? (
                      <Image source={{ uri: viewer.avatar_url }} style={styles.viewerAvatar} />
                    ) : (
                      <View
                        style={[
                          styles.viewerAvatarFallback,
                          { backgroundColor: getAvatarColor(viewer.id) },
                        ]}
                      >
                        <Text style={styles.viewerAvatarText}>
                          {viewer.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.viewerName, { color: colors.text }]}>
                        {viewer.name}
                      </Text>
                      {viewer.username ? (
                        <Text style={[styles.viewerUsername, { color: colors.textSecondary }]}>
                          @{viewer.username}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={[styles.viewedTimeAgo, { color: colors.textSecondary }]}>
                      {formatTimeAgo(viewer.viewed_at)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: SOMEONE ELSE'S STORY MENU (Report & Block) */}
      {/* ========================================================================= */}
      <Modal visible={showMenuModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowMenuModal(false);
            setIsPaused(false);
          }}
        >
          <View style={[styles.menuSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.dragHandle} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenuModal(false);
                setShowReportModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="flag-outline" size={20} color="#F59E0B" />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Report Story</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
              onPress={handleBlockAuthor}
              activeOpacity={0.7}
            >
              <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
                Block @{currentGroup.username || currentGroup.user_name}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              onPress={() => {
                setShowMenuModal(false);
                setIsPaused(false);
              }}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: REPORT REASONS */}
      {/* ========================================================================= */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.reportSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.reportTitle, { color: colors.text }]}>Report this story</Text>
            <Text style={[styles.reportSub, { color: colors.textSecondary }]}>
              Why are you reporting this story? It will be immediately removed from your feed.
            </Text>

            {['Inappropriate content', 'Harassment or hate', 'Spam or scam', 'Other'].map(
              (reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reportReasonRow, { borderColor: colors.border }]}
                  onPress={() => handleConfirmReport(reason)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.reportReasonText, { color: colors.text }]}>{reason}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              style={[styles.cancelBtn, { marginTop: 12, backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
              onPress={() => {
                setShowReportModal(false);
                setIsPaused(false);
              }}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noStoryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Typography.weights.semiBold,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#E5252A',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#000000',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaLoaderCenter: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  fullMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 24,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 3,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  authorAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  authorAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  authorNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeAgoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  viewersBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewersBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: Typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.md,
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
  },
  modalCloseBtn: {
    padding: 4,
  },
  loadingCenter: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyViewersContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 8,
  },
  emptyViewersText: {
    fontSize: 13,
  },
  viewersListContainer: {
    paddingTop: 10,
    gap: 12,
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  viewerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: Typography.weights.bold,
  },
  viewerName: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  viewerUsername: {
    fontSize: 12,
    marginTop: 2,
  },
  viewedTimeAgo: {
    fontSize: 12,
  },
  menuSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.md,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: Typography.weights.semiBold,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BorderRadius.md,
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  reportSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.md,
    gap: 10,
  },
  reportTitle: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
  },
  reportSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  reportReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  reportReasonText: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
  },
  errorCenterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: 10,
    zIndex: 10,
  },
  errorMainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorSubText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  deleteStoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E5252A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  deleteStoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
