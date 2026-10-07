import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface TabIconProps {
  name: 'home' | 'explore' | 'profile';
  color: any;
  focused: boolean;
  size?: number;
}

export const TabIcon: React.FC<TabIconProps> = ({
  name,
  color,
  focused,
  size = 24,
}) => {
  let iconName: keyof typeof Ionicons.glyphMap = 'home';

  switch (name) {
    case 'home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'explore':
      iconName = focused ? 'compass' : 'compass-outline';
      break;
    case 'profile':
      iconName = focused ? 'person' : 'person-outline';
      break;
  }

  try {
    return <Ionicons name={iconName} size={size} color={color} />;
  } catch {
    return (
      <View style={[styles.fallback, { borderColor: color }]}>
        <Text style={[styles.fallbackText, { color }]}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  fallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TabIcon;
