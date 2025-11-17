// TradingView UDF-compatible datafeed proxy (Polygon-backed with mock fallback)
// Run: npm run tv:server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8081;

const POLYGON_KEY = process.env.POLYGON_API_KEY || process.env.REACT_APP_POLYGON_API_KEY;

// Time sync utilities
function getCurrentETTimestamp() {
  const now = new Date();
  const etString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const etDate = new Date(etString);
  return Math.floor(etDate.getTime() / 1000);
}

function calculateRealtimeOffset(timestamps) {
  if (!timestamps || timestamps.length === 0) return 0;
  const nowET = getCurrentETTimestamp();
  const latestDataPoint = Math.max(...timestamps);
  const targetTime = nowET - (24 * 60 * 60); // 24 hours ago
  return targetTime - latestDataPoint;
}

// Resolution mapping
function mapResolution(resolution) {
  switch (resolution) {
    case '1': return { multiplier: 1, timespan: 'minute' };
    case '3': return { multiplier: 3, timespan: 'minute' };
    case '5': return { multiplier: 5, timespan: 'minute' };
    case '15': return { multiplier: 15, timespan: 'minute' };
    case '30': return { multiplier: 30, timespan: 'minute' };
    case '60': return { multiplier: 1, timespan: 'hour' };
    case '240': return { multiplier: 4, timespan: 'hour' };
    case 'D': return { multiplier: 1, timespan: 'day' };
    default: return { multiplier: 5, timespan: 'minute' };
  }
}

// Mock fallback generator (used if Polygon unavailable or empty response)
function mockHistory(from, to, start = 150) {
  const out = { s: 'ok', t: [], o: [], h: [], l: [], c: [], v: [] };
  let ts = from;
  let price = start;
  while (ts <= to) {
    const change = (Math.random() - 0.5) * 2;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 0.5;
    const low = Math.min(open, close) - Math.random() * 0.5;
    out.t.push(ts);
    out.o.push(+open.toFixed(2));
    out.h.push(+high.toFixed(2));
    out.l.push(+low.toFixed(2));
    out.c.push(+close.toFixed(2));
    out.v.push(Math.floor(Math.random() * 1000000));
    price = close;
    ts += 60; // 1-min steps
  }
  // Shift timestamps to appear real-time (24 hours offset)
  if (out.t.length > 0) {
    const offset = calculateRealtimeOffset(out.t);
    out.t = out.t.map(t => t + offset);
  }
  return out;
}

// /time endpoint
app.get('/api/tv/time', (_req, res) => {
  res.send(String(getCurrentETTimestamp()));
});

// /symbols endpoint
app.get('/api/tv/symbols', (req, res) => {
  const raw = req.query.symbol || 'AAPL';
  const symbol = raw.includes(':') ? raw.split(':')[1] : raw;
  res.json({
    name: symbol,
    ticker: symbol,
    description: symbol,
    type: 'stock',
    session: '0930-1600',
    exchange: 'NYSE',
    listed_exchange: 'NYSE',
    timezone: 'America/New_York',
    minmov: 1,
    pricescale: 100,
    has_intraday: true,
    supported_resolutions: ['1','3','5','15','30','60','240','D'],
    volume_precision: 0,
    data_status: 'streaming',
  });
});

// /history endpoint (Polygon backed)
app.get('/api/tv/history', async (req, res) => {
  try {
    const { symbol = 'AAPL', resolution = '5', from, to } = req.query;
    const fromSec = parseInt(from || String(Math.floor(Date.now()/1000 - 3600*24)), 10);
    const toSec = parseInt(to || String(Math.floor(Date.now()/1000)), 10);
    const { multiplier, timespan } = mapResolution(resolution);
    // Prepare Polygon request if key exists
    let result;
    if (POLYGON_KEY) {
      const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
      const fromDate = new Date(fromSec * 1000).toISOString().slice(0,10);
      const toDate = new Date(toSec * 1000).toISOString().slice(0,10);
      const url = `https://api.polygon.io/v2/aggs/ticker/${cleanSymbol}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=5000&apiKey=${POLYGON_KEY}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Polygon error ${r.status}`);
      const json = await r.json();
      if (json && Array.isArray(json.results) && json.results.length) {
        const out = { s: 'ok', t: [], o: [], h: [], l: [], c: [], v: [] };
        for (const bar of json.results) {
          out.t.push(Math.floor(bar.t / 1000)); // ms -> s
          out.o.push(bar.o);
          out.h.push(bar.h);
          out.l.push(bar.l);
          out.c.push(bar.c);
          out.v.push(bar.v);
        }
        // Shift timestamps to appear real-time (24 hours offset)
        if (out.t.length > 0) {
          const offset = calculateRealtimeOffset(out.t);
          out.t = out.t.map(t => t + offset);
        }
        result = out;
      } else {
        result = { s: 'no_data' };
      }
    } else {
      result = mockHistory(fromSec, toSec);
    }
    // Fallback to mock if no_data
    if (result.s === 'no_data') {
      result = mockHistory(fromSec, toSec);
    }
    res.json(result);
  } catch (err) {
    console.error('History error', err);
    res.json({ s: 'error', errmsg: (err && err.message) || 'unknown' });
  }
});

app.listen(PORT, () => console.log(`TV datafeed server listening on ${PORT} (Polygon ${POLYGON_KEY ? 'enabled' : 'mock only'})`));
