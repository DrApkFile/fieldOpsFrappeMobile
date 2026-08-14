import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface RadialGaugeProps {
  pct: number; // 0–1
  size?: number;
  label?: string;
}

const TICK_COUNT = 28;

export const RadialGauge: React.FC<RadialGaugeProps> = ({ pct, size = 120, label }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const clamped = Math.max(0, Math.min(1, pct));
  const filledTicks = Math.round(clamped * TICK_COUNT);

  const radius = size / 2;
  const tickLength = size * 0.14;
  const tickWidth = 3;

  const ticks = useMemo(() => {
    return Array.from({ length: TICK_COUNT }, (_, i) => {
      const angleDeg = (i / TICK_COUNT) * 360 - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const trackRadius = radius - tickLength / 2 - 2;
      const cx = radius + trackRadius * Math.cos(angleRad) - tickWidth / 2;
      const cy = radius + trackRadius * Math.sin(angleRad) - tickLength / 2;
      return { key: i, cx, cy, rotate: angleDeg + 90, filled: i < filledTicks };
    });
  }, [filledTicks, radius, tickLength]);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {ticks.map((t) => (
        <View
          key={t.key}
          style={[
            styles.tick,
            {
              width: tickWidth,
              height: tickLength,
              left: t.cx,
              top: t.cy,
              backgroundColor: t.filled ? theme.colors.primary : theme.colors.darkBorder,
              transform: [{ rotate: `${t.rotate}deg` }],
            },
          ]}
        />
      ))}
      <View style={styles.centerLabel}>
        <Text style={styles.pctText}>{Math.round(clamped * 100)}%</Text>
        {label ? <Text style={styles.subText} numberOfLines={2}>{label}</Text> : null}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  wrapper: { alignSelf: 'center' },
  tick: { position: 'absolute', borderRadius: 2 },
  centerLabel: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  pctText: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.darkText },
  subText: { fontFamily: theme.fonts.semibold, fontSize: 10, color: theme.colors.darkMuted, textAlign: 'center', marginTop: 2, maxWidth: 80 },
});
