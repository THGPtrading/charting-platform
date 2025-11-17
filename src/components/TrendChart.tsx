import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, Time, CandlestickSeries, LineSeries, HistogramSeries, createSeriesMarkers } from 'lightweight-charts';
import type { ChartCandle } from '../api/polygonClient';
import { liveCandleSync } from '../utils/liveCandleSync';

// Simple global sync bus
declare global { interface Window { __chartSync?: any } }
function getBus() {
  if (!window.__chartSync) {
    window.__chartSync = {
      groups: new Map<string, any>(),
      get(group: string) {
        if (!this.groups.has(group)) this.groups.set(group, { subs: new Set() });
        return this.groups.get(group);
      },
      subscribe(group: string, api: any) {
        const g = this.get(group); g.subs.add(api); return () => g.subs.delete(api);
      },
      publishRange(group: string, src: any, range: any) {
        const g = this.get(group); g.subs.forEach((api: any) => { if (api !== src) api.onRange?.(range); });
      },
      publishTime(group: string, src: any, time: Time | null) {
        const g = this.get(group); g.subs.forEach((api: any) => { if (api !== src) api.onTime?.(time); });
      },
      publishHighlight(group: string, time: Time) {
        const g = this.get(group); g.subs.forEach((api: any) => { api.onHighlight?.(time); });
      }
    };
  }
  return window.__chartSync;
}

function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []; let sum = 0; const q: number[] = [];
  for (const v of values) { sum += v; q.push(v); if (q.length > period) sum -= q.shift()!; out.push(q.length === period ? sum / period : null); }
  return out;
}
function ema(values: number[], period: number): number[] {
  const out: number[] = []; const k = 2 / (period + 1); let prev: number | null = null;
  for (const v of values) { prev = prev === null ? v : (v * k + (1 - k) * prev); out.push(prev); }
  return out as number[];
}
function macd(values: number[], fast: number, slow: number, signal: number) {
  const efast = ema(values, fast), eslow = ema(values, slow);
  const macdLine = efast.map((v, i) => v - eslow[i]);
  const signalLine = ema(macdLine, signal);
  const hist = macdLine.map((m, i) => m - signalLine[i]);
  return { macdLine, signalLine, hist };
}
function rsi(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []; let gain = 0, loss = 0;
  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i-1];
    gain = (gain * (period - 1) + Math.max(change, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-change, 0)) / period;
    if (i >= period) {
      const rs = loss === 0 ? 100 : 100 - (100 / (1 + (gain / loss)));
      out.push(rs);
    } else out.push(null);
  }
  out.unshift(null);
  return out;
}
function atr(candles: ChartCandle[], period: number): (number | null)[] {
  const out: (number | null)[] = []; let prevClose: number | null = null; let trArr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]; const high = c.high, low = c.low; const pc = prevClose ?? c.close;
    const tr = Math.max(high - low, Math.abs(high - pc), Math.abs(low - pc));
    trArr.push(tr); if (trArr.length > period) trArr.shift();
    out.push(trArr.length === period ? trArr.reduce((a,b)=>a+b,0) / period : null);
    prevClose = c.close;
  }
  return out;
}

export interface TrendChartProps {
  ticker: string; // Stock ticker symbol for synchronized live candles
  candles: ChartCandle[];
  timeframe: '1 Min'|'5 Min'|'10 Min'|'15 Min'|'30 Min'|'1 Hr'|'4 Hr'|'Daily';
  syncGroup: string;
  showVWAP?: boolean;
  show50MA?: boolean;
  show200MA?: boolean;
  showVolume?: boolean;
  rsiPeriods?: number[]; // default [7,14,21]
  macdConfig?: { fast: number; slow: number; signal: number } | null;
  showATR?: boolean;
  realtime?: { enabled?: boolean; provider?: 'mock'; intervalMs?: number };
}

function secondsPerBar(tf: TrendChartProps['timeframe']): number {
  switch (tf) {
    case '1 Min': return 60;
    case '5 Min': return 300;
    case '10 Min': return 600;
    case '15 Min': return 900;
    case '30 Min': return 1800;
    case '1 Hr': return 3600;
    case '4 Hr': return 14400;
    case 'Daily': return 86400;
  }
}

const TrendChart: React.FC<TrendChartProps> = ({ ticker, candles, timeframe, syncGroup, showVWAP, show50MA, show200MA, showVolume, rsiPeriods, macdConfig, showATR, realtime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<any | null>(null);
  const markerSeriesRef = useRef<any | null>(null);
  const volumeSeriesRef = useRef<any | null>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastCloseRef = useRef<number | null>(null);
  const perBarRef = useRef<number>(secondsPerBar(timeframe));

  const [drawMode, setDrawMode] = React.useState<boolean>(false);
  const [trendlines, setTrendlines] = React.useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  const [tempLine, setTempLine] = React.useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (chartRef.current) { try { chartRef.current.remove(); } catch {} chartRef.current = null; }

    const containerRect = containerRef.current.getBoundingClientRect();
    const chart = createChart(containerRef.current, {
      width: containerRect.width || 600,
      height: containerRect.height || 380,
      layout: { background: { color: '#111' }, textColor: '#e0e0e0' },
      grid: { vertLines: { color: '#333' }, horzLines: { color: '#333' } },
      timeScale: { 
        borderColor: '#888', 
        timeVisible: true, 
        secondsVisible: true, 
        lockVisibleTimeRangeOnResize: true,
        visible: true,
        fixLeftEdge: false,
        fixRightEdge: false
      },
      rightPriceScale: { 
        borderColor: '#888', 
        autoScale: true,
        visible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        vertLine: {
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          visible: true,
          labelVisible: true,
        },
      },
    });
    chartRef.current = chart;

    // Set visible range BEFORE adding any series to prevent auto-fit
    // Show last 35 candles by default (or all candles if fewer than 35)
    if (candles.length) {
      const last = candles[candles.length - 1].time;
      const candlesToShow = Math.min(35, candles.length);
      const startIdx = Math.max(0, candles.length - candlesToShow);
      chart.timeScale().setVisibleLogicalRange({ from: startIdx, to: candles.length - 1 });
    }

    // subscribe to sync bus
    const bus = getBus();
    const setGuide = (time: Time | null) => {
      try {
        if (!guideRef.current) return;
        if (!time) { guideRef.current.style.display = 'none'; return; }
        const x = chart.timeScale().timeToCoordinate(time);
        if (x == null) { guideRef.current.style.display = 'none'; return; }
        guideRef.current.style.display = 'block';
        guideRef.current.style.left = `${x}px`;
      } catch {}
    };

    const api = {
      onRange: (_range: any) => {},
      onTime: (t: Time|null) => { setGuide(t); },
      onHighlight: (time: Time) => {
        try {
          if (!markerSeriesRef.current) markerSeriesRef.current = chart.addSeries(LineSeries, { color: 'rgba(0,0,0,0)' });
          const m = createSeriesMarkers(mainSeriesRef.current ?? markerSeriesRef.current, [{ time, position: 'aboveBar', color: 'yellow', shape: 'circle', text: '' } as any]);
          void m;
          chart.timeScale().setVisibleRange?.({ from: Number(time) - 20000, to: Number(time) + 20000 } as any);
          setGuide(time);
        } catch {}
      }
    };
    const unsub = bus.subscribe(syncGroup, api);

    // main candlesticks
    const cs = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350',
      borderUpColor: '#26a69a', borderDownColor: '#ef5350',
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    mainSeriesRef.current = cs;
    cs.setData(candles.map(c => ({ time: c.time as unknown as Time, open: c.open, high: c.high, low: c.low, close: c.close })) as any);
    if (candles.length) { 
      lastTimeRef.current = candles[candles.length-1].time; 
      lastCloseRef.current = candles[candles.length-1].close; 
      
      // Initialize/update synchronized live candle state
      const lastCandle = candles[candles.length - 1];
      liveCandleSync.updateBaseCandle(ticker, lastCandle);
    }

    // Overlays
    const closes = candles.map(c => c.close);
    if (show50MA) {
      const v = sma(closes, 50);
      const ls = chart.addSeries(LineSeries, { color: '#ffd700', lineWidth: 1 });
      ls.setData(candles.map((c,i) => ({ time: c.time as unknown as Time, value: v[i] ?? c.close })) as any);
    }
    if (show200MA) {
      const v = sma(closes, 200);
      const ls = chart.addSeries(LineSeries, { color: '#1e90ff', lineWidth: 1 });
      ls.setData(candles.map((c,i) => ({ time: c.time as unknown as Time, value: v[i] ?? c.close })) as any);
    }
    if (showVWAP) {
      // Simple session VWAP starting each day at 04:00 ET
      const out: { time: Time; value: number }[] = []; let cumPV = 0, cumV = 0; let sessionStart: number | null = null;
      const startOfSession4amET = (ts: number) => { const d = new Date(ts * 1000); const m = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0); return Math.floor(m.getTime()/1000) + 4*3600; };
      candles.forEach(c => {
        const s = startOfSession4amET(c.time);
        if (sessionStart === null || s !== sessionStart) { sessionStart = s; cumPV = 0; cumV = 0; }
        const tp = (c.high + c.low + c.close) / 3; const v = c.volume ?? 0; cumPV += tp * v; cumV += v; const val = cumV > 0 ? cumPV / cumV : tp;
        out.push({ time: c.time as unknown as Time, value: val });
      });
      const vw = chart.addSeries(LineSeries, { color: '#6a0dad', lineWidth: 1 });
      vw.setData(out as any);
    }

    // Volume pane
    if (showVolume) {
      const vol = chart.addSeries(HistogramSeries, { color: '#888', priceFormat: { type: 'volume' } as any, base: 0 }, 1);
      volumeSeriesRef.current = vol;
      vol.setData(candles.map(c => ({ time: c.time as unknown as Time, value: c.volume ?? 0, color: c.close >= c.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)' })) as any);
    }

    // RSI pane
    const rsiPeriodsEff = rsiPeriods && rsiPeriods.length ? rsiPeriods : [7,14,21];
    const isRsiTf = ['1 Min','5 Min','10 Min','15 Min'].includes(timeframe);
    if (isRsiTf) {
      const pane = 2;
      rsiPeriodsEff.forEach((p, idx) => {
        const v = rsi(closes, p);
        const color = idx === 0 ? '#9acd32' : idx === 1 ? '#00bcd4' : '#ff9800';
        const ls = chart.addSeries(LineSeries, { color, lineWidth: 1 }, pane);
        ls.setData(candles.map((c,i) => ({ time: c.time as unknown as Time, value: v[i] ?? 50 })) as any);
      });
    }

    // MACD pane (same pane for histogram and lines)
    if (timeframe !== 'Daily' && macdConfig) {
      const pane = 2;
      const m = macd(closes, macdConfig.fast, macdConfig.slow, macdConfig.signal);
      const h = chart.addSeries(HistogramSeries, { base: 0 }, pane);
      h.setData(candles.map((c,i) => ({ time: c.time as unknown as Time, value: m.hist[i], color: (m.hist[i] ?? 0) >= 0 ? 'rgba(38,166,154,0.6)' : 'rgba(239,83,80,0.6)' })) as any);
      const ml = chart.addSeries(LineSeries, { color: '#fff', lineWidth: 1 }, pane);
      ml.setData(candles.map((c,i) => ({ time: c.time as unknown as Time, value: m.macdLine[i] })) as any);
      const sl = chart.addSeries(LineSeries, { color: '#ff9800', lineWidth: 1 }, pane);
      sl.setData(candles.map((c,i) => ({ time: c.time as unknown as Time, value: m.signalLine[i] })) as any);
    }

    // ATR pane (daily only)
    if (timeframe === 'Daily' && showATR) {
      const pane = 2;
      const v = atr(candles, 14);
      const ls = chart.addSeries(LineSeries, { color: '#00bcd4', lineWidth: 1 }, pane);
      ls.setData(candles.map((c,i) => ({ time: c.time as unknown as Time, value: v[i] ?? 0 })) as any);
    }

    // note: no visible-range sync to keep panes independent
    chart.subscribeCrosshairMove(param => {
      const t = (param.time ?? null) as any;
      getBus().publishTime(syncGroup, api, t);
      try { if (guideRef.current) {
        if (!t) { guideRef.current.style.display = 'none'; }
        else {
          const x = chart.timeScale().timeToCoordinate(t);
          if (x == null) guideRef.current.style.display = 'none';
          else { guideRef.current.style.display = 'block'; guideRef.current.style.left = `${x}px`; }
        }
      } } catch {}
    });

    // Handle window resize to maintain chart dimensions and axis visibility
    const handleResize = () => {
      if (containerRef.current && chart) {
        // Use requestAnimationFrame to ensure DOM has settled
        requestAnimationFrame(() => {
          if (containerRef.current && chart) {
            const rect = containerRef.current.getBoundingClientRect();
            const newWidth = Math.max(100, Math.floor(rect.width));
            const newHeight = Math.max(100, Math.floor(rect.height));
            
            // Only update if dimensions actually changed
            const currentOptions = chart.options();
            if (currentOptions.width !== newWidth || currentOptions.height !== newHeight) {
              chart.applyOptions({ width: newWidth, height: newHeight });
              chart.timeScale().fitContent();
            }
          }
        });
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      // Trigger initial resize to ensure chart fills flex container
      requestAnimationFrame(() => handleResize());
    }

    // Live candle animation - synchronized across all charts for same ticker
    let unsubscribe: (() => void) | null = null;
    if (mainSeriesRef.current && candles.length > 0) {
      const intervalMinutes = timeframe === '1 Min' ? 1 :
                               timeframe === '5 Min' ? 5 :
                               timeframe === '10 Min' ? 10 :
                               timeframe === '15 Min' ? 15 :
                               timeframe === '30 Min' ? 30 :
                               timeframe === '1 Hr' ? 60 :
                               timeframe === '4 Hr' ? 240 :
                               timeframe === 'Daily' ? 1440 : 5;
      
      const updateChart = () => {
        if (mainSeriesRef.current) {
          const liveCandle = liveCandleSync.getCurrentCandle(ticker, intervalMinutes);
          if (liveCandle) {
            try {
              mainSeriesRef.current.update({
                time: liveCandle.time as unknown as Time,
                open: liveCandle.open,
                high: liveCandle.high,
                low: liveCandle.low,
                close: liveCandle.close,
              });
            } catch (e) { /* ignore */ }
          }
        }
      };
      
      // Subscribe to synchronized updates
      unsubscribe = liveCandleSync.subscribe(ticker, updateChart);
    }

    return () => { 
      if (unsubscribe) unsubscribe();
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      try { unsub(); chart.remove(); } catch {} 
    };
  }, [ticker, candles, timeframe, showVWAP, show50MA, show200MA, showVolume, JSON.stringify(rsiPeriods), macdConfig ? `${macdConfig.fast}-${macdConfig.slow}-${macdConfig.signal}` : 'none', showATR, syncGroup]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 4, padding: '4px 8px', background: '#1a1a1a', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <button
          onClick={() => setDrawMode(!drawMode)}
          style={{
            padding: '4px 12px', fontSize: 11, cursor: 'pointer',
            background: drawMode ? '#a78bfa' : '#2a2a2a',
            color: '#e0e0e0', border: '1px solid #444', borderRadius: 3,
          }}
          title="Draw trendline (click two points)"
        >
          📈 Trendline
        </button>
        <button
          onClick={() => { 
            if (trendlines.length > 0) setTrendlines(trendlines.slice(0, -1));
            setTempLine(null);
          }}
          style={{
            padding: '4px 12px', fontSize: 11, cursor: 'pointer',
            background: '#2a2a2a', color: '#e0e0e0', border: '1px solid #444', borderRadius: 3,
          }}
          title="Clear last trendline"
        >
          ↶ Undo
        </button>
        <button
          onClick={() => { setTrendlines([]); setTempLine(null); }}
          style={{
            padding: '4px 12px', fontSize: 11, cursor: 'pointer',
            background: '#2a2a2a', color: '#e0e0e0', border: '1px solid #444', borderRadius: 3,
          }}
          title="Clear all trendlines"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Chart container */}
      <div ref={containerRef} style={{ flex: 1, border: '1px solid #444', position: 'relative', minHeight: 0, width: '100%', overflow: 'hidden' }}>
        <div ref={guideRef} style={{ position: 'absolute', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.2)', pointerEvents: 'none', display: 'none' }} />
        
        {/* Drawing overlay canvas */}
        <svg style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          pointerEvents: drawMode ? 'auto' : 'none', 
          zIndex: 10,
          cursor: drawMode ? 'crosshair' : 'default'
        }}
          onClick={(e) => {
            if (!chartRef.current || !drawMode) return;
            const chartContainer = containerRef.current;
            if (!chartContainer) return;
            const chartRect = chartContainer.getBoundingClientRect();
            const x = e.clientX - chartRect.left;
            const y = e.clientY - chartRect.top;
            
            if (!tempLine) {
              setTempLine({ x, y });
            } else {
              setTrendlines([...trendlines, { x1: tempLine.x, y1: tempLine.y, x2: x, y2: y }]);
              setTempLine(null);
            }
          }}
        >
          {/* Semi-transparent overlay when drawing mode is active */}
          {drawMode && (
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(167,139,250,0.03)" />
          )}
          
          {/* Render trendlines */}
          {trendlines.map((line, i) => (
            <line key={`tl-${i}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
              stroke="#ffd700" strokeWidth={2} strokeDasharray="4 2" />
          ))}
          {tempLine && (
            <circle cx={tempLine.x} cy={tempLine.y} r={4} fill="#ffd700" />
          )}
        </svg>
      </div>
    </div>
  )
};

export default TrendChart;
