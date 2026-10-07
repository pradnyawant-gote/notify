import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import {
  CheckSquare,
  Bell,
  Repeat2,
  Video,
  Timer,
  Coffee,
  Sparkles,
  Check,
  Info,
  ChevronDown,
} from 'lucide-react-native';
import type { Activity, ActivityType, Category } from '../domain/types';
import {
  dateKey,
  durationLabel,
  formatTime,
  minutes,
  validDate,
  validTime,
  WEEKDAYS,
} from '../domain/dates';
import { findGap, hasConflict } from '../domain/activities';
import { uid, useClock, useStore } from '../store/provider';
import { useTheme } from '../theme';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { Chip, Input, Label, Row } from './ui/primitives';
import { Switch } from './ui/switch';
const types = [
  { type: 'task', label: 'Task', icon: CheckSquare },
  { type: 'reminder', label: 'Reminder', icon: Bell },
  { type: 'habit', label: 'Habit', icon: Repeat2 },
  { type: 'meeting', label: 'Meeting', icon: Video },
  { type: 'focus', label: 'Focus', icon: Timer },
  { type: 'personal', label: 'Personal', icon: Coffee },
] as const;
export function ActivityForm({
  initial,
  date,
  type,
  onSave,
}: {
  initial?: Activity;
  date?: string;
  type?: ActivityType;
  onSave: () => void;
}) {
  const { state, saveActivity, notify } = useStore(),
    now = useClock(),
    { colors: c } = useTheme();
  const [draft, setDraft] = useState<Activity>(
    initial ?? {
      id: uid(),
      title: '',
      notes: '',
      type: type ?? 'task',
      category: type === 'personal' || type === 'habit' ? 'personal' : 'work',
      date: date ?? dateKey(now),
      time:
        findGap(
          state.activities,
          date ?? dateKey(now),
          30,
          state.preferences,
          now,
        ) ?? state.preferences.workStart,
      duration: 30,
      days: type === 'habit' ? [0, 1, 2, 3, 4, 5, 6] : [],
      completedOn: [],
      reminder: true,
      leadMinutes: 5,
    },
  );
  const [error, setError] = useState(''),
    [recurring, setRecurring] = useState(draft.days.length > 0),
    [more, setMore] = useState(Boolean(initial?.notes));
  const update = (p: Partial<Activity>) => {
    setDraft((a) => ({ ...a, ...p }));
    setError('');
  };
  const conflict =
    validTime(draft.time) &&
    validDate(draft.date) &&
    hasConflict(state.activities, draft);
  const save = () => {
    if (!draft.title.trim()) return setError('Give this moment a name.');
    if (!validDate(draft.date))
      return setError('Use a real date in YYYY-MM-DD format.');
    if (!validTime(draft.time))
      return setError('Use a time in 24-hour HH:MM format.');
    if (
      !Number.isFinite(draft.duration) ||
      draft.duration < 1 ||
      draft.duration > 720 ||
      minutes(draft.time) + draft.duration > 1440
    )
      return setError(
        'Choose a duration of 1–720 minutes that finishes within this day.',
      );
    if (recurring && !draft.days.length)
      return setError('Choose at least one day for this activity to repeat.');
    saveActivity({
      ...draft,
      title: draft.title.trim(),
      days: recurring ? draft.days : [],
    });
    notify(
      initial
        ? 'Your activity has been updated.'
        : 'A new moment, added to your day.',
    );
    onSave();
  };
  return (
    <View style={{ gap: 22 }}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {types.map((t) => (
          <Pressable
            key={t.type}
            accessibilityRole="button"
            accessibilityState={{ selected: draft.type === t.type }}
            onPress={() => {
              update({
                type: t.type,
                category:
                  t.type === 'personal'
                    ? 'personal'
                    : t.type === 'habit'
                      ? 'health'
                      : 'work',
                days: t.type === 'habit' ? [0, 1, 2, 3, 4, 5, 6] : draft.days,
              });
              if (t.type === 'habit') setRecurring(true);
            }}
            style={{
              width: '31.5%',
              minHeight: 62,
              padding: 10,
              borderRadius: 12,
              backgroundColor: draft.type === t.type ? c.tint : c.bg,
              borderWidth: 1,
              borderColor: draft.type === t.type ? c.tintInk + '50' : c.border,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <t.icon
              size={18}
              color={draft.type === t.type ? c.primary : c.muted}
            />
            <Text
              style={{
                fontSize: 11,
                color: draft.type === t.type ? c.primary : c.muted,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Input
        label="What would you like to make time for?"
        placeholder="e.g. Read a chapter, take a walk…"
        value={draft.title}
        onChangeText={(title) => update({ title })}
        maxLength={120}
        autoFocus
      />
      <Row style={{ alignItems: 'flex-start' }}>
        <Input
          label="Date"
          placeholder="YYYY-MM-DD"
          value={draft.date}
          onChangeText={(date) => update({ date })}
          maxLength={10}
        />
        <Input
          label="Start time"
          placeholder="09:30"
          value={draft.time}
          onChangeText={(time) => update({ time })}
          maxLength={5}
          keyboardType="numbers-and-punctuation"
        />
      </Row>
      <View style={{ gap: 9 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, fontWeight: '500' }}>Duration</Text>
          <Text style={{ fontSize: 12, color: c.muted }}>
            {durationLabel(draft.duration)}
          </Text>
        </Row>
        <Row style={{ gap: 5, flexWrap: 'wrap' }}>
          {[15, 25, 30, 45, 60, 90].map((n) => (
            <Chip
              key={n}
              label={`${n}m`}
              selected={draft.duration === n}
              onPress={() => update({ duration: n })}
            />
          ))}
          <View style={{ width: 74 }}>
            <Input
              accessibilityLabel="Custom duration in minutes"
              value={String(draft.duration)}
              onChangeText={(v) => update({ duration: Number(v) })}
              keyboardType="number-pad"
              style={{ minHeight: 40, paddingVertical: 7, fontSize: 12 }}
            />
          </View>
        </Row>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          const time = findGap(
            state.activities.filter((a) => a.id !== draft.id),
            draft.date,
            draft.duration,
            state.preferences,
            now,
          );
          if (time) {
            update({ time });
            notify(`Found an open moment at ${formatTime(time)}.`);
          } else
            setError(
              'No open slot during your working hours. Choose a time or a shorter duration.',
            );
        }}
      >
        <Row style={{ backgroundColor: c.tint, padding: 12, borderRadius: 12 }}>
          <Sparkles size={15} color={c.tintInk} />
          <Text style={{ fontSize: 12, color: c.tintInk }}>
            Find an open moment in my day
          </Text>
        </Row>
      </Pressable>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '500' }}>Make room for</Text>
        <Row style={{ gap: 3, flexWrap: 'wrap' }}>
          {(['work', 'study', 'health', 'personal', 'rest'] as Category[]).map(
            (cat) => (
              <Chip
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                selected={draft.category === cat}
                onPress={() => update({ category: cat })}
              />
            ),
          )}
        </Row>
      </View>
      <View
        style={{ borderTopWidth: 1, borderColor: c.border, paddingTop: 10 }}
      >
        <Row style={{ justifyContent: 'space-between' }}>
          <Row>
            <Bell size={16} color={c.muted} />
            <Text style={{ fontSize: 13 }}>Remind me gently</Text>
          </Row>
          <Switch
            label="Activity reminders"
            checked={draft.reminder}
            onCheckedChange={(reminder) => update({ reminder })}
          />
        </Row>
        {draft.reminder && (
          <Row style={{ gap: 2, flexWrap: 'wrap' }}>
            {[0, 5, 10, 15].map((n) => (
              <Chip
                key={n}
                label={n === 0 ? 'At start' : `${n}m before`}
                selected={draft.leadMinutes === n}
                onPress={() => update({ leadMinutes: n })}
              />
            ))}
          </Row>
        )}
        <Row style={{ justifyContent: 'space-between' }}>
          <Row>
            <Repeat2 size={16} color={c.muted} />
            <Text style={{ fontSize: 13 }}>Repeat this activity</Text>
          </Row>
          <Switch
            label="Repeat this activity"
            checked={recurring}
            onCheckedChange={(v) => {
              setRecurring(v);
              if (v && !draft.days.length) update({ days: [1, 2, 3, 4, 5] });
            }}
          />
        </Row>
        {recurring && (
          <Row style={{ gap: 5 }}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <Pressable
                key={d}
                accessibilityRole="button"
                accessibilityLabel={`Repeat on ${WEEKDAYS[d]}`}
                accessibilityState={{ selected: draft.days.includes(d) }}
                onPress={() =>
                  update({
                    days: draft.days.includes(d)
                      ? draft.days.filter((x) => x !== d)
                      : [...draft.days, d],
                  })
                }
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: draft.days.includes(d) ? c.tint : c.bg,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: draft.days.includes(d) ? c.primary : c.muted,
                  }}
                >
                  {WEEKDAYS[d].slice(0, 1)}
                </Text>
              </Pressable>
            ))}
          </Row>
        )}
      </View>
      <Pressable onPress={() => setMore(!more)}>
        <Row>
          <Text style={{ fontSize: 12, color: c.muted }}>
            {more ? 'Hide notes' : 'Add a little context'}
          </Text>
          <ChevronDown size={14} color={c.muted} />
        </Row>
      </Pressable>
      {more && (
        <Input
          label="Notes"
          multiline
          placeholder="Anything that will help you get started."
          value={draft.notes}
          onChangeText={(notes) => update({ notes })}
          style={{ minHeight: 85 }}
          maxLength={1000}
        />
      )}
      {conflict && (
        <Row
          style={{ backgroundColor: c.peach, padding: 12, borderRadius: 12 }}
        >
          <Info size={16} color={c.peachInk} />
          <Text style={{ fontSize: 12, color: c.peachInk, flex: 1 }}>
            This overlaps an activity. You can still save it, or find an open
            moment.
          </Text>
        </Row>
      )}
      {Boolean(error) && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: '#B65A49', fontSize: 12 }}
        >
          {error}
        </Text>
      )}
      <Button onPress={save}>
        <PlusIcon />
        <Text style={{ color: c.onPrimary, fontWeight: '500' }}>
          {initial ? 'Save changes' : conflict ? 'Add anyway' : 'Add to my day'}
        </Text>
      </Button>
      <Text style={{ fontSize: 10, color: c.muted, textAlign: 'center' }}>
        Saved on this device. Yours, without an account.
      </Text>
    </View>
  );
}
function PlusIcon() {
  const { colors: c } = useTheme();
  return <Check size={16} color={c.onPrimary} />;
}
