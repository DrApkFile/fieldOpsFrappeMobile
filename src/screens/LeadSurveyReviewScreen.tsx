import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useFieldStore } from '../store/useFieldStore';
import { mockLeads, mockLeadSurveys } from '../services/mockService';
import { RouteName, Lead, LeadSurveyConfig, LeadSurveyAnswer } from '../types';

interface LeadSurveyReviewScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  routeData?: {
    lead?: Lead;
    survey?: LeadSurveyConfig;
    answers?: Record<string, any>;
    photoUris?: Record<string, string>;
  };
}

function formatAnswer(val: any): string {
  if (val === undefined || val === null || val === '') return 'Not answered';
  if (Array.isArray(val)) return val.length ? val.join(', ') : 'Not answered';
  return String(val);
}

export const LeadSurveyReviewScreen: React.FC<LeadSurveyReviewScreenProps> = ({ onNavigate, routeData }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { dispatch } = useFieldStore();
  const lead = routeData?.lead || mockLeads[0];
  const survey = routeData?.survey || mockLeadSurveys[0];
  const answers = routeData?.answers || {};
  const photoUris = routeData?.photoUris || {};
  const [submitting, setSubmitting] = useState(false);

  const allQuestions = survey.sections.flatMap((s) => s.questions);

  const handleSubmit = () => {
    setSubmitting(true);

    const surveyAnswers: LeadSurveyAnswer[] = allQuestions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id] ?? null,
    }));

    setTimeout(() => {
      dispatch({
        type: 'ADD_LEAD_SURVEY_RESPONSE',
        response: {
          id: `lsr-${Date.now()}`,
          leadId: lead.id,
          surveyConfigId: survey.id,
          answers: surveyAnswers,
          submittedAt: new Date().toISOString(),
        },
      });
      setSubmitting(false);
      Alert.alert('Survey Submitted', `${survey.name} has been recorded for ${lead.name}.`, [
        { text: 'OK', onPress: () => onNavigate('leadSurveys', lead) },
      ]);
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Review Answers"
        subtitle={survey.name}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('leadSurveyForm', { lead, survey })}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {allQuestions.map((q, idx) => (
          <Card key={q.id} style={styles.qCard}>
            <Text style={styles.qText}>{idx + 1}. {q.question}</Text>
            {q.type === 'photo' && photoUris[q.id] ? (
              <Image source={{ uri: photoUris[q.id] }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <Text style={styles.answerText}>{formatAnswer(answers[q.id])}{q.unit && answers[q.id] ? ` ${q.unit}` : ''}</Text>
            )}
          </Card>
        ))}

        <View style={styles.actionsRow}>
          <Button title="Edit Answers" onPress={() => onNavigate('leadSurveyForm', { lead, survey })} variant="outline" style={styles.editBtn} />
          <Button
            title={submitting ? 'Submitting...' : 'Submit Survey'}
            onPress={handleSubmit}
            variant="navy"
            loading={submitting}
            disabled={submitting}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 60, gap: theme.spacing.sm },
  qCard: { gap: 6 },
  qText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.textMuted },
  answerText: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  photoPreview: { width: '100%', height: 140, borderRadius: theme.radius.md },
  actionsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  editBtn: { flex: 1 },
  submitBtn: { flex: 1.4 },
});
