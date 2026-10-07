import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from './ui/text';
import { Row } from './ui/primitives';
import { useTheme } from '../theme';
export function Brand({ compact = false }: { compact?: boolean }) {
  const { colors: c } = useTheme();
  return (
    <Row style={{ gap: 10 }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: c.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={25} height={25} viewBox="0 0 28 28">
          <Path
            d="M5 17C8 17 8 9 12 9S15 19 19 19s4-7 6-7M5 22c5 0 6-5 10-5s5 6 10 4"
            stroke="#FFFFFF"
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>
      {!compact && (
        <Text
          style={{
            fontSize: 21,
            lineHeight: 30,
            fontWeight: '700',
            letterSpacing: -0.5,
            color: c.ink,
          }}
        >
          DayFlow
        </Text>
      )}
    </Row>
  );
}
