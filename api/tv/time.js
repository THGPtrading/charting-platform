function getCurrentETTimestamp() {
  const now = new Date();
  const etString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const etDate = new Date(etString);
  return Math.floor(etDate.getTime() / 1000);
}

module.exports = (_req, res) => {
  res.status(200).send(String(getCurrentETTimestamp()));
};
