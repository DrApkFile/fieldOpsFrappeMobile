import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { RouteName, Lead } from '../types';

interface LeadUpdateScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadData?: Lead;
}

export const LeadUpdateScreen: React.FC<LeadUpdateScreenProps> = ({ onNavigate, leadData }) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Update Pipeline Stage" subtitle={leadData?.name || 'Lead Stage'} onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.label}>CURRENT STAGE</Text>
          <Text style={styles.currentStage}>{leadData?.stage || 'Contacted'}</Text>
          <Pill color={theme.colors.primary}>Next Target: Proposal</Pill>
        </Card>

        <Input
          label="STAGE PROGRESSION REASON"
          value={reason}
          onChangeText={setReason}
          placeholder="Client requested price quotation for 25 cases..."
          required
          multiline
        />

        <Input
          label="MEETING / CALL NOTES"
          value={notes}
          onChangeText={setNotes}
          placeholder="Record key conversation points and follow-up requirements..."
          multiline
        />

        <Card style={styles.card}>
          <Text style={styles.label}>NEXT FOLLOW-UP DATE</Text>
          <Text style={styles.dateText}>Friday, 15 August · 10:00 AM (Auto Scheduler)</Text>
        </Card>

        <Button
          title="Save Stage Progression"
          onPress={() => onNavigate('leadSuccess')}
          size="large"
          iconName="check"
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  card: { gap: theme.spacing.xs },
  label: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  currentStage: { fontFamily: theme.fonts.display, fontSize: 24, color: theme.colors.textDark },
  dateText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark, marginTop: 2 },
  submitBtn: { marginTop: theme.spacing.sm },
});
