// src/integrations/trendspider.ts
import type { Signal } from '../types/Strategy';

// Placeholder TrendSpider connector.
// In practice, TrendSpider supports import via file or API for backtesting scans.
// This stub exports signals in a generic JSON structure suitable for later adaptation.

export interface TrendSpiderExportOptions {
  strategyName?: string;
  notes?: string;
}

export function exportSignalsToTrendSpider(signals: Signal[], opts: TrendSpiderExportOptions = {}): string {
  const payload = {
    meta: {
      exportedAt: new Date().toISOString(),
      count: signals.length,
      strategyName: opts.strategyName ?? 'ChartEye Strategy',
      notes: opts.notes ?? '',
      version: 1,
    },
    signals: signals.map(s => ({
      id: s.id,
      strategyId: s.strategyId,
      symbol: s.symbol,
      timeframe: s.timeframe,
      time: s.time,
      direction: s.direction,
      score: s.score ?? null,
      tags: s.tags ?? [],
      context: s.context ?? {},
    })),
  };
  return JSON.stringify(payload, null, 2);
}
