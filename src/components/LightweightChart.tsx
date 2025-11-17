import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, LineData, Time, LineSeries, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';
import type { ICCSetup } from '../types/ICC';
import { initializeLiveCandle, updateLiveCandle, LiveCandleState } from '../utils/liveCandle';

type Candle = { time: number | string; open: number; high: number; low: number; close: number; volume?: number };

interface LightweightChartProps {
  data: Candle[] | { time: number | string; value: number }[];
  timeframe?: string;
  overlays?: {
    vwap?: boolean;
    sessionZones?: boolean;
    triggers?: ICCSetup[];
  };
  enableLiveCandle?: boolean; // Enable simulated real-time candle updates
}

const LightweightChart: React.FC<LightweightChartProps> = ({ data, overlays, timeframe, enableLiveCandle = true }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const placeholderRef = useRef<any | null>(null);
  const seriesRef = useRef<any | null>(null);
  const liveCandleState = useRef<LiveCandleState | null>(null);
  const [, setTick] = useState(0); // Force re-render for live updates

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

    // create a transparent placeholder series so axes/timeScale render even with no/late data
    try {
      if (!placeholderRef.current) {
        const nowSec = Math.floor(Date.now() / 1000) as Time;
        placeholderRef.current = chart.addSeries(LineSeries, { color: 'rgba(0,0,0,0)' });
        try { placeholderRef.current.setData([{ time: nowSec, value: 0 }]); } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore placeholder failure */ }

    const first = data && data.length ? (data[0] as any) : null;
    const isCandle = first && typeof first.open === 'number' && typeof first.high === 'number' && typeof first.low === 'number' && typeof first.close === 'number';

    if (isCandle) {
      // remove placeholder before adding real series
      try { if (placeholderRef.current) { chart.removeSeries?.(placeholderRef.current); placeholderRef.current = null; } } catch (e) { /* ignore */ }
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a', downColor: '#ef5350',
        borderUpColor: '#26a69a', borderDownColor: '#ef5350',
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
      });
      seriesRef.current = series;
      const mapped = (data as Candle[]).map(c => ({
        time: typeof c.time === 'number' ? (c.time as Time) : (Math.floor(new Date(c.time).getTime() / 1000) as Time),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      series.setData(mapped as any);
      
      // Initialize live candle state from the last candle
      if (enableLiveCandle && mapped.length > 0) {
        const lastCandle = mapped[mapped.length - 1];
        liveCandleState.current = initializeLiveCandle(lastCandle as any);
      }
      
      if (overlays?.triggers) {
        const markers = overlays.triggers.map(t => ({
          time: Math.floor(new Date((t as any).timestamp).getTime() / 1000) as Time,
          position: 'aboveBar' as const,
          color: 'red',
          shape: 'arrowUp' as const,
          text: (t as any).iccTags ? (t as any).iccTags.join(',') : undefined,
        }));
        try { createSeriesMarkers(series, markers); } catch (e) { /* ignore */ }
      }
    } else {
      // remove placeholder before adding real series
      try { if (placeholderRef.current) { chart.removeSeries?.(placeholderRef.current); placeholderRef.current = null; } } catch (e) { /* ignore */ }
      const series = chart.addSeries(LineSeries, { color: '#2196f3', lineWidth: 2 });
      seriesRef.current = series;
      const formattedData: LineData[] = (data as { time: number | string; value: number }[]).map(d => ({
        time: typeof d.time === 'number' ? (d.time as Time) : (Math.floor(new Date(d.time).getTime() / 1000) as Time),
        value: d.value,
      }));
      series.setData(formattedData);
      
      if (overlays?.triggers) {
        const markers = overlays.triggers.map(t => ({
          time: Math.floor(new Date((t as any).timestamp).getTime() / 1000) as Time,
          position: 'aboveBar' as const,
          color: 'red',
          shape: 'arrowUp' as const,
          text: (t as any).iccTags ? (t as any).iccTags.join(',') : undefined,
        }));
        try { createSeriesMarkers(series, markers); } catch (e) { /* ignore */ }
      }
    }

    // ensure chart is sized to container (in case placeholder affected layout)
    try {
      const rect = chartContainerRef.current?.getBoundingClientRect();
      if (rect && typeof chart.applyOptions === 'function') {
        chart.applyOptions({ width: Math.max(100, Math.floor(rect.width)), height: Math.max(100, Math.floor(rect.height)) });
      }
      if (typeof chart.timeScale === 'function') chart.timeScale().fitContent();
    } catch (e) { /* ignore */ }

    chartRef.current = chart;

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        const rect = chartContainerRef.current.getBoundingClientRect();
        chart.applyOptions({ 
          width: Math.max(100, Math.floor(rect.width)),
          height: Math.max(100, Math.floor(rect.height))
        });
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    // Live candle animation interval
    let animationFrame: number;
    if (enableLiveCandle && liveCandleState.current && seriesRef.current) {
      const animate = () => {
        if (liveCandleState.current && seriesRef.current) {
          // Parse timeframe to get interval minutes
          const intervalMinutes = timeframe === '1 Min' ? 1 :
                                   timeframe === '5 Min' ? 5 :
                                   timeframe === '15 Min' ? 15 :
                                   timeframe === '30 Min' ? 30 :
                                   timeframe === '1 Hr' ? 60 :
                                   timeframe === '4 Hr' ? 240 :
                                   timeframe === 'Daily' ? 1440 : 5;
          
          const liveCandle = updateLiveCandle(liveCandleState.current, intervalMinutes);
          try {
            seriesRef.current.update({
              time: liveCandle.time as Time,
              open: liveCandle.open,
              high: liveCandle.high,
              low: liveCandle.low,
              close: liveCandle.close,
            });
          } catch (e) { /* ignore */ }
        }
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data, overlays, timeframe, enableLiveCandle]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '300px',
        border: '3px solid #a78bfa', // lavender border
        background: 'linear-gradient(to bottom, #d9f99d 40px, #ffffff 40px)', 
        // ✅ soft green strip at top for time axis area
      }}
    />
  );
};

export default LightweightChart;