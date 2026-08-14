import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icon';
import { Button } from './Button';

interface OptionPickerSheetProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string | string[] | null;
  multiple?: boolean;
  required?: boolean;
  onConfirm: (value: string | string[]) => void;
  onClose: () => void;
}

export const OptionPickerSheet: React.FC<OptionPickerSheetProps> = ({
  visible,
  title,
  options,
  selected,
  multiple = false,
  required = false,
  onConfirm,
  onClose,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const initialMulti = Array.isArray(selected) ? selected : [];
  const [draftSelection, setDraftSelection] = useState<string[]>(initialMulti);

  useEffect(() => {
    if (visible) setDraftSelection(Array.isArray(selected) ? selected : []);
  }, [visible, selected]);

  const toggleMulti = (option: string) => {
    setDraftSelection((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleSingleSelect = (option: string) => {
    onConfirm(option);
    onClose();
  };

  const handleConfirmMulti = () => {
    onConfirm(draftSelection);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />
              <Text style={styles.title}>{title}</Text>

              <View style={styles.optionsList}>
                {options.map((option) => {
                  const isSelected = multiple
                    ? draftSelection.includes(option)
                    : selected === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => (multiple ? toggleMulti(option) : handleSingleSelect(option))}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {option}
                      </Text>
                      {multiple ? (
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Icon name="check" size={13} color="#FFFFFF" />}
                        </View>
                      ) : (
                        <Icon
                          name={isSelected ? 'check-circle' : 'circle'}
                          size={20}
                          color={isSelected ? theme.colors.primary : theme.colors.darkMuted}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {multiple && (
                <Button
                  title="Done"
                  onPress={handleConfirmMulti}
                  variant="primary"
                  size="large"
                  disabled={required && draftSelection.length === 0}
                  style={styles.confirmBtn}
                />
              )}
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
    maxHeight: '80%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.darkBorder,
    alignSelf: 'center',
  },
  title: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText },
  optionsList: { gap: theme.spacing.xs },
  optionRow: {
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
  optionRowSelected: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: theme.colors.primaryBg,
  },
  optionText: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText, flex: 1 },
  optionTextSelected: { color: theme.colors.primaryLight, fontFamily: theme.fonts.bold },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.darkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  confirmBtn: { marginTop: theme.spacing.xs },
});
