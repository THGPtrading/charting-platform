import { logSetup } from './setupLogger';
import type { ICCSetup } from '../types/ICC';

export const injectLiveSetup = (setup: Partial<ICCSetup>): void => {
  logSetup({
    ...setup,
    timestamp: new Date().toISOString(),
    outcome: 'Pending',
    bot: 'LiveBot',
  } as ICCSetup);
};