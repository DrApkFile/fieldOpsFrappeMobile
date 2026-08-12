import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'outlets', label: 'Outlets', icon: 'store' },
    { id: 'leads', label: 'Leads', icon: 'users' },
    { id: 'sales', label: 'Sales', icon: 'shopping-bag' },
    { id: 'profile', label: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.id;
        const color = isActive ? theme.colors.primaryLight : theme.colors.darkMuted;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onNavigate(tab.id)}
            style={styles.tabBtn}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <Icon
                name={tab.icon}
                size={22}
                color={color}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: theme.colors.darkSurface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.darkBorder,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 6,
    elevation: 10,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  activeIconWrapper: {
    backgroundColor: theme.colors.primaryBg,
  },
  label: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.darkMuted,
    marginTop: 2,
  },
  activeLabel: {
    color: theme.colors.primaryLight,
    fontFamily: theme.fonts.bold,
  },
});
