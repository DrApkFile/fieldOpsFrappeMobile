import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon, IconName } from '../components/Icon';
import { mockNotifications } from '../services/mockService';
import { RouteName } from '../types';

interface NotificationsScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const getIconName = (type: string): IconName => {
    switch (type) {
      case 'assignment':
        return 'clipboard-list';
      case 'stock':
        return 'package';
      case 'geofence':
        return 'compass';
      case 'eod':
        return 'clock';
      default:
        return 'bell';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notifications"
        subtitle={showEmptyState ? '0 unread' : '2 unread alerts'}
        onNavigate={onNavigate}
        rightAction={
          <Pressable onPress={() => setShowEmptyState(!showEmptyState)}>
            <Text style={styles.toggleText}>{showEmptyState ? 'Show Feed' : 'Test Empty'}</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {showEmptyState ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Icon name="bell" size={28} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>You are all caught up with your daily territory alerts.</Text>
          </Card>
        ) : (
          mockNotifications.map((item) => (
            <Card key={item.id} style={styles.noticeCard}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}18` }]}>
                  <Icon name={getIconName(item.type)} size={20} color={item.color} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                  <Text style={styles.time}>{item.time} ago</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.sm },
  toggleText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.primary },
  emptyCard: { alignItems: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.xs, marginTop: theme.spacing.lg },
  emptyIconBox: { width: 54, height: 54, borderRadius: 27, backgroundColor: theme.colors.cardBorder, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xs },
  emptyTitle: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.textDark },
  emptySub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, textAlign: 'center' },
  noticeCard: { padding: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
  iconBox: { width: 42, height: 42, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  title: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textDark },
  body: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted, lineHeight: 18, marginTop: 2 },
  time: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.textLight, marginTop: 4 },
});
