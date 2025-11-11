import React from 'react';
import LightweightChart from '../LightweightChart';
import SetupFeed from '../components/setupFeed';
import SetupReview from '../components/setupReview';
import { exportSetupLogCSV } from '../alerts/setupLogger';

const WarriorEdge = () => {
  const handleExport = () => {
    const csv = exportSetupLogCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'warrioredge_setups.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>⚔️ WarriorEdge — Pre-Market & Opening Scalps</h2>
      <LightweightChart symbol="AAPL" timeframe="1m" />
      <SetupFeed filterDashboard="WarriorEdge" />
      <SetupReview filterDashboard="WarriorEdge" />
      <button onClick={handleExport} style={{ marginTop: '1rem' }}>
        📤 Export WarriorEdge Setups to CSV
      </button>
    </div>
  );
};

export default WarriorEdge;
