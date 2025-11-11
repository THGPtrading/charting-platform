import React from 'react';
import LightweightChart from '../LightweightChart';
import SetupFeed from '../components/setupFeed';
import SetupReview from '../components/setupReview';
import { exportSetupLogCSV } from '../alerts/setupLogger';

const TrendEdge = () => {
  const handleExport = () => {
    const csv = exportSetupLogCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'trendedge_setups.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📈 TrendEdge — Intraday & Swing Setups</h2>
      <LightweightChart symbol="MSFT" timeframe="15m" />
      <SetupFeed filterDashboard="TrendEdge" />
      <SetupReview filterDashboard="TrendEdge" />
      <button onClick={handleExport} style={{ marginTop: '1rem' }}>
        📤 Export TrendEdge Setups to CSV
      </button>
    </div>
  );
};

export default TrendEdge;
