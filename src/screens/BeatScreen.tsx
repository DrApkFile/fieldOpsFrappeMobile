import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { mockPointsOfInterest } from '../services/mockService';
import { RouteName } from '../types';

interface BeatScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const BeatScreen: React.FC<BeatScreenProps> = ({ onNavigate }) => {
  const [isOutside, setIsOutside] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="My Beat & Map" subtitle="Lekki Phase 1 Territory" onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Mock Map View */}
        <Card style={styles.mapCard}>
          <View style={[styles.polygonBoundary, { borderColor: isOutside ? theme.colors.red : theme.colors.teal }]}>
            <View style={styles.agentPin}>
              <Text style={styles.agentPinText}>Agent</Text>
            </View>

            <View style={styles.poiDot1} />
            <View style={styles.poiDot2} />
          </View>
          <Text style={styles.mapLabel}>Territory Boundary: Lekki Phase 1</Text>
        </Card>

        {/* Territory Status Alert Banner */}
        <Card style={[styles.statusBanner, { backgroundColor: isOutside ? '#FEF2F2' : '#F0FDF4', borderColor: isOutside ? '#FCA5A5' : '#86EFAC' }]}>
          <View style={styles.bannerRow}>
            <Icon name={isOutside ? 'alert-circle' : 'check-circle'} size={24} color={isOutside ? theme.colors.red : theme.colors.emerald} />
            <View style={styles.bannerText}>
              <Text style={[styles.bannerTitle, { color: isOutside ? theme.colors.red : theme.colors.emerald }]}>
                {isOutside ? 'Outside Assigned Territory' : 'Inside Beat Boundary'}
              </Text>
              <Text style={styles.bannerSub}>
                {isOutside ? 'Activity outside boundary will be flagged for review.' : 'GPS signal active (±12m accuracy).' }
              </Text>
            </View>
          </View>
        </Card>

        {/* Simulation Toggle */}
        <Button
          title={isOutside ? 'Simulate Entering Territory' : 'Simulate Boundary Exit Alert'}
          onPress={() => setIsOutside(!isOutside)}
          variant="outline"
          iconName="sliders"
        />

        {/* Points of Interest (POIs) */}
        <Text style={styles.sectionTitle}>Key Points of Interest (POIs)</Text>
        {mockPointsOfInterest.map((poi) => (
          <Card key={poi.id} style={styles.poiCard}>
            <View style={styles.poiIconBox}>
              <Icon name="map-pin" size={20} color={theme.colors.teal} />
            </View>
            <View style={styles.poiDetails}>
              <Text style={styles.poiName}>{poi.name}</Text>
              <Text style={styles.poiAddress}>{poi.address} · {poi.distance}</Text>
            </View>
            <Button
              title="Navigate"
              onPress={() => Alert.alert('Beat Navigation', `Turn-by-turn navigation started to ${poi.name}.`)}
              size="small"
              variant="ghost"
              iconName="navigation"
            />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  mapCard: { height: 230, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  polygonBoundary: { width: '80%', height: 140, borderWidth: 3, borderRadius: theme.radius.xl, transform: [{ rotate: '-6deg' }], alignItems: 'center', justifyContent: 'center', position: 'relative' },
  agentPin: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.colors.limePrimary },
  agentPinText: { fontFamily: theme.fonts.bold, fontSize: 11, color: '#000' },
  poiDot1: { position: 'absolute', top: 20, left: 30, width: 12, height: 12, borderRadius: 6, backgroundColor: '#38BDF8' },
  poiDot2: { position: 'absolute', bottom: 25, right: 40, width: 12, height: 12, borderRadius: 6, backgroundColor: '#38BDF8' },
  mapLabel: { position: 'absolute', bottom: 8, right: 12, fontFamily: theme.fonts.regular, fontSize: 11, color: '#94A3B8' },
  statusBanner: { paddingVertical: theme.spacing.md },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  bannerText: { flex: 1 },
  bannerTitle: { fontFamily: theme.fonts.bold, fontSize: 15 },
  bannerSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: theme.spacing.xs },
  poiCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  poiIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.tealLight, alignItems: 'center', justifyContent: 'center' },
  poiDetails: { flex: 1 },
  poiName: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  poiAddress: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});
