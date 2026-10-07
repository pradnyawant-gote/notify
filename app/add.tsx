import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sheet } from '../src/components/sheet';
import { ActivityForm } from '../src/components/activity-form';
import { useStore } from '../src/store/provider';
import type { ActivityType } from '../src/domain/types';
export default function AddScreen() {
  const router = useRouter(),
    params = useLocalSearchParams<{
      id?: string;
      date?: string;
      type?: ActivityType;
    }>(),
    { state } = useStore(),
    initial = state.activities.find((a) => a.id === params.id);
  const close = () =>
    router.canGoBack() ? router.back() : router.replace('/');
  return (
    <Sheet
      title={initial ? 'A little adjustment' : 'Make time for something'}
      description={
        initial
          ? 'Your day can change. Your plan can too.'
          : 'One small addition to a day that feels like you.'
      }
      onClose={close}
    >
      <ActivityForm
        initial={initial}
        date={params.date}
        type={params.type}
        onSave={close}
      />
    </Sheet>
  );
}
