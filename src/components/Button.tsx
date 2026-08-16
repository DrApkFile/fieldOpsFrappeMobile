import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon, IconName } from './Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'lime' | 'outline' | 'ghost' | 'secondary';
  size?: 'normal' | 'small' | 'large';
  disabled?: boolean;
  loading?: boolean;
  iconName?: IconName;
  iconColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'normal',
  disabled = false,
  loading = false,
  iconName,
  iconColor,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const getBackgroundColor = () => {
    if (disabled) return variant === 'lime' ? 'rgba(200,245,38,0.4)' : `${theme.colors.primary}66`;
    switch (variant) {
      case 'lime':
        return theme.colors.limePrimary;
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.darkSurface;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return variant === 'lime' ? theme.colors.limeText : '#FFFFFF';
    switch (variant) {
      case 'lime':
        return theme.colors.limeText;
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.darkText;
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'small' && styles.btnSmall,
        size === 'large' && styles.btnLarge,
        variant === 'outline' && styles.btnOutline,
        { backgroundColor: getBackgroundColor() },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {iconName && (
            <Icon
              name={iconName}
              size={size === 'small' ? 16 : 18}
              color={iconColor || getTextColor()}
            />
          )}
          <Text
            style={[
              styles.text,
              size === 'small' && styles.textSmall,
              size === 'large' && styles.textLarge,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  btnSmall: {
    minHeight: 38,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
  },
  btnLarge: {
    minHeight: 58,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xxl,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  text: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  textSmall: {
    fontSize: 13,
  },
  textLarge: {
    fontSize: 17,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
