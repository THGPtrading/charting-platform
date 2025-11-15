// src/api/apiClient.ts
import type { ICCSetup } from '../types/ICC';

/**
 * Fetch daily ICC setups from your backend service.
 * Replace 'https://your-api.com/setups/daily' with your real endpoint.
 */
export const fetchDailySetups = async (): Promise<ICCSetup[]> => {
  try {
    const response = await fetch('https://your-api.com/setups/daily');
    if (!response.ok) throw new Error('Failed to fetch setups');
    const data = await response.json();
    return (data.setups as ICCSetup[]) || [];
  } catch (error) {
    console.error('API error:', error);
    return [];
  }
};