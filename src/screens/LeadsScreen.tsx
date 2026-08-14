import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Icon } from '../components/Icon';
import { DayRouteNav } from '../components/DayRouteNav';
import { mockLeads, mockRouteAssignments } from '../services/mockService';
import { RouteName, Lead } from '../types';

interface LeadsScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadsList?: Lead[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export const LeadsScreen: React.FC<LeadsScreenProps> = ({ onNavigate, leadsList = mockLeads }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedDate, setSelectedDate] = useState(todayIso());

  const assignment = mockRouteAssignments.find((a) => a.date === selectedDate);
  // No assignment for this date yet in the mock window — show the full list rather than an empty screen.
  const visibleLeads = assignment ? leadsList.filter((l) => assignment.leadIds.includes(l.id)) : leadsList;

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
        <DayRouteNav selectedDate={selectedDate} onSelectDate={setSelectedDate} assignments={mockRouteAssignments} />

        {/* Pipeline Summary Link */}
        <Pressable onPress={() => onNavigate('pipelineOverview')}>
          <Card style={styles.summaryCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>{leadsList.length} leads in pipeline</Text>
              <Text style={styles.summarySub}>View pipeline →</Text>
            </View>
            <Icon name="trending-up" size={22} color={theme.colors.primary} />
          </Card>
        </Pressable>

        {/* Lead List Cards */}
        {visibleLeads.length === 0 && (
          <Text style={styles.emptyText}>No leads on this date's route.</Text>
        )}
        {visibleLeads.map((lead) => (
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
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  summaryTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  summarySub: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.primary, marginTop: 2 },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', paddingVertical: theme.spacing.xl },
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
