import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChartPoint } from '../utils/dashboardMetrics';

interface MiniBarChartProps {
  data: ChartPoint[];
  valuePrefix?: string;
}

const BAR_MAX_HEIGHT = 100;
const BAR_WIDTH = 28;

export const MiniBarChart: React.FC<MiniBarChartProps> = ({ data, valuePrefix = '' }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (data.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No activity in this range yet.</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {data.map((point, idx) => {
        const barHeight = Math.max(4, (point.value / maxValue) * BAR_MAX_HEIGHT);
        return (
          <View key={idx} style={styles.barCol}>
            <Text style={styles.valueText} numberOfLines={1}>
              {valuePrefix}{point.value >= 1000 ? `${Math.round(point.value / 1000)}k` : Math.round(point.value)}
            </Text>
            <View style={styles.trackArea}>
              <View style={[styles.bar, { height: barHeight }]} />
            </View>
            <Text style={styles.dateLabel}>{point.label}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.md, paddingHorizontal: theme.spacing.xs },
  barCol: { alignItems: 'center', width: BAR_WIDTH + 10 },
  valueText: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.textMuted, marginBottom: 4 },
  trackArea: { height: BAR_MAX_HEIGHT, justifyContent: 'flex-end' },
  bar: { width: BAR_WIDTH, borderRadius: 6, backgroundColor: theme.colors.navy },
  dateLabel: { fontFamily: theme.fonts.regular, fontSize: 10, color: theme.colors.textMuted, marginTop: 6 },
  emptyBox: { paddingVertical: theme.spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
});
