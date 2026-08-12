import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface PillProps {
  children: string;
  color?: string;
  bgColor?: string;
}

export const Pill: React.FC<PillProps> = ({ children, color, bgColor }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const resolvedColor = color || theme.colors.primary;
  const bg = bgColor || `${resolvedColor}18`;

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: resolvedColor }]}>{children}</Text>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
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
