import React from 'react';
import TrendEdge from './TrendEdge';
import MomentumEdge from './MomentumEdge';
import WarriorEdge from './WarriorEdge';

const MultiDashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <TrendEdge />
      <MomentumEdge />
      <WarriorEdge />
    </div>
  );
};

export default MultiDashboard;
