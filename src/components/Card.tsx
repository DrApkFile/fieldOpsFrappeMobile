import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { theme } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  dark?: boolean;
  tintBg?: string;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, dark = false, tintBg, onPress }) => {
  const content = (
    <View
      style={[
        styles.card,
        dark && styles.cardDark,
        tintBg ? { backgroundColor: tintBg, borderColor: 'transparent' } : null,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardWhite,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  cardDark: {
    backgroundColor: theme.colors.darkCard,
    borderColor: theme.colors.darkBorder,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
