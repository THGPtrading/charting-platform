import React, { useState, useEffect } from 'react';
import { getSetupLog } from '../alerts/setupLogger';

const SetupFeed = () => {
  const [setups, setSetups] = useState([]);

  useEffect(() => {
    const log = getSetupLog();
    setSetups(log);
  }, []);

  const copyTags = (tags) => {
    navigator.clipboard.writeText(tags);
    alert('📋 TraderVue tags copied to clipboard!');
  };

  const groupedSetups = setups.reduce((acc, setup) => {
    const key = setup.dashboard || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(setup);
    return acc;
  }, {});

  return (
    <div style={{ maxHeight: '400px', overflowY: 'scroll', padding: '1rem', border: '1px solid #ccc' }}>
      <h3>📈 ICC Setup Feed</h3>
      {Object.entries(groupedSetups).map(([dashboard, entries]) => (
        <div key={dashboard} style={{ marginBottom: '2rem' }}>
          <h4>📊 {dashboard}</h4>
          {entries.map((setup, index) => (
            <div key={index} style={{ marginBottom: '1rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
              <strong>{setup.source}</strong> — {setup.iccTags.join(', ')}
              <br />
              <span>🕒 {setup.timestamp}</span>
              <br />
              <span>🏷️ <code>{setup.tradervueTags}</code></span>
              <br />
              <button onClick={() => copyTags(setup.tradervueTags)} style={{ marginTop: '0.5rem' }}>
                📋 Copy Tags
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SetupFeed;
