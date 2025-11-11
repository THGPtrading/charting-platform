export const generateTags = (setup) => {
  const tags = [];

  if (setup.iccTags && setup.iccTags.length > 0) {
    setup.iccTags.forEach(tag => tags.push(`icc:${tag}`));
  }

  if (setup.source) {
    tags.push(`source:${setup.source}`);
  }

  if (setup.dashboard) {
    tags.push(`dash:${setup.dashboard}`);
  }

  if (setup.timeBlock) {
    tags.push(`time:${setup.timeBlock}`);
  }

  if (setup.outcome) {
    tags.push(`outcome:${setup.outcome}`);
  }

  return tags.join(' ');
};
