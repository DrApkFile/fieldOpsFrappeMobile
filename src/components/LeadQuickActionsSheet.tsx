import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface LeadQuickActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onEditLead: () => void;
  onRecordSale: () => void;
  onRunSurvey: () => void;
}

export const LeadQuickActionsSheet: React.FC<LeadQuickActionsSheetProps> = ({
  visible, onClose, onEditLead, onRecordSale, onRunSurvey,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const actions = [
    { label: 'Edit Lead', onPress: onEditLead },
    { label: 'Record Sale', onPress: onRecordSale },
    { label: 'Run Survey', onPress: onRunSurvey },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />
              <Text style={styles.title}>Quick actions</Text>

              {actions.map((a) => (
                <Pressable
                  key={a.label}
                  onPress={() => {
                    onClose();
                    a.onPress();
                  }}
                  style={styles.actionRow}
                >
                  <Text style={styles.actionText}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheetContainer: {
    backgroundColor: theme.colors.darkCard, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.darkBorder,
  },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.darkBorder, alignSelf: 'center', marginBottom: 4 },
  title: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.darkMuted, marginBottom: 4 },
  actionRow: {
    backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.lg, paddingVertical: 16, alignItems: 'center',
  },
  actionText: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
});
