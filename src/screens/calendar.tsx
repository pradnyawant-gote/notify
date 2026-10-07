import { Pressable } from '../components/ui/pressable';
import React, { useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock3,
  ArrowRight,
} from 'lucide-react-native';
import { useClock, useStore } from '../store/provider';
import { useTheme } from '../theme';
import { Text } from '../components/ui/text';
import { Button } from '../components/ui/button';
import {
  Card,
  Chip,
  EmptyState,
  Heading,
  IconButton,
  Input,
  Label,
  Row,
} from '../components/ui/primitives';
import {
  Timeline,
  CATEGORY_ICONS,
  useCategoryColor,
} from '../components/timeline';
import {
  addDays,
  dateKey,
  durationLabel,
  formatTime,
  fromKey,
  WEEKDAYS,
} from '../domain/dates';
import { activitiesForDate } from '../domain/activities';
import type { Activity } from '../domain/types';
function CalendarBlock({
  activity: a,
  date,
}: {
  activity: Activity;
  date: string;
}) {
  const tint = useCategoryColor(a.category),
    router = useRouter(),
    Icon = CATEGORY_ICONS[a.category];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${a.title}`}
      onPress={() =>
        router.push({ pathname: '/activity/[id]', params: { id: a.id, date } })
      }
      style={{
        padding: 12,
        gap: 6,
        borderRadius: 11,
        backgroundColor: tint.background,
        borderLeftWidth: 2,
        borderColor: tint.foreground + '70',
        minHeight: Math.max(77, Math.min(a.duration * 1.2, 150)),
      }}
    >
      <Row style={{ gap: 5 }}>
        <Icon size={13} color={tint.foreground} />
        <Text style={{ fontSize: 10, color: tint.foreground }}>
          {formatTime(a.time)}
        </Text>
      </Row>
      <Text style={{ fontSize: 12, lineHeight: 18, fontWeight: '500' }}>
        {a.title}
      </Text>
      <Text style={{ fontSize: 10, color: tint.foreground }}>
        {durationLabel(a.duration)}
      </Text>
    </Pressable>
  );
}
export default function CalendarScreen() {
  const { state } = useStore(),
    now = useClock(),
    today = dateKey(now),
    { colors: c } = useTheme(),
    { width } = useWindowDimensions(),
    router = useRouter(),
    [date, setDate] = useState(today),
    [mode, setMode] = useState('Day'),
    [search, setSearch] = useState(''),
    [month, setMonth] = useState(fromKey(today));
  const start = addDays(date, -((fromKey(date).getDay() + 6) % 7)),
    days = Array.from({ length: mode === 'Upcoming' ? 14 : 7 }, (_, i) =>
      addDays(mode === 'Upcoming' ? date : start, i),
    );
  const get = (d: string) =>
    activitiesForDate(state.activities, d).filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase()),
    );
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1),
    gridStart = addDays(dateKey(monthStart), -((monthStart.getDay() + 6) % 7));
  return (
    <View style={{ gap: 25 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View style={{ gap: 7 }}>
          <Heading size={24}>Your schedule</Heading>
          <Text style={{ fontSize: 13, color: c.muted }}>
            Plan today and the days ahead.
          </Text>
        </View>
        <Button
          onPress={() => router.push({ pathname: '/add', params: { date } })}
        >
          <Plus size={16} color={c.onPrimary} />
          <Text style={{ color: c.onPrimary, fontSize: 12 }}>Add activity</Text>
        </Button>
      </Row>
      <Row
        style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}
      >
        <Row style={{ backgroundColor: c.soft, padding: 4, borderRadius: 13 }}>
          {['Day', 'Week', 'Upcoming'].map((m) => (
            <Chip
              key={m}
              label={m}
              selected={mode === m}
              onPress={() => setMode(m)}
            />
          ))}
        </Row>
        <View style={{ width: width < 600 ? '100%' : 260 }}>
          <Input
            accessibilityLabel="Search your schedule"
            placeholder="Search your schedule…"
            value={search}
            onChangeText={setSearch}
            style={{ minHeight: 44, fontSize: 12 }}
          />
        </View>
      </Row>
      <View
        style={{
          flexDirection: width >= 1180 ? 'row' : 'column',
          gap: 25,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, width: '100%', gap: 23 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ gap: 5 }}>
              <IconButton
                icon={ChevronLeft}
                label="Previous period"
                onPress={() =>
                  setDate(
                    addDays(
                      date,
                      mode === 'Day' ? -1 : mode === 'Week' ? -7 : -14,
                    ),
                  )
                }
              />
              <View style={{ gap: 2 }}>
                <Heading size={18}>
                  {mode === 'Day'
                    ? fromKey(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : mode === 'Week'
                      ? `${fromKey(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${fromKey(addDays(start, 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'The next two weeks'}
                </Heading>
                {mode === 'Day' && (
                  <Text style={{ fontSize: 11, color: c.muted }}>
                    {get(date).length} moments planned ·{' '}
                    {durationLabel(
                      get(date).reduce((s, a) => s + a.duration, 0),
                    )}
                  </Text>
                )}
              </View>
              <IconButton
                icon={ChevronRight}
                label="Next period"
                onPress={() =>
                  setDate(
                    addDays(
                      date,
                      mode === 'Day' ? 1 : mode === 'Week' ? 7 : 14,
                    ),
                  )
                }
              />
            </Row>
            <Button
              size="sm"
              variant="outline"
              label="Today"
              onPress={() => {
                setDate(today);
                setMonth(fromKey(today));
              }}
            />
          </Row>
          {mode === 'Day' && (
            <Timeline activities={get(date)} date={date} now={now} />
          )}
          {mode === 'Week' && (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View
                style={{ flexDirection: 'row', gap: 10, paddingBottom: 15 }}
              >
                {days.map((d) => (
                  <View key={d} style={{ width: 142, gap: 9 }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setDate(d);
                        setMode('Day');
                      }}
                      style={{
                        backgroundColor: d === today ? c.tint : c.surface,
                        borderRadius: 12,
                        padding: 13,
                        alignItems: 'center',
                        gap: 4,
                        borderWidth: 1,
                        borderColor: c.border,
                      }}
                    >
                      <Label>
                        {WEEKDAYS[fromKey(d).getDay()].toUpperCase()}
                      </Label>
                      <Heading size={24}>{fromKey(d).getDate()}</Heading>
                      <Text style={{ fontSize: 10, color: c.muted }}>
                        {get(d).length} planned
                      </Text>
                    </Pressable>
                    {get(d).map((a) => (
                      <CalendarBlock key={a.id} activity={a} date={d} />
                    ))}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Add activity on ${d}`}
                      onPress={() =>
                        router.push({ pathname: '/add', params: { date: d } })
                      }
                      style={{
                        minHeight: 44,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: c.border,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus size={17} color={c.muted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          {mode === 'Upcoming' && (
            <View style={{ gap: 24 }}>
              {days
                .filter((d) => get(d).length)
                .map((d) => (
                  <View key={d} style={{ gap: 11 }}>
                    <Row>
                      <Label>
                        {d === today
                          ? 'TODAY'
                          : fromKey(d)
                              .toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                              })
                              .toUpperCase()}
                      </Label>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: c.border,
                          flex: 1,
                        }}
                      />
                    </Row>
                    <Timeline activities={get(d)} date={d} now={now} compact />
                  </View>
                ))}
              {!days.some((d) => get(d).length) && (
                <EmptyState
                  icon={CalendarDays}
                  title="A little open space"
                  description="Nothing scheduled in the next two weeks. Make room for something you love."
                />
              )}
            </View>
          )}
        </View>
        {width >= 1180 && (
          <View style={{ width: 280, gap: 20 }}>
            <Card style={{ padding: 19 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Heading size={16}>
                  {month.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Heading>
                <Row style={{ gap: 0 }}>
                  <IconButton
                    icon={ChevronLeft}
                    label="Previous month"
                    onPress={() =>
                      setMonth(
                        new Date(month.getFullYear(), month.getMonth() - 1, 1),
                      )
                    }
                  />
                  <IconButton
                    icon={ChevronRight}
                    label="Next month"
                    onPress={() =>
                      setMonth(
                        new Date(month.getFullYear(), month.getMonth() + 1, 1),
                      )
                    }
                  />
                </Row>
              </Row>
              <Row style={{ gap: 0, marginTop: 12 }}>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <Text
                    key={d}
                    style={{
                      width: '14.28%',
                      textAlign: 'center',
                      fontSize: 10,
                      color: c.muted,
                    }}
                  >
                    {WEEKDAYS[d].slice(0, 1)}
                  </Text>
                ))}
              </Row>
              <View
                style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}
              >
                {Array.from({ length: 42 }, (_, i) =>
                  addDays(gridStart, i),
                ).map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => {
                      setDate(d);
                      setMode('Day');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={fromKey(d).toDateString()}
                    style={{
                      width: '14.28%',
                      height: 35,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      backgroundColor: d === date ? c.primary : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color:
                          d === date
                            ? c.onPrimary
                            : fromKey(d).getMonth() !== month.getMonth()
                              ? c.border
                              : c.ink,
                      }}
                    >
                      {fromKey(d).getDate()}
                    </Text>
                    {activitiesForDate(state.activities, d).length > 0 && (
                      <View
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: 3,
                          backgroundColor: d === date ? c.bg : c.tintInk,
                          position: 'absolute',
                          bottom: 3,
                        }}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </Card>
            <Card style={{ backgroundColor: c.tint, padding: 22, gap: 12 }}>
              <CalendarDays size={24} color={c.tintInk} />
              <Heading size={18}>A rhythm you can return to.</Heading>
              <Text style={{ fontSize: 12, color: c.tintInk }}>
                Save your everyday moments as a routine. They’ll find their
                place in your calendar.
              </Text>
              <Button
                variant="outline"
                label="Build a routine"
                onPress={() => router.push('/routines')}
              />
            </Card>
          </View>
        )}
      </View>
    </View>
  );
}
