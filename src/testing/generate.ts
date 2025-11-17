// src/testing/generate.ts
import type { ICCSetup, SetupDataPoint } from "../types/ICC";

export function generateSetups(count: number): ICCSetup[] {
  const setups: ICCSetup[] = [];
  for (let i = 0; i < count; i++) {
    const symbol = ["AAPL", "MSFT", "NVDA"][i % 3];
    const timeframe = "15m";
    const iccTags = ["Swing"];
    const priceAtTrigger = 100 + i;
    const outcome = "Pending";
    const timeBlock = "Morning";
    const bot = "TestBot";
    const dashboard = "TrendEdge";
    const timestamp = new Date().toISOString();
    const data: SetupDataPoint[] = [
      { time: Math.floor(Date.now() / 1000), close: priceAtTrigger },
    ];

    setups.push({
      symbol,
      timeframe,
      iccTags,
      priceAtTrigger,
      outcome,
      timeBlock,
      bot,
      dashboard,
      timestamp,
      data,
      source: "TestGenerator", // ✅ required
    });
  }
  return setups;
}