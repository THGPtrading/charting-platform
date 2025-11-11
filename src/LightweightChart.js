import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const LightweightChart = ({ data }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: 800,
      height: 400,
      layout: { background: { color: '#0e0e0e' }, textColor: '#ccc' },
      grid: { vertLines: { color: '#222' }, horzLines: { color: '#222' } },
    });

    const series = chart.addLineSeries();
    series.setData(data);

    // 🔧 Placeholder: ChartEye overlays
    // import and apply ICC logic here

    // 🔧 Placeholder: TrendSpider zones
    // overlay dynamic zones once API is integrated

    return () => chart.remove();
  }, [data]);

  return <div ref={chartContainerRef} />;
};

export default LightweightChart;
