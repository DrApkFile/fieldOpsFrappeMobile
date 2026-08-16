import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useFieldStore } from '../store/useFieldStore';
import { mockLeads, mockLeadSurveys } from '../services/mockService';
import { RouteName, Lead, LeadSurveyConfig } from '../types';

interface LeadSurveyDetailScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  routeData?: { lead?: Lead; survey?: LeadSurveyConfig };
}

export const LeadSurveyDetailScreen: React.FC<LeadSurveyDetailScreenProps> = ({ onNavigate, routeData }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { getLeadSurveyResponse } = useFieldStore();
  const lead = routeData?.lead || mockLeads[0];
  const survey = routeData?.survey || mockLeadSurveys[0];

  const questionCount = survey.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const requiredCount = survey.sections.reduce((sum, s) => sum + s.questions.filter((q) => q.required).length, 0);
  const completed = !!getLeadSurveyResponse(lead.id, survey.id);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={survey.name} subtitle="Survey details" onNavigate={onNavigate} onBackPress={() => onNavigate('leadSurveys', lead)} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.overviewCard}>
          <View style={[styles.statusBadge, completed ? styles.statusDone : styles.statusPending]}>
            <Text style={[styles.statusText, { color: completed ? theme.colors.emerald : '#FFFFFF' }]}>
              {completed ? 'COMPLETED' : 'NOT STARTED'}
            </Text>
          </View>
          <Text style={styles.description}>{survey.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statVal}>{questionCount}</Text>
              <Text style={styles.statLabel}>QUESTIONS</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statVal}>{requiredCount}</Text>
              <Text style={styles.statLabel}>REQUIRED</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statVal}>{survey.durationLabel.replace('~', '')}</Text>
              <Text style={styles.statLabel}>DURATION</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionsTitle}>SECTIONS</Text>
        {survey.sections.map((section, idx) => (
          <Card key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionNumBadge}>
                <Text style={styles.sectionNumText}>{idx + 1}</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.sectionName}>{section.name}</Text>
                <Text style={styles.sectionMeta}>{section.questions.length} questions</Text>
                {section.description ? <Text style={styles.sectionDesc}>{section.description}</Text> : null}
              </View>
            </View>
          </Card>
        ))}

        <Button
          title={completed ? 'Retake Survey' : 'Start Survey'}
          onPress={() => onNavigate('leadSurveyForm', { lead, survey })}
          size="large"
          style={styles.startBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  content: { padding: theme.spacing.lg, paddingBottom: 60, gap: theme.spacing.md },
  flex1: { flex: 1 },
  overviewCard: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, gap: theme.spacing.sm },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full },
  statusPending: { backgroundColor: 'rgba(255,255,255,0.2)' },
  statusDone: { backgroundColor: '#FFFFFF' },
  statusText: { fontFamily: theme.fonts.bold, fontSize: 10, letterSpacing: 0.5 },
  description: { fontFamily: theme.fonts.semibold, fontSize: 14, color: '#FFFFFF', lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  statCell: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: theme.radius.md, paddingVertical: 10, alignItems: 'center', gap: 2 },
  statVal: { fontFamily: theme.fonts.display, fontSize: 16, color: '#FFFFFF' },
  statLabel: { fontFamily: theme.fonts.bold, fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  sectionsTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  sectionCard: { gap: 0 },
  sectionRow: { flexDirection: 'row', gap: theme.spacing.sm },
  sectionNumBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  sectionNumText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.primary },
  sectionName: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  sectionMeta: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted, marginTop: 1 },
  sectionDesc: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: 3, lineHeight: 16 },
  startBtn: { marginTop: theme.spacing.xs },
});
