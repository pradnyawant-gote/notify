import React, { useId } from 'react';
import { View, Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../theme';
import { Text } from './ui/text';
import { Row } from './ui/primitives';

export function MetricCard({
  label,
  value,
  note,
  tone,
  icon: Icon,
  onPress,
}: {
  label: string;
  value: string;
  note: string;
  tone: 'blue' | 'black';
  icon: LucideIcon;
  onPress?: () => void;
}) {
  const { colors: c } = useTheme(),
    id = `metric-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const start = tone === 'blue' ? c.metricBlue : c.metricBlack,
    end = tone === 'blue' ? c.metricBlueEnd : c.metricBlackEnd;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}, ${note}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 0,
        minHeight: 100,
        borderRadius: 16,
        overflow: 'hidden',
        padding: 16,
        opacity: pressed && onPress ? 0.85 : 1,
        backgroundColor: start,
      })}
    >
      <Svg
        pointerEvents="none"
        viewBox="0 0 200 110"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Defs>
          <LinearGradient id={id} x1="0%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0" stopColor={start} />
            <Stop offset="1" stopColor={end} />
          </LinearGradient>
        </Defs>
        <Rect width={200} height={110} fill={`url(#${id})`} />
      </Svg>
      <Row style={{ justifyContent: 'space-between', gap: 4 }}>
        <Text style={{ color: '#FFFFFFE6', fontSize: 12, lineHeight: 16 }}>
          {label}
        </Text>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: '#FFFFFF0D',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={14} strokeWidth={1.6} color="#FFFFFFD9" />
        </View>
      </Row>
      <Row
        style={{
          marginTop: 14,
          justifyContent: 'space-between',
          gap: 5,
          alignItems: 'baseline',
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 21,
            lineHeight: 27,
            fontWeight: '500',
            letterSpacing: -0.5,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text
          style={{ color: '#FFFFFFDE', fontSize: 10, lineHeight: 15 }}
          numberOfLines={1}
        >
          {note}
        </Text>
      </Row>
    </Pressable>
  );
}
