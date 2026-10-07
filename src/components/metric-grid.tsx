import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { MetricCard, type MetricCardProps } from './metric-card';
import { METRIC_GAP, metricGridLayout } from '../domain/layout';

export function MetricGrid({
  items,
}: {
  items: (MetricCardProps & { key: string })[];
}) {
  const { width, fontScale } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const layout = metricGridLayout(
    containerWidth ?? Math.max(0, width - 36),
    fontScale,
  );
  return (
    <View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={{
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: METRIC_GAP,
        justifyContent: 'space-between',
      }}
    >
      {items.map(({ key, ...item }) => (
        <View
          key={key}
          style={{
            width:
              containerWidth === null
                ? layout.columns === 2
                  ? '48%'
                  : '100%'
                : layout.cardWidth,
          }}
        >
          <MetricCard {...item} />
        </View>
      ))}
    </View>
  );
}
