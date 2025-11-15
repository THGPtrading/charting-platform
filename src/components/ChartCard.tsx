// src/components/ChartCard.tsx
import React from 'react';
import LightweightChart from './LightweightChart';
import { AdvancedChart } from './AdvancedChart';
import type { ICCSetup } from '../types/ICC';

interface ChartCardProps {
  setups: ICCSetup[];
  useAdvanced?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({ setups, useAdvanced }) => {
  return useAdvanced ? (
    <AdvancedChart setups={setups} />
  ) : (
    <LightweightChart
      data={setups.map(s => ({
        time: s.timestamp,
        value: s.priceAtTrigger,
      }))}
      overlays={{ triggers: setups }}
    />
  );
};

export default ChartCard;
