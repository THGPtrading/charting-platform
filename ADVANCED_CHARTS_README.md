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
2. Start the UDF server (mock for now):

```bash
npm run tv:server
```

3. Enable TV mode:
- Create `.env` with:

```bash
REACT_APP_USE_TV=1
```

4. Start the app:

```bash
npm start
```

The dashboards will now render TradingView charts within `ChartHost`. If the library is not found, a helpful overlay appears in the chart container with instructions.

## Upgrading the Datafeed (UDF → Polygon)
Replace the mock history with a real UDF proxy backed by Polygon in `tools/tv-datafeed-server.js`:
- Map UDF `resolution` → Polygon `multiplier/timespan` (e.g., `1 → 1/minute`, `5 → 5/minute`, `60 → 1/hour`, `D → 1/day`).
- Implement `/history` by fetching from Polygon aggregates endpoints and transform to UDF JSON `{ s, t, o, h, l, c, v }`.
- Optionally implement `/search` and `/symbols` with richer metadata.
- Ensure CORS is permitted for `http://localhost:3000` during development.

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
