import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { OptionPickerSheet } from '../components/OptionPickerSheet';
import { useFieldStore } from '../store/useFieldStore';
import { Product } from '../types';

const ADJUSTMENT_REASONS = [
  'Damaged Goods',
  'Expired Stock',
  'Recount Correction',
  'Theft / Loss',
  'Warehouse Transfer',
  'Other Adjustment',
];

interface StockAdjustmentSheetProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

export const StockAdjustmentSheet: React.FC<StockAdjustmentSheetProps> = ({ visible, product, onClose }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { dispatch } = useFieldStore();

  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState<string | null>(null);
  const [reasonPickerOpen, setReasonPickerOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setDelta(0);
      setReason(null);
    }
  }, [visible]);

  if (!product) return null;

  const newStock = product.stock + delta;
  const isValid = delta !== 0 && reason !== null && newStock >= 0;

  const handleSubmit = () => {
    if (!isValid || !reason) return;
    dispatch({
      type: 'ADJUST_STOCK',
      productId: product.id,
      qtyChange: delta,
      reason,
      movementType: 'adjustment',
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />
              <Text style={styles.title}>Adjust Stock</Text>
              <Text style={styles.sub}>{product.name} · currently {product.stock} in stock</Text>

              <View style={styles.stepperRow}>
                <Pressable onPress={() => setDelta((d) => d - 1)} style={styles.stepBtn}>
                  <Icon name="minus" size={20} color={theme.colors.darkText} />
                </Pressable>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.deltaVal}>{delta > 0 ? `+${delta}` : delta}</Text>
                  <Text style={styles.newStockText}>New stock: {newStock < 0 ? '—' : newStock}</Text>
                </View>
                <Pressable onPress={() => setDelta((d) => d + 1)} style={styles.stepBtn}>
                  <Icon name="plus" size={20} color={theme.colors.darkText} />
                </Pressable>
              </View>
              {newStock < 0 && <Text style={styles.errorText}>Adjustment cannot take stock below zero.</Text>}

              <Pressable onPress={() => setReasonPickerOpen(true)} style={styles.reasonTrigger}>
                <Text style={styles.reasonTriggerText}>{reason || 'Select a reason *'}</Text>
                <Icon name="chevron-down" size={18} color={theme.colors.darkMuted} />
              </Pressable>

              <Button
                title="Confirm Adjustment"
                onPress={handleSubmit}
                variant="primary"
                size="large"
                disabled={!isValid}
                style={styles.submitBtn}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      <OptionPickerSheet
        visible={reasonPickerOpen}
        title="Reason for Adjustment"
        options={ADJUSTMENT_REASONS}
        selected={reason}
        required
        onConfirm={(val) => setReason(val as string)}
        onClose={() => setReasonPickerOpen(false)}
      />
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheetContainer: {
    backgroundColor: theme.colors.darkCard, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.darkBorder,
  },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.darkBorder, alignSelf: 'center' },
  title: { fontFamily: theme.fonts.bold, fontSize: 20, color: theme.colors.darkText },
  sub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl, paddingVertical: theme.spacing.md },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, alignItems: 'center', justifyContent: 'center' },
  deltaVal: { fontFamily: theme.fonts.display, fontSize: 26, color: theme.colors.darkText, minWidth: 70, textAlign: 'center' },
  newStockText: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted, marginTop: 2 },
  errorText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.red, textAlign: 'center' },
  reasonTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, paddingVertical: 14,
  },
  reasonTriggerText: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText },
  submitBtn: { marginTop: theme.spacing.xs },
});
