// src/utils/timeSync.ts

/**
 * Get current Eastern Time timestamp (in seconds)
 */
export function getCurrentETTimestamp(): number {
  // Get current time in UTC
  const now = new Date();
  
  // Format in ET timezone and parse back
  const etString = now.toLocaleString("en-US", { 
    timeZone: "America/New_York",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Parse the ET string back to a Date (this will be interpreted in local timezone)
  // So we need a different approach - use the timezone offset
  
  // Better approach: Get the offset between local time and ET
  const utcTime = now.getTime();
  
  // Create a date formatter for ET
  const etFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Get the parts
  const parts = etFormatter.formatToParts(now);
  const etParts: any = {};
  parts.forEach(({ type, value }) => {
    etParts[type] = value;
  });
  
  // Construct ET date in UTC context (treat ET values as if they were UTC)
  const etAsUtc = Date.UTC(
    parseInt(etParts.year),
    parseInt(etParts.month) - 1,
    parseInt(etParts.day),
    parseInt(etParts.hour),
    parseInt(etParts.minute),
    parseInt(etParts.second)
  );
  
  return Math.floor(etAsUtc / 1000);
}

/**
 * Shift a timestamp to appear as if it's happening right now in ET,
 * but offset by 24 hours (showing yesterday's data as today).
 * 
 * @param originalTimestamp - Original timestamp in seconds
 * @param referenceNow - Current ET timestamp to sync against (defaults to now)
 * @returns Shifted timestamp in seconds
 */
export function shiftTimestampToRealtime(
  originalTimestamp: number,
  referenceNow?: number
): number {
  const nowET = referenceNow ?? getCurrentETTimestamp();
  const offset = 24 * 60 * 60; // 24 hours in seconds
  return originalTimestamp + offset;
}

/**
 * Calculate the offset needed to make a dataset appear real-time.
 * Takes the latest data point and shifts the entire dataset so that
 * the last data point appears at (current ET time - 24 hours).
 * 
 * @param timestamps - Array of original timestamps in seconds
 * @returns Offset in seconds to add to all timestamps
 */
export function calculateRealtimeOffset(timestamps: number[]): number {
  if (!timestamps || timestamps.length === 0) return 0;
  
  const nowET = getCurrentETTimestamp();
  const latestDataPoint = Math.max(...timestamps);
  const targetTime = nowET - (24 * 60 * 60); // 24 hours ago
  
  return targetTime - latestDataPoint;
}

/**
 * Shift an array of candle data to appear real-time (24 hours offset)
 */
export function shiftCandlesToRealtime<T extends { time: number }>(
  candles: T[]
): T[] {
  if (!candles || candles.length === 0) return candles;
  
  const timestamps = candles.map(c => c.time);
  const offset = calculateRealtimeOffset(timestamps);
  
  return candles.map(c => ({
    ...c,
    time: c.time + offset,
  }));
}
