import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Check,
  Timer,
  Repeat2,
  Leaf,
  TrendingUp,
  Moon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { useStore, useClock } from '../store/provider';
import { useTheme } from '../theme';
import { activitiesForDate, activityStatus } from '../domain/activities';
import { addDays, dateKey, fromKey, WEEKDAYS } from '../domain/dates';
import { Text } from '../components/ui/text';
import { Button } from '../components/ui/button';
import {
  Card,
  Chip,
  Heading,
  Input,
  Label,
  Row,
  IconButton,
} from '../components/ui/primitives';
import { MetricGrid } from '../components/metric-grid';
import { Timeline } from '../components/timeline';
export default function InsightsScreen() {
  const { state, saveReview, notify, saveActivity } = useStore(),
    now = useClock(),
    { colors: c } = useTheme(),
    { width } = useWindowDimensions(),
    router = useRouter(),
    today = dateKey(now),
    [date, setDate] = useState(today),
    [note, setNote] = useState(state.reviews[today] ?? ''),
    [tab, setTab] = useState('Overview');
  const activities = activitiesForDate(state.activities, date),
    done = activities.filter((a) => a.completedOn.includes(date)),
    missed = activities.filter(
      (a) => activityStatus(a, date, now.getTime()) === 'missed',
    ),
    open = activities.filter((a) =>
      ['current', 'upcoming'].includes(activityStatus(a, date, now.getTime())),
    ),
    habits = activities.filter((a) => a.type === 'habit'),
    habitDone = habits.filter((a) => a.completedOn.includes(date)),
    focus = state.sessions
      .filter((s) => s.date === date)
      .reduce((sum, s) => sum + s.seconds, 0),
    percent = activities.length
      ? Math.round((done.length / activities.length) * 100)
      : 0;
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)),
    tomorrow = addDays(date, 1),
    tomorrowItems = activitiesForDate(state.activities, tomorrow),
    carry = missed.filter((a) => !a.days.length);
  const changeDate = (d: string) => {
    setDate(d);
    setNote(state.reviews[d] ?? '');
  };
  return (
    <View style={{ gap: 25 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View style={{ gap: 7 }}>
          <Heading size={24}>Daily insights</Heading>
          <Text style={{ color: c.muted, fontSize: 13 }}>
            Your activities, habits, and focus time.
          </Text>
        </View>
        <Row>
          <IconButton
            icon={ChevronLeft}
            label="Previous day's review"
            onPress={() => changeDate(addDays(date, -1))}
          />
          <Text style={{ fontSize: 12, color: c.muted }}>
            {date === today
              ? 'Today'
              : fromKey(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
          </Text>
          <IconButton
            icon={ChevronRight}
            label="Next day's review"
            onPress={() => changeDate(addDays(date, 1))}
          />
        </Row>
      </Row>
      <Row
        style={{
          backgroundColor: c.soft,
          padding: 4,
          borderRadius: 13,
          alignSelf: 'flex-start',
        }}
      >
        {['Overview', 'Daily review'].map((t) => (
          <Chip
            key={t}
            label={t}
            selected={tab === t}
            onPress={() => setTab(t)}
          />
        ))}
      </Row>

      <View style={{ width: '100%', maxWidth: 800 }}>
        <MetricGrid
          items={[
            {
              key: 'productivity',
              label: 'Productivity',
              value: percent + '%',
              note: done.length + ' of ' + activities.length + ' complete',
              tone: 'blue',
              icon: TrendingUp,
              onPress: () => setTab('Daily review'),
            },
            {
              key: 'focus',
              label: 'Focus time',
              value: Math.round(focus / 60) + ' min',
              note: 'Recorded today',
              tone: 'black',
              icon: Timer,
              onPress: () => router.push('/focus'),
            },
            {
              key: 'habits',
              label: 'Habits',
              value: habitDone.length + ' / ' + habits.length,
              note: 'Habits complete',
              tone: 'black',
              icon: Repeat2,
              onPress: () => router.push('/routines'),
            },
            {
              key: 'missed',
              label: 'Missed activities',
              value: String(missed.length),
              note: 'Needs attention',
              tone: 'blue',
              icon: CalendarDays,
              onPress: () => setTab('Daily review'),
            },
          ]}
        />
      </View>
      {tab === 'Overview' && (
        <Card style={{ padding: width < 600 ? 20 : 28 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ gap: 5 }}>
              <Heading size={20}>A week of small wins</Heading>
              <Text style={{ fontSize: 12, color: c.muted }}>
                Daily completion · the last seven days
              </Text>
            </View>
            <View
              style={{ backgroundColor: c.tint, padding: 8, borderRadius: 9 }}
            >
              <Leaf size={17} color={c.tintInk} />
            </View>
          </Row>
          <View
            style={{
              flexDirection: 'row',
              gap: width < 600 ? 12 : 25,
              alignItems: 'flex-end',
              height: 200,
              paddingTop: 28,
            }}
          >
            {week.map((d) => {
              const items = activitiesForDate(state.activities, d),
                count = items.filter((a) => a.completedOn.includes(d)).length,
                p = items.length ? count / items.length : 0;
              return (
                <View
                  key={d}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: 9,
                  }}
                >
                  <Text style={{ fontSize: 11, color: c.muted }}>
                    {Math.round(p * 100)}%
                  </Text>
                  <View
                    accessibilityLabel={`${WEEKDAYS[fromKey(d).getDay()]} ${Math.round(p * 100)} percent complete`}
                    style={{
                      height: Math.max(5, p * 125),
                      width: '100%',
                      maxWidth: 72,
                      borderRadius: 8,
                      backgroundColor: d === today ? c.primary : c.tint,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: d === today ? c.primary : c.muted,
                      fontWeight: d === today ? '600' : '400',
                    }}
                  >
                    {WEEKDAYS[fromKey(d).getDay()]}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={{ fontSize: 10, color: c.muted, marginTop: 22 }}>
            Productivity is the percentage of planned moments you marked
            complete. Upcoming activities are included. Focus time is recorded
            separately.
          </Text>
        </Card>
      )}
      <View
        style={{
          flexDirection: width >= 1080 ? 'row' : 'column',
          gap: 23,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, width: '100%', gap: 20 }}>
          <Card style={{ gap: 18, padding: 24 }}>
            <Row>
              <Moon size={20} color={c.tintInk} />
              <Heading size={20}>Close your day with intention.</Heading>
            </Row>
            <Row style={{ gap: 9 }}>
              {[
                { value: done.length, label: 'Completed', color: c.tintInk },
                { value: missed.length, label: 'Missed', color: c.peachInk },
                {
                  value: open.length,
                  label: 'Still ahead',
                  color: c.lavenderInk,
                },
              ].map((s) => (
                <View
                  key={s.label}
                  style={{
                    flex: 1,
                    backgroundColor: c.bg,
                    padding: 15,
                    borderRadius: 12,
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: 25,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </Text>
                  <Text style={{ fontSize: 10, color: c.muted }}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </Row>
            <Input
              label="What felt good today?"
              placeholder="A small win, something you learned, a moment for yourself…"
              multiline
              value={note}
              onChangeText={setNote}
              style={{ minHeight: 110, textAlignVertical: 'top' }}
              maxLength={2000}
            />
            <Button
              label={
                state.reviews[date]
                  ? 'Update my reflection'
                  : 'Save my reflection'
              }
              onPress={() => {
                saveReview(date, note.trim());
                notify('A moment of reflection, saved.');
              }}
            />
            {carry.length > 0 && date <= today && (
              <Button
                variant="outline"
                label={`Move ${carry.length} missed ${carry.length === 1 ? 'activity' : 'activities'} to tomorrow`}
                onPress={() => {
                  carry.forEach((a) =>
                    saveActivity({ ...a, date: tomorrow, completedOn: [] }),
                  );
                  notify(
                    'A fresh start for tomorrow. Check Calendar for any overlaps.',
                  );
                }}
              />
            )}
          </Card>
          {tab === 'Daily review' && (
            <View style={{ gap: 15 }}>
              <Heading size={19}>The moments of your day</Heading>
              <Timeline activities={activities} date={date} now={now} compact />
            </View>
          )}
        </View>
        <Card
          style={{ width: width >= 1080 ? 320 : '100%', padding: 24, gap: 16 }}
        >
          <Row style={{ justifyContent: 'space-between' }}>
            <Heading size={19}>A peek at tomorrow</Heading>
            <CalendarDays size={18} color={c.muted} />
          </Row>
          <Text style={{ fontSize: 12, color: c.muted }}>
            {fromKey(tomorrow).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {tomorrowItems.length ? (
            <Timeline
              activities={tomorrowItems.slice(0, 3)}
              date={tomorrow}
              now={now}
              compact
            />
          ) : (
            <Text style={{ fontSize: 13, color: c.tintInk, lineHeight: 23 }}>
              A little open space. Tomorrow is yours to shape.
            </Text>
          )}
          <Button variant="outline" onPress={() => router.push('/calendar')}>
            <Text style={{ fontSize: 12 }}>View my calendar</Text>
            <ArrowRight size={15} color={c.ink} />
          </Button>
        </Card>
      </View>
    </View>
  );
}
