// src/config/strategies.ts
import { StrategyDefinition } from '../types/Strategy';

export const strategies: StrategyDefinition[] = [
  {
    id: 'scalp-vwap-bounce',
    name: 'Scalp – VWAP Bounce',
    category: 'SCALP',
    timeframes: ['1m', '5m'],
    sessions: [
      { label: 'RTH Morning', tz: 'America/New_York', start: '09:30', end: '11:00' }
    ],
    filter: { priceMin: 1, avgVolumeMin: 300_000 },
    direction: ['LONG','SHORT'],
    rules: {
      anyOf: [
        // Long: price reclaims VWAP with short MA rising
        { left: { id: 'CLOSE' }, op: '>' , right: { id: 'VWAP' }, lookback: 1 },
        // Short: price rejects VWAP with short MA falling
        { left: { id: 'CLOSE' }, op: '<' , right: { id: 'VWAP' }, lookback: 1 },
      ],
    },
    tags: ['ICC','930-11','VWAP'],
    risk: { stopATR: 1.2, takeProfitRR: 2.0, maxBarsOpen: 30 },
  },
  {
    id: 'momentum-20-100',
    name: 'Momentum – MA Trend (20–100 USD)',
    category: 'MOMENTUM',
    timeframes: ['5m','15m','1h'],
    filter: { priceMin: 20, priceMax: 100, avgVolumeMin: 500_000 },
    direction: ['LONG','SHORT'],
    rules: {
      allOf: [
        { left: { id: 'MA50' }, op: '>' , right: { id: 'MA200' } },
        { left: { id: 'CLOSE' }, op: '>' , right: { id: 'MA50' } },
        { left: { id: 'RSI14' }, op: '>=' , right: { value: 50 } },
      ],
    },
    tags: ['Momentum','Trend'],
    risk: { stopATR: 1.5, takeProfitRR: 2.5 },
  },
  {
    id: 'trend-100plus',
    name: 'Trend – 100+ Large Caps',
    category: 'TREND',
    timeframes: ['1h','1D'],
    filter: { priceMin: 100, avgVolumeMin: 1_000_000 },
    direction: ['LONG','SHORT'],
    rules: {
      allOf: [
        { left: { id: 'CLOSE' }, op: '>' , right: { id: 'MA200' } },
        { left: { id: 'MA50' }, op: '>' , right: { id: 'MA200' } },
      ],
    },
    tags: ['Swing','Trend'],
    risk: { stopATR: 2.0, takeProfitRR: 3.0 },
  },
];

export default strategies;
