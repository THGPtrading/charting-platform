// src/types/ICC.ts

export interface SetupDataPoint {
  time: number;   // always numeric for charting
  close: number;
}

export type CapSize = "SmallCap" | "MidCap" | "LargeCap";

export interface ICCSetup {
  symbol: string;
  timeframe: string;
  source: string;
  dashboard: string;
  iccTags: string[];
  timeBlock: string;
  priceAtTrigger: number;
  outcome: string;
  bot: string;
  timestamp: string;
  data: SetupDataPoint[];

  // Optional extensions for ChartPanel, alerts, scoring
  capSize?: CapSize;
  traded?: boolean;
  priceAction?: string;
  volume?: number;
  entry?: number;
  stop?: number;
  target?: number;
  shares?: number;
  ratio?: number;
  winProbability?: number;
  type?: "LONG" | "SHORT";
  classifiedAt?: string;
  tradervueTags?: string[];

  // ✅ New field for ChartPanel notes
  review?: string;
}