import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Card } from '../../../components/Card';
import { Product } from '../../../types';
import { getStockStatus, formatCaseUnits } from '../../../utils/stock';

interface StocksTabProps {
  products: Product[];
}

export const StocksTab: React.FC<StocksTabProps> = ({ products }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const statusMeta = {
    in: { label: 'In Stock', color: theme.colors.emerald, bg: theme.colors.emeraldLight },
    low: { label: 'Low Stock', color: theme.colors.amber, bg: theme.colors.amberLight },
    out: { label: 'Out of Stock', color: theme.colors.red, bg: theme.colors.redLight },
  } as const;

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Live stock available to reference while you're with this customer — read-only here, use Inventory to adjust.</Text>
      {products.map((p) => {
        const status = getStockStatus(p.stock);
        const meta = statusMeta[status];
        return (
          <Card key={p.id} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.sub}>{p.sku} · ₦{p.price.toLocaleString()}</Text>
                <Text style={styles.caseUnit}>{formatCaseUnits(p.stock, p.unitsPerCase)} available</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                <View style={[styles.dot, { backgroundColor: meta.color }]} />
                <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { gap: theme.spacing.sm },
  hint: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, lineHeight: 17, marginBottom: 4 },
  card: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  name: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  sub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: 1 },
  caseUnit: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: theme.radius.full },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: theme.fonts.bold, fontSize: 10 },
});
