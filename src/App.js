import React, { useEffect, useState } from 'react';
import LightweightChart from './LightweightChart';
import { fetchPolygonData } from './api/polygon';

const App = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchPolygonData('AAPL').then(setChartData);
  }, []);

  return (
    <div style={{ padding: '2rem', color: '#ccc' }}>
      <h2>Openedge Dashboard</h2>
      <p>Scalp-focused ICC charting platform with ChartEye overlays</p>
      <LightweightChart data={chartData} />
    </div>
  );
};

export default App;
