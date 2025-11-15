// src/alerts/alertRouter.ts
import { classifyCapSize } from './capClassifier';
import { logSetup } from './setupLogger';
import type { ICCSetup } from '../types/ICC';

const getSessionTag = (timestamp: string): string => {
  const hour = new Date(timestamp).getHours();
  if (hour < 9) return 'PreMarket';
  if (hour < 16) return 'Regular';
  return 'AfterHours';
};

export const routeSetup = (setup: Partial<ICCSetup>): void => {
  const timestamp = setup.timestamp || new Date().toISOString();
  const session = getSessionTag(timestamp);
  const tags = setup.iccTags || [];
  const price = setup.priceAtTrigger ?? 50; // fallback without `price`
  const cap = setup.capSize || classifyCapSize(price);

  const isScalp = tags.includes('Scalp');
  const isBreakout = tags.includes('Breakout');
  const isSwing = tags.includes('Swing') || tags.includes('LongerTerm');

  let dashboard: string;
  if (isSwing && cap !== 'Small') {
    dashboard = 'TrendEdge';
  } else if (isScalp && cap === 'Small') {
    dashboard = 'WarriorEdge';
  } else if ((isScalp || isBreakout) && cap !== 'Small' && session === 'Regular') {
    dashboard = 'MomentumEdge';
  } else {
    dashboard = 'DefaultDashboard';
  }

  logSetup({
    ...setup,
    dashboard,
    timeBlock: session,
    capSize: cap,
    timestamp,
  } as ICCSetup);
};