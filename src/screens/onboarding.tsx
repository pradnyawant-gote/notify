import React, { useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  ArrowLeft,
  BriefcaseBusiness,
  GraduationCap,
  Leaf,
  Bell,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Check,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { Brand } from '../components/brand';
import { MetricCard } from '../components/metric-card';
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
import { useTheme } from '../theme';
import { uid, useStore } from '../store/provider';
import { defaultPreferences } from '../store/seed';
import { dateKey, minutes, toTime, validTime, WEEKDAYS } from '../domain/dates';
import { REMINDER_POLICY } from '../domain/reminders';
import {
  requestNotificationPermission,
  notificationSupport,
} from '../services/notifications';
const steps = [
  {
    label: 'A LITTLE ABOUT YOU',
    title: 'A good day starts with you.',
    description: 'Let’s build a rhythm around your life.',
  },
  {
    label: 'YOUR DAILY RHYTHM',
    title: 'Find your natural flow.',
    description: 'A little structure. Plenty of room to breathe.',
  },
  {
    label: 'GENTLE GUIDANCE',
    title: 'The right nudge. Your way.',
    description: 'Helpful moments, without the notification noise.',
  },
  {
    label: 'WHAT MATTERS TO YOU',
    title: 'Make room for your priorities.',
    description: 'Choose a few things you want more of in your day.',
  },
];
export default function OnboardingScreen() {
  const { colors: c, reducedMotion } = useTheme(),
    { width } = useWindowDimensions(),
    router = useRouter(),
    { finishOnboarding, enterDemo, saveRoutine, state } = useStore();
  const [step, setStep] = useState(0),
    [p, setP] = useState({
      ...defaultPreferences,
      name: state.preferences.demo ? '' : state.preferences.name,
      theme: state.preferences.theme,
      notifications: state.preferences.notifications,
    }),
    [error, setError] = useState(''),
    [permission, setPermission] = useState(false);
  const update = (v: Partial<typeof p>) => {
    setP((x) => ({ ...x, ...v }));
    setError('');
  };
  const next = () => {
    if (step === 0 && !p.name.trim())
      return setError('What should we call you?');
    if (
      step === 1 &&
      (![p.wake, p.sleep, p.workStart, p.workEnd].every(validTime) ||
        minutes(p.workStart) >= minutes(p.workEnd) ||
        p.wake === p.sleep ||
        !p.workDays.length)
    )
      return setError(
        'Use HH:MM times, an end after the work start, and at least one working day.',
      );
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!p.goals.length) return setError('Choose one goal to get started.');
    finishOnboarding({ ...p, name: p.name.trim() });
    saveRoutine({
      id: uid(),
      title: 'My morning rhythm',
      days: p.workDays,
      enabled: true,
      steps: [
        {
          id: uid(),
          title: 'Wake up & hydrate',
          time: p.wake,
          duration: 15,
          category: 'health',
        },
        {
          id: uid(),
          title: 'A mindful breakfast',
          time: toTime(Math.min(minutes(p.wake) + 45, 1380)),
          duration: 30,
          category: 'personal',
        },
      ],
    });
    router.replace('/');
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          padding: width < 650 ? 24 : 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 1060,
            flexDirection: width >= 900 ? 'row' : 'column',
            gap: width >= 900 ? 90 : 30,
            alignItems: 'center',
          }}
        >
          {width >= 900 && (
            <View style={{ flex: 1, gap: 24 }}>
              <Brand />
              <Label>YOUR PERSONAL DAILY OPERATING SYSTEM</Label>
              <Heading size={38}>Your day.{'\n'}In one place.</Heading>
              <Text
                style={{
                  color: c.muted,
                  lineHeight: 26,
                  fontSize: 16,
                  maxWidth: 360,
                }}
              >
                Work, rest, and everything in between. A calmer place to shape
                your day.
              </Text>
              <Row style={{ alignItems: 'stretch', gap: 12 }}>
                <MetricCard
                  label="Your schedule"
                  value="One day"
                  note="in focus"
                  tone="blue"
                  icon={Sun}
                />
                <MetricCard
                  label="Your routine"
                  value="Your pace"
                  note="every day"
                  tone="black"
                  icon={Moon}
                />
              </Row>
              <Row>
                <ShieldCheck size={16} color={c.tintInk} />
                <Text style={{ color: c.muted, fontSize: 12 }}>
                  Private by default. Saved on your device.
                </Text>
              </Row>
            </View>
          )}
          <View style={{ width: '100%', maxWidth: 460, gap: 26 }}>
            {width < 900 && <Brand />}
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ gap: 6 }}>
                {steps.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      height: 4,
                      width: 34,
                      borderRadius: 3,
                      backgroundColor: i <= step ? c.primary : c.border,
                    }}
                  />
                ))}
              </Row>
              <Label>0{step + 1} / 04</Label>
            </Row>
            <MotiView
              key={step}
              from={reducedMotion ? undefined : { opacity: 0, translateX: 12 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 250 }}
              style={{ gap: 23 }}
            >
              <View style={{ gap: 9 }}>
                <Label>{steps[step].label}</Label>
                <Heading size={29}>{steps[step].title}</Heading>
                <Text style={{ fontSize: 13, color: c.muted }}>
                  {steps[step].description}
                </Text>
              </View>
              {step === 0 && (
                <>
                  <Input
                    label="Your first name"
                    placeholder="What should we call you?"
                    value={p.name}
                    onChangeText={(name) => update({ name })}
                    maxLength={30}
                    autoFocus
                  />
                  <View style={{ gap: 9 }}>
                    <Text style={{ fontWeight: '500', fontSize: 13 }}>
                      What does your day usually look like?
                    </Text>
                    {[
                      {
                        id: 'work',
                        title: 'I work',
                        desc: 'Give meaningful work its own space.',
                        icon: BriefcaseBusiness,
                      },
                      {
                        id: 'study',
                        title: 'I study',
                        desc: 'Balance learning, deadlines and downtime.',
                        icon: GraduationCap,
                      },
                      {
                        id: 'flexible',
                        title: 'A little of everything',
                        desc: 'A flexible rhythm, made for real life.',
                        icon: Leaf,
                      },
                    ].map((o) => (
                      <Button
                        key={o.id}
                        variant="outline"
                        onPress={() =>
                          update({ schedule: o.id as typeof p.schedule })
                        }
                        style={{
                          justifyContent: 'flex-start',
                          padding: 16,
                          backgroundColor:
                            p.schedule === o.id ? c.tint : c.surface,
                          borderColor:
                            p.schedule === o.id ? c.tintInk + '60' : c.border,
                        }}
                      >
                        <o.icon
                          size={21}
                          color={p.schedule === o.id ? c.primary : c.muted}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '500' }}>{o.title}</Text>
                          <Text style={{ fontSize: 11, color: c.muted }}>
                            {o.desc}
                          </Text>
                        </View>
                        {p.schedule === o.id && (
                          <Check size={18} color={c.primary} />
                        )}
                      </Button>
                    ))}
                  </View>
                </>
              )}
              {step === 1 && (
                <>
                  <Row style={{ alignItems: 'flex-start' }}>
                    <Input
                      label="Wake up"
                      value={p.wake}
                      onChangeText={(wake) => update({ wake })}
                      placeholder="07:00"
                      maxLength={5}
                    />
                    <Input
                      label="Wind down / sleep"
                      value={p.sleep}
                      onChangeText={(sleep) => update({ sleep })}
                      placeholder="23:00"
                      maxLength={5}
                    />
                  </Row>
                  <Row style={{ alignItems: 'flex-start' }}>
                    <Input
                      label={
                        p.schedule === 'study'
                          ? 'Study starts'
                          : 'Working hours start'
                      }
                      value={p.workStart}
                      onChangeText={(workStart) => update({ workStart })}
                      maxLength={5}
                    />
                    <Input
                      label="Finish for the day"
                      value={p.workEnd}
                      onChangeText={(workEnd) => update({ workEnd })}
                      maxLength={5}
                    />
                  </Row>
                  <Text style={{ fontSize: 11, color: c.muted }}>
                    Times use the 24-hour clock, for example 17:00.
                  </Text>
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500' }}>
                      Your usual days
                    </Text>
                    <Row style={{ gap: 4, flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                        <Chip
                          key={d}
                          label={WEEKDAYS[d]}
                          selected={p.workDays.includes(d)}
                          onPress={() =>
                            update({
                              workDays: p.workDays.includes(d)
                                ? p.workDays.filter((x) => x !== d)
                                : [...p.workDays, d],
                            })
                          }
                        />
                      ))}
                    </Row>
                  </View>
                  <Card style={{ backgroundColor: c.tint, padding: 17 }}>
                    <Row>
                      <Moon size={19} color={c.tintInk} />
                      <Text style={{ color: c.tintInk, fontSize: 12, flex: 1 }}>
                        Sleep is part of the plan. Reminders stay quiet while
                        you rest.
                      </Text>
                    </Row>
                  </Card>
                </>
              )}
              {step === 2 && (
                <>
                  <View style={{ gap: 10 }}>
                    {(['gentle', 'balanced', 'proactive'] as const).map(
                      (intensity) => (
                        <Button
                          key={intensity}
                          variant="outline"
                          onPress={() => update({ intensity })}
                          style={{
                            justifyContent: 'flex-start',
                            backgroundColor:
                              p.intensity === intensity ? c.tint : c.surface,
                            padding: 16,
                            borderColor:
                              p.intensity === intensity
                                ? c.tintInk + '60'
                                : c.border,
                          }}
                        >
                          <Bell size={20} color={c.tintInk} />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontWeight: '600',
                                textTransform: 'capitalize',
                              }}
                            >
                              {intensity}
                            </Text>
                            <Text style={{ fontSize: 11, color: c.muted }}>
                              Up to {REMINDER_POLICY[intensity].budget}{' '}
                              reminders · {REMINDER_POLICY[intensity].spacing}{' '}
                              minutes apart
                            </Text>
                          </View>
                          {p.intensity === intensity && (
                            <Check size={18} color={c.primary} />
                          )}
                        </Button>
                      ),
                    )}
                  </View>
                  <Text
                    style={{ color: c.muted, fontSize: 12, lineHeight: 20 }}
                  >
                    {notificationSupport}
                  </Text>
                  <Button
                    variant="secondary"
                    disabled={permission || p.notifications}
                    label={
                      p.notifications
                        ? 'Reminders allowed'
                        : permission
                          ? 'Checking permission…'
                          : 'Allow notifications'
                    }
                    onPress={async () => {
                      setPermission(true);
                      try {
                        const enabled = await requestNotificationPermission();
                        update({ notifications: enabled });
                        if (!enabled)
                          setError(
                            'Notifications are unavailable or not allowed. You can enable them later on your phone.',
                          );
                      } catch {
                        setError(
                          'Permission could not be requested. You can try again in Profile.',
                        );
                      } finally {
                        setPermission(false);
                      }
                    }}
                  />
                  <Text style={{ fontSize: 11, color: c.muted }}>
                    Optional. You can change all of this later.
                  </Text>
                </>
              )}
              {step === 3 && (
                <>
                  <View
                    style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}
                  >
                    {[
                      'Stay focused',
                      'Move every day',
                      'Find balance',
                      'Keep learning',
                      'Build healthy habits',
                      'Sleep better',
                      'Make time for myself',
                      'Stay organized',
                    ].map((goal) => (
                      <Button
                        key={goal}
                        variant="outline"
                        onPress={() =>
                          update({
                            goals: p.goals.includes(goal)
                              ? p.goals.filter((x) => x !== goal)
                              : [...p.goals, goal],
                          })
                        }
                        style={{
                          backgroundColor: p.goals.includes(goal)
                            ? c.tint
                            : c.surface,
                          borderColor: p.goals.includes(goal)
                            ? c.tintInk + '60'
                            : c.border,
                        }}
                      >
                        {p.goals.includes(goal) && (
                          <Check size={14} color={c.primary} />
                        )}
                        <Text style={{ fontSize: 12 }}>{goal}</Text>
                      </Button>
                    ))}
                  </View>
                  <Card style={{ padding: 20, backgroundColor: c.tint }}>
                    <Row>
                      <Sparkles size={20} color={c.tintInk} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '500', fontSize: 13 }}>
                          Your first rhythm is ready.
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: c.tintInk,
                            marginTop: 4,
                          }}
                        >
                          We’ll add a gentle morning routine. The rest of the
                          day is yours to shape.
                        </Text>
                      </View>
                    </Row>
                  </Card>
                </>
              )}
              {Boolean(error) && (
                <Text
                  accessibilityLiveRegion="polite"
                  style={{ color: '#A65C4C', fontSize: 12 }}
                >
                  {error}
                </Text>
              )}
              <Row>
                {step > 0 && (
                  <Button
                    variant="outline"
                    onPress={() => {
                      setStep(step - 1);
                      setError('');
                    }}
                    accessibilityLabel="Previous step"
                  >
                    <ArrowLeft size={18} color={c.muted} />
                  </Button>
                )}
                <Button onPress={next} style={{ flex: 1 }}>
                  <Text style={{ color: c.onPrimary, fontWeight: '500' }}>
                    {step === 3 ? 'Start my DayFlow' : 'Continue'}
                  </Text>
                  <ArrowRight size={17} color={c.onPrimary} />
                </Button>
              </Row>
            </MotiView>
            <Button
              variant="ghost"
              label="Explore an example day"
              onPress={() => {
                enterDemo();
                router.replace('/');
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
