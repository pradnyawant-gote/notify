import React, { useEffect, useState } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Timer,
  Check,
  Plus,
  Bell,
  Repeat2,
  TrendingUp,
  Clock3,
} from 'lucide-react-native';
import type { Activity } from '../domain/types';
import { useClock, useStore } from '../store/provider';
import { activitiesForDate, activityStatus } from '../domain/activities';
import {
  addDays,
  dateKey,
  durationLabel,
  formatTime,
  fromKey,
  WEEKDAYS,
} from '../domain/dates';
import { useTheme } from '../theme';
import { Text } from '../components/ui/text';
import { Button } from '../components/ui/button';
import { Card, Heading, IconButton, Row } from '../components/ui/primitives';
import { MetricCard } from '../components/metric-card';
import { OverviewChart } from '../components/overview-chart';
import { Timeline } from '../components/timeline';
import { REMINDER_POLICY } from '../domain/reminders';

function NextActivityCard({
  activity,
  date,
  now,
  compact = false,
}: {
  activity?: Activity;
  date: string;
  now: Date;
  compact?: boolean;
}) {
  const { colors: c } = useTheme(),
    router = useRouter();
  return (
    <Card style={{ gap: compact ? 8 : 15, padding: 18 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '600', fontSize: 14 }}>Next activity</Text>
        <View
          style={{
            backgroundColor: c.blue,
            borderRadius: 7,
            paddingHorizontal: 7,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 10, lineHeight: 14, color: c.blueInk }}>
            {activity ? 'Upcoming' : 'All clear'}
          </Text>
        </View>
      </Row>
      {activity ? (
        <>
          <Text style={{ fontWeight: '600', fontSize: 16 }}>
            {activity.title}
          </Text>
          {compact ? (
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: c.muted }}>
                {formatTime(activity.time)} · {durationLabel(activity.duration)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View activity"
                onPress={() =>
                  router.push({
                    pathname: '/activity/[id]',
                    params: { id: activity.id, date },
                  })
                }
                style={{ minHeight: 32, justifyContent: 'center' }}
              >
                <ArrowRight size={16} color={c.primary} />
              </Pressable>
            </Row>
          ) : (
            <>
              {[
                { label: 'Starts', value: formatTime(activity.time) },
                { label: 'Duration', value: durationLabel(activity.duration) },
                {
                  label: 'In',
                  value: `${Math.max(0, Math.ceil((new Date(`${date}T${activity.time}`).getTime() - now.getTime()) / 60000))} minutes`,
                },
              ].map((item) => (
                <Row
                  key={item.label}
                  style={{ justifyContent: 'space-between' }}
                >
                  <Text style={{ fontSize: 12, color: c.muted }}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 12 }}>{item.value}</Text>
                </Row>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View activity"
                onPress={() =>
                  router.push({
                    pathname: '/activity/[id]',
                    params: { id: activity.id, date },
                  })
                }
                style={{ minHeight: 38, justifyContent: 'center' }}
              >
                <Row style={{ justifyContent: 'flex-end', gap: 5 }}>
                  <Text style={{ fontSize: 12, color: c.primary }}>
                    View activity
                  </Text>
                  <ArrowRight size={14} color={c.primary} />
                </Row>
              </Pressable>
            </>
          )}
        </>
      ) : (
        <Text style={{ fontSize: 12, color: c.muted }}>
          No more activities on your schedule.
        </Text>
      )}
    </Card>
  );
}

export default function TodayScreen() {
  const { state, hydrated, enterDemo, toggleComplete } = useStore(),
    now = useClock(),
    { colors: c } = useTheme(),
    { width } = useWindowDimensions(),
    router = useRouter(),
    params = useLocalSearchParams<{ demo?: string }>();
  const today = dateKey(now),
    [selectedDate, setSelectedDate] = useState(today),
    [filter, setFilter] = useState('All activities');
  useEffect(() => {
    if (!hydrated || state.preferences.onboarded) return;
    if (params.demo === '1') enterDemo();
    else router.replace('/onboarding');
  }, [hydrated, state.preferences.onboarded, params.demo]);
  const day = activitiesForDate(state.activities, today),
    completed = day.filter((a) => a.completedOn.includes(today)).length;
  const focusSessions = state.sessions.filter((s) => s.date === today),
    focusMinutes = Math.round(
      focusSessions.reduce((sum, s) => sum + s.seconds, 0) / 60,
    );
  const personalMinutes = day
    .filter((a) => !['work', 'study'].includes(a.category))
    .reduce((sum, a) => sum + a.duration, 0);
  const next = day.find(
      (a) => activityStatus(a, today, now.getTime()) === 'upcoming',
    ),
    habits = day.filter((a) => a.type === 'habit'),
    wide = width >= 1180;
  const filtered = activitiesForDate(state.activities, selectedDate).filter(
    (a) =>
      filter === 'All activities' ||
      (filter === 'Work'
        ? ['work', 'study'].includes(a.category)
        : filter === 'Personal'
          ? !['work', 'study'].includes(a.category)
          : a.completedOn.includes(selectedDate)),
  );
  const weekStart = addDays(
    selectedDate,
    -((fromKey(selectedDate).getDay() + 6) % 7),
  );
  return (
    <View style={{ gap: 20 }}>
      <Row style={{ justifyContent: 'space-between', gap: 10 }}>
        <View style={{ gap: 5, flex: 1 }}>
          <Heading size={width < 600 ? 22 : 27}>
            {now.getHours() < 12
              ? 'Good morning'
              : now.getHours() < 17
                ? 'Good afternoon'
                : 'Good evening'}
            , {state.preferences.name}
          </Heading>
          <Text style={{ color: c.muted, fontSize: 12 }}>
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}{' '}
            ·{' '}
            {now.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
        {state.preferences.demo && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Make it yours"
            onPress={() => router.push('/onboarding')}
            style={{ paddingVertical: 8 }}
          >
            <Row style={{ gap: 4 }}>
              <Text style={{ fontSize: 11, color: c.primary }}>Demo</Text>
              <ArrowRight size={11} color={c.primary} />
            </Row>
          </Pressable>
        )}
        {width >= 700 && (
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push('/calendar')}
          >
            <CalendarDays size={15} color={c.primary} />
            <Text style={{ color: c.primary, fontSize: 12 }}>Calendar</Text>
          </Button>
        )}
      </Row>
      <View
        style={{
          flexDirection: wide ? 'row' : 'column',
          alignItems: 'flex-start',
          gap: 20,
        }}
      >
        <View style={{ flex: 1, width: '100%', gap: 14 }}>
          <View style={{ gap: 10 }}>
            <Row style={{ gap: 10, alignItems: 'stretch' }}>
              <MetricCard
                label="Daily progress"
                value={`${completed} / ${day.length}`}
                note={`${day.length ? Math.round((completed / day.length) * 100) : 0}%`}
                tone="blue"
                icon={TrendingUp}
                onPress={() => router.push('/insights')}
              />
              <MetricCard
                label="Focus time"
                value={`${focusMinutes} min`}
                note={`${focusSessions.length} ${focusSessions.length === 1 ? 'session' : 'sessions'}`}
                tone="black"
                icon={Timer}
                onPress={() => router.push('/focus')}
              />
            </Row>
            <Row style={{ gap: 10, alignItems: 'stretch' }}>
              <MetricCard
                label="Remaining"
                value={String(day.length - completed)}
                note="activities"
                tone="black"
                icon={Clock3}
                onPress={() => setFilter('All activities')}
              />
              <MetricCard
                label="Personal time"
                value={durationLabel(personalMinutes)}
                note="today"
                tone="blue"
                icon={CalendarDays}
                onPress={() => setFilter('Personal')}
              />
            </Row>
          </View>
          {!wide && (
            <NextActivityCard activity={next} date={today} now={now} compact />
          )}
          <OverviewChart />
          <View style={{ gap: 14, marginTop: 5 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Heading size={18}>Daily timeline</Heading>
              <IconButton
                icon={Plus}
                label="Add to your day"
                onPress={() =>
                  router.push({
                    pathname: '/add',
                    params: { date: selectedDate },
                  })
                }
              />
            </Row>
            <Row style={{ gap: 2, justifyContent: 'space-between' }}>
              <IconButton
                icon={ChevronLeft}
                label="Previous week"
                onPress={() => setSelectedDate(addDays(selectedDate, -7))}
              />
              {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(
                (d) => (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityLabel={fromKey(d).toDateString()}
                    aria-pressed={selectedDate === d}
                    onPress={() => setSelectedDate(d)}
                    style={{
                      flex: 1,
                      maxWidth: 54,
                      minHeight: 53,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      backgroundColor:
                        d === selectedDate ? c.primary : c.surface,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        lineHeight: 14,
                        color: d === selectedDate ? c.onPrimary : c.muted,
                      }}
                    >
                      {WEEKDAYS[fromKey(d).getDay()]}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: d === selectedDate ? c.onPrimary : c.ink,
                      }}
                    >
                      {fromKey(d).getDate()}
                    </Text>
                  </Pressable>
                ),
              )}
              <IconButton
                icon={ChevronRight}
                label="Next week"
                onPress={() => setSelectedDate(addDays(selectedDate, 7))}
              />
            </Row>
            <Row style={{ gap: 18, flexWrap: 'wrap' }}>
              {['All activities', 'Work', 'Personal', 'Done'].map((f) => (
                <Pressable
                  key={f}
                  accessibilityRole="button"
                  aria-pressed={filter === f}
                  onPress={() => setFilter(f)}
                  style={{ minHeight: 36, justifyContent: 'center' }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: filter === f ? '600' : '400',
                      color: filter === f ? c.lavenderInk : c.muted,
                    }}
                  >
                    {f}
                  </Text>
                </Pressable>
              ))}
            </Row>
            {selectedDate !== today && (
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: c.muted }}>
                  {fromKey(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelectedDate(today)}
                >
                  <Text style={{ fontSize: 12, color: c.primary }}>Today</Text>
                </Pressable>
              </Row>
            )}
            <Timeline activities={filtered} date={selectedDate} now={now} />
          </View>
        </View>
        <View style={{ width: wide ? 285 : '100%', gap: 14 }}>
          {wide && <NextActivityCard activity={next} date={today} now={now} />}
          <Card style={{ padding: 18, gap: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>
                Daily habits
              </Text>
              <Repeat2 size={16} color={c.muted} />
            </Row>
            {habits.length ? (
              habits.map((a) => (
                <Pressable
                  key={a.id}
                  accessibilityRole="checkbox"
                  aria-checked={a.completedOn.includes(today)}
                  accessibilityState={{
                    checked: a.completedOn.includes(today),
                  }}
                  accessibilityLabel={`Toggle habit ${a.title}`}
                  onPress={() => toggleComplete(a.id, today)}
                  style={{
                    minHeight: 46,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      backgroundColor: a.completedOn.includes(today)
                        ? c.successBg
                        : c.soft,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {a.completedOn.includes(today) && (
                      <Check size={14} color={c.success} />
                    )}
                  </View>
                  <Text style={{ fontSize: 12, flex: 1 }}>{a.title}</Text>
                  <View
                    style={{
                      backgroundColor: a.completedOn.includes(today)
                        ? c.successBg
                        : c.blue,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        lineHeight: 14,
                        color: a.completedOn.includes(today)
                          ? c.success
                          : c.blueInk,
                      }}
                    >
                      {a.completedOn.includes(today) ? 'Complete' : 'Pending'}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: c.muted }}>
                Add your first habit to start a routine.
              </Text>
            )}
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: c.muted }}>
                {habits.filter((a) => a.completedOn.includes(today)).length} of{' '}
                {habits.length} complete
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Manage routines"
                onPress={() => router.push('/routines')}
              >
                <ArrowRight size={15} color={c.primary} />
              </Pressable>
            </Row>
          </Card>
          <Card style={{ gap: 10, padding: 18 }}>
            <Row>
              <Bell size={17} color={c.primary} />
              <Text style={{ fontSize: 14, fontWeight: '600' }}>
                Smart reminders
              </Text>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: c.muted }}>
                Reminder style
              </Text>
              <Text style={{ fontSize: 12, textTransform: 'capitalize' }}>
                {state.preferences.intensity}
              </Text>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: c.muted }}>Daily limit</Text>
              <Text style={{ fontSize: 12 }}>
                {REMINDER_POLICY[state.preferences.intensity].budget}{' '}
                notifications
              </Text>
            </Row>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push('/profile?section=notifications')}
              style={{ alignSelf: 'flex-end', paddingRight: 0 }}
            >
              <Text style={{ color: c.primary, fontSize: 12 }}>
                Preferences
              </Text>
              <ArrowRight size={14} color={c.primary} />
            </Button>
          </Card>
          <Card style={{ gap: 9, padding: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>
              Daily review
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 19, color: c.muted }}>
              See your completed activities, focus time, and tomorrow’s plan.
            </Text>
            <Button
              variant="outline"
              label="Review my day"
              onPress={() => router.push('/insights')}
            />
          </Card>
        </View>
      </View>
    </View>
  );
}
