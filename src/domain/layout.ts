export const METRIC_GAP = 12;

/** Fit readable cards to the measured container, including Android font scaling. */
export function metricGridLayout(availableWidth: number, fontScale = 1) {
  const width = Number.isFinite(availableWidth)
    ? Math.max(0, Math.floor(availableWidth))
    : 0;
  const scale = Number.isFinite(fontScale)
    ? Math.max(1, Math.min(fontScale, 1.4))
    : 1;
  const minCardWidth = Math.ceil(148 * scale);
  const columns = width >= minCardWidth * 2 + METRIC_GAP ? 2 : 1;
  return {
    columns,
    cardWidth: Math.floor((width - (columns - 1) * METRIC_GAP) / columns),
  };
}
