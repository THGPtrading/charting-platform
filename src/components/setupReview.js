import React, { useState, useEffect } from 'react';
import { getSetupLog } from '../alerts/setupLogger';

const SetupReview = () => {
  const [setups, setSetups] = useState([]);

  useEffect(() => {
    const log = getSetupLog();
    setSetups(log);
  }, []);

  const updateOutcome = (index, outcome) => {
    const updated = [...setups];
    updated[index].outcome = outcome;
    setSetups(updated);
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <h3>📊 ICC Setup Review</h3>
      {setups.map((setup, index) => (
        <div key={index} style={{ marginBottom: '1rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
          <strong>{setup.source}</strong> — {setup.iccTags.join(', ')}
          <br />
          <span>🕒 {setup.timestamp}</span> | 💰 Trigger: {setup.priceAtTrigger || '—'}
          <br />
          <span>🏷️ <code>{setup.tradervueTags}</code></span>
          <br />
          <label>
            Outcome:
            <select
              value={setup.outcome || ''}
              onChange={(e) => updateOutcome(index, e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="">—</option>
              <option value="win">✅ Win</option>
              <option value="loss">❌ Loss</option>
              <option value="neutral">⚖️ Neutral</option>
              <option value="not-traded">🚫 Not Traded</option>
            </select>
          </label>
        </div>
      ))}
    </div>
  );
};

export default SetupReview;
