// src/utils/series.ts
import type { ICCSetup, SetupDataPoint } from '../types/ICC';

export function prepareSeries(setup: ICCSetup): { time: number; value: number }[] {
  const points: SetupDataPoint[] = setup.data ? [...setup.data] : [];

  const normalized = points
    .map(d => ({
      time:
        typeof d.time === 'number'
          ? d.time
          : Math.floor(new Date(d.time).getTime() / 1000), // seconds
      value: d.close,
    }))
    .sort((a, b) => a.time - b.time);

  return normalized;
}