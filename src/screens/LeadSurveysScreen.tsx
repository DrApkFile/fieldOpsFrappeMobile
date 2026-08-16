import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { mockLeads, mockLeadSurveys } from '../services/mockService';
import { RouteName, Lead } from '../types';

interface LeadSurveysScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadData?: Lead;
}

export const LeadSurveysScreen: React.FC<LeadSurveysScreenProps> = ({ onNavigate, leadData }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { getLeadSurveyResponse } = useFieldStore();
  const lead = leadData || mockLeads[0];

  const rows = mockLeadSurveys.map((survey) => {
    const questionCount = survey.sections.reduce((sum, s) => sum + s.questions.length, 0);
    const completed = !!getLeadSurveyResponse(lead.id, survey.id);
    return { survey, questionCount, completed };
  });
  const pendingCount = rows.filter((r) => !r.completed).length;
  const completedCount = rows.length - pendingCount;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Surveys"
        subtitle={`${pendingCount} pending · ${completedCount} completed`}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('leadDetail', lead)}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {rows.map(({ survey, questionCount, completed }) => (
          <Pressable key={survey.id} onPress={() => onNavigate('leadSurveyDetail', { lead, survey })}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Icon name="clipboard-list" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.flex1}>
                  <View style={styles.titleRow}>
                    <Text style={styles.surveyName}>{survey.name}</Text>
                    <View style={[styles.badge, completed ? styles.badgeDone : styles.badgePending]}>
                      <Text style={[styles.badgeText, { color: completed ? theme.colors.emerald : theme.colors.amber }]}>
                        {completed ? 'Completed' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.surveyDesc}>{survey.description}</Text>
                  <Text style={styles.surveyMeta}>{questionCount} questions · {survey.durationLabel}</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  content: { padding: theme.spacing.lg, paddingBottom: 60, gap: theme.spacing.sm },
  card: { gap: 0 },
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  flex1: { flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: theme.radius.md, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.xs },
  surveyName: { flex: 1, fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: theme.radius.full },
  badgePending: { backgroundColor: theme.colors.amberLight },
  badgeDone: { backgroundColor: theme.colors.emeraldLight },
  badgeText: { fontFamily: theme.fonts.bold, fontSize: 10 },
  surveyDesc: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: 2, lineHeight: 16 },
  surveyMeta: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.darkMuted, marginTop: 4 },
});
