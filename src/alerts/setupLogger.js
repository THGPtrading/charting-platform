const setupLog = [];

// Simulated DAS Pro trade log (replace with real integration later)
const dasTradeLog = [
  { symbol: 'AAPL', timestamp: '2025-11-11T09:32:00', price: 186.42 },
  { symbol: 'TSLA', timestamp: '2025-11-11T10:15:00', price: 238.90 },
];

export const logSetup = (setup) => {
  const timestamp = new Date().toISOString();
  const priceAtTrigger = setup.price || null;

  // Auto-tag as traded if DAS Pro shows a trade within 5 mins of setup
  const traded = dasTradeLog.some((trade) => {
    const setupTime = new Date(timestamp).getTime();
    const tradeTime = new Date(trade.timestamp).getTime();
    const timeDiff = Math.abs(tradeTime - setupTime);
    return (
      trade.symbol === setup.symbol &&
      timeDiff <= 5 * 60 * 1000 // 5 minutes
    );
  });

  setupLog.push({
    ...setup,
    timestamp,
    priceAtTrigger,
    traded,
    outcome: null, // to be manually tagged later
    followThrough: null, // optional future scoring
    maxGain: null,
    maxLoss: null,
  });
};

export const getSetupLog = () => {
  return setupLog;
};

// Export to CSV
export const exportSetupLogCSV = () => {
  const headers = [
    'timestamp',
    'symbol',
    'source',
    'dashboard',
    'iccTags',
    'tradervueTags',
    'priceAtTrigger',
    'traded',
    'outcome',
    'followThrough',
    'maxGain',
    'maxLoss',
  ];

  const rows = setupLog.map((setup) =>
    headers.map((key) => {
      const value = setup[key];
      if (Array.isArray(value)) return `"${value.join(',')}"`;
      return `"${value !== null && value !== undefined ? value : ''}"`;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};
