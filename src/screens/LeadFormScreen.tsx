import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Icon } from '../components/Icon';
import { submitMockData } from '../services/mockService';
import { RouteName, Lead } from '../types';

interface LeadFormScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  onAddLead: (lead: Lead) => void;
}

export const LeadFormScreen: React.FC<LeadFormScreenProps> = ({ onNavigate, onAddLead }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState('Store Visit');
  const [pipeline, setPipeline] = useState('Retail Pipeline');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone) {
      Alert.alert('Required Information', 'Lead name and contact phone number are required per FRD v1.1 spec.');
      return;
    }
    setLoading(true);
    await submitMockData();
    setLoading(false);

    const newLead: Lead = {
      id: `l_${Date.now()}`,
      name,
      phone,
      email: email || undefined,
      company: company || 'Independent Retailer',
      stage: 'New',
      score: 55,
      next: 'Follow up within 48 hours',
      value: '₦120,000',
      source,
      pipeline,
      notes,
      gps: '6.4474, 3.4723 (Auto-captured)',
    };

    onAddLead(newLead);
    onNavigate('leadSuccess');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Capture New Lead" subtitle="Location auto-tagged" onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="LEAD NAME" value={name} onChangeText={setName} placeholder="Owner / Manager name" required leftIcon="user" />
        <Input label="CONTACT PHONE" value={phone} onChangeText={setPhone} placeholder="+234 800 000 0000" keyboardType="phone-pad" required leftIcon="phone" />
        <Input label="EMAIL" value={email} onChangeText={setEmail} placeholder="manager@store.com" keyboardType="email-address" leftIcon="mail" />
        <Input label="COMPANY / STORE NAME" value={company} onChangeText={setCompany} placeholder="FreshMart Groceries" leftIcon="building" />

        {/* Lead Source Selector */}
        <Text style={styles.sectionLabel}>LEAD SOURCE *</Text>
        <View style={styles.pillRow}>
          {['Store Visit', 'Referral', 'Event / Drive'].map((item) => (
            <Pressable key={item} onPress={() => setSource(item)}>
              <Pill color={source === item ? theme.colors.primary : theme.colors.textMuted}>{item}</Pill>
            </Pressable>
          ))}
        </View>

        {/* Pipeline Selector */}
        <Text style={styles.sectionLabel}>ASSIGNED PIPELINE *</Text>
        <View style={styles.pillRow}>
          {['Retail Pipeline', 'Wholesale Pipeline'].map((item) => (
            <Pressable key={item} onPress={() => setPipeline(item)}>
              <Pill color={pipeline === item ? theme.colors.primary : theme.colors.textMuted}>{item}</Pill>
            </Pressable>
          ))}
        </View>

        <Input label="INTERACTION NOTES" value={notes} onChangeText={setNotes} placeholder="Key discussion points, initial order interest..." multiline />

        <Card style={styles.gpsBanner}>
          <Icon name="map-pin" size={18} color={theme.colors.teal} />
          <Text style={styles.gpsText}>GPS coordinates will be attached automatically upon save.</Text>
        </Card>

        <Button title="Save & Queue Lead" onPress={handleSubmit} loading={loading} size="large" iconName="check" style={styles.submitBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.sm },
  sectionLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', marginTop: theme.spacing.xs },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
  gpsBanner: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingVertical: theme.spacing.md },
  gpsText: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  submitBtn: { marginTop: theme.spacing.md },
});
