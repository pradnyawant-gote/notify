import { Pressable } from './ui/pressable';
import React, { useEffect, useRef } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  Sun,
  CalendarDays,
  Plus,
  ChartNoAxesCombined,
  UserRound,
  Repeat2,
  ArrowUpRight,
  Leaf,
  Bell,
  ChevronRight,
  CircleHelp,
  Timer,
  PanelLeftClose,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Brand } from './brand';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { IconButton, Label, Row } from './ui/primitives';
import { useTheme } from '../theme';
import { useClock, useStore } from '../store/provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const nav: {
  label: string;
  route: '/' | '/calendar' | '/insights' | '/profile';
  icon: LucideIcon;
}[] = [
  { label: 'Today', route: '/', icon: Sun },
  { label: 'Calendar', route: '/calendar', icon: CalendarDays },
  { label: 'Insights', route: '/insights', icon: ChartNoAxesCombined },
  { label: 'Profile', route: '/profile', icon: UserRound },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const { colors: c } = useTheme(),
    { width, height } = useWindowDimensions(),
    desktop = width >= 850,
    router = useRouter(),
    path = usePathname(),
    { state, toast } = useStore(),
    now = useClock();
  const insets = useSafeAreaInsets();
  const lastPage = useRef('Today');
  const page =
    nav.find((n) => n.route === path)?.label ??
    (path === '/routines' ? 'Routines' : null);
  if (page) lastPage.current = page;
  const current = page ?? lastPage.current;
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [path]);
  return (
    <View
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: c.bg,
        flexDirection: 'row',
      }}
    >
      {desktop && (
        <View
          style={{
            width: 226,
            backgroundColor: c.rail,
            borderRightWidth: 1,
            borderColor: c.border,
            padding: 24,
            paddingTop: height < 950 ? 24 : 34,
            gap: height < 950 ? 22 : 34,
          }}
        >
          <Brand />
          <View style={{ gap: 7 }}>
            {nav.map(({ label, route, icon: Icon }) => (
              <Pressable
                key={label}
                onPress={() => router.replace(route)}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 13,
                  padding: 13,
                  borderRadius: 11,
                  backgroundColor:
                    path === route ? c.tint : pressed ? c.soft : 'transparent',
                })}
              >
                <Icon
                  size={20}
                  color={path === route ? c.primary : c.muted}
                  strokeWidth={1.7}
                />
                <Text
                  style={{
                    color: path === route ? c.primary : c.muted,
                    fontWeight: path === route ? '600' : '500',
                  }}
                >
                  {label}
                </Text>
                {path === route && (
                  <View
                    style={{
                      marginLeft: 'auto',
                      width: 5,
                      height: 5,
                      borderRadius: 5,
                      backgroundColor: c.primary,
                    }}
                  />
                )}
              </Pressable>
            ))}
          </View>
          <Button onPress={() => router.push('/add')}>
            <Plus size={18} color={c.onPrimary} />
            <Text style={{ color: c.onPrimary, fontWeight: '500' }}>
              Add activity
            </Text>
          </Button>
          <View style={{ gap: 14, marginTop: 0 }}>
            <Label>YOUR SPACE</Label>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/routines')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                paddingVertical: 9,
              }}
            >
              <Repeat2 size={19} color={c.muted} />
              <Text
                style={{ color: path === '/routines' ? c.primary : c.muted }}
              >
                My routines
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/focus')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                paddingVertical: 9,
              }}
            >
              <Timer size={19} color={c.muted} />
              <Text style={{ color: c.muted }}>Focus space</Text>
              {state.focus && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: c.primary,
                    borderRadius: 6,
                  }}
                />
              )}
            </Pressable>
          </View>
          <View style={{ flex: 1 }} />
          {height >= 950 && (
            <View
              style={{
                backgroundColor: c.tint,
                borderRadius: 16,
                padding: 17,
                gap: 10,
              }}
            >
              <Leaf size={22} color={c.tintInk} />
              <Text style={{ fontWeight: '600', fontSize: 13 }}>
                Daily routines
              </Text>
              <Text style={{ color: c.muted, fontSize: 12, lineHeight: 19 }}>
                Your recurring activities, together in one place.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/routines')}
              >
                <Row style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: c.primary,
                    }}
                  >
                    Manage routines
                  </Text>
                  <ArrowUpRight size={15} color={c.primary} />
                </Row>
              </Pressable>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/profile')}
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              borderTopWidth: 1,
              borderColor: c.border,
              paddingTop: 19,
            }}
          >
            <View
              style={{
                height: 34,
                width: 34,
                borderRadius: 12,
                backgroundColor: c.tint,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: c.primary, fontWeight: '600' }}>
                {state.preferences.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '500', fontSize: 13 }}>
                {state.preferences.name}
              </Text>
              <Text style={{ fontSize: 11, color: c.muted }}>
                Your personal space
              </Text>
            </View>
            <ChevronRight size={16} color={c.muted} />
          </Pressable>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <View
          style={{
            minHeight: desktop ? 68 : 56,
            flexShrink: 0,
            borderBottomWidth: 1,
            borderColor: c.border,
            paddingHorizontal: desktop ? 28 : 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: c.rail,
          }}
        >
          {desktop ? (
            <Row style={{ gap: 10 }}>
              <Text style={{ fontSize: 13, color: c.muted }}>My workspace</Text>
              <ChevronRight size={13} color={c.muted} />
              <Text style={{ fontSize: 13, fontWeight: '500' }}>{current}</Text>
            </Row>
          ) : (
            <Row style={{ gap: 6, width: 92, flexShrink: 0 }}>
              <Brand compact />
              <Text
                maxFontSizeMultiplier={1.2}
                style={{ fontSize: 12, color: c.primary }}
              >
                DayFlow
              </Text>
            </Row>
          )}
          {!desktop && (
            <View style={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                style={{ fontSize: 16, fontWeight: '600' }}
              >
                {current === 'Today' ? 'Overview' : current}
              </Text>
            </View>
          )}
          <Row
            style={{
              gap: 16,
              width: desktop ? undefined : 92,
              justifyContent: 'flex-end',
              flexShrink: 0,
            }}
          >
            {desktop && (
              <Text style={{ fontSize: 12, color: c.muted }}>
                {now.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
                <Text style={{ color: c.border }}> | </Text>
                {now.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            )}
            <IconButton
              icon={Bell}
              label="Notification preferences"
              onPress={() => router.push('/profile?section=notifications')}
              filled={desktop}
            />
          </Row>
        </View>
        <ScrollView
          ref={scroll}
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: desktop ? 28 : 16,
            paddingBottom: 40,
            width: '100%',
            maxWidth: 1480,
            alignSelf: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {!desktop && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: c.surface,
              borderTopWidth: 1,
              borderColor: c.border,
              flexShrink: 0,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 12),
            }}
          >
            {[nav[0], nav[1], null, nav[2], nav[3]].map((n, i) =>
              n ? (
                <Pressable
                  key={n.label}
                  accessibilityRole="button"
                  accessibilityLabel={n.label}
                  onPress={() => router.replace(n.route)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 52,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <n.icon
                    size={21}
                    strokeWidth={path === n.route ? 2 : 1.7}
                    color={path === n.route ? c.primary : c.muted}
                  />
                  <Text
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.2}
                    style={{
                      fontSize: 11,
                      lineHeight: 16,
                      color: path === n.route ? c.primary : c.muted,
                      fontWeight: path === n.route ? '600' : '400',
                    }}
                  >
                    {n.label}
                  </Text>
                </Pressable>
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pressable
                    key="add"
                    accessibilityRole="button"
                    accessibilityLabel="Add activity"
                    onPress={() => router.push('/add')}
                    style={{
                      width: 46,
                      height: 46,
                      backgroundColor: c.primary,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={24} color={c.onPrimary} />
                  </Pressable>
                </View>
              ),
            )}
          </View>
        )}
      </View>
      {toast && (
        <View
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            bottom: desktop ? 24 : 92,
            left: desktop ? 250 : 20,
            right: 20,
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <View
            style={{
              backgroundColor: '#1C1C1C',
              borderRadius: 14,
              paddingVertical: 13,
              paddingHorizontal: 20,
              maxWidth: 540,
            }}
          >
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 13 }}
            >
              {toast}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
