import React from 'react';
import type { ICCSetup } from '../types/ICC';

interface SetupFeedProps {
  entries: ICCSetup[];
  dashboard: string;
}

const SetupFeed: React.FC<SetupFeedProps> = ({ entries, dashboard }) => {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>{dashboard} Feed</h3>
      <div style={{ border: '1px solid black', borderRadius: '6px', overflow: 'hidden' }}>
        {entries.map((entry, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f3f4f6', // alternating rows
              padding: '0.5rem',
              borderBottom: '1px solid #ddd',
            }}
          >
            {entry.symbol} — {entry.timeframe} — {entry.outcome}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupFeed;