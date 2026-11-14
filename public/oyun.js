/* Herkes Piste — izleyicilerin yönettiği halay ve araba yarışı oyunu (TikTok LIVE) */
(() => {
'use strict';

// ------------------------------------------------------------------ ayarlar
const P = new URLSearchParams(location.search);
const DEMO = P.has('demo');
const INK = '#1B1040', V = '#4A22D4', DISK = '#6A45EE', FL = '#EAE3FF', FD = '#24125C';
const SARI = '#FFD23F', SARI_K = '#F5A70C', BEYAZ = '#FFFFFF', LILA = '#E7E0FF', YESIL = '#4ADE80';
const FONT = "'Baloo 2', system-ui, sans-serif";
const RENKLER = [
  { ana: '#FFD23F', koyu: '#F5A70C' },
  { ana: '#3FE0EA', koyu: '#12AFCB' },
  { ana: '#FF6FAE', koyu: '#E63E86' },
  { ana: '#62E68B', koyu: '#22B455' },
  { ana: '#FF9F43', koyu: '#E8730C' },
  { ana: '#FFFFFF', koyu: '#C9CEDF' },
];
const TAKIMLAR = [
  { no: 1, ad: 'SARI', renk: RENKLER[0] },
  { no: 2, ad: 'MAVİ', renk: RENKLER[1] },
  { no: 3, ad: 'PEMBE', renk: RENKLER[2] },
];
const SURE = { halay: 120, secim: 15, sayim: 3, yaris: 45, sonuc: 8 };
const HALAY_GORUNEN = 10;

const zaman = () => performance.now() / 1000;
const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
const ara = (a, b, t) => a + (b - a) * t;
const rastgele = (a) => a[Math.floor(Math.random() * a.length)];
const kisalt = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const buyuk = (s) => s.toLocaleUpperCase('tr');
function karma(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ------------------------------------------------------------------ tuval ve düzen
const cv = document.getElementById('oyun');
const ctx = cv.getContext('2d');
const arka = document.createElement('canvas');
const actx = arka.getContext('2d');
let W = 1080, H = 1920, olcek = 1, ox = 0, D = null;

function duzen() {
  const ust = Math.max(150, H * 0.075);
  const sahneUst = ust + 600;
  const sahneAlt = Math.max(ust + 1060, H * 0.63);
  const yuk = sahneAlt - sahneUst;
  const hz = sahneUst + yuk * 0.45;
  const on = sahneAlt - 15;
  const yh = hz - 190;
  return {
    ust, panel: ust + 86, talimat: ust + 250, lider: ust + 478,
    sahneUst, sahneAlt, hz, yh, on,
    arkaY: yh + 0.58 * (on - yh),
    sOn: sinir(yuk / 600, 0.7, 1.05),
    cosku: sahneAlt + 26,
  };
}

function boyutla() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = window.innerWidth, ch = window.innerHeight;
  cv.width = arka.width = Math.max(1, Math.round(cw * dpr));
  cv.height = arka.height = Math.max(1, Math.round(ch * dpr));
  cv.style.width = cw + 'px';
  cv.style.height = ch + 'px';
  olcek = Math.min(cv.width / 1080, cv.height / 1700);
  W = cv.width / olcek;
  H = cv.height / olcek;
  ox = (W - 1080) / 2;
  D = duzen();
  arkaCiz();
}

function zemin(c, yTop, xMin, xMax, yMax) {
  const n = 8, kolon = 108, A = 190, yh = yTop - A;
  for (let j = 0; j < n - 1; j++) {
    const k0 = n / (n - j), k1 = n / (n - j - 1);
    const y0 = yh + A * k0, y1 = yh + A * k1;
    if (y0 > yMax + 5) break;
    const w0 = kolon * k0, w1 = kolon * k1;
    const cMax = Math.ceil(Math.max(540 - xMin, xMax - 540) / w0) + 2;
    for (let i = -cMax; i < cMax; i++) {
      c.fillStyle = (i + j) % 2 === 0 ? FL : FD;
      c.beginPath();
      c.moveTo(540 + i * w0, y0); c.lineTo(540 + (i + 1) * w0, y0);
      c.lineTo(540 + (i + 1) * w1, y1); c.lineTo(540 + i * w1, y1);
      c.closePath(); c.fill();
    }
  }
}

function arkaCiz() {
  const c = actx;
  c.setTransform(olcek, 0, 0, olcek, ox * olcek, 0);
  c.fillStyle = V;
  c.fillRect(-ox - 2, -2, W + 4, H + 4);
  c.fillStyle = DISK;
  c.beginPath(); c.arc(540, (D.sahneUst + D.hz) / 2 + 60, 470, 0, Math.PI * 2); c.fill();
  zemin(c, D.hz, -ox, 1080 + ox, H);
  c.fillStyle = BEYAZ;
  c.fillRect(-ox - 2, D.hz - 5, W + 4, 10);
}

// ------------------------------------------------------------------ çizim yardımcıları
function yol(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) { c.roundRect(x, y, w, h, r); return; }
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function kutu(c, x, y, w, h, r, renk) { yol(c, x, y, w, h, r); c.fillStyle = renk; c.fill(); }
function daire(c, x, y, r, renk) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = renk; c.fill(); }
function cizgi(c, noktalar, kalin, renk) {
  c.beginPath(); c.moveTo(noktalar[0][0], noktalar[0][1]);
  for (let i = 1; i < noktalar.length; i++) c.lineTo(noktalar[i][0], noktalar[i][1]);
  c.lineWidth = kalin; c.strokeStyle = renk; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
}
function font(boy, agirlik = 800) { return `${agirlik} ${boy}px ${FONT}`; }
function yazi(c, metin, x, y, boy, renk, o = {}) {
  const agirlik = o.w || 800;
  c.font = font(boy, agirlik);
  c.textAlign = o.hiza || 'center';
  c.textBaseline = 'alphabetic';
  if (o.maxW) {
    while (c.measureText(metin).width > o.maxW && boy > 12) { boy *= 0.93; c.font = font(boy, agirlik); }
  }
  if (o.golge) { c.fillStyle = o.golgeRenk || INK; c.fillText(metin, x, y + boy * 0.075); }
  c.fillStyle = renk;
  c.fillText(metin, x, y);
  return c.measureText(metin).width;
}
function genislik(c, metin, boy, agirlik = 800) { c.font = font(boy, agirlik); return c.measureText(metin).width; }
function hap(c, metin, x, y, boy, zemin, renk, o = {}) {
  const pad = o.pad ?? boy * 0.55, h = o.h ?? boy * 1.45;
  const w = genislik(c, metin, boy, o.w || 800) + pad * 2;
  const sol = o.hiza === 'left' ? x : o.hiza === 'right' ? x - w : x - w / 2;
  kutu(c, sol, y - h / 2, w, h, h / 2, zemin);
  yazi(c, metin, sol + w / 2, y + boy * 0.34, boy, renk, { w: o.w });
  return w;
}
function parilti(c, x, y, r, renk, alfa = 1) {
  const k = 0.16 * r;
  c.save(); c.globalAlpha *= alfa; c.fillStyle = renk; c.beginPath();
  c.moveTo(x, y - r); c.bezierCurveTo(x + k, y - k, x + k, y - k, x + r, y);
  c.bezierCurveTo(x + k, y + k, x + k, y + k, x, y + r);
  c.bezierCurveTo(x - k, y + k, x - k, y + k, x - r, y);
  c.bezierCurveTo(x - k, y - k, x - k, y - k, x, y - r);
  c.fill(); c.restore();
}
function nota(c, x, y, k, renk) {
  c.fillStyle = renk;
  for (const [dx, dy] of [[0, 0], [44, -12]]) {
    const hx = x + k * dx, hy = y + k * dy;
    c.save(); c.translate(hx, hy); c.rotate(-0.38); c.beginPath(); c.ellipse(0, 0, 15 * k, 11 * k, 0, 0, Math.PI * 2); c.fill(); c.restore();
    c.fillRect(hx + 9 * k, hy - 58 * k, 6.5 * k, 58 * k);
  }
  c.beginPath(); c.moveTo(x + 9 * k, y - 60 * k); c.lineTo(x + 59.5 * k, y - 72 * k);
  c.lineTo(x + 59.5 * k, y - 56 * k); c.lineTo(x + 9 * k, y - 44 * k); c.closePath(); c.fill();
}
function kalp(c, x, y, r, renk) {
  c.fillStyle = renk; c.beginPath();
  c.moveTo(x, y + r * 0.9);
  c.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.45);
  c.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.4, y - r * 0.1, x, y + r * 0.9);
  c.fill();
}
function tac(c, x, y, w, renk = SARI) {
  const h = w * 0.62;
  c.fillStyle = renk; c.beginPath();
  c.moveTo(x - w / 2, y); c.lineTo(x - w / 2, y - h * 0.55); c.lineTo(x - w * 0.25, y - h * 0.25);
  c.lineTo(x, y - h); c.lineTo(x + w * 0.25, y - h * 0.25); c.lineTo(x + w / 2, y - h * 0.55);
  c.lineTo(x + w / 2, y); c.closePath(); c.fill();
}
function elmasIkon(c, x, y, r, renk = '#7FE7FF') {
  c.fillStyle = renk; c.beginPath();
  c.moveTo(x - r, y - r * 0.35); c.lineTo(x - r * 0.5, y - r); c.lineTo(x + r * 0.5, y - r);
  c.lineTo(x + r, y - r * 0.35); c.lineTo(x, y + r); c.closePath(); c.fill();
}

// avatar resimleri
const resimler = new Map();
function resim(url) {
  if (!url) return null;
  let e = resimler.get(url);
  if (!e) {
    if (resimler.size > 300) resimler.delete(resimler.keys().next().value);
    const im = new Image();
    im.referrerPolicy = 'no-referrer';
    e = { im, ok: false };
    im.onload = () => { e.ok = true; };
    im.src = url;
    resimler.set(url, e);
  }
  return e.ok ? e.im : null;
}
function avatar(c, kisi, x, y, r) {
  const im = resim(kisi && kisi.av);
  c.save();
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.closePath();
  if (im) { c.clip(); c.drawImage(im, x - r, y - r, r * 2, r * 2); }
  else {
    c.fillStyle = kisi ? kisi.renk.ana : DISK; c.fill();
    yazi(c, buyuk((kisi ? kisi.ad : '?').trim().charAt(0) || '?'), x, y + r * 0.42, r * 1.2, INK);
  }
  c.restore();
}

// ------------------------------------------------------------------ robot
const KOL = {
  yukari: [[58, -236], [116, -270], [100, -376]],
  salla: [[58, -236], [128, -256], [150, -350]],
  bel: [[58, -236], [120, -186], [72, -146]],
  asagi: [[58, -236], [96, -176], [90, -112]],
  havada: [[58, -236], [104, -288], [132, -392]],
};
function kafa(c, x, gy, s, r, goz = 'mutlu') {
  const X = (v) => x + s * v, Y = (v) => gy + s * v;
  for (const e of [-1, 1]) kutu(c, X(e * 83) - 9 * s, Y(-350), 18 * s, 40 * s, 8 * s, r.koyu);
  cizgi(c, [[X(0), Y(-386)], [X(0), Y(-424)]], 9 * s, r.koyu);
  daire(c, X(0), Y(-434), 15 * s, BEYAZ);
  kutu(c, X(-78), Y(-388), 156 * s, 116 * s, 42 * s, r.ana);
  c.globalAlpha = 0.45; kutu(c, X(-58), Y(-380), 70 * s, 10 * s, 5 * s, BEYAZ); c.globalAlpha = 1;
  kutu(c, X(-57), Y(-366), 114 * s, 70 * s, 30 * s, INK);
  for (const e of [-1, 1]) {
    const ex = X(e * 26), ey = Y(-330), rr = 13 * s;
    if (goz === 'acik') daire(c, ex, ey, rr * 0.95, BEYAZ);
    else {
      c.beginPath(); c.moveTo(ex - rr, ey + rr * 0.55); c.quadraticCurveTo(ex, ey - rr * 1.35, ex + rr, ey + rr * 0.55);
      c.lineWidth = 9 * s; c.strokeStyle = BEYAZ; c.lineCap = 'round'; c.stroke();
    }
  }
}
function kol(c, x, gy, s, r, taraf, spec) {
  const pts = (typeof spec === 'string' ? KOL[spec] : spec).map(([px, py]) => [x + s * px * taraf, gy + s * py]);
  cizgi(c, pts, 27 * s, r.koyu);
  const son = pts[pts.length - 1];
  daire(c, son[0], son[1], 22 * s, BEYAZ);
  return son;
}
function robot(c, x, gy, s, r, o = {}) {
  const j = o.zipla || 0;
  const by = gy - j;
  const X = (v) => x + s * v, Y = (v) => by + s * v;
  if (o.golge !== false) {
    c.save(); c.globalAlpha = 0.38 * (1 - Math.min(j / 220, 0.6));
    c.beginPath(); c.ellipse(x, gy + 4 * s, 96 * s, 15 * s, 0, 0, Math.PI * 2); c.fillStyle = '#120A2E'; c.fill(); c.restore();
  }
  if (o.kolSol) kol(c, x, by, s, r, -1, o.kolSol);
  if (o.kolSag) kol(c, x, by, s, r, 1, o.kolSag);
  const sw = 30 * s;
  if (o.dur) {
    for (const e of [-1, 1]) {
      cizgi(c, [[X(30 * e), Y(-120)], [X(30 * e), Y(-22)]], sw, r.koyu);
      kutu(c, X(34 * e) - 31 * s, Y(-26), 62 * s, 27 * s, 13.5 * s, BEYAZ);
    }
  } else {
    const sgn = (o.adim || 0) % 2 ? 1 : -1;
    const kalk = Math.sin((o.faz || 0) * Math.PI);
    cizgi(c, [[X(-26 * sgn), Y(-120)], [X(-26 * sgn), Y(-22)]], sw, r.koyu);
    kutu(c, X(-26 * sgn) - 31 * s, Y(-26), 62 * s, 27 * s, 13.5 * s, BEYAZ);
    const diz = [ara(26, 64, kalk) * sgn, ara(-70, -88, kalk)];
    const bilek = [ara(26, 48, kalk) * sgn, ara(-22, -46, kalk)];
    cizgi(c, [[X(26 * sgn), Y(-120)], [X(diz[0]), Y(diz[1])], [X(bilek[0]), Y(bilek[1])]], sw, r.koyu);
    const fx = X(ara(26, 50, kalk) * sgn), fy = Y(ara(-12.5, -36, kalk));
    c.save(); c.translate(fx, fy); c.rotate((-14 * sgn * kalk * Math.PI) / 180);
    kutu(c, -31 * s, -13.5 * s, 62 * s, 27 * s, 13.5 * s, BEYAZ); c.restore();
  }
  c.fillStyle = r.koyu; c.fillRect(X(-17), Y(-282), 34 * s, 30 * s);
  kutu(c, X(-62), Y(-264), 124 * s, 162 * s, 38 * s, r.ana);
  c.fillStyle = INK; c.fillRect(X(-62), Y(-158), 124 * s, 22 * s);
  daire(c, X(0), Y(-214), 15 * s, o.isik || BEYAZ);
  kafa(c, x, by, s, r, o.goz);
}
function mendil(c, mx, my, m, aci) {
  const M = (x, y) => [m * x, m * y];
  c.save(); c.translate(mx, my); c.rotate(aci);
  c.beginPath();
  c.moveTo(...M(0, 8));
  c.bezierCurveTo(...M(-20, -22), ...M(-44, -58), ...M(-30, -104));
  c.bezierCurveTo(...M(-12, -118), ...M(6, -98), ...M(26, -112));
  c.bezierCurveTo(...M(46, -126), ...M(66, -108), ...M(90, -118));
  c.bezierCurveTo(...M(78, -78), ...M(46, -36), ...M(0, 8));
  c.closePath(); c.fillStyle = BEYAZ; c.fill();
  c.beginPath(); c.moveTo(...M(-30, -104));
  c.bezierCurveTo(...M(-12, -118), ...M(6, -98), ...M(26, -112));
  c.bezierCurveTo(...M(46, -126), ...M(66, -108), ...M(90, -118));
  c.lineWidth = 7 * m; c.strokeStyle = '#FF6FAE'; c.lineCap = 'round'; c.stroke();
  c.restore();
}
function hayalet(c, x, gy, s, t) {
  c.save();
  c.setLineDash([18 * s, 14 * s]); c.lineDashOffset = -t * 40;
  c.lineWidth = 7 * s; c.strokeStyle = BEYAZ; c.lineCap = 'round';
  yol(c, x - 78 * s, gy - 388 * s, 156 * s, 116 * s, 42 * s); c.stroke();
  yol(c, x - 62 * s, gy - 264 * s, 124 * s, 162 * s, 38 * s); c.stroke();
  c.beginPath(); c.moveTo(x - 30 * s, gy - 98 * s); c.lineTo(x - 30 * s, gy - 14 * s);
  c.moveTo(x + 30 * s, gy - 98 * s); c.lineTo(x + 30 * s, gy - 14 * s); c.stroke();
  c.setLineDash([]);
  cizgi(c, [[x - 24 * s, gy - 330 * s], [x + 24 * s, gy - 330 * s]], 13 * s, SARI);
  cizgi(c, [[x, gy - 354 * s], [x, gy - 306 * s]], 13 * s, SARI);
  c.restore();
}

// ------------------------------------------------------------------ araba
function araba(c, x, y, s, r, no, o = {}) {
  const X = (v) => x + s * v, Y = (v) => y + s * v;
  if (o.hiz > 0.01) {
    c.save(); c.globalAlpha = Math.min(0.85, o.hiz * 14);
    for (const [yy, L] of [[-98, 120], [-70, 180], [-42, 110]]) cizgi(c, [[X(-196 - L), Y(yy)], [X(-196), Y(yy)]], 11 * s, BEYAZ);
    c.restore();
  }
  if (o.nitro) {
    const t = o.t || 0;
    for (let i = 0; i < 3; i++) {
      const L = (70 + 40 * Math.sin(t * 40 + i * 2)) * s;
      c.fillStyle = i === 0 ? '#FF6B2C' : i === 1 ? SARI : BEYAZ;
      c.beginPath(); c.moveTo(X(-160), Y(-66 + i * 6)); c.lineTo(X(-160) - L * (1 - i * 0.3), Y(-56)); c.lineTo(X(-160), Y(-46 - i * 6)); c.closePath(); c.fill();
    }
  }
  c.save(); c.globalAlpha = 0.4; c.beginPath(); c.ellipse(X(4), Y(4), 176 * s, 14 * s, 0, 0, Math.PI * 2); c.fillStyle = '#120A2E'; c.fill(); c.restore();
  c.fillStyle = r.koyu; c.fillRect(X(-150), Y(-128), 12 * s, 30 * s);
  kutu(c, X(-176), Y(-142), 68 * s, 16 * s, 8 * s, r.koyu);
  const hs = 0.6 * s;
  kafa(c, X(-34), Y(-100) + 272 * hs, hs, r);
  c.save(); c.globalAlpha = 0.6; c.fillStyle = BEYAZ; c.beginPath();
  c.moveTo(X(44), Y(-104)); c.lineTo(X(72), Y(-156)); c.lineTo(X(86), Y(-156)); c.lineTo(X(84), Y(-104)); c.closePath(); c.fill(); c.restore();
  c.beginPath();
  c.moveTo(X(-160), Y(-58)); c.lineTo(X(-160), Y(-88)); c.quadraticCurveTo(X(-160), Y(-106), X(-138), Y(-106));
  c.lineTo(X(60), Y(-106)); c.quadraticCurveTo(X(124), Y(-106), X(152), Y(-82)); c.quadraticCurveTo(X(172), Y(-64), X(170), Y(-50));
  c.quadraticCurveTo(X(170), Y(-36), X(156), Y(-36)); c.lineTo(X(-148), Y(-36)); c.quadraticCurveTo(X(-160), Y(-36), X(-160), Y(-48));
  c.closePath(); c.fillStyle = r.ana; c.fill();
  kutu(c, X(-160), Y(-60), 330 * s, 24 * s, 12 * s, r.koyu);
  daire(c, X(158), Y(-70), 9 * s, '#FFF6C2');
  daire(c, X(34), Y(-82), 22 * s, BEYAZ);
  yazi(c, String(no), X(34), Y(-82) + 12 * s, 34 * s, INK);
  const don = (o.t || 0) * (o.hiz || 0) * 60;
  for (const wx of [-92, 98]) {
    daire(c, X(wx), Y(-34), 36 * s, INK);
    daire(c, X(wx), Y(-34), 14 * s, FL);
    c.fillStyle = INK; c.save(); c.translate(X(wx), Y(-34)); c.rotate(don); c.fillRect(-3 * s, -14 * s, 6 * s, 28 * s); c.restore();
  }
}

// ------------------------------------------------------------------ ses (davul ve efektler)
const Ses = (() => {
  let ac = null, ana = null, gurultu = null, sonraki = 0, adim = 0;
  function baslat(acik) {
    if (!acik || ac) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      ana = ac.createGain(); ana.gain.value = 0.5; ana.connect(ac.destination);
      gurultu = ac.createBuffer(1, ac.sampleRate * 0.25, ac.sampleRate);
      const d = gurultu.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      sonraki = ac.currentTime + 0.1;
    } catch { ac = null; }
  }
  function devam() { if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); }
  function dum(t, g = 1) {
    const o = ac.createOscillator(), v = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.15);
    v.gain.setValueAtTime(0.95 * g, t); v.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    o.connect(v); v.connect(ana); o.start(t); o.stop(t + 0.26);
  }
  function tek(t, g = 1) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), v = ac.createGain();
    s.buffer = gurultu; f.type = 'bandpass'; f.frequency.value = 2300; f.Q.value = 1.1;
    v.gain.setValueAtTime(0.4 * g, t); v.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    s.connect(f); f.connect(v); v.connect(ana); s.start(t); s.stop(t + 0.1);
  }
  const DESEN = ['D', '', 'T', '', 'D', 'D', 'T', ''];
  function zamanla(bpm) {
    if (!ac || ac.state !== 'running') return;
    const sekizlik = 60 / bpm / 2;
    if (sonraki < ac.currentTime - 0.2) sonraki = ac.currentTime + 0.05;
    while (sonraki < ac.currentTime + 0.15) {
      const n = DESEN[adim % 8];
      if (n === 'D') dum(sonraki, adim % 8 === 0 ? 1 : 0.8); else if (n === 'T') tek(sonraki);
      adim++; sonraki += sekizlik;
    }
  }
  function ton(f, t0, sure, tip = 'triangle', g = 0.22) {
    const o = ac.createOscillator(), v = ac.createGain();
    o.type = tip; o.frequency.setValueAtTime(f, t0);
    v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + 0.015);
    v.gain.exponentialRampToValueAtTime(0.0001, t0 + sure);
    o.connect(v); v.connect(ana); o.start(t0); o.stop(t0 + sure + 0.02);
  }
  function dizi(fs, ara_ = 0.07, sure = 0.16, tip = 'triangle', g = 0.2) {
    if (!ac || ac.state !== 'running') return;
    const t = ac.currentTime + 0.01;
    fs.forEach((f, i) => ton(f, t + i * ara_, sure, tip, g));
  }
  return {
    baslat, devam, zamanla,
    pop: () => dizi([660, 990], 0.06, 0.09, 'sine', 0.16),
    hediye: () => dizi([784, 988, 1175, 1568], 0.06, 0.18),
    buyuk: () => dizi([523, 659, 784, 1047, 1319, 1568], 0.08, 0.3, 'triangle', 0.24),
    zafer: () => dizi([523, 659, 784, 1047, 784, 1047], 0.13, 0.32, 'square', 0.1),
    sayim: () => dizi([880], 0, 0.18, 'square', 0.1),
    basla: () => dizi([1320], 0, 0.45, 'square', 0.12),
  };
})();

// ------------------------------------------------------------------ oyun durumu
const S = {
  tur: 'halay', turBitis: zaman() + SURE.halay,
  kisiler: new Map(),
  hediye: new Map(),
  cosku: 0, seviye: 1, tempoBitis: 0, vurus: 0,
  yaris: null, bas: null,
  durum: DEMO ? 'deneme' : 'bekliyor', durumMesaj: '', izleyici: 0, sunucu: DEMO,
  sonGirisToast: 0, sonKatilToast: 0,
};

function kisi(k) {
  if (!k || !k.id) return null;
  let r = S.kisiler.get(k.id);
  if (!r) {
    r = { id: k.id, ad: k.ad || k.id, av: k.av || '', renk: RENKLER[karma(k.id) % RENKLER.length], halayda: false, katilma: 0, son: 0, zipla: -9 };
    S.kisiler.set(k.id, r);
    if (S.kisiler.size > 3000) {
      for (const [id, v] of S.kisiler) { if (!v.halayda && !S.hediye.has(id)) { S.kisiler.delete(id); if (S.kisiler.size < 2500) break; } }
    }
  } else {
    if (k.ad) r.ad = k.ad;
    if (k.av) r.av = k.av;
  }
  return r;
}
function halayaKat(r, sessiz = false) {
  const t = zaman();
  if (!r.halayda) {
    r.halayda = true; r.katilma = t;
    if (!sessiz && t - S.sonKatilToast > 0.7) { S.sonKatilToast = t; tost(`${r.ad} halaya katıldı`, r, 'katil'); }
    Ses.pop();
  }
  r.son = t;
}
function ziplat(r) { r.zipla = zaman(); }

// ------------------------------------------------------------------ efektler
const parca = [];
function kivilcim(x, y, adet, renkler = [SARI, BEYAZ, '#FF6FAE', '#3FE0EA']) {
  for (let i = 0; i < adet && parca.length < 700; i++) {
    const a = Math.random() * Math.PI * 2, h = 200 + Math.random() * 520;
    parca.push({ tip: 'k', x, y, vx: Math.cos(a) * h, vy: Math.sin(a) * h - 120, omur: 0.9 + Math.random() * 0.7, yas: 0, renk: rastgele(renkler), boy: 6 + Math.random() * 8 });
  }
}
function havaiFisek(n = 3) {
  for (let i = 0; i < n; i++) {
    const x = 160 + Math.random() * 760, y = D.sahneUst + 60 + Math.random() * 260;
    setTimeout(() => { kivilcim(x, y, 60); }, i * 220);
  }
}
function konfeti(n = 160) {
  for (let i = 0; i < n && parca.length < 900; i++) {
    parca.push({ tip: 'c', x: Math.random() * 1080, y: D.sahneUst - 200 - Math.random() * 500, vx: (Math.random() - 0.5) * 120, vy: 220 + Math.random() * 260,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, omur: 4, yas: 0, renk: rastgele([SARI, '#3FE0EA', '#FF6FAE', '#62E68B', BEYAZ]), w: 14 + Math.random() * 10, h: 8 + Math.random() * 6 });
  }
}
function kalpler(n) {
  for (let i = 0; i < Math.min(n, 6) && parca.length < 900; i++) {
    parca.push({ tip: 'h', x: 940 + (Math.random() - 0.5) * 120, y: D.sahneAlt - 20, vx: (Math.random() - 0.5) * 60, vy: -(260 + Math.random() * 200),
      omur: 1.8 + Math.random() * 0.6, yas: Math.random() * -0.4, renk: rastgele(['#FF4F9A', '#FF6FAE', '#FF8FC0', SARI]), boy: 16 + Math.random() * 12 });
  }
}

const tostlar = [];
function tost(metin, r, tip = 'bilgi') {
  if (tip === 'katil' && tostlar.filter((x) => x.tip === 'katil').length >= 2) return;
  tostlar.push({ metin, r, tip, t0: zaman(), sure: tip === 'hediye' ? 4 : 2.6 });
  while (tostlar.length > 5) {
    const i = tostlar.findIndex((x) => x.tip !== 'hediye');
    tostlar.splice(i >= 0 ? i : 0, 1);
  }
}
let afis = null;
function duyuru(baslik, alt = '', renk = SARI, sure = 2.6) { afis = { baslik, alt, renk, t0: zaman(), sure }; }

// ------------------------------------------------------------------ olaylar (izleyici hareketleri)
function kelimeler(m) { return buyuk(m).toLocaleLowerCase('tr').split(/[^0-9a-zçğıöşüâîû]+/u).filter(Boolean); }
const GIR = new Set(['gir', 'gır', 'katıl', 'katil', 'halay', 'gire', 'girdim']);
const HOP = new Set(['hop', 'hopp', 'hoppa', 'zıpla', 'zipla', 'oley', 'hey']);
const TAKIM_KELIME = { '1': 1, '2': 2, '3': 3, 'sarı': 1, 'sari': 1, 'mavi': 2, 'pembe': 3 };

function olay(e) {
  const r = kisi(e.k);
  if (!r && e.t !== 'izleyici') return;
  const t = zaman();
  switch (e.t) {
    case 'yorum': {
      const w = kelimeler(e.m || '');
      if (S.tur === 'halay') {
        if (w.some((x) => GIR.has(x))) { halayaKat(r); ziplat(r); }
        else if (w.some((x) => HOP.has(x))) { halayaKat(r); ziplat(r); }
        else if (r.halayda) { r.son = t; S.cosku += 1.2; }
      } else {
        const no = w.map((x) => TAKIM_KELIME[x]).find(Boolean);
        if (no) takimSec(r, no);
        else yarisKatki(r, 3, 3);
        if (w.some((x) => GIR.has(x) || HOP.has(x))) halayaKat(r, true);
      }
      break;
    }
    case 'begeni': {
      kalpler(Math.ceil(e.n / 3));
      if (S.tur === 'halay') {
        S.cosku += (e.n * 0.8) / (1 + 0.25 * (S.seviye - 1));
        if (r.halayda) { r.son = t; if (Math.random() < 0.35) ziplat(r); }
      } else yarisKatki(r, e.n, e.n);
      break;
    }
    case 'hediye': hediye(r, e); break;
    case 'takip':
      tost(`${r.ad} takip etti, hoş geldin!`, r, 'takip');
      if (S.tur === 'halay') S.cosku += 6; else yarisKatki(r, 10, 10);
      break;
    case 'paylasim':
      tost(`${r.ad} yayını paylaştı`, r, 'takip');
      if (S.tur === 'halay') S.cosku += 8; else yarisKatki(r, 12, 12);
      break;
    case 'giris':
      if (t - S.sonGirisToast > 4 && !r.halayda) {
        S.sonGirisToast = t;
        tost(S.tur === 'halay' ? `${r.ad} geldi · GİR yaz, halaya katıl` : `${r.ad} geldi · 1, 2 ya da 3 yaz`, r, 'giris');
      }
      break;
    case 'izleyici': S.izleyici = e.n; break;
  }
}

function hediye(r, e) {
  const elmas = Math.max(1, Number(e.elmas) || 1);
  const h = S.hediye.get(r.id) || { id: r.id, elmas: 0 };
  h.elmas += elmas;
  S.hediye.set(r.id, h);
  const adetYazi = e.adet > 1 ? ` ×${e.adet}` : '';
  tost(`${r.ad}: ${e.ad || 'Hediye'}${adetYazi}`, r, 'hediye');
  halayaKat(r, true);
  ziplat(r);
  const yeniBas = basHesapla();
  if (yeniBas && yeniBas !== S.bas) {
    S.bas = yeniBas;
    if (S.tur === 'halay' && elmas < 99) duyuru('HALAYBAŞI!', yeniBas.ad, SARI);
  }
  if (S.tur === 'halay') {
    S.cosku += Math.min(60, elmas * 4);
    if (elmas >= 500) { duyuru('HALAY ŞÖLENİ!', r.ad, '#FF6FAE', 3.2); seviyeAtla(); konfeti(260); havaiFisek(5); Ses.buyuk(); S.tempoBitis = zaman() + 12; }
    else if (elmas >= 99) { duyuru('HERKES ZIPLASIN!', r.ad, '#3FE0EA'); for (const k of S.kisiler.values()) if (k.halayda) k.zipla = zaman() + Math.random() * 0.25; havaiFisek(3); Ses.buyuk(); S.tempoBitis = zaman() + 10; }
    else if (elmas >= 30) { duyuru('DAVUL ZURNA!', r.ad, SARI); havaiFisek(2); Ses.hediye(); S.tempoBitis = zaman() + 8; }
    else { Ses.hediye(); kivilcim(540, D.sahneUst + 140, 24); }
  } else {
    yarisHediye(r, elmas);
  }
}

function basHesapla() {
  let en = null;
  for (const h of S.hediye.values()) if (!en || h.elmas > en.elmas) en = h;
  return en ? S.kisiler.get(en.id) || null : null;
}
function liderler() {
  return [...S.hediye.values()].sort((a, b) => b.elmas - a.elmas).slice(0, 3).map((h) => ({ k: S.kisiler.get(h.id), elmas: h.elmas })).filter((x) => x.k);
}
function seviyeAtla() {
  S.seviye++; S.cosku = 0;
  duyuru(`COŞKU ${S.seviye}!`, 'Halay hızlandı', SARI);
  havaiFisek(3); Ses.buyuk();
}

// ------------------------------------------------------------------ yarış
function yarisBaslat() {
  S.tur = 'yaris';
  S.yaris = {
    asama: 'secim', bitis: zaman() + SURE.secim, sonSayim: 0,
    takimlar: TAKIMLAR.map((t) => ({ ...t, p: 0, enerji: 0, nitro: 0, uyeler: 0, hiz: 0, katki: new Map() })),
    uye: new Map(), kazanan: null, yardimcilar: [],
  };
  duyuru('ARABA YARIŞI', '1, 2 ya da 3 yaz, takımını seç', '#3FE0EA', 3);
}
function takim(no) { return S.yaris.takimlar[no - 1]; }
function takimSec(r, no) {
  const y = S.yaris;
  if (!y || y.asama === 'sonuc') return;
  const onceki = y.uye.get(r.id);
  if (onceki === no) return;
  if (onceki) takim(onceki).uyeler--;
  y.uye.set(r.id, no);
  takim(no).uyeler++;
  if (!onceki) tost(`${r.ad} → ${takim(no).ad} takım`, r, 'katil');
}
function otomatikTakim(r) {
  const y = S.yaris;
  if (y.uye.has(r.id)) return y.uye.get(r.id);
  const en = Math.min(...y.takimlar.map((t) => t.uyeler));
  const no = rastgele(y.takimlar.filter((t) => t.uyeler === en)).no;
  takimSec(r, no);
  return no;
}
function yarisKatki(r, enerji, puan) {
  const y = S.yaris;
  if (!y || y.asama === 'sonuc') return;
  const no = otomatikTakim(r);
  if (y.asama !== 'yaris') return;
  const t = takim(no);
  t.enerji += enerji;
  t.katki.set(r.id, (t.katki.get(r.id) || 0) + puan);
}
function yarisHediye(r, elmas) {
  const y = S.yaris;
  if (!y || y.asama === 'sonuc') { Ses.hediye(); return; }
  const no = otomatikTakim(r);
  const t = takim(no);
  if (y.asama === 'yaris') {
    t.enerji += Math.min(500, elmas * 10);
    t.nitro = Math.min(6, t.nitro + 1 + elmas / 30);
    t.katki.set(r.id, (t.katki.get(r.id) || 0) + elmas * 10);
    duyuru('NİTRO!', `${r.ad} · ${t.ad}`, t.renk.ana, 1.6);
  }
  Ses.hediye();
}
function yarisGuncelle(dt) {
  const y = S.yaris, t = zaman();
  if (y.asama === 'secim' && t >= y.bitis) { y.asama = 'sayim'; y.bitis = t + SURE.sayim; y.sonSayim = 0; }
  if (y.asama === 'sayim') {
    const kalan = Math.ceil(y.bitis - t);
    if (kalan !== y.sonSayim && kalan > 0) { y.sonSayim = kalan; Ses.sayim(); }
    if (t >= y.bitis) { y.asama = 'yaris'; y.bitis = t + SURE.yaris; Ses.basla(); duyuru('BAŞLA!', 'Beğen, gaz ver!', YESIL, 1.4); }
  }
  if (y.asama === 'yaris') {
    let bitti = null;
    for (const k of y.takimlar) {
      k.enerji *= Math.exp(-dt / 2.2);
      let v = Math.min(0.09, 0.004 + 0.0042 * Math.sqrt(k.enerji));
      if (k.nitro > 0) { v += 0.05; k.nitro = Math.max(0, k.nitro - dt); }
      k.hiz = v;
      k.p = Math.min(1, k.p + v * dt);
      if (k.p >= 1 && !bitti) bitti = k;
    }
    if (bitti || t >= y.bitis) yarisBitir(bitti || [...y.takimlar].sort((a, b) => b.p - a.p)[0]);
  }
  if (y.asama === 'sonuc' && t >= y.bitis) {
    S.tur = 'halay'; S.turBitis = t + SURE.halay; S.yaris = null;
    duyuru('HALAY ZAMANI', 'GİR yaz, halaya katıl', SARI, 3);
  }
}
function yarisBitir(k) {
  const y = S.yaris;
  y.asama = 'sonuc'; y.bitis = zaman() + SURE.sonuc; y.kazanan = k;
  for (const tk of y.takimlar) tk.hiz = 0;
  y.yardimcilar = [...k.katki.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => S.kisiler.get(id)).filter(Boolean);
  konfeti(220); havaiFisek(4); Ses.zafer();
}

// ------------------------------------------------------------------ güncelleme
function guncelle(dt) {
  const t = zaman();
  if (S.tur === 'halay') {
    if (S.cosku > 0) S.cosku = Math.max(0, S.cosku - dt * 0.6);
    if (S.cosku >= 100) seviyeAtla();
    if (t >= S.turBitis) yarisBaslat();
  } else yarisGuncelle(dt);
  const bpm = S.tur === 'halay' ? Math.min(150, 96 + (S.seviye - 1) * 7) + (t < S.tempoBitis ? 14 : 0) : 124;
  S.bpm = bpm;
  S.vurus += (dt * bpm) / 60;
  Ses.zamanla(bpm);
  for (let i = parca.length - 1; i >= 0; i--) {
    const p = parca[i];
    p.yas += dt;
    if (p.yas >= p.omur) { parca.splice(i, 1); continue; }
    if (p.yas < 0) continue;
    if (p.tip === 'k') { p.vx *= 0.97; p.vy = p.vy * 0.97 + 420 * dt; }
    if (p.tip === 'c') { p.rot += p.vr * dt; p.vx += Math.sin(t * 3 + p.y * 0.01) * 20 * dt; }
    if (p.tip === 'h') p.vx += Math.sin(t * 4 + p.x) * 30 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = tostlar.length - 1; i >= 0; i--) if (t - tostlar[i].t0 > tostlar[i].sure) tostlar.splice(i, 1);
  if (afis && t - afis.t0 > afis.sure) afis = null;
}

// ------------------------------------------------------------------ çizim
function halaySirasi() {
  const t = zaman();
  const halay = [...S.kisiler.values()].filter((k) => k.halayda);
  const bas = S.bas && S.bas.halayda ? S.bas : null;
  const digerleri = halay.filter((k) => k !== bas).sort((a, b) => b.son - a.son).slice(0, bas ? HALAY_GORUNEN - 1 : HALAY_GORUNEN);
  digerleri.sort((a, b) => a.katilma - b.katilma);
  const sira = bas ? [bas, ...digerleri] : digerleri;
  return { sira, toplam: halay.length, t };
}

function halayCiz() {
  const c = ctx;
  const { sira, t } = halaySirasi();
  const n = sira.length;
  const vurus = S.vurus, adim = Math.floor(vurus), faz = vurus % 1;
  if (n === 0) {
    const s = D.sOn * 0.9, x = 540, gy = D.on;
    hayalet(c, x, gy, s, t);
    hap(c, 'GİR yaz, ilk sen katıl!', x, gy - 520 * s, 44, SARI, INK);
    return;
  }
  const yay = 13 * Math.sin(vurus * Math.PI);
  const span = Math.min(800, (n - 1) * 120);
  const konum = sira.map((k, i) => {
    const u = n === 1 ? 0 : i / (n - 1);
    const derin = n === 1 ? 0 : u * Math.min(1, (n - 1) / 7);
    const gy = ara(D.on, D.arkaY, derin);
    const s = D.sOn * (gy - D.yh) / (D.on - D.yh);
    const x = 540 - span / 2 + u * span + yay * s;
    const zt = t - k.zipla;
    const zipla = zt >= 0 && zt < 0.55 ? Math.sin((zt / 0.55) * Math.PI) * 110 * s : 0;
    const zipBob = Math.abs(Math.sin(faz * Math.PI)) * 9 * s;
    return { k, x, gy, s, zipla: zipla + zipBob };
  });
  // el ele tutuşan kollar
  for (let i = 0; i < n - 1; i++) {
    const a = konum[i], b = konum[i + 1];
    const ya = a.gy - a.zipla, yb = b.gy - b.zipla;
    const elbowA = [a.x + a.s * 98, ya - a.s * 190], elbowB = [b.x - b.s * 98, yb - b.s * 190];
    const sal = Math.sin(faz * Math.PI * 2) * 14 * (a.s + b.s) / 2;
    const el = [(elbowA[0] + elbowB[0]) / 2, Math.min(elbowA[1], elbowB[1]) - 70 * (a.s + b.s) / 2 + sal];
    cizgi(c, [[a.x + a.s * 58, ya - a.s * 236], elbowA, el], 27 * a.s, a.k.renk.koyu);
    cizgi(c, [[b.x - b.s * 58, yb - b.s * 236], elbowB, el], 27 * b.s, b.k.renk.koyu);
    daire(c, el[0], el[1], 22 * Math.max(a.s, b.s), BEYAZ);
  }
  // robotlar (arkadan öne)
  for (let i = n - 1; i >= 0; i--) {
    const p = konum[i];
    const ilk = i === 0, son = i === n - 1;
    let kolSol = null, kolSag = null;
    if (ilk) kolSol = 'yukari';
    if (son && n > 1) kolSag = Math.floor(vurus) % 2 ? 'salla' : 'havada';
    if (n === 1) { kolSol = 'yukari'; kolSag = 'bel'; }
    robot(c, p.x, p.gy, p.s, p.k.renk, { adim, faz, zipla: p.zipla, kolSol, kolSag, isik: p.k === S.bas ? SARI : BEYAZ });
    if (ilk) {
      const el = [p.x - p.s * 100, p.gy - p.zipla - p.s * 376];
      mendil(c, el[0], el[1], 1.18 * p.s, Math.sin(t * 7) * 0.45 - 0.1);
      daire(c, el[0], el[1], 22 * p.s, BEYAZ);
    }
  }
  // isim etiketleri
  for (let i = n - 1; i >= 0; i--) {
    const p = konum[i];
    const kalabalik = n > 5;
    const boy = Math.max(26, (kalabalik ? 30 : 34) * p.s);
    const basMi = p.k === S.bas;
    const y = p.gy - p.zipla - p.s * 485 - (kalabalik && i % 2 === 1 ? 50 : 0);
    const metin = kisalt(p.k.ad, basMi ? 12 : kalabalik ? 8 : 10);
    const w = genislik(c, metin, boy) + boy * 1.9;
    const h = boy * 1.4;
    kutu(c, p.x - w / 2, y - h / 2, w, h, h / 2, basMi ? SARI : 'rgba(27,16,64,0.86)');
    avatar(c, p.k, p.x - w / 2 + h / 2, y, h / 2 - 4);
    yazi(c, metin, p.x + h * 0.32, y + boy * 0.34, boy, basMi ? INK : BEYAZ);
    if (basMi) tac(c, p.x, y - h / 2 - 4, boy * 1.3);
  }
}

function yarisCiz() {
  const c = ctx, y = S.yaris, t = zaman();
  const ust = D.sahneUst + 16, alt = D.sahneAlt + 80;
  const seritH = (alt - ust) / 3;
  const basX = 70, bitisX = 1010;
  c.fillStyle = 'rgba(27,16,64,0.55)';
  yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.fill();
  for (let i = 0; i < 3; i++) {
    const tk = y.takimlar[i];
    const sy = ust + i * seritH;
    if (i > 0) {
      c.save(); c.setLineDash([26, 22]); c.lineDashOffset = y.asama === 'yaris' ? -t * 600 * (0.5 + tk.hiz * 10) : 0;
      cizgi(c, [[50, sy], [1030, sy]], 6, 'rgba(255,255,255,0.55)'); c.restore();
    }
    const kare = 22;
    for (let r = 0; r * kare < seritH - 8; r++) for (let q = 0; q < 2; q++) {
      c.fillStyle = (r + q) % 2 ? INK : BEYAZ;
      c.fillRect(bitisX - 44 + q * kare, sy + 4 + r * kare, kare, Math.min(kare, seritH - 8 - r * kare));
    }
    const s = sinir((seritH - 60) / 205, 0.45, 0.92);
    const yolU = bitisX - 44 - basX - 170 * s - 176 * s;
    const ax = basX + 176 * s + tk.p * yolU + (y.asama === 'yaris' ? Math.sin(t * 30 + i) * 1.5 : 0);
    const ay = sy + seritH - 14;
    araba(c, ax, ay, s, tk.renk, tk.no, { hiz: y.asama === 'yaris' ? tk.hiz : 0, nitro: tk.nitro > 0, t });
    const lx = 60, ly = sy + 34;
    const w = hap(c, `${tk.no} · ${tk.ad}`, lx, ly, 34, tk.renk.ana, INK, { hiza: 'left' });
    yazi(c, `${tk.uyeler} kişi`, lx + w + 14, ly + 12, 32, BEYAZ, { hiza: 'left', w: 600, golge: true });
    const enIyi = [...tk.katki.entries()].sort((a, b) => b[1] - a[1])[0];
    if (enIyi && S.kisiler.get(enIyi[0])) yazi(c, `gaz: ${kisalt(S.kisiler.get(enIyi[0]).ad, 12)}`, bitisX - 60, ly + 12, 30, LILA, { hiza: 'right', w: 600 });
  }
  if (y.asama === 'secim' || y.asama === 'sayim') {
    c.fillStyle = 'rgba(27,16,64,0.62)';
    yol(c, 110, ust + (alt - ust) / 2 - 150, 860, 300, 40); c.fill();
    if (y.asama === 'secim') {
      yazi(c, 'TAKIMINI SEÇ', 540, ust + (alt - ust) / 2 - 40, 86, BEYAZ, { golge: true });
      yazi(c, '1 · 2 · 3 yaz', 540, ust + (alt - ust) / 2 + 40, 60, SARI, { golge: true });
      yazi(c, `${Math.ceil(y.bitis - t)} sn`, 540, ust + (alt - ust) / 2 + 110, 44, LILA, { w: 600 });
    } else {
      const kalan = Math.max(1, Math.ceil(y.bitis - t));
      const k = 1 + (1 - ((y.bitis - t) % 1)) * 0.25;
      yazi(c, String(kalan), 540, ust + (alt - ust) / 2 + 70 * k, 220 * k, SARI, { golge: true });
    }
  }
  if (y.asama === 'sonuc' && y.kazanan) {
    const k = y.kazanan, my = ust + (alt - ust) / 2;
    c.fillStyle = 'rgba(27,16,64,0.86)';
    yol(c, 70, my - 210, 940, 420, 44); c.fill();
    yazi(c, 'KAZANAN', 540, my - 120, 58, LILA, { w: 800 });
    yazi(c, `${k.ad} TAKIM`, 540, my - 20, 120, k.renk.ana, { golge: true, maxW: 860 });
    if (y.yardimcilar.length) {
      yazi(c, 'En çok gaz verenler', 540, my + 62, 36, LILA, { w: 600 });
      yazi(c, y.yardimcilar.map((r) => kisalt(r.ad, 12)).join(' · '), 540, my + 130, 46, BEYAZ, { maxW: 860 });
    }
  }
}

function sure(sn) { sn = Math.max(0, Math.ceil(sn)); return `${Math.floor(sn / 60)}:${String(sn % 60).padStart(2, '0')}`; }

function hudCiz() {
  const c = ctx, t = zaman();
  // marka satırı
  const my = D.ust + 32;
  const prof = resim('/profil.png');
  c.save(); c.beginPath(); c.arc(92, my, 34, 0, Math.PI * 2); c.fillStyle = BEYAZ; c.fill();
  c.beginPath(); c.arc(92, my, 30, 0, Math.PI * 2); c.clip();
  if (prof) c.drawImage(prof, 62, my - 30, 60, 60); else { c.fillStyle = DISK; c.fill(); }
  c.restore();
  yazi(c, 'HERKES PİSTE', 140, my + 14, 40, BEYAZ, { hiza: 'left', golge: true });
  let dRenk = '#9AA0B5', dYazi = 'BAĞLANIYOR';
  if (S.durum === 'deneme') { dRenk = '#3FE0EA'; dYazi = 'DENEME'; }
  else if (!S.sunucu) { dRenk = '#FF5A5A'; dYazi = 'SUNUCU YOK'; }
  else if (S.durum === 'canli') { dRenk = YESIL; dYazi = S.izleyici ? `CANLI · ${S.izleyici}` : 'CANLI'; }
  else if (S.durum === 'kapali') { dRenk = '#9AA0B5'; dYazi = 'YAYIN KAPALI'; }
  else if (S.durum === 'hata') { dRenk = '#FF9F43'; dYazi = 'BAĞLANTI SORUNU'; }
  const dw = genislik(c, dYazi, 28) + 64;
  kutu(c, 1040 - dw, my - 26, dw, 52, 26, 'rgba(27,16,64,0.7)');
  daire(c, 1040 - dw + 26, my, 9 + (S.durum === 'canli' ? Math.sin(t * 5) * 2 : 0), dRenk);
  yazi(c, dYazi, 1040 - dw + 44, my + 10, 28, BEYAZ, { hiza: 'left' });

  // tur paneli
  const py = D.panel;
  kutu(c, 40, py, 1000, 146, 34, 'rgba(27,16,64,0.55)');
  const halay = S.tur === 'halay';
  const baslik = halay ? 'HALAY TURU' : 'ARABA YARIŞI';
  let kalan = halay ? S.turBitis - t : (S.yaris.asama === 'sayim' ? 0 : S.yaris.bitis - t);
  yazi(c, baslik, 74, py + 88, 80, BEYAZ, { hiza: 'left', golge: true, maxW: 640 });
  yazi(c, sure(kalan), 1006, py + 88, 80, SARI, { hiza: 'right', golge: true });
  let alt;
  if (halay) alt = `Halayda ${[...S.kisiler.values()].filter((k) => k.halayda).length} kişi · Sırada: araba yarışı`;
  else alt = { secim: 'Takımlar kuruluyor', sayim: 'Hazır ol!', yaris: 'Beğen, gaz ver!', sonuc: 'Sırada: halay' }[S.yaris.asama];
  yazi(c, alt, 76, py + 130, 32, LILA, { hiza: 'left', w: 600, maxW: 930 });

  // talimatlar
  const satirlar = halay
    ? [['GİR', 'yaz → halaya katıl'], ['HOP', 'yaz → robotun zıplasın'], ['BEĞEN', '→ coşku artar, halay hızlanır'], ['HEDİYE', '→ mendil sende, halaybaşı ol']]
    : [['1 · 2 · 3', 'yaz → takımını seç'], ['BEĞEN', '→ gaz ver'], ['YORUM', '→ takımına güç'], ['HEDİYE', '→ nitro!']];
  satirlar.forEach(([anahtar, metin], i) => {
    const y = D.talimat + 26 + i * 52;
    const w = hap(c, anahtar, 60, y, 34, SARI, INK, { hiza: 'left', h: 46 });
    yazi(c, metin, 60 + w + 16, y + 12, 36, BEYAZ, { hiza: 'left', w: 600, golge: true, maxW: 1000 - w - 76 });
  });

  // en çok hediye atanlar
  const ly = D.lider;
  yazi(c, 'EN ÇOK HEDİYE ATANLAR', 60, ly + 14, 28, SARI, { hiza: 'left' });
  const lis = liderler();
  const cw = 316, gap = 26;
  for (let i = 0; i < 3; i++) {
    const x = 60 + i * (cw + gap), y = ly + 30;
    const L = lis[i];
    kutu(c, x, y, cw, 70, 22, i === 0 ? 'rgba(255,210,63,0.22)' : 'rgba(27,16,64,0.55)');
    if (i === 0) { c.lineWidth = 3; c.strokeStyle = SARI; yol(c, x + 1.5, y + 1.5, cw - 3, 67, 21); c.stroke(); }
    if (L) {
      avatar(c, L.k, x + 38, y + 35, 24);
      if (i === 0) tac(c, x + 38, y + 10, 26);
      yazi(c, kisalt(L.k.ad, 10), x + 72, y + 32, 28, BEYAZ, { hiza: 'left', maxW: cw - 84 });
      elmasIkon(c, x + 82, y + 50, 9);
      yazi(c, String(L.elmas), x + 98, y + 60, 24, '#7FE7FF', { hiza: 'left' });
    } else if (i === 0) {
      yazi(c, 'İlk hediyeyi at,', x + 22, y + 32, 26, BEYAZ, { hiza: 'left' });
      yazi(c, 'tacı sen kap', x + 22, y + 60, 26, SARI, { hiza: 'left' });
    } else yazi(c, `${i + 1} · boş`, x + 24, y + 46, 28, '#9C8FD9', { hiza: 'left' });
  }

  // coşku çubuğu
  if (halay) {
    const cy = D.cosku, cx = 60, cwid = 960, ch = 58;
    kutu(c, cx, cy, cwid, ch, ch / 2, 'rgba(27,16,64,0.7)');
    const oran = sinir(S.cosku / 100, 0, 1);
    if (oran > 0.01) {
      const g = c.createLinearGradient(cx, 0, cx + cwid, 0);
      g.addColorStop(0, SARI); g.addColorStop(1, '#FF6FAE');
      yol(c, cx + 5, cy + 5, Math.max(ch - 10, (cwid - 10) * oran), ch - 10, (ch - 10) / 2); c.fillStyle = g; c.fill();
    }
    yazi(c, `COŞKU ${S.seviye}`, cx + 26, cy + 41, 34, BEYAZ, { hiza: 'left', golge: true });
    yazi(c, 'BEĞEN →', cx + cwid - 26, cy + 41, 30, BEYAZ, { hiza: 'right', golge: true });
  }
}

function susler() {
  const c = ctx, b = 1 + Math.abs(Math.sin(S.vurus * Math.PI)) * 0.25;
  const y0 = D.sahneUst;
  parilti(c, 170, y0 + 70, 26 * b, SARI);
  parilti(c, 930, y0 + 40, 34 * b, BEYAZ);
  parilti(c, 980, y0 + 150, 16 * b, SARI);
  parilti(c, 110, y0 + 190, 14 * b, BEYAZ, 0.9);
  if (S.tur === 'halay') {
    c.save(); c.globalAlpha = 0.9; nota(c, 860, y0 + 230 + Math.sin(S.vurus * Math.PI) * 8, 0.85, BEYAZ);
    nota(c, 150, y0 + 300 + Math.cos(S.vurus * Math.PI) * 8, 0.75, SARI); c.restore();
  }
}

function parcaCiz() {
  const c = ctx;
  for (const p of parca) {
    if (p.yas < 0) continue;
    const a = 1 - p.yas / p.omur;
    c.globalAlpha = Math.min(1, a * 1.6);
    if (p.tip === 'k') daire(c, p.x, p.y, p.boy * (0.4 + a * 0.6), p.renk);
    else if (p.tip === 'c') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.renk; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore(); }
    else if (p.tip === 'h') kalp(c, p.x, p.y, p.boy, p.renk);
  }
  c.globalAlpha = 1;
}

function tostCiz() {
  const c = ctx, t = zaman();
  const goster = tostlar.slice(-3);
  goster.forEach((x, i) => {
    const yas = t - x.t0;
    const giris = Math.min(1, yas / 0.25), cikis = Math.min(1, (x.sure - yas) / 0.35);
    const a = Math.min(giris, cikis);
    const y = D.sahneUst + 34 + i * 74 - (1 - giris) * 30;
    const hed = x.tip === 'hediye';
    const boy = hed ? 34 : 30;
    const metin = kisalt(x.metin, 40);
    const w = genislik(c, metin, boy) + 92;
    c.globalAlpha = a;
    kutu(c, 540 - w / 2, y - 31, w, 62, 31, hed ? SARI : 'rgba(27,16,64,0.88)');
    if (x.r) avatar(c, x.r, 540 - w / 2 + 31, y, 24);
    yazi(c, metin, 540 + 22, y + boy * 0.34, boy, hed ? INK : BEYAZ);
    c.globalAlpha = 1;
  });
}

function afisCiz() {
  if (!afis) return;
  const c = ctx, yas = zaman() - afis.t0;
  const k = yas < 0.25 ? 0.6 + (yas / 0.25) * 0.4 : 1;
  const a = Math.min(1, (afis.sure - yas) / 0.4);
  const my = (D.sahneUst + D.sahneAlt) / 2 - 20;
  c.save(); c.globalAlpha = Math.max(0, a);
  c.translate(540, my); c.scale(k, k); c.rotate(-0.03);
  kutu(c, -500, -96, 1000, afis.alt ? 192 : 150, 36, 'rgba(27,16,64,0.9)');
  yazi(c, afis.baslik, 0, afis.alt ? 10 : 30, 104, afis.renk, { golge: true, maxW: 940 });
  if (afis.alt) yazi(c, kisalt(afis.alt, 34), 0, 74, 44, BEYAZ, { w: 600, maxW: 940 });
  c.restore();
}

function durumCiz() {
  if (S.durum === 'deneme' || S.durum === 'canli') return;
  const c = ctx;
  let baslik = 'YAYIN KAPALI', alt = 'Yayını başlattığında oyun kendiliğinden bağlanır';
  if (!S.sunucu) { baslik = 'SUNUCUYA BAĞLANILIYOR'; alt = 'İnternet bağlantını kontrol et'; }
  else if (S.durum === 'baglaniyor' || S.durum === 'bekliyor') { baslik = 'YAYINA BAĞLANILIYOR'; alt = S.durumMesaj || 'Birkaç saniye sürebilir'; }
  else if (S.durum === 'hata') { baslik = 'BAĞLANTI SORUNU'; alt = S.durumMesaj || 'Tekrar denenecek'; }
  const y = D.sahneAlt + 130;
  kutu(c, 60, y, 960, 128, 30, 'rgba(27,16,64,0.86)');
  kutu(c, 60, y, 12, 128, 6, '#FF6FAE');
  yazi(c, baslik, 540, y + 56, 46, BEYAZ, { maxW: 900 });
  yazi(c, alt, 540, y + 102, 30, LILA, { w: 600, maxW: 900 });
}

function ciz() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(arka, 0, 0);
  ctx.setTransform(olcek, 0, 0, olcek, ox * olcek, 0);
  susler();
  if (S.tur === 'halay') halayCiz(); else yarisCiz();
  hudCiz();
  parcaCiz();
  tostCiz();
  afisCiz();
  durumCiz();
}

// ------------------------------------------------------------------ kayıt (sayfa yenilenirse halay kaybolmasın)
const KAYIT = 'herkesPiste.v1';
function kaydet() {
  try {
    const t = zaman();
    const k = [...S.kisiler.values()].filter((r) => r.halayda || S.hediye.has(r.id)).sort((a, b) => b.son - a.son).slice(0, 150)
      .map((r) => ({ id: r.id, ad: r.ad, av: r.av, h: r.halayda, ky: Math.round(t - r.katilma), sy: Math.round(t - r.son) }));
    localStorage.setItem(KAYIT, JSON.stringify({ z: Date.now(), k, h: [...S.hediye.values()], sv: S.seviye, c: S.cosku }));
  } catch {}
}
function yukle() {
  try {
    const v = JSON.parse(localStorage.getItem(KAYIT) || 'null');
    if (!v || Date.now() - v.z > 30 * 60 * 1000) return;
    const t = zaman();
    for (const x of v.k || []) {
      const r = kisi({ id: x.id, ad: x.ad, av: x.av });
      r.halayda = !!x.h; r.katilma = t - (x.ky || 0); r.son = t - (x.sy || 0);
    }
    for (const h of v.h || []) if (S.kisiler.has(h.id)) S.hediye.set(h.id, { id: h.id, elmas: h.elmas });
    S.seviye = v.sv || 1; S.cosku = v.c || 0;
    S.bas = basHesapla();
  } catch {}
}

// ------------------------------------------------------------------ sunucu bağlantısı
function sunucuyaBaglan() {
  const url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
  let ws;
  try { ws = new WebSocket(url); } catch { setTimeout(sunucuyaBaglan, 3000); return; }
  ws.onopen = () => { S.sunucu = true; };
  ws.onmessage = (m) => {
    let e; try { e = JSON.parse(m.data); } catch { return; }
    if (e.t === 'durum') { S.durum = e.durum; S.durumMesaj = e.m || ''; if (e.izleyici) S.izleyici = e.izleyici; }
    else olay(e);
  };
  ws.onclose = () => { S.sunucu = false; setTimeout(sunucuyaBaglan, 2000 + Math.random() * 2000); };
  ws.onerror = () => { try { ws.close(); } catch {} };
}

// ------------------------------------------------------------------ deneme modu (sahte izleyiciler)
function denemeBaslat() {
  const adlar = ['ayse.k', 'mehmet_34', 'zeynep.y', 'can06', 'elifim', 'burak.tr', 'selin', 'emre_35', 'deniz', 'merve.gs', 'kaan', 'irem', 'ali_veli', 'gökhan', 'sude', 'oğuz', 'buse', 'tolga', 'ecem', 'yusuf'];
  const hediyeler = [['Gül', 1], ['TikTok', 1], ['Parmak kalp', 5], ['Dondurma', 1], ['Donut', 30], ['Kalpli mektup', 99]];
  setInterval(() => {
    const ad = rastgele(adlar);
    const k = { id: ad, ad, av: '' };
    const r = Math.random();
    if (S.tur === 'halay') {
      if (r < 0.3) olay({ t: 'yorum', k, m: rastgele(['gir', 'GİR', 'gir!', 'hop', 'selam', 'oley']) });
      else if (r < 0.88) olay({ t: 'begeni', k, n: 1 + Math.floor(Math.random() * 15) });
      else if (r < 0.97) { const [g, e] = rastgele(hediyeler.slice(0, 4)); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
      else if (r < 0.99) { const [g, e] = rastgele(hediyeler.slice(4)); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
      else olay({ t: 'takip', k });
    } else {
      if (r < 0.3) olay({ t: 'yorum', k, m: rastgele(['1', '2', '3', 'mavi', 'sarı', 'hadi']) });
      else if (r < 0.92) olay({ t: 'begeni', k, n: 1 + Math.floor(Math.random() * 15) });
      else { const [g, e] = rastgele(hediyeler); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
    }
  }, 320);
}

// ------------------------------------------------------------------ başlat, tam ekran, ekranı açık tut
let kilit = null;
async function uyanikTut() {
  try { if ('wakeLock' in navigator && !kilit) { kilit = await navigator.wakeLock.request('screen'); kilit.addEventListener('release', () => { kilit = null; }); } } catch {}
}
function tamEkranMi() {
  return !!document.fullscreenElement || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches;
}
async function tamEkran() {
  try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch {}
  try { await screen.orientation.lock('portrait'); } catch {}
}
let basladi = false;
const tamBtn = document.getElementById('tamEkran');
function tamBtnGuncelle() { tamBtn.style.display = basladi && !tamEkranMi() ? 'block' : 'none'; }
document.getElementById('baslat').addEventListener('click', async () => {
  basladi = true;
  document.getElementById('giris').style.display = 'none';
  Ses.baslat(document.getElementById('sesKutu').checked);
  Ses.devam();
  await tamEkran();
  uyanikTut();
  tamBtnGuncelle();
});
tamBtn.addEventListener('click', async () => { await tamEkran(); tamBtnGuncelle(); });
document.addEventListener('fullscreenchange', tamBtnGuncelle);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { uyanikTut(); Ses.devam(); tamBtnGuncelle(); } });
if (P.has('direkt')) { basladi = true; document.getElementById('giris').style.display = 'none'; }

window.addEventListener('resize', boyutla);
boyutla();
yukle();
if (DEMO) denemeBaslat(); else sunucuyaBaglan();
setInterval(kaydet, 5000);

let onceki = performance.now();
function kare(ms) {
  const dt = Math.min(0.05, Math.max(0, (ms - onceki) / 1000));
  onceki = ms;
  guncelle(dt);
  ciz();
  requestAnimationFrame(kare);
}
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load(font(40, 800)), document.fonts.load(font(40, 600))]) : Promise.resolve())
  .catch(() => {}).finally(() => requestAnimationFrame(kare));

// test kancası (yalnızca ?test ile)
if (P.has('test')) window.__hp = { S, olay, yarisBaslat, zaman, duyuru };
})();
