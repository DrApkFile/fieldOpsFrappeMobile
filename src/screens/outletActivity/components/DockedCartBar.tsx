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
        {itemCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{itemCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={styles.itemsText}>
          {itemCount} item{itemCount === 1 ? '' : 's'} · {mode === 'sale' ? 'Sale' : 'Order'} cart
        </Text>
        <Text style={styles.totalText}>₦{total.toLocaleString()}</Text>
      </View>
      <View style={styles.cta}>
        <Text style={styles.ctaText}>View Cart</Text>
        <Icon name="chevron-right" size={16} color="#FFFFFF" />
      </View>
    </Pressable>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  bar: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 3,
    backgroundColor: theme.colors.red, alignItems: 'center', justifyContent: 'center',
  },
  countBadgeText: { fontFamily: theme.fonts.bold, fontSize: 10, color: '#FFFFFF' },
  textCol: { flex: 1 },
  itemsText: { fontFamily: theme.fonts.semibold, fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  totalText: { fontFamily: theme.fonts.display, fontSize: 17, color: '#FFFFFF', marginTop: 1 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ctaText: { fontFamily: theme.fonts.bold, fontSize: 13, color: '#FFFFFF' },
});
