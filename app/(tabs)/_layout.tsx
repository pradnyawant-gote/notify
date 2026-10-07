import React from 'react';
import { Slot } from 'expo-router';
import { Shell } from '../../src/components/shell';
export default function TabsLayout() {
  return (
    <Shell>
      <Slot />
    </Shell>
  );
}
