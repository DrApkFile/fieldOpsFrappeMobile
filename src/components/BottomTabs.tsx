import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Icon, IconName } from './Icon';
import { RouteName } from '../types';

interface BottomTabsProps {
  activeRoute: RouteName;
  onNavigate: (route: RouteName) => void;
}

interface TabItem {
  id: RouteName;
  label: string;
  icon: IconName;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ activeRoute, onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'draftsList', label: 'Drafts', icon: 'refresh' },
    { id: 'inventory', label: 'Stock Request', icon: 'package' },
    { id: 'eodSummary', label: 'End of Day', icon: 'clock' },
    { id: 'profile', label: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.id;
        const color = isActive ? theme.colors.navy : theme.colors.textMuted;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onNavigate(tab.id)}
            style={styles.tabBtn}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={color}
              strokeWidth={isActive ? 2.3 : 1.8}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardWhite,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 62,
    paddingTop: 8,
    elevation: 10,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  activeLabel: {
    color: theme.colors.navy,
    fontFamily: theme.fonts.bold,
  },
});
