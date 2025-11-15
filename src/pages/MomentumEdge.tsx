import React, { useEffect, useState } from 'react';
import { fetchDailySetups } from '../api/apiClient';
import { fetchPolygonData } from '../api/polygonClient';
import LightweightChart from '../components/LightweightChart';
import SetupFeed from '../components/SetupFeed';
import SetupReview from '../components/SetupReview';
import SetupExport from '../components/SetupExport';
import { logSetup } from '../alerts/setupLogger';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { isValidSetup, normalizeChartData } from '../utils/validation';
import type { ICCSetup } from '../types/ICC';

const MomentumEdge: React.FC = () => {
  const [latestSetup, setLatestSetup] = useState<ICCSetup | undefined>(undefined);

  useEffect(() => {
    const now = Date.now();
    const setup: Partial<ICCSetup> = {
      symbol: 'AMD',
      timeframe: '5m',
      source: 'ICC Momentum Scanner',
      dashboard: 'MomentumEdge',
      iccTags: ['Momentum', 'Breakout'],
      timeBlock: 'Open',
      priceAtTrigger: 124.5,
      outcome: 'Pending',
      bot: 'TestBot',
      timestamp: new Date().toISOString(),
      data: [
        { time: Math.floor((now - 300000) / 1000), close: 123.8 },
        { time: Math.floor((now - 240000) / 1000), close: 124.0 },
        { time: Math.floor((now - 180000) / 1000), close: 124.2 },
        { time: Math.floor((now - 120000) / 1000), close: 124.4 },
        { time: Math.floor(now / 1000), close: 124.5 },
      ],
    };

    const safeData = normalizeChartData(setup.data ?? []);

    let safeSetup: ICCSetup;
    if (isValidSetup(setup)) {
      safeSetup = setup as ICCSetup;
    } else {
      safeSetup = {
        symbol: setup.symbol ?? 'Unknown',
        timeframe: setup.timeframe ?? 'Unknown',
        source: setup.source ?? 'Unknown',
        dashboard: setup.dashboard ?? 'MomentumEdge',
        iccTags: setup.iccTags ?? ['Unknown'],
        timeBlock: setup.timeBlock ?? 'Regular',
        priceAtTrigger: setup.priceAtTrigger ?? 0,
        outcome: setup.outcome ?? 'Pending',
        bot: setup.bot ?? 'UnknownBot',
        timestamp: setup.timestamp ?? new Date().toISOString(),
        data: safeData,
      };
    }

    logSetup(safeSetup);
    setLatestSetup(safeSetup);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>⚡ MomentumEdge — Momentum & Breakouts</h2>
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
      <SetupFeed entries={latestSetup ? [latestSetup] : []} dashboard="MomentumEdge" />
      <SetupReview entries={latestSetup ? [latestSetup] : []} dashboard="MomentumEdge" />
      <SetupExport entries={latestSetup ? [latestSetup] : []} dashboard="MomentumEdge" />
    </div>
  );
};

export default MomentumEdge;