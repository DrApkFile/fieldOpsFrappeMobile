import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { ScrollableTabs } from '../components/ScrollableTabs';
import { MovementsList } from '../components/MovementsList';
import { ProductCatalogList } from '../components/ProductCatalogList';
import { StockAdjustmentSheet } from './StockAdjustmentSheet';
import { useFieldStore } from '../store/useFieldStore';
import { RouteName, Product } from '../types';

interface InventoryScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

const INVENTORY_TABS = [
  { id: 'stock', label: 'Stock Levels' },
  { id: 'movements', label: 'Movements' },
  { id: 'catalog', label: 'Product Catalog' },
];

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state } = useFieldStore();
  const products = state.products;

  const [activeTab, setActiveTab] = useState('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.warehouse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Agent Inventory"
        subtitle="Assigned Field Stock"
        onNavigate={onNavigate}
        rightAction={
          <Pressable onPress={() => onNavigate('reconcile')} style={styles.reconcileHeaderBtn}>
            <Icon name="sliders" size={18} color={theme.colors.primary} />
          </Pressable>
        }
      />
      <ScrollableTabs tabs={INVENTORY_TABS} activeId={activeTab} onSelect={setActiveTab} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'stock' && (
          <>
            <Card style={styles.heroBanner}>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.heroLabel}>TOTAL ASSIGNED STOCK VALUE</Text>
                  <Text style={styles.heroValue}>₦{totalStockValue.toLocaleString()}</Text>
                  <Text style={styles.heroSub}>{totalStockCount} total units across {products.length} product SKUs</Text>
                </View>
                <View style={styles.heroIconBox}>
                  <Icon name="package" size={28} color="#FFFFFF" />
                </View>
              </View>
            </Card>

            <View style={styles.searchBox}>
              <Icon name="search" size={18} color={theme.colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products, SKU, or warehouse"
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text style={styles.sectionTitle}>Assigned SKU Breakdown</Text>
            {filteredProducts.map((p) => (
              <Card key={p.id} style={styles.productCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.productIcon}>
                    <Icon name="package" size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.productTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.assignedNum}>{p.stock}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.productMeta} numberOfLines={1}>
                    SKU {p.sku} · min {p.minStock ?? 15} · assigned {p.stock}
                  </Text>
                  <Text style={styles.unitLabel}>UNITS</Text>
                </View>

                {p.description ? (
                  <Text style={styles.productDesc} numberOfLines={1}>{p.description}</Text>
                ) : null}

                <Pressable onPress={() => setAdjustingProduct(p)} style={styles.adjustBtn}>
                  <Text style={styles.adjustBtnText}>Adjust stock</Text>
                </Pressable>
              </Card>
            ))}

            <Button
              title="Submit Daily Stock Reconciliation"
              onPress={() => onNavigate('reconcile')}
              size="large"
              variant="outline"
              iconName="sliders"
              style={styles.actionBtn}
            />
          </>
        )}

        {activeTab === 'movements' && <MovementsList movements={state.movements} />}

        {activeTab === 'catalog' && (
          <ProductCatalogList products={products} onSelectProduct={(p) => onNavigate('productDetail', { productId: p.id })} />
        )}
      </ScrollView>

      <StockAdjustmentSheet
        visible={!!adjustingProduct}
        product={adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  reconcileHeaderBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  heroBanner: { backgroundColor: theme.colors.primaryDark, borderColor: theme.colors.primary, padding: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  flex1: { flex: 1 },
  heroLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.primaryText, letterSpacing: 0.8 },
  heroValue: { fontFamily: theme.fonts.display, fontSize: 26, color: '#FFFFFF', marginTop: 2 },
  heroSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.primaryText, marginTop: 2 },
  heroIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.md, height: 48,
  },
  searchInput: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.textDark },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  productCard: { gap: 6 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  productIcon: { width: 34, height: 34, borderRadius: theme.radius.sm, backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  productTitle: { flex: 1, fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  assignedNum: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.textDark },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productMeta: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted },
  unitLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.textMuted, letterSpacing: 0.6, marginLeft: theme.spacing.sm },
  productDesc: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  adjustBtn: {
    alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: theme.radius.md,
    backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.cardBorder, marginTop: 4,
  },
  adjustBtnText: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.textDark },
  actionBtn: { marginTop: theme.spacing.xs },
});
