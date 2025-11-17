// Simple TradingView UDF-compatible datafeed proxy with mock bars
// Run: npm run tv:server
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8081;

// Helper: mock OHLCV generator
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
    ts += 60; // 1-min steps default
  }
  return out;
}

// /time endpoint (optional)
app.get('/api/tv/time', (_req, res) => {
  res.send(String(Math.floor(Date.now() / 1000)));
});

// /symbols
app.get('/api/tv/symbols', (req, res) => {
  const symbol = req.query.symbol || 'AAPL';
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

// /history
app.get('/api/tv/history', async (req, res) => {
  const { symbol = 'AAPL', resolution = '5', from, to } = req.query;
  const fromTs = parseInt(from || String(Math.floor(Date.now()/1000 - 3600*24)), 10);
  const toTs = parseInt(to || String(Math.floor(Date.now()/1000)), 10);
  // TODO: Replace with Polygon-backed history if desired
  const data = mockHistory(fromTs, toTs);
  res.json(data);
});

app.listen(PORT, () => console.log(`TV datafeed server listening on ${PORT}`));
