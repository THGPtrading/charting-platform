// src/pages/Tracker.tsx
import React from "react";
import ICCTracker from "./ICCTracker";

const Tracker: React.FC = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Tracker Dashboard</h2>
      <p>
        This page provides a unified view of ICC setups across all dashboards. Use filters to refine
        by symbol, tags, cap size, session, or outcome. Export results to CSV for deeper review.
      </p>

      {/* Embed ICCTracker directly */}
      <ICCTracker />
    </div>
  );
};

export default Tracker;