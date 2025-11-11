import React from 'react';

const App = () => {
  const dummyData = [
    { time: '2023-01-01', value: 100 },
    { time: '2023-01-02', value: 105 },
    { time: '2023-01-03', value: 102 },
  ];

  return (
    <div style={{ padding: '2rem', color: '#ccc' }}>
      <h2>THGP Charting Platform</h2>
      <p>Lightweight Chart will render here once component is added.</p>
      <pre>{JSON.stringify(dummyData, null, 2)}</pre>
    </div>
  );
};

export default App;
