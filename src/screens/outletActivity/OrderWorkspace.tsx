import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { ProductPickerRow } from './components/ProductPickerRow';
import { Product, PromoDiscount } from '../../types';
import { mockPromos } from '../../services/mockService';

interface OrderWorkspaceProps {
  mode: 'sale' | 'order';
  products: Product[];
  onAddToCart: (product: Product, qty: number, promo: PromoDiscount) => void;
}

export const OrderWorkspace: React.FC<OrderWorkspaceProps> = ({ mode, products, onAddToCart }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isSale = mode === 'sale';

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    isSale ? products.find((p) => p.stock > 0) || null : products[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedPromo, setSelectedPromo] = useState<PromoDiscount>(mockPromos[0]);

  const maxQty = isSale ? (selectedProduct?.stock || 1) : 999;

  const handleSelectProduct = (p: Product) => {
    if (isSale && p.stock <= 0) return;
    setSelectedProduct(p);
    setQuantity(1);
  };

  const handleAdd = () => {
    if (!selectedProduct) return;
    onAddToCart(selectedProduct, quantity, selectedPromo);
    setQuantity(1);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>SELECT PRODUCT *</Text>
        <Text style={styles.sectionHint}>
          {isSale ? 'Sales decrease live stock immediately.' : 'Orders can exceed current stock — treated as replenishment.'}
        </Text>
        <View style={styles.productsList}>
          {products.map((p) => (
            <ProductPickerRow
              key={p.id}
              product={p}
              isSelected={selectedProduct?.id === p.id}
              disabled={isSale && p.stock <= 0}
              onPress={() => handleSelectProduct(p)}
            />
          ))}
        </View>
      </Card>

      {selectedProduct && (
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderBetween}>
            <Text style={styles.sectionTitle}>QUANTITY</Text>
            {isSale && <Text style={styles.maxAvailText}>Max available: {selectedProduct.stock}</Text>}
          </View>
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              style={[styles.stepBtn, quantity <= 1 && styles.stepBtnDisabled]}
            >
              <Icon name="minus" size={20} color={quantity <= 1 ? theme.colors.darkMuted : theme.colors.darkText} />
            </Pressable>
            <Text style={styles.quantityVal}>{quantity}</Text>
            <Pressable
              onPress={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              style={[styles.stepBtn, quantity >= maxQty && styles.stepBtnDisabled]}
            >
              <Icon name="plus" size={20} color={quantity >= maxQty ? theme.colors.darkMuted : theme.colors.darkText} />
            </Pressable>
          </View>

          <View style={styles.promosRow}>
            {mockPromos.map((promo) => {
              const isSelected = selectedPromo.label === promo.label;
              return (
                <Pressable
                  key={promo.label}
                  onPress={() => setSelectedPromo(promo)}
                  style={[styles.promoChip, isSelected && styles.promoChipSelected]}
                >
                  <Text style={[styles.promoChipText, isSelected && styles.promoChipTextSelected]}>{promo.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            title={`Add to ${isSale ? 'Sale' : 'Order'} Cart`}
            onPress={handleAdd}
            variant="primary"
            iconName="plus"
            style={styles.addBtn}
          />
        </Card>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { gap: theme.spacing.md },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  sectionHint: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: -4 },
  cardHeaderBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  maxAvailText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.primaryLight },
  productsList: { gap: theme.spacing.xs },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl, paddingVertical: theme.spacing.sm },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.3 },
  quantityVal: { fontFamily: theme.fonts.display, fontSize: 24, color: theme.colors.darkText, minWidth: 40, textAlign: 'center' },
  promosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  promoChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder },
  promoChipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryLight },
  promoChipText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkMuted },
  promoChipTextSelected: { color: '#FFF', fontFamily: theme.fonts.bold },
  addBtn: { marginTop: theme.spacing.xs },
});
