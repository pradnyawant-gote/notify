import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Check,
  Circle,
  Play,
  Coffee,
  BriefcaseBusiness,
  Heart,
  BookOpen,
  Moon,
  MoreHorizontal,
  Clock3,
  Video,
  Sunrise,
  Sunset,
  Sun,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import type { Activity, Category } from '../domain/types';
import { activityStatus } from '../domain/activities';
import { durationLabel, formatTime, period } from '../domain/dates';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { Row, Label, EmptyState } from './ui/primitives';
import { useTheme } from '../theme';
import { useStore } from '../store/provider';
export const CATEGORY_ICONS = {
  work: BriefcaseBusiness,
  study: BookOpen,
  health: Heart,
  personal: Coffee,
  rest: Moon,
};
export function useCategoryColor(category: Category) {
  const { colors: c } = useTheme();
  return {
    background:
      category === 'work'
        ? c.lavender
        : category === 'study'
          ? c.blue
          : category === 'health'
            ? c.tint
            : category === 'personal'
              ? c.peach
              : c.soft,
    foreground:
      category === 'work'
        ? c.lavenderInk
        : category === 'study'
          ? c.blueInk
          : category === 'health'
            ? c.tintInk
            : category === 'personal'
              ? c.peachInk
              : c.muted,
  };
}
export function ActivityRow({
  activity: a,
  date,
  now,
  compact = false,
  index = 0,
}: {
  activity: Activity;
  date: string;
  now: Date;
  compact?: boolean;
  index?: number;
}) {
  const { colors: c, reducedMotion } = useTheme(),
    { toggleComplete, startFocus, state, notify } = useStore(),
    router = useRouter(),
    status = activityStatus(a, date, now.getTime()),
    tint = useCategoryColor(a.category),
    current = status === 'current',
    done = status === 'completed',
    Icon = a.type === 'meeting' ? Video : CATEGORY_ICONS[a.category];
  return (
    <MotiView
      from={reducedMotion ? undefined : { opacity: 0, translateY: 7 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: reducedMotion ? 0 : 280,
        delay: Math.min(index * 30, 150),
      }}
      style={{ flexDirection: 'row', gap: 14 }}
    >
      {!compact && (
        <View style={{ width: 65, paddingTop: 20 }}>
          <Text
            style={{
              fontSize: 12,
              color: current ? c.primary : c.muted,
              fontWeight: current ? '600' : '400',
            }}
          >
            {formatTime(a.time).split(' ')[0]}
          </Text>
          <Text style={{ color: c.muted, fontSize: 10, lineHeight: 15 }}>
            {formatTime(a.time).split(' ')[1]}
          </Text>
        </View>
      )}
      {!compact && (
        <View style={{ width: 13, alignItems: 'center' }}>
          <View
            style={{
              position: 'absolute',
              width: 1,
              top: 0,
              bottom: -12,
              backgroundColor: c.border,
            }}
          />
          <View
            style={{
              marginTop: 25,
              width: current ? 11 : 8,
              height: current ? 11 : 8,
              borderRadius: 8,
              backgroundColor: done
                ? c.success
                : current
                  ? c.primary
                  : c.border,
              borderWidth: 2,
              borderColor: c.bg,
            }}
          />
        </View>
      )}
      <View
        style={{
          flex: 1,
          borderRadius: 15,
          padding: current && !compact ? 18 : 14,
          backgroundColor: c.surface,
          borderWidth: current ? 1 : 0,
          borderColor: current ? c.primary + '30' : c.border,
          gap: 12,
        }}
      >
        <Row style={{ gap: 12 }}>
          <View
            style={{
              width: 35,
              height: 35,
              borderRadius: 11,
              backgroundColor: c.soft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={17} color={c.muted} strokeWidth={1.7} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${a.title}`}
            onPress={() =>
              router.push({
                pathname: '/activity/[id]',
                params: { id: a.id, date },
              })
            }
            style={{ flex: 1, gap: 2 }}
          >
            <Text
              style={{
                fontWeight: '500',
                fontSize: 14,
                color: done ? c.muted : c.ink,
                textDecorationLine: done ? 'line-through' : 'none',
              }}
            >
              {a.title}
            </Text>
            <Row style={{ gap: 7 }}>
              <Text style={{ fontSize: 11, lineHeight: 17, color: c.muted }}>
                {compact ? `${formatTime(a.time)} · ` : ''}
                {durationLabel(a.duration)}
              </Text>
              {a.type === 'habit' && (
                <Text style={{ fontSize: 10, color: c.tintInk }}>· Habit</Text>
              )}
              {current && (
                <View
                  style={{
                    paddingHorizontal: 6,
                    borderRadius: 5,
                    backgroundColor: c.lavender,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      lineHeight: 17,
                      color: c.lavenderInk,
                      fontWeight: '600',
                    }}
                  >
                    In Progress
                  </Text>
                </View>
              )}
              {status === 'missed' && (
                <Text style={{ fontSize: 10, color: c.peachInk }}>
                  · Missed
                </Text>
              )}
            </Row>
          </Pressable>
          <Pressable
            accessibilityRole="checkbox"
            aria-checked={done}
            accessibilityState={{ checked: done }}
            accessibilityLabel={`${done ? 'Reopen' : 'Complete'} ${a.title}`}
            onPress={() => toggleComplete(a.id, date)}
            style={({ pressed }) => ({
              height: 44,
              width: 44,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.5 : 1,
            })}
          >
            {done ? (
              <View
                style={{
                  width: 21,
                  height: 21,
                  borderRadius: 7,
                  backgroundColor: c.successBg,
                }}
              >
                <Check size={16} color={c.success} style={{ margin: 2 }} />
              </View>
            ) : (
              <View
                style={{
                  width: 21,
                  height: 21,
                  borderRadius: 7,
                  borderWidth: 1.3,
                  borderColor: current ? tint.foreground : c.border,
                }}
              />
            )}
          </Pressable>
        </Row>
        {current && !compact && (
          <View style={{ paddingLeft: 47, gap: 13 }}>
            {a.notes ? (
              <Text style={{ fontSize: 12, color: c.muted }}>{a.notes}</Text>
            ) : null}
            <Row>
              <Button
                size="sm"
                onPress={() => {
                  if (!state.focus) startFocus(a.id, a.title, 25, date);
                  else notify('Your current focus session is waiting for you.');
                  router.push('/focus');
                }}
              >
                <Play size={12} color={c.onPrimary} fill={c.onPrimary} />
                <Text
                  style={{
                    color: c.onPrimary,
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  Start focus
                </Text>
              </Button>
              <Text style={{ fontSize: 11, color: c.muted }}>
                One thing at a time.
              </Text>
            </Row>
          </View>
        )}
      </View>
    </MotiView>
  );
}
export function Timeline({
  activities,
  date,
  now,
  compact = false,
}: {
  activities: Activity[];
  date: string;
  now: Date;
  compact?: boolean;
}) {
  const { colors: c } = useTheme();
  if (!activities.length)
    return (
      <EmptyState
        icon={Sun}
        title="A little room to breathe"
        description="Your day is a blank canvas. Add something that matters to you."
      />
    );
  return (
    <View style={{ gap: 10 }}>
      {activities.map((a, i) => {
        const section = period(a.time),
          first = i === 0 || period(activities[i - 1].time) !== section,
          Icon =
            section === 'Morning'
              ? Sunrise
              : section === 'Afternoon'
                ? Sun
                : section === 'Evening'
                  ? Sunset
                  : Moon;
        return (
          <React.Fragment key={a.id}>
            {first && !compact && (
              <Row style={{ marginTop: i ? 16 : 0, marginBottom: 2, gap: 8 }}>
                <Icon size={15} color={c.muted} />
                <Label>{section.toUpperCase()}</Label>
                <View
                  style={{
                    height: 1,
                    backgroundColor: c.border,
                    flex: 1,
                    marginLeft: 5,
                  }}
                />
              </Row>
            )}
            <ActivityRow
              activity={a}
              date={date}
              now={now}
              index={i}
              compact={compact}
            />
          </React.Fragment>
        );
      })}
    </View>
  );
}
