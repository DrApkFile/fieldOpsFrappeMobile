import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { mockProducts } from '../services/mockService';
import { RouteName } from '../types';

interface InventoryScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onNavigate }) => {
  const totalStockCount = mockProducts.reduce((acc, p) => acc + p.stock, 0);

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
      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Stock Banner */}
        <Card style={styles.heroBanner}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.heroLabel}>TOTAL ASSIGNED STOCK VALUE</Text>
              <Text style={styles.heroValue}>₦128,600</Text>
              <Text style={styles.heroSub}>{totalStockCount} total units across {mockProducts.length} product SKUs</Text>
            </View>
            <View style={styles.heroIconBox}>
              <Icon name="package" size={28} color="#FFFFFF" />
            </View>
          </View>
        </Card>

        {/* Assigned Products Overview */}
        <Text style={styles.sectionTitle}>Assigned SKU Breakdown</Text>
        {mockProducts.map((p) => (
          <Card key={p.id} style={styles.productCard}>
            <View style={styles.row}>
              <View style={styles.productIcon}>
                <Icon name="package" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.productTitle}>{p.name}</Text>
                <Text style={styles.productSku}>{p.sku} · ₦{p.price.toLocaleString()} unit price</Text>
              </View>
              <View style={styles.stockBox}>
                <Text style={styles.stockNum}>{p.stock}</Text>
                <Text style={styles.stockLabel}>units</Text>
              </View>
            </View>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(100, (p.stock / 50) * 100)}%`,
                    backgroundColor: p.stock < 15 ? theme.colors.amber : theme.colors.teal,
                  },
                ]}
              />
            </View>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  reconcileHeaderBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  heroBanner: { backgroundColor: '#312E81', borderColor: '#4338CA', padding: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  flex1: { flex: 1 },
  heroLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: '#C7D2FE', letterSpacing: 0.8 },
  heroValue: { fontFamily: theme.fonts.display, fontSize: 26, color: '#FFFFFF', marginTop: 2 },
  heroSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: '#E0E7FF', marginTop: 2 },
  heroIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  productCard: { gap: theme.spacing.xs },
  productIcon: { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  productTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  productSku: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  stockBox: { alignItems: 'flex-end' },
  stockNum: { fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.textDark },
  stockLabel: { fontFamily: theme.fonts.regular, fontSize: 10, color: theme.colors.textMuted },
  track: { height: 6, backgroundColor: theme.colors.cardBorder, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', borderRadius: 3 },
  actionBtn: { marginTop: theme.spacing.xs },
});
