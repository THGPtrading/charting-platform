import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import DefaultDashboard from './pages/DefaultDashboard';
import MomentumEdge from './pages/MomentumEdge';
import TrendEdge from './pages/TrendEdge';
import WarriorEdge from './pages/WarriorEdge';
import ICCTracker from './pages/ICCTracker';
import ICCPage from './pages/ICCPage';
import TestHarness from './pages/TestHarness';

import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<DefaultDashboard />} />
          <Route path="/momentum" element={<MomentumEdge />} />
          <Route path="/trend" element={<TrendEdge />} />
          <Route path="/warrior" element={<WarriorEdge />} />
          <Route path="/tracker" element={<ICCTracker />} />
          <Route path="/icc" element={<ICCPage />} />
          <Route path="/test" element={<TestHarness />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;