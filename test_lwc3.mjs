import { createChart, CandlestickSeries, LineSeries } from './node_modules/lightweight-charts/dist/lightweight-charts.production.mjs';

console.log('CandlestickSeries:', typeof CandlestickSeries, CandlestickSeries);
console.log('LineSeries:', typeof LineSeries, LineSeries);
console.log('\nAre they plain objects?', typeof CandlestickSeries === 'object');
if (typeof CandlestickSeries === 'object') {
  console.log('CandlestickSeries keys:', Object.keys(CandlestickSeries));
}
