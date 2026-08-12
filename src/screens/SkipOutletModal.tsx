import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { SkipRecord } from '../types';

interface SkipOutletModalProps {
  visible: boolean;
  outletName: string;
  outletId: string;
  onClose: () => void;
  onSubmitSkip: (record: SkipRecord) => void;
}

const SKIP_REASONS = [
  'Outlet Closed',
  'No Stock Available',
  'Owner Not Available',
  'Wrong Location',
  'Temporary Closure',
  'Other',
];

export const SkipOutletModal: React.FC<SkipOutletModalProps> = ({
  visible,
  outletName,
  outletId,
  onClose,
  onSubmitSkip,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOther = selectedReason === 'Other';
  const isValid = selectedReason !== null && (!isOther || note.trim().length > 0);

  const handleSubmit = async () => {
    if (!selectedReason || !isValid) return;
    setSubmitting(true);

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    let gps = 'Location unavailable';
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        gps = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      }
    } catch (e) {
      // keep the "unavailable" fallback — never fabricate coordinates
    }

    const skipRecord: SkipRecord = {
      id: `skip-${Date.now()}`,
      outletId,
      reason: selectedReason,
      note: isOther ? note.trim() : undefined,
      gps,
      timestamp: nowStr,
    };

    onSubmitSkip(skipRecord);
    setSubmitting(false);
    setSelectedReason(null);
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />

              {/* Title Header (Matching Image 5) */}
              <View style={styles.header}>
                <Text style={styles.title}>Skip outlet</Text>
                <Text style={styles.sub}>
                  Select a reason. GPS and timestamp are captured automatically.
                </Text>
              </View>

              {/* Reasons List */}
              <View style={styles.reasonsList}>
                {SKIP_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <Pressable
                      key={reason}
                      onPress={() => setSelectedReason(reason)}
                      style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                    >
                      <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                        {reason}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Note Input if Other is selected */}
              {isOther && (
                <View style={styles.noteWrapper}>
                  <Text style={styles.noteLabel}>Required Reason Note *</Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Describe why this outlet is skipped..."
                    placeholderTextColor={theme.colors.darkMuted}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}

              {/* Submit Button */}
              <Button
                title={submitting ? 'Submitting...' : 'Submit Skip Status'}
                onPress={handleSubmit}
                variant="primary"
                size="large"
                disabled={!isValid || submitting}
                loading={submitting}
                style={styles.submitBtn}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: theme.colors.darkCard,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.darkBorder,
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: { gap: 4 },
  title: { fontFamily: theme.fonts.bold, fontSize: 20, color: theme.colors.darkText },
  sub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, lineHeight: 18 },
  reasonsList: { gap: theme.spacing.xs },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  reasonOptionSelected: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: theme.colors.primaryBg,
  },
  reasonText: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText },
  reasonTextSelected: { color: theme.colors.primaryLight, fontFamily: theme.fonts.bold },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.darkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: { borderColor: theme.colors.primaryLight },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primaryLight },
  noteWrapper: { gap: 6 },
  noteLabel: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkMuted },
  noteInput: {
    backgroundColor: theme.colors.darkInputBg,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.darkText,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  submitBtn: { marginTop: theme.spacing.xs },
});
