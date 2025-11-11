// Tags incoming alerts with ICC logic before routing

export const classifySetup = (alert) => {
  const { source, priceAction, volume, timeBlock } = alert;

  const tags = [];

  // 🔍 ICC Logic: Structure + Volume + Time
  if (priceAction === 'gap-retest' && volume > 100000) {
    tags.push('scalp-ready');
  }

  if (priceAction === 'breakout' && volume > 250000) {
    tags.push('momentum-confirmed');
  }

  if (priceAction === 'zone-retest' && timeBlock === 'midday') {
    tags.push('swing-zone');
  }

  // 🔧 Future: Add ChartEye AI overlays, TrendSpider zones, bot signals

  return {
    ...alert,
    iccTags: tags,
    classifiedAt: new Date().toISOString(),
  };
};
