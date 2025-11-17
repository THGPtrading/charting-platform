// src/types/SetupTypes.ts
export type TradeType = "LONG" | "SHORT";

export interface SetupData {
  ticker: string;
  entry: number;
  stop: number;
  type: TradeType;
  ratio: number;         // risk/reward ratio, e.g. 2.5 or 3
  shares: number;
  target: number;
  timeframe: string;
  winProbability?: number; // optional, for TrendSpider backtesting later
}

export interface SetupFeedProps {
  setup: SetupData;
}
