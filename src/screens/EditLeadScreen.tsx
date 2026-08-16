import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { mockLeads } from '../services/mockService';
import { parseLeadValue } from '../utils/pipelineMetrics';
import { RouteName, Lead } from '../types';

interface EditLeadScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  leadData?: Lead;
  onUpdateLead: (lead: Lead) => void;
}

const PIPELINE_OPTIONS = ['Retail Sales', 'Loan Origination', 'Merchant Onboarding'];
const SOURCE_OPTIONS = ['Walk-in', 'Referral', 'Cold Call', 'Outlet Visit', 'Campaign', 'Social'];

export const EditLeadScreen: React.FC<EditLeadScreenProps> = ({ onNavigate, leadData, onUpdateLead }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const l = leadData || mockLeads[0];

  const [fullName, setFullName] = useState(l.name);
  const [phone, setPhone] = useState(l.phone);
  const [email, setEmail] = useState(l.email || '');
  const [parentCompany, setParentCompany] = useState(l.parentCompany || '');
  const [outlet, setOutlet] = useState(l.company);
  const [address, setAddress] = useState(l.address || '');
  const [estValue, setEstValue] = useState(l.value ? String(parseLeadValue(l.value)) : '');
  const [pipeline, setPipeline] = useState(PIPELINE_OPTIONS.includes(l.pipeline || '') ? l.pipeline! : PIPELINE_OPTIONS[0]);
  const [source, setSource] = useState(SOURCE_OPTIONS.includes(l.source || '') ? l.source! : SOURCE_OPTIONS[0]);
  const [notes, setNotes] = useState(l.notes || '');

  const handleSave = () => {
    if (!fullName.trim() || !phone.trim() || !outlet.trim()) {
      Alert.alert('Required Fields', 'Full name, phone, and outlet are required.');
      return;
    }

    const numericValue = parseFloat(estValue) || 0;
    const updated: Lead = {
      ...l,
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      parentCompany: parentCompany.trim() || undefined,
      company: outlet.trim(),
      address: address.trim() || undefined,
      value: `₦${numericValue.toLocaleString()}`,
      pipeline,
      source,
      notes: notes.trim() || undefined,
    };

    onUpdateLead(updated);
    onNavigate('leadDetail', updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Lead" subtitle={l.name} onNavigate={onNavigate} onBackPress={() => onNavigate('leadDetail', l)} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>CONTACT</Text>
        <Input label="Full Name" value={fullName} onChangeText={setFullName} required dark />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" required dark />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="ada@example.com" keyboardType="email-address" dark />
        <Input label="Company" value={parentCompany} onChangeText={setParentCompany} placeholder="QuickShop Ltd." dark />

        <Text style={styles.sectionTitle}>BUSINESS</Text>
        <Input label="Outlet" value={outlet} onChangeText={setOutlet} required dark />
        <Input label="Address" value={address} onChangeText={setAddress} placeholder="12 Marine Rd, Oniru" dark />
        <Input label="Est. Value (₦)" value={estValue} onChangeText={setEstValue} keyboardType="numeric" dark />

        <Text style={styles.sectionTitle}>PIPELINE</Text>
        <Text style={styles.fieldLabel}>Assigned Pipeline <Text style={styles.required}>*</Text></Text>
        <View style={styles.chipRow}>
          {PIPELINE_OPTIONS.map((opt) => {
            const active = pipeline === opt;
            return (
              <Pressable key={opt} onPress={() => setPipeline(opt)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: theme.spacing.sm }]}>Lead Source <Text style={styles.required}>*</Text></Text>
        <View style={styles.chipRow}>
          {SOURCE_OPTIONS.map((opt) => {
            const active = source === opt;
            return (
              <Pressable key={opt} onPress={() => setSource(opt)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>NOTES</Text>
        <Input label="" value={notes} onChangeText={setNotes} placeholder="Interested in the ₦250k tier." multiline dark />

        <Button title="Save Changes" onPress={handleSave} size="large" style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.xs },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.primaryLight, letterSpacing: 0.8, marginTop: theme.spacing.md, marginBottom: 2 },
  fieldLabel: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkText, marginBottom: 6 },
  required: { color: theme.colors.red },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: theme.radius.full, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkMuted },
  chipTextActive: { color: '#FFFFFF', fontFamily: theme.fonts.bold },
  saveBtn: { marginTop: theme.spacing.lg },
});
