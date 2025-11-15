// src/components/ICCChart.tsx
import React from 'react';
import type { ICCSetup } from '../types/ICC';   // ✅ fixed relative import

interface ICCChartProps {
  setups: ICCSetup[];
}

const ICCChart: React.FC<ICCChartProps> = ({ setups }) => {
  return (
    <div>
      {setups.map((s, idx) => (
        <div key={idx}>
          <strong>{s.symbol}</strong> ({s.timeframe}) – {s.priceAtTrigger} @ {s.timeBlock}
        </div>
      ))}
    </div>
  );
};

export default ICCChart;