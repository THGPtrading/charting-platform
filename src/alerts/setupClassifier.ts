import type { ICCSetup } from "../types/ICC";
import { generateTags } from "./tagGenerator";

export const classifySetup = (alert: Partial<ICCSetup>): ICCSetup => {
  const { priceAction, volume, timeBlock } = alert;

  const tags: string[] = [];
  if (priceAction === "gap-retest" && volume && volume > 100000) {
    tags.push("GapRetest");
  }

  const classified: ICCSetup = {
    symbol: alert.symbol ?? "Unknown",
    timeframe: alert.timeframe ?? "Unknown",
    source: alert.source ?? "UnknownSource",
    dashboard: alert.dashboard ?? "DefaultDashboard",
    timestamp: alert.timestamp ?? new Date().toISOString(),
    bot: alert.bot ?? "UnknownBot",
    capSize: alert.capSize,
    traded: alert.traded,
    priceAction,
    volume,
    outcome: alert.outcome ?? "Pending",
    priceAtTrigger: alert.priceAtTrigger ?? 0,
    data: alert.data ?? [],
    classifiedAt: new Date().toISOString(),
    tradervueTags: generateTags({ ...(alert as ICCSetup) }),
    iccTags: alert.iccTags ?? tags,
    timeBlock: timeBlock ?? "Regular",
  };

  return classified;
};
