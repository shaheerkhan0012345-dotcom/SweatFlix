import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserStoryGroup } from '../services/storyService';
import { getAvatarColor } from '../services/communityService';

interface StoriesRowProps {
  groups: UserStoryGroup[];
  onRefresh?: () => void;
  loading?: boolean;
}

export const StoriesRow: React.FC<StoriesRowProps> = ({
  groups,
  loading = false,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  // Find own story group
  const ownGroup = groups.find((g) => g.is_own);
  const otherGroups = groups.filter((g) => !g.is_own);

  const ownHasStories = ownGroup && ownGroup.stories.length > 0;
  const ownAvatarUrl = user?.user_metadata?.avatar_url || ownGroup?.avatar_url;
  const ownInitial = (user?.user_metadata?.name || 'You').charAt(0).toUpperCase();

  const handlePressOwnStory = () => {
    if (ownHasStories && ownGroup) {
      // Open story viewer starting at own group
      router.push({
        pathname: '/community/story-viewer',
        params: {
          initialUserId: ownGroup.user_id,
        },
      } as any);
    } else {
      // No active stories: go directly to create story
      router.push('/community/new-story' as any);
    }
  };

  const handlePressPlus = (e: any) => {
    e?.stopPropagation?.();
    router.push('/community/new-story' as any);
  };

  const handlePressUserStory = (group: UserStoryGroup) => {
    router.push({
      pathname: '/community/story-viewer',
      params: {
        initialUserId: group.user_id,
      },
    } as any);
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. "Your Story" Item */}
        <TouchableOpacity
          style={styles.storyItem}
          onPress={handlePressOwnStory}
          activeOpacity={0.85}
        >
          <View style={styles.avatarWrapper}>
            {/* Story Ring around avatar */}
            <View
              style={[
                styles.ringOuter,
                ownHasStories
                  ? ownGroup?.has_unwatched
                    ? styles.ringUnwatched
                    : styles.ringWatched
                  : styles.ringNone,
                { backgroundColor: colors.background },
              ]}
            >
              <View style={[styles.ringInner, { backgroundColor: colors.background }]}>
                {ownAvatarUrl ? (
                  <Image
                    source={{ uri: ownAvatarUrl }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarFallback,
                      { backgroundColor: getAvatarColor(user?.id || 'me') },
                    ]}
                  >
                    <Text style={styles.avatarInitial}>{ownInitial}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* "+" Badge on Your Story */}
            <TouchableOpacity
              style={styles.plusBadge}
              onPress={handlePressPlus}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text
            style={[styles.storyUserName, { color: colors.text }]}
            numberOfLines={1}
          >
            Your story
          </Text>
        </TouchableOpacity>

        {/* 2. Other Users' Stories (Unwatched first, then watched) */}
        {otherGroups.map((group) => {
          const firstLetter = (group.user_name || 'A').charAt(0).toUpperCase();

          return (
            <TouchableOpacity
              key={group.user_id}
              style={styles.storyItem}
              onPress={() => handlePressUserStory(group)}
              activeOpacity={0.85}
            >
              <View style={styles.avatarWrapper}>
                <View
                  style={[
                    styles.ringOuter,
                    group.has_unwatched ? styles.ringUnwatched : styles.ringWatched,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={[styles.ringInner, { backgroundColor: colors.background }]}>
                    {group.avatar_url ? (
                      <Image
                        source={{ uri: group.avatar_url }}
                        style={styles.avatarImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarFallback,
                          { backgroundColor: getAvatarColor(group.user_id) },
                        ]}
                      >
                        <Text style={styles.avatarInitial}>{firstLetter}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Video indicator badge if latest story is video */}
                {group.stories[group.stories.length - 1]?.media_type === 'video' && (
                  <View style={styles.videoMiniBadge}>
                    <Ionicons name="play" size={8} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.storyUserName,
                  {
                    color: group.has_unwatched ? colors.text : colors.textSecondary,
                    fontWeight: group.has_unwatched ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {group.user_name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 14,
    alignItems: 'center',
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2.5,
  },
  ringUnwatched: {
    borderWidth: 2.5,
    borderColor: '#E5252A',
    // Gradient accent look
    shadowColor: '#E5252A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  ringWatched: {
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  ringNone: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  ringInner: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  avatarFallback: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: Typography.weights.bold,
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5252A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  videoMiniBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyUserName: {
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
});
