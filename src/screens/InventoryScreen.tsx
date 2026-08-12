import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { RouteName, Product } from '../types';

interface InventoryScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

const LOW_STOCK_THRESHOLD = 15;

type StockStatus = 'in' | 'low' | 'out';

function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out';
  if (stock < LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

function formatCaseUnits(stock: number, unitsPerCase: number): string {
  if (!unitsPerCase || unitsPerCase <= 1) return `${stock} unit${stock === 1 ? '' : 's'}`;
  const cases = Math.floor(stock / unitsPerCase);
  const units = stock % unitsPerCase;
  if (cases === 0) return `${units} unit${units === 1 ? '' : 's'}`;
  if (units === 0) return `${cases} case${cases === 1 ? '' : 's'}`;
  return `${cases} case${cases === 1 ? '' : 's'} + ${units} unit${units === 1 ? '' : 's'}`;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  // Reads from the shared store (not a static import) so it reflects the same
  // live stock numbers that New Sale decrements — the two screens share data.
  const { state } = useFieldStore();
  const products = state.products;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.warehouse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  const statusMeta: Record<StockStatus, { label: string; color: string; bg: string }> = {
    in: { label: 'In Stock', color: theme.colors.emerald, bg: theme.colors.emeraldLight },
    low: { label: 'Low Stock', color: theme.colors.amber, bg: theme.colors.amberLight },
    out: { label: 'Out of Stock', color: theme.colors.red, bg: theme.colors.redLight },
  };

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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Stock Banner */}
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

        {/* Product Search */}
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, SKU, or warehouse"
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="x" size={16} color={theme.colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Assigned Products Overview */}
        <Text style={styles.sectionTitle}>Assigned SKU Breakdown</Text>
        {filteredProducts.length === 0 && (
          <Text style={styles.emptyText}>No products match "{searchQuery}".</Text>
        )}
        {filteredProducts.map((p: Product) => {
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
                <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                  <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.min(100, (p.stock / 50) * 100)}%`,
                      backgroundColor: meta.color,
                    },
                  ]}
                />
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
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardWhite,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  searchInput: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.textDark },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
  productCard: { gap: theme.spacing.xs },
  productImage: { width: 48, height: 48, borderRadius: theme.radius.md },
  productIcon: { width: 48, height: 48, borderRadius: theme.radius.md, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  productTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  productSku: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  warehouseText: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.textMuted },
  caseUnitText: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: theme.radius.full, alignSelf: 'flex-start' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontFamily: theme.fonts.bold, fontSize: 10 },
  track: { height: 6, backgroundColor: theme.colors.cardBorder, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', borderRadius: 3 },
  actionBtn: { marginTop: theme.spacing.xs },
});
