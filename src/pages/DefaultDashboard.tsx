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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📊 THGP Trade Stategy Summary</h1>

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
            />
          ) : (
            <p>No setups available yet.</p>
          )}
        </ErrorBoundary>
      </div>

      <SetupFeed entries={filteredSetups} dashboard="Filtered" />
      <SetupReview entries={filteredSetups} dashboard="Filtered" />
      <SetupExport entries={filteredSetups} dashboard="Filtered" />
    </div>
  );
};

export default DefaultDashboard;