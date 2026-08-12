import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  image: any;
  kicker: string;
  title: string;
  body: string;
  iconName: any;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    image: require('../../assets/leads.jpg'),
    kicker: 'Capture opportunities',
    title: 'Every good lead,\nright where it happens.',
    body: 'Capture contacts, notes and location while the conversation is fresh in the field.',
    iconName: 'users',
  },
  {
    id: '2',
    image: require('../../assets/merch.jpg'),
    kicker: 'Own your territory',
    title: 'Stay on beat.\nKeep every visit moving.',
    body: 'See your assigned route, store points and field tasks in one unified view.',
    iconName: 'compass',
  },
  {
    id: '3',
    image: require('../../assets/surveys.jpg'),
    kicker: 'Learn in the field',
    title: 'Turn every response\ninto actionable insight.',
    body: 'Run dynamic surveys, capture shelf evidence and submit with instant verification.',
    iconName: 'clipboard-list',
  },
  {
    id: '4',
    image: require('../../assets/sales.jpg'),
    kicker: 'Close with confidence',
    title: 'Sell smarter,\neven on the move.',
    body: 'Build customer orders from live stock, collect payments and track daily performance.',
    iconName: 'shopping-bag',
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
const theme = useTheme();  const styles = createStyles(theme);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      onFinish();
    }
  };

  const renderSlideItem = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slideContainer}>
        <ImageBackground source={item.image} style={styles.backgroundImage} resizeMode="cover">
          <View style={styles.gradientOverlay} />

          <SafeAreaView style={styles.slideContent}>
            {/* Top Bar - Skip Button with Safe Top Padding */}
            <View style={styles.topBar}>
              <Pressable style={styles.skipBtn} onPress={onFinish}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            </View>

            {/* Bottom Card / Content */}
            <View style={styles.bottomContent}>
              <View style={styles.iconBadge}>
                <Icon name={item.iconName} size={22} color="#FFFFFF" />
              </View>

              <Text style={styles.kicker}>{item.kicker}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>

              {/* Pagination Dots */}
              <View style={styles.dotsRow}>
                {SLIDES.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === activeIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>

              <Button
                title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                onPress={handleNext}
                size="large"
                variant="primary"
                style={styles.ctaButton}
              />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlideItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkBg,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,15,18,0.58)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.safeTopPadding + 8,
  },
  skipBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  bottomContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 14,
    backgroundColor: 'rgba(13,15,18,0.85)',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingTop: theme.spacing.xl,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  kicker: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  body: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.darkMuted,
    marginBottom: theme.spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  ctaButton: {
    width: '100%',
  },
});
