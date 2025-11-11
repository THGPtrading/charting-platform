// Frontend-safe ICC setup logger using in-memory array
const setupLog = [];

export const logSetup = (setup) => {
  const entry = {
    timestamp: new Date().toISOString(),
    source: setup.source,
    dashboard: setup.dashboard,
    iccTags: setup.iccTags,
    price: setup.price,
    volume: setup.volume,
    timeBlock: setup.timeBlock,
    outcome: setup.outcome || 'pending',
  };
  setupLog.push(entry);
  console.log('✅ Setup logged:', entry);
};

export const getSetupLog = () => setupLog;
