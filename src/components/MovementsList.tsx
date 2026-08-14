import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { Icon, IconName } from './Icon';
import { StockMovement } from '../types';

interface MovementsListProps {
  movements: StockMovement[];
}

const typeMeta: Record<StockMovement['type'], { label: string; icon: IconName }> = {
  sale: { label: 'Sale', icon: 'shopping-bag' },
  adjustment: { label: 'Adjustment', icon: 'sliders' },
  reconciliation: { label: 'Reconciliation', icon: 'refresh' },
};

export const MovementsList: React.FC<MovementsListProps> = ({ movements }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (movements.length === 0) {
    return <Text style={styles.emptyText}>No stock movements recorded yet — sales, adjustments, and reconciliations will appear here.</Text>;
  }

  return (
    <View style={styles.container}>
      {movements.map((m) => {
        const meta = typeMeta[m.type];
        const isPositive = m.qtyChange > 0;
        return (
          <Card key={m.id} style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: isPositive ? theme.colors.emeraldLight : theme.colors.redLight }]}>
                <Icon name={meta.icon} size={16} color={isPositive ? theme.colors.emerald : theme.colors.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{m.productName}</Text>
                <Text style={styles.metaText}>
                  {meta.label}{m.outletName ? ` · ${m.outletName}` : ''}{m.reason ? ` · ${m.reason}` : ''}
                </Text>
                <Text style={styles.timeText}>{m.timestamp}</Text>
              </View>
              <Text style={[styles.qtyText, { color: isPositive ? theme.colors.emerald : theme.colors.red }]}>
                {isPositive ? '+' : ''}{m.qtyChange}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { gap: theme.spacing.xs },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, textAlign: 'center', paddingVertical: theme.spacing.xl },
  card: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  iconBox: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  productName: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  metaText: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: 1 },
  timeText: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted, marginTop: 1 },
  qtyText: { fontFamily: theme.fonts.bold, fontSize: 15 },
});
