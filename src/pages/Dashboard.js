import React from 'react';
import SetupFeed from '../components/setupFeed'; // Adjust path if needed

function Dashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>🚀 ICC Dashboard</h2>

      {/* Other dashboard panels can go here */}
      <SetupFeed />
    </div>
  );
}

export default Dashboard;
