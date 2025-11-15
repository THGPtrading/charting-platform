// src/components/SetupExport.tsx
import React from 'react';
import { exportSetupLogCSV, getSetupLog } from '../alerts/setupLogger';
import type { ICCSetup } from '../types/ICC';

interface SetupExportProps {
  dashboard?: string;        // optional dashboard name (MomentumEdge, TrendEdge, WarriorEdge, etc.)
  entries?: ICCSetup[];      // optional direct entries to export
}

const SetupExport: React.FC<SetupExportProps> = ({ dashboard, entries }) => {
  const handleExport = () => {
    // Determine which setups to export
    let setups: ICCSetup[];
    if (entries) {
      setups = entries;
    } else if (dashboard) {
      setups = getSetupLog().filter(s => s.dashboard === dashboard);
    } else {
      setups = getSetupLog(); // default: all dashboards
    }

    // Generate CSV string
    const csv = exportSetupLogCSV(setups);

    // Create filename
    const filename = `${dashboard ?? 'ICC_AllDashboards'}_${Date.now()}.csv`;

    // Download as CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={handleExport}>
        📤 Export {dashboard ?? 'All Dashboards'} Setups to CSV
      </button>
    </div>
  );
};

export default SetupExport;