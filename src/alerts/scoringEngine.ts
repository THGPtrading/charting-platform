import type { ICCSetup } from '../types/ICC';

interface ScoredResult {
  outcome: 'Scored' | 'Pending';
  followThrough: number | null;
  maxGain: number | null;
  maxLoss: number | null;
}

export const autoScoreSetup = (setup: ICCSetup): ScoredResult => {
  if (setup.traded && setup.priceAtTrigger) {
    const gain = setup.priceAtTrigger * 1.03;
    const loss = setup.priceAtTrigger * 0.97;

    return {
      outcome: 'Scored',
      followThrough: gain - setup.priceAtTrigger,
      maxGain: gain,
      maxLoss: setup.priceAtTrigger - loss,
    };
  }

  return {
    outcome: 'Pending',
    followThrough: null,
    maxGain: null,
    maxLoss: null,
  };
};