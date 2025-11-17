// src/api/polygonClient.ts

import { isMarketOpenNow } from "../utils/marketHours";
import { shiftCandlesToRealtime, getCurrentETTimestamp } from "../utils/timeSync";

const API_KEY: string | undefined = process.env.REACT_APP_POLYGON_API_KEY;
const BASE_URL = "https://api.polygon.io";

export interface PolygonCandle {
  t: number; // timestamp in ms
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

export interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Simple localStorage cache for last-good candles per (ticker, multiplier, timespan)
const lastFetchCachedByKey = new Map<string, boolean>();
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function cacheKey(ticker: string, multiplier: number, timespan: string): string {
  return `candles:${ticker}:${multiplier}${timespan}`;
}

function saveCache(key: string, candles: ChartCandle[]): void {
  if (!isBrowser()) return;
  try {
    const payload = { ts: Date.now(), candles };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

function loadCache(key: string, maxAgeMs: number): ChartCandle[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.ts !== "number" || !Array.isArray(obj.candles)) return null;
    if (Date.now() - obj.ts > maxAgeMs) return null;
    return obj.candles as ChartCandle[];
  } catch {
    return null;
  }
}

// Map dropdown timeframe → multiplier + timespan
export function mapTimeframe(timeframe: string): { multiplier: number; timespan: string } {
  switch (timeframe) {
    case "1 Min": return { multiplier: 1, timespan: "minute" };
    case "5 Min": return { multiplier: 5, timespan: "minute" };
    case "10 Min": return { multiplier: 10, timespan: "minute" };
    case "15 Min": return { multiplier: 15, timespan: "minute" };
    case "30 Min": return { multiplier: 30, timespan: "minute" };
    case "1 Hr": return { multiplier: 60, timespan: "minute" };
    case "4 Hr": return { multiplier: 240, timespan: "minute" };
    case "Daily": return { multiplier: 1, timespan: "day" };
    default: return { multiplier: 1, timespan: "day" };
  }
}

/**
 * Fetch normalized Polygon.io OHLC data for candlestick charts.
 */
export const fetchPolygonCandles = async (
  ticker: string,
  multiplier: number,
  timespan: string,
  from: string,
  to: string
): Promise<ChartCandle[]> => {
  const key = cacheKey(ticker, multiplier, timespan);
  const maxAgeMin = parseInt(process.env.REACT_APP_CACHE_MAX_AGE_MIN || "1440", 10);
  const maxAgeMs = isNaN(maxAgeMin) ? 1440 * 60 * 1000 : maxAgeMin * 60 * 1000;

  const gate = process.env.REACT_APP_MARKET_HOURS_ONLY === "1" || process.env.REACT_APP_MARKET_HOURS_ONLY === "true";
  if (gate && !isMarketOpenNow()) {
    // Outside configured hours: serve cached snapshot if available
    const cached = loadCache(key, maxAgeMs);
    if (cached && cached.length) { lastFetchCachedByKey.set(key, true); return cached; }
    lastFetchCachedByKey.set(key, false);
    return [];
  }

  if (!API_KEY) {
    console.error("Missing REACT_APP_POLYGON_API_KEY environment variable");
    const cached = loadCache(key, maxAgeMs);
    if (cached && cached.length) { lastFetchCachedByKey.set(key, true); return cached; }
    lastFetchCachedByKey.set(key, false);
    return [];
  }

  const url = `${BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Polygon API error:", response.statusText);
      const cached = loadCache(key, maxAgeMs);
      if (cached && cached.length) { lastFetchCachedByKey.set(key, true); return cached; }
      lastFetchCachedByKey.set(key, false);
      return [];
    }

    const json = await response.json();
    const results: PolygonCandle[] = json.results || [];

    const out = results.map(candle => ({
      time: Math.floor(candle.t / 1000), // convert ms → seconds
      open: candle.o,
      high: candle.h,
      low: candle.l,
      close: candle.c,
      volume: candle.v,
    }));
    
    // Shift timestamps to appear real-time (synchronized to ET, 24 hours offset)
    const shifted = shiftCandlesToRealtime(out);
    
    // Log time sync for verification
    if (out.length > 0 && shifted.length > 0) {
      const originalLast = new Date(out[out.length - 1].time * 1000);
      const shiftedLast = new Date(shifted[shifted.length - 1].time * 1000);
      const currentET = new Date(getCurrentETTimestamp() * 1000);
      console.log(`[Time Sync ${ticker}] Original: ${originalLast.toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
      console.log(`[Time Sync ${ticker}] Shifted:  ${shiftedLast.toLocaleString('en-US', { timeZone: 'America/New_York' })} (should be ~24hrs ago)`);
      console.log(`[Time Sync ${ticker}] Current:  ${currentET.toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
    }
    
    if (shifted.length) { saveCache(key, shifted); lastFetchCachedByKey.set(key, false); }
    else lastFetchCachedByKey.set(key, false);
    return shifted;
  } catch (err) {
    console.error("Polygon fetch failed:", err);
    const cached = loadCache(key, maxAgeMs);
    if (cached && cached.length) { lastFetchCachedByKey.set(key, true); return cached; }
    lastFetchCachedByKey.set(key, false);
    return [];
  }
};

export function wasLastFetchCached(ticker: string, multiplier: number, timespan: string): boolean {
  const key = cacheKey(ticker, multiplier, timespan);
  return !!lastFetchCachedByKey.get(key);
}
