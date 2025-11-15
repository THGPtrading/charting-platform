import React from 'react';
import type { ICCSetup } from '../types/ICC';

interface SetupReviewProps {
  entries: ICCSetup[];
  dashboard: string;
}

const SetupReview: React.FC<SetupReviewProps> = ({ entries, dashboard }) => {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>{dashboard} Review</h3>
      <div style={{ border: '1px solid black', borderRadius: '6px', overflow: 'hidden' }}>
        {entries.map((entry, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f3f4f6',
              padding: '0.5rem',
              borderBottom: '1px solid #ddd',
            }}
          >
            {entry.symbol} — Trigger: {entry.priceAtTrigger} — Tags: {entry.iccTags.join(', ')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupReview;