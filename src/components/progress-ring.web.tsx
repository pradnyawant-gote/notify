import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';
export interface RingProps {
  value: number;
  size?: number;
  color?: string;
  track?: string;
  stroke?: number;
  children?: React.ReactNode;
}
export function ProgressRing({
  value,
  size = 72,
  color,
  track,
  stroke = 6,
  children,
}: RingProps) {
  const { colors: c } = useTheme(),
    r = (size - stroke * 2) / 2,
    length = 2 * Math.PI * r;
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
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track ?? c.border}
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? c.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${length * Math.min(1, Math.max(0, value))} ${length}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
