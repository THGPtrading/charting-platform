// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import TrendEdge from "./pages/TrendEdge";
import MomentumEdge from "./pages/MomentumEdge";
import WarriorEdge from "./pages/WarriorEdge";
import DefaultDashboard from "./pages/DefaultDashboard";
import ICCTracker from "./pages/ICCTracker";
import ICCPage from "./pages/ICCPage";
import { isMarketOpenNow } from "./utils/marketHours";

// Clear old cached data on app load to ensure time sync is applied
if (typeof window !== 'undefined' && window.localStorage) {
  // Clear all candle cache to force fresh data with time sync
  const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('candles:'));
  if (cacheKeys.length > 0) {
    console.log(`[Cache] Clearing ${cacheKeys.length} cache entries to apply time sync`);
    cacheKeys.forEach(key => localStorage.removeItem(key));
  }
  // Also clear any old data that might be cached
  console.log('[Time Sync] Current ET time:', new Date(Date.now()).toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

const TabLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      textDecoration: "none",
      color: isActive ? "#111111" : "#a78bfa",
      backgroundColor: isActive ? "#a78bfa" : "transparent",
      border: "1px solid #a78bfa",
    })}
  >
    {label}
  </NavLink>
);

const App: React.FC = () => {
  const isProd = process.env.NODE_ENV === "production";
  const showInternal = !isProd || process.env.REACT_APP_SHOW_INTERNAL === "1";
  const defaultRoute = isProd ? "/trendedge" : "/summary";
  const hoursGate = process.env.REACT_APP_MARKET_HOURS_ONLY === "1" || process.env.REACT_APP_MARKET_HOURS_ONLY === "true";
  const offHours = hoursGate && !isMarketOpenNow();
  return (
    <BrowserRouter>
      <div style={{ backgroundColor: "#121212", minHeight: "100vh" }}>
        {offHours && (
          <div style={{
            background: "#2a2a2a",
            color: "#e0e0e0",
            padding: "8px 12px",
            textAlign: "center",
            borderBottom: "1px solid #333",
            fontSize: 13,
          }}>
            Live data paused outside configured market hours. Showing mock or cached data.
          </div>
        )}
        <nav
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            borderBottom: "1px solid #333",
            position: "sticky",
            top: 0,
            backgroundColor: "#121212",
            zIndex: 10,
          }}
        >
          {showInternal && <TabLink to="/summary" label="THGP Strategy Summary" />}
          <TabLink to="/trendedge" label="TrendEdge" />
          <TabLink to="/momentumedge" label="MomentumEdge" />
          <TabLink to="/warrioredge" label="WarriorEdge" />
          {showInternal && <TabLink to="/icctracker" label="ICC Tracker" />}
          {showInternal && <TabLink to="/iccpage" label="ICC Page" />}
        </nav>

        <div style={{ padding: "1rem" }}>
          <Routes>
            <Route path="/" element={<Navigate to={defaultRoute} replace />} />
            {showInternal && <Route path="/summary" element={<DefaultDashboard />} />}
            <Route path="/trendedge" element={<TrendEdge />} />
            <Route path="/momentumedge" element={<MomentumEdge />} />
            <Route path="/warrioredge" element={<WarriorEdge />} />
            {showInternal && <Route path="/icctracker" element={<ICCTracker />} />}
            {showInternal && <Route path="/iccpage" element={<ICCPage />} />}
            <Route path="*" element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;