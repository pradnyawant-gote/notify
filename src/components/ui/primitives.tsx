import { Pressable } from './pressable';
import React from 'react';
import {
  View,
  TextInput,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from './text';
import { systemFont, useTheme } from '../../theme';
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors: c } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: 16,
          borderWidth: 0,
          borderColor: c.border,
          padding: 20,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.025)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}
    >
      {children}
    </View>
  );
}
export function IconButton({
  icon: Icon,
  onPress,
  label,
  filled = false,
}: {
  icon: LucideIcon;
  onPress: () => void;
  label: string;
  filled?: boolean;
}) {
  const { colors: c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        height: 44,
        width: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: filled ? c.surface : pressed ? c.soft : 'transparent',
        borderWidth: filled ? 1 : 0,
        borderColor: c.border,
      })}
    >
      <Icon size={19} color={c.primary} strokeWidth={1.7} />
    </Pressable>
  );
}
export function Label({ children }: { children: React.ReactNode }) {
  const { colors: c } = useTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        letterSpacing: 0.3,
        color: c.muted,
        fontWeight: '600',
        lineHeight: 18,
      }}
    >
      {children}
    </Text>
  );
}
export function Heading({
  children,
  size = 22,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <Text
      style={{
        fontSize: size,
        lineHeight: size * 1.25,
        letterSpacing: -0.3,
        fontWeight: '600',
      }}
    >
      {children}
    </Text>
  );
}
export function Chip({
  label,
  selected,
  onPress,
  icon: Icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
}) {
  const { colors: c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingHorizontal: 15,
        paddingVertical: 9,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: selected
          ? c.surface
          : pressed
            ? c.soft
            : 'transparent',
        borderWidth: selected ? 1 : 0,
        borderColor: c.border,
      })}
    >
      {Icon && <Icon size={15} color={selected ? c.primary : c.muted} />}
      <Text
        style={{
          fontSize: 13,
          color: selected ? c.ink : c.muted,
          fontWeight: selected ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Input({
  label,
  style,
  ...props
}: TextInputProps & {
  label?: string;
}) {
  const { colors: c } = useTheme();
  return (
    <View style={{ gap: 8, flex: 1 }}>
      {label && (
        <Text style={{ fontWeight: '500', fontSize: 13 }}>{label}</Text>
      )}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        style={[
          {
            backgroundColor: c.soft,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            minHeight: 48,
            fontWeight: '400',
            fontFamily: systemFont,
            fontSize: 15,
            color: c.ink,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const { colors: c } = useTheme();
  return (
    <View style={{ padding: 40, alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 22,
          backgroundColor: c.tint,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon color={c.primary} size={27} />
      </View>
      <Heading size={20}>{title}</Heading>
      <Text style={{ color: c.muted, textAlign: 'center', maxWidth: 320 }}>
        {description}
      </Text>
      {children}
    </View>
  );
}
