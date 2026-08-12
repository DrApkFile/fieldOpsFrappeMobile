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
import { mockPromos, mockCustomers, generateInvoiceRef } from '../services/mockService';
import { RouteName, Product, Customer, OutletSale } from '../types';

interface NewSaleScreenProps {
  routeData?: { outletId?: string; selectedCustomer?: Customer };
  onNavigate: (route: RouteName, data?: any) => void;
}

export const NewSaleScreen: React.FC<NewSaleScreenProps> = ({ routeData, onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const { state, dispatch } = useFieldStore();
  const outletId = routeData?.outletId;
  const outlet = state.outlets.find((o) => o.id === outletId);

  // If no outlet context exists, render missing error state
  if (!outlet) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="New Sale" subtitle="Outlet missing" onNavigate={onNavigate} onBackPress={() => onNavigate('outlets')} />
        <View style={styles.missingContainer}>
          <Icon name="alert-circle" size={44} color={theme.colors.amber} />
          <Text style={styles.missingTitle}>Sales belong to an outlet.</Text>
          <Text style={styles.missingSub}>Please select an outlet from your list before starting a sale.</Text>
          <Button
            title="Go to Outlets List"
            onPress={() => onNavigate('outlets')}
            variant="primary"
            style={styles.missingBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const products = state.products;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products.find((p) => p.stock > 0) || null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(
    routeData?.selectedCustomer || mockCustomers[0]
  );
  const [selectedPromo, setSelectedPromo] = useState(mockPromos[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (routeData?.selectedCustomer) {
      setSelectedCustomer(routeData.selectedCustomer);
    }
  }, [routeData?.selectedCustomer]);

  // Adjust quantity if product changes
  const handleSelectProduct = (p: Product) => {
    if (p.stock <= 0) return;
    setSelectedProduct(p);
    setQuantity(1);
  };

  const handleIncrement = () => {
    if (!selectedProduct) return;
    if (quantity < selectedProduct.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  // Calculations
  const unitPrice = selectedProduct?.price || 0;
  const subtotal = unitPrice * quantity;
  const discountAmount = Math.round(subtotal * (selectedPromo.pct / 100));
  const total = subtotal - discountAmount;

  const isValid =
    selectedProduct !== null &&
    selectedProduct.stock > 0 &&
    quantity >= 1 &&
    quantity <= selectedProduct.stock &&
    selectedCustomer !== null;

  const handleSubmitSale = () => {
    if (!isValid || !selectedProduct) return;
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

    const newSale: OutletSale = {
      id: `sale-${Date.now()}`,
      outletId: outlet.id,
      campaignId: state.activeCampaign?.id || 'c2',
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice,
      discount: discountAmount,
      total,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      promoLabel: selectedPromo.pct > 0 ? selectedPromo.label : undefined,
      timestamp: nowStr,
      invoiceRef: generateInvoiceRef(),
    };

    // 1. Decrement product inventory
    dispatch({ type: 'DECREMENT_STOCK', productId: selectedProduct.id, qty: quantity });

    // 2. Mark outlet as visited
    dispatch({ type: 'MARK_OUTLET_VISITED', outletId: outlet.id });

    // 3. Add sale to history
    dispatch({ type: 'ADD_SALE', sale: newSale });

    setTimeout(() => {
      setSubmitting(false);
      onNavigate('saleReceipt', { sale: newSale, outletId: outlet.id });
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="New Sale"
        subtitle={outlet.name}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('outletDetail', { outletId: outlet.id })}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* READ-ONLY OUTLET CARD */}
        <Card style={styles.readOnlyOutletCard}>
          <View style={styles.outletCardHeader}>
            <Icon name="store" size={18} color={theme.colors.primaryLight} />
            <Text style={styles.readOnlyLabel}>OUTLET CONTEXT</Text>
          </View>
          <Text style={styles.outletName}>{outlet.name}</Text>
          <Text style={styles.outletSub}>{outlet.area} · {outlet.type} · {outlet.address}</Text>
        </Card>

        {/* CUSTOMER SELECTOR */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderBetween}>
            <Text style={styles.sectionTitle}>CUSTOMER SELECTION *</Text>
            <Pressable
              onPress={() =>
                onNavigate('customerSelect', {
                  returnRoute: 'newSale',
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
                returnRoute: 'newSale',
                outletId: outlet.id,
              })
            }
            style={styles.customerBox}
          >
            <View style={styles.userIconCircle}>
              <Icon name="user" size={18} color={theme.colors.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.custName}>{selectedCustomer.name}</Text>
              <Text style={styles.custSub}>{selectedCustomer.company || 'Retail Customer'} · {selectedCustomer.phone}</Text>
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
              const isOutOfStock = p.stock <= 0;

              return (
                <Pressable
                  key={p.id}
                  onPress={() => handleSelectProduct(p)}
                  disabled={isOutOfStock}
                  style={[
                    styles.productItem,
                    isSelected && styles.productItemSelected,
                    isOutOfStock && styles.productItemDisabled,
                  ]}
                >
                  <View style={styles.radioBox}>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.productName, isOutOfStock && styles.textDisabled]}>
                      {p.name}
                    </Text>
                    <Text style={[styles.productStock, isOutOfStock && styles.textDisabled]}>
                      {isOutOfStock ? 'Out of stock' : `${p.stock} in stock · ₦${p.price.toLocaleString()}`}
                    </Text>
                  </View>

                  <Text style={[styles.productPrice, isOutOfStock && styles.textDisabled]}>
                    ₦{p.price.toLocaleString()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* QUANTITY STEPPER */}
        {selectedProduct && selectedProduct.stock > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderBetween}>
              <Text style={styles.sectionTitle}>QUANTITY</Text>
              <Text style={styles.maxAvailText}>Max available: {selectedProduct.stock}</Text>
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

              <Pressable
                onPress={handleIncrement}
                disabled={quantity >= selectedProduct.stock}
                style={[styles.stepBtn, quantity >= selectedProduct.stock && styles.stepBtnDisabled]}
              >
                <Icon name="plus" size={20} color={quantity >= selectedProduct.stock ? theme.colors.darkMuted : theme.colors.darkText} />
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

        {/* SALE SUMMARY */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>SALE SUMMARY</Text>

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

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalVal}>₦{total.toLocaleString()}</Text>
          </View>
        </Card>

        {/* SUBMIT BUTTON */}
        <Button
          title={submitting ? 'Completing Sale...' : 'Submit Sale & Generate Receipt'}
          onPress={handleSubmitSale}
          variant="primary"
          size="large"
          disabled={!isValid || submitting}
          loading={submitting}
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
  missingSub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, textAlign: 'center' },
  missingBtn: { marginTop: theme.spacing.md },
  readOnlyOutletCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: 4 },
  outletCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readOnlyLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.primaryLight, letterSpacing: 0.8 },
  outletName: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText },
  outletSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm },
  cardHeaderBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  changeBtnText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.primaryLight },
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
  productItemSelected: { borderColor: theme.colors.primaryLight, backgroundColor: theme.colors.primaryBg },
  productItemDisabled: { opacity: 0.4 },
  radioBox: { justifyContent: 'center' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.darkMuted, alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: theme.colors.primaryLight },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primaryLight },
  productName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  productStock: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  productPrice: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  textDisabled: { color: theme.colors.darkMuted },
  maxAvailText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.primaryLight },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl, paddingVertical: theme.spacing.sm },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.3 },
  quantityVal: { fontFamily: theme.fonts.display, fontSize: 24, color: theme.colors.darkText, minWidth: 40, textAlign: 'center' },
  promosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  promoChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder },
  promoChipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryLight },
  promoChipText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkMuted },
  promoChipTextSelected: { color: '#FFF', fontFamily: theme.fonts.bold },
  summaryCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm, padding: theme.spacing.lg },
  summaryTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkMuted },
  summaryVal: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText },
  discountVal: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.emerald },
  divider: { height: 1, backgroundColor: theme.colors.darkBorder, marginVertical: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  totalVal: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.primaryLight },
  submitBtn: { marginTop: theme.spacing.sm },
});
