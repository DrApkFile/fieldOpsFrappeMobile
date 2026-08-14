import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Icon, IconName } from '../components/Icon';
import { mockCampaigns } from '../services/mockService';
import { RouteName, Campaign } from '../types';

interface CampaignDetailScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  campaignData?: Campaign;
}

export const CampaignDetailScreen: React.FC<CampaignDetailScreenProps> = ({ onNavigate, campaignData }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const c = campaignData || mockCampaigns[0];

  const activities: { title: string; route: RouteName; icon: IconName }[] = [
    { title: 'Capture store lead', route: 'leadForm', icon: 'users' },
    { title: 'View Orders', route: 'ordersList', icon: 'shopping-bag' },
    { title: 'View Pipeline', route: 'pipelineOverview', icon: 'trending-up' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Campaign Details" subtitle={c.type} onNavigate={onNavigate} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.heroCard, { backgroundColor: `${c.color}15` }]}>
          <Pill color={c.color}>{c.type}</Pill>
          <Text style={styles.heroTitle}>{c.name}</Text>
          <Text style={styles.heroDesc}>{c.description}</Text>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${c.progress}%`, backgroundColor: c.color }]} />
          </View>
          <Text style={[styles.target, { color: c.color }]}>
            {c.target} · {c.progress}% Complete
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Assigned Activities</Text>
        {activities.map((a, index) => (
          <Card key={a.title} style={styles.activityCard} onPress={() => onNavigate(a.route)}>
            <View style={styles.numBadge}>
              <Text style={styles.numText}>{index + 1}</Text>
            </View>
            <View style={styles.activityTextContainer}>
              <Text style={styles.activityTitle}>{a.title}</Text>
              <Text style={styles.activitySub}>Tap to start execution</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  heroCard: { gap: theme.spacing.xs, borderColor: 'transparent' },
  heroTitle: { fontFamily: theme.fonts.bold, fontSize: 22, color: theme.colors.textDark, marginTop: 4 },
  heroDesc: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.textMuted, lineHeight: 20 },
  track: { height: 8, backgroundColor: theme.colors.cardBorder, borderRadius: 4, overflow: 'hidden', marginTop: theme.spacing.xs },
  fill: { height: '100%', borderRadius: 4 },
  target: { fontFamily: theme.fonts.bold, fontSize: 13, marginTop: 4 },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  activityCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  numBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.primary },
  activityTextContainer: { flex: 1 },
  activityTitle: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  activitySub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
});
