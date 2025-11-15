// src/api/polygonClient.ts

// Polygon.io free API key from environment
const API_KEY: string | undefined = process.env.REACT_APP_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

export interface PolygonCandle {
  t: number; // timestamp in ms
  c: number; // close price
  o?: number;
  h?: number;
  l?: number;
  v?: number;
}

export interface ChartPoint {
  time: number; // unix timestamp in seconds
  value: number; // close price
}

/**
 * Fetch normalized Polygon.io data for Lightweight Charts.
 * @param ticker Stock symbol (default: AAPL)
 * @param multiplier Candle size multiplier (default: 1)
 * @param timespan Timespan unit (default: 'minute')
 * @param from Start date (YYYY-MM-DD)
 * @param to End date (YYYY-MM-DD)
 */
export const fetchPolygonData = async (
  ticker: string = 'AAPL',
  multiplier: number = 1,
  timespan: string = 'minute',
  from: string,
  to: string
): Promise<ChartPoint[]> => {
  if (!API_KEY) {
    console.error('Missing REACT_APP_POLYGON_API_KEY environment variable');
    return [];
  }

  const url = `${BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error('Polygon API error:', response.statusText);
    return [];
  }

  const json = await response.json();
  const results: PolygonCandle[] = json.results || [];

  return results.map(candle => ({
    time: Math.floor(candle.t / 1000), // convert ms → seconds
    value: candle.c,
  }));
};