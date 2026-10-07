// Source-owned React Native Reusables-style Button with Slot and CVA variants.
import React, { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { TextClassContext, Text } from './text';
import { useTheme } from '../../theme';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));
const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 rounded-xl',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        outline: 'border',
        ghost: '',
        destructive: '',
      },
      size: { default: 'px-5 py-3', sm: 'px-3 py-2', icon: 'h-11 w-11' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
export type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    className?: string;
    label?: string;
  };
export function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild,
  label,
  children,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const { colors: c } = useTheme(),
    Component = asChild ? Slot.Pressable : Pressable;
  const color =
    variant === 'default'
      ? c.onPrimary
      : variant === 'destructive'
        ? '#A6453C'
        : c.ink;
  return (
    <TextClassContext.Provider value="font-medium">
      <Component
        accessibilityRole="button"
        disabled={disabled}
        className={cn(buttonVariants({ variant, size }), className)}
        onPressIn={(event) => {
          setPressed(true);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          setPressed(false);
          onPressOut?.(event);
        }}
        style={[
          {
            minHeight: 44,
            borderRadius: 10,
            backgroundColor:
              variant === 'default'
                ? c.primary
                : variant === 'secondary'
                  ? c.soft
                  : variant === 'destructive'
                    ? c.peach
                    : 'transparent',
            borderColor: c.border,
            opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
          },
          typeof style === 'function' ? style({ pressed }) : style,
        ]}
        {...props}
      >
        {label ? (
          <Text style={{ color, fontWeight: '500' }}>{label}</Text>
        ) : (
          children
        )}
      </Component>
    </TextClassContext.Provider>
  );
}
