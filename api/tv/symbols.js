module.exports = (req, res) => {
  const raw = (req.query && (req.query.symbol || req.query.ticker)) || 'AAPL';
  const symbol = raw.includes(':') ? raw.split(':')[1] : raw;
  res.status(200).json({
    name: symbol,
    ticker: symbol,
    description: symbol,
    type: 'stock',
    session: '0930-1600',
    exchange: 'NYSE',
    listed_exchange: 'NYSE',
    timezone: 'America/New_York',
    minmov: 1,
    pricescale: 100,
    has_intraday: true,
    supported_resolutions: ['1','3','5','15','30','60','240','D'],
    volume_precision: 0,
    data_status: 'streaming',
  });
};
