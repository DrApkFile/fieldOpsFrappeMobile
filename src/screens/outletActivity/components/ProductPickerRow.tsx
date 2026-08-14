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
      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
        {isSelected && <View style={styles.radioDot} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.name, disabled && styles.textDisabled]}>{product.name}</Text>
        <Text style={[styles.sub, disabled && styles.textDisabled]}>
          {isOutOfStock ? 'Out of stock' : `${product.stock} in stock · ₦${product.price.toLocaleString()}`}
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
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  rowSelected: { borderColor: theme.colors.primaryLight, backgroundColor: theme.colors.primaryBg },
  rowDisabled: { opacity: 0.4 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.darkMuted, alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: theme.colors.primaryLight },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primaryLight },
  name: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  sub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  price: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  textDisabled: { color: theme.colors.darkMuted },
});
