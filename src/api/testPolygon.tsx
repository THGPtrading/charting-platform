// api/testPolygon.ts
const apiKey = process.env.REACT_APP_POLYGON_API_KEY;

export async function testPolygon(ticker: string = "NVDA") {
  try {
    const url = `/v2/aggs/ticker/${ticker}/prev?apiKey=${apiKey}`;
    console.log("Fetching from:", url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log(`Polygon API result for ${ticker}:`, data);
    return data;
  } catch (error: any) {
    console.error(`Polygon API error for ${ticker}:`, error);
    return { error: String(error) };
  }
}