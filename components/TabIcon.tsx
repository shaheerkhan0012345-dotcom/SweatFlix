import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface TabIconProps {
  name: 'home' | 'explore' | 'community' | 'diet' | 'profile';
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
      iconName = focused ? 'fitness' : 'fitness-outline';
      break;
    case 'community':
      iconName = focused ? 'people' : 'people-outline';
      break;
    case 'diet':
      iconName = focused ? 'restaurant' : 'restaurant-outline';
      break;
    case 'profile':
      iconName = focused ? 'person' : 'person-outline';
      break;
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

export default TabIcon;
