import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { mockPromos, mockCustomers } from '../services/mockService';
import { RouteName, Product, Customer } from '../types';

interface NewOrderScreenProps {
  routeData?: { outletId?: string; selectedCustomer?: Customer };
  onNavigate: (route: RouteName, data?: any) => void;
}

export const NewOrderScreen: React.FC<NewOrderScreenProps> = ({ routeData, onNavigate }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state } = useFieldStore();
  const outletId = routeData?.outletId;
  const outlet = state.outlets.find((o) => o.id === outletId);

  if (!outlet) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="New Order" subtitle="Outlet missing" onNavigate={onNavigate} onBackPress={() => onNavigate('outlets')} />
        <View style={styles.missingContainer}>
          <Icon name="alert-circle" size={44} color={theme.colors.amber} />
          <Text style={styles.missingTitle}>Orders belong to an outlet.</Text>
          <Button title="Go to Outlets List" onPress={() => onNavigate('outlets')} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  const products = state.products;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [quantity, setQuantity] = useState(5);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(
    routeData?.selectedCustomer || mockCustomers[0]
  );
  const [selectedPromo, setSelectedPromo] = useState(mockPromos[0]);

  useEffect(() => {
    if (routeData?.selectedCustomer) {
      setSelectedCustomer(routeData.selectedCustomer);
    }
  }, [routeData?.selectedCustomer]);

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const unitPrice = selectedProduct?.price || 0;
  const subtotal = unitPrice * quantity;
  const discountAmount = Math.round(subtotal * (selectedPromo.pct / 100));
  const total = subtotal - discountAmount;

  const isValid = selectedProduct !== null && quantity >= 1 && selectedCustomer !== null;

  const handleReviewOrder = () => {
    if (!isValid || !selectedProduct) return;
    onNavigate('orderReview', {
      outletId: outlet.id,
      product: selectedProduct,
      quantity,
      customer: selectedCustomer,
      promoLabel: selectedPromo.label,
      promoPct: selectedPromo.pct,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="New Order"
        subtitle={outlet.name}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('outletDetail', { outletId: outlet.id })}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* OUTLET CARD */}
        <Card style={styles.readOnlyOutletCard}>
          <View style={styles.outletCardHeader}>
            <Icon name="store" size={18} color={theme.colors.teal} />
            <Text style={styles.readOnlyLabel}>OUTLET CONTEXT</Text>
          </View>
          <Text style={styles.outletName}>{outlet.name}</Text>
          <Text style={styles.outletSub}>{outlet.area} · {outlet.type} · {outlet.address}</Text>
        </Card>

        {/* CUSTOMER SELECTOR */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderBetween}>
            <Text style={styles.sectionTitle}>CUSTOMER ACCOUNT *</Text>
            <Pressable
              onPress={() =>
                onNavigate('customerSelect', {
                  returnRoute: 'newOrder',
                  outletId: outlet.id,
                })
              }
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() =>
              onNavigate('customerSelect', {
                returnRoute: 'newOrder',
                outletId: outlet.id,
              })
            }
            style={styles.customerBox}
          >
            <View style={styles.userIconCircle}>
              <Icon name="user" size={18} color={theme.colors.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.custName}>{selectedCustomer.name}</Text>
              <Text style={styles.custSub}>{selectedCustomer.company || 'Retail Account'} · {selectedCustomer.phone}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={theme.colors.darkMuted} />
          </Pressable>
        </Card>

        {/* PRODUCT PICKER */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SELECT PRODUCT *</Text>

          <View style={styles.productsList}>
            {products.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setSelectedProduct(p)}
                  style={[styles.productItem, isSelected && styles.productItemSelected]}
                >
                  <View style={styles.radioBox}>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productStock}>
                      {p.stock > 0 ? `${p.stock} currently in local stock` : 'Order placement available'}
                    </Text>
                  </View>

                  <Text style={styles.productPrice}>₦{p.price.toLocaleString()}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* QUANTITY STEPPER */}
        {selectedProduct && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderBetween}>
              <Text style={styles.sectionTitle}>ORDER QUANTITY</Text>
              <Text style={styles.orderNoteText}>Orders can exceed current stock</Text>
            </View>

            <View style={styles.stepperRow}>
              <Pressable
                onPress={handleDecrement}
                disabled={quantity <= 1}
                style={[styles.stepBtn, quantity <= 1 && styles.stepBtnDisabled]}
              >
                <Icon name="minus" size={20} color={quantity <= 1 ? theme.colors.darkMuted : theme.colors.darkText} />
              </Pressable>

              <Text style={styles.quantityVal}>{quantity}</Text>

              <Pressable onPress={handleIncrement} style={styles.stepBtn}>
                <Icon name="plus" size={20} color={theme.colors.darkText} />
              </Pressable>
            </View>
          </Card>
        )}

        {/* PROMOTIONS */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>PROMOTIONS & DISCOUNTS</Text>

          <View style={styles.promosRow}>
            {mockPromos.map((promo) => {
              const isSelected = selectedPromo.label === promo.label;
              return (
                <Pressable
                  key={promo.label}
                  onPress={() => setSelectedPromo(promo)}
                  style={[styles.promoChip, isSelected && styles.promoChipSelected]}
                >
                  <Text style={[styles.promoChipText, isSelected && styles.promoChipTextSelected]}>
                    {promo.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* ORDER SUMMARY */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>₦{subtotal.toLocaleString()}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({selectedPromo.label})</Text>
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

        {/* REVIEW BUTTON */}
        <Button
          title="Review Order →"
          onPress={handleReviewOrder}
          variant="primary"
          size="large"
          disabled={!isValid}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 60 },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  missingTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText },
  readOnlyOutletCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: 4 },
  outletCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readOnlyLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.teal, letterSpacing: 0.8 },
  outletName: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText },
  outletSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm },
  cardHeaderBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  changeBtnText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.teal },
  customerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  userIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  custName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  custSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  productsList: { gap: theme.spacing.xs },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  productItemSelected: { borderColor: theme.colors.teal, backgroundColor: '#134E4A' },
  radioBox: { justifyContent: 'center' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.darkMuted, alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: theme.colors.teal },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.teal },
  productName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  productStock: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  productPrice: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  orderNoteText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.teal },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl, paddingVertical: theme.spacing.sm },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.3 },
  quantityVal: { fontFamily: theme.fonts.display, fontSize: 24, color: theme.colors.darkText, minWidth: 40, textAlign: 'center' },
  promosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  promoChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder },
  promoChipSelected: { backgroundColor: theme.colors.teal, borderColor: theme.colors.tealLight },
  promoChipText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkMuted },
  promoChipTextSelected: { color: '#FFF', fontFamily: theme.fonts.bold },
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
  submitBtn: { marginTop: theme.spacing.sm },
});
