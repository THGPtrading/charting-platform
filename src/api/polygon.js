// Basic Polygon.io fetch using free API key

const API_KEY = '63f1695e-c099-4934-90d4-bb352370fbb5';

export const fetchPolygonData = async (ticker = 'AAPL') => {
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/2023-01-01/2023-01-01?apiKey=${API_KEY}`;
  const response = await fetch(url);
  const json = await response.json();

  // 🔧 Normalize for Lightweight Charts
  return json.results.map(candle => ({
    time: candle.t / 1000,
    value: candle.c,
  }));
};
