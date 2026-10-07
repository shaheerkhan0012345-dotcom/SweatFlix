import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

interface WorkoutVideoPlayerProps {
  videoUrl: string;
  thumbnail: string;
  workoutName: string;
  duration: number;
  kcal: number;
  level: string;
}

export const WorkoutVideoPlayer: React.FC<WorkoutVideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  workoutName,
  duration,
  kcal,
  level,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
  });

  const handleStartPlaying = () => {
    setIsPlaying(true);
    try {
      player.play();
    } catch (e) {
      console.log('Error playing video:', e);
    }
  };

  const handleStopPlaying = () => {
    try {
      player.pause();
    } catch (e) {
      console.log('Error pausing video:', e);
    }
    setIsPlaying(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.mediaContainer}>
        {isPlaying ? (
          <View style={styles.videoWrapper}>
            <VideoView
              style={styles.video}
              player={player}
              nativeControls
              contentFit="cover"
            />
            <TouchableOpacity
              onPress={handleStopPlaying}
              style={styles.closeFloatingButton}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleStartPlaying}
            style={styles.thumbnailContainer}
          >
            <Image
              source={{ uri: thumbnail }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            <View style={styles.darkGradientOverlay} />

            {/* Top Level Pill */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level.toUpperCase()}</Text>
            </View>

            {/* Play Button */}
            <View style={styles.playButtonCircle}>
              <Ionicons name="play" size={32} color="#FFFFFF" style={styles.playIcon} />
            </View>

            {/* Bottom Duration & Calories Overlay */}
            <View style={styles.overlayBottom}>
              <View style={styles.metricItem}>
                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text style={styles.metricText}>{duration} mins</Text>
              </View>
              <View style={styles.metricDot} />
              <View style={styles.metricItem}>
                <Ionicons name="flame-outline" size={16} color="#FF8A1F" />
                <Text style={styles.metricText}>{kcal} kcal</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.workoutName}>{workoutName}</Text>
        <Text style={styles.workoutSub}>
          Follow the video guide below to maintain proper form and tempo.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.md,
  },
  mediaContainer: {
    height: 220,
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  closeFloatingButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  thumbnailContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  levelBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    letterSpacing: 0.5,
  },
  playButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playIcon: {
    marginLeft: 4, // center alignment for play triangle
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 8,
  },
  metricText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  infoContainer: {
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  workoutName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: 4,
  },
  workoutSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGrey,
    lineHeight: 18,
  },
});

export default WorkoutVideoPlayer;
