import React, { useState } from 'react';
import SetupFeed from '../components/SetupFeed';
import SetupReview from '../components/SetupReview';
import SetupExport from '../components/SetupExport';
import LightweightChart from '../components/LightweightChart';
import { getSetupLog } from '../alerts/setupLogger';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { ICCSetup } from '../types/ICC';

const DefaultDashboard: React.FC = () => {
  const allSetups: ICCSetup[] = getSetupLog();
  const [selectedDashboard, setSelectedDashboard] = useState<string>('All');
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<string>('All');

  const filteredSetups = allSetups.filter(setup => {
    const dashboardMatch =
      selectedDashboard === 'All' || setup.dashboard === selectedDashboard;
    const timeBlockMatch =
      selectedTimeBlock === 'All' || setup.timeBlock === selectedTimeBlock;
    return dashboardMatch && timeBlockMatch;
  });

  const latestSetup: ICCSetup | undefined = filteredSetups.slice(-1)[0];

  // --- NEW summary counts ---
  const totalSetups = filteredSetups.length;
  const momentumCount = filteredSetups.filter(s => s.dashboard === 'MomentumEdge').length;
  const trendCount = filteredSetups.filter(s => s.dashboard === 'TrendEdge').length;
  const warriorCount = filteredSetups.filter(s => s.dashboard === 'WarriorEdge').length;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>📊 THGP Trade Strategy Summary</h1>

      {/* Summary Counters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1rem 0' }}>
        <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>Total Setups:</strong> {totalSetups}
        </div>
        <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>MomentumEdge:</strong> {momentumCount}
        </div>
        <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>TrendEdge:</strong> {trendCount}
        </div>
        <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '6px' }}>
          <strong>WarriorEdge:</strong> {warriorCount}
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>
          Dashboard:
          <select
            value={selectedDashboard}
            onChange={e => setSelectedDashboard(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="All">All</option>
            <option value="MomentumEdge">MomentumEdge</option>
            <option value="TrendEdge">TrendEdge</option>
            <option value="WarriorEdge">WarriorEdge</option>
          </select>
        </label>
        <label>
          TimeBlock:
          <select
            value={selectedTimeBlock}
            onChange={e => setSelectedTimeBlock(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="MidMorning">MidMorning</option>
            <option value="LateMorning">LateMorning</option>
          </select>
        </label>
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
      <SetupFeed entries={filteredSetups} dashboard="Filtered" />
      <SetupReview entries={filteredSetups} dashboard="Filtered" />
      <SetupExport entries={filteredSetups} dashboard="Filtered" />
    </div>
  );
};

export default DefaultDashboard;