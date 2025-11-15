// src/testing/malformed.ts
import type { ICCSetup } from '../types/ICC';

export const malformed: Partial<ICCSetup>[] = [
  {
    symbol: 'AAPL',
    timeframe: '5m',
    iccTags: ['Breakout'],
    priceAtTrigger: 198.5,
    dashboard: 'MomentumEdge',
    timestamp: new Date().toISOString(),
    data: [{ time: '2025-11-13T14:00:00Z', close: 198.6 }],
  },
  {
    symbol: 'MSFT',
    timeframe: '1m',
    iccTags: [],
    priceAtTrigger: Number.NaN,
    outcome: 'Triggered',
    dashboard: 'TrendEdge',
    timestamp: new Date().toISOString(),
    data: [{ time: 0, close: 375.1 }],
  },
  {
    timeframe: '15m',
    iccTags: ['TrendContinuation'],
    dashboard: 'WarriorEdge',
    timestamp: new Date().toISOString(),
    data: [],
  },
];