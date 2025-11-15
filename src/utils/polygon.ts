// src/utils/polygon.ts
const API_KEY = process.env.REACT_APP_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

export async function fetchAggregates(symbol: string, multiplier: number, timespan: string, from: string, to: string) {
  const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Polygon API error: ${res.statusText}`);
  return res.json();
}

export async function fetchLastTrade(symbol: string) {
  const url = `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Polygon API error: ${res.statusText}`);
  return res.json();
}