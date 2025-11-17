import * as lwc from './node_modules/lightweight-charts/dist/lightweight-charts.production.mjs';
console.log('Keys with Series:', Object.keys(lwc).filter(k => k.includes('Series')));
console.log('\nAll exports:', Object.keys(lwc).sort().join(', '));
