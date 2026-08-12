import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Pill } from '../components/Pill';
import { Icon } from '../components/Icon';
import { submitMockData } from '../services/mockService';
import { RouteName } from '../types';

interface ReconcileScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const ReconcileScreen: React.FC<ReconcileScreenProps> = ({ onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const [salesQty, setSalesQty] = useState('6');
  const [returnQty, setReturnQty] = useState('2');
  const [reason, setReason] = useState<'Damage' | 'Expired' | 'Other'>('Damage');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await submitMockData();
    setLoading(false);
    onNavigate('inventorySuccess');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Stock Reconciliation" subtitle="Submit for Admin Approval" onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.productHeader}>
          <Text style={styles.productLabel}>SELECTED SKU</Text>
          <Text style={styles.productTitle}>FieldFresh 1L (FF-1000)</Text>
          <Text style={styles.stockSub}>Assigned Starting Stock: 28 Units</Text>
        </Card>

        <Input
          label="SALES QUANTITY RECORDED"
          value={salesQty}
          onChangeText={setSalesQty}
          placeholder="0"
          keyboardType="numeric"
          required
        />

        <Input
          label="RETURN QUANTITY RECORDED"
          value={returnQty}
          onChangeText={setReturnQty}
          placeholder="0"
          keyboardType="numeric"
        />

        <Text style={styles.sectionLabel}>ADJUSTMENT REASON (FRD SPEC) *</Text>
        <View style={styles.pillRow}>
          {(['Damage', 'Expired', 'Other'] as const).map((r) => (
            <Pressable key={r} onPress={() => setReason(r)}>
              <Pill color={reason === r ? theme.colors.primary : theme.colors.textMuted}>{r}</Pill>
            </Pressable>
          ))}
        </View>

        <Card style={styles.alertCard}>
          <View style={styles.alertRow}>
            <Icon name="alert-circle" size={20} color={theme.colors.amber} />
            <Text style={styles.alertText}>
              Any variance between recorded sales/returns and physical stock will be flagged for Admin review.
            </Text>
          </View>
        </Card>

        <Button
          title="Submit Reconciliation Request"
          onPress={handleSubmit}
          loading={loading}
          size="large"
          iconName="check"
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  productHeader: { gap: theme.spacing.xs },
  productLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  productTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark },
  stockSub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
  sectionLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.8 },
  pillRow: { flexDirection: 'row', gap: theme.spacing.xs },
  alertCard: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  alertText: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 12, color: '#92400E', lineHeight: 18 },
  submitBtn: { marginTop: theme.spacing.sm },
});
