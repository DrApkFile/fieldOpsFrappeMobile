import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { mockCampaigns } from '../services/mockService';
import { Campaign, RouteName } from '../types';

interface CampaignSelectScreenProps {
  onClockInSuccess: (campaign: Campaign) => void;
  onNavigate: (route: RouteName, data?: any) => void;
}

export const CampaignSelectScreen: React.FC<CampaignSelectScreenProps> = ({ onClockInSuccess, onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const [selected, setSelected] = useState<Campaign>(mockCampaigns[1] || mockCampaigns[0]);

  const handleSelectCampaign = (c: Campaign) => {
    setSelected(c);
  };

  const handleProceed = () => {
    // Navigate to Attendance / Clock In screen for selected campaign
    onNavigate('attendance', { campaign: selected });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>CAMPAIGN DRIVE SELECTION</Text>
          <Text style={styles.title}>Select Active Campaign</Text>
          <Text style={styles.sub}>Choose your assigned drive for today. After selecting, you will be taken to clock in with auto-location tag and selfie verification.</Text>
        </View>

        <Text style={styles.sectionLabel}>ASSIGNED CAMPAIGNS</Text>

        <View style={styles.list}>
          {mockCampaigns.map((c) => {
            const isSelected = selected.id === c.id;
            const isOutlets = c.ctaType === 'outlets' || c.modules?.includes('orders') || c.modules?.includes('merchandising');
            const ctaLabel = isOutlets ? 'Go to Outlets' : 'Go to Leads';

            return (
              <Pressable key={c.id} onPress={() => handleSelectCampaign(c)}>
                <Card style={[styles.card, isSelected ? styles.cardSelected : undefined]}>
                  <View style={styles.cardTop}>
                    <View style={[styles.typeBadge, { backgroundColor: isOutlets ? '#1E2A38' : '#2A1E38' }]}>
                      <Icon name={isOutlets ? 'store' : 'users'} size={14} color={isOutlets ? theme.colors.primaryLight : theme.colors.amber} />
                      <Text style={[styles.typeText, { color: isOutlets ? theme.colors.primaryLight : theme.colors.amber }]}>
                        {c.type.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.beatText}>{c.beat}</Text>
                  </View>

                  <Text style={styles.campName}>{c.name}</Text>
                  <Text style={styles.campDesc}>{c.description}</Text>

                  <View style={styles.cardMeta}>
                    <Text style={styles.metaText}>Target: {c.target}</Text>
                    <Text style={styles.metaText}>{c.startDate} – {c.endDate}</Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${c.progress}%`, backgroundColor: theme.colors.primaryLight }]} />
                  </View>

                  <View style={styles.cardFooterRow}>
                    <View style={styles.checkRow}>
                      <Icon
                        name={isSelected ? 'check-circle' : 'circle'}
                        size={20}
                        color={isSelected ? theme.colors.primaryLight : theme.colors.darkMuted}
                      />
                      <Text style={[styles.selectedLabel, isSelected && styles.selectedLabelActive]}>
                        {isSelected ? 'Selected' : 'Tap to select'}
                      </Text>
                    </View>

                    <View style={[styles.ctaPill, isSelected && styles.ctaPillSelected]}>
                      <Text style={[styles.ctaPillText, isSelected && styles.ctaPillTextSelected]}>
                        {ctaLabel} →
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>

        <Button
          title={`Proceed to Clock In (${selected.ctaType === 'outlets' ? 'Outlets' : 'Leads'} Drive) →`}
          onPress={handleProceed}
          variant="primary"
          size="large"
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.safeTopPadding + 10, paddingBottom: 40, gap: theme.spacing.md },
  header: { gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
  kicker: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.primaryLight, letterSpacing: 1 },
  title: { fontFamily: theme.fonts.display, fontSize: 24, color: theme.colors.darkText },
  sub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, lineHeight: 19 },
  sectionLabel: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  list: { gap: theme.spacing.md },
  card: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm, padding: theme.spacing.lg },
  cardSelected: { borderColor: theme.colors.primaryLight, backgroundColor: '#1A182D' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.sm },
  typeText: { fontFamily: theme.fonts.bold, fontSize: 11, letterSpacing: 0.5 },
  beatText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkMuted },
  campName: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText },
  campDesc: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkMuted },
  progressTrack: { height: 5, backgroundColor: theme.colors.darkBorder, borderRadius: theme.radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: theme.radius.full },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectedLabel: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkMuted },
  selectedLabelActive: { color: theme.colors.primaryLight },
  ctaPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder },
  ctaPillSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryLight },
  ctaPillText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.darkMuted },
  ctaPillTextSelected: { color: '#FFFFFF' },
  cta: { marginTop: theme.spacing.md },
});
