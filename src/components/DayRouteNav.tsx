import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icon';
import { RouteAssignment } from '../types';

interface DayRouteNavProps {
  selectedDate: string; // ISO yyyy-mm-dd
  onSelectDate: (date: string) => void;
  assignments: RouteAssignment[];
}

const toIso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (iso: string, days: number) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toIso(d);
};
const dayLabel = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
const dayNum = (iso: string) => new Date(iso + 'T00:00:00').getDate();
const monthDayLabel = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

export const DayRouteNav: React.FC<DayRouteNavProps> = ({ selectedDate, onSelectDate, assignments }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const todayIso = toIso(new Date());
  const isToday = selectedDate === todayIso;

  const strip = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3));

  const hasAssignment = (iso: string) => assignments.some((a) => a.date === iso);
  const assignmentForSelected = assignments.find((a) => a.date === selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => onSelectDate(addDays(selectedDate, -1))} style={styles.navBtn}>
          <Icon name="chevron-left" size={18} color={theme.colors.darkText} />
        </Pressable>

        <Pressable onPress={() => onSelectDate(todayIso)} style={styles.todayWrap}>
          <Text style={styles.todayLabel}>{isToday ? 'Today' : monthDayLabel(selectedDate)}</Text>
          {assignmentForSelected ? (
            <Text style={styles.routeLabel}>{assignmentForSelected.routeName}</Text>
          ) : (
            <Text style={styles.routeLabelMuted}>No route assigned</Text>
          )}
        </Pressable>

        <Pressable onPress={() => onSelectDate(addDays(selectedDate, 1))} style={styles.navBtn}>
          <Icon name="chevron-right" size={18} color={theme.colors.darkText} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripRow}>
        {strip.map((iso) => {
          const isSelected = iso === selectedDate;
          return (
            <Pressable
              key={iso}
              onPress={() => onSelectDate(iso)}
              style={[styles.dayPill, isSelected && styles.dayPillSelected]}
            >
              <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>{dayLabel(iso)}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayTextSelected]}>{dayNum(iso)}</Text>
              {hasAssignment(iso) && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { gap: theme.spacing.sm, marginBottom: theme.spacing.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  todayWrap: { alignItems: 'center', flex: 1 },
  todayLabel: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText, letterSpacing: 0.5 },
  routeLabel: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.primaryLight, marginTop: 1 },
  routeLabelMuted: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted, marginTop: 1 },
  stripRow: { flexDirection: 'row', gap: theme.spacing.sm },
  dayPill: {
    width: 52, paddingVertical: 10, borderRadius: theme.radius.lg,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder,
  },
  dayPillSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dayName: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.darkMuted },
  dayNum: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.darkText },
  dayTextSelected: { color: '#FFFFFF' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.primaryLight, marginTop: 1 },
  dotSelected: { backgroundColor: '#FFFFFF' },
});
