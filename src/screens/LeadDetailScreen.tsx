import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Button } from '../components/Button';
import { mockLeads } from '../services/mockService';
import { RouteName, Lead } from '../types';

interface LeadDetailScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadData?: Lead;
}

export const LeadDetailScreen: React.FC<LeadDetailScreenProps> = ({ onNavigate, leadData }) => {
  const l = leadData || mockLeads[0];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Lead Profile" subtitle={l.company} onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.heroCard}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{l.name.charAt(0)}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{l.name}</Text>
              <Text style={styles.heroCompany}>{l.company}</Text>
            </View>
            <Pill color={theme.colors.emerald}>{l.stage}</Pill>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.contactText}>{l.phone} · {l.email || 'No email'}</Text>
            <Text style={styles.valueText}>Estimated: {l.value}</Text>
          </View>
        </Card>

        {/* Qualification Score */}
        <Card style={styles.scoreCard}>
          <Text style={styles.cardLabel}>QUALIFICATION SCORE</Text>
          <Text style={styles.scoreValue}>{l.score} <Text style={styles.scoreMax}>/ 100</Text></Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${l.score}%` }]} />
          </View>
          <Text style={styles.nextText}>Next Action: {l.next}</Text>
        </Card>

        {/* Follow up Schedule */}
        <Card style={styles.scheduleCard}>
          <Text style={styles.cardLabel}>SCHEDULED FOLLOW-UP</Text>
          <Text style={styles.scheduleTime}>Tomorrow · 10:00 AM</Text>
          <Text style={styles.scheduleNotes}>{l.notes || 'Call customer to confirm initial stock requirement.'}</Text>
        </Card>

        <Button
          title="Update Stage & Progression"
          onPress={() => onNavigate('leadUpdate', l)}
          size="large"
          iconName="trending-up"
          style={styles.actionBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  heroCard: { gap: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: theme.fonts.bold, fontSize: 22, color: theme.colors.primary },
  heroInfo: { flex: 1 },
  heroName: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark },
  heroCompany: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, marginTop: 1 },
  detailRow: { borderTopWidth: 1, borderTopColor: theme.colors.cardBorder, paddingTop: theme.spacing.sm },
  contactText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
  valueText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.primary, marginTop: 2 },
  scoreCard: { gap: theme.spacing.xs },
  cardLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  scoreValue: { fontFamily: theme.fonts.display, fontSize: 24, color: theme.colors.textDark },
  scoreMax: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.colors.textMuted },
  track: { height: 8, backgroundColor: theme.colors.cardBorder, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.colors.teal, borderRadius: 4 },
  nextText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.textDark, marginTop: 4 },
  scheduleCard: { gap: theme.spacing.xs },
  scheduleTime: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.textDark },
  scheduleNotes: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
  actionBtn: { marginTop: theme.spacing.xs },
});
