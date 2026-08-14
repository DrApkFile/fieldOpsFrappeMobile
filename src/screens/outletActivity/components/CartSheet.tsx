import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../components/Icon';
import { Button } from '../../../components/Button';
import { CartLine, Customer } from '../../../types';
import { StockShortfall } from '../../../utils/cart';

interface CartSheetProps {
  visible: boolean;
  mode: 'sale' | 'order';
  cart: CartLine[];
  customer: Customer;
  subtotal: number;
  discount: number;
  total: number;
  stockShortfalls: StockShortfall[];
  submitting: boolean;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveLine: (productId: string) => void;
  onChangeCustomer: () => void;
  onClose: () => void;
  onConfirmCheckout: () => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({
  visible, mode, cart, customer, subtotal, discount, total, stockShortfalls, submitting,
  onUpdateQty, onRemoveLine, onChangeCustomer, onClose, onConfirmCheckout,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [view, setView] = useState<'cart' | 'review'>('cart');

  useEffect(() => {
    if (visible) setView('cart');
  }, [visible]);

  const modeLabel = mode === 'sale' ? 'Sale' : 'Order';
  const hasShortfall = stockShortfalls.length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />

              <View style={styles.headerRow}>
                {view === 'review' && (
                  <Pressable onPress={() => setView('cart')} style={styles.backBtn}>
                    <Icon name="chevron-left" size={18} color={theme.colors.darkText} />
                  </Pressable>
                )}
                <Text style={styles.title}>{view === 'cart' ? `${modeLabel} Cart` : `Review ${modeLabel}`}</Text>
              </View>

              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {cart.length === 0 ? (
                  <Text style={styles.emptyText}>No items yet. Add a product from the {modeLabel} tab.</Text>
                ) : (
                  <View style={styles.linesList}>
                    {cart.map((line) => {
                      const shortfall = stockShortfalls.find((s) => s.productId === line.productId);
                      return (
                        <View key={line.productId} style={[styles.lineRow, shortfall && styles.lineRowError]}>
                          <View style={{ flex: 1, gap: 2 }}>
                            <Text style={styles.lineName}>{line.productName}</Text>
                            <Text style={styles.lineSub}>₦{line.unitPrice.toLocaleString()} × {line.quantity}</Text>
                            {shortfall && (
                              <Text style={styles.shortfallText}>
                                Only {shortfall.available} in stock — reduce quantity to continue
                              </Text>
                            )}
                          </View>

                          {view === 'cart' ? (
                            <View style={styles.stepperRow}>
                              <Pressable onPress={() => onUpdateQty(line.productId, line.quantity - 1)} style={styles.stepBtn}>
                                <Icon name="minus" size={14} color={theme.colors.darkText} />
                              </Pressable>
                              <Text style={styles.qtyText}>{line.quantity}</Text>
                              <Pressable onPress={() => onUpdateQty(line.productId, line.quantity + 1)} style={styles.stepBtn}>
                                <Icon name="plus" size={14} color={theme.colors.darkText} />
                              </Pressable>
                              <Pressable onPress={() => onRemoveLine(line.productId)} style={styles.removeBtn}>
                                <Icon name="x" size={16} color={theme.colors.red} />
                              </Pressable>
                            </View>
                          ) : (
                            <Text style={styles.lineTotal}>₦{(line.unitPrice * line.quantity - line.discount).toLocaleString()}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}

                {view === 'review' && (
                  <View style={styles.customerCard}>
                    <Icon name="user" size={16} color={theme.colors.primaryLight} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerName}>{customer.name}</Text>
                      <Text style={styles.customerSub}>{customer.company || 'Retail Account'}</Text>
                    </View>
                    <Pressable onPress={onChangeCustomer}>
                      <Text style={styles.changeText}>Change</Text>
                    </Pressable>
                  </View>
                )}

                {cart.length > 0 && (
                  <View style={styles.summaryBlock}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryVal}>₦{subtotal.toLocaleString()}</Text>
                    </View>
                    {discount > 0 && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Text style={styles.discountVal}>-₦{discount.toLocaleString()}</Text>
                      </View>
                    )}
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.totalLabel}>TOTAL</Text>
                      <Text style={styles.totalVal}>₦{total.toLocaleString()}</Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {cart.length > 0 && (
                view === 'cart' ? (
                  <Button
                    title="Review →"
                    onPress={() => setView('review')}
                    variant="primary"
                    size="large"
                    disabled={hasShortfall}
                    style={styles.actionBtn}
                  />
                ) : (
                  <Button
                    title={submitting ? 'Submitting...' : `Confirm & Submit ${modeLabel}`}
                    onPress={onConfirmCheckout}
                    variant="primary"
                    size="large"
                    loading={submitting}
                    disabled={submitting || hasShortfall}
                    style={styles.actionBtn}
                  />
                )
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheetContainer: {
    backgroundColor: theme.colors.darkCard,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    maxHeight: '85%',
  },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.darkBorder, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.darkSurface, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: theme.fonts.bold, fontSize: 19, color: theme.colors.darkText },
  scroll: { flexGrow: 0 },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, textAlign: 'center', paddingVertical: theme.spacing.xl },
  linesList: { gap: theme.spacing.xs },
  lineRow: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md, padding: theme.spacing.md, marginBottom: theme.spacing.xs,
  },
  lineRowError: { borderColor: theme.colors.red },
  lineName: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  lineSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  shortfallText: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.red, marginTop: 2 },
  lineTotal: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.darkCard, borderWidth: 1, borderColor: theme.colors.darkBorder, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText, minWidth: 20, textAlign: 'center' },
  removeBtn: { marginLeft: 4, padding: 4 },
  customerCard: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md, padding: theme.spacing.md, marginTop: theme.spacing.sm,
  },
  customerName: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  customerSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  changeText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.primaryLight },
  summaryBlock: { gap: 6, marginTop: theme.spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted },
  summaryVal: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkText },
  discountVal: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.emerald },
  divider: { height: 1, backgroundColor: theme.colors.darkBorder, marginVertical: 2 },
  totalLabel: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  totalVal: { fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.primaryLight },
  actionBtn: { marginTop: theme.spacing.sm },
});
