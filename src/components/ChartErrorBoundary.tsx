// src/components/ChartErrorBoundary.tsx
import React from 'react';

export class ChartErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: unknown) { console.error('Chart rendering error:', error); }
  render() {
    if (this.state.hasError) return <div className="chart-error">Chart failed to render. Try a different timeframe or refresh.</div>;
    return this.props.children;
  }
}