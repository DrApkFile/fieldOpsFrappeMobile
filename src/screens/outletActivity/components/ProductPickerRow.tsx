import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../components/Icon';
import { Product } from '../../../types';

interface ProductPickerRowProps {
  product: Product;
  isSelected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const ProductPickerRow: React.FC<ProductPickerRowProps> = ({ product, isSelected, disabled, onPress }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isOutOfStock = product.stock <= 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.row, isSelected && styles.rowSelected, disabled && styles.rowDisabled]}
    >
      <View style={styles.icon}>
        <Icon name="package" size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.name, disabled && styles.textDisabled]}>{product.name}</Text>
        <Text style={[styles.sub, disabled && styles.textDisabled]}>
          {isOutOfStock ? 'Out of stock' : `₦${product.price.toLocaleString()} / ${product.unit || 'unit'} · ${product.unitsPerCase} per case`}
        </Text>
      </View>
      <Text style={[styles.price, disabled && styles.textDisabled]}>₦{product.price.toLocaleString()}</Text>
    </Pressable>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.cardWhite,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  rowSelected: { borderColor: theme.colors.navy, backgroundColor: theme.colors.tintTeal },
  rowDisabled: { opacity: 0.4 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.teal, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  sub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  price: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  textDisabled: { color: theme.colors.textMuted },
});
