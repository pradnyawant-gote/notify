import React, { useId } from 'react';
import { View, StyleSheet } from 'react-native';
import { Pressable } from './ui/pressable';
import type { LucideIcon } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../theme';
import { Text } from './ui/text';
import { Row } from './ui/primitives';

export interface MetricCardProps {
  label: string;
  value: string;
  note: string;
  tone: 'blue' | 'black';
  icon: LucideIcon;
  onPress?: () => void;
}

export function MetricCard({
  label,
  value,
  note,
  tone,
  icon: Icon,
  onPress,
}: MetricCardProps) {
  const { colors: c } = useTheme(),
    id = `metric-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const start = tone === 'blue' ? c.metricBlue : c.metricBlack,
    end = tone === 'blue' ? c.metricBlueEnd : c.metricBlackEnd;
  return (
    <View
      collapsable={false}
      style={[styles.frame, { backgroundColor: start }]}
    >
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`${label}: ${value}, ${note}`}
        onPress={onPress}
        style={styles.content}
      >
        <Svg
          viewBox="0 0 200 110"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          <Defs>
            <LinearGradient id={id} x1="0%" y1="0%" x2="50%" y2="100%">
              <Stop offset="0" stopColor={start} />
              <Stop offset="1" stopColor={end} />
            </LinearGradient>
          </Defs>
          <Rect width={200} height={110} fill={`url(#${id})`} />
        </Svg>
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.25}
            style={{
              flex: 1,
              minWidth: 0,
              color: '#FFFFFFF0',
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {label}
          </Text>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              flexShrink: 0,
              backgroundColor: '#FFFFFF0D',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={14} strokeWidth={1.6} color="#FFFFFFD9" />
          </View>
        </Row>
        <View style={{ marginTop: 12, gap: 3 }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 26,
              lineHeight: 32,
              fontWeight: '600',
              letterSpacing: -0.5,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            maxFontSizeMultiplier={1.2}
          >
            {value}
          </Text>
          <Text
            style={{ color: '#FFFFFFE6', fontSize: 12, lineHeight: 17 }}
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
          >
            {note}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    minHeight: 132,
    borderRadius: 18,
    overflow: 'hidden',
  },
  content: { width: '100%', minHeight: 132, padding: 16 },
});
