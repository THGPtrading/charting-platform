// src/testing/generate.ts
import type { ICCSetup, SetupDataPoint } from '../types/ICC';

export function generateSetups(count: number): ICCSetup[] {
  const setups: ICCSetup[] = [];
  for (let i = 0; i < count; i++) {
    const symbol = ['AMD', 'NVDA', 'META'][i % 3];
    const timeframe = ['1m', '5m', '15m'][i % 3];
    const iccTags = ['Breakout'];
    const priceAtTrigger = 100 + i;
    const outcome = 'Pending';
    const timeBlock = 'Regular';
    const dashboard = 'MomentumEdge';
    const bot = 'TestBot';
    const timestamp = new Date(Date.now() - i * 60000).toISOString();

    const data: SetupDataPoint[] = Array.from({ length: 20 }, (_, k) => ({
      time: Math.floor(Date.now() / 1000) - k * 60,
      close: priceAtTrigger + Math.sin(k / 5) * 0.5,
    }));

    setups.push({
      symbol,
      timeframe,
      iccTags,
      priceAtTrigger,
      outcome,
      timeBlock,
      bot,
      dashboard,
      timestamp,
      data,
    });
  }
  return setups;
}