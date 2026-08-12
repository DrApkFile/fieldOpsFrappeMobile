import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { SkipOutletModal } from './SkipOutletModal';
import { OutletActivitySheet } from './OutletActivitySheet';
import { RouteName, SkipRecord } from '../types';

interface OutletDetailScreenProps {
  outletData?: { outletId: string };
  onNavigate: (route: RouteName, data?: any) => void;
}

export const OutletDetailScreen: React.FC<OutletDetailScreenProps> = ({
  outletData,
  onNavigate,
}) => {
  const { state, dispatch, getSalesForOutlet, getOrdersForOutlet, getSurveysForOutlet, getSkipForOutlet } = useFieldStore();
  const outletId = outletData?.outletId || 'o1';
  const outlet = state.outlets.find((o) => o.id === outletId) || state.outlets[0];

  const [showActivitySheet, setShowActivitySheet] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  if (!outlet) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Outlet" subtitle="#O-000" onNavigate={onNavigate} onBackPress={() => onNavigate('outlets')} />
        <View style={styles.missingContainer}>
          <Icon name="alert-circle" size={48} color={theme.colors.red} />
          <Text style={styles.missingTitle}>This outlet no longer exists.</Text>
          <Pressable onPress={() => onNavigate('outlets')} style={styles.returnBtn}>
            <Text style={styles.returnBtnText}>Return to Outlet List</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const activeCampaign = state.activeCampaign;
  const campaignModules = activeCampaign?.modules || ['sales', 'orders', 'surveys', 'merchandising'];
  const hasMerchandising = campaignModules.includes('merchandising');

  // Dynamic Metrics & Records
  const salesList = getSalesForOutlet(outlet.id);
  const ordersList = getOrdersForOutlet(outlet.id);
  const surveysList = getSurveysForOutlet(outlet.id);
  const skipRecord = getSkipForOutlet(outlet.id);

  const handlePhoneCall = () => {
    if (outlet.phone) {
      Linking.openURL(`tel:${outlet.phone}`).catch(() => {
        Alert.alert('Phone Call', `Dialing ${outlet.phone}...`);
      });
    }
  };

  const handleSkipSubmit = (record: SkipRecord) => {
    dispatch({ type: 'SKIP_OUTLET', outletId: outlet.id, skipRecord: record });
  };

  const handleSelectActivityAction = (action: 'sale' | 'order' | 'survey' | 'edit') => {
    switch (action) {
      case 'sale':
        onNavigate('newSale', { outletId: outlet.id });
        break;
      case 'order':
        onNavigate('newOrder', { outletId: outlet.id });
        break;
      case 'survey':
        onNavigate('newSurvey', { outletId: outlet.id });
        break;
      case 'edit':
        onNavigate('editOutlet', { outletId: outlet.id });
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: Back button, Title: Outlet, Subtitle: #<outlet id> - NO edit or notification icon */}
      <Header
        title="Outlet"
        subtitle={`#${outlet.id.toUpperCase()}`}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('outlets')}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* OUTLET IDENTITY CARD (Matching Image 4) */}
        <Card style={styles.identityCard}>
          <View style={styles.identityHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.outletName}>{outlet.name}</Text>
              <Text style={styles.outletSub}>
                {outlet.area} · {outlet.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>

            {/* Visited / Skipped Badge */}
            {outlet.status !== 'pending' && (
              <View
                style={[
                  styles.statusBadge,
                  outlet.status === 'visited' ? styles.visitedBadge : styles.skippedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    outlet.status === 'visited' ? styles.visitedBadgeText : styles.skippedBadgeText,
                  ]}
                >
                  {outlet.status === 'visited' ? 'Visited' : 'Skipped'}
                </Text>
              </View>
            )}
          </View>

          {/* Action Chips Row */}
          <View style={styles.chipsRow}>
            {/* Distance */}
            <View style={styles.chip}>
              <Icon name="map-pin" size={14} color={theme.colors.darkMuted} />
              <Text style={styles.chipText}>{outlet.distance || '2.4 km'}</Text>
            </View>

            {/* Phone (Tappable) */}
            <Pressable onPress={handlePhoneCall} style={styles.chip}>
              <Icon name="phone" size={14} color={theme.colors.darkMuted} />
              <Text style={styles.chipText}>{outlet.phone}</Text>
            </Pressable>

            {/* Outlet Type */}
            <View style={styles.chip}>
              <Icon name="store" size={14} color={theme.colors.darkMuted} />
              <Text style={styles.chipText}>{outlet.type}</Text>
            </View>
          </View>

          {outlet.address ? (
            <Text style={styles.addressText} numberOfLines={2}>
              {outlet.address}
            </Text>
          ) : null}
        </Card>

        {/* OUTLET METRICS (3-Column Layout matching Image 4) */}
        <View style={styles.metricsGrid}>
          {/* Sales Metric */}
          <View style={styles.metricCell}>
            <Text style={styles.metricValue}>{salesList.length}</Text>
            <Text style={styles.metricLabel}>SALES</Text>
          </View>

          {/* Orders Metric */}
          <View style={styles.metricCell}>
            <Text style={styles.metricValue}>{ordersList.length}</Text>
            <Text style={styles.metricLabel}>ORDERS</Text>
          </View>

          {/* Surveys Metric */}
          <View style={styles.metricCell}>
            <Text style={styles.metricValue}>{surveysList.length}</Text>
            <Text style={styles.metricLabel}>SURVEYS</Text>
          </View>
        </View>

        {/* Hint Text */}
        <Text style={styles.hintText}>
          Use the + button to log a sale, order, survey, or edit this outlet. Outlets are marked visited automatically once an activity is completed.
        </Text>

        {/* SKIPPED SUMMARY CARD (If skipped) */}
        {outlet.status === 'skipped' && (
          <Card style={styles.skippedSummaryCard}>
            <View style={styles.skippedSummaryHeader}>
              <Icon name="alert-circle" size={18} color={theme.colors.skippedText} />
              <Text style={styles.skippedSummaryTitle}>Skipped</Text>
            </View>
            <Text style={styles.skippedSummaryText}>
              Reason: {skipRecord?.reason || 'Outlet Closed'}
            </Text>
            {skipRecord?.note ? (
              <Text style={styles.skippedSummaryNote}>Note: {skipRecord.note}</Text>
            ) : null}
            {skipRecord?.timestamp ? (
              <Text style={styles.skippedSummaryTime}>{skipRecord.timestamp}</Text>
            ) : null}
          </Card>
        )}

        {/* RECORDS SECTION */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>RECORDS</Text>

          <View style={styles.recordsGrid}>
            {/* Merchandising (Only if campaign module enabled) */}
            {hasMerchandising && (
              <Pressable
                onPress={() => onNavigate('newSurvey', { outletId: outlet.id, mode: 'merchandising' })}
                style={styles.recordCard}
              >
                <Icon name="package" size={18} color={theme.colors.primaryLight} />
                <Text style={styles.recordCardText}>Merchandising</Text>
              </Pressable>
            )}

            {/* Skip Outlet (Always visible) */}
            <Pressable
              onPress={() => setShowSkipModal(true)}
              style={styles.recordCard}
            >
              <Icon name="x" size={18} color={theme.colors.red} />
              <Text style={styles.recordCardText}>Skip Outlet</Text>
            </Pressable>
          </View>
        </View>

        {/* OUTLET ACTIVITY HISTORY */}
        {/* Sales History */}
        {salesList.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>SALES HISTORY ({salesList.length})</Text>
            {salesList.map((s) => (
              <Card key={s.id} style={styles.historyItemCard}>
                <View style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{s.productName} × {s.quantity}</Text>
                    <Text style={styles.historySub}>Customer: {s.customerName} · {s.timestamp}</Text>
                  </View>
                  <Text style={styles.historyAmount}>₦{s.total.toLocaleString()}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Orders History */}
        {ordersList.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>ORDERS HISTORY ({ordersList.length})</Text>
            {ordersList.map((o) => (
              <Card key={o.id} style={styles.historyItemCard}>
                <View style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{o.productName} × {o.quantity}</Text>
                    <Text style={styles.historySub}>Status: {o.status} · {o.timestamp}</Text>
                  </View>
                  <Text style={styles.historyAmount}>₦{o.total.toLocaleString()}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Surveys History */}
        {surveysList.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>SURVEYS COMPLETED ({surveysList.length})</Text>
            {surveysList.map((sur) => (
              <Card key={sur.id} style={styles.historyItemCard}>
                <View style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>Completed Field Survey</Text>
                    <Text style={styles.historySub}>{sur.answers.length} response items · {sur.timestamp}</Text>
                  </View>
                  <View style={styles.surveyTag}>
                    <Icon name="check-circle" size={14} color={theme.colors.emerald} />
                    <Text style={styles.surveyTagText}>Submitted</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* PROMINENT FLOATING ACTION BUTTON (+) (Matches Image 4 soft lilac purple circle) */}
      <Pressable
        onPress={() => setShowActivitySheet(true)}
        style={styles.fabBtn}
      >
        <Icon name="plus" size={28} color="#000000" strokeWidth={2.8} />
      </Pressable>

      {/* BOTTOM SHEETS */}
      <OutletActivitySheet
        visible={showActivitySheet}
        outletName={outlet.name}
        enabledModules={campaignModules}
        onClose={() => setShowActivitySheet(false)}
        onSelectAction={handleSelectActivityAction}
      />

      <SkipOutletModal
        visible={showSkipModal}
        outletName={outlet.name}
        outletId={outlet.id}
        onClose={() => setShowSkipModal(false)}
        onSubmitSkip={handleSkipSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: 100, gap: theme.spacing.md },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  missingTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText, textAlign: 'center' },
  returnBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: theme.radius.md },
  returnBtnText: { fontFamily: theme.fonts.bold, fontSize: 14, color: '#FFF' },
  identityCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.md, padding: theme.spacing.lg },
  identityHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.sm },
  outletName: { fontFamily: theme.fonts.bold, fontSize: 22, color: theme.colors.darkText },
  outletSub: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.sm },
  statusBadgeText: { fontFamily: theme.fonts.bold, fontSize: 11 },
  visitedBadge: { backgroundColor: theme.colors.visitedBg },
  visitedBadgeText: { color: theme.colors.visitedText, fontFamily: theme.fonts.bold, fontSize: 11 },
  skippedBadge: { backgroundColor: theme.colors.skippedBg },
  skippedBadgeText: { color: theme.colors.skippedText, fontFamily: theme.fonts.bold, fontSize: 11 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkText },
  addressText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, lineHeight: 18 },
  metricsGrid: { flexDirection: 'row', gap: theme.spacing.sm },
  metricCell: {
    flex: 1,
    backgroundColor: theme.colors.darkCard,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metricValue: { fontFamily: theme.fonts.display, fontSize: 26, color: theme.colors.darkText },
  metricLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  hintText: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, lineHeight: 17, paddingHorizontal: 4 },
  skippedSummaryCard: { backgroundColor: theme.colors.skippedBg, borderColor: '#652B07', gap: 4 },
  skippedSummaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skippedSummaryTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.skippedText },
  skippedSummaryText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkText },
  skippedSummaryNote: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  skippedSummaryTime: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted, marginTop: 2 },
  recordsSection: { gap: theme.spacing.xs },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8, marginBottom: 4 },
  recordsGrid: { flexDirection: 'row', gap: theme.spacing.sm },
  recordCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.darkCard,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 52,
  },
  recordCardText: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.darkText },
  historySection: { gap: theme.spacing.xs },
  historyItemCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, padding: theme.spacing.md },
  historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  historyTitle: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  historySub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: 2 },
  historyAmount: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.primaryLight },
  surveyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.visitedBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.radius.sm },
  surveyTagText: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.visitedText },
  // Soft lilac purple circular FAB matching Image 4
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.primaryLight, // #B084F9 soft purple
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: theme.colors.primaryLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});
