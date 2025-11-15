import type { ICCSetup } from '../types/ICC';

const STORAGE_KEY = 'iccSetups';

const loadSetups = (): ICCSetup[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveSetups = (setups: ICCSetup[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(setups));
};

export const logSetup = (setup: ICCSetup): void => {
  const current = loadSetups();
  const updated = [...current, setup];
  saveSetups(updated);
};

export const getSetupLog = (): ICCSetup[] => {
  return loadSetups();
};

export const clearSetupLog = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportSetupLogCSV = (entries: ICCSetup[] = getSetupLog()): string => {
  const headers = [
    'Symbol','Timeframe','ICC Tags','PriceAtTrigger','Outcome',
    'TimeBlock','Bot','Dashboard'
  ];

  const rows = entries.map(setup => [
    setup.symbol,
    setup.timeframe,
    setup.iccTags.join('|'),
    setup.priceAtTrigger,
    setup.outcome,
    setup.timeBlock,
    setup.bot ?? '',
    setup.dashboard,
  ]);

  return [headers, ...rows]
    .map(row => row.map(field => `"${String(field)}"`).join(','))
    .join('\n');
};

export const exportSetupLogJSON = (entries: ICCSetup[] = getSetupLog()): string => {
  return JSON.stringify(entries, null, 2);
};