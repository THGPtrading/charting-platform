// src/utils/export.ts
import type { ICCSetup } from '../types/ICC';

function toCSVRow(setup: ICCSetup) {
  const fields = [
    setup.symbol,
    setup.timeframe,
    setup.iccTags.join('|'),
    setup.priceAtTrigger,
    setup.outcome,
    setup.timeBlock,
    setup.bot ?? '',
  ];
  return fields.map(f => `"${String(f).replace(/"/g,'""')}"`).join(',');
}

export function exportCSV(setups: ICCSetup[], dashboard: ICCSetup['dashboard']) {
  const header = ['symbol','timeframe','iccTags','priceAtTrigger','outcome','timeBlock','bot'].join(',');
  const body = setups.map(toCSVRow).join('\n');
  const now = new Date().toISOString().replace(/[:.]/g,'-');
  const name = `ICC_${dashboard}_${now}.csv`;
  const blob = new Blob([header+'\n'+body], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}

export function exportJSON(setups: ICCSetup[], dashboard: ICCSetup['dashboard']) {
  const now = new Date().toISOString().replace(/[:.]/g,'-');
  const name = `ICC_${dashboard}_${now}.json`;
  const blob = new Blob([JSON.stringify(setups, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}