import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Line,
} from 'react-native-svg';
import { useTheme } from '../theme';
import { useClock, useStore } from '../store/provider';
import { activitiesForDate } from '../domain/activities';
import { addDays, dateKey, fromKey, WEEKDAYS } from '../domain/dates';
import { Card, Row } from './ui/primitives';
import { Text } from './ui/text';

export function OverviewChart() {
  const { state } = useStore(),
    now = useClock(),
    { colors: c } = useTheme(),
    [tab, setTab] = useState<'Activities' | 'Focus' | 'Habits'>('Activities');
  const today = dateKey(now),
    days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const values = days.map((date) => {
    const tasks = activitiesForDate(state.activities, date);
    if (tab === 'Focus')
      return Math.round(
        state.sessions
          .filter((s) => s.date === date)
          .reduce((sum, s) => sum + s.seconds, 0) / 60,
      );
    const items =
      tab === 'Habits' ? tasks.filter((a) => a.type === 'habit') : tasks;
    return items.filter((a) => a.completedOn.includes(date)).length;
  });
  const max = Math.max(1, ...values),
    x = (i: number) => 14 + i * 44,
    y = (v: number) => 107 - (v / max) * 72;
  const path = values
    .map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`)
    .join(' ');
  return (
    <Card style={{ padding: 17, gap: 12 }}>
      <Row style={{ gap: 18 }}>
        {(['Activities', 'Focus', 'Habits'] as const).map((t) => (
          <Pressable
            key={t}
            accessibilityRole="button"
            accessibilityLabel={`Chart ${t}`}
            aria-pressed={tab === t}
            onPress={() => setTab(t)}
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: tab === t ? '600' : '400',
                color: tab === t ? c.lavenderInk : c.muted,
              }}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </Row>
      <View
        accessibilityLabel={`${tab} recorded during the last seven days: ${values.join(', ')}`}
      >
        <Svg
          width="100%"
          height={138}
          viewBox="0 0 292 138"
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="overview-area" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c.lavenderInk} stopOpacity={0.12} />
              <Stop offset="1" stopColor={c.lavenderInk} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {[35, 71, 107].map((v) => (
            <Line
              key={v}
              x1={14}
              x2={278}
              y1={v}
              y2={v}
              stroke={c.border}
              strokeWidth={0.5}
              strokeDasharray="2 5"
            />
          ))}
          <Path d={`${path} L 278 116 L 14 116 Z`} fill="url(#overview-area)" />
          <Path
            d={path}
            stroke={c.lavenderInk}
            strokeWidth={1.7}
            fill="none"
            strokeLinejoin="round"
          />
          {values.map((v, i) => (
            <Circle
              key={i}
              cx={x(i)}
              cy={y(v)}
              r={2.6}
              fill={c.surface}
              stroke={c.ink}
              strokeWidth={0.9}
            />
          ))}
        </Svg>
        <Row
          style={{
            justifyContent: 'space-between',
            paddingHorizontal: 8,
            marginTop: -8,
          }}
        >
          {days.map((d) => (
            <Text key={d} style={{ fontSize: 9, color: c.muted }}>
              {WEEKDAYS[fromKey(d).getDay()]}
            </Text>
          ))}
        </Row>
      </View>
      <Text style={{ fontSize: 10, lineHeight: 14, color: c.muted }}>
        {tab === 'Focus'
          ? 'Focus minutes'
          : tab === 'Habits'
            ? 'Habits completed'
            : 'Activities completed'}{' '}
        · Last 7 days
      </Text>
    </Card>
  );
}
