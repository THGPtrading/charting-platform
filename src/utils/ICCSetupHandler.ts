// src/utils/ICCSetupHandler.ts
// Utility functions for handling ICC setups across dashboards

export interface ICCSetup {
  id: string;
  symbol: string;
  tag: string;
  timeBlock: string;   // e.g. "pre-market", "regular", "after-hours"
  score?: number;      // optional scoring metric
  malformed?: boolean; // flag for malformed setups
}

/**
 * Normalize a raw setup object into a valid ICCSetup.
 * Ensures required fields exist and applies defaults.
 */
export function normalizeSetup(raw: Partial<ICCSetup>): ICCSetup {
  return {
    id: raw.id ?? crypto.randomUUID(),
    symbol: raw.symbol?.toUpperCase() ?? "UNKNOWN",
    tag: raw.tag ?? "untagged",
    timeBlock: raw.timeBlock ?? "regular",
    score: raw.score ?? 0,
    malformed: raw.malformed ?? false,
  };
}

/**
 * Validate a setup object.
 * Returns true if required fields are present and not malformed.
 */
export function validateSetup(setup: ICCSetup): boolean {
  if (!setup.symbol || !setup.tag || !setup.timeBlock) return false;
  if (setup.malformed) return false;
  return true;
}

/**
 * Group setups by tag for dashboard segmentation.
 */
export function groupByTag(setups: ICCSetup[]): Record<string, ICCSetup[]> {
  return setups.reduce((acc, setup) => {
    const tag = setup.tag;
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(setup);
    return acc;
  }, {} as Record<string, ICCSetup[]>);
}

/**
 * Group setups by timeBlock for session segmentation.
 */
export function groupByTimeBlock(setups: ICCSetup[]): Record<string, ICCSetup[]> {
  return setups.reduce((acc, setup) => {
    const block = setup.timeBlock;
    if (!acc[block]) acc[block] = [];
    acc[block].push(setup);
    return acc;
  }, {} as Record<string, ICCSetup[]>);
}

/**
 * Filter setups for malformed entries.
 */
export function filterMalformed(setups: ICCSetup[]): ICCSetup[] {
  return setups.filter(s => s.malformed);
}

/**
 * Example: route setups to dashboards by tag.
 */
export function routeToDashboard(setup: ICCSetup): string {
  switch (setup.tag.toLowerCase()) {
    case "momentum":
      return "MomentumEdge";
    case "trend":
      return "TrendEdge";
    case "warrior":
      return "WarriorEdge";
    default:
      return "DefaultDashboard";
  }
}