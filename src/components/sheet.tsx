import { Pressable } from './ui/pressable';
import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useTheme } from '../theme';
import { Heading, IconButton, Row } from './ui/primitives';
import { Text } from './ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export function Sheet({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const router = useRouter(),
    { colors: c } = useTheme(),
    { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const close =
    onClose ??
    (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        justifyContent: width < 600 ? 'flex-end' : 'center',
        alignItems: 'center',
        backgroundColor: '#00000059',
        padding: width < 600 ? 0 : 24,
      }}
    >
      <Pressable
        accessibilityLabel="Close dialog"
        onPress={close}
        style={{ position: 'absolute', inset: 0 }}
      />
      <View
        accessibilityViewIsModal
        role="dialog"
        aria-label={title}
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '92%',
          backgroundColor: c.surface,
          borderRadius: 18,
          borderBottomLeftRadius: width < 600 ? 0 : 24,
          borderBottomRightRadius: width < 600 ? 0 : 24,
          overflow: 'hidden',
        }}
      >
        <Row
          style={{
            padding: 24,
            paddingBottom: 17,
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderColor: c.border,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Heading size={23}>{title}</Heading>
            {description && (
              <Text style={{ fontSize: 12, color: c.muted }}>
                {description}
              </Text>
            )}
          </View>
          <IconButton icon={X} onPress={close} label="Close" />
        </Row>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 24 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
