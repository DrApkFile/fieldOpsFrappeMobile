import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { mockDelay } from '../services/mockService';
import { RouteName } from '../types';

interface SyncScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const SyncScreen: React.FC<SyncScreenProps> = ({ onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const [syncing, setSyncing] = useState(false);

  const handleSyncNow = async () => {
    setSyncing(true);
    await mockDelay(1000);
    setSyncing(false);
    Alert.alert('Synchronization Complete', 'All 2 pending local records have synced cleanly with FieldOps backend.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Offline Data Sync" subtitle="Local Persistence Queue" onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.stateCard}>
          <View style={styles.iconCircle}>
            <Icon name="refresh" size={28} color={theme.colors.amber} />
          </View>
          <Text style={styles.title}>{syncing ? 'Synchronizing Field Work...' : '2 Records Waiting to Sync'}</Text>
          <Text style={styles.sub}>
            {syncing
              ? 'Uploading queued lead submissions and survey responses to ERPNext tenant gateway.'
              : 'Your captured field data is safely stored on this device and will automatically sync when connectivity returns.'}
          </Text>
        </Card>

        <Button
          title={syncing ? 'Syncing...' : 'Sync Pending Items Now'}
          onPress={handleSyncNow}
          loading={syncing}
          size="large"
          iconName="refresh"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  stateCard: { alignItems: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.xs, marginTop: theme.spacing.md },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.amberLight, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xs },
  title: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark, textAlign: 'center' },
  sub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 19 },
});
