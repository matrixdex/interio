/* Generate Plinthel's design collection with Claude Code.
   Builds varied briefs (layout, room size, openings, look, must-haves, cooking, household, budget), sends each to
   Claude through the Claude Code CLI with the app's own KDL prompt, checks every result in the real app (sink, hob,
   chimney, fridge, nothing blocking a fridge / tall unit / dishwasher door), and writes designs/gallery.js.

     node tools/generate-collection.js --count 500 [--claude claude] [--model <id>] [--parallel 8] [--seed 7]
                                       [--checkpoint /tmp/collection.jsonl]

   Needs Node 18+, Playwright with Chromium, and Claude Code installed and logged in. Re-running with the same
   checkpoint resumes where it stopped. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const COUNT = +arg('count', 500), CLAUDE = arg('claude', 'claude'), MODEL = arg('model', ''), PAR = +arg('parallel', 8), SEED = +arg('seed', 7);
const ROOT = path.resolve(__dirname, '..'), CK = arg('checkpoint', path.join(os.tmpdir(), 'interio-collection.jsonl'));

let st = SEED * 7919 + 13; const rnd = () => (st = (st * 16807) % 2147483647) / 2147483647, pick = a => a[Math.floor(rnd() * a.length)], int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const LAYOUTS = [ // type, share, width range (ft), depth range (ft)
  ['straight', 80, [7, 14], [6, 10]], ['L-shaped', 110, [7, 14], [7, 12]], ['U-shaped', 90, [8, 14], [8, 13]],
  ['parallel', 70, [7, 10], [10, 16]], ['island', 80, [12, 18], [11, 15]], ['peninsula', 70, [10, 15], [9, 13]]];
const MOODS = ['Warm wood & white quartz', 'All-white minimal', 'Sage green & brass', 'Navy & marble', 'Dark & dramatic', 'Colourful Moroccan',
  'Terracotta & cream', 'Grey matte & black granite', 'White gloss & oak', 'Teak & white'];
const MUST = ['pantry', 'oven', 'dishwasher', 'loft', 'ro', 'microwave', 'seating', 'bigfridge'];
function briefs(n) {
  const out = [], total = LAYOUTS.reduce((s, l) => s + l[1], 0);
  for (const [type, share, W, D] of LAYOUTS) for (let i = 0; i < Math.round(n * 1.12 * share / total); i++) { // ~12% spare for rejects
    const door = pick(['south', 'south', 'south', 'east', 'west']), where = pick(['near the west corner', 'in the middle', 'near the east corner', 'near the corner']);
    const win = pick(['north', 'north', door === 'south' ? 'east' : 'south', 'west', 'none']);
    const must = MUST.filter(m => rnd() < (m === 'seating' ? (/island|peninsula/.test(type) ? .6 : .03) : m === 'ro' || m === 'microwave' ? .55 : .22));
    out.push({ widthFt: String(int(...W)), depthFt: String(int(...D)), ceilingFt: pick(['9', '9', '10', '8.5']), layout: type, people: String(int(2, 6)),
      cooking: pick(['heavy', 'heavy', 'heavy', 'moderate', 'moderate', 'light']), budget: String(int(2, 8)), must, mood: pick(MOODS),
      openings: `door on the ${door} wall ${where}${win === 'none' ? '' : `, window on the ${win} wall`}`, extra: '' });
  }
  return out.sort(() => rnd() - .5);
}
const runClaude = (system, user) => new Promise(res => {
  const env = Object.assign({}, process.env); delete env.CLAUDE_CODE_INCLUDE_PARTIAL_MESSAGES;
  const a = ['-p', '--output-format', 'json', '--no-session-persistence', '--tools', '', '--system-prompt-file', system, '--effort', 'low'].concat(MODEL ? ['--model', MODEL] : []);
  const c = spawn(CLAUDE, a, { env }); let out = ''; c.stdout.on('data', d => { out += d; }); c.stdin.end(user);
  c.on('close', () => { try { const j = JSON.parse(out); res(j.is_error ? null : j.result); } catch (e) { res(null); } });
});

(async () => {
  const browser = await chromium.launch(), page = await browser.newPage();
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForFunction(() => window.__interio && window.__interio.kdlSystem);
  const sysFile = path.join(os.tmpdir(), 'interio-kdl-system.txt'); fs.writeFileSync(sysFile, await page.evaluate(() => window.__interio.kdlSystem()));
  const done = fs.existsSync(CK) ? fs.readFileSync(CK, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
  const queue = briefs(COUNT).slice(done.length + done.filter(d => d.rejected).length);
  const kept = () => done.filter(d => !d.rejected).length;
  console.log(`${kept()} designs already in ${CK}; generating up to ${COUNT}…`);
  const check = text => page.evaluate(t => { // realize in the app and check the rules the studio promises
    const I = window.__interio, S = I.S; let doc; try { doc = I.kdlToDoc(t, {}); } catch (e) { return { ok: false, why: e.message }; }
    const role = it => I.P(it.pid).essential || I.P(it.pid).role || it.pid, has = r => doc.items.some(i => role(i) === r);
    const why = ['sink', 'stove', 'chimney', 'fridge'].filter(r => !has(r)).map(r => 'no ' + r);
    const keepR = S.room, keepI = S.items; S.room = doc.room; S.items = doc.items;
    for (const a of doc.items) { if (!['fridge', 'tall', 'dishwasher'].includes(a.pid) || !a.wall) continue; const sa = I.shapeOf(a), n = { N: [0, 1], S: [0, -1], W: [1, 0], E: [-1, 0] }[a.wall];
      const z = { x: sa.x + n[0] * ((n[0] ? sa.hw : 0) + .3), z: sa.z + n[1] * ((n[1] ? sa.hd : 0) + .3), hw: n[0] ? .3 : sa.hw - .02, hd: n[1] ? .3 : sa.hd - .02 };
      if (doc.items.some(o => o !== a && I.P(o.pid).mount === 'floor' && (s => Math.abs(s.x - z.x) < s.hw + z.hw - .02 && Math.abs(s.z - z.z) < s.hd + z.hd - .02)(I.shapeOf(o)))) why.push(a.pid + ' blocked'); }
    S.room = keepR; S.items = keepI;
    const R = doc.room; return { ok: !why.length, why: why.join(', '), type: doc.ai.layout_type, w: Math.round((R.x1 - R.x0) * 100), d: Math.round((R.z1 - R.z0) * 100), price: Math.round(I.docPrice(doc)), name: doc.title };
  }, text);
  let next = 0, t0 = Date.now();
  const worker = async () => {
    while (next < queue.length && kept() < COUNT) {
      const b = queue[next++], user = await page.evaluate(b => window.__interio.kdlBrief(Object.assign({ count: 3 }, b), ''), b);
      const text = await runClaude(sysFile, user), c = text ? await check(text) : { ok: false, why: 'no reply' };
      const rec = c.ok ? { type: c.type, w: c.w, d: c.d, must: b.must, mood: b.mood, cooking: b.cooking, people: +b.people, budget: +b.budget, price: c.price, kdl: text.trim() } : { rejected: true, why: c.why };
      done.push(rec); fs.appendFileSync(CK, JSON.stringify(rec) + '\n');
      if (done.length % 10 === 0) console.log(`${kept()} kept · ${done.filter(d => d.rejected).length} rejected · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  };
  await Promise.all(Array.from({ length: PAR }, worker));
  const keep = done.filter(d => !d.rejected).slice(0, COUNT);
  const body = keep.map(e => JSON.stringify(e)).join(',\n');
  fs.writeFileSync(path.join(ROOT, 'designs', 'gallery.js'), `/* Plinthel design collection: ${keep.length} kitchens written by Claude in KDL (see tools/generate-collection.js).\n   Each entry: { type, w, d (cm), must[], mood, cooking, people, budget (lakh), price (₹), kdl } */\nwindow.INTERIO_GALLERY = [\n${body}\n];\n`);
  console.log(`wrote designs/gallery.js · ${keep.length} designs · ${done.filter(d => d.rejected).length} rejected · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  await browser.close();
})();
