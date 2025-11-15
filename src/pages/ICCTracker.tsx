// src/pages/ICCTracker.tsx
import React, { useState } from 'react';
import { getSetupLog, exportSetupLogCSV } from '../alerts/setupLogger';
import type { ICCSetup } from '../types/ICC';

interface FilterState {
  symbol: string;
  tag: string;
  capSize: string;
  session: string;
  outcome: string;
}

const ICCTracker: React.FC = () => {
  const allSetups: ICCSetup[] = getSetupLog();

  const [filters, setFilters] = useState<FilterState>({
    symbol: '',
    tag: '',
    capSize: '',
    session: '',
    outcome: '',
  });

  const handleExport = (): void => {
    const csv = exportSetupLogCSV(allSetups);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'icc_tracker_setups.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSetups = allSetups.filter(setup => {
    const { symbol, tag, capSize, session, outcome } = filters;
    const tags = setup.iccTags?.join(',') || '';
    return (
      (!symbol || setup.symbol.toLowerCase().includes(symbol.toLowerCase())) &&
      (!tag || tags.toLowerCase().includes(tag.toLowerCase())) &&
      (!capSize || setup.capSize === capSize) &&
      (!session || setup.timeBlock === session) &&
      (!outcome || setup.outcome === outcome)
    );
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 ICC Tracker — Unified Setup Review</h2>

      {/* Filters */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Symbol"
          value={filters.symbol}
          onChange={e => setFilters({ ...filters, symbol: e.target.value })}
        />
        <input
          type="text"
          placeholder="ICC Tag"
          value={filters.tag}
          onChange={e => setFilters({ ...filters, tag: e.target.value })}
        />
        <select
          value={filters.capSize}
          onChange={e => setFilters({ ...filters, capSize: e.target.value })}
        >
          <option value="">Cap Size</option>
          <option value="Small">Small</option>
          <option value="Mid">Mid</option>
          <option value="Large">Large</option>
        </select>
        <select
          value={filters.session}
          onChange={e => setFilters({ ...filters, session: e.target.value })}
        >
          <option value="">Session</option>
          <option value="PreMarket">PreMarket</option>
          <option value="Regular">Regular</option>
          <option value="AfterHours">AfterHours</option>
        </select>
        <select
          value={filters.outcome}
          onChange={e => setFilters({ ...filters, outcome: e.target.value })}
        >
          <option value="">Outcome</option>
          <option value="Pending">Pending</option>
          <option value="Scored">Scored</option>
        </select>
        <button onClick={handleExport}>📤 Export CSV</button>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid black', borderRadius: '6px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead style={{ backgroundColor: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>Timestamp</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>Symbol</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>ICC Tags</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>Cap Size</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>Session</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>Outcome</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>Dashboard</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredSetups.map((setup, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f3f4f6', // ✅ alternating rows
                }}
              >
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{setup.timestamp}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{setup.symbol}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{setup.iccTags?.join(', ')}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{setup.capSize}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{setup.timeBlock}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{setup.outcome}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{setup.dashboard}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{setup.priceAtTrigger}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ICCTracker;