// src/utils/validation.ts
import type { ICCSetup } from '../types/ICC';

/**
 * Validate that a setup object has all required ICC fields.
 */
export function isValidSetup(s: Partial<ICCSetup>): s is ICCSetup {
  return !!(
    s &&
    s.symbol &&
    s.timeframe &&
    Array.isArray(s.iccTags) &&
    s.priceAtTrigger !== undefined &&
    s.outcome &&
    s.timeBlock &&
    s.bot &&
    s.timestamp
  );
}

/**
 * Normalize chart data into sorted, deduplicated { time, close } points.
 * Accepts either Unix timestamps or date strings.
 */
export function normalizeChartData(
  data: any[]
): { time: number; close: number }[] {
  if (!Array.isArray(data)) return [];
  const parsed = data
    .map(d => {
      const t =
        typeof d.time === 'number'
          ? d.time
          : Math.floor(new Date(d.time).getTime() / 1000);
      return { time: t, close: Number(d.close) };
    })
    .filter(d => Number.isFinite(d.time) && Number.isFinite(d.close))
    .sort((a, b) => a.time - b.time);

  // Deduplicate by time
  const out: { time: number; close: number }[] = [];
  for (const p of parsed) {
    if (!out.length || out[out.length - 1].time !== p.time) out.push(p);
  }
  return out;
}