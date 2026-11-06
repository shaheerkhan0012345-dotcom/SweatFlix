import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LeagueTier, leagueService } from '../services/leagueService';

interface LeagueTierBadgeProps {
  tier?: LeagueTier | string;
  size?: 'small' | 'medium' | 'large';
  showCrown?: boolean;
  onPress?: () => void;
  style?: any;
}

export const LeagueTierBadge: React.FC<LeagueTierBadgeProps> = ({
  tier = 'Bronze',
  size = 'small',
  showCrown = false,
  onPress,
  style,
}) => {
  const meta = leagueService.getTierMeta(tier);

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconSize = isSmall ? 10 : isLarge ? 18 : 13;
  const crownSize = isSmall ? 11 : isLarge ? 20 : 14;

  const content = (
    <View
      style={[
        styles.badgeBase,
        isSmall && styles.badgeSmall,
        isLarge && styles.badgeLarge,
        {
          backgroundColor: meta.lightBg,
          borderColor: meta.borderColor,
        },
        style,
      ]}
    >
      {showCrown && (
        <Ionicons
          name="trophy"
          size={crownSize}
          color="#EAB308"
          style={{ marginRight: 3 }}
        />
      )}
      <Ionicons
        name={meta.icon as any}
        size={iconSize}
        color={meta.color}
        style={{ marginRight: 3 }}
      />
      <Text
        style={[
          styles.textBase,
          isSmall && styles.textSmall,
          isLarge && styles.textLarge,
          { color: meta.color },
        ]}
      >
        {meta.tier}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  textBase: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '700',
  },
  textLarge: {
    fontSize: 14,
    fontWeight: '800',
  },
});
