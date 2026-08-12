import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { mockProducts, submitMockData } from '../services/mockService';
import { RouteName } from '../types';

interface SalesScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({ onNavigate }) => {
  const [customer, setCustomer] = useState('FreshMart Lekki');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'POS' | 'Transfer' | 'Credit'>('Cash');
  const [loading, setLoading] = useState(false);

  const subtotal = mockProducts.reduce((acc, p) => acc + (cart[p.id] || 0) * p.price, 0);
  const discount = subtotal > 10000 ? Math.round(subtotal * 0.05) : 0;
  const grandTotal = Math.max(0, subtotal - discount);

  const updateQuantity = (productId: string, delta: number, stock: number) => {
    const current = cart[productId] || 0;
    const next = current + delta;
    if (next > stock) {
      Alert.alert('Stock Limit Capped', `Cannot exceed available assigned stock limit of ${stock} units.`);
      return;
    }
    if (next < 0) return;
    setCart({ ...cart, [productId]: next });
  };

  const handleCheckout = async () => {
    if (grandTotal <= 0) {
      Alert.alert('Empty Order', 'Please select at least 1 product quantity to complete sale.');
      return;
    }
    setLoading(true);
    await submitMockData();
    setLoading(false);
    onNavigate('saleSuccess');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Field Sales Order" subtitle="Build Order from Stock" onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer Select Card */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.sectionLabel}>SELECTED CUSTOMER</Text>
              <Text style={styles.customerName}>{customer}</Text>
              <Text style={styles.customerSub}>Lekki Phase 1 Beat · Existing Outlet</Text>
            </View>
            <Pressable
              onPress={() =>
                setCustomer(customer === 'FreshMart Lekki' ? 'Cedar Supermarket' : 'FreshMart Lekki')
              }
              style={styles.changeBtn}
            >
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </View>
        </Card>

        {/* Product Catalog */}
        <Text style={styles.sectionTitle}>Assigned Product Stock</Text>
        {mockProducts.map((p) => {
          const qty = cart[p.id] || 0;
          return (
            <Card key={p.id} style={styles.productCard}>
              <View style={styles.row}>
                <View style={styles.productIconBox}>
                  <Icon name="package" size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productPrice}>₦{p.price.toLocaleString()} · {p.stock} in stock</Text>
                </View>

                {/* Quantity Control */}
                <View style={styles.qtyControl}>
                  <Pressable onPress={() => updateQuantity(p.id, -1, p.stock)} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.qtyText}>{qty}</Text>
                  <Pressable onPress={() => updateQuantity(p.id, 1, p.stock)} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          );
        })}

        {/* FRD Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Method (FRD Spec)</Text>
        <View style={styles.paymentRow}>
          {(['Cash', 'POS', 'Transfer', 'Credit'] as const).map((method) => (
            <Pressable key={method} onPress={() => setPaymentMethod(method)}>
              <Pill color={paymentMethod === method ? theme.colors.primary : theme.colors.textMuted}>
                {method}
              </Pill>
            </Pressable>
          ))}
        </View>

        {/* Order Summary & Invoice Calculation */}
        <Card style={styles.summaryCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₦{subtotal.toLocaleString()}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.rowBetween}>
              <Text style={styles.summaryLabel}>Volume Promo (5%)</Text>
              <Text style={styles.discountValue}>-₦{discount.toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₦{grandTotal.toLocaleString()}</Text>
          </View>
        </Card>

        <Button
          title={grandTotal > 0 ? `Review & Complete Sale (₦${grandTotal.toLocaleString()})` : 'Select Products to Order'}
          onPress={handleCheckout}
          disabled={grandTotal <= 0}
          loading={loading}
          size="large"
          iconName="shopping-bag"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  card: { padding: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  flex1: { flex: 1 },
  sectionLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  customerName: { fontFamily: theme.fonts.bold, fontSize: 17, color: theme.colors.textDark, marginTop: 2 },
  customerSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  changeBtn: { paddingHorizontal: theme.spacing.sm, paddingVertical: 4 },
  changeText: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.primary },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  productCard: { padding: theme.spacing.md },
  productIconBox: { width: 44, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  productName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  productPrice: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.appBg, borderRadius: theme.radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.primary },
  qtyText: { fontFamily: theme.fonts.bold, fontSize: 14, minWidth: 16, textAlign: 'center', color: theme.colors.textDark },
  paymentRow: { flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' },
  summaryCard: { gap: theme.spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
  summaryValue: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  discountValue: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.emerald },
  divider: { height: 1, backgroundColor: theme.colors.cardBorder, marginVertical: 4 },
  grandTotalLabel: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.textDark },
  grandTotalValue: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.primary },
});
