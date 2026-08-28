import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../components/Icon';

interface DockedCartBarProps {
  mode: 'sale' | 'order';
  itemCount: number;
  total: number;
  onPress: () => void;
}

export const DockedCartBar: React.FC<DockedCartBarProps> = ({ mode, itemCount, total, onPress }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={styles.bar}>
      <View style={styles.iconBox}>
        <Icon name="shopping-bag" size={18} color="#FFFFFF" />
      </View>

      <View style={styles.metricCol}>
        <Text style={styles.metricLabel}>LINES</Text>
        <Text style={styles.metricValue}>{itemCount}</Text>
      </View>

      <View style={styles.metricColRight}>
        <Text style={styles.metricLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
      </View>
    </Pressable>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  bar: {
    // OutletActivityScreen is pushed from Outlet Detail, not one of App.tsx's
    // isMainTab screens, so BottomTabs never overlaps it — bottom:16 is safe here
    // (compare InventoryScreen's basketBar, which needs bottom:88 for that reason).
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.cardWhite,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  iconBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: theme.colors.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  metricCol: { gap: 1 },
  metricColRight: { flex: 1, alignItems: 'flex-end', gap: 1 },
  metricLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.textMuted, letterSpacing: 0.6 },
  metricValue: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  totalValue: { fontFamily: theme.fonts.display, fontSize: 17, color: theme.colors.textDark },
});
