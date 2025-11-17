const http = require('http');

const ports = [3000, 3001];

function fetchPort(port) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:${port}/trendedge`;
    const req = http.get(url, res => {
      const { statusCode } = res;
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ port, statusCode, data }));
    });
    req.on('error', err => reject({ port, err }));
    req.setTimeout(5000, () => {
      req.abort();
      reject({ port, err: new Error('timeout') });
    });
  });
}

function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

(async () => {
  const maxAttempts = 15;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const p of ports) {
      try {
        const r = await fetchPort(p);
        console.log('OK - port', r.port, 'status', r.statusCode, 'length', r.data.length);
        console.log(r.data.slice(0, 4000));
        process.exit(0);
      } catch (e) {
        console.error(`Attempt ${attempt} - FAILED port ${e.port}:`, e.err && (e.err.stack || e.err.message));
      }
    }
    if (attempt < maxAttempts) {
      console.log(`Retrying in 1000ms (attempt ${attempt + 1}/${maxAttempts})...`);
      await wait(1000);
    }
  }
  console.error('All attempts failed');
  process.exit(1);
})();
