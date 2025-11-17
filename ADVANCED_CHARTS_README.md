# TradingView Advanced Charts – Integration Plan and Next Steps

This document captures the plan and required steps to enable TradingView Advanced Charts in the THGP Charting Platform once licensing is approved. It also summarizes the related ChartEye and TrendSpider integrations.

## Current State
- Dashboards (`TrendEdge`, `MomentumEdge`, `WarriorEdge`) render charts via `ChartHost`.
  - `ChartHost` uses TradingView when `REACT_APP_USE_TV=1`, otherwise falls back to `TrendChart` (lightweight-charts v5).
- A minimal UDF-compatible datafeed is scaffolded:
  - Client: `src/integrations/tvDatafeedClient.ts`
  - Server: `tools/tv-datafeed-server.js` (Express, mock OHLCV)
  - `TradingViewChart.tsx` is set to use `http://localhost:8081/api/tv` for the datafeed.
- Strategy schema + seeds available in `src/types/Strategy.ts` and `src/config/strategies.ts`.
- ChartEye stub engine available in `src/integrations/charteye.ts` and wired to dashboards (signals appear in Feed/Review).

## What You’ll Provide
1. TradingView Advanced Charts (Charting Library) license and library bundle (`/charting_library` directory).
2. Decision on datafeed source:
   - Keep mock server temporarily, or
   - Implement a UDF proxy backed by Polygon (recommended for parity with existing data) or other provider.

## Licensing
Reason for request (<= 140 chars):

"Embed Advanced Charts in internal dashboards to validate ChartEye signals and backtest strategies; no public redistribution."

## Enable TradingView Charts
1. Place the Charting Library under `public/charting_library/` or serve it from a CDN path you control.
2. Create or update `.env`:

```
REACT_APP_USE_TV=1
REACT_APP_TV_DATAFEED_URL=http://localhost:8081/api/tv
REACT_APP_POLYGON_API_KEY=your_key_here
POLYGON_API_KEY=your_key_here # optional server-side override
```

3. Start the UDF server (Polygon-backed; falls back to mock if key missing):

```bash
npm run tv:server
```

4. Start the app in another terminal:

```bash
npm start
```

The dashboards now render TradingView charts within `ChartHost`. If neither the widget script nor the Charting Library is present, an overlay appears with load instructions.

### Production (Vercel Functions)
- Serverless routes are deployed under `/api/tv/*`:
  - `/api/tv/time`, `/api/tv/symbols`, `/api/tv/history`
- Set env vars in Vercel Project Settings:
  - `POLYGON_API_KEY` (server only), and optionally `REACT_APP_TV_DATAFEED_URL=https://app.thgptrading.com/api/tv`
- `vercel.json` excludes `/api/*` from SPA rewrites so API routes work in production.

## Datafeed Details (UDF → Polygon)
`tools/tv-datafeed-server.js` now maps resolutions to Polygon ranges:

| UDF | Polygon Range |
|-----|---------------|
| 1   | 1 minute      |
| 3   | 3 minute      |
| 5   | 5 minute      |
| 15  | 15 minute     |
| 30  | 30 minute     |
| 60  | 1 hour        |
| 240 | 4 hour        |
| D   | 1 day         |

If `POLYGON_API_KEY` (or `REACT_APP_POLYGON_API_KEY`) is set, `/history` returns live aggregates. Otherwise it returns deterministic mock data and still responds `s: ok` so the widget renders. Empty Polygon responses fall back to mock bars.

Response format (UDF spec):
```
{ s: 'ok', t: [unix_sec], o: [], h: [], l: [], c: [], v: [] }
```
Errors return `{ s: 'error', errmsg }`. No data returns mock fallback.

## ChartEye Integration
- Strategies are selectable in each dashboard header; signals are computed from the 5m pane and displayed in Feed/Review.
- Replace the stub in `src/integrations/charteye.ts` with the licensed ChartEye SDK when available.
- To expand beyond 5m, call `scanMany` for the active pane’s timeframe or all panes.

## TrendSpider Export
- Use `exportSignalsToTrendSpider(signals)` from `src/integrations/trendspider.ts` to produce a JSON payload of current signals.
- Later, adapt to TrendSpider’s preferred import format/API for backtests or watchlists.

## Next Steps Checklist
- [ ] Upload `charting_library/` and confirm it loads in the browser (no overlay warning).
- [ ] Decide on UDF data source (Polygon or other) and connect `/history` to live data.
- [ ] Add authentication/authorization if required by the TradingView license terms.
- [ ] Expand ChartEye scan coverage to additional panes/timeframes and add scoring.
- [ ] Add an Export button to dump current signals via TrendSpider connector.

## Notes
- Advanced Charts requires a valid license; do not commit the library to any public repo.
- For production, serve the UDF datafeed over HTTPS on the same domain as the app (to avoid mixed-content/CORS issues) and update `TradingViewChart.tsx` to point at that base URL.
