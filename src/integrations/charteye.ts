// src/integrations/charteye.ts
import type { Candle, ScanParams, Signal, StrategyDefinition, Timeframe } from '../types/Strategy';

export async function ensureChartEyeReady() {
  // TODO: Initialize ChartEye SDK / auth when available
  return true;
}

export interface ChartEyeEngine {
  // Evaluate one strategy across a symbol/timeframe candle set
  scan(params: ScanParams, strategy: StrategyDefinition): Promise<Signal[]>;
  // Batch evaluate multiple strategies
  scanMany(params: ScanParams, strategies: StrategyDefinition[]): Promise<Signal[]>;
}

// Minimal reference engine stub — replace with real ChartEye core when ready
export const ChartEyeStub: ChartEyeEngine = {
  async scan(params, strategy) {
    // Placeholder: emits a single demo signal if last close > last open
    const last = params.candles[params.candles.length - 1];
    if (!last) return [];
    const dir: 'LONG'|'SHORT' = last.close >= last.open ? 'LONG' : 'SHORT';
    return [{
      id: `${strategy.id}:${params.symbol}:${last.time}`,
      strategyId: strategy.id,
      symbol: params.symbol,
      timeframe: params.timeframe,
      time: last.time,
      direction: dir,
      score: 50,
      tags: strategy.tags ?? [],
      context: { lastClose: last.close, lastOpen: last.open },
    }];
  },
  async scanMany(params, defs) {
    const all: Signal[] = [];
    for (const d of defs) {
      const part = await this.scan(params, d);
      all.push(...part);
    }
    return all;
  }
};

// Helper to normalize incoming data from any chart provider to ScanParams
export function buildScanParams(symbol: string, timeframe: Timeframe, candles: Candle[]): ScanParams {
  return { symbol, timeframe, candles };
}