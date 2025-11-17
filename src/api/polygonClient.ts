// src/api/polygonClient.ts

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
  if (!API_KEY) {
    console.error("Missing REACT_APP_POLYGON_API_KEY environment variable");
    return [];
  }

  const url = `${BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error("Polygon API error:", response.statusText);
    return [];
  }

  const json = await response.json();
  const results: PolygonCandle[] = json.results || [];

  return results.map(candle => ({
    time: Math.floor(candle.t / 1000), // convert ms → seconds
    open: candle.o,
    high: candle.h,
    low: candle.l,
    close: candle.c,
    volume: candle.v,
  }));
};
