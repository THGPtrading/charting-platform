import React from 'react';
import LightweightChart from '../LightweightChart';
import SetupFeed from '../components/setupFeed';
import SetupReview from '../components/setupReview';
import { exportSetupLogCSV } from '../alerts/setupLogger';

const MomentumEdge = () => {
  const handleExport = () => {
    const csv = exportSetupLogCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'momentumedge_setups.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🚀 MomentumEdge — Breakouts & Trend Continuation</h2>
      <LightweightChart symbol="TSLA" timeframe="5m" />
      <SetupFeed filterDashboard="MomentumEdge" />
      <SetupReview filterDashboard="MomentumEdge" />
      <button onClick={handleExport} style={{ marginTop: '1rem' }}>
        📤 Export MomentumEdge Setups to CSV
      </button>
    </div>
  );
};

export default MomentumEdge;
