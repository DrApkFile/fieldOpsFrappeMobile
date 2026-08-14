import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icon';
import { Card } from './Card';
import { Product } from '../types';

interface ProductCatalogListProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductCatalogList: React.FC<ProductCatalogListProps> = ({ products, onSelectProduct }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Icon name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search catalog by name, SKU, or category"
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filtered.map((p) => (
        <Pressable key={p.id} onPress={() => onSelectProduct(p)}>
          <Card style={styles.card}>
            <View style={styles.row}>
              {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="package" size={20} color={theme.colors.primary} />
                </View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.meta}>₦{p.price.toLocaleString()} · Case of {p.unitsPerCase}</Text>
                {p.description ? (
                  <Text style={styles.description} numberOfLines={2}>{p.description}</Text>
                ) : null}
              </View>
              <Icon name="chevron-right" size={18} color={theme.colors.textMuted} />
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { gap: theme.spacing.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardWhite, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.md, height: 48, marginBottom: theme.spacing.xs,
  },
  searchInput: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.textDark },
  card: { backgroundColor: theme.colors.cardWhite, borderColor: theme.colors.cardBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  image: { width: 52, height: 52, borderRadius: theme.radius.md },
  imagePlaceholder: { width: 52, height: 52, borderRadius: theme.radius.md, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  meta: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.textMuted },
  description: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
});
