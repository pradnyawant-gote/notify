import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Bell,
  Leaf,
  Sun,
  Moon,
  Monitor,
  Clock3,
  ShieldCheck,
  ArrowRight,
  Check,
  Repeat2,
  Sparkles,
} from 'lucide-react-native';
import { useStore } from '../store/provider';
import { useTheme } from '../theme';
import type { Preferences } from '../domain/types';
import { validTime, minutes, WEEKDAYS, formatTime } from '../domain/dates';
import { REMINDER_POLICY, planReminders } from '../domain/reminders';
import {
  requestNotificationPermission,
  notificationSupport,
} from '../services/notifications';
import { Text } from '../components/ui/text';
import { Button } from '../components/ui/button';
import {
  Card,
  Chip,
  Heading,
  Input,
  Label,
  Row,
} from '../components/ui/primitives';
import { Switch } from '../components/ui/switch';
export default function ProfileScreen() {
  const { state, setPreferences, notify } = useStore(),
    p = state.preferences,
    { colors: c } = useTheme(),
    { width } = useWindowDimensions(),
    router = useRouter(),
    params = useLocalSearchParams<{
      section?: string;
    }>(),
    [draft, setDraft] = useState(p),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const save = () => {
    if (
      !draft.name.trim() ||
      ![draft.wake, draft.sleep, draft.workStart, draft.workEnd].every(
        validTime,
      ) ||
      minutes(draft.workEnd) <= minutes(draft.workStart) ||
      draft.sleep === draft.wake ||
      !draft.workDays.length
    )
      return setError(
        'Add your name, valid HH:MM times, working hours that end after they start, and at least one day.',
      );
    setPreferences({
      name: draft.name.trim(),
      wake: draft.wake,
      sleep: draft.sleep,
      workStart: draft.workStart,
      workEnd: draft.workEnd,
      workDays: draft.workDays,
      schedule: draft.schedule,
    });
    setError('');
    notify('Your personal rhythm has been updated.');
  };
  const enable = async (value: boolean) => {
    if (!value) {
      setPreferences({ notifications: false });
      notify('Notifications paused. Your plans are still here.');
      return;
    }
    setBusy(true);
    try {
      const allowed = await requestNotificationPermission();
      setPreferences({ notifications: allowed });
      notify(
        allowed
          ? 'Gentle reminders are ready on this device.'
          : notificationSupport,
      );
    } catch {
      notify(
        'Could not request notifications. Check this app’s permission in your device settings.',
      );
    } finally {
      setBusy(false);
    }
  };
  const toggles: {
    key: keyof Preferences;
    title: string;
    description: string;
  }[] = [
    {
      key: 'before',
      title: 'A little time to prepare',
      description: 'Before-task reminders, using each activity’s lead time.',
    },
    {
      key: 'start',
      title: 'When it’s time to begin',
      description: 'A nudge at the start of an activity.',
    },
    {
      key: 'followUp',
      title: 'A gentle follow-up',
      description: 'Check in at the end of a task’s planned duration.',
    },
    {
      key: 'missed',
      title: 'A fresh chance',
      description: 'A reminder 30 minutes after an unfinished activity.',
    },
    {
      key: 'breaks',
      title: 'Room to recharge',
      description: 'Include reminders for breaks and rest activities.',
    },
    {
      key: 'habits',
      title: 'The little daily things',
      description: 'Include your recurring habits.',
    },
    {
      key: 'review',
      title: 'Close the day with intention',
      description: 'A review reminder 30 minutes before sleep.',
    },
  ];
  return (
    <View style={{ gap: 26 }}>
      <View style={{ gap: 7 }}>
        <Heading size={24}>Profile & settings</Heading>
        <Text style={{ fontSize: 13, color: c.muted }}>
          Manage your schedule and preferences.
        </Text>
      </View>
      <Card style={{ backgroundColor: 'transparent', padding: 16 }}>
        <Row style={{ gap: 10, flexDirection: 'column' }}>
          <View
            style={{
              height: 62,
              width: 62,
              borderRadius: 36,
              backgroundColor: c.tint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 25,
                fontWeight: '600',
                color: c.ink,
              }}
            >
              {p.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ gap: 4, alignItems: 'center' }}>
            <Heading size={17}>{p.name}</Heading>
            <Text style={{ fontSize: 12, color: c.muted }}>
              {p.demo
                ? 'Exploring an example day'
                : 'Your personal daily operating system'}
            </Text>
          </View>
        </Row>
        {p.demo && (
          <Row
            style={{
              marginTop: 20,
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 12, color: c.tintInk, flex: 1 }}>
              Make it yours to start a fresh plan with your own rhythm.
            </Text>
            <Button
              variant="outline"
              label="Personalize my day"
              onPress={() => router.push('/onboarding')}
            />
          </Row>
        )}
      </Card>
      <View
        style={{
          flexDirection: width >= 1100 ? 'row' : 'column',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, width: '100%', gap: 22 }}>
          <Card style={{ gap: 20 }}>
            <Row>
              <Clock3 size={20} color={c.tintInk} />
              <Heading size={20}>Your daily rhythm</Heading>
            </Row>
            <Input
              label="Your first name"
              value={draft.name}
              onChangeText={(name) => setDraft((x) => ({ ...x, name }))}
              maxLength={30}
            />
            <View style={{ gap: 8 }}>
              <Label>YOUR DAY USUALLY LOOKS LIKE</Label>
              <Row style={{ gap: 3, flexWrap: 'wrap' }}>
                {(['work', 'study', 'flexible'] as const).map((schedule) => (
                  <Chip
                    key={schedule}
                    label={
                      schedule === 'work'
                        ? 'Work'
                        : schedule === 'study'
                          ? 'Study'
                          : 'A little of everything'
                    }
                    selected={draft.schedule === schedule}
                    onPress={() => setDraft((x) => ({ ...x, schedule }))}
                  />
                ))}
              </Row>
            </View>
            <Row>
              <Input
                label="Wake up"
                value={draft.wake}
                onChangeText={(wake) => setDraft((x) => ({ ...x, wake }))}
                maxLength={5}
              />
              <Input
                label="Sleep"
                value={draft.sleep}
                onChangeText={(sleep) => setDraft((x) => ({ ...x, sleep }))}
                maxLength={5}
              />
            </Row>
            <Row>
              <Input
                label="Working hours start"
                value={draft.workStart}
                onChangeText={(workStart) =>
                  setDraft((x) => ({ ...x, workStart }))
                }
                maxLength={5}
              />
              <Input
                label="Finish for the day"
                value={draft.workEnd}
                onChangeText={(workEnd) => setDraft((x) => ({ ...x, workEnd }))}
                maxLength={5}
              />
            </Row>
            <Text style={{ fontSize: 10, color: c.muted }}>
              24-hour times · Quiet hours follow your sleep and wake times.
            </Text>
            <Row style={{ gap: 1, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <Chip
                  key={d}
                  label={WEEKDAYS[d]}
                  selected={draft.workDays.includes(d)}
                  onPress={() =>
                    setDraft((x) => ({
                      ...x,
                      workDays: x.workDays.includes(d)
                        ? x.workDays.filter((y) => y !== d)
                        : [...x.workDays, d],
                    }))
                  }
                />
              ))}
            </Row>
            {Boolean(error) && (
              <Text
                accessibilityLiveRegion="polite"
                style={{ fontSize: 12, color: '#A65C4C' }}
              >
                {error}
              </Text>
            )}
            <Button label="Save my rhythm" onPress={save} />
          </Card>
          <Card style={{ gap: 18 }}>
            <Row>
              <Sun size={20} color={c.peachInk} />
              <Heading size={20}>Set the mood</Heading>
            </Row>
            <Row style={{ gap: 7 }}>
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ].map((t) => (
                <Button
                  key={t.id}
                  variant="outline"
                  onPress={() =>
                    setPreferences({ theme: t.id as Preferences['theme'] })
                  }
                  style={{
                    flex: 1,
                    backgroundColor: p.theme === t.id ? c.tint : c.surface,
                    borderColor: p.theme === t.id ? c.tintInk + '50' : c.border,
                    paddingHorizontal: 8,
                  }}
                >
                  <t.icon size={16} color={c.muted} />
                  <Text style={{ fontSize: 12 }}>{t.label}</Text>
                </Button>
              ))}
            </Row>
            <Text style={{ fontSize: 11, color: c.muted }}>
              System follows your device. Motion follows your accessibility
              preferences.
            </Text>
          </Card>
          <Card style={{ gap: 12 }}>
            <Row>
              <Repeat2 size={20} color={c.tintInk} />
              <Heading size={20}>Your daily routines</Heading>
            </Row>
            <Text style={{ color: c.muted, fontSize: 12 }}>
              {state.routines.filter((r) => r.enabled).length} active routines ·
              Small moments you can return to.
            </Text>
            <Button variant="outline" onPress={() => router.push('/routines')}>
              <Text style={{ fontSize: 12 }}>Manage my routines</Text>
              <ArrowRight size={15} color={c.ink} />
            </Button>
          </Card>
        </View>
        <View style={{ flex: 1, width: '100%', gap: 22 }}>
          <Card
            style={{
              gap: 17,
              borderColor:
                params.section === 'notifications'
                  ? c.tintInk + '60'
                  : c.border,
            }}
          >
            <Row style={{ justifyContent: 'space-between' }}>
              <Row>
                <Bell size={20} color={c.tintInk} />
                <Heading size={20}>Gentle reminders</Heading>
              </Row>
              <Switch
                label="Enable notifications"
                checked={p.notifications}
                onCheckedChange={(v) => {
                  if (!busy) void enable(v);
                }}
              />
            </Row>
            <Text style={{ fontSize: 12, color: c.muted, lineHeight: 20 }}>
              {notificationSupport}
            </Text>
            {p.demo && (
              <Text style={{ fontSize: 11, color: c.peachInk }}>
                The example day does not send notifications. Personalize DayFlow
                to begin.
              </Text>
            )}
            <View style={{ gap: 10 }}>
              <Label>HOW MUCH GUIDANCE FEELS RIGHT?</Label>
              <Row style={{ gap: 7, flexWrap: 'wrap' }}>
                {(['gentle', 'balanced', 'proactive'] as const).map(
                  (intensity) => (
                    <Button
                      key={intensity}
                      variant="outline"
                      onPress={() => setPreferences({ intensity })}
                      style={{
                        flex: 1,
                        minWidth: 95,
                        paddingHorizontal: 8,
                        backgroundColor:
                          p.intensity === intensity ? c.tint : c.bg,
                        borderColor:
                          p.intensity === intensity
                            ? c.tintInk + '60'
                            : c.border,
                      }}
                    >
                      <View style={{ alignItems: 'center', gap: 2 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            textTransform: 'capitalize',
                            fontWeight: '500',
                          }}
                        >
                          {intensity}
                        </Text>
                        <Text style={{ fontSize: 10, color: c.muted }}>
                          ≤{REMINDER_POLICY[intensity].budget} / day
                        </Text>
                      </View>
                    </Button>
                  ),
                )}
              </Row>
              <Text style={{ fontSize: 10, color: c.muted }}>
                At least {REMINDER_POLICY[p.intensity].spacing} minutes between
                reminders. Sleep and focus time stay quiet.
              </Text>
            </View>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: c.border,
                paddingTop: 10,
              }}
            >
              {toggles.map((t) => (
                <Row
                  key={t.key}
                  style={{
                    justifyContent: 'space-between',
                    paddingVertical: 9,
                    borderBottomWidth: 1,
                    borderColor: c.border,
                  }}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontWeight: '500', fontSize: 12 }}>
                      {t.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        lineHeight: 16,
                        color: c.muted,
                        maxWidth: 300,
                      }}
                    >
                      {t.description}
                    </Text>
                  </View>
                  <Switch
                    label={t.title}
                    checked={Boolean(p[t.key])}
                    onCheckedChange={(value) =>
                      setPreferences({ [t.key]: value })
                    }
                  />
                </Row>
              ))}
            </View>
            <Text style={{ fontSize: 10, lineHeight: 17, color: c.muted }}>
              Completing an activity cancels its pending reminders. Follow-ups
              are refreshed when you open DayFlow or change your plan. Your
              device handles delivery.
            </Text>
          </Card>
          <Card style={{ backgroundColor: c.tint, gap: 12 }}>
            <ShieldCheck size={25} color={c.tintInk} />
            <Heading size={19}>Yours, by default.</Heading>
            <Text style={{ fontSize: 12, lineHeight: 21, color: c.tintInk }}>
              Your activities, reflections, and preferences stay on this device.
              No account, no cloud sync, no analytics.
            </Text>
            <Text style={{ fontSize: 10, lineHeight: 17, color: c.muted }}>
              Local data is not a cloud backup. Deleting the app or clearing
              browser storage removes your saved plan.
            </Text>
          </Card>
        </View>
      </View>
    </View>
  );
}
