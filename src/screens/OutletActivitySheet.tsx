import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { CampaignModule } from '../types';

interface OutletActivitySheetProps {
  visible: boolean;
  outletName: string;
  enabledModules: CampaignModule[];
  onClose: () => void;
  onSelectAction: (action: 'sale' | 'order' | 'survey' | 'edit') => void;
}

export const OutletActivitySheet: React.FC<OutletActivitySheetProps> = ({
  visible,
  outletName,
  enabledModules = [],
  onClose,
  onSelectAction,
}) => {
  const showSale = enabledModules.includes('sales');
  const showOrder = enabledModules.includes('orders');
  const showSurvey = enabledModules.includes('surveys');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />

              <View style={styles.header}>
                <Text style={styles.title}>Outlet activity</Text>
                <Text style={styles.sub}>{outletName}</Text>
              </View>

              <View style={styles.actionsList}>
                {/* New Sale */}
                {showSale && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      onSelectAction('sale');
                    }}
                    style={styles.actionCard}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#2E1065' }]}>
                      <Icon name="shopping-bag" size={20} color={theme.colors.primaryLight} />
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={styles.actionTitle}>New Sale</Text>
                      <Text style={styles.actionSub}>Log a customer cash or credit sale</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={theme.colors.darkMuted} />
                  </Pressable>
                )}

                {/* New Order */}
                {showOrder && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      onSelectAction('order');
                    }}
                    style={styles.actionCard}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#134E4A' }]}>
                      <Icon name="package" size={20} color={theme.colors.teal} />
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={styles.actionTitle}>New Order</Text>
                      <Text style={styles.actionSub}>Book stock replenishment order</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={theme.colors.darkMuted} />
                  </Pressable>
                )}

                {/* New Survey */}
                {showSurvey && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      onSelectAction('survey');
                    }}
                    style={styles.actionCard}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#35260A' }]}>
                      <Icon name="clipboard-list" size={20} color={theme.colors.amber} />
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={styles.actionTitle}>New Survey</Text>
                      <Text style={styles.actionSub}>Fill field analytics & shelf checklist</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={theme.colors.darkMuted} />
                  </Pressable>
                )}

                {/* Edit Outlet */}
                <Pressable
                  onPress={() => {
                    onClose();
                    onSelectAction('edit');
                  }}
                  style={styles.actionCard}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#1F2937' }]}>
                    <Icon name="edit" size={20} color={theme.colors.darkText} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={styles.actionTitle}>Edit Outlet</Text>
                    <Text style={styles.actionSub}>Update contact, address, or owner details</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.darkMuted} />
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: theme.spacing.xxl + 10,
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
  header: { gap: 2 },
  title: { fontFamily: theme.fonts.bold, fontSize: 20, color: theme.colors.darkText },
  sub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted },
  actionsList: { gap: theme.spacing.sm, marginTop: 4 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextCol: { flex: 1, gap: 2 },
  actionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText },
  actionSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
});
