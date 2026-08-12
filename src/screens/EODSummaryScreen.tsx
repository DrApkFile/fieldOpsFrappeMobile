import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Pill } from '../components/Pill';
import { Icon } from '../components/Icon';
import { submitMockData } from '../services/mockService';
import { RouteName } from '../types';

interface EODSummaryScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const EODSummaryScreen: React.FC<EODSummaryScreenProps> = ({ onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitEod = async () => {
    setSubmitting(true);
    await submitMockData();
    setSubmitting(false);
    setSubmitted(true);
    Alert.alert('EOD Summary Submitted', 'Your daily field report has been transmitted to Company Management.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="End of Day Summary" subtitle="Daily Activity Report" onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <Card style={styles.heroCard}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Icon name="clock" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.heroTitle}>Today's Field Activity Summary</Text>
              <Text style={styles.heroSub}>
                Automatically compiled as you performed tasks throughout your field shift.
              </Text>
            </View>
          </View>
        </Card>

        {/* Activity Highlights */}
        <Text style={styles.sectionTitle}>Shift Metrics Recorded</Text>
        <View style={styles.metricsGrid}>
          <Card style={styles.metricItem}>
            <Text style={styles.metricVal}>3</Text>
            <Text style={styles.metricLabel}>New Leads Onboarded</Text>
          </Card>
          <Card style={styles.metricItem}>
            <Text style={styles.metricVal}>₦245,000</Text>
            <Text style={styles.metricLabel}>Sales Closed</Text>
          </Card>
          <Card style={styles.metricItem}>
            <Text style={styles.metricVal}>12</Text>
            <Text style={styles.metricLabel}>Surveys Executed</Text>
          </Card>
          <Card style={styles.metricItem}>
            <Text style={styles.metricVal}>100%</Text>
            <Text style={styles.metricLabel}>Beat Compliance</Text>
          </Card>
        </View>

        {/* Activity Timeline */}
        <Text style={styles.sectionTitle}>Logged Timeline</Text>
        <Card style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <Pill color={theme.colors.emerald}>08:45 AM</Pill>
            <Text style={styles.timelineText}>Clocked In at Lekki Beat (GPS Verified)</Text>
          </View>
          <View style={styles.timelineItem}>
            <Pill color={theme.colors.primary}>11:20 AM</Pill>
            <Text style={styles.timelineText}>Onboarded Lead: Mariam's Pantry (₦180k estimate)</Text>
          </View>
          <View style={styles.timelineItem}>
            <Pill color={theme.colors.teal}>01:15 PM</Pill>
            <Text style={styles.timelineText}>Completed Customer Pulse Survey Q3 with shelf photo</Text>
          </View>
          <View style={styles.timelineItem}>
            <Pill color={theme.colors.amber}>03:40 PM</Pill>
            <Text style={styles.timelineText}>Closed Retail Sale: FreshMart Lekki (₦65,000 POS)</Text>
          </View>
        </Card>

        {/* Submit Action */}
        <Button
          title={submitted ? 'Summary Submitted ✓' : 'Submit End of Day Summary'}
          onPress={handleSubmitEod}
          disabled={submitted}
          loading={submitting}
          size="large"
          iconName="check"
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  heroCard: { padding: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  heroTitle: { fontFamily: theme.fonts.bold, fontSize: 17, color: theme.colors.textDark },
  heroSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 2, lineHeight: 17 },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  metricItem: { width: '48%', padding: theme.spacing.md, gap: 2, alignItems: 'center' },
  metricVal: { fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.textDark },
  metricLabel: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted, textAlign: 'center' },
  timelineCard: { gap: theme.spacing.md },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  timelineText: { flex: 1, fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.textDark },
  submitBtn: { marginTop: theme.spacing.sm },
});
