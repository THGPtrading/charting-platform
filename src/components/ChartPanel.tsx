import React from "react";

interface ChartPanelProps {
  ticker: string;
  timeframe: string;
  review: string;
  onTickerChange: (ticker: string) => void;
  onTimeframeChange: (frame: string) => void;
  onReviewChange: (text: string) => void;
  onLoadSetup: () => void;
}

const ChartPanel: React.FC<ChartPanelProps> = ({
  ticker,
  timeframe,
  review,
  onTickerChange,
  onTimeframeChange,
  onReviewChange,
  onLoadSetup,
}) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", margin: "10px", width: "48%" }}>
      <h3>Chart Panel</h3>

      <input
        type="text"
        value={ticker}
        onChange={e => onTickerChange(e.target.value.toUpperCase())}
        placeholder="Enter ticker"
        style={{ marginRight: "10px" }}
      />

      <select value={timeframe} onChange={e => onTimeframeChange(e.target.value)}>
        <option value="1m">1 Min</option>
        <option value="5m">5 Min</option>
        <option value="10m">10 Min</option>
        <option value="15m">15 Min</option>
        <option value="1h">1 Hour</option>
        <option value="4h">4 Hour</option>
        <option value="1d">Daily</option>
      </select>

      <button onClick={onLoadSetup} style={{ marginLeft: "10px" }}>Load Setup</button>

      <div style={{ marginTop: "15px" }}>
        <h4>Review Line</h4>
        <textarea
          value={review}
          onChange={e => onReviewChange(e.target.value)}
          placeholder="Document setup type, entry points, notes..."
          rows={3}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default ChartPanel;