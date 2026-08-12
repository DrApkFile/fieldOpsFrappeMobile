import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { mockCustomers } from '../services/mockService';
import { RouteName, Customer } from '../types';

interface CustomerSelectScreenProps {
  routeData?: { returnRoute: RouteName; outletId: string; draft?: any };
  onNavigate: (route: RouteName, data?: any) => void;
}

export const CustomerSelectScreen: React.FC<CustomerSelectScreenProps> = ({
  routeData,
  onNavigate,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const returnRoute = routeData?.returnRoute || 'newSale';

  const filtered = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleSelectCustomer = (customer: Customer) => {
    onNavigate(returnRoute, {
      ...routeData,
      selectedCustomer: customer,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Select Customer"
        subtitle="Choose customer account"
        onNavigate={onNavigate}
        onBackPress={() => onNavigate(returnRoute, routeData)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={theme.colors.darkMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name or company"
            placeholderTextColor={theme.colors.darkMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionLabel}>REGISTERED CUSTOMERS</Text>

        <View style={styles.list}>
          {filtered.map((c) => (
            <Card
              key={c.id}
              style={styles.card}
              onPress={() => handleSelectCustomer(c)}
            >
              <View style={styles.cardContent}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {c.name.split(' ').map((n) => n[0]).join('')}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.custName}>{c.name}</Text>
                  <Text style={styles.custCompany}>{c.company || 'Retail Account'} · {c.phone}</Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.darkMuted} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 60 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  searchInput: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkText },
  sectionLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  list: { gap: theme.spacing.sm },
  card: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, padding: theme.spacing.md },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.primaryLight },
  custName: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.darkText },
  custCompany: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
});
