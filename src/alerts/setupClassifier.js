import { generateTags } from './tagGenerator';

export const classifySetup = (alert) => {
  const { source, priceAction, volume, timeBlock, dashboard, price } = alert;

  const tags = [];

  if (priceAction === 'gap-retest' && volume > 100000) {
    tags.push('scalp-ready');
  }

  if (priceAction === 'breakout' && volume > 250000) {
    tags.push('momentum-confirmed');
  }

  if (priceAction === 'zone-retest' && timeBlock === 'midday') {
    tags.push('swing-zone');
  }

  const classified = {
    ...alert,
    iccTags: tags,
    classifiedAt: new Date().toISOString(),
  };

  classified.tradervueTags = generateTags(classified);

  return classified;
};
