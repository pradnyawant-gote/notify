import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Modal, useWindowDimensions } from 'react-native';
import {
  Plus,
  Repeat2,
  Sun,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  Check,
  Leaf,
  Moon,
} from 'lucide-react-native';
import { useStore, uid } from '../store/provider';
import { useTheme } from '../theme';
import type { Routine, RoutineStep } from '../domain/types';
import { formatTime, minutes, validTime, WEEKDAYS } from '../domain/dates';
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
import { Switch } from '../components/ui/switch';
import { Sheet } from '../components/sheet';
function RoutineForm({
  initial,
  onClose,
}: {
  initial: Routine;
  onClose: () => void;
}) {
  const { saveRoutine, notify } = useStore(),
    { colors: c } = useTheme(),
    [r, setR] = useState(initial),
    [error, setError] = useState('');
  const updateStep = (id: string, p: Partial<RoutineStep>) =>
    setR((x) => ({
      ...x,
      steps: x.steps.map((s) => (s.id === id ? { ...s, ...p } : s)),
    }));
  const save = () => {
    if (!r.title.trim() || !r.days.length || !r.steps.length)
      return setError(
        'Name your routine, choose days and add at least one step.',
      );
    if (
      r.steps.some(
        (s) =>
          !s.title.trim() ||
          !validTime(s.time) ||
          !Number.isFinite(s.duration) ||
          s.duration < 1 ||
          s.duration > 720 ||
          minutes(s.time) + s.duration > 1440,
      )
    )
      return setError(
        'Each step needs a name, HH:MM time, and a valid duration that fits within the day.',
      );
    saveRoutine({
      ...r,
      title: r.title.trim(),
      steps: r.steps
        .map((s) => ({ ...s, title: s.title.trim() }))
        .sort((a, b) => a.time.localeCompare(b.time)),
    });
    notify('Your rhythm is ready to return to.');
    onClose();
  };
  return (
    <Sheet
      title="Build your daily rhythm"
      description="Small moments. A routine that feels like you."
      onClose={onClose}
    >
      <View style={{ gap: 23 }}>
        <Input
          label="Routine name"
          placeholder="My morning rhythm"
          value={r.title}
          onChangeText={(title) => setR((x) => ({ ...x, title }))}
          maxLength={80}
        />
        <View style={{ gap: 9 }}>
          <Text style={{ fontSize: 13, fontWeight: '500' }}>On these days</Text>
          <Row style={{ gap: 3, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <Chip
                key={d}
                label={WEEKDAYS[d]}
                selected={r.days.includes(d)}
                onPress={() =>
                  setR((x) => ({
                    ...x,
                    days: x.days.includes(d)
                      ? x.days.filter((y) => y !== d)
                      : [...x.days, d],
                  }))
                }
              />
            ))}
          </Row>
        </View>
        <View style={{ gap: 17 }}>
          <Label>YOUR ROUTINE, STEP BY STEP</Label>
          {r.steps.map((s, i) => (
            <Card
              key={s.id}
              style={{ padding: 15, gap: 12, backgroundColor: c.bg }}
            >
              <Row style={{ justifyContent: 'space-between' }}>
                <Label>STEP {i + 1}</Label>
                <IconButton
                  icon={X}
                  label={`Remove step ${i + 1}`}
                  onPress={() =>
                    setR((x) => ({
                      ...x,
                      steps: x.steps.filter((t) => t.id !== s.id),
                    }))
                  }
                />
              </Row>
              <Input
                label={`Step ${i + 1} name`}
                placeholder="Drink a glass of water"
                value={s.title}
                onChangeText={(title) => updateStep(s.id, { title })}
                maxLength={120}
              />
              <Row>
                <Input
                  label={`Step ${i + 1} time`}
                  value={s.time}
                  onChangeText={(time) => updateStep(s.id, { time })}
                  maxLength={5}
                />
                <Input
                  label={`Step ${i + 1} minutes`}
                  value={String(s.duration)}
                  onChangeText={(v) =>
                    updateStep(s.id, { duration: Number(v) })
                  }
                  keyboardType="number-pad"
                />
              </Row>
              <Row style={{ flexWrap: 'wrap', gap: 0 }}>
                {(['health', 'work', 'study', 'personal', 'rest'] as const).map(
                  (cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      selected={s.category === cat}
                      onPress={() => updateStep(s.id, { category: cat })}
                    />
                  ),
                )}
              </Row>
            </Card>
          ))}
          <Button
            variant="outline"
            onPress={() =>
              setR((x) => ({
                ...x,
                steps: [
                  ...x.steps,
                  {
                    id: uid(),
                    title: '',
                    time: '07:00',
                    duration: 15,
                    category: 'health',
                  },
                ],
              }))
            }
          >
            <Plus size={16} color={c.primary} />
            <Text style={{ fontSize: 12 }}>Add another little step</Text>
          </Button>
        </View>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13 }}>Add this routine to my calendar</Text>
          <Switch
            checked={r.enabled}
            onCheckedChange={(enabled) => setR((x) => ({ ...x, enabled }))}
            label="Routine enabled"
          />
        </Row>
        <Text style={{ fontSize: 11, color: c.muted }}>
          Routine steps appear as recurring habits. Their completions are
          tracked separately every day.
        </Text>
        {Boolean(error) && (
          <Text style={{ fontSize: 12, color: '#A65C4C' }}>{error}</Text>
        )}
        <Button label="Save my routine" onPress={save} />
      </View>
    </Sheet>
  );
}
export default function RoutinesScreen() {
  const params = useLocalSearchParams<{
    edit?: string;
  }>();
  const { state, saveRoutine, deleteRoutine, notify } = useStore(),
    { colors: c } = useTheme(),
    { width } = useWindowDimensions(),
    [draft, setDraft] = useState<Routine | null>(null),
    [confirm, setConfirm] = useState<string | null>(null);
  useEffect(() => {
    if (params.edit) {
      const routine = state.routines.find((r) => r.id === params.edit);
      if (routine) setDraft(routine);
    }
  }, [params.edit]);
  const create = () =>
    setDraft({
      id: uid(),
      title: '',
      days: [1, 2, 3, 4, 5],
      enabled: true,
      steps: [
        {
          id: uid(),
          title: '',
          time: state.preferences.wake,
          duration: 15,
          category: 'health',
        },
      ],
    });
  const template = (evening = false) =>
    setDraft({
      id: uid(),
      title: evening ? 'An evening reset' : 'A mindful morning',
      days: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      steps: evening
        ? [
            {
              id: uid(),
              title: 'A moment of reflection',
              time: '21:00',
              duration: 15,
              category: 'rest',
            },
            {
              id: uid(),
              title: 'Unplug & unwind',
              time: '21:30',
              duration: 30,
              category: 'rest',
            },
          ]
        : [
            {
              id: uid(),
              title: 'Wake up & hydrate',
              time: '07:00',
              duration: 15,
              category: 'health',
            },
            {
              id: uid(),
              title: 'Gentle movement',
              time: '07:15',
              duration: 30,
              category: 'health',
            },
            {
              id: uid(),
              title: 'Breakfast',
              time: '08:00',
              duration: 30,
              category: 'personal',
            },
          ],
    });
  return (
    <View style={{ gap: 26 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View style={{ gap: 7 }}>
          <Heading size={24}>My routines</Heading>
          <Text style={{ fontSize: 13, color: c.muted }}>
            Your everyday activities, on repeat.
          </Text>
        </View>
        <Button onPress={create}>
          <Plus size={16} color={c.onPrimary} />
          <Text style={{ color: c.onPrimary, fontSize: 12 }}>New routine</Text>
        </Button>
      </Row>
      <View style={{ flexDirection: 'row', gap: 18, flexWrap: 'wrap' }}>
        {state.routines.map((r) => (
          <Card
            key={r.id}
            style={{ width: width >= 1100 ? '48%' : '100%', gap: 17 }}
          >
            <Row style={{ justifyContent: 'space-between' }}>
              <Row>
                <View
                  style={{
                    backgroundColor: c.tint,
                    padding: 11,
                    borderRadius: 12,
                  }}
                >
                  <Repeat2 size={21} color={c.tintInk} />
                </View>
                <View style={{ gap: 3 }}>
                  <Heading size={18}>{r.title}</Heading>
                  <Text style={{ fontSize: 11, color: c.muted }}>
                    {r.days.length === 7
                      ? 'Every day'
                      : r.days.map((d) => WEEKDAYS[d]).join(' · ')}
                  </Text>
                </View>
              </Row>
              <Switch
                label={`Enable ${r.title}`}
                checked={r.enabled}
                onCheckedChange={(enabled) => {
                  saveRoutine({ ...r, enabled });
                  notify(
                    enabled
                      ? 'Your routine is on the calendar.'
                      : 'Routine paused. You can return to it anytime.',
                  );
                }}
              />
            </Row>
            <View style={{ gap: 0 }}>
              {r.steps.map((s, i) => (
                <Row
                  key={s.id}
                  style={{
                    paddingVertical: 11,
                    borderBottomWidth: i < r.steps.length - 1 ? 1 : 0,
                    borderColor: c.border,
                  }}
                >
                  <Text style={{ fontSize: 12, color: c.muted, width: 73 }}>
                    {formatTime(s.time)}
                  </Text>
                  <View
                    style={{
                      height: 6,
                      width: 6,
                      borderRadius: 6,
                      backgroundColor: c.tintInk,
                    }}
                  />
                  <Text style={{ fontSize: 13, flex: 1 }}>{s.title}</Text>
                  <Text style={{ fontSize: 11, color: c.muted }}>
                    {s.duration}m
                  </Text>
                </Row>
              ))}
            </View>
            <Row
              style={{
                justifyContent: 'space-between',
                borderTopWidth: 1,
                borderColor: c.border,
                paddingTop: 12,
              }}
            >
              <Text
                style={{ fontSize: 11, color: r.enabled ? c.tintInk : c.muted }}
              >
                {r.enabled
                  ? 'Part of your daily flow'
                  : 'Paused, ready when you are'}
              </Text>
              <Row style={{ gap: 0 }}>
                <IconButton
                  icon={Pencil}
                  label={`Edit ${r.title}`}
                  onPress={() => setDraft(r)}
                />
                <IconButton
                  icon={Trash2}
                  label={`Delete ${r.title}`}
                  onPress={() => setConfirm(r.id)}
                />
              </Row>
            </Row>
            {confirm === r.id && (
              <View
                style={{
                  gap: 10,
                  backgroundColor: c.peach,
                  padding: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 12, color: c.peachInk }}>
                  Delete this routine and its scheduled steps? This cannot be
                  undone.
                </Text>
                <Row>
                  <Button
                    variant="destructive"
                    label="Delete routine"
                    onPress={() => {
                      deleteRoutine(r.id);
                      setConfirm(null);
                      notify('Routine removed.');
                    }}
                  />
                  <Button
                    variant="ghost"
                    label="Keep it"
                    onPress={() => setConfirm(null)}
                  />
                </Row>
              </View>
            )}
          </Card>
        ))}
      </View>
      {!state.routines.length && (
        <Card>
          <EmptyState
            icon={Repeat2}
            title="Your rhythm starts here"
            description="A few repeatable moments can make a whole day feel lighter."
          >
            <Button label="Build my first routine" onPress={create} />
          </EmptyState>
        </Card>
      )}
      <View style={{ gap: 16, marginTop: 6 }}>
        <Heading size={20}>A little inspiration</Heading>
        <Row
          style={{
            alignItems: 'stretch',
            flexWrap: width < 600 ? 'wrap' : 'nowrap',
            gap: 15,
          }}
        >
          {[
            {
              title: 'A mindful morning',
              desc: 'Hydrate, move, and begin with intention.',
              icon: Sun,
              evening: false,
            },
            {
              title: 'An evening reset',
              desc: 'Reflect, unplug, and find a slower pace.',
              icon: Moon,
              evening: true,
            },
          ].map((t) => (
            <Card
              key={t.title}
              style={{
                flex: 1,
                minWidth: width < 600 ? '100%' : 0,
                padding: 22,
                backgroundColor: t.evening ? c.lavender : c.tint,
                gap: 11,
              }}
            >
              <t.icon size={23} color={t.evening ? c.lavenderInk : c.tintInk} />
              <Heading size={18}>{t.title}</Heading>
              <Text style={{ fontSize: 12, color: c.muted }}>{t.desc}</Text>
              <Button
                variant="outline"
                onPress={() => template(t.evening)}
                style={{ alignSelf: 'flex-start' }}
              >
                <Text style={{ fontSize: 12 }}>Make it mine</Text>
                <ArrowRight size={14} color={c.primary} />
              </Button>
            </Card>
          ))}
        </Row>
      </View>
      <Modal
        visible={!!draft}
        transparent
        animationType="fade"
        onRequestClose={() => setDraft(null)}
      >
        {draft && (
          <RoutineForm
            key={draft.id}
            initial={draft}
            onClose={() => setDraft(null)}
          />
        )}
      </Modal>
    </View>
  );
}
