import React from "react";
import type { ICCSetup } from "../types/ICC";

interface SetupFeedProps {
  entries: ICCSetup[];
  dashboard: string;
}

const SetupFeed: React.FC<SetupFeedProps> = ({ entries, dashboard }) => {
  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>{dashboard} Feed</h3>
      <div style={{ border: "1px solid black", borderRadius: "6px", overflow: "hidden" }}>
        {entries.map((entry, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f3f4f6",
              padding: "0.5rem",
              borderBottom: "1px solid #ddd",
            }}
          >
            {entry.symbol} — {entry.timeframe} — {entry.type ?? "N/A"}
            {entry.entry !== undefined && ` | Entry: ${entry.entry.toFixed(2)}`}
            {entry.stop !== undefined && ` | Stop: ${entry.stop.toFixed(2)}`}
            {entry.target !== undefined && ` | Target: ${entry.target.toFixed(2)}`}
            {entry.shares !== undefined && ` | Shares: ${entry.shares}`}
            {entry.ratio !== undefined && ` | R:R 1:${entry.ratio}`}
            {entry.winProbability !== undefined && ` | Win Prob: ${entry.winProbability}%`}
            {entry.outcome && ` | Outcome: ${entry.outcome}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupFeed;
