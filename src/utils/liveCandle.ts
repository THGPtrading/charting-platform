// src/utils/liveCandle.ts
import { getCurrentETTimestamp } from './timeSync';

export interface LiveCandleState {
  baseCandle: { time: number; open: number; high: number; low: number; close: number; volume?: number };
  startTime: number; // When the simulation started (browser time)
  etStartTime: number; // The ET timestamp when we started
}

/**
 * Calculate what the "current" candle should look like based on simulated real-time progression.
 * Animates price movement within a realistic range of the base close price.
 * 
 * @param state - The live candle state tracking the base candle and start time
 * @param intervalMinutes - The timeframe interval (1, 5, 15, 60, etc.)
 * @returns Updated candle with simulated live price movement
 */
export function updateLiveCandle(
  state: LiveCandleState,
  intervalMinutes: number
): { time: number; open: number; high: number; low: number; close: number; volume?: number } {
  const now = Date.now();
  const elapsed = (now - state.startTime) / 1000; // seconds elapsed in browser time
  const intervalSeconds = intervalMinutes * 60;
  
  // Calculate how far we are through the current candle interval (0-1)
  const progress = Math.min((elapsed % intervalSeconds) / intervalSeconds, 0.99);
  
  // Keep the same timestamp as the base candle - we're updating it, not creating a new one
  const candleTime = state.baseCandle.time;
  
  // Animate the close price with a sine wave for smooth, realistic movement
  // Amplitude decreases as we get closer to interval end to simulate price settling
  const volatility = state.baseCandle.close * 0.002; // 0.2% max movement
  const priceWave = Math.sin(elapsed * 0.5) * volatility * (1 - progress * 0.5);
  const animatedClose = state.baseCandle.close + priceWave;
  
  // Update high/low to include the animated price
  const currentHigh = Math.max(state.baseCandle.high, animatedClose);
  const currentLow = Math.min(state.baseCandle.low, animatedClose);
  
  // Simulate volume accumulation
  const baseVolume = state.baseCandle.volume || 100000;
  const currentVolume = Math.floor(baseVolume * progress);
  
  return {
    time: candleTime,
    open: state.baseCandle.open,
    high: currentHigh,
    low: currentLow,
    close: animatedClose,
    volume: currentVolume,
  };
}

/**
 * Initialize a live candle state from the most recent historical candle
 */
export function initializeLiveCandle(
  lastCandle: { time: number; open: number; high: number; low: number; close: number; volume?: number }
): LiveCandleState {
  return {
    baseCandle: { ...lastCandle },
    startTime: Date.now(),
    etStartTime: getCurrentETTimestamp(),
  };
}
