import React from 'react';
import { getSetupLog } from '../alerts/setupLogger';
import type { ICCSetup } from '../types/ICC';

const ICCPage: React.FC = () => {
  const setups: ICCSetup[] = getSetupLog();

  const renderCategory = (title: string, filterFn: (s: ICCSetup) => boolean) => {
    const filtered = setups.filter(filterFn);
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h3>{title}</h3>
        <div style={{ border: '1px solid black', borderRadius: '6px', overflow: 'hidden' }}>
          {filtered.map((setup, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f3f4f6',
                padding: '0.5rem',
                borderBottom: '1px solid #ddd',
              }}
            >
              {setup.symbol} — {setup.dashboard} — {setup.outcome}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>ICC Dashboard</h2>
      {renderCategory('All Setups', () => true)}
      {renderCategory('Valid Setups', s => s.outcome === 'Pending' || s.outcome === 'Valid')}
      {renderCategory('Malformed Setups', s => s.outcome === 'Error')}
    </div>
  );
};

export default ICCPage;