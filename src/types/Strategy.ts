// src/types/Strategy.ts
export type StrategyCategory = 'SCALP' | 'MOMENTUM' | 'TREND';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1D';

export interface TimeWindow {
  label: string; // e.g. "RTH Morning"
  tz: 'America/New_York';
  start: string; // HH:mm, ET
  end: string;   // HH:mm, ET
  days?: Array<'Mon'|'Tue'|'Wed'|'Thu'|'Fri'>;
}

export interface InstrumentFilter {
  priceMin?: number;
  priceMax?: number;
  avgVolumeMin?: number;
  marketCapMin?: number;
  marketCapMax?: number;
  allowETFs?: boolean;
}

export type Operator =
  | '>' | '<' | '>=' | '<=' | '==' | '!='
  | 'crossesAbove' | 'crossesBelow'
  | 'rises' | 'falls'
  | 'withinPct';

export type IndicatorRef = {
  id: string;      // e.g. 'MA50', 'VWAP', 'RSI14'
  source?: string; // price source or indicator source if derived
};

export interface IndicatorCondition {
  left: IndicatorRef | { value: number };
  op: Operator;
  right: IndicatorRef | { value: number };
  lookback?: number; // bars to look back for cross/within
  tolerancePct?: number; // for withinPct
}

export interface RuleGroup {
  allOf?: IndicatorCondition[]; // all must be true
  anyOf?: IndicatorCondition[]; // at least one true
  not?: RuleGroup;              // negate group
}

export interface RiskModel {
  stopATR?: number; // e.g., 1.5 ATR
  takeProfitRR?: number; // risk-reward ratio
  maxBarsOpen?: number; // bars to hold
}

export interface StrategyDefinition {
  id: string;
  name: string;
  category: StrategyCategory;
  timeframes: Timeframe[];
  sessions?: TimeWindow[];
  filter?: InstrumentFilter;
  rules: RuleGroup; // entry logic
  direction: Array<'LONG'|'SHORT'>;
  risk?: RiskModel;
  tags?: string[]; // e.g., ['ICC', '930-11']
}

export interface Candle {
  time: number; // epoch seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface ScanParams {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  indicators?: Record<string, number[]>; // evaluated per-bar outputs keyed by indicator id
}

export interface Signal {
  id: string;
  strategyId: string;
  symbol: string;
  timeframe: Timeframe;
  time: number;
  direction: 'LONG'|'SHORT';
  score?: number; // 0-100 confidence
  tags?: string[];
  notes?: string;
  context?: Record<string, unknown>; // extra fields (e.g., indicator values)
}
