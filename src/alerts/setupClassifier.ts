// src/alerts/setupClassifier.ts
import { generateTags } from './tagGenerator';
import type { ICCSetup } from '../types/ICC';

export const classifySetup = (alert: Partial<ICCSetup>): ICCSetup => {
  const { priceAction, volume, timeBlock } = alert;
  const tags: string[] = [];

  if (priceAction === 'gap-retest' && volume && volume > 100000) {
    tags.push('scalp-ready');
  }
  if (priceAction === 'breakout' && volume && volume > 250000) {
    tags.push('momentum-confirmed');
  }
  if (priceAction === 'zone-retest' && timeBlock === 'midday') {
    tags.push('swing-zone');
  }

  const classified: ICCSetup = {
    symbol: alert.symbol ?? 'UNKNOWN',
    timeframe: alert.timeframe ?? '5m',
    iccTags: tags,
    priceAtTrigger: alert.priceAtTrigger ?? 0,
    outcome: alert.outcome ?? 'Pending',
    timeBlock: alert.timeBlock ?? 'Regular',
    dashboard: alert.dashboard ?? 'DefaultDashboard',
    timestamp: alert.timestamp ?? new Date().toISOString(),
    bot: alert.bot,
    capSize: alert.capSize,
    traded: alert.traded,
    source: alert.source,
    classifiedAt: new Date().toISOString(),
    tradervueTags: generateTags({
      ...(alert as ICCSetup),
      iccTags: tags,
      symbol: alert.symbol ?? 'UNKNOWN',
      timeframe: alert.timeframe ?? '5m',
      priceAtTrigger: alert.priceAtTrigger ?? 0,
      outcome: alert.outcome ?? 'Pending',
      timeBlock: alert.timeBlock ?? 'Regular',
      dashboard: alert.dashboard ?? 'DefaultDashboard',
      timestamp: alert.timestamp ?? new Date().toISOString(),
    }),
    followThrough: null,
    maxGain: null,
    maxLoss: null,
    priceAction,
    volume,
    data: alert.data,
  };

  return classified;
};