// src/pages/WarriorEdge.tsx
import React, { useState, useEffect } from "react";
import ChartHost from "../components/ChartHost";
import ResizableGrid from "../components/ResizableGrid";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { lookupCompanyName } from "../utils/companyLookup";
import { fetchPolygonCandles, mapTimeframe, ChartCandle, wasLastFetchCached } from "../api/polygonClient";
import { getCurrentETTimestamp } from "../utils/timeSync";
import { aggregateCandles } from "../utils/candleAggregation";

// Mock data generator for demo purposes when API is unavailable
function generateMockCandles(count: number, startPrice: number = 150): ChartCandle[] {
  const now = getCurrentETTimestamp() - (24 * 60 * 60); // ET time, 24 hours ago
  const out: ChartCandle[] = [];
  let price = startPrice;
  for (let i = count; i > 0; i--) {
    const time = now - i * 60; // 1 min intervals
    const change = (Math.random() - 0.5) * 2;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 0.5;
    const low = Math.min(open, close) - Math.random() * 0.5;
    out.push({ time, open, high, low, close, volume: Math.random() * 1000000 });
    price = close;
  }
  return out;
}

const WarriorEdge: React.FC = () => {
  const [ticker, setTicker] = useState("TSLA");
  const [companyName, setCompanyName] = useState(lookupCompanyName("TSLA"));

  const [timeframeDaily, setTimeframeDaily] = useState<"Daily">("Daily");
  const [timeframeHour, setTimeframeHour] = useState<"1 Hr">("1 Hr");
  const [timeframeFive, setTimeframeFive] = useState<"5 Min">("5 Min");
  const [timeframeFifteen, setTimeframeFifteen] = useState<"15 Min">("15 Min");

  // Fetch base 1-minute data once, then aggregate for all timeframes
  const [baseMinuteData, setBaseMinuteData] = useState<ChartCandle[]>([]);
  const [cached, setCached] = useState(false);
  
  // Aggregated views derived from base data
  const dataDaily = React.useMemo(() => aggregateCandles(baseMinuteData, timeframeDaily), [baseMinuteData, timeframeDaily]);
  const dataHour = React.useMemo(() => aggregateCandles(baseMinuteData, timeframeHour), [baseMinuteData, timeframeHour]);
  const dataFive = React.useMemo(() => aggregateCandles(baseMinuteData, timeframeFive), [baseMinuteData, timeframeFive]);
  const dataFifteen = React.useMemo(() => aggregateCandles(baseMinuteData, timeframeFifteen), [baseMinuteData, timeframeFifteen]);

  const [feedData, setFeedData] = useState<ChartCandle[]>([]);
  const [reviewData, setReviewData] = useState<ChartCandle[]>([]);

  const timeframeOptions = [
    "1 Min","5 Min","10 Min","15 Min","30 Min","1 Hr","4 Hr","Daily",
  ];

  const handleTickerChange = (value: string) => {
    const upper = value.toUpperCase();
    setTicker(upper);
    setCompanyName(lookupCompanyName(upper));
  };

  // Fetch base 1-minute data - all charts will derive from this
  useEffect(() => {
    const { multiplier, timespan } = mapTimeframe('1 Min');
    fetchPolygonCandles(ticker, multiplier, timespan, "2023-01-01", "2023-12-31")
      .then(candles => {
        setBaseMinuteData(candles && candles.length > 0 ? candles : generateMockCandles(2000, 150));
        setCached(wasLastFetchCached(ticker, multiplier, timespan));
      })
      .catch(() => { setBaseMinuteData(generateMockCandles(2000, 150)); setCached(false); });
  }, [ticker]);

  useEffect(() => {
    const { multiplier, timespan } = mapTimeframe("1 Min");
    fetchPolygonCandles(ticker, multiplier, timespan, "2023-11-01", "2023-11-15")
      .then((candles) => {
        const validCandles = candles && candles.length > 0 ? candles : generateMockCandles(200, 150);
        setFeedData(validCandles);
        setReviewData(validCandles);
      })
      .catch(() => {
        const mockData = generateMockCandles(200, 150);
        setFeedData(mockData);
        setReviewData(mockData);
      });
  }, [ticker]);

  const renderRows = (label: string, candles: ChartCandle[]) => {
    return candles.slice(0, 6).map((candle, i) => (
      <div key={i} onClick={() => {
        try { (window as any).__chartSync?.publishHighlight?.('warrioredge', candle.time as any); } catch {}
      }} style={{
        padding: "0.5rem",
        backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#2a2a2a",
        color: "#e0e0e0",
        cursor: "pointer",
      }}>
        {`${label} | O:${candle.open.toFixed(2)} H:${candle.high.toFixed(2)} L:${candle.low.toFixed(2)} C:${candle.close.toFixed(2)} | ${new Date(candle.time * 1000).toLocaleString()}`}
      </div>
    ));
  };

  // Strategy selector + signals (Warrior)
  const { strategies } = require("../config/strategies.ts");
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategies[2]?.id ?? strategies[0]?.id ?? "");
  const [signals, setSignals] = useState<any[]>([]);
  const mapTfToStrategyTf = (tf: any): any => {
    switch (tf as string) {
      case '1 Min': return '1m';
      case '5 Min': return '5m';
      case '10 Min': return '5m';
      case '15 Min': return '15m';
      case '30 Min': return '15m';
      case '1 Hr': return '1h';
      case '4 Hr': return '1h';
      case 'Daily': return '1D';
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const { ChartEyeStub, buildScanParams } = await import('../integrations/charteye');
        const { strategies } = await import('../config/strategies');
        const chosen = strategies.find((s: any) => s.id === selectedStrategyId) ?? strategies[0];
        const params = buildScanParams(ticker, mapTfToStrategyTf(timeframeFive) as any, dataFive as any);
        const sig = await ChartEyeStub.scan(params, chosen);
        setSignals(sig);
      } catch (e) {
        setSignals([]);
      }
    })();
  }, [ticker, timeframeFive, dataFive, selectedStrategyId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#121212", color: "#e0e0e0" }}>
      <h1 style={{ textAlign: "center", flexShrink: 0 }}>🛡️ THGP WarriorEdge Strategy</h1>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", flexShrink: 0 }}>
        <h2 style={{ marginRight: "1rem" }}>{companyName}</h2>
        <input
          type="text"
          value={ticker}
          onChange={(e) => handleTickerChange(e.target.value)}
          placeholder="Ticker"
          style={{
            padding: "0.5rem", fontSize: "1rem", width: "120px",
            backgroundColor: "#1e1e1e", color: "#e0e0e0",
            border: "1px solid #444", borderRadius: "4px",
          }}
        />
        <select value={selectedStrategyId} onChange={(e) => setSelectedStrategyId(e.target.value)} style={{ backgroundColor: '#1e1e1e', color: '#e0e0e0', border: '1px solid #444', padding: '0.4rem' }}>
          {strategies.map((s: any) => (<option key={s.id} value={s.id}>{s.name}</option>))}
        </select>
      </div>

      <div style={{ flex: 1, border: "1px solid #444", marginBottom: "1rem", minHeight: 0, marginLeft: "2rem", marginRight: "2rem" }}>
        <ResizableGrid
          topLeft={
            <div style={{ border: "2px solid #a78bfa", backgroundColor: "#1e1e1e", height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.5rem', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{timeframeDaily} Chart {cached && <span style={{fontSize:10, color:'#ccc'}}>(cached)</span>}</h3>
                  <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                    <span style={{ color: '#ffd700' }}>50MA</span>
                    <span style={{ color: '#1e90ff' }}>200MA</span>
                    <span style={{ color: '#00bcd4' }}>ATR</span>
                  </div>
                </div>
                <select value={timeframeDaily} onChange={(e) => setTimeframeDaily(e.target.value as typeof timeframeDaily)} style={{ backgroundColor: '#1e1e1e', color: '#e0e0e0', border: '1px solid #444' }}>
                  {timeframeOptions.map((tf) => (<option key={tf} value={tf}>{tf}</option>))}
                </select>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                <ErrorBoundary>
                  <ChartHost ticker={ticker} symbol={ticker} candles={dataDaily} timeframe={timeframeDaily} syncGroup="warrioredge" showVWAP={false} show50MA={true} show200MA={true} showVolume={true} rsiPeriods={[]} macdConfig={null} showATR={true} />
                </ErrorBoundary>
              </div>
            </div>
          }
          topRight={
            <div style={{ border: "2px solid #a78bfa", backgroundColor: "#1e1e1e", height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.5rem', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{timeframeHour} Chart {cached && <span style={{fontSize:10, color:'#ccc'}}>(cached)</span>}</h3>
                  <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                    <span style={{ color: '#6a0dad' }}>VWAP</span>
                    <span style={{ color: '#ffd700' }}>50MA</span>
                    <span style={{ color: '#9acd32' }}>RSI</span>
                    <span style={{ color: '#fff' }}>MACD</span>
                  </div>
                </div>
                <select value={timeframeHour} onChange={(e) => setTimeframeHour(e.target.value as typeof timeframeHour)} style={{ backgroundColor: '#1e1e1e', color: '#e0e0e0', border: '1px solid #444' }}>
                  {timeframeOptions.map((tf) => (<option key={tf} value={tf}>{tf}</option>))}
                </select>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                <ErrorBoundary>
                  <ChartHost ticker={ticker} symbol={ticker} candles={dataHour} timeframe={timeframeHour} syncGroup="warrioredge" showVWAP={true} show50MA={true} show200MA={false} showVolume={true} rsiPeriods={[7,14,21]} macdConfig={{ fast: 12, slow: 26, signal: 9 }} showATR={false} />
                </ErrorBoundary>
              </div>
            </div>
          }
          bottomLeft={
            <div style={{ border: "2px solid #a78bfa", backgroundColor: "#1e1e1e", height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.5rem', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{timeframeFive} Chart {cached && <span style={{fontSize:10, color:'#ccc'}}>(cached)</span>}</h3>
                  <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                    <span style={{ color: '#6a0dad' }}>VWAP</span>
                    <span style={{ color: '#9acd32' }}>RSI</span>
                    <span style={{ color: '#fff' }}>MACD 6-13-5</span>
                  </div>
                </div>
                <select value={timeframeFive} onChange={(e) => setTimeframeFive(e.target.value as typeof timeframeFive)} style={{ backgroundColor: '#1e1e1e', color: '#e0e0e0', border: '1px solid #444' }}>
                  {timeframeOptions.map((tf) => (<option key={tf} value={tf}>{tf}</option>))}
                </select>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                <ErrorBoundary>
                  <ChartHost ticker={ticker} symbol={ticker} candles={dataFive} timeframe={timeframeFive} syncGroup="warrioredge" showVWAP={true} show50MA={false} show200MA={false} showVolume={true} rsiPeriods={[7,14,21]} macdConfig={{ fast: 6, slow: 13, signal: 5 }} showATR={false} />
                </ErrorBoundary>
              </div>
            </div>
          }
          bottomRight={
            <div style={{ border: "2px solid #a78bfa", backgroundColor: "#1e1e1e", height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.5rem', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{timeframeFifteen} Chart {cached && <span style={{fontSize:10, color:'#ccc'}}>(cached)</span>}</h3>
                  <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                    <span style={{ color: '#6a0dad' }}>VWAP</span>
                    <span style={{ color: '#ffd700' }}>50MA</span>
                    <span style={{ color: '#9acd32' }}>RSI</span>
                    <span style={{ color: '#fff' }}>MACD</span>
                  </div>
                </div>
                <select value={timeframeFifteen} onChange={(e) => setTimeframeFifteen(e.target.value as typeof timeframeFifteen)} style={{ backgroundColor: '#1e1e1e', color: '#e0e0e0', border: '1px solid #444' }}>
                  {timeframeOptions.map((tf) => (<option key={tf} value={tf}>{tf}</option>))}
                </select>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                <ErrorBoundary>
                  <ChartHost ticker={ticker} symbol={ticker} candles={dataFifteen} timeframe={timeframeFifteen} syncGroup="warrioredge" showVWAP={true} show50MA={true} show200MA={false} showVolume={true} rsiPeriods={[7,14,21]} macdConfig={{ fast: 12, slow: 26, signal: 9 }} showATR={false} />
                </ErrorBoundary>
              </div>
            </div>
          }
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ border: "1px solid #444", backgroundColor: "#1e1e1e" }}>
          <h3 style={{ textAlign: "center", borderBottom: "1px solid #444", padding: "0.5rem", color: "#e0e0e0" }}>WarriorEdge Feed</h3>
          {signals.slice(0, 8).map((s, i) => (
            <div key={i} style={{ padding: '0.5rem', backgroundColor: i % 2 === 0 ? '#1e1e1e' : '#2a2a2a', color: '#e0e0e0' }}>
              {`Signal | ${s.strategyId} | ${s.direction} | ${new Date((s.time||0)*1000).toLocaleString()}`}
            </div>
          ))}
        </div>
        <div style={{ border: "1px solid #444", backgroundColor: "#1e1e1e" }}>
          <h3 style={{ textAlign: "center", borderBottom: "1px solid #444", padding: "0.5rem", color: "#e0e0e0" }}>WarriorEdge Review</h3>
          {signals.slice(0, 8).map((s, i) => (
            <div key={i} style={{ padding: '0.5rem', backgroundColor: i % 2 === 0 ? '#1e1e1e' : '#2a2a2a', color: '#e0e0e0' }}>
              {`Signal | ${s.strategyId} | ${s.direction} | ${new Date((s.time||0)*1000).toLocaleString()}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarriorEdge;
