import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { TabIcon } from '../../components/TabIcon';
import { usePremium } from '../../context/PremiumContext';

function ExploreHeaderButton() {
  const router = useRouter();
  const { isPremium } = usePremium();

  if (isPremium) {
    return (
      <TouchableOpacity
        onPress={() => router.push('/premium')}
        style={styles.proBadge}
        activeOpacity={0.8}
      >
        <Text style={styles.proBadgeText}>👑 PRO</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => router.push('/premium')}
      style={styles.premiumButton}
      activeOpacity={0.8}
    >
      <Text style={styles.premiumButtonText}>👑 Premium</Text>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Generous bottom inset ensures tab buttons sit cleanly above mobile navigation bar
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 28 : 20);
  const tabHeight = 62 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: Colors.cardBorder,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.cardBorder,
        },
        headerTitleStyle: {
          fontWeight: Typography.weights.bold,
          color: Colors.textDark,
          fontSize: Typography.sizes.lg,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'SweatFlix',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
          headerRight: () => <ExploreHeaderButton />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Workouts',
          headerTitle: 'Workout Library',
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="explore" color={color} focused={focused} />
          ),
          headerRight: () => <ExploreHeaderButton />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          headerTitle: 'Community',
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="community" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          title: 'Diet Plan',
          headerTitle: 'Diet & Nutrition',
          tabBarLabel: 'Diet',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="diet" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  premiumButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
    letterSpacing: 0.5,
  },
  proBadge: {
    backgroundColor: '#FFF2E5',
    borderColor: '#FF8A1F',
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: Spacing.md,
  },
  proBadgeText: {
    color: '#FF6B00',
    fontWeight: Typography.weights.heavy,
    fontSize: Typography.sizes.xs,
    letterSpacing: 0.5,
  },
});
