import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Image, TextInput } from 'react-native';
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
import { getStockStatus, formatCaseUnits } from '../utils/stock';

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

  const statusMeta = {
    in: { label: 'In Stock', color: theme.colors.emerald, bg: theme.colors.emeraldLight },
    low: { label: 'Low Stock', color: theme.colors.amber, bg: theme.colors.amberLight },
    out: { label: 'Out of Stock', color: theme.colors.red, bg: theme.colors.redLight },
  } as const;

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
            {filteredProducts.map((p) => {
              const status = getStockStatus(p.stock);
              const meta = statusMeta[status];
              return (
                <Card key={p.id} style={styles.productCard}>
                  <View style={styles.row}>
                    {p.imageUrl ? (
                      <Image source={{ uri: p.imageUrl }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.productIcon}>
                        <Icon name="package" size={20} color={theme.colors.primary} />
                      </View>
                    )}
                    <View style={styles.flex1}>
                      <Text style={styles.productTitle}>{p.name}</Text>
                      <Text style={styles.productSku}>{p.sku} · ₦{p.price.toLocaleString()} unit price</Text>
                      <View style={styles.metaRow}>
                        <Icon name="building" size={11} color={theme.colors.textMuted} />
                        <Text style={styles.warehouseText}>{p.warehouse}</Text>
                      </View>
                      <Text style={styles.caseUnitText}>{formatCaseUnits(p.stock, p.unitsPerCase)} available</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                        <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                      <Pressable onPress={() => setAdjustingProduct(p)} style={styles.adjustBtn}>
                        <Icon name="sliders" size={12} color={theme.colors.primary} />
                        <Text style={styles.adjustBtnText}>Adjust</Text>
                      </Pressable>
                    </View>
                  </View>
                </Card>
              );
            })}

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
  productCard: { gap: theme.spacing.xs },
  productImage: { width: 48, height: 48, borderRadius: theme.radius.md },
  productIcon: { width: 48, height: 48, borderRadius: theme.radius.md, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  productTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  productSku: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  warehouseText: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.textMuted },
  caseUnitText: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: theme.radius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontFamily: theme.fonts.bold, fontSize: 10 },
  adjustBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4 },
  adjustBtnText: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.primary },
  actionBtn: { marginTop: theme.spacing.xs },
});
