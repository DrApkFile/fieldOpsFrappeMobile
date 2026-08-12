import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icon';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { demoAuthService } from '../services/mockService';
import { RouteName } from '../types';

interface LoginScreenProps {
  onSuccess: () => void;
  onNavigate: (route: RouteName) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const [email, setEmail] = useState('amara.okafor@fieldops.io');
  const [password, setPassword] = useState('demo1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your work email and password.');
      return;
    }
    setLoading(true);
    await demoAuthService(email);
    setLoading(false);
    onSuccess();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Pressable onPress={() => onNavigate('onboarding')} style={styles.backBtn}>
            <Icon name="chevron-left" size={22} color={theme.colors.darkText} />
          </Pressable>
        </View>

          {/* Clean Logo Image */}
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo.jpg')} style={styles.logoImage} resizeMode="contain" />
          </View>

          {/* Title Header */}
          <View style={styles.titleSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSub}>
              Sign in to access your field territory workspace.
            </Text>
          </View>

          {/* Login Form Inputs */}
          <View style={styles.formSection}>
            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="example@company.com"
              keyboardType="email-address"
              dark
              required
              leftIcon="mail"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              isPassword
              dark
              required
              leftIcon="shield-check"
            />

            {/* Options Row */}
            <View style={styles.optionsRow}>
              <Pressable
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.checkboxWrapper}
              >
                <Icon
                  name={rememberMe ? 'check-square' : 'square'}
                  size={18}
                  color={rememberMe ? theme.colors.primaryLight : theme.colors.darkMuted}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>

              <Pressable onPress={() => onNavigate('forgot')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Primary Action Button (Soulful Violet Accent) */}
            <Button
              title={loading ? 'Signing in...' : 'Sign in'}
              onPress={handleLogin}
              variant="primary"
              size="large"
              loading={loading}
              iconName="logout"
              style={styles.signInBtn}
            />

            {/* Quick Demo Access Shortcut */}
            <Pressable onPress={handleLogin} style={styles.demoShortcut}>
              <Text style={styles.demoShortcutText}>Use Demo Agent Credentials →</Text>
            </Pressable>
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Secured by FieldOps Mobile Engine
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const createStyles = (theme: any) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.darkBg,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.safeTopPadding + 10,
      paddingBottom: theme.spacing.xxl,
      flexGrow: 1,
    },
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.darkSurface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.darkBorder,
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.md,
    },
    logoImage: {
      width: 90,
      height: 90,
    },
    titleSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    welcomeTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 28,
      color: theme.colors.darkText,
      letterSpacing: -0.5,
      marginBottom: theme.spacing.xs,
    },
    welcomeSub: {
      fontFamily: theme.fonts.regular,
      fontSize: 14,
      color: theme.colors.darkMuted,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: '90%',
    },
    formSection: {
      gap: theme.spacing.sm,
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: theme.spacing.md,
    },
    checkboxWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    rememberText: {
      fontFamily: theme.fonts.semibold,
      fontSize: 13,
      color: theme.colors.darkMuted,
    },
    forgotText: {
      fontFamily: theme.fonts.bold,
      fontSize: 13,
      color: theme.colors.primaryLight,
    },
    signInBtn: {
      marginTop: theme.spacing.sm,
    },
    demoShortcut: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    demoShortcutText: {
      fontFamily: theme.fonts.bold,
      fontSize: 14,
      color: theme.colors.primaryLight,
    },
    footerInfo: {
      marginTop: 'auto',
      alignItems: 'center',
      paddingTop: theme.spacing.xl,
    },
    footerText: {
      fontFamily: theme.fonts.regular,
      fontSize: 12,
      color: theme.colors.darkMuted,
    },
  });
