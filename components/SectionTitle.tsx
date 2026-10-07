import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  center?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  style,
  titleStyle,
  subtitleStyle,
  center = false,
}) => {
  return (
    <View style={[styles.container, center && styles.centered, style]}>
      <Text style={[styles.title, center && styles.textCenter, titleStyle]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, center && styles.textCenter, subtitleStyle]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.textGrey,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  textCenter: {
    textAlign: 'center',
  },
});

export default SectionTitle;
