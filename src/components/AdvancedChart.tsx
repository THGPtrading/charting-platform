import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, Time, LineSeriesOptions } from 'lightweight-charts';
import type { ICCSetup, SetupDataPoint } from '../types/ICC';
import { ErrorBoundary } from './ErrorBoundary';
import { normalizeChartData } from '../utils/validation';

interface AdvancedChartProps {
  setups: ICCSetup[];
}

export const AdvancedChart: React.FC<AdvancedChartProps> = ({ setups }) => {
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
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#000',
      },
      rightPriceScale: {
        borderColor: '#000',
      },
    });

    chartRef.current = chart;

    setups.forEach((setup, index) => {
      const series = chart.addLineSeries({
        color: ['#007bff', '#28a745', '#ffc107'][index % 3],
        lineWidth: 2,
      } as LineSeriesOptions);

      const safeData = normalizeChartData(setup.data ?? []);
      const data: { time: Time; value: number }[] = safeData.map((d: SetupDataPoint) => ({
        time:
          typeof d.time === 'number'
            ? (d.time as Time)
            : (Math.floor(new Date(d.time).getTime() / 1000) as Time),
        value: d.close,
      }));

      series.setData(data);

      // Add ICC trigger marker
      series.setMarkers([
        {
          time: Math.floor(new Date(setup.timestamp).getTime() / 1000) as Time,
          position: 'aboveBar',
          color: 'red',
          shape: 'arrowUp',
          text: setup.symbol,
        },
      ]);
    });

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [setups]);

  return (
    <ErrorBoundary>
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: '400px',
          border: '3px solid #a78bfa', // lavender border
          background: 'linear-gradient(to bottom, #d9f99d 40px, #ffffff 40px)', // soft green highlight strip
        }}
      />
    </ErrorBoundary>
  );
};