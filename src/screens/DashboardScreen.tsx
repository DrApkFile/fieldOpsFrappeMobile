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
import { Icon } from '../components/Icon';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useFieldStore } from '../store/useFieldStore';
import { mockUser, mockCampaigns } from '../services/mockService';
import { RouteName, Campaign } from '../types';

interface DashboardScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  activeCampaign?: Campaign;
  onSelectCampaign?: (c: Campaign) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  activeCampaign,
  onSelectCampaign,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state } = useFieldStore();
  const [currentCampaign, setCurrentCampaign] = useState<Campaign>(
    activeCampaign || state.activeCampaign || mockCampaigns[0]
  );
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const handleSwitchCampaign = (c: Campaign) => {
    setCurrentCampaign(c);
    if (onSelectCampaign) onSelectCampaign(c);
    setShowSwitchModal(false);
  };

  // Dynamic CTA: outlets campaign → go to outlets, leads campaign → go to leads
  const ctaIsOutlets = currentCampaign.ctaType === 'outlets';

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

          <Pressable onPress={() => onNavigate('notifications')} style={styles.notificationBellBtn}>
            <Icon name="bell" size={20} color={theme.colors.textDark} />
            <View style={styles.unreadDot} />
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
          </View>
        </Card>

        {/* ── Hero Banner ──────────────────────────────────────────── */}
        <Card style={styles.heroBannerCard}>
          <Text style={styles.heroKicker}>TODAY</Text>
          <Text style={styles.heroMainTitle}>You're on the field</Text>

          <Pressable
            onPress={() => onNavigate(ctaIsOutlets ? 'outlets' : 'leads')}
            style={styles.heroCtaBtn}
          >
            <Icon name={ctaIsOutlets ? 'store' : 'users'} size={16} color="#FFFFFF" />
            <Text style={styles.heroCtaText}>
              {ctaIsOutlets ? 'Go to outlets →' : 'Go to leads →'}
            </Text>
          </Pressable>
        </Card>

        {/* ── Stat Cards ───────────────────────────────────────────── */}
        <View style={styles.statCardsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Icon name="users" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.statNum}>{state.outlets.filter(o => o.status === 'visited').length || mockUser.rank}</Text>
            <Text style={styles.statLabel}>LEADS</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: theme.colors.tealLight }]}>
              <Icon name="trending-up" size={18} color={theme.colors.teal} />
            </View>
            <Text style={styles.statNum}>{state.sales.length}</Text>
            <Text style={styles.statLabel}>NEW TODAY</Text>
          </Card>
        </View>

        {/* ── Pipeline Progress ─────────────────────────────────────── */}
        <View style={styles.pipelineHeader}>
          <Text style={styles.pipelineTitle}>PIPELINE PROGRESS</Text>
          <Text style={styles.pipelineVal}>{currentCampaign.progress}%</Text>
        </View>

        <View style={styles.pipelineTrack}>
          <View style={[styles.pipelineFill, { width: `${currentCampaign.progress}%` }]} />
        </View>
        <Text style={styles.pipelineSub}>{currentCampaign.target} • Campaign target.</Text>

        {/* ── Main Actions Grid ─────────────────────────────────────── */}
        <View style={styles.gridSectionHeader}>
          <Text style={styles.gridSectionTitle}>MAIN ACTIONS</Text>
        </View>

        <View style={styles.actionsGrid}>
          <Pressable onPress={() => onNavigate('leads')} style={styles.gridTile}>
            <View style={styles.tileIconBox}>
              <Icon name="users" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.tileLabel}>Leads</Text>
          </Pressable>

          <Pressable onPress={() => onNavigate('outlets')} style={styles.gridTile}>
            <View style={[styles.tileIconBox, { backgroundColor: theme.colors.tintTeal }]}>
              <Icon name="store" size={20} color={theme.colors.tintTealIcon} />
            </View>
            <Text style={styles.tileLabel}>Outlets</Text>
          </Pressable>

          <Pressable onPress={() => onNavigate('surveys')} style={styles.gridTile}>
            <View style={[styles.tileIconBox, { backgroundColor: theme.colors.tintBeige }]}>
              <Icon name="clipboard-list" size={20} color={theme.colors.tintBeigeIcon} />
            </View>
            <Text style={styles.tileLabel}>Surveys</Text>
          </Pressable>

          <Pressable onPress={() => onNavigate('inventory')} style={styles.gridTile}>
            <View style={[styles.tileIconBox, { backgroundColor: theme.colors.tintMint }]}>
              <Icon name="package" size={20} color={theme.colors.tintMintIcon} />
            </View>
            <Text style={styles.tileLabel}>Stock</Text>
          </Pressable>

          <Pressable onPress={() => onNavigate('sync')} style={styles.gridTile}>
            <View style={[styles.tileIconBox, { backgroundColor: theme.colors.tintBlue }]}>
              <Icon name="refresh" size={20} color={theme.colors.tintBlueIcon} />
            </View>
            <Text style={styles.tileLabel}>Sync</Text>
          </Pressable>

          <Pressable onPress={() => onNavigate('eodSummary')} style={styles.gridTile}>
            <View style={[styles.tileIconBox, { backgroundColor: theme.colors.tintPeach }]}>
              <Icon name="clock" size={20} color={theme.colors.tintPeachIcon} />
            </View>
            <Text style={styles.tileLabel}>EOD</Text>
          </Pressable>
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
                  onPress={() => handleSwitchCampaign(c)}
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
                    color={c.id === currentCampaign.id ? theme.colors.primary : theme.colors.textMuted}
                  />
                </Pressable>
              ))}

              <Button title="Close" onPress={() => setShowSwitchModal(false)} variant="ghost" style={{ marginTop: 8 }} />
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
  notificationBellBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  unreadDot: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 3.5, backgroundColor: theme.colors.red },
  campaignSwitchCard: { backgroundColor: theme.colors.campaignCardBg, borderColor: theme.colors.campaignCardBorder, marginBottom: theme.spacing.md, padding: theme.spacing.md },
  campaignSwitchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flex1: { flex: 1 },
  campaignKicker: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.primaryLight, letterSpacing: 0.8 },
  activeCampaignTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText, marginTop: 2 },
  switchPill: { paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  switchPillText: { fontFamily: theme.fonts.bold, fontSize: 12, color: '#FFFFFF' },
  heroBannerCard: { backgroundColor: '#1E1535', borderColor: '#2D2050', marginBottom: theme.spacing.md, padding: theme.spacing.lg },
  heroKicker: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.primaryLight, letterSpacing: 1 },
  heroMainTitle: { fontFamily: theme.fonts.display, fontSize: 24, color: '#FFFFFF', marginVertical: theme.spacing.xs },
  heroCtaBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.lg, paddingVertical: 10, borderRadius: theme.radius.full, backgroundColor: theme.colors.primary, marginTop: theme.spacing.xs },
  heroCtaText: { fontFamily: theme.fonts.bold, fontSize: 13, color: '#FFFFFF' },
  statCardsRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  statCard: { flex: 1, padding: theme.spacing.md, gap: 4 },
  statIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statNum: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.textDark },
  statLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.textMuted, letterSpacing: 0.8 },
  pipelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.xs },
  pipelineTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  pipelineVal: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.textDark },
  pipelineTrack: { height: 5, backgroundColor: theme.colors.cardBorder, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  pipelineFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
  pipelineSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 6, marginBottom: theme.spacing.md },
  gridSectionHeader: { marginBottom: theme.spacing.sm },
  gridSectionTitle: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.textMuted, letterSpacing: 0.8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  gridTile: { width: '30%', aspectRatio: 1, borderRadius: theme.radius.xl, backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: 'center', justifyContent: 'center', gap: 8, ...theme.shadows.sm },
  tileIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.textDark },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.colors.cardWhite, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.xl, gap: theme.spacing.md, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: theme.colors.cardBorder, borderRadius: 2, alignSelf: 'center', marginBottom: theme.spacing.sm },
  modalTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark },
  modalSub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.cardBorder, gap: theme.spacing.sm },
  campaignDot: { width: 10, height: 10, borderRadius: 5 },
  activeOption: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryBg },
  optionName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  optionSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});
