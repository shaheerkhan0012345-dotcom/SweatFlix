import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import {
  getExerciseLocalVideoAsset,
  getExerciseThumbnailAsset,
} from '../constants/exerciseImages';

interface WorkoutVideoPlayerProps {
  videoUrl?: string | any;
  thumbnail?: any;
  workoutName: string;
  duration?: number;
  kcal?: number;
  level?: string;
  autoPlay?: boolean;
  variant?: 'card' | 'bare';
  height?: number;
  backgroundColor?: string;
}

export const WorkoutVideoPlayer: React.FC<WorkoutVideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  workoutName,
  duration = 3,
  kcal = 45,
  level = 'Intermediate',
  autoPlay = true,
  variant = 'card',
  height,
  backgroundColor = '#FFFFFF',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const controlsTimeoutRef = React.useRef<any>(null);

  // Prioritize local bundled video asset for 0ms instant playback and 0% risk of 403 network errors
  const videoSource = React.useMemo(() => {
    return getExerciseLocalVideoAsset(workoutName || videoUrl);
  }, [videoUrl, workoutName]);

  const imageSource = React.useMemo(() => {
    return getExerciseThumbnailAsset(
      workoutName || videoUrl,
      typeof thumbnail === 'string' ? thumbnail : undefined
    );
  }, [videoUrl, workoutName, thumbnail]);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = isMuted;
    try {
      p.play();
    } catch (err) {
      console.warn('AutoPlay error:', err);
    }
  });

  useEventListener(player, 'playingChange', ({ isPlaying: playing }: any) => {
    setIsPlaying(playing);
  });

  const togglePlay = () => {
    if (!player) return;
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
        setShowControlsOverlay(true);
      } else {
        player.play();
        setIsPlaying(true);
        setShowControlsOverlay(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControlsOverlay(false);
        }, 2500);
      }
    } catch (e) {
      console.warn('togglePlay error:', e);
    }
  };

  const toggleControls = () => {
    setShowControlsOverlay((prev) => !prev);
  };

  const toggleMute = () => {
    if (!player) return;
    try {
      const nextMuted = !isMuted;
      // eslint-disable-next-line react-hooks/immutability
      player.muted = nextMuted;
      setIsMuted(nextMuted);
    } catch {}
  };

  useEventListener(player, 'statusChange', ({ status, error }: any) => {
    if (status === 'readyToPlay') {
      try {
        player.play();
      } catch {}
    } else if (status === 'error') {
      console.warn('WorkoutVideoPlayer error on source:', error);
      const safeAsset = getExerciseLocalVideoAsset(videoUrl || workoutName);
      if (player && safeAsset) {
        try {
          if (typeof (player as any).replaceAsync === 'function') {
            (player as any)
              .replaceAsync(safeAsset)
              .then(() => {
                (player as any).play();
              })
              .catch(() => {});
          } else if (typeof (player as any).replace === 'function') {
            (player as any).replace(safeAsset);
            (player as any).play();
          }
        } catch (e) {
          console.warn('Player fallback replace error:', e);
          setHasError(true);
        }
      } else {
        setHasError(true);
      }
    }
  });

  const lastVideoSourceRef = React.useRef(videoSource);
  // Keep player synced when videoSource changes
  useEffect(() => {
    if (player && videoSource && lastVideoSourceRef.current !== videoSource) {
      lastVideoSourceRef.current = videoSource;
      try {
        if (typeof (player as any).replaceAsync === 'function') {
          (player as any)
            .replaceAsync(videoSource)
            .then(() => {
              (player as any).play();
            })
            .catch(() => {});
        } else if (typeof (player as any).replace === 'function') {
          (player as any).replace(videoSource);
          (player as any).play();
        }
      } catch (e) {
        console.warn('Source update error:', e);
      }
    }
  }, [videoSource, player]);

  const containerHeight = height || (variant === 'bare' ? 220 : 220);

  if (variant === 'bare') {
    return (
      <View
        style={[
          styles.bareContainer,
          {
            height: containerHeight,
            backgroundColor: backgroundColor || '#000000',
            borderRadius: BorderRadius.card,
          },
        ]}
      >
        <View style={styles.bareVideoWrapper}>
          <VideoView
            style={styles.bareVideo}
            player={player}
            surfaceType="textureView"
            nativeControls={false}
            contentFit="contain"
          />

          {/* Invisible Tap Overlay to Toggle Controls */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={toggleControls}
          />

          {/* YouTube-Style Play/Pause Center Indicator */}
          {(!isPlaying || showControlsOverlay) && (
            <View style={styles.youtubeCenterOverlay} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.youtubePlayCircle}
                onPress={togglePlay}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#FFFFFF"
                  style={!isPlaying ? { marginLeft: 3 } : undefined}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Quick Control Pills */}
          <View style={styles.videoControlsBottomBar}>
            <TouchableOpacity
              style={styles.videoControlPill}
              onPress={togglePlay}
              activeOpacity={0.8}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={12} color="#FFFFFF" />
              <Text style={styles.videoControlPillText}>
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.videoControlPill}
              onPress={toggleMute}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isMuted ? 'volume-mute' : 'volume-high'}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.videoControlPillText}>
                {isMuted ? 'Unmute' : 'Mute'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={[styles.mediaContainer, height ? { height } : null]}>
        {hasError ? (
          <View style={styles.errorContainer}>
            <Image
              source={imageSource}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            <View style={styles.errorOverlay}>
              <Ionicons name="play-circle" size={48} color={Colors.primary} />
              <Text style={styles.errorText}>Tap to Reload 3D Movement</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setHasError(false);
                  try {
                    player.play();
                  } catch {}
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Play Movement</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.videoWrapper}>
            <VideoView
              style={styles.video}
              player={player}
              surfaceType="textureView"
              nativeControls={false}
              contentFit="contain"
            />

            {/* Invisible Tap Overlay to Toggle Controls */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={toggleControls}
            />

            {/* Top Level Pill */}
            <View style={styles.levelBadge} pointerEvents="none">
              <Text style={styles.levelText}>{level.toUpperCase()}</Text>
            </View>

            {/* YouTube-Style Play/Pause Center Indicator */}
            {(!isPlaying || showControlsOverlay) && (
              <View style={styles.youtubeCenterOverlay} pointerEvents="box-none">
                <TouchableOpacity
                  style={styles.youtubePlayCircle}
                  onPress={togglePlay}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={32}
                    color="#FFFFFF"
                    style={!isPlaying ? { marginLeft: 3 } : undefined}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Quick Control Pills */}
            <View style={styles.videoControlsBottomBar}>
              <TouchableOpacity
                style={styles.videoControlPill}
                onPress={togglePlay}
                activeOpacity={0.8}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={12} color="#FFFFFF" />
                <Text style={styles.videoControlPillText}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.videoControlPill}
                onPress={toggleMute}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.videoControlPillText}>
                  {isMuted ? 'Unmute' : 'Mute'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.workoutName}>{workoutName}</Text>
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
            <Text style={styles.tagText}>Full Range of Motion</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="speedometer" size={12} color={Colors.accent} />
            <Text style={styles.tagText}>Controlled Tempo</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bareContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bareVideoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: BorderRadius.card,
  },
  youtubeCenterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 10,
  },
  youtubePlayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  videoControlsBottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 12,
  },
  videoControlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoControlPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bareVideo: {
    width: '100%',
    height: '100%',
  },
  bareMedia: {
    width: '100%',
    height: '100%',
  },
  bareBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
    zIndex: 5,
  },
  barePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  bareBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mediaContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playPauseHitArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  darkGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  levelBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  videoBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  playButtonCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  playIcon: {
    marginLeft: 3,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.semiBold,
  },
  metricDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  closeFloatingButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  hdTagOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  hdTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.medium,
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: Spacing.md,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: Typography.weights.semiBold,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  infoContainer: {
    padding: Spacing.md,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    fontSize: 11,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
});
