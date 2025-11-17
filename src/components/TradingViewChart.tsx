import React, { useEffect, useRef } from 'react';
import { createUDFDatafeed } from '../integrations/tvDatafeedClient';

export type TVTimeframe = '1' | '5' | '15' | '60' | '240' | 'D';

function mapTimeframe(tf: string): TVTimeframe {
  switch (tf) {
    case '1 Min': return '1';
    case '5 Min': return '5';
    case '10 Min': return '5';
    case '15 Min': return '15';
    case '30 Min': return '15';
    case '1 Hr': return '60';
    case '4 Hr': return '240';
    case 'Daily': return 'D';
    default: return '5';
  }
}

interface TradingViewChartProps {
  symbol: string; // e.g., 'NASDAQ:AAPL'
  timeframe: '1 Min'|'5 Min'|'10 Min'|'15 Min'|'30 Min'|'1 Hr'|'4 Hr'|'Daily';
  autosize?: boolean;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, timeframe, autosize = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const tv = (window as any).TradingView;
    if (!containerRef.current) return;

    // Destroy previous widget
    if (widgetRef.current?.remove) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
    }

    if (tv?.widget) {
      const interval = mapTimeframe(timeframe);
      const opts: any = {
        symbol,
        interval,
        container_id: containerRef.current.id,
        autosize,
        theme: 'dark',
        timezone: 'America/New_York',
        hide_top_toolbar: false,
        hide_legend: false,
        allow_symbol_change: true,
        studies: [],
      };
      widgetRef.current = new tv.widget(opts);
      return () => { try { widgetRef.current?.remove?.(); } catch {} };
    }

    // Advanced Charts (Charting Library) path (requires license & local library files)
    const cl = (window as any).TradingView?.ChartingLibraryWidget || (window as any).ChartingLibraryWidget;
    if (cl && containerRef.current) {
      const interval = mapTimeframe(timeframe);
      widgetRef.current = new cl({
        symbol,
        interval,
        container: containerRef.current,
        datafeed: createUDFDatafeed('http://localhost:8081/api/tv'),
        library_path: '/charting_library/', // requires hosted library files
        timezone: 'America/New_York',
        theme: 'Dark',
        autosize,
      });
      return () => { try { widgetRef.current?.remove?.(); } catch {} };
    }
  }, [symbol, timeframe, autosize]);

  const id = React.useMemo(() => `tv-container-${Math.random().toString(36).slice(2)}`, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div id={id} ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!((window as any).TradingView?.widget || (window as any).TradingView?.ChartingLibraryWidget || (window as any).ChartingLibraryWidget) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e0e0e0', background: 'rgba(0,0,0,0.2)', border: '1px solid #444' }}>
          <div style={{ textAlign: 'center', maxWidth: 520, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>TradingView Advanced Charts not loaded</div>
            <div style={{ fontSize: 12 }}>
              Provide TradingView widget or Charting Library on window to render here.<br/>
              Options:<br/>
              - Include script: <code>https://s3.tradingview.com/tv.js</code> (widget)
              <br/>
              - Or host <code>/charting_library/</code> and load Charting Library (license required)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingViewChart;
