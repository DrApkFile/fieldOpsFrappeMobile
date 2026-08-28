import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { RouteName } from '../types';

interface OutletSurveysScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  routeData?: { outletId?: string };
}

export const OutletSurveysScreen: React.FC<OutletSurveysScreenProps> = ({ onNavigate, routeData }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state, getSurveysForOutlet } = useFieldStore();
  const outletId = routeData?.outletId || state.outlets[0]?.id;
  const outlet = state.outlets.find((o) => o.id === outletId);
  const activeCampaign = state.activeCampaign;

  const surveyConfigs = (activeCampaign?.surveys || []).filter((s) => s.module === 'surveys');
  const submittedSurveys = outletId ? getSurveysForOutlet(outletId) : [];

  const rows = surveyConfigs.map((survey) => {
    const sections = survey.sections || [];
    const questionCount = sections.length > 0
      ? sections.reduce((sum, s) => sum + s.questions.length, 0)
      : survey.questions.length;
    const completed = submittedSurveys.some((s) => s.surveyConfigId === survey.id);
    return { survey, questionCount, completed };
  });
  const pendingCount = rows.filter((r) => !r.completed).length;
  const completedCount = rows.length - pendingCount;

  if (!outlet) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Surveys" onNavigate={onNavigate} onBackPress={() => onNavigate('outlets')} />
        <View style={styles.missingContainer}>
          <Icon name="alert-circle" size={44} color={theme.colors.amber} />
          <Text style={styles.missingTitle}>This outlet could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Surveys"
        subtitle={`${pendingCount} pending · ${completedCount} completed`}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('outletDetail', { outletId: outlet.id })}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {rows.length === 0 && (
          <Text style={styles.emptyText}>No surveys are configured for this campaign yet.</Text>
        )}
        {rows.map(({ survey, questionCount, completed }) => (
          <Pressable key={survey.id} onPress={() => onNavigate('outletSurveyForm', { outletId: outlet.id, survey })}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Icon name="clipboard-list" size={18} color={theme.colors.navy} />
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
                  {survey.description ? <Text style={styles.surveyDesc}>{survey.description}</Text> : null}
                  <View style={styles.metaRow}>
                    <Text style={styles.surveyMeta}>{questionCount} questions</Text>
                    {survey.durationLabel ? (
                      <>
                        <Text style={styles.metaDot}>·</Text>
                        <Icon name="clock" size={12} color={theme.colors.textMuted} />
                        <Text style={styles.surveyMeta}>{survey.durationLabel}</Text>
                      </>
                    ) : null}
                  </View>
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
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 60, gap: theme.spacing.sm },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  missingTitle: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.textDark, textAlign: 'center' },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', paddingVertical: theme.spacing.xl },
  card: { gap: 0 },
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  flex1: { flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: theme.radius.md, backgroundColor: theme.colors.fieldFill, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.xs },
  surveyName: { flex: 1, fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: theme.radius.full },
  badgePending: { backgroundColor: theme.colors.amberLight },
  badgeDone: { backgroundColor: theme.colors.emeraldLight },
  badgeText: { fontFamily: theme.fonts.bold, fontSize: 10 },
  surveyDesc: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 2, lineHeight: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  surveyMeta: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.textMuted },
  metaDot: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted },
});
