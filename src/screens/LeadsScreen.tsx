import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { DayRouteNav } from '../components/DayRouteNav';
import { mockLeads, mockRouteAssignments } from '../services/mockService';
import { getInitials, getStageColor, formatShortDate } from '../utils/leadDisplay';
import { formatCompactNaira, parseLeadValue } from '../utils/pipelineMetrics';
import { RouteName, Lead } from '../types';

interface LeadsScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadsList?: Lead[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

type FilterId = 'all' | 'hot' | 'warm' | 'converted';
const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hot', label: 'Hot' },
  { id: 'warm', label: 'Warm' },
  { id: 'converted', label: 'Converted' },
];

export const LeadsScreen: React.FC<LeadsScreenProps> = ({ onNavigate, leadsList = mockLeads }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

  const assignment = mockRouteAssignments.find((a) => a.date === selectedDate);
  // No assignment for this date yet in the mock window — show the full list rather than an empty screen.
  const dateFiltered = assignment ? leadsList.filter((l) => assignment.leadIds.includes(l.id)) : leadsList;

  const query = search.trim().toLowerCase();
  const searched = query
    ? dateFiltered.filter((l) =>
        l.name.toLowerCase().includes(query) ||
        l.company.toLowerCase().includes(query) ||
        l.stage.toLowerCase().includes(query)
      )
    : dateFiltered;

  const visibleLeads = searched.filter((l) => {
    if (filter === 'hot') return l.score >= 70;
    if (filter === 'warm') return l.score >= 40 && l.score < 70;
    if (filter === 'converted') return l.stage === 'Converted';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Leads"
        subtitle={`${leadsList.length} in pipeline`}
        onNavigate={onNavigate}
        onSubtitlePress={() => onNavigate('pipelineOverview')}
        rightAction={
          <Pressable onPress={() => onNavigate('leadForm')} style={styles.addBtn}>
            <Icon name="user-plus" size={18} color="#FFFFFF" />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DayRouteNav selectedDate={selectedDate} onSelectDate={setSelectedDate} assignments={mockRouteAssignments} />

        <View style={styles.searchBox}>
          <Icon name="search" size={16} color={theme.colors.darkMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, outlet, stage..."
            placeholderTextColor={theme.colors.darkMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f.id === filter;
            return (
              <Pressable key={f.id} onPress={() => setFilter(f.id)} style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Lead List Cards */}
        {visibleLeads.length === 0 && (
          <Text style={styles.emptyText}>No leads match this view.</Text>
        )}
        {visibleLeads.map((lead) => {
          const stageColor = getStageColor(lead.stage, theme);
          return (
            <Card key={lead.id} style={styles.leadCard} onPress={() => onNavigate('leadDetail', lead)}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(lead.name)}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.leadName}>{lead.name}</Text>
                  <Text style={styles.leadCompany}>{lead.company}</Text>
                  <Text style={[styles.leadStage, { color: stageColor }]}>{lead.stage}</Text>
                </View>
                <View style={styles.rightCol}>
                  <Text style={styles.leadValue}>{formatCompactNaira(parseLeadValue(lead.value))}</Text>
                  <Icon name="chevron-right" size={18} color={theme.colors.darkMuted} />
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.sm },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.md, height: 44,
  },
  searchInput: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkText },
  filterRow: { flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: theme.radius.full, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterChipText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkMuted },
  filterChipTextActive: { color: '#FFFFFF', fontFamily: theme.fonts.bold },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, textAlign: 'center', paddingVertical: theme.spacing.xl },
  leadCard: { gap: theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.primary },
  info: { flex: 1 },
  leadName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  leadCompany: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: 1 },
  leadStage: { fontFamily: theme.fonts.semibold, fontSize: 11, marginTop: 2 },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  leadValue: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
});
