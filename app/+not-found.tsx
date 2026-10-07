import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import { EmptyState } from '../src/components/ui/primitives';
import { Button } from '../src/components/ui/button';
export default function NotFound() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState
        icon={Leaf}
        title="A little off the path"
        description="This page isn't part of your day."
      >
        <Button label="Back to today" onPress={() => router.replace('/')} />
      </EmptyState>
    </View>
  );
}
