import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Image, Alert, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { mockUser } from '../services/mockService';
import { RouteName } from '../types';

let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  const memoryStore = new Map<string, string>();
  AsyncStorage = {
    getItem: async (key: string) => memoryStore.get(key) || null,
    setItem: async (key: string, val: string) => { memoryStore.set(key, val); },
  };
}

const AVATAR_STORAGE_KEY = '@fieldops:avatarUri';

interface ProfileScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onLogout }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_STORAGE_KEY).then((saved: string | null) => {
      if (saved) setAvatarUri(saved);
    }).catch(() => {});
  }, []);

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Allow photo library access to update your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      AsyncStorage.setItem(AVATAR_STORAGE_KEY, uri).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" subtitle="Profile & app preferences" back={false} onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Profile Section ─────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <Card style={styles.profileBanner}>
          <View style={styles.row}>
            <Pressable onPress={handleChangeAvatar} style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{mockUser.initials}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Icon name="camera" size={12} color="#FFFFFF" />
              </View>
            </Pressable>
            <View style={styles.flex1}>
              <Text style={styles.userName}>{mockUser.name}</Text>
              <Text style={styles.userRole}>{mockUser.role} · {mockUser.territory}</Text>
            </View>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{mockUser.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>{mockUser.role}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Territory</Text>
              <Text style={styles.detailValue}>{mockUser.territory}</Text>
            </View>
          </View>
          <Text style={styles.avatarHint}>Tap your photo to update it — other profile details are managed by your admin.</Text>
        </Card>

        {/* ── Theme ────────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.menuCard}>
          <Icon name={theme.mode === 'dark' ? 'moon' : 'sun'} size={20} color={theme.colors.primary} />
          <View style={styles.flex1}>
            <Text style={styles.menuText}>Dark Mode</Text>
            <Text style={styles.menuSubText}>{theme.mode === 'dark' ? 'Dark theme is on' : 'Light theme is on'}</Text>
          </View>
          <Switch
            value={theme.mode === 'dark'}
            onValueChange={theme.toggleMode}
            trackColor={{ false: theme.colors.cardBorder, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </Card>

        {/* Logout Action */}
        <Pressable
          onPress={() => {
            Alert.alert('Log Out', 'Are you sure you want to sign out of FieldOps?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: onLogout },
            ]);
          }}
          style={styles.logoutCard}
        >
          <Icon name="logout" size={20} color={theme.colors.red} />
          <Text style={styles.logoutText}>Sign Out of Agent Account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.sm },
  profileBanner: { padding: theme.spacing.lg, gap: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarText: { fontFamily: theme.fonts.bold, fontSize: 20, color: '#FFFFFF' },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.cardWhite,
  },
  flex1: { flex: 1 },
  userName: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark },
  userRole: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  detailsList: { gap: theme.spacing.xs, borderTopWidth: 1, borderTopColor: theme.colors.cardBorder, paddingTop: theme.spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailLabel: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
  detailValue: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.textDark },
  avatarHint: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted, lineHeight: 15 },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: theme.spacing.xs },
  menuCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md },
  menuText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  menuSubText: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  logoutCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, backgroundColor: theme.colors.redLight, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.red, marginTop: theme.spacing.xs },
  logoutText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.red },
});
