import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Icon, IconName } from '../components/Icon';
import { mockUser } from '../services/mockService';
import { RouteName } from '../types';

interface ProfileScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onLogout }) => {
  const menuItems: { title: string; route: RouteName; icon: IconName }[] = [
    { title: 'My Leads Pipeline', route: 'leads', icon: 'users' },
    { title: 'Attendance & Clock-In History', route: 'attendance', icon: 'clock' },
    { title: 'Offline Synchronization Queue', route: 'sync', icon: 'refresh' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Personal Profile" subtitle={mockUser.role} back={false} onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Agent Profile Banner */}
        <Card style={styles.profileBanner}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{mockUser.initials}</Text>
            </View>
            <View style={styles.flex1}>
              <Text style={styles.userName}>{mockUser.name}</Text>
              <Text style={styles.userRole}>{mockUser.role} · {mockUser.territory}</Text>
            </View>
          </View>
        </Card>

        {/* Monthly Performance Kpis */}
        <Text style={styles.sectionTitle}>This Month's Performance</Text>
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiVal}>₦1.24m</Text>
            <Text style={styles.kpiLabel}>Sales Closed</Text>
          </Card>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiVal}>37</Text>
            <Text style={styles.kpiLabel}>Leads Onboarded</Text>
          </Card>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiVal}>94%</Text>
            <Text style={styles.kpiLabel}>Attendance</Text>
          </Card>
        </View>

        {/* Territory Ranking */}
        <Card style={styles.rankCard}>
          <Text style={styles.rankLabel}>TERRITORY LEADERBOARD RANK</Text>
          <Text style={styles.rankValue}>
            #{mockUser.rank} <Text style={styles.rankTotal}>of {mockUser.totalAgents} agents</Text>
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: '85%' }]} />
          </View>
          <Text style={styles.rankSub}>Top 11% performer in Lagos Central District</Text>
        </Card>

        {/* Quick Menu Settings */}
        {menuItems.map((item) => (
          <Card key={item.title} style={styles.menuCard} onPress={() => onNavigate(item.route)}>
            <Icon name={item.icon} size={20} color={theme.colors.primary} />
            <Text style={styles.menuText}>{item.title}</Text>
            <Icon name="chevron-right" size={18} color={theme.colors.textMuted} />
          </Card>
        ))}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  profileBanner: { padding: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: theme.fonts.bold, fontSize: 20, color: '#FFFFFF' },
  flex1: { flex: 1 },
  userName: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark },
  userRole: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  kpiRow: { flexDirection: 'row', gap: theme.spacing.sm },
  kpiCard: { flex: 1, padding: theme.spacing.md, gap: 2, alignItems: 'center' },
  kpiVal: { fontFamily: theme.fonts.bold, fontSize: 17, color: theme.colors.textDark },
  kpiLabel: { fontFamily: theme.fonts.regular, fontSize: 10, color: theme.colors.textMuted, textAlign: 'center' },
  rankCard: { gap: theme.spacing.xs },
  rankLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  rankValue: { fontFamily: theme.fonts.display, fontSize: 24, color: theme.colors.textDark },
  rankTotal: { fontSize: 13, fontFamily: theme.fonts.regular, color: theme.colors.textMuted },
  track: { height: 8, backgroundColor: theme.colors.cardBorder, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
  rankSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  menuCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md },
  menuText: { flex: 1, fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  logoutCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, backgroundColor: '#FEF2F2', borderRadius: theme.radius.lg, borderWidth: 1, borderColor: '#FCA5A5', marginTop: theme.spacing.xs },
  logoutText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.red },
});
