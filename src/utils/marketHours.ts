// src/utils/marketHours.ts

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map((v) => parseInt(v, 10));
  return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
}

export function isWithinHoursET(startHm = "08:00", endHm = "17:00", now = new Date()): boolean {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
  const parts = fmt.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "Mon";

  // Weekdays only (Mon–Fri)
  if (!["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday)) return false;

  const { h: sh, m: sm } = parseHm(startHm);
  const { h: eh, m: em } = parseHm(endHm);

  const cur = hour * 60 + minute;
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  return cur >= start && cur <= end;
}

export function isMarketOpenNow(): boolean {
  const start = process.env.REACT_APP_MARKET_START_ET || "08:00";
  const end = process.env.REACT_APP_MARKET_END_ET || "17:00";
  return isWithinHoursET(start, end);
}
