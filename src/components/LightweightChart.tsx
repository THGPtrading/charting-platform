import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineData, Time } from 'lightweight-charts';
import type { ICCSetup } from '../types/ICC';

interface LightweightChartProps {
  data: { time: number | string; value: number }[];
  overlays?: {
    vwap?: boolean;
    sessionZones?: boolean;
    triggers?: ICCSetup[];
  };
}

const LightweightChart: React.FC<LightweightChartProps> = ({ data, overlays }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up any existing chart before creating a new one
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 600,
      height: 400,
      layout: { background: { color: '#ffffff' }, textColor: '#000' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      timeScale: {
        borderColor: '#000',
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderColor: '#000',
      },
    });

    const lineSeries = chart.addLineSeries();

    const formattedData: LineData[] = data.map(d => ({
      time:
        typeof d.time === 'number'
          ? (d.time as Time)
          : (Math.floor(new Date(d.time).getTime() / 1000) as Time),
      value: d.value,
    }));
    lineSeries.setData(formattedData);

    if (overlays?.triggers) {
      lineSeries.setMarkers(
        overlays.triggers.map(trigger => ({
          time: Math.floor(new Date(trigger.timestamp).getTime() / 1000) as Time,
          position: 'aboveBar',
          color: 'red',
          shape: 'arrowUp',
          text: trigger.iccTags.join(','),
        }))
      );
    }

    chartRef.current = chart;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [data, overlays]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: '400px',
        border: '3px solid #a78bfa', // lavender border
        background: 'linear-gradient(to bottom, #d9f99d 40px, #ffffff 40px)', 
        // ✅ soft green strip at top for time axis area
      }}
    />
  );
};

export default LightweightChart;