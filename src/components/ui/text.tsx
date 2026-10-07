// Source-owned Text primitive following React Native Reusables' composition pattern.
import React, { createContext, useContext } from 'react';
import { Text as NativeText, type TextProps } from 'react-native';
import { systemFont, useTheme } from '../../theme';
export const TextClassContext = createContext<string | undefined>(undefined);
export function Text({
  className = '',
  style,
  ...props
}: TextProps & {
  className?: string;
}) {
  const context = useContext(TextClassContext),
    { colors } = useTheme();
  return (
    <NativeText
      className={`${context ?? ''} ${className}`}
      style={[
        {
          fontFamily: systemFont,
          fontWeight: '400',
          fontSize: 14,
          lineHeight: 21,
          color: colors.ink,
        },
        style,
      ]}
      {...props}
    />
  );
}
