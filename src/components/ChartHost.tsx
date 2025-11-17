import React from 'react';
import TrendChart, { TrendChartProps } from './TrendChart';
import TradingViewChart from './TradingViewChart';

interface ChartHostProps extends TrendChartProps {
  symbol?: string; // for TradingView mode compatibility
}

const useTV = () => (process.env.REACT_APP_USE_TV === '1' || process.env.REACT_APP_USE_TV === 'true');

const ChartHost: React.FC<ChartHostProps> = (props) => {
  const tvMode = useTV();
  if (tvMode) {
    if (!props.symbol) {
      return <div style={{ padding: 12, color: '#e0e0e0', border: '1px solid #444' }}>TradingView mode enabled but no symbol provided.</div>;
    }
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <TradingViewChart symbol={props.symbol} timeframe={props.timeframe} />
      </div>
    );
  }
  // Fallback to existing lightweight-charts implementation
  return <TrendChart {...props} />;
};

export default ChartHost;
