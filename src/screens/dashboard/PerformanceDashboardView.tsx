import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { RadialGauge } from '../../components/RadialGauge';
import { MiniBarChart } from '../../components/MiniBarChart';
import { useFieldStore } from '../../store/useFieldStore';
import { mockUser, mockAttendanceRecords } from '../../services/mockService';
import { Lead } from '../../types';
import {
  DashboardContext, getGreeting, getTodayPerformanceRows, getMtdRingPct,
  getAttendanceBreakdown, getActivityChartData, ChartRange,
} from '../../utils/dashboardMetrics';

interface PerformanceDashboardViewProps {
  leadsList: Lead[];
}

const RANGE_OPTIONS: { id: ChartRange; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'mtd', label: 'MTD' },
  { id: 'week', label: 'This Week' },
  { id: 'today', label: 'Today' },
];

export const PerformanceDashboardView: React.FC<PerformanceDashboardViewProps> = ({ leadsList }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state } = useFieldStore();
  const [range, setRange] = useState<ChartRange>('mtd');

  const campaign = state.activeCampaign;
  const ctx: DashboardContext = {
    campaign,
    leads: leadsList,
    outlets: state.outlets,
    sales: state.sales,
    orders: state.orders,
    surveys: state.surveys,
    products: state.products,
    photoCaptures: state.photoCaptures,
    drafts: state.drafts,
    attendance: mockAttendanceRecords,
  };

  const todayRows = getTodayPerformanceRows(ctx);
  const ring = getMtdRingPct(ctx);
  const attendance = getAttendanceBreakdown(mockAttendanceRecords);
  const chartData = getActivityChartData(ctx, range);
  const isPipeline = campaign.ctaType === 'leads';

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <View style={styles.greetingBlock}>
        <Text style={styles.greetingTitle}>{getGreeting(mockUser.name.split(' ')[0])}</Text>
        <Text style={styles.greetingSub}>{mockUser.territory} · {campaign.name}</Text>
      </View>

      {/* Today's Performance Overview */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>TODAY'S PERFORMANCE OVERVIEW</Text>
        {todayRows.map((row) => (
          <View key={row.label} style={styles.perfRow}>
            <View style={styles.perfRowHeader}>
              <Text style={styles.perfLabel}>{row.label}</Text>
              <Text style={styles.perfValue}>{row.valueText}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(row.progress * 100)}%` }]} />
            </View>
          </View>
        ))}
      </Card>

      {/* MTD Performance Overview */}
      <Text style={styles.groupTitle}>MTD Performance Overview</Text>
      <View style={styles.mtdRow}>
        <Card style={styles.mtdCard}>
          <RadialGauge pct={ring.pct} size={104} label={ring.label} />
        </Card>

        <Card style={styles.mtdCard}>
          <Text style={styles.attendanceTitle}>Attendance</Text>
          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceCell}>
              <Text style={[styles.attendanceNum, { color: theme.colors.emerald }]}>{attendance.present}</Text>
              <Text style={styles.attendanceLabel}>Present</Text>
            </View>
            <View style={styles.attendanceCell}>
              <Text style={[styles.attendanceNum, { color: theme.colors.red }]}>{attendance.absent}</Text>
              <Text style={styles.attendanceLabel}>Absent</Text>
            </View>
            <View style={styles.attendanceCell}>
              <Text style={[styles.attendanceNum, { color: theme.colors.amber }]}>{attendance.late}</Text>
              <Text style={styles.attendanceLabel}>Late</Text>
            </View>
            <View style={styles.attendanceCell}>
              <Text style={[styles.attendanceNum, { color: theme.colors.primary }]}>{attendance.halfDay}</Text>
              <Text style={styles.attendanceLabel}>Half-day</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Sales / Lead Activity Chart */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{isPipeline ? 'LEAD ACTIVITY' : 'SALES ACTIVITY'}</Text>
        <View style={styles.filterRow}>
          {RANGE_OPTIONS.map((opt) => {
            const active = opt.id === range;
            return (
              <Pressable key={opt.id} onPress={() => setRange(opt.id)} style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <MiniBarChart data={chartData} valuePrefix={isPipeline ? '₦' : '₦'} />
      </Card>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { gap: theme.spacing.md },
  greetingBlock: { gap: 2 },
  greetingTitle: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.darkText },
  greetingSub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  perfRow: { gap: 4 },
  perfRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perfLabel: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkText },
  perfValue: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.primaryLight },
  track: { height: 6, backgroundColor: theme.colors.darkBorder, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
  groupTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: theme.spacing.xs },
  mtdRow: { flexDirection: 'row', gap: theme.spacing.sm },
  mtdCard: { flex: 1, backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, alignItems: 'center', gap: theme.spacing.sm },
  attendanceTitle: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.darkText, alignSelf: 'flex-start' },
  attendanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  attendanceCell: { width: '45%', alignItems: 'center', gap: 2 },
  attendanceNum: { fontFamily: theme.fonts.display, fontSize: 18 },
  attendanceLabel: { fontFamily: theme.fonts.regular, fontSize: 10, color: theme.colors.darkMuted },
  filterRow: { flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterChipText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkMuted },
  filterChipTextActive: { color: '#FFFFFF', fontFamily: theme.fonts.bold },
});
