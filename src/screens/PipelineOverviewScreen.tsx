import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { mockLeads } from '../services/mockService';
import { RouteName, Lead } from '../types';
import {
  getWeightedPipelineValue, getTotalPipelineValue, getOverdueLeads, getStageBreakdown, getConversionRate,
} from '../utils/pipelineMetrics';

interface PipelineOverviewScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadsList?: Lead[];
}

export const PipelineOverviewScreen: React.FC<PipelineOverviewScreenProps> = ({ onNavigate, leadsList = mockLeads }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const weightedValue = getWeightedPipelineValue(leadsList);
  const totalValue = getTotalPipelineValue(leadsList);
  const overdue = getOverdueLeads(leadsList);
  const stages = getStageBreakdown(leadsList);
  const conversionRate = getConversionRate(leadsList);
  const maxStageCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Pipeline Overview" subtitle={`${leadsList.length} leads tracked`} onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weighted Value Card */}
        <Card style={styles.weightedCard}>
          <Text style={styles.weightedLabel}>WEIGHTED PIPELINE VALUE</Text>
          <Text style={styles.weightedValue}>₦{Math.round(weightedValue).toLocaleString()}</Text>
          <Text style={styles.weightedSub}>of ₦{totalValue.toLocaleString()} total unweighted value</Text>
        </Card>

        {/* Stat Pills */}
        <View style={styles.statsRow}>
          <Card style={styles.statCell}>
            <Text style={styles.statVal}>{leadsList.length}</Text>
            <Text style={styles.statLabel}>TOTAL LEADS</Text>
          </Card>
          <Card style={styles.statCell}>
            <Text style={styles.statVal}>{Math.round(conversionRate * 100)}%</Text>
            <Text style={styles.statLabel}>CONVERSION</Text>
          </Card>
          <Card style={styles.statCell}>
            <Text style={[styles.statVal, overdue.length > 0 && { color: theme.colors.red }]}>{overdue.length}</Text>
            <Text style={styles.statLabel}>OVERDUE</Text>
          </Card>
        </View>

        {/* Overdue Follow-ups */}
        {overdue.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OVERDUE FOLLOW-UPS ({overdue.length})</Text>
            {overdue.map((lead) => (
              <Pressable key={lead.id} onPress={() => onNavigate('leadDetail', lead)}>
                <Card style={styles.overdueCard}>
                  <Icon name="alert-circle" size={16} color={theme.colors.red} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.overdueName}>{lead.name}</Text>
                    <Text style={styles.overdueSub}>{lead.next}</Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={theme.colors.textMuted} />
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        {/* Pipeline Stages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PIPELINE STAGES</Text>
          {stages.map((s) => (
            <Card key={s.stage} style={styles.stageCard}>
              <View style={styles.stageHeaderRow}>
                <Text style={styles.stageName}>{s.stage}</Text>
                <Text style={styles.stageCount}>{s.count} · ₦{s.value.toLocaleString()}</Text>
              </View>
              <View style={styles.stageTrack}>
                <View style={[styles.stageFill, { width: `${(s.count / maxStageCount) * 100}%` }]} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 60, gap: theme.spacing.md },
  weightedCard: { backgroundColor: theme.colors.primaryDark, borderColor: theme.colors.primary, gap: 2 },
  weightedLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.primaryText, letterSpacing: 0.8 },
  weightedValue: { fontFamily: theme.fonts.display, fontSize: 28, color: '#FFFFFF', marginTop: 2 },
  weightedSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.primaryText },
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  statCell: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: theme.spacing.md },
  statVal: { fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.textDark },
  statLabel: { fontFamily: theme.fonts.bold, fontSize: 9, color: theme.colors.textMuted, letterSpacing: 0.6 },
  section: { gap: theme.spacing.xs },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  overdueCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.redLight, borderColor: theme.colors.red },
  overdueName: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  overdueSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  stageCard: { gap: 8 },
  stageHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stageName: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  stageCount: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.textMuted },
  stageTrack: { height: 6, backgroundColor: theme.colors.cardBorder, borderRadius: 3, overflow: 'hidden' },
  stageFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
});
