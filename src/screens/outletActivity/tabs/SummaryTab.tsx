import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Card } from '../../../components/Card';
import { Icon } from '../../../components/Icon';
import { useFieldStore } from '../../../store/useFieldStore';
import { groupSalesByInvoice, groupOrdersByRef } from '../../../utils/transactions';

interface SummaryTabProps {
  outletId: string;
  onOpenTransaction: (kind: 'sale' | 'order', ref: string) => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ outletId, onOpenTransaction }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { getSalesForOutlet, getOrdersForOutlet, getSurveysForOutlet, getPhotoCapturesForOutlet } = useFieldStore();

  const sales = groupSalesByInvoice(getSalesForOutlet(outletId));
  const orders = groupOrdersByRef(getOrdersForOutlet(outletId));
  const surveys = getSurveysForOutlet(outletId);
  const photos = getPhotoCapturesForOutlet(outletId);

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{sales.length}</Text>
          <Text style={styles.statLabel}>SALES</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{orders.length}</Text>
          <Text style={styles.statLabel}>ORDERS</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{surveys.length}</Text>
          <Text style={styles.statLabel}>SURVEYS</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{photos.length}</Text>
          <Text style={styles.statLabel}>PHOTOS</Text>
        </View>
      </View>

      {sales.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SALES ({sales.length})</Text>
          {sales.map((t) => (
            <Pressable key={t.ref} onPress={() => onOpenTransaction('sale', t.ref)}>
              <Card style={styles.txCard}>
                <View style={styles.txRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle}>{t.lines.length} item{t.lines.length === 1 ? '' : 's'} · {t.customerName}</Text>
                    <Text style={styles.txSub}>{t.timestamp}</Text>
                  </View>
                  <Text style={styles.txAmount}>₦{t.total.toLocaleString()}</Text>
                  <Icon name="chevron-right" size={16} color={theme.colors.darkMuted} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      {orders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDERS ({orders.length})</Text>
          {orders.map((t) => (
            <Pressable key={t.ref} onPress={() => onOpenTransaction('order', t.ref)}>
              <Card style={styles.txCard}>
                <View style={styles.txRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle}>{t.lines.length} item{t.lines.length === 1 ? '' : 's'} · {t.customerName}</Text>
                    <Text style={styles.txSub}>{t.status} · {t.timestamp}</Text>
                  </View>
                  <Text style={styles.txAmount}>₦{t.total.toLocaleString()}</Text>
                  <Icon name="chevron-right" size={16} color={theme.colors.darkMuted} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      {surveys.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SURVEYS ({surveys.length})</Text>
          {surveys.map((s) => (
            <Card key={s.id} style={styles.txCard}>
              <View style={styles.txRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{s.surveyName || 'Field Survey'}</Text>
                  <Text style={styles.txSub}>{s.answers.length} response items · {s.timestamp}</Text>
                </View>
                <View style={styles.surveyTag}>
                  <Icon name="check-circle" size={12} color={theme.colors.visitedText} />
                  <Text style={styles.surveyTagText}>Submitted</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {sales.length === 0 && orders.length === 0 && surveys.length === 0 && (
        <Text style={styles.emptyText}>No activity recorded for this visit yet.</Text>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { gap: theme.spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  statCell: {
    flexBasis: '47%', flexGrow: 1,
    backgroundColor: theme.colors.darkCard, borderWidth: 1, borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.xl, paddingVertical: 16, alignItems: 'center', gap: 4,
  },
  statVal: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.darkText },
  statLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  section: { gap: theme.spacing.xs },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  txCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, padding: theme.spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  txTitle: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  txSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: 2 },
  txAmount: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.primaryLight },
  surveyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.visitedBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.radius.sm },
  surveyTagText: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.visitedText },
  emptyText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, textAlign: 'center', paddingVertical: theme.spacing.xl },
});
