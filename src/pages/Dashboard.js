import React from 'react';
import SetupFeed from '../components/setupFeed';

function Dashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 ICC Dashboard</h2>
      <p>Real-time setup feed with TraderVue tagging</p>
      <SetupFeed />
    </div>
  );
}

export default Dashboard;
