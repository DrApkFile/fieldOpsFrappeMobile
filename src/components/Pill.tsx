import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface PillProps {
  children: string;
  color?: string;
  bgColor?: string;
}

export const Pill: React.FC<PillProps> = ({ children, color = theme.colors.primary, bgColor }) => {
  const bg = bgColor || `${color}18`;

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
});
