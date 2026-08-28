import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon, IconName } from '../components/Icon';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RadialGauge } from '../components/RadialGauge';
import { useFieldStore } from '../store/useFieldStore';
import { mockUser, mockCampaigns, mockAttendanceRecords } from '../services/mockService';
import { getMtdRingPct, getAttendanceBreakdown, DashboardContext } from '../utils/dashboardMetrics';
import { RouteName, Campaign } from '../types';

interface DashboardScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  // Reads/writes the shared store directly so every screen (Attendance,
  // Outlet Activity's module gating) sees the same active campaign.
  const { state, dispatch } = useFieldStore();
  const currentCampaign: Campaign = state.activeCampaign || mockCampaigns[0];
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [pendingCampaign, setPendingCampaign] = useState<Campaign | null>(null);

  const handleSelectCampaign = (c: Campaign) => {
    if (c.id === currentCampaign.id) {
      setShowSwitchModal(false);
      return;
    }
    // Switching re-scopes the dashboard, outlet activities, KPIs and tasks —
    // confirm before committing, matching the "new ui" reference flow.
    setShowSwitchModal(false);
    setPendingCampaign(c);
  };

  const confirmSwitchCampaign = () => {
    if (!pendingCampaign) return;
    dispatch({ type: 'SET_ACTIVE_CAMPAIGN', campaign: pendingCampaign });
    setPendingCampaign(null);
  };

  const nextStopOutlet = state.outlets.find((o) => o.status === 'pending');
  const todaySalesTotal = state.sales.reduce((sum, s) => sum + s.total, 0);

  const mtdCtx: DashboardContext = {
    campaign: currentCampaign,
    leads: [],
    outlets: state.outlets,
    sales: state.sales,
    orders: state.orders,
    surveys: state.surveys,
    products: state.products,
    photoCaptures: state.photoCaptures,
    drafts: state.drafts,
    attendance: mockAttendanceRecords,
  };
  const ring = getMtdRingPct(mtdCtx);
  const attendance = getAttendanceBreakdown(mockAttendanceRecords);

  // Quick Access is campaign-driven, same as the outlet activity FAB: a
  // leads/pipeline campaign surfaces Leads + Pipeline, an outlet/execution
  // campaign surfaces Customers (+ Orders when the campaign has the orders
  // module). Dashboard always shows. Each of the 3 demo campaigns is
  // configured to exercise a different combination on purpose.
  const isLeadsCampaign = currentCampaign.ctaType === 'leads';
  const hasOrders = !!currentCampaign.modules?.includes('orders');

  const quickAccessItems: { icon: IconName; tint: string; iconColor: string; title: string; subtitle: string; route: RouteName; badge?: number }[] = [
    ...(!isLeadsCampaign ? [{ icon: 'store' as IconName, tint: theme.colors.tintTeal, iconColor: theme.colors.tintTealIcon, title: 'Customers', subtitle: 'Manage outlets', route: 'outlets' as RouteName }] : []),
    ...(isLeadsCampaign ? [{ icon: 'users' as IconName, tint: theme.colors.primaryBg, iconColor: theme.colors.primary, title: 'Leads', subtitle: 'Pipeline', route: 'leads' as RouteName }] : []),
    ...(isLeadsCampaign ? [{ icon: 'trending-up' as IconName, tint: theme.colors.tintPurple, iconColor: theme.colors.tintPurpleIcon, title: 'Pipeline', subtitle: 'Stages', route: 'pipelineOverview' as RouteName }] : []),
    ...(!isLeadsCampaign && hasOrders ? [{ icon: 'package' as IconName, tint: theme.colors.tintMint, iconColor: theme.colors.tintMintIcon, title: 'Orders', subtitle: 'Track orders', route: 'ordersList' as RouteName }] : []),
    { icon: 'bar-chart', tint: theme.colors.tintGold, iconColor: theme.colors.tintGoldIcon, title: 'Dashboard', subtitle: 'Full performance report', route: 'dashboard' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Top Header ───────────────────────────────────────────── */}
        <View style={styles.topHeader}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.greetingTitle}>Hi, {mockUser.name.split(' ')[0]}</Text>
            <Text style={styles.greetingSub} numberOfLines={1}>
              {currentCampaign.name} • {mockUser.territory}
            </Text>
          </View>

          <Pressable onPress={() => onNavigate('sync')} style={styles.syncBtn}>
            <Icon name="refresh" size={16} color={theme.colors.navy} />
            <Text style={styles.syncBtnText}>Sync</Text>
          </Pressable>
        </View>

        {/* ── Campaign Switcher Card ────────────────────────────────── */}
        <Card style={styles.campaignSwitchCard}>
          <View style={styles.campaignSwitchRow}>
            <View style={styles.flex1}>
              <Text style={styles.campaignKicker}>ACTIVE CAMPAIGN</Text>
              <Text style={styles.activeCampaignTitle}>{currentCampaign.name}</Text>
            </View>
            <Pressable onPress={() => setShowSwitchModal(true)} style={styles.switchPill}>
              <Text style={styles.switchPillText}>Switch ↕</Text>
            </Pressable>
            <View style={styles.activeCountBadge}>
              <Text style={styles.activeCountNum}>{mockCampaigns.length}</Text>
              <Text style={styles.activeCountLabel}>ACTIVE</Text>
            </View>
          </View>
        </Card>

        {/* ── Next Stop Hero Card ──────────────────────────────────── */}
        {nextStopOutlet && (
          <Card style={styles.nextStopCard}>
            <Text style={styles.nextStopKicker}>▸ NEXT STOP</Text>
            <Text style={styles.nextStopName} numberOfLines={1}>{nextStopOutlet.name}</Text>
            {nextStopOutlet.distance ? (
              <Text style={styles.nextStopMeta}>{nextStopOutlet.distance} away</Text>
            ) : null}
            <View style={styles.nextStopBottomRow}>
              <Button
                title="Start Visit"
                onPress={() => onNavigate('outletDetail', { outletId: nextStopOutlet.id })}
                variant="accent"
                size="small"
                style={styles.startVisitBtn}
              />
              <View style={styles.nextStopSalesCol}>
                <Text style={styles.nextStopSalesValue}>₦{todaySalesTotal.toLocaleString()}</Text>
                <Text style={styles.nextStopSalesLabel}>sales today</Text>
              </View>
            </View>
          </Card>
        )}

        {/* ── MTD Performance ──────────────────────────────────────── */}
        <Text style={styles.groupTitle}>MTD PERFORMANCE</Text>
        <View style={styles.mtdRow}>
          <Card style={styles.mtdCard}>
            <RadialGauge pct={ring.pct} size={100} label={ring.label} />
          </Card>

          <Card style={styles.mtdCard}>
            <Text style={styles.attendanceTitle}>Attendance</Text>
            <View style={styles.attendanceList}>
              <View style={styles.attendanceRow}>
                <Text style={styles.attendanceLabel}>Present</Text>
                <Text style={[styles.attendanceNum, { color: theme.colors.emerald }]}>{attendance.present}</Text>
              </View>
              <View style={styles.attendanceRow}>
                <Text style={styles.attendanceLabel}>Absent</Text>
                <Text style={[styles.attendanceNum, { color: theme.colors.red }]}>{attendance.absent}</Text>
              </View>
              <View style={styles.attendanceRow}>
                <Text style={styles.attendanceLabel}>Late</Text>
                <Text style={[styles.attendanceNum, { color: theme.colors.amber }]}>{attendance.late}</Text>
              </View>
              <View style={styles.attendanceRow}>
                <Text style={styles.attendanceLabel}>Half-day</Text>
                <Text style={[styles.attendanceNum, { color: theme.colors.navy }]}>{attendance.halfDay}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* ── Quick Access ─────────────────────────────────────────── */}
        <Text style={styles.groupTitle}>QUICK ACCESS</Text>
        <View style={styles.quickAccessList}>
          {quickAccessItems.map((item) => (
            <Pressable key={item.route} onPress={() => onNavigate(item.route)} style={styles.quickAccessRow}>
              <View style={[styles.quickAccessIconBox, { backgroundColor: item.tint }]}>
                <Icon name={item.icon} size={20} color={item.iconColor} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.quickAccessTitle}>{item.title}</Text>
                <Text style={styles.quickAccessSubtitle}>{item.subtitle}</Text>
              </View>
              {!!item.badge && (
                <View style={styles.quickAccessBadge}>
                  <Text style={styles.quickAccessBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Icon name="chevron-right" size={18} color={theme.colors.textMuted} />
            </Pressable>
          ))}
        </View>

        {/* ── Campaign Switch Modal ─────────────────────────────────── */}
        <Modal visible={showSwitchModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.sheetHandle} />
              <Text style={styles.modalTitle}>Switch Campaign Drive</Text>
              <Text style={styles.modalSub}>Select active campaign to update assigned target drive:</Text>

              {mockCampaigns.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => handleSelectCampaign(c)}
                  style={[styles.modalOption, c.id === currentCampaign.id ? styles.activeOption : undefined]}
                >
                  <View style={[styles.campaignDot, { backgroundColor: c.color }]} />
                  <View style={styles.flex1}>
                    <Text style={styles.optionName}>{c.name}</Text>
                    <Text style={styles.optionSub}>{c.beat} • {c.type}</Text>
                  </View>
                  <Icon
                    name={c.id === currentCampaign.id ? 'check-circle' : 'circle'}
                    size={20}
                    color={c.id === currentCampaign.id ? theme.colors.navy : theme.colors.textMuted}
                  />
                </Pressable>
              ))}

              <Button title="Close" onPress={() => setShowSwitchModal(false)} variant="ghost" style={{ marginTop: 8 }} />
            </View>
          </View>
        </Modal>

        {/* Switch Campaign Confirmation — matches the "new ui" reference flow:
            switching re-scopes the dashboard, outlet activities, KPIs and tasks,
            so it's confirmed before committing rather than switching instantly. */}
        <Modal visible={!!pendingCampaign} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.sheetHandle} />
              <Text style={styles.modalTitle}>Do you want to switch campaign?</Text>
              <Text style={styles.modalSub}>
                {pendingCampaign
                  ? `You're moving from "${currentCampaign.name}" to "${pendingCampaign.name}". Your dashboard, outlet activities, KPIs and assigned tasks will refresh.`
                  : ''}
              </Text>

              <View style={styles.confirmRow}>
                <Button title="Cancel" onPress={() => setPendingCampaign(null)} variant="outline" style={styles.flex1} />
                <Button title="Switch Campaign" onPress={confirmSwitchCampaign} variant="navy" style={styles.flex1} />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.safeTopPadding + 8, paddingBottom: 110 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  headerTextGroup: { flex: 1 },
  greetingTitle: { fontFamily: theme.fonts.display, fontSize: 26, color: theme.colors.textDark, letterSpacing: -0.5 },
  greetingSub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, marginTop: 1 },
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: theme.spacing.md, height: 38, borderRadius: theme.radius.full,
    backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder,
  },
  syncBtnText: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.navy },
  campaignSwitchCard: { backgroundColor: theme.colors.campaignCardBg, borderColor: theme.colors.campaignCardBorder, marginBottom: theme.spacing.md, padding: theme.spacing.md },
  campaignSwitchRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  flex1: { flex: 1 },
  campaignKicker: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.navy, letterSpacing: 0.8 },
  activeCampaignTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark, marginTop: 2 },
  switchPill: { paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.fieldFill },
  switchPillText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.navy },
  activeCountBadge: { backgroundColor: theme.colors.navy, borderRadius: theme.radius.md, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  activeCountNum: { fontFamily: theme.fonts.display, fontSize: 16, color: '#FFFFFF' },
  activeCountLabel: { fontFamily: theme.fonts.bold, fontSize: 8, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5 },
  nextStopCard: { backgroundColor: theme.colors.navy, borderColor: theme.colors.navy, marginBottom: theme.spacing.md, padding: theme.spacing.lg },
  nextStopKicker: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.accent, letterSpacing: 1 },
  nextStopName: { fontFamily: theme.fonts.display, fontSize: 21, color: '#FFFFFF', marginTop: 4 },
  nextStopMeta: { fontFamily: theme.fonts.semibold, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  nextStopBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.md },
  startVisitBtn: { paddingHorizontal: theme.spacing.xl },
  nextStopSalesCol: { alignItems: 'flex-end' },
  nextStopSalesValue: { fontFamily: theme.fonts.display, fontSize: 17, color: '#FFFFFF' },
  nextStopSalesLabel: { fontFamily: theme.fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  groupTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8, marginTop: theme.spacing.sm, marginBottom: theme.spacing.sm },
  mtdRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  mtdCard: { flex: 1, alignItems: 'center', gap: theme.spacing.sm },
  attendanceTitle: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.textDark, alignSelf: 'flex-start' },
  attendanceList: { width: '100%', gap: 6 },
  attendanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendanceLabel: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  attendanceNum: { fontFamily: theme.fonts.bold, fontSize: 14 },
  quickAccessList: { gap: theme.spacing.sm },
  quickAccessRow: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg, padding: theme.spacing.md, ...theme.shadows.sm,
  },
  quickAccessIconBox: { width: 44, height: 44, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  quickAccessTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  quickAccessSubtitle: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  quickAccessBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: theme.colors.red, alignItems: 'center', justifyContent: 'center' },
  quickAccessBadgeText: { fontFamily: theme.fonts.bold, fontSize: 11, color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.colors.cardWhite, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.xl, gap: theme.spacing.md, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: theme.colors.cardBorder, borderRadius: 2, alignSelf: 'center', marginBottom: theme.spacing.sm },
  modalTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark },
  modalSub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
  confirmRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: 8 },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.cardBorder, gap: theme.spacing.sm },
  campaignDot: { width: 10, height: 10, borderRadius: 5 },
  activeOption: { borderColor: theme.colors.navy, backgroundColor: theme.colors.fieldFill },
  optionName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  optionSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});
