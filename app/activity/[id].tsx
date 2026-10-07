import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CalendarDays,
  Clock3,
  Bell,
  Repeat2,
  Check,
  Play,
  Pencil,
  ArrowRight,
  Trash2,
  Info,
} from 'lucide-react-native';
import { useStore, useClock } from '../../src/store/provider';
import { useTheme } from '../../src/theme';
import { Sheet } from '../../src/components/sheet';
import { Text } from '../../src/components/ui/text';
import { Button } from '../../src/components/ui/button';
import { Card, Heading, Label, Row } from '../../src/components/ui/primitives';
import {
  CATEGORY_ICONS,
  useCategoryColor,
} from '../../src/components/timeline';
import {
  addDays,
  dateKey,
  durationLabel,
  formatTime,
  fromKey,
  WEEKDAYS,
} from '../../src/domain/dates';
import { activityStatus } from '../../src/domain/activities';
export default function ActivityScreen() {
  const { id, date: dateParam } = useLocalSearchParams<{
      id: string;
      date?: string;
    }>(),
    {
      state,
      toggleComplete,
      deleteActivity,
      saveActivity,
      startFocus,
      notify,
    } = useStore(),
    now = useClock(),
    router = useRouter(),
    { colors: c } = useTheme(),
    a = state.activities.find((x) => x.id === id),
    [confirm, setConfirm] = useState(false);
  const tint = useCategoryColor(a?.category ?? 'work'),
    date = dateParam ?? dateKey(now),
    close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!a)
    return (
      <Sheet title="This moment has moved on">
        <Text style={{ color: c.muted }}>
          This activity was deleted or is no longer in your plan.
        </Text>
      </Sheet>
    );
  const done = a.completedOn.includes(date),
    status = activityStatus(a, date, now.getTime()),
    Icon = CATEGORY_ICONS[a.category];
  return (
    <Sheet
      title="A moment in your day"
      description="Your plan is allowed to change."
    >
      <View style={{ gap: 21 }}>
        <View
          style={{
            backgroundColor: tint.background,
            padding: 22,
            borderRadius: 19,
            gap: 12,
          }}
        >
          <Row>
            <Icon size={22} color={tint.foreground} />
            <Label>
              {a.category.toUpperCase()} · {a.type.toUpperCase()}
            </Label>
          </Row>
          <Heading size={25}>{a.title}</Heading>
          <Text style={{ fontSize: 12, color: tint.foreground }}>
            {done
              ? 'A little win. Complete.'
              : status === 'current'
                ? 'This is your moment.'
                : status === 'missed'
                  ? 'A fresh start is always an option.'
                  : 'Something to look forward to.'}
          </Text>
        </View>
        <Row>
          <CalendarDays size={17} color={c.muted} />
          <Text>
            {fromKey(date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Row>
        <Row>
          <Clock3 size={17} color={c.muted} />
          <Text>
            {formatTime(a.time)} · {durationLabel(a.duration)}
          </Text>
        </Row>
        {a.days.length > 0 && (
          <Row>
            <Repeat2 size={17} color={c.muted} />
            <Text style={{ fontSize: 12 }}>
              Repeats{' '}
              {a.days.length === 7
                ? 'every day'
                : a.days.map((d) => WEEKDAYS[d]).join(', ')}
            </Text>
          </Row>
        )}
        <Row>
          <Bell size={17} color={c.muted} />
          <Text style={{ fontSize: 12, color: c.muted }}>
            {a.reminder
              ? `${a.leadMinutes ? `${a.leadMinutes} minutes before` : 'At start'} · ${state.preferences.notifications ? 'according to your preferences' : 'notifications are off'}`
              : 'No reminders for this activity'}
          </Text>
        </Row>
        {Boolean(a.notes) && (
          <Card style={{ padding: 17 }}>
            <Label>A LITTLE CONTEXT</Label>
            <Text style={{ marginTop: 8, lineHeight: 24 }}>{a.notes}</Text>
          </Card>
        )}
        <Button
          onPress={() => {
            toggleComplete(a.id, date);
            notify(
              done ? 'Activity reopened.' : 'A little win, added to your day.',
            );
            close();
          }}
        >
          <Check size={17} color={c.onPrimary} />
          <Text style={{ color: c.onPrimary, fontWeight: '500' }}>
            {done ? 'Mark as open' : 'Mark complete'}
          </Text>
        </Button>
        {!done && (
          <Button
            variant="outline"
            onPress={() => {
              if (!state.focus) startFocus(a.id, a.title, 25, date);
              router.push('/focus');
            }}
          >
            <Play size={15} color={c.primary} />
            <Text>Focus on this</Text>
          </Button>
        )}
        <Row>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() =>
              a.routineId
                ? router.push({
                    pathname: '/routines',
                    params: { edit: a.routineId },
                  })
                : router.push({ pathname: '/add', params: { id: a.id } })
            }
          >
            <Pencil size={15} color={c.muted} />
            <Text style={{ fontSize: 12 }}>
              {a.routineId ? 'Edit routine' : 'Edit activity'}
            </Text>
          </Button>
          {!a.days.length && (
            <Button
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => {
                saveActivity({ ...a, date: addDays(date, 1), completedOn: [] });
                notify('A fresh moment tomorrow.');
                close();
              }}
            >
              <ArrowRight size={15} color={c.muted} />
              <Text style={{ fontSize: 12 }}>Move to tomorrow</Text>
            </Button>
          )}
        </Row>
        {!a.routineId &&
          (confirm ? (
            <View
              style={{
                gap: 12,
                backgroundColor: c.peach,
                borderRadius: 15,
                padding: 15,
              }}
            >
              <Text style={{ fontSize: 12, color: c.peachInk }}>
                Delete this activity
                {a.days.length ? ' and all future repeats' : ''}? This cannot be
                undone.
              </Text>
              <Row>
                <Button
                  variant="destructive"
                  label="Delete activity"
                  onPress={() => {
                    deleteActivity(a.id);
                    notify('Activity removed. A little more space.');
                    close();
                  }}
                />
                <Button
                  variant="ghost"
                  label="Keep it"
                  onPress={() => setConfirm(false)}
                />
              </Row>
            </View>
          ) : (
            <Button variant="ghost" onPress={() => setConfirm(true)}>
              <Trash2 size={14} color={c.muted} />
              <Text style={{ fontSize: 12, color: c.muted }}>
                Delete activity
              </Text>
            </Button>
          ))}
      </View>
    </Sheet>
  );
}
