// src/testing/malformed.ts
import type { ICCSetup, SetupDataPoint } from "../types/ICC";

export const malformedSetups: ICCSetup[] = [
  {
    symbol: "AAPL",
    timeframe: "15m",
    source: "MalformedTest",
    dashboard: "MomentumEdge",
    iccTags: ["Momentum"],
    priceAtTrigger: 198.6,
    outcome: "Pending",
    timeBlock: "Morning",
    bot: "MalformedBot",
    timestamp: new Date().toISOString(),
    // ✅ convert string date to numeric timestamp
    data: [{ time: Math.floor(Date.parse("2025-11-13T14:00:00Z") / 1000), close: 198.6 }],
  },
  {
    symbol: "MSFT",
    timeframe: "1h",
    source: "MalformedTest",
    dashboard: "WarriorEdge",
    iccTags: ["Reversal"],
    priceAtTrigger: 342.5,
    outcome: "Pending",
    timeBlock: "Afternoon",
    bot: "MalformedBot",
    timestamp: new Date().toISOString(),
    data: [
      { time: Math.floor(Date.now() / 1000) - 3600, close: 340.0 },
      { time: Math.floor(Date.now() / 1000), close: 342.5 },
    ],
  },
];
