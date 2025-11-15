import type { ICCSetup } from '../types/ICC';

export const generateTags = (setup: ICCSetup): string[] => {
  const tags: string[] = [];

  if (setup.dashboard === 'WarriorEdge') tags.push('scalp');
  if (setup.dashboard === 'MomentumEdge') tags.push('momentum');
  if (setup.dashboard === 'TrendEdge') tags.push('swing');

  if (setup.iccTags) tags.push(...setup.iccTags);

  return tags;
};