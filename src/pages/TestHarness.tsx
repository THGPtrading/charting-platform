// src/pages/TestHarness.tsx
import React, { useState } from "react";
import { testPolygon } from "../api/testPolygon";

const TestHarness: React.FC = () => {
  const [tickers, setTickers] = useState<string>("NVDA,MSFT,TSLA");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const tickerList = tickers.split(",").map(t => t.trim().toUpperCase());
      const dataPromises = tickerList.map(t => testPolygon(t));
      const allData = await Promise.all(dataPromises);
      setResults(allData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Polygon API Multi‑Ticker Test</h2>

      <input
        type="text"
        value={tickers}
        onChange={e => setTickers(e.target.value)}
        placeholder="Enter tickers (comma separated)"
        style={{ width: "300px", marginRight: "10px" }}
      />
      <button onClick={handleFetch}>Fetch Data</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {results.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Open</th>
              <th>Close</th>
              <th>High</th>
              <th>Low</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, idx) =>
              res?.results?.map((row: any, i: number) => (
                <tr key={`${idx}-${i}`}>
                  <td>{res.ticker}</td>
                  <td>{row.o}</td>
                  <td>{row.c}</td>
                  <td>{row.h}</td>
                  <td>{row.l}</td>
                  <td>{row.v}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TestHarness;