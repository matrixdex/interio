/* Property test for the KDL control layer.
   Generates random rooms + random KDL designs (no AI), realizes them in the real app, and checks the rules the studio promises:
     1. the sink, the hob and the fridge are always placed
     2. every hob has a chimney above it
     3. no two units overlap; every unit is inside the room
     4. no floor unit stands in a doorway or its swing
   Run:  node tests/kdl-property.test.js [cases=300] [seed=1]
   Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium). */
const { chromium } = require('playwright');
const path = require('path');

const N = +process.argv[2] || 300, SEED = +process.argv[3] || 1;

(async () => {
  const browser = await chromium.launch(), page = await browser.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.waitForFunction(() => window.__interio && window.__interio.kdlToDoc);

  const out = await page.evaluate(({ N, SEED }) => {
    const I = window.__interio, S = I.S;
    let st = SEED * 9301 + 49297; const rnd = () => (st = (st * 16807) % 2147483647) / 2147483647, pick = a => a[Math.floor(rnd() * a.length)], int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const WALLS = ['N', 'E', 'S', 'W'], len = (w, W, D) => (w === 'N' || w === 'S') ? W : D, adj = { N: ['E', 'W'], S: ['E', 'W'], E: ['N', 'S'], W: ['N', 'S'] };
    const FILL = ['b30', 'b45.1d', 'b60.2d', 'b60.3dr', 'b75.2dr', 'b90.2d', 'b120.4dr', 'dw60', 'tall60.pantry', 'gap10'];
    const failures = [], stats = { cases: 0, adjustments: 0 };
    for (let c = 0; c < N; c++) {
      const W = int(24, 48) * 10, D = int(22, 42) * 10, doorWall = pick(WALLS), doorC = int(55, len(doorWall, W, D) - 55);
      const lines = [`NAME Case ${c}`, `TYPE ${pick(['straight', 'L-shaped', 'U-shaped', 'parallel'])}`, `ROOM ${W} ${D} 274`, `DOOR ${doorWall} ${doorC}`];
      if (rnd() < .75) { const ww = pick(WALLS.filter(w => w !== doorWall)); lines.push(`WINDOW ${ww} ${int(60, len(ww, W, D) - 60)}${rnd() < .3 ? ' double' : ''}`); }
      lines.push(`STYLE ${int(0, 7)} quartz-white bar subway-white splash f1 pyramid`);
      const nRuns = int(1, 3), runWalls = []; let first = pick(WALLS);
      runWalls.push(first); while (runWalls.length < nRuns) { const cand = WALLS.filter(w => !runWalls.includes(w)); runWalls.push(pick(cand)); }
      const essentials = ['sink' + pick([60, 75, 90]) + '.' + pick(['single', 'drainer', 'double']), 'hob' + pick([60, 75, 90]) + '.' + int(2, 5), 'fridge.' + pick(['single', 'double', 'sxs'])];
      const runs = runWalls.map((w, i) => ({ w, start: i && runWalls.slice(0, i).some(u => adj[w].includes(u)) ? 60 : 0, units: [] }));
      essentials.forEach(e => pick(runs).units.push(e));
      for (const r of runs) { const L = len(r.w, W, D); let tot = 0; while (tot < L * (0.6 + rnd() * .7)) { const t = pick(FILL); r.units.splice(int(0, r.units.length), 0, t); tot += parseInt(t.replace(/^\D+/, ''), 10) || 60; } }
      runs.forEach(r => lines.push(`RUN ${r.w} ${r.start}: ${r.units.join(' ')}`));
      lines.push('ADD ' + ['microwave', 'ro', 'loft'].filter(() => rnd() < .5).join(' '));
      const kdl = lines.join('\n');
      let doc;
      try { doc = I.kdlToDoc(kdl, {}); } catch (e) { failures.push({ c, why: 'threw: ' + e.message, kdl }); continue; }
      stats.cases++; stats.adjustments += (doc.ai.issues || []).length;
      // inspect the result with the app's own geometry
      const keepRoom = S.room, keepItems = S.items; S.room = doc.room; S.items = doc.items;
      const role = it => I.P(it.pid).essential || I.P(it.pid).role || it.pid, has = r => doc.items.filter(i => role(i) === r || i.pid === r).length;
      const why = [];
      if (!has('sink')) why.push('no sink'); if (!has('stove')) why.push('no hob'); if (!has('fridge')) why.push('no fridge');
      const hobs = doc.items.filter(i => role(i) === 'stove' && I.P(i.pid).mount === 'floor'), chims = doc.items.filter(i => role(i) === 'chimney');
      for (const hb of hobs) { const s = I.shapeOf(hb); if (!chims.some(ch => { const t = I.shapeOf(ch); return Math.abs(t.x - s.x) < s.hw && Math.abs(t.z - s.z) < s.hd + .3; })) why.push('hob without chimney'); }
      const R = doc.room;
      doc.items.forEach((a, i) => {
        const sa = I.shapeOf(a);
        if (sa.x - sa.hw < R.x0 - .01 || sa.x + sa.hw > R.x1 + .01 || sa.z - sa.hd < R.z0 - .01 || sa.z + sa.hd > R.z1 + .01) why.push(`${a.pid} outside the room`);
        doc.items.slice(i + 1).forEach(b => { if (I.overlaps(sa, I.shapeOf(b))) why.push(`${a.pid} overlaps ${b.pid}`); });
        if (I.P(a.pid).mount === 'floor') { const f = I.featureHit(sa, true); if (f && f.f.kind === 'door') why.push(`${a.pid} blocks the door`); }
      });
      S.room = keepRoom; S.items = keepItems;
      if (why.length) failures.push({ c, why: [...new Set(why)].join('; '), issues: doc.ai.issues, kdl });
    }
    return { failures, stats };
  }, { N, SEED });

  const { failures, stats } = out;
  console.log(`${stats.cases} designs realized · ${(stats.adjustments / Math.max(1, stats.cases)).toFixed(1)} auto-adjustments per design on average`);
  if (errors.length) console.log('page errors:', errors);
  if (!failures.length) { console.log(`PASS · all ${N} random designs keep sink, hob, fridge and chimney; no overlaps, nothing outside the room or in a doorway`); }
  else {
    const by = {}; failures.forEach(f => f.why.split('; ').forEach(w => { by[w.replace(/\w+-\w+|\b[a-z]+-unit\b/g, m => m)] = (by[w] || 0) + 1; }));
    console.log(`FAIL · ${failures.length} of ${N} designs broke a rule`); console.log(by);
    console.log('first failure:\n' + failures[0].kdl + '\n→ ' + failures[0].why + '\n  planner said: ' + (failures[0].issues || []).join(' | '));
  }
  await browser.close(); process.exit(failures.length || errors.length ? 1 : 0);
})();
