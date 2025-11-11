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

  return (
    <div style={{ maxHeight: '400px', overflowY: 'scroll', padding: '1rem', border: '1px solid #ccc' }}>
      <h3>📈 ICC Setup Feed</h3>
      {setups.length === 0 ? (
        <p>No setups logged yet.</p>
      ) : (
        setups.map((setup, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
            <strong>{setup.dashboard}</strong> — {setup.source}
            <br />
            <span>💡 Tags: {setup.iccTags.join(', ')}</span>
            <br />
            <span>🕒 {setup.timestamp}</span>
            <br />
            <span>🏷️ TraderVue Tags: <code>{setup.tradervueTags}</code></span>
            <br />
            <button onClick={() => copyTags(setup.tradervueTags)} style={{ marginTop: '0.5rem' }}>
              📋 Copy Tags
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SetupFeed;
