import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Button } from '../components/Button';
import { mockCampaigns } from '../services/mockService';
import { RouteName } from '../types';

interface SurveysScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const SurveysScreen: React.FC<SurveysScreenProps> = ({ onNavigate }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Field Surveys" subtitle="Dynamic Surveys Assigned" onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card} onPress={() => onNavigate('surveyForm')}>
          <View style={styles.row}>
            <Pill color={theme.colors.teal}>Dynamic Survey</Pill>
            <Text style={styles.beat}>Victoria Island</Text>
          </View>
          <Text style={styles.title}>Customer Pulse Survey Q3</Text>
          <Text style={styles.sub}>Dynamic multi-question survey covering delivery speed, shelf rating, text observations, and shelf photo evidence.</Text>

          <Button title="Start Survey Now" onPress={() => onNavigate('surveyForm')} iconName="clipboard-list" style={styles.btn} />
        </Card>

        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Other Surveys Available</Text>
          <Text style={styles.emptySub}>Future campaign survey templates will load dynamically when assigned.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  card: { gap: theme.spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  beat: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  title: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark, marginTop: 4 },
  sub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, lineHeight: 18 },
  btn: { marginTop: theme.spacing.md },
  emptyCard: { alignItems: 'center', padding: theme.spacing.xl, gap: theme.spacing.xs },
  emptyTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  emptySub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, textAlign: 'center' },
});
