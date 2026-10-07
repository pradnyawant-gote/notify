import React from 'react';
import * as SwitchPrimitive from '@rn-primitives/switch';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
export function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label: string;
}) {
  const { colors: c, reducedMotion } = useTheme();
  const style = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: withTiming(checked ? 18 : 0, {
            duration: reducedMotion ? 0 : 180,
          }),
        },
      ],
    }),
    [checked, reducedMotion],
  );
  return (
    <SwitchPrimitive.Root
      accessibilityLabel={label}
      checked={checked}
      onCheckedChange={onCheckedChange}
      style={{
        width: 48,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          width: 42,
          height: 24,
          borderRadius: 14,
          backgroundColor: checked ? c.primary : c.border,
          padding: 3,
        }}
      >
        <SwitchPrimitive.Thumb asChild>
          <Animated.View
            style={[
              {
                width: 18,
                height: 18,
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
              },
              style,
            ]}
          />
        </SwitchPrimitive.Thumb>
      </Animated.View>
    </SwitchPrimitive.Root>
  );
}
