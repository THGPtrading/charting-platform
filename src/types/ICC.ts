// src/types/ICC.ts

export interface SetupDataPoint {
  // Accepts either ISO string or seconds; utilities will normalize
  time: number | string;
  close: number;
}

/**
 * ICCSetup represents a single setup logged in the ICC platform.
 */
export interface ICCSetup {
  symbol: string;
  timeframe: string;
  iccTags: string[];
  priceAtTrigger: number;
  outcome: string;
  timeBlock: string;
  dashboard: string;
  timestamp: string;

  // Optional fields
  bot?: string;
  capSize?: 'Small' | 'Mid' | 'Large';
  traded?: boolean;
  source?: string;
  tradervueTags?: string[];
  classifiedAt?: string;
  followThrough?: number | null;
  maxGain?: number | null;
  maxLoss?: number | null;

  // Optional classifier inputs used by setupClassifier
  priceAction?: string;
  volume?: number;

  // Optional chart data for utilities/filters/testing
  data?: SetupDataPoint[];
}