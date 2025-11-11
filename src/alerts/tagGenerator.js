// Generates TraderVue-compatible tags from ICC setup object

export const generateTags = (setup) => {
  const tags = [];

  // ICC tags
  if (setup.iccTags && setup.iccTags.length > 0) {
    setup.iccTags.forEach(tag => tags.push(`icc:${tag}`));
  }

  // Source (ChartEye, TrendSpider, etc.)
  if (setup.source) {
    tags.push(`source:${setup.source}`);
  }

  // Dashboard (Openedge, Swinggrid, etc.)
  if (setup.dashboard) {
    tags.push(`dash:${setup.dashboard}`);
  }

  // Time block (open, midday, close)
  if (setup.timeBlock) {
    tags.push(`time:${setup.timeBlock}`);
  }

  // Outcome (manual, bot, pending)
  if (setup.outcome) {
    tags.push(`outcome:${setup.outcome}`);
  }

  return tags.join(' ');
};
