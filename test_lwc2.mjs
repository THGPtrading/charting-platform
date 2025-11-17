import { createChart, CandlestickSeries, LineSeries } from './node_modules/lightweight-charts/dist/lightweight-charts.production.mjs';

const cs = new CandlestickSeries();
const ls = new LineSeries();

console.log('CandlestickSeries instance:', typeof cs);
console.log('LineSeries instance:', typeof ls);
console.log('CS proto keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(cs)).slice(0, 20));
console.log('LS proto keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(ls)).slice(0, 20));
