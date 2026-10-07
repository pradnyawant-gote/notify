import { Pressable } from '../components/ui/pressable';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  X,
  Play,
  Pause,
  Leaf,
  Check,
  ArrowRight,
  VolumeX,
  Timer,
  CheckCircle2,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useStore, useClock } from '../store/provider';
import { useTheme } from '../theme';
import { remainingSeconds } from '../domain/focus';
import { activitiesForDate } from '../domain/activities';
import { dateKey } from '../domain/dates';
import { ProgressRing } from '../components/progress-ring';
import { Text } from '../components/ui/text';
import { Button } from '../components/ui/button';
import { Brand } from '../components/brand';
import {
  Card,
  Chip,
  Heading,
  IconButton,
  Label,
  Row,
} from '../components/ui/primitives';
export default function FocusScreen() {
  const { state, startFocus, toggleFocus, finishFocus, notify } = useStore(),
    clock = useClock(),
    { colors: c, reducedMotion } = useTheme(),
    router = useRouter(),
    { width } = useWindowDimensions(),
    [now, setNow] = useState(Date.now()),
    [duration, setDuration] = useState(25),
    [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const run = state.focus,
    remaining = run ? remainingSeconds(run, now) : duration * 60,
    finished = Boolean(run && remaining === 0),
    active = Boolean(run?.deadline),
    items = activitiesForDate(state.activities, dateKey(clock)).filter(
      (a) =>
        !a.completedOn.includes(dateKey(clock)) &&
        ['work', 'study'].includes(a.category),
    ),
    task =
      items.find((a) => a.id === selected) ??
      items.find((a) => a.type === 'focus') ??
      items[0];
  const leave = () =>
    router.canGoBack() ? router.back() : router.replace('/');
  const end = (complete = false) => {
    finishFocus(complete);
    notify(
      complete
        ? 'A little win. Your activity is complete.'
        : 'Your focus time has been saved.',
    );
    leave();
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Row
        style={{
          padding: width < 600 ? 20 : 30,
          justifyContent: 'space-between',
        }}
      >
        <Brand compact={width < 600} />
        <Row>
          <Text style={{ color: c.muted, fontSize: 12 }}>YOUR FOCUS SPACE</Text>
          <IconButton
            icon={X}
            label="Close focus, keep session running"
            onPress={leave}
          />
        </Row>
      </Row>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          padding: 24,
          paddingTop: width < 600 ? 20 : 32,
          paddingBottom: 50,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 490,
            alignItems: 'center',
            gap: 25,
          }}
        >
          <View style={{ alignItems: 'center', gap: 9 }}>
            <Row>
              <Leaf size={16} color={c.tintInk} />
              <Label>ONE THING AT A TIME</Label>
            </Row>
            <Heading size={24}>
              {finished
                ? 'A little progress, well earned.'
                : 'Make a little space to focus.'}
            </Heading>
            <Text style={{ color: c.muted, fontSize: 13, textAlign: 'center' }}>
              {finished
                ? 'Take a breath. You showed up for yourself.'
                : run
                  ? 'Everything else can wait for a moment.'
                  : 'Choose a moment. Give it your full attention.'}
            </Text>
          </View>
          <MotiView
            from={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 450 }}
            style={{ marginVertical: 10 }}
          >
            <ProgressRing
              size={width < 400 ? 238 : 272}
              stroke={8}
              value={run ? 1 - remaining / run.duration : 0}
              track={c.border}
            >
              <View style={{ alignItems: 'center', gap: 9 }}>
                {finished ? (
                  <CheckCircle2 size={58} color={c.primary} />
                ) : (
                  <Text
                    style={{
                      fontSize: 55,
                      lineHeight: 68,
                      fontWeight: '500',
                      letterSpacing: -2,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {String(Math.floor(remaining / 60)).padStart(2, '0')}:
                    {String(remaining % 60).padStart(2, '0')}
                  </Text>
                )}
                <Text
                  style={{ fontSize: 11, color: c.muted, letterSpacing: 1.2 }}
                >
                  {finished
                    ? 'SESSION COMPLETE'
                    : run
                      ? active
                        ? 'IN YOUR FLOW'
                        : 'TAKE YOUR TIME'
                      : 'MINUTES OF POSSIBILITY'}
                </Text>
              </View>
            </ProgressRing>
          </MotiView>
          <Card
            style={{ width: '100%', padding: 21, alignItems: 'center', gap: 7 }}
          >
            <Label>
              {run ? 'CURRENT ACTIVITY' : 'YOUR FOCUS FOR THIS SESSION'}
            </Label>
            <Heading size={18}>
              {run?.title ?? task?.title ?? 'A little time for deep work'}
            </Heading>
            <Text style={{ fontSize: 11, color: c.muted }}>
              {run
                ? 'Your progress is saved when you finish.'
                : 'No multitasking. No rush. Just this.'}
            </Text>
          </Card>
          {!run && (
            <>
              <Row
                style={{
                  backgroundColor: c.soft,
                  borderRadius: 13,
                  padding: 4,
                }}
              >
                {[25, 45, 60].map((n) => (
                  <Chip
                    key={n}
                    label={`${n} min`}
                    selected={duration === n}
                    onPress={() => setDuration(n)}
                  />
                ))}
              </Row>
              {items.length > 1 && (
                <View style={{ width: '100%', gap: 8 }}>
                  <Text style={{ fontSize: 12, color: c.muted }}>
                    Or choose another activity
                  </Text>
                  <Row style={{ flexWrap: 'wrap', gap: 3 }}>
                    {items.map((a) => (
                      <Chip
                        key={a.id}
                        label={a.title}
                        selected={task?.id === a.id}
                        onPress={() => setSelected(a.id)}
                      />
                    ))}
                  </Row>
                </View>
              )}
              <Button
                onPress={() => {
                  startFocus(
                    task?.id ?? null,
                    task?.title ?? 'A little time for deep work',
                    duration,
                  );
                  setNow(Date.now());
                }}
                style={{ minWidth: 210 }}
              >
                <Play size={16} color={c.onPrimary} fill={c.onPrimary} />
                <Text style={{ color: c.onPrimary, fontWeight: '500' }}>
                  Begin focus
                </Text>
              </Button>
            </>
          )}
          {run && !finished && (
            <>
              <Button
                onPress={() => {
                  toggleFocus();
                  setNow(Date.now());
                }}
                style={{ minWidth: 210 }}
              >
                {active ? (
                  <Pause size={17} color={c.onPrimary} />
                ) : (
                  <Play size={17} color={c.onPrimary} />
                )}
                <Text style={{ color: c.onPrimary, fontWeight: '500' }}>
                  {active ? 'Pause for a moment' : 'Return to focus'}
                </Text>
              </Button>
              <Button
                variant="ghost"
                label="Finish & save progress"
                onPress={() => end()}
              />
            </>
          )}
          {finished && (
            <View style={{ width: '100%', gap: 10 }}>
              {run?.activityId && (
                <Button onPress={() => end(true)}>
                  <Check size={17} color={c.onPrimary} />
                  <Text style={{ color: c.onPrimary, fontWeight: '500' }}>
                    Complete activity & return
                  </Text>
                </Button>
              )}
              <Button
                variant={run?.activityId ? 'outline' : 'default'}
                label="Save session & return"
                onPress={() => end()}
              />
            </View>
          )}
          <Row>
            <VolumeX size={14} color={c.muted} />
            <Text style={{ color: c.muted, fontSize: 11 }}>
              DayFlow reminders stay quiet while you focus.
            </Text>
          </Row>
          <Text
            style={{
              color: c.tintInk,
              fontSize: 12,
              textAlign: 'center',
              marginTop: 5,
            }}
          >
            Your attention is a gift. Spend it gently.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
