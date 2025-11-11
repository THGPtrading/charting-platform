const setupLog = [];

export const logSetup = (setup) => {
  setupLog.push({
    ...setup,
    timestamp: new Date().toLocaleString(),
  });
};

export const getSetupLog = () => {
  return setupLog;
};
