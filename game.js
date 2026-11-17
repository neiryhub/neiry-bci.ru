// «Пифия: Биодрон» — пиксельная аркада. Мир рисуется в 320×180 и масштабируется целиком.
(() => {
'use strict';

const W = 320, H = 180, GY = 166;           // GY — уровень земли
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const stage = $('stage');
const out = $('game').getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
const g = buf.getContext('2d');
out.imageSmoothingEnabled = g.imageSmoothingEnabled = false;

// ---------- спрайты ----------
const PAL = {
  k: '#140c28', g: '#7d7fa0', l: '#c8cce4', p: '#8a5cd0', t: '#3fc8b4', o: '#f5a142',
  e: '#0a0612', w: '#f4f1ff', r: '#ff2e63', c: '#4de8ff', s: '#5a5f7a', m: '#2e2944',
  R: '#ff3355', h: '#b8b4d0', n: '#ff8fb1', G: '#39d98a', y: '#ffd166'
};
function spr(rows, pal = PAL) {
  const c = document.createElement('canvas');
  c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') { x.fillStyle = pal[r[i]]; x.fillRect(i, j, 1, 1); } });
  return c;
}

const PIGEON = spr([
  '.....r..............',
  '.....k..............',
  '.....k.......kkkk...',
  '....kck.....kllwek..',
  '...kccck....kllllkoo',
  '...kccck...kttppk...',
  '....kkkkkkkkttpk....',
  '.kk.klllllllltppk...',
  'kggkllllllllllllk...',
  'kggkgggllllllllgk...',
  '.kkkkggggggggggk....',
  '.....kkkkkkkkkk.....',
  '........o..o........',
  '....................',
]);
const WING_UP = spr([
  '....................',
  '..........k.........',
  '.........klk........',
  '........kllk........',
  '.......klllk........',
  '.......kllgk........',
  '.......kggk.........',
  '........kk..........',
  '....................', '....................', '....................', '....................', '....................', '....................',
]);
const WING_DOWN = spr([
  '....................', '....................', '....................', '....................', '....................', '....................', '....................',
  '.......kllk.........',
  '.......kllgk........',
  '........klgk........',
  '........kggk........',
  '.........kk.........',
  '....................', '....................',
]);
const RAT_ROWS = [
  '..........kkkk..........',
  '.........kssssk.........',
  '.........kscssk.........',
  '..kkk....kkkkkk....kkk..',
  '.kpppk..kwwwwwwk..kpppk.',
  '.kppppkkwwwwwwwwkkppppk.',
  '.kpppkwwwwwwwwwwwwkpppk.',
  '..kkkwwwwwwwwwwwwwwkkk..',
  '....kwwwrrwwwwrrwwwk....',
  '....kwwwrrwwwwrrwwwk....',
  '....kwwwwwwwwwwwwwwk....',
  '.....kwwwwwwwwwwwwk.....',
  '......kwwwwnnwwwwk......',
  '.......kwwwkkwwwk.......',
  '..h.....kwwwwwwk.....h..',
  '...hh....kwwwwk....hh...',
  '......kkkwwwwwwkkk......',
  '.....kwwwwwwwwwwwwk.....',
  '....kwwwwwwwwwwwwwwk....',
  '....kwwwhwwwwwwhwwwk....',
  '....kwwwwwwwwwwwwwwk....',
  '....kkkkkkkkkkkkkkkk....',
];
const RAT = spr(RAT_ROWS, { ...PAL, p: '#ff8fb1' });
const STATUE = spr([
  '...k....k...',
  '..kwk..kwk..',
  '..kwwkkwwk..',
  '...kwwwwk...',
  '..kwrwwrwk..',
  '..kwwwwwwk..',
  '...kwnnwk...',
  '..kwwwwwwk..',
  '.kwwwwwwwwk.',
  '.kkkkkkkkkk.',
]);
const DRONE_ROWS = f => [
  f ? 'kkkkk......kkkkk' : '.kkk........kkk.',
  '..k..........k..',
  '..kkkkkkkkkkkk..',
  '...kmmmmmmmmk...',
  '....kmmRRmmk....',
  '....kmmRRmmk....',
  '.....kkkkkk.....',
  '......k..k......',
];
const DRONE = [spr(DRONE_ROWS(1)), spr(DRONE_ROWS(0))];
const HUNTER = [spr(DRONE_ROWS(1), { ...PAL, R: '#ffd166', m: '#4a2a3a' }), spr(DRONE_ROWS(0), { ...PAL, R: '#ffd166', m: '#4a2a3a' })];
const COIN_ROWS = [
  '..kkkk..',
  '.kFFFFk.',
  'kFdFFdFk',
  'kFddFdFk',
  'kFdFddFk',
  'kFdFFdFk',
  '.kFFFFk.',
  '..kkkk..',
];
const COINS = {
  gold: { f: '#ffd166', d: '#c27c0e', name: 'ЗОЛОТЫЕ' },
  cyan: { f: '#4de8ff', d: '#1b7fa6', name: 'ГОЛУБЫЕ' },
  pink: { f: '#ff6ad5', d: '#a3237f', name: 'РОЗОВЫЕ' },
};
for (const k in COINS) COINS[k].spr = spr(COIN_ROWS, { ...PAL, F: COINS[k].f, d: COINS[k].d });
const NEURO = spr([
  '.kkkkkkk.',
  'kGGGGGGGk',
  'kGGGGwGGk',
  'kGwGGwGGk',
  'kwGwGwGwk',
  'kGGGwGwGk',
  'kGGGwGGGk',
  'kGGGGGGGk',
  '.kkkkkkk.',
]);
const CHIP = spr([
  '..c.c.c..',
  '.kkkkkkk.',
  'ckmmmmmkc',
  '.kmcmcmk.',
  'ckmmcmmkc',
  '.kmcmcmk.',
  'ckmmmmmkc',
  '.kkkkkkk.',
  '..c.c.c..',
]);

// мини-шрифт 3×5 для всплывающих цифр
const F3 = {
  0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001',
  5: '111100111001111', 6: '111100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001111',
  '+': '000010111010000', '-': '000000111000000', x: '000101010101000',
};
function ptext(s, x, y, col) {
  g.fillStyle = col;
  for (const ch of s) { const m = F3[ch]; if (m) for (let i = 0; i < 15; i++) if (m[i] === '1') g.fillRect(x + i % 3, y + (i / 3 | 0), 1, 1); x += 4; }
}

// ---------- фон ----------
const SKY = (() => {
  const c = document.createElement('canvas'); c.width = 1; c.height = GY;
  const x = c.getContext('2d');
  const stops = [[0, [11, 5, 38]], [.55, [43, 11, 90]], [.85, [122, 31, 138]], [1, [255, 79, 154]]];
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    let a = stops[0], b = stops[1];
    for (let j = 0; j < stops.length - 1; j++) if (t >= stops[j][0] && t <= stops[j + 1][0]) { a = stops[j]; b = stops[j + 1]; }
    const k = (t - a[0]) / (b[0] - a[0] || 1);
    x.fillStyle = `rgb(${a[1].map((v, n) => Math.round(v + (b[1][n] - v) * k)).join()})`;
    x.fillRect(0, Math.floor(i * GY / bands), 1, Math.ceil(GY / bands));
  }
  return c;
})();
const SUN = (() => {
  const R = 30, c = document.createElement('canvas'); c.width = c.height = R * 2;
  const x = c.getContext('2d');
  for (let y = 0; y < R * 2; y++) {
    const t = y / (R * 2);
    x.fillStyle = `rgb(255,${Math.round(209 - 160 * t)},${Math.round(102 + 40 * t)})`;
    const half = Math.sqrt(Math.max(0, R * R - (y - R + .5) ** 2));
    x.fillRect(Math.round(R - half), y, Math.round(half * 2), 1);
  }
  for (let y = R + 2, gap = 1; y < R * 2; y += 4 + gap, gap++) x.clearRect(0, y, R * 2, gap);
  return c;
})();
const STARS = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, GY - 50), p: rand(0, 6), s: Math.random() < .15 }));

function mkBuilding(w, h, base, wins, lit, tower) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(0, 0, 1, h);
  x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(w - 1, 0, 1, h);
  for (let yy = 3; yy < h - 2; yy += 4) for (let xx = 2; xx < w - 2; xx += 3)
    if (Math.random() < lit) { x.fillStyle = pick(wins); x.fillRect(xx, yy, 1, 2); }
  if (tower) {
    x.fillStyle = '#ff4fd8'; x.fillRect(3, 10, w - 6, 3);
    x.fillStyle = '#ffd6f5'; for (let i = 5; i < w - 5; i += 3) x.fillRect(i, 11, 1, 1);
    x.fillStyle = '#4de8ff'; x.fillRect(Math.floor(w / 2) - 4, h - 10, 8, 10);
  } else if (Math.random() < .5) {
    x.fillStyle = base; x.fillRect(Math.floor(w / 2) - 1, 0, 2, 3);
  }
  return c;
}
const LAYERS = [
  { speed: .12, gap: [0, 4], make: () => { const w = rand(14, 30) | 0, h = rand(45, 100) | 0; return { w, h, img: mkBuilding(w, h, '#2a1850', ['#5b3a9a', '#7a4fc0'], .22) }; } },
  { speed: .35, gap: [2, 10], n: 0, make() {
      this.n++;
      if (this.n % 9 === 0) { const w = 44, h = 118; return { w, h, img: mkBuilding(w, h, '#241047', ['#ff6ad5', '#ffb3ec'], .45, true), tower: true }; }
      const w = rand(18, 34) | 0, h = rand(32, 84) | 0; return { w, h, img: mkBuilding(w, h, '#1c0f3a', ['#ff6ad5', '#4de8ff', '#ffd166'], .3) };
    } },
  { speed: 1, gap: [4, 22], make: () => { const w = rand(20, 46) | 0, h = rand(6, 22) | 0; return { w, h, img: mkBuilding(w, h, '#0d0620', ['#ff2e63', '#4de8ff'], .06) }; } },
];
function resetLayers() {
  for (const L of LAYERS) {
    L.items = []; let x = rand(-20, 0);
    while (x < W + 60) { const b = L.make(); b.x = x; L.items.push(b); x += b.w + rand(...L.gap); }
  }
}

// ---------- звук ----------
let actx = null, muted = false;
try { muted = localStorage.getItem('pifia-mute') === '1'; } catch (e) {}
function beep(f, d = .08, type = 'square', vol = .04, slide = 0, delay = 0) {
  if (muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime + delay, o = actx.createOscillator(), v = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + d);
    v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(v).connect(actx.destination); o.start(t); o.stop(t + d);
  } catch (e) {}
}
const SFX = {
  coin: () => { beep(988, .06); beep(1319, .09, 'square', .04, 0, .05); },
  jackpot: () => [784, 988, 1319, 1568].forEach((f, i) => beep(f, .08, 'square', .04, 0, i * .05)),
  bad: () => beep(330, .18, 'sawtooth', .04, -200),
  hit: () => { beep(140, .25, 'sawtooth', .07, -90); beep(90, .3, 'square', .05, -40); },
  power: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, .09, 'triangle', .06, 0, i * .06)),
  oracle: () => { beep(660, .12, 'triangle', .05); beep(880, .18, 'triangle', .05, 0, .12); },
};

// ---------- состояние ----------
let state = 'title', t = 0, elapsed = 0, speed = 50, dist = 0, score = 0, best = 0;
let ents = [], parts = [], floats = [], shake = 0, glitch = 0;
let proph = null, prophT = 0, spawn = {};
const P = { x: 56, y: 80, vy: 0, inv: 0, signal: 3, ai: 0, flap: 0 };
try { best = +localStorage.getItem('pifia-best') || 0; } catch (e) {}

const ORACLE_FLAVOR = [
  'Нейроимплант шепчет: держи курс.',
  'ИИ-аналитики спорят. Пифия — знает.',
  'Свечи зелёные, усы дрожат.',
  'Пифия чует памп за три квартала.',
  'Не верь дронам. Верь крысе.',
  'Голубь, это не финансовый совет.',
];
const OVER_QUOTES = [
  'Пифия предвидела это. Но промолчала.',
  'Даже ИИ не угадал бы этот дрон.',
  'HODL, голубь. Попробуй ещё раз.',
  'Сигнал потерян, но нейроны помнят путь.',
  'Рынок волатилен. Голуби — тоже.',
];

function newGame() {
  state = 'play'; t = 0; elapsed = 0; speed = 70; dist = 0; score = 0;
  ents = []; parts = []; floats = []; shake = glitch = 0;
  Object.assign(P, { x: 56, y: 80, vy: 0, inv: 1, signal: 3, ai: 0 });
  spawn = { coin: .8, enemy: 2.2, pick: 10 };
  proph = null; prophT = 1.2;
  show('hud'); hide('title'); hide('over'); hide('pause');
  updateHud(true);
}

// ---------- спавн ----------
function spawnCoins() {
  const color = pick(Object.keys(COINS)), n = rand(5, 9) | 0, kind = pick(['line', 'sine', 'diag', 'arc']);
  const y0 = rand(24, GY - 46), dir = Math.random() < .5 ? -1 : 1;
  for (let i = 0; i < n; i++) {
    let y = y0;
    if (kind === 'sine') y += Math.sin(i * .8) * 12;
    if (kind === 'diag') y += i * 4 * dir;
    if (kind === 'arc') y -= Math.sin(i / (n - 1) * Math.PI) * 18;
    ents.push({ type: 'coin', color, x: W + 10 + i * 13, y: clamp(y, 14, GY - 20), ph: i * .4 });
  }
}
function spawnDrone() {
  const hunter = Math.random() < clamp(elapsed / 120, .1, .45);
  const y = rand(18, GY - 40);
  ents.push({ type: 'drone', hunter, x: W + 8, y, y0: y, ph: rand(0, 6), vx: rand(15, 40) });
}
function spawnAntenna() {
  const h = rand(34, 86) | 0;
  ents.push({ type: 'ant', x: W + 6, h, ph: rand(0, 6) });
}
function spawnPickup() {
  const type = P.signal < 3 && Math.random() < .6 ? 'neuro' : 'ai';
  ents.push({ type, x: W + 8, y: rand(24, GY - 40), ph: 0 });
}
function newProphecy() {
  const ks = Object.keys(COINS), up = pick(ks); let down; do down = pick(ks); while (down === up);
  proph = { up, down };
  $('oracleText').innerHTML = `<span style="color:${COINS[up].f}">${COINS[up].name}</span> — <span class="up">РОСТ x5</span><br><span style="color:${COINS[down].f}">${COINS[down].name}</span> — <span class="down">ОБВАЛ -3</span>`;
  $('oracleFlavor').textContent = pick(ORACLE_FLAVOR);
  $('trend').innerHTML = `<span><i class="dot" style="background:${COINS[up].f}"></i><b class="up">x5</b></span><span><i class="dot" style="background:${COINS[down].f}"></i><b class="down">-3</b></span>`;
  $('oracle').classList.add('show'); oracleHide = 4.5;
  SFX.oracle();
}
let oracleHide = 0;

// ---------- ввод ----------
const keys = {};
let pointerY = null, pointerDown = false;
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', ' ', 'w', 's', 'ц', 'ы'].includes(k)) e.preventDefault();
  keys[k] = true; pointerY = null;
  if ((k === ' ' || k === 'enter') && (state === 'title' || state === 'over')) newGame();
  else if ((k === 'p' || k === 'з' || k === 'escape') && (state === 'play' || state === 'pause')) togglePause();
  else if (k === 'm' || k === 'ь') toggleMute();
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
function stageY(e) { const r = stage.getBoundingClientRect(); return (e.clientY - r.top) / r.height * H; }
stage.addEventListener('pointerdown', e => { if (e.target.closest('button,a')) return; pointerDown = true; pointerY = stageY(e); });
addEventListener('pointermove', e => { if (pointerDown || e.pointerType === 'touch') pointerY = stageY(e); });
addEventListener('pointerup', () => { pointerDown = false; pointerY = null; });
addEventListener('pointercancel', () => { pointerDown = false; pointerY = null; });

function togglePause() {
  if (state === 'play') { state = 'pause'; show('pause'); }
  else if (state === 'pause') { state = 'play'; hide('pause'); last = performance.now(); }
}
function toggleMute() {
  muted = !muted; $('muteBtn').textContent = 'ЗВУК: ' + (muted ? 'ВЫКЛ' : 'ВКЛ');
  try { localStorage.setItem('pifia-mute', muted ? '1' : '0'); } catch (e) {}
}
$('startBtn').onclick = newGame;
$('againBtn').onclick = newGame;
$('resumeBtn').onclick = togglePause;
$('pauseBtn').onclick = togglePause;
$('muteBtn').onclick = toggleMute;
$('muteBtn').textContent = 'ЗВУК: ' + (muted ? 'ВЫКЛ' : 'ВКЛ');
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') togglePause(); });

const show = id => { $(id).hidden = false; };
const hide = id => { $(id).hidden = true; };

// ---------- логика ----------
const hitbox = () => ({ x: P.x + 4, y: P.y + 4, w: 12, h: 7 });
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function boxOf(e) {
  if (e.type === 'coin') return { x: e.x, y: e.y, w: 8, h: 8 };
  if (e.type === 'drone') return { x: e.x + 2, y: e.y + 1, w: 12, h: 6 };
  if (e.type === 'ant') return { x: e.x, y: GY - e.h - 2, w: 4, h: e.h + 2 };
  return { x: e.x, y: e.y, w: 9, h: 9 };
}
function burst(x, y, col, n = 8, sp = 50) {
  for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), v = rand(sp * .3, sp); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(.3, .6), col }); }
}
function hurt() {
  if (P.inv > 0 || P.ai > 0 || state !== 'play') return;
  P.signal--; P.inv = 1.6; glitch = .35; shake = .3; SFX.hit();
  burst(P.x + 10, P.y + 6, '#ff2e63', 12, 70);
  if (P.signal <= 0) { state = 'dying'; P.vy = -60; hide('hud'); $('oracle').classList.remove('show'); }
  updateHud();
}

function update(dt) {
  t += dt;
  const scroll = state === 'title' ? 40 : state === 'dying' ? speed * .4 : speed;
  for (const L of LAYERS) {
    for (const b of L.items) b.x -= scroll * L.speed * dt;
    if (L.items[0].x + L.items[0].w < -60) L.items.shift();
    const lastB = L.items[L.items.length - 1];
    if (lastB.x + lastB.w < W + 60) { const b = L.make(); b.x = lastB.x + lastB.w + rand(...L.gap); L.items.push(b); }
  }
  dist += scroll * dt;

  P.flap += dt;
  if (state === 'title') { P.y = 78 + Math.sin(t * 2) * 6; return; }

  if (state === 'dying') {
    P.vy += 260 * dt; P.y += P.vy * dt;
    if (P.y > H + 10) gameOver();
  }

  if (state === 'play') {
    elapsed += dt;
    speed = Math.min(170, 70 + elapsed * 1.6);
    const up = keys.arrowup || keys.w || keys['ц'], down = keys.arrowdown || keys.s || keys['ы'];
    if (pointerY != null) P.vy = clamp((pointerY - 7 - P.y) * 9, -150, 150);
    else P.vy += (((down ? 1 : 0) - (up ? 1 : 0)) * 115 - P.vy) * Math.min(1, dt * 10);
    P.y = clamp(P.y + P.vy * dt, 10, GY - 15);
    P.inv = Math.max(0, P.inv - dt); P.ai = Math.max(0, P.ai - dt);

    if ((spawn.coin -= dt) <= 0) { spawnCoins(); spawn.coin = rand(1.2, 2.1); }
    if ((spawn.enemy -= dt) <= 0) { Math.random() < .28 ? spawnAntenna() : spawnDrone(); spawn.enemy = Math.max(.5, rand(1.3, 2.1) - elapsed * .012); }
    if ((spawn.pick -= dt) <= 0) { spawnPickup(); spawn.pick = rand(9, 14); }
    if ((prophT -= dt) <= 0) { newProphecy(); prophT = 16; }
    if (oracleHide > 0 && (oracleHide -= dt) <= 0) $('oracle').classList.remove('show');
  }

  const hb = hitbox();
  for (const e of ents) {
    e.x -= speed * dt; e.ph += dt;
    if (e.type === 'drone') {
      e.x -= e.vx * dt;
      if (e.hunter) e.y = clamp(e.y + clamp(P.y + 2 - e.y, -28 * dt, 28 * dt), 12, GY - 20);
      else e.y = e.y0 + Math.sin(e.ph * 2.4) * 10;
    }
    if (e.type === 'coin' && P.ai > 0) {
      const dx = P.x + 10 - e.x, dy = P.y + 6 - e.y, d = Math.hypot(dx, dy);
      if (d < 60) { e.x += dx / d * 160 * dt; e.y += dy / d * 160 * dt; }
    }
    if (state !== 'play' || e.dead || !overlap(hb, boxOf(e))) continue;
    if (e.type === 'coin') {
      e.dead = true;
      const v = !proph ? 1 : e.color === proph.up ? 5 : e.color === proph.down ? -3 : 1;
      score = Math.max(0, score + v);
      floats.push({ x: e.x, y: e.y - 4, s: (v > 0 ? '+' : '') + v, col: v > 1 ? '#39d98a' : v < 0 ? '#ff2e63' : COINS[e.color].f, life: .8 });
      burst(e.x + 4, e.y + 4, COINS[e.color].f, v > 1 ? 10 : 5, 40);
      v > 1 ? SFX.jackpot() : v < 0 ? SFX.bad() : SFX.coin();
      updateHud();
    } else if (e.type === 'neuro') {
      e.dead = true; P.signal = Math.min(3, P.signal + 1); SFX.power(); burst(e.x + 4, e.y + 4, '#39d98a', 12, 50);
      floats.push({ x: e.x, y: e.y - 4, s: '+1', col: '#39d98a', life: .8 }); updateHud();
    } else if (e.type === 'ai') {
      e.dead = true; P.ai = 7; SFX.power(); burst(e.x + 4, e.y + 4, '#4de8ff', 14, 60);
    } else if (P.ai > 0 && e.type === 'drone') {
      e.dead = true; burst(e.x + 8, e.y + 4, '#4de8ff', 14, 70); SFX.bad(); score += 2; updateHud();
    } else if (e.type === 'drone' || e.type === 'ant') {
      if (e.type === 'drone') { e.dead = true; burst(e.x + 8, e.y + 4, '#ffd166', 12, 60); }
      hurt();
    }
  }
  ents = ents.filter(e => !e.dead && e.x > -30);
  for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 60 * dt; p.life -= dt; }
  parts = parts.filter(p => p.life > 0);
  for (const f of floats) { f.y -= 18 * dt; f.life -= dt; }
  floats = floats.filter(f => f.life > 0);
  shake = Math.max(0, shake - dt); glitch = Math.max(0, glitch - dt);
}

// ---------- отрисовка ----------
function draw() {
  g.drawImage(SKY, 0, 0, W, GY);
  for (const s of STARS) {
    const tw = Math.sin(t * 2 + s.p);
    if (tw > -.6) { g.fillStyle = tw > .7 && s.s ? '#ffffff' : '#9d8fe0'; g.fillRect(s.x | 0, s.y | 0, 1, 1); }
    if (s.s && tw > .85) { g.fillStyle = '#9d8fe0'; g.fillRect((s.x | 0) - 1, s.y | 0, 3, 1); g.fillRect(s.x | 0, (s.y | 0) - 1, 1, 3); }
  }
  g.drawImage(SUN, 196, GY - 92);

  LAYERS.forEach(L => {
    for (const b of L.items) {
      const x = Math.round(b.x), y = GY - b.h;
      g.drawImage(b.img, x, y);
      if (b.tower) drawTowerTop(x + b.w / 2, y);
    }
  });

  // земля
  g.fillStyle = '#0a0418'; g.fillRect(0, GY, W, H - GY);
  g.fillStyle = '#ff2e8f'; g.fillRect(0, GY, W, 1);
  g.fillStyle = '#4de8ff';
  for (let x = -(dist % 24); x < W; x += 24) g.fillRect(Math.round(x), GY + 7, 10, 1);
  g.fillStyle = '#3a1a5e';
  for (let x = -((dist * 1.3) % 40); x < W; x += 40) g.fillRect(Math.round(x), GY + 3, 2, 1);

  for (const e of ents) drawEnt(e);
  if (state !== 'over') drawPigeon();
  for (const p of parts) { g.fillStyle = p.col; g.fillRect(p.x | 0, p.y | 0, 1, 1); }
  for (const f of floats) ptext(f.s, Math.round(f.x), Math.round(f.y), f.col);

  // вывод с эффектами
  out.fillStyle = '#000'; out.fillRect(0, 0, W, H);
  const sx = shake > 0 ? rand(-2, 2) | 0 : 0, sy = shake > 0 ? rand(-2, 2) | 0 : 0;
  if (glitch > 0) {
    for (let y = 0; y < H; y += 6) out.drawImage(buf, 0, y, W, 6, sx + (Math.random() < .4 ? rand(-6, 6) | 0 : 0), y + sy, W, 6);
    out.fillStyle = 'rgba(255,46,99,.14)'; out.fillRect(0, 0, W, H);
  } else out.drawImage(buf, sx, sy);
}

function drawTowerTop(cx, top) {
  const sx = Math.round(cx - 6), sy = top - 10;
  g.drawImage(STATUE, sx, sy);
  g.fillStyle = '#c8cce4'; g.fillRect(Math.round(cx) - 1, sy - 3, 2, 3);
  if ((t * 3 | 0) % 2) { g.fillStyle = '#ff2e63'; g.fillRect(Math.round(cx) - 1, sy - 4, 2, 1); }
  g.strokeStyle = '#ff6ad5'; g.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const r = ((t * 14 + i * 16) % 48) + 6;
    g.globalAlpha = Math.max(0, .7 - r / 60);
    g.beginPath(); g.ellipse(Math.round(cx) + .5, sy + 2.5, r, r * .28, 0, 0, Math.PI * 2); g.stroke();
  }
  g.globalAlpha = 1;
}

function drawEnt(e) {
  const x = Math.round(e.x), y = Math.round(e.y);
  if (e.type === 'coin') {
    const c = COINS[e.color], wv = Math.max(1, Math.round(Math.abs(Math.cos(e.ph * 4)) * 8));
    g.drawImage(c.spr, x + Math.round((8 - wv) / 2), y + Math.round(Math.sin(e.ph * 3)), wv, 8);
    if (proph && e.color === proph.up && (t * 6 | 0) % 2) { g.fillStyle = '#ffffff'; g.fillRect(x + 7, y - 1, 1, 1); g.fillRect(x - 1, y + 6, 1, 1); }
  } else if (e.type === 'drone') {
    const img = (e.hunter ? HUNTER : DRONE)[(t * 20 | 0) % 2];
    g.drawImage(img, x, y);
    if ((t * 8 | 0) % 2) { g.fillStyle = e.hunter ? '#ffd166' : '#ff3355'; g.globalAlpha = .35; g.fillRect(x + 6, y + 8, 4, 1); g.globalAlpha = 1; }
  } else if (e.type === 'ant') {
    const top = GY - e.h;
    g.fillStyle = '#3a3550'; g.fillRect(x + 1, top, 2, e.h);
    g.fillStyle = '#56507a'; for (let i = 6; i < e.h; i += 7) g.fillRect(x, top + i, 4, 1);
    g.fillStyle = '#1c1630'; g.fillRect(x - 2, GY - 3, 8, 3);
    g.fillStyle = (t * 3 | 0) % 2 ? '#ff2e63' : '#7a1030'; g.fillRect(x + 1, top - 2, 2, 2);
    g.strokeStyle = '#ff6ad5'; g.globalAlpha = .5;
    const r = 3 + (t * 10 + e.ph) % 8;
    g.beginPath(); g.arc(x + 2, top - 1, r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
  } else {
    const bob = Math.round(Math.sin(e.ph * 4) * 2);
    g.globalAlpha = .35; g.fillStyle = e.type === 'neuro' ? '#39d98a' : '#4de8ff'; g.fillRect(x - 1, y - 1 + bob, 11, 11); g.globalAlpha = 1;
    g.drawImage(e.type === 'neuro' ? NEURO : CHIP, x, y + bob);
  }
}

function drawPigeon() {
  if (P.inv > 0 && (t * 16 | 0) % 2 && state === 'play') return;
  const x = Math.round(P.x), y = Math.round(P.y), up = (P.flap * 9 | 0) % 2 === 0 || state === 'dying';
  if (P.ai > 0) {
    g.strokeStyle = (t * 10 | 0) % 2 ? '#4de8ff' : '#ff6ad5'; g.globalAlpha = P.ai < 1.5 && (t * 8 | 0) % 2 ? .2 : .8;
    g.beginPath(); g.arc(x + 10, y + 6, 13, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
  }
  // нейросигнал от импланта
  if (state === 'play' && (t * 4 | 0) % 2) { g.fillStyle = '#4de8ff'; g.fillRect(x + 7, y - 1, 1, 1); g.fillRect(x + 9, y - 3, 1, 1); }
  if (up) g.drawImage(WING_UP, x, y);
  g.drawImage(PIGEON, x, y);
  if (!up) g.drawImage(WING_DOWN, x, y);
}

// ---------- HUD ----------
const COIN_ICON = '<i class="dot coin"></i>';
let hudScore = -1, hudDist = -1, hudSig = -1;
function updateHud(force) {
  if (force || score !== hudScore) { $('score').innerHTML = COIN_ICON + score; hudScore = score; }
  const m = Math.floor(dist / 10);
  if (force || m !== hudDist) { $('dist').textContent = m + ' м'; hudDist = m; }
  if (force || P.signal !== hudSig) {
    [...$('signal').children].forEach((el, i) => el.classList.toggle('off', i >= P.signal));
    $('signal').classList.toggle('low', P.signal === 1); hudSig = P.signal;
  }
  if (force) $('trend').innerHTML = '';
}
function gameOver() {
  state = 'over';
  const m = Math.floor(dist / 10), rec = score > best;
  if (rec) { best = score; try { localStorage.setItem('pifia-best', best); } catch (e) {} }
  $('finalScore').innerHTML = COIN_ICON + score;
  $('finalStats').innerHTML = `Пролёт: ${m} м<br>${rec ? '<span style="color:#39d98a">НОВЫЙ РЕКОРД!</span>' : 'Рекорд: ' + COIN_ICON + best}`;
  $('finalQuote').textContent = '«' + pick(OVER_QUOTES) + '»';
  show('over');
  setBest();
}
function setBest() { $('bestTitle').innerHTML = best ? ' · Рекорд: ' + COIN_ICON + best : ''; }

// ---------- масштаб ----------
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  const u = s >= 2 ? Math.floor(s) : s;
  document.documentElement.style.setProperty('--u', u + 'px');
}
addEventListener('resize', fit); fit();

// ---------- запуск ----------
{
  const c = $('ratFace').getContext('2d'); c.drawImage(RAT, 0, 0);
  const b = $('ratBig').getContext('2d'); b.drawImage(RAT, 0, 0);
}
resetLayers(); setBest();
let last = performance.now();
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (state !== 'pause') { update(dt); if (state === 'play') updateHud(); }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
