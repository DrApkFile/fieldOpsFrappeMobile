import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { RouteName, Outlet } from '../types';

interface EditOutletScreenProps {
  routeData?: { outletId?: string };
  onNavigate: (route: RouteName, data?: any) => void;
}

const OUTLET_TYPES = ['Supermarket', 'Kiosk', 'Pharmacy', 'Wholesale', 'Mini-mart', 'Retail Store'];

export const EditOutletScreen: React.FC<EditOutletScreenProps> = ({ routeData, onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const { state, dispatch } = useFieldStore();
  const outletId = routeData?.outletId;
  const outlet = state.outlets.find((o) => o.id === outletId) || state.outlets[0];

  const [outletName, setOutletName] = useState(outlet?.name || '');
  const [outletType, setOutletType] = useState(outlet?.type || 'Supermarket');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [phone, setPhone] = useState(outlet?.phone || '');
  const [ownerName, setOwnerName] = useState(outlet?.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState(outlet?.ownerPhone || '');
  const [address, setAddress] = useState(outlet?.address || '');
  const [notes, setNotes] = useState(outlet?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!outletName.trim()) {
      Alert.alert('Required', 'Please enter an outlet name.');
      return;
    }

    setSubmitting(true);
    const updatedOutlet: Outlet = {
      ...outlet,
      name: outletName.trim(),
      type: outletType,
      phone: phone.trim(),
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      address: address.trim(),
      notes: notes.trim(),
    };

    dispatch({ type: 'UPDATE_OUTLET', outlet: updatedOutlet });

    setTimeout(() => {
      setSubmitting(false);
      onNavigate('outletDetail', { outletId: outlet.id });
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Edit Outlet"
        subtitle={`#${outlet.id.toUpperCase()}`}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('outletDetail', { outletId: outlet.id })}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>OUTLET INFORMATION</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Outlet type</Text>
            <Pressable
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              style={styles.dropdownBtn}
            >
              <Text style={styles.dropdownText}>{outletType}</Text>
              <Icon name="chevron-down" size={18} color={theme.colors.darkMuted} />
            </Pressable>

            {showTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {OUTLET_TYPES.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      setOutletType(t);
                      setShowTypeDropdown(false);
                    }}
                    style={[styles.dropdownItem, outletType === t && styles.dropdownItemActive]}
                  >
                    <Text style={[styles.dropdownItemText, outletType === t && styles.dropdownItemTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Input
            label="Outlet name"
            value={outletName}
            onChangeText={setOutletName}
            placeholder="Corner Store"
            dark
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>CONTACT & OWNER INFORMATION</Text>

          <Input
            label="Outlet phone number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+234 801 000 0000"
            keyboardType="phone-pad"
            dark
          />

          <Input
            label="Owner / Manager name"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="Mr. Emeka Obi"
            dark
          />

          <Input
            label="Owner mobile number"
            value={ownerPhone}
            onChangeText={setOwnerPhone}
            placeholder="+234 802 000 0000"
            keyboardType="phone-pad"
            dark
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>LOCATION & NOTES</Text>

          <Input
            label="Street Address"
            value={address}
            onChangeText={setAddress}
            placeholder="14 Bourdillon Road, Ikoyi, Lagos"
            dark
          />

          <Input
            label="Field notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Manager usually arrives at 10 AM..."
            multiline
            numberOfLines={3}
            dark
          />
        </Card>

        <Button
          title={submitting ? 'Updating...' : 'Save Changes'}
          onPress={handleSubmit}
          variant="primary"
          size="large"
          loading={submitting}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 60 },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm },
  cardSectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8, marginBottom: 4 },
  inputWrapper: { gap: 6 },
  label: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkText },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.darkInputBg,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    height: 48,
    paddingHorizontal: theme.spacing.md,
  },
  dropdownText: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkText },
  dropdownMenu: {
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownItem: { paddingHorizontal: theme.spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.darkBorder },
  dropdownItemActive: { backgroundColor: theme.colors.primaryBg },
  dropdownItemText: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkMuted },
  dropdownItemTextActive: { color: theme.colors.primaryLight, fontFamily: theme.fonts.bold },
  saveBtn: { marginTop: theme.spacing.sm },
});
