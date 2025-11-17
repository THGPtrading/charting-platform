module.exports = (_req, res) => {
  res.status(200).send(String(Math.floor(Date.now() / 1000)));
};
