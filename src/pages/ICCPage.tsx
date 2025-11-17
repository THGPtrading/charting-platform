// src/pages/ICCPage.tsx
import React from 'react';
import { getSetupLog } from '../alerts/setupLogger';
import LightweightChart from '../components/LightweightChart';
import { ErrorBoundary } from '../components/ErrorBoundary';
import SetupFeed from '../components/SetupFeed';
import SetupReview from '../components/SetupReview';
import SetupExport from '../components/SetupExport';
import type { ICCSetup } from '../types/ICC';

const ICCPage: React.FC = () => {
  const setups: ICCSetup[] = getSetupLog();
  const latestSetup: ICCSetup | undefined = setups.slice(-1)[0];

  const totalSetups = setups.length;
  const validCount = setups.filter(s => s.outcome === 'Pending' || s.outcome === 'Valid').length;
  const malformedCount = setups.filter(s => s.outcome === 'Error').length;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center' }}>📊 ICC Page — Setup Categories</h2>

      {/* Summary Counters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1rem 0' }}>
        <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>Total Setups:</strong> {totalSetups}
        </div>
        <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>Valid:</strong> {validCount}
        </div>
        <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>Malformed:</strong> {malformedCount}
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ErrorBoundary>
          {latestSetup?.data?.length ? (
            <LightweightChart
              data={latestSetup.data.map(d => ({ time: d.time, value: d.close }))}
              overlays={{ triggers: [latestSetup] }}
              timeframe="15 Min"
            />
          ) : (
            <p>No setups available yet.</p>
          )}
        </ErrorBoundary>
      </div>

      {/* Setup Components */}
      <SetupFeed entries={setups} dashboard="ICCPage" />
      <SetupReview entries={setups} dashboard="ICCPage" />
      <SetupExport entries={setups} dashboard="ICCPage" />
    </div>
  );
};

export default ICCPage;