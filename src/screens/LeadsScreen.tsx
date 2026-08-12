import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Icon } from '../components/Icon';
import { mockLeads } from '../services/mockService';
import { RouteName, Lead } from '../types';

interface LeadsScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadsList?: Lead[];
}

export const LeadsScreen: React.FC<LeadsScreenProps> = ({ onNavigate, leadsList = mockLeads }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const newCount = leadsList.filter((l) => l.stage === 'New').length;
  const contactedCount = leadsList.filter((l) => l.stage === 'Contacted').length;
  const qualifiedCount = leadsList.filter((l) => l.stage === 'Qualified').length;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Leads Pipeline"
        subtitle={`${leadsList.length} assigned leads`}
        onNavigate={onNavigate}
        rightAction={
          <Pressable onPress={() => onNavigate('leadForm')} style={styles.addBtn}>
            <Icon name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Pipeline Summary Bar */}
        <Card style={styles.summaryCard}>
          <View style={styles.stageCol}>
            <Text style={styles.stageLabel}>New</Text>
            <Text style={styles.stageNum}>{newCount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stageCol}>
            <Text style={styles.stageLabel}>Contacted</Text>
            <Text style={styles.stageNum}>{contactedCount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stageCol}>
            <Text style={styles.stageLabel}>Qualified</Text>
            <Text style={styles.stageNum}>{qualifiedCount}</Text>
          </View>
        </Card>

        {/* Lead List Cards */}
        {leadsList.map((lead) => (
          <Card key={lead.id} style={styles.leadCard} onPress={() => onNavigate('leadDetail', lead)}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{lead.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.leadName}>{lead.name}</Text>
                <Text style={styles.leadCompany}>{lead.company}</Text>
              </View>
              <Pill color={lead.stage === 'Qualified' ? theme.colors.emerald : theme.colors.primary}>
                {lead.stage}
              </Pill>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.nextAction}>{lead.next}</Text>
              <Text style={styles.leadValue}>{lead.value}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: theme.spacing.md },
  stageCol: { alignItems: 'center', gap: 2 },
  stageLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase' },
  stageNum: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.textDark },
  divider: { width: 1, height: 30, backgroundColor: theme.colors.cardBorder },
  leadCard: { gap: theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.primary },
  info: { flex: 1 },
  leadName: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.textDark },
  leadCompany: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs, paddingTop: theme.spacing.xs, borderTopWidth: 1, borderTopColor: theme.colors.cardBorder },
  nextAction: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  leadValue: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.primary },
});
