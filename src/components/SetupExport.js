import React from 'react';
import { exportSetupLogCSV } from '../alerts/setupLogger';

const SetupExport = () => {
  const handleExport = () => {
    const csv = exportSetupLogCSV();

    // Download as CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'icc_setups.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={handleExport}>📤 Export ICC Setups to CSV</button>
    </div>
  );
};

export default SetupExport;
