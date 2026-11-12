#!/usr/bin/env node
// Headless benchmark: runs the simulation core from index.html without a browser.
// Usage: node bench/benchmark.js [faultRatePerRobotHour=1] [minutes=60]
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const core = html.match(/<script id="core">([\s\S]*?)<\/script>/)[1];
const { runHeadless, STRAT_NAMES } = new Function(core + ';return {runHeadless, STRAT_NAMES};')();
const fr = +(process.argv[2] ?? 1), mins = +(process.argv[3] ?? 60), seeds = [11, 23, 47];
console.log(`Fault rate ${fr}/robot-hour · ${mins} simulated minutes · seeds ${seeds.join(', ')}\n`);
console.log('Strategy'.padEnd(20) + 'Cars/h'.padStart(8) + 'Util'.padStart(7) + 'Cycle(s)'.padStart(10) + 'Faults'.padStart(8) + 'BattAbort'.padStart(11));
for (const s of ['fixed', 'greedy', 'ai']) {
  const rs = seeds.map(sd => runHeadless(s, sd, fr, mins * 60));
  const a = k => rs.reduce((x, r) => x + r[k], 0) / rs.length;
  console.log(STRAT_NAMES[s].padEnd(20) + a('thr').toFixed(1).padStart(8) + ((a('util') * 100).toFixed(0) + '%').padStart(7) +
    a('cycle').toFixed(0).padStart(10) + a('faults').toFixed(1).padStart(8) + a('aborts').toFixed(1).padStart(11));
}
