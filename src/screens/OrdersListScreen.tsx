import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { groupOrdersByRef } from '../utils/transactions';
import { RouteName } from '../types';

interface OrdersListScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

const statusMeta: Record<string, { color: string }> = {
  Pending: { color: '#D97706' },
  Confirmed: { color: '#2563EB' },
  Delivered: { color: '#059669' },
};

export const OrdersListScreen: React.FC<OrdersListScreenProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state } = useFieldStore();

  const orders = groupOrdersByRef(state.orders);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Orders" subtitle={`${orders.length} orders logged`} onNavigate={onNavigate} onBackPress={() => onNavigate('home')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {orders.length === 0 && (
          <Text style={styles.emptyText}>No orders yet. Log one from an outlet's Order tab.</Text>
        )}
        {orders.map((t) => {
          const outlet = state.outlets.find((o) => o.id === t.outletId);
          const meta = statusMeta[t.status || 'Pending'];
          return (
            <Pressable
              key={t.ref}
              onPress={() => onNavigate('transactionDetail', { kind: 'order', ref: t.ref, outletId: t.outletId })}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconBox}>
                    <Icon name="package" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.outletName}>{outlet?.name || 'Outlet'}</Text>
                    <Text style={styles.sub}>{t.customerName} · {t.lines.length} item{t.lines.length === 1 ? '' : 's'} · {t.timestamp}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.amount}>₦{t.total.toLocaleString()}</Text>
                    <View style={[styles.statusPill, { backgroundColor: `${meta.color}22` }]}>
                      <Text style={[styles.statusText, { color: meta.color }]}>{t.status}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.sm },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', paddingVertical: theme.spacing.xl },
  card: { backgroundColor: theme.colors.cardWhite, borderColor: theme.colors.cardBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  iconBox: { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  outletName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  sub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  amount: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textDark },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.full },
  statusText: { fontFamily: theme.fonts.bold, fontSize: 10 },
});
