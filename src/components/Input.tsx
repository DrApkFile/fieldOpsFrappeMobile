import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardTypeOptions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon, IconName } from './Icon';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  dark?: boolean;
  leftIcon?: IconName;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  multiline = false,
  keyboardType = 'default',
  dark = false,
  leftIcon,
  required = false,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [showPassword, setShowPassword] = useState(!isPassword);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, dark && styles.labelDark]}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          dark && styles.inputWrapperDark,
          isFocused && (dark ? styles.focusedDark : styles.focusedLight),
          multiline && styles.multilineWrapper,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Icon
              name={leftIcon}
              size={18}
              color={dark ? theme.colors.darkMuted : theme.colors.textMuted}
            />
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={dark ? '#64748B' : '#94A3B8'}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            dark && styles.inputDark,
            multiline && styles.multilineInput,
          ]}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={18}
              color={dark ? theme.colors.darkMuted : theme.colors.textMuted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
  },
  label: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.textDark,
    marginBottom: 6,
  },
  labelDark: {
    color: theme.colors.darkText,
  },
  required: {
    color: theme.colors.red,
  },
  inputWrapper: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.cardWhite,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  inputWrapperDark: {
    backgroundColor: theme.colors.darkInputBg,
    borderColor: theme.colors.darkBorder,
  },
  focusedLight: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FAFAFF',
  },
  focusedDark: {
    borderColor: theme.colors.limePrimary,
    backgroundColor: '#151D28',
  },
  leftIconContainer: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.textDark,
    paddingVertical: theme.spacing.sm,
  },
  inputDark: {
    color: theme.colors.darkText,
  },
  multilineWrapper: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  multilineInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  eyeBtn: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
