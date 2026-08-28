import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Icon, IconName } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { mockAttendanceRecords } from '../services/mockService';
import { RouteName } from '../types';

interface SyncScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

interface DataSet {
  id: string;
  label: string;
  icon: IconName;
  total: number;
  pending: number;
}

export const SyncScreen: React.FC<SyncScreenProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state } = useFieldStore();
  const [online, setOnline] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const surveyDraftsPending = state.surveys.filter((s) => s.isDraft).length;
  const warehouseCount = new Set(state.products.map((p) => p.warehouse)).size;
  const beatCount = new Set(state.outlets.map((o) => o.area)).size;

  const dataSets: DataSet[] = [
    { id: 'surveys', label: 'Surveys & Forms', icon: 'clipboard-list', total: state.surveys.length, pending: surveyDraftsPending },
    { id: 'sales', label: 'Sales Data', icon: 'target', total: state.sales.length, pending: 0 },
    { id: 'movements', label: 'Stock Movements', icon: 'trending-up', total: state.sales.length + state.orders.length, pending: 0 },
    { id: 'drafts', label: 'Local Drafts', icon: 'edit', total: state.drafts.length, pending: state.drafts.length },
    { id: 'user', label: 'User Info', icon: 'user', total: 1, pending: 0 },
    { id: 'company', label: 'Company Info', icon: 'building', total: 1, pending: 0 },
    { id: 'reports', label: 'Reports', icon: 'file-text', total: 5, pending: 0 },
    { id: 'warehouses', label: 'Mapped Warehouses', icon: 'map-pin', total: warehouseCount, pending: 0 },
    { id: 'beats', label: 'BEATS', icon: 'compass', total: beatCount, pending: 0 },
    { id: 'products', label: 'Products', icon: 'package', total: state.products.length, pending: 0 },
    { id: 'inventory', label: 'Inventory', icon: 'layers', total: state.products.length, pending: 0 },
    { id: 'pricing', label: 'Pricing', icon: 'tag', total: state.products.length, pending: 0 },
    { id: 'attendance', label: 'Attendance', icon: 'users', total: mockAttendanceRecords.length, pending: 0 },
    { id: 'eod', label: 'End Of Day', icon: 'check-circle', total: 1, pending: 0 },
  ];

  const pendingTotal = dataSets.reduce((sum, d) => sum + d.pending, 0);
  const done = !syncingAll && pendingTotal === 0;
  const progressPct = online && done ? 100 : Math.max(15, 100 - pendingTotal * 12);

  const runSync = (id: string) => {
    if (!online) return;
    setSyncingId(id);
    setTimeout(() => setSyncingId((cur) => (cur === id ? null : cur)), 700);
  };

  const handleSyncAll = () => {
    if (!online || pendingTotal === 0) return;
    setSyncingAll(true);
    setTimeout(() => setSyncingAll(false), 900);
  };

  const heroIcon: IconName = !online ? 'wifi' : done ? 'check-circle' : 'refresh';
  const heroTint = !online ? theme.colors.amber : done ? theme.colors.emerald : theme.colors.navy;
  const heroBg = !online ? theme.colors.amberLight : done ? theme.colors.emeraldLight : theme.colors.tintTeal;
  const heroText = !online
    ? `Offline · ${pendingTotal} queued`
    : syncingAll
    ? 'Syncing…'
    : done
    ? 'All up to date'
    : `${pendingTotal} item${pendingTotal === 1 ? '' : 's'} pending`;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Synchronization" subtitle="Offline queue and server upload" onNavigate={onNavigate} onBackPress={() => onNavigate('home')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={[styles.heroIconBox, { backgroundColor: heroBg }]}>
            <Icon name={heroIcon} size={30} color={heroTint} />
          </View>
          <Text style={styles.heroText}>{heroText}</Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>

          <Pressable
            onPress={handleSyncAll}
            disabled={syncingAll || !online || pendingTotal === 0}
            style={[styles.syncAllBtn, (syncingAll || !online || pendingTotal === 0) && styles.syncAllBtnDisabled]}
          >
            <Text style={styles.syncAllBtnText}>{syncingAll ? 'Please wait' : 'Sync all'}</Text>
          </Pressable>

          <Pressable onPress={() => setOnline((v) => !v)} style={styles.offlineToggle}>
            <Icon name="wifi" size={16} color={theme.colors.textDark} />
            <Text style={styles.offlineToggleText}>{online ? 'Simulate going offline' : 'Restore connectivity'}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>DATA SETS</Text>
        <View style={styles.list}>
          {dataSets.map((ds) => {
            const isSyncing = syncingId === ds.id;
            const hasPending = ds.pending > 0;
            return (
              <View key={ds.id} style={styles.dsCard}>
                <View style={styles.dsRow}>
                  <View style={styles.dsIconBox}>
                    <Icon name={ds.icon} size={16} color={theme.colors.navy} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.dsLabel}>{ds.label}</Text>
                    <Text style={styles.dsMeta}>{ds.total} records · {ds.pending} pending</Text>
                  </View>
                  <Pressable
                    onPress={() => runSync(ds.id)}
                    disabled={isSyncing || (!hasPending && ds.id !== 'sales')}
                    style={styles.dsRefreshBtn}
                  >
                    <Icon name="refresh" size={15} color={isSyncing ? theme.colors.navy : theme.colors.textMuted} />
                  </Pressable>
                </View>
                <View style={[styles.dsBar, hasPending ? styles.dsBarPending : styles.dsBarDone]}>
                  <View style={[styles.dsBarFill, hasPending ? styles.dsBarFillPending : styles.dsBarFillDone, isSyncing && styles.dsBarFillSyncing]} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  scroll: { padding: theme.spacing.lg, paddingBottom: 60, gap: theme.spacing.lg },
  flex1: { flex: 1 },

  heroCard: {
    backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.xl, padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.sm,
  },
  heroIconBox: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  heroText: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.textDark, marginTop: 4 },
  progressTrack: { width: '100%', height: 8, borderRadius: 4, backgroundColor: theme.colors.fieldFill, overflow: 'hidden', marginTop: theme.spacing.sm },
  progressFill: { height: '100%', backgroundColor: theme.colors.navy, borderRadius: 4 },
  syncAllBtn: {
    marginTop: theme.spacing.md, height: 48, paddingHorizontal: theme.spacing.xl, borderRadius: theme.radius.full,
    backgroundColor: theme.colors.navy, alignItems: 'center', justifyContent: 'center',
  },
  syncAllBtnDisabled: { backgroundColor: theme.colors.fieldFill },
  syncAllBtnText: { fontFamily: theme.fonts.bold, fontSize: 14, color: '#FFFFFF' },
  offlineToggle: {
    marginTop: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 44, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radius.full,
    backgroundColor: theme.colors.fieldFill, borderWidth: 1, borderColor: theme.colors.fieldBorder,
  },
  offlineToggleText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.textDark },

  sectionLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  list: { gap: theme.spacing.sm, marginTop: -theme.spacing.sm },
  dsCard: {
    backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg, padding: theme.spacing.md,
  },
  dsRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  dsIconBox: { width: 34, height: 34, borderRadius: theme.radius.sm, backgroundColor: theme.colors.tintTeal, alignItems: 'center', justifyContent: 'center' },
  dsLabel: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  dsMeta: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  dsRefreshBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.fieldFill, alignItems: 'center', justifyContent: 'center' },
  dsBar: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: theme.spacing.sm },
  dsBarPending: { backgroundColor: theme.colors.amberLight },
  dsBarDone: { backgroundColor: theme.colors.emeraldLight },
  dsBarFill: { height: '100%', width: '100%', borderRadius: 3 },
  dsBarFillPending: { backgroundColor: theme.colors.amber },
  dsBarFillDone: { backgroundColor: theme.colors.emerald },
  dsBarFillSyncing: { backgroundColor: theme.colors.navy },
});
