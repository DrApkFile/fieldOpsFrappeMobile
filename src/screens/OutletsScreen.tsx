import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { RouteName, Outlet, OutletStatus } from '../types';

interface OutletsScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const OutletsScreen: React.FC<OutletsScreenProps> = ({ onNavigate }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const { state } = useFieldStore();
  const { outlets } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'visited' | 'skipped'>('all');
  const [sortAlpha, setSortAlpha] = useState(true);

  // Counts
  const totalCount = outlets.length;
  const visitedCount = outlets.filter((o) => o.status === 'visited').length;
  const pendingCount = outlets.filter((o) => o.status === 'pending').length;
  const skippedCount = outlets.filter((o) => o.status === 'skipped').length;

  // Filtered outlets
  let filtered = outlets.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    return o.status === activeFilter;
  });

  if (sortAlpha) {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  const getStatusBadge = (status: OutletStatus) => {
    switch (status) {
      case 'visited':
        return { label: 'Visited', bg: theme.colors.visitedBg, text: theme.colors.visitedText };
      case 'skipped':
        return { label: 'Skipped', bg: theme.colors.skippedBg, text: theme.colors.skippedText };
      default:
        return { label: 'Pending', bg: theme.colors.pendingBg, text: theme.colors.pendingText };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mobile Header matching Image 1 */}
      <Header
        title="Outlets"
        subtitle={`${totalCount} outlets · ${visitedCount} visited · ${pendingCount} pending`}
        onNavigate={onNavigate}
        rightAction={
          <Pressable
            onPress={() => onNavigate('addOutlet')}
            style={styles.addOutletBtn}
          >
            <Icon name="store" size={16} color={theme.colors.darkText} />
            <Text style={styles.addOutletText}>Add Outlet</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={theme.colors.darkMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search outlet by name"
            placeholderTextColor={theme.colors.darkMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="x" size={16} color={theme.colors.darkMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Filter Pills Row */}
        <View style={styles.filterRow}>
          <View style={styles.filterIconBox}>
            <Icon name="filter" size={16} color={theme.colors.darkMuted} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
            <Pressable
              onPress={() => setActiveFilter('all')}
              style={[styles.pill, activeFilter === 'all' && styles.pillActive]}
            >
              <Text style={[styles.pillText, activeFilter === 'all' && styles.pillTextActive]}>
                All
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveFilter('pending')}
              style={[styles.pill, activeFilter === 'pending' && styles.pillActive]}
            >
              <Text style={[styles.pillText, activeFilter === 'pending' && styles.pillTextActive]}>
                Pending [{pendingCount}]
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveFilter('visited')}
              style={[styles.pill, activeFilter === 'visited' && styles.pillActive]}
            >
              <Text style={[styles.pillText, activeFilter === 'visited' && styles.pillTextActive]}>
                Visited [{visitedCount}]
              </Text>
            </Pressable>

            {skippedCount > 0 && (
              <Pressable
                onPress={() => setActiveFilter('skipped')}
                style={[styles.pill, activeFilter === 'skipped' && styles.pillActive]}
              >
                <Text style={[styles.pillText, activeFilter === 'skipped' && styles.pillTextActive]}>
                  Skipped [{skippedCount}]
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>

        {/* Sort Row */}
        <View style={styles.sortRow}>
          <Pressable onPress={() => setSortAlpha(!sortAlpha)} style={styles.sortToggle}>
            <Icon name="sliders" size={14} color={theme.colors.darkMuted} />
            <Text style={styles.sortText}>
              {sortAlpha ? 'Alphabetical' : 'Default Sort'}
            </Text>
          </Pressable>
        </View>

        {/* Outlets List */}
        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="store" size={32} color={theme.colors.darkMuted} />
            <Text style={styles.emptyTitle}>No Outlets Found</Text>
            <Text style={styles.emptySub}>No outlets match your search or selected filter.</Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {filtered.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <Card
                  key={item.id}
                  style={styles.outletCard}
                  onPress={() => onNavigate('outletDetail', { outletId: item.id })}
                >
                  <View style={styles.cardContent}>
                    {/* Left Icon Circle */}
                    <View style={styles.storeIconCircle}>
                      <Icon name="store" size={20} color={theme.colors.primaryLight} />
                    </View>

                    {/* Info Column */}
                    <View style={styles.outletInfo}>
                      <View style={styles.titleRow}>
                        <Text style={styles.outletName} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                      <Text style={styles.outletSub} numberOfLines={1}>
                        {item.area} · {item.type} · {item.isOpen ? 'Open' : 'Closed'}
                      </Text>
                    </View>

                    {/* Status Badge & Chevron */}
                    <View style={styles.rightInfo}>
                      {item.status !== 'pending' && (
                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                            {badge.label}
                          </Text>
                        </View>
                      )}
                      <Icon name="chevron-right" size={20} color={theme.colors.darkMuted} />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: 100, gap: theme.spacing.md },
  addOutletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
  },
  addOutletText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.darkText },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.darkText,
  },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  filterIconBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.darkSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.darkBorder },
  pillsContainer: { flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'center' },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder },
  pillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryLight },
  pillText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkMuted },
  pillTextActive: { color: '#FFFFFF', fontFamily: theme.fonts.bold },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortText: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  list: { gap: theme.spacing.sm },
  outletCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, padding: theme.spacing.md },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  storeIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.darkSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.darkBorder },
  outletInfo: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  outletName: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.darkText },
  outletSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  rightInfo: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.sm },
  statusBadgeText: { fontFamily: theme.fonts.bold, fontSize: 10 },
  emptyCard: { alignItems: 'center', paddingVertical: 40, gap: theme.spacing.sm, backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder },
  emptyTitle: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.darkText },
  emptySub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, textAlign: 'center' },
});
