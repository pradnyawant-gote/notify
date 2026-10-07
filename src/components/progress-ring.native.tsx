import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Canvas, Circle, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme';
import type { RingProps } from './progress-ring.web';
export function ProgressRing({
  value,
  size = 72,
  color,
  track,
  stroke = 6,
  children,
}: RingProps) {
  const { colors: c, reducedMotion } = useTheme(),
    progress = useSharedValue(value),
    r = (size - stroke * 2) / 2;
  useEffect(() => {
    progress.value = withTiming(Math.min(1, Math.max(0, value)), {
      duration: reducedMotion ? 0 : 550,
    });
  }, [value, reducedMotion, progress]);
  const path = Skia.Path.Make();
  path.addCircle(size / 2, size / 2, r);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas
        style={{
          width: size,
          height: size,
          position: 'absolute',
          transform: [{ rotate: '-90deg' }],
        }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          color={track ?? c.border}
          style="stroke"
          strokeWidth={stroke}
        />
        <Path
          path={path}
          color={color ?? c.primary}
          style="stroke"
          strokeWidth={stroke}
          strokeCap="round"
          start={0}
          end={progress}
        />
      </Canvas>
      {children}
    </View>
  );
}
