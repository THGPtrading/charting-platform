// src/utils/companyLookup.ts
export const lookupCompanyName = (ticker: string): string => {
  const map: Record<string, string> = {
    AAPL: "Apple",
    NVDA: "NVIDIA",
    TSLA: "Tesla",
    MSFT: "Microsoft",
    AMZN: "Amazon",
    // Add more as needed
  };
  return map[ticker.toUpperCase()] || "Unknown Company";
};
