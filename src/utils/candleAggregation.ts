// src/utils/candleAggregation.ts
import { ChartCandle } from '../api/polygonClient';

/**
 * Aggregate 1-minute candles into larger timeframes.
 * This ensures all charts for the same stock show synchronized prices.
 */
export function aggregateCandles(
  minuteCandles: ChartCandle[],
  timeframe: '1 Min' | '5 Min' | '10 Min' | '15 Min' | '30 Min' | '1 Hr' | '4 Hr' | 'Daily'
): ChartCandle[] {
  if (timeframe === '1 Min' || minuteCandles.length === 0) {
    return minuteCandles;
  }

  // Calculate how many minute bars per aggregated bar
  const minutesPerBar = getMinutesPerBar(timeframe);
  const result: ChartCandle[] = [];
  
  // Group candles into buckets based on timeframe
  const buckets = new Map<number, ChartCandle[]>();
  
  for (const candle of minuteCandles) {
    // Round down to nearest bucket start time
    const bucketTime = Math.floor(candle.time / (minutesPerBar * 60)) * (minutesPerBar * 60);
    
    if (!buckets.has(bucketTime)) {
      buckets.set(bucketTime, []);
    }
    buckets.get(bucketTime)!.push(candle);
  }
  
  // Aggregate each bucket into a single candle
  for (const [bucketTime, candles] of Array.from(buckets.entries()).sort((a, b) => a[0] - b[0])) {
    if (candles.length === 0) continue;
    
    const open = candles[0].open;
    const close = candles[candles.length - 1].close;
    const high = Math.max(...candles.map(c => c.high));
    const low = Math.min(...candles.map(c => c.low));
    const volume = candles.reduce((sum, c) => sum + (c.volume || 0), 0);
    
    result.push({
      time: bucketTime,
      open,
      high,
      low,
      close,
      volume,
    });
  }
  
  // Log aggregation results for debugging
  if (result.length > 0) {
    const lastCandle = result[result.length - 1];
    console.log(`[Aggregation ${timeframe}] Created ${result.length} candles from ${minuteCandles.length} 1-min bars`);
    console.log(`[Aggregation ${timeframe}] Last candle: O:${lastCandle.open.toFixed(2)} H:${lastCandle.high.toFixed(2)} L:${lastCandle.low.toFixed(2)} C:${lastCandle.close.toFixed(2)} V:${lastCandle.volume}`);
  }
  
  return result;
}

function getMinutesPerBar(timeframe: string): number {
  switch (timeframe) {
    case '1 Min': return 1;
    case '5 Min': return 5;
    case '10 Min': return 10;
    case '15 Min': return 15;
    case '30 Min': return 30;
    case '1 Hr': return 60;
    case '4 Hr': return 240;
    case 'Daily': return 1440; // 24 hours
    default: return 1;
  }
}
