// src/components/Filters.tsx
import React, { useMemo, useState } from 'react';
import type { ICCSetup } from '../types/ICC';

interface FiltersProps {
  setups: ICCSetup[];
}

const Filters: React.FC<FiltersProps> = ({ setups }) => {
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    const list = [...setups];
    // If data exists, sort by first data point time; else fallback to timestamp
    list.sort((a, b) => {
      const ta = a.data?.[0]?.time ?? a.timestamp ?? 0;
      const tb = b.data?.[0]?.time ?? b.timestamp ?? 0;
      const na = typeof ta === 'number' ? ta : new Date(ta).getTime();
      const nb = typeof tb === 'number' ? tb : new Date(tb).getTime();
      return sortAsc ? na - nb : nb - na;
    });
    return list;
  }, [setups, sortAsc]);

  return (
    <div>
      <button onClick={() => setSortAsc(s => !s)}>
        Toggle sort ({sortAsc ? 'asc' : 'desc'})
      </button>
      <ul>
        {sorted.map((s, i) => (
          <li key={i}>
            {s.timestamp} — {s.symbol} — {s.dashboard}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Filters;