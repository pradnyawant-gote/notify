import React, { forwardRef, useState } from 'react';
import {
  Pressable as NativePressable,
  StyleSheet,
  type PressableProps,
  type View,
} from 'react-native';

/** Resolve callback styles before NativeWind/native interop sees the element. */
export const Pressable = forwardRef<View, PressableProps>(function Pressable(
  { style, children, onPressIn, onPressOut, onPress, ...props },
  ref,
) {
  const [pressed, setPressed] = useState(false);
  const resolved = typeof style === 'function' ? style({ pressed }) : style;
  const resolvedOpacity = StyleSheet.flatten(resolved)?.opacity;
  const opacity = typeof resolvedOpacity === 'number' ? resolvedOpacity : 1;
  return (
    <NativePressable
      ref={ref}
      {...props}
      onPress={onPress}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
        resolved,
        typeof style !== 'function' &&
        (resolvedOpacity === undefined ||
          typeof resolvedOpacity === 'number') &&
        pressed &&
        onPress
          ? { opacity: opacity * 0.85 }
          : null,
      ]}
    >
      {typeof children === 'function' ? children({ pressed }) : children}
    </NativePressable>
  );
});
