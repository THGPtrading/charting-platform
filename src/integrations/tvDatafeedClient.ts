// Minimal UDF-compatible datafeed client for TradingView Charting Library
// Docs: https://tradingview.com/rest-api-spec/

export function createUDFDatafeed(baseUrl: string) {
  const cfg = { supports_search: true, supports_group_request: false, supported_resolutions: ['1','3','5','15','30','60','240','D'] };

  return {
    onReady: (cb: any) => setTimeout(() => cb(cfg), 0),
    resolveSymbol: (symbol: string, onResolve: any, onError: any) => {
      fetch(`${baseUrl}/symbols?symbol=${encodeURIComponent(symbol)}`)
        .then(r => r.json()).then((data) => onResolve(data))
        .catch(onError);
    },
    getBars: (symbolInfo: any, resolution: string, from: number, to: number, onResult: any, onError: any) => {
      const url = `${baseUrl}/history?symbol=${encodeURIComponent(symbolInfo.ticker)}&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}`;
      fetch(url).then(r => r.json()).then((data) => {
        if (!data || data.s !== 'ok' || !data.t?.length) { onResult([], { noData: true }); return; }
        const bars = data.t.map((t: number, i: number) => ({ time: t * 1000, open: data.o[i], high: data.h[i], low: data.l[i], close: data.c[i], volume: data.v?.[i] }))
        onResult(bars, { noData: false });
      }).catch(onError);
    },
    subscribeBars: (_symbolInfo: any, _resolution: string, _onTick: any, _uid: string, _resetCache: any) => {},
    unsubscribeBars: (_uid: string) => {},
  };
}
