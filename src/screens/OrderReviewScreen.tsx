import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { RouteName, Product, Customer, OutletOrder } from '../types';

interface OrderReviewScreenProps {
  routeData?: {
    outletId?: string;
    product?: Product;
    quantity?: number;
    customer?: Customer;
    promoLabel?: string;
    promoPct?: number;
  };
  onNavigate: (route: RouteName, data?: any) => void;
}

export const OrderReviewScreen: React.FC<OrderReviewScreenProps> = ({ routeData, onNavigate }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state, dispatch } = useFieldStore();
  const [submitting, setSubmitting] = useState(false);

  const outlet = state.outlets.find((o) => o.id === routeData?.outletId);
  const { product, quantity, customer, promoLabel, promoPct } = routeData || {};

  // A review screen with no draft order to review is not a valid entry point.
  if (!outlet || !product || !quantity || !customer) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Review Order" subtitle="Nothing to review" onNavigate={onNavigate} onBackPress={() => onNavigate('outlets')} />
        <View style={styles.missingContainer}>
          <Icon name="alert-circle" size={44} color={theme.colors.amber} />
          <Text style={styles.missingTitle}>There's no order draft to review.</Text>
          <Button title="Go to Outlets List" onPress={() => onNavigate('outlets')} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  const unitPrice = product.price;
  const subtotal = unitPrice * quantity;
  const discountAmount = Math.round(subtotal * ((promoPct || 0) / 100));
  const total = subtotal - discountAmount;

  const handleEditOrder = () => {
    onNavigate('newOrder', { outletId: outlet.id, selectedCustomer: customer });
  };

  const handleConfirmSubmit = () => {
    setSubmitting(true);

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newOrder: OutletOrder = {
      id: `order-${Date.now()}`,
      outletId: outlet.id,
      campaignId: state.activeCampaign?.id || 'c2',
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      discount: discountAmount,
      total,
      customerId: customer.id,
      customerName: customer.name,
      status: 'Pending',
      timestamp: nowStr,
    };

    // Orders do NOT decrement inventory stock — only sales do.
    dispatch({ type: 'MARK_OUTLET_VISITED', outletId: outlet.id });
    dispatch({ type: 'ADD_ORDER', order: newOrder });

    setTimeout(() => {
      setSubmitting(false);
      onNavigate('orderSuccess', { order: newOrder, outletId: outlet.id });
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Review Order"
        subtitle={outlet.name}
        onNavigate={onNavigate}
        onBackPress={handleEditOrder}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introKicker}>ORDER REVIEW & CONFIRMATION</Text>
          <Text style={styles.introTitle}>Check the details before submitting</Text>
          <Text style={styles.introSub}>
            This order is booked as stock replenishment — it won't touch your local inventory count.
          </Text>
        </View>

        {/* OUTLET CARD */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Icon name="store" size={18} color={theme.colors.teal} />
            <Text style={styles.sectionTitle}>OUTLET</Text>
          </View>
          <Text style={styles.outletName}>{outlet.name}</Text>
          <Text style={styles.outletSub}>{outlet.area} · {outlet.type} · {outlet.address}</Text>
        </Card>

        {/* CUSTOMER CARD */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Icon name="user" size={18} color={theme.colors.teal} />
            <Text style={styles.sectionTitle}>CUSTOMER ACCOUNT</Text>
          </View>
          <Text style={styles.rowStrong}>{customer.name}</Text>
          <Text style={styles.rowMuted}>{customer.company || 'Retail Account'} · {customer.phone}</Text>
        </Card>

        {/* PRODUCT CARD */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Icon name="package" size={18} color={theme.colors.teal} />
            <Text style={styles.sectionTitle}>PRODUCT & QUANTITY</Text>
          </View>
          <View style={styles.productRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowStrong}>{product.name}</Text>
              <Text style={styles.rowMuted}>{product.sku} · ₦{unitPrice.toLocaleString()} per unit</Text>
            </View>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyBadgeText}>× {quantity}</Text>
            </View>
          </View>
        </Card>

        {/* SUMMARY */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>₦{subtotal.toLocaleString()}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({promoLabel})</Text>
              <Text style={styles.discountVal}>-₦{discountAmount.toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Status</Text>
            <Text style={styles.statusPendingVal}>Pending Confirmation</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL ORDER VALUE</Text>
            <Text style={styles.totalVal}>₦{total.toLocaleString()}</Text>
          </View>
        </Card>

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
          <Button
            title="Edit Details"
            onPress={handleEditOrder}
            variant="outline"
            style={styles.editBtn}
          />
          <Button
            title={submitting ? 'Submitting...' : 'Confirm & Submit Order'}
            onPress={handleConfirmSubmit}
            variant="primary"
            loading={submitting}
            disabled={submitting}
            style={styles.confirmBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 60 },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  missingTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText, textAlign: 'center' },
  introCard: { gap: 4 },
  introKicker: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.teal, letterSpacing: 1 },
  introTitle: { fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.darkText },
  introSub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, lineHeight: 19 },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: 4 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  outletName: { fontFamily: theme.fonts.bold, fontSize: 17, color: theme.colors.darkText },
  outletSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  rowStrong: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  rowMuted: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: 1 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  qtyBadge: { backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, borderRadius: theme.radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  qtyBadgeText: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.teal },
  summaryCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm, padding: theme.spacing.lg },
  summaryTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkMuted },
  summaryVal: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText },
  discountVal: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.emerald },
  statusPendingVal: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.amber },
  divider: { height: 1, backgroundColor: theme.colors.darkBorder, marginVertical: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  totalVal: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.teal },
  actionsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  editBtn: { flex: 1 },
  confirmBtn: { flex: 1.6 },
});
