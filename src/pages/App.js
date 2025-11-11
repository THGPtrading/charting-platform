import React, { useEffect, useState } from 'react';
import LightweightChart from '../LightweightChart';
import SetupFeed from '../components/setupFeed';
import SetupReview from '../components/setupReview';
import { fetchPolygonData } from '../api/polygon';
import { exportSetupLogCSV } from '../alerts/setupLogger';

const App = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchPolygonData('AAPL').then(setChartData);
  }, []);

  const handleExport = () => {
    const csv = exportSetupLogCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'icc_setups.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem', color: '#ccc' }}>
      <h2>Openedge Dashboard</h2>
      <p>Scalp-focused ICC charting platform with ChartEye overlays</p>

      <LightweightChart data={chartData} />
      <hr />

      <SetupFeed />
      <hr />

      <SetupReview />
      <hr />

      <button
        onClick={handleExport}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#444',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        📤 Export ICC Setups to CSV
      </button>
    </div>
  );
};

export default App;
