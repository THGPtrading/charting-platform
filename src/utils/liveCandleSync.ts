// src/utils/liveCandleSync.ts
import { getCurrentETTimestamp } from './timeSync';

export interface LiveCandleState {
  baseCandle: { time: number; open: number; high: number; low: number; close: number; volume?: number };
  startTime: number; // When the simulation started (browser time)
  etStartTime: number; // The ET timestamp when we started
}

/**
 * Global synchronized state for live candle animation.
 * All charts for the same ticker share the same animation state.
 */
class LiveCandleSyncManager {
  private states = new Map<string, LiveCandleState>();
  private listeners = new Map<string, Set<() => void>>();
  private animationFrame: number | null = null;
  private lastUpdate = 0;
  private updateInterval = 500; // 500ms updates (2 fps)

  /**
   * Get or initialize the live candle state for a ticker.
   * Uses the provided last candle if state doesn't exist yet.
   */
  getState(
    ticker: string,
    lastCandle: { time: number; open: number; high: number; low: number; close: number; volume?: number }
  ): LiveCandleState {
    if (!this.states.has(ticker)) {
      this.states.set(ticker, {
        baseCandle: { ...lastCandle },
        startTime: Date.now(),
        etStartTime: getCurrentETTimestamp(),
      });
    }
    return this.states.get(ticker)!;
  }

  /**
   * Update the base candle for a ticker (when new data arrives or ticker changes)
   */
  updateBaseCandle(
    ticker: string,
    lastCandle: { time: number; open: number; high: number; low: number; close: number; volume?: number }
  ): void {
    this.states.set(ticker, {
      baseCandle: { ...lastCandle },
      startTime: Date.now(),
      etStartTime: getCurrentETTimestamp(),
    });
    this.notifyListeners(ticker);
  }

  /**
   * Subscribe to updates for a specific ticker
   */
  subscribe(ticker: string, callback: () => void): () => void {
    if (!this.listeners.has(ticker)) {
      this.listeners.set(ticker, new Set());
    }
    this.listeners.get(ticker)!.add(callback);

    // Start animation loop if not running
    if (!this.animationFrame) {
      this.startAnimation();
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(ticker);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(ticker);
        }
      }
      // Stop animation if no more listeners
      if (this.listeners.size === 0 && this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    };
  }

  /**
   * Calculate the current animated candle for a ticker
   */
  getCurrentCandle(
    ticker: string,
    intervalMinutes: number
  ): { time: number; open: number; high: number; low: number; close: number; volume?: number } | null {
    const state = this.states.get(ticker);
    if (!state) return null;

    const now = Date.now();
    const elapsed = (now - state.startTime) / 1000; // seconds elapsed
    const intervalSeconds = intervalMinutes * 60;
    
    // Calculate progress through current candle (0-1)
    const progress = Math.min((elapsed % intervalSeconds) / intervalSeconds, 0.99);
    
    // Use the same timestamp as base candle (we're updating it, not creating new)
    const candleTime = state.baseCandle.time;
    
    // Synchronized sine wave animation - all charts use same elapsed time
    const volatility = state.baseCandle.close * 0.002; // 0.2% max movement
    const priceWave = Math.sin(elapsed * 0.5) * volatility * (1 - progress * 0.5);
    const animatedClose = state.baseCandle.close + priceWave;
    
    // Update high/low to include animated price
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

  private startAnimation(): void {
    const animate = () => {
      const now = Date.now();
      
      // Throttle to updateInterval
      if (now - this.lastUpdate >= this.updateInterval) {
        this.lastUpdate = now;
        
        // Notify all listeners
        for (const ticker of this.listeners.keys()) {
          this.notifyListeners(ticker);
        }
      }
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }

  private notifyListeners(ticker: string): void {
    const callbacks = this.listeners.get(ticker);
    if (callbacks) {
      callbacks.forEach(cb => cb());
    }
  }

  /**
   * Clear state for a ticker (when ticker changes)
   */
  clearTicker(ticker: string): void {
    this.states.delete(ticker);
    this.listeners.delete(ticker);
  }
}

// Global singleton instance
export const liveCandleSync = new LiveCandleSyncManager();
