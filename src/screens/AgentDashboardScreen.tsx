import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { PerformanceDashboardView } from './dashboard/PerformanceDashboardView';
import { SummaryDashboardView } from './dashboard/SummaryDashboardView';
import { RouteName, Lead } from '../types';

interface AgentDashboardScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadsList?: Lead[];
}

type DashboardTab = 'performance' | 'summary';

export const AgentDashboardScreen: React.FC<AgentDashboardScreenProps> = ({ onNavigate, leadsList = [] }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [tab, setTab] = useState<DashboardTab>('performance');

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Dashboard" subtitle="Campaign performance" onNavigate={onNavigate} onBackPress={() => onNavigate('home')} />

      <View style={styles.segmentWrapper}>
        <Pressable
          onPress={() => setTab('performance')}
          style={[styles.segment, tab === 'performance' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, tab === 'performance' && styles.segmentTextActive]}>Performance Dashboard</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('summary')}
          style={[styles.segment, tab === 'summary' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, tab === 'summary' && styles.segmentTextActive]}>Summary Dashboard</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'performance' ? (
          <PerformanceDashboardView leadsList={leadsList} />
        ) : (
          <SummaryDashboardView leadsList={leadsList} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  segmentWrapper: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.darkSurface,
    borderRadius: theme.radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.darkMuted,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  scroll: { padding: theme.spacing.lg, paddingBottom: 60 },
});
