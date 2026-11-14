/* Herkes Piste — izleyicilerin yönettiği halay, araba yarışı ve halat çekme oyunu (TikTok LIVE) */
(() => {
'use strict';

// ------------------------------------------------------------------ ayarlar
const P = new URLSearchParams(location.search);
const DEMO = P.has('demo');
const INK = '#1B1040', V = '#4A22D4', DISK = '#6A45EE', FL = '#EAE3FF', FD = '#24125C';
const SARI = '#FFD23F', BEYAZ = '#FFFFFF', LILA = '#E7E0FF', YESIL = '#4ADE80', PEMBE = '#FF6FAE', CAMGOBEGI = '#3FE0EA';
const FONT = "'Baloo 2', system-ui, sans-serif";
const RENKLER = [
  { ana: '#FFD23F', koyu: '#F5A70C' },
  { ana: '#3FE0EA', koyu: '#12AFCB' },
  { ana: '#FF6FAE', koyu: '#E63E86' },
  { ana: '#62E68B', koyu: '#22B455' },
  { ana: '#FF9F43', koyu: '#E8730C' },
  { ana: '#FFFFFF', koyu: '#C9CEDF' },
];
const ALTIN = { ana: '#FFC93C', koyu: '#B97D06' };
const TAKIM_TANIM = {
  yaris: [{ no: 1, ad: 'SARI', renk: RENKLER[0] }, { no: 2, ad: 'MAVİ', renk: RENKLER[1] }, { no: 3, ad: 'PEMBE', renk: RENKLER[2] }],
  halat: [{ no: 1, ad: 'SARI', renk: RENKLER[0] }, { no: 2, ad: 'MAVİ', renk: RENKLER[1] }],
};
const sayiAyar = (ad, varsayilan) => { const v = Number(P.get(ad)); return v > 0 ? v : varsayilan; };
const SURE = { halay: sayiAyar('halay', 100), secim: 15, sayim: 3, oyun: sayiAyar('oyun', 45), sonuc: 8 };
const SIRA = ['halay', 'yaris', 'halay', 'halat'];
const HALAY_GORUNEN = 10;

// Hediye menüsü: tek seferde gelen elmas değerine göre en yüksek kademe çalışır.
const KADEMELER = {
  halay: [
    { min: 1, ad: 'KALP YAĞMURU' }, { min: 5, ad: 'GÖZLÜK TAKAR' }, { min: 20, ad: 'FES + DAVUL' },
    { min: 99, ad: 'ALTIN ROBOT' }, { min: 199, ad: 'DEV ROBOT' }, { min: 500, ad: 'HALAY ŞÖLENİ' },
  ],
  yaris: [
    { min: 1, ad: 'GAZ' }, { min: 5, ad: 'TURBO' }, { min: 20, ad: 'NİTRO' },
    { min: 99, ad: 'MUZ KABUĞU' }, { min: 199, ad: 'ROKET' }, { min: 500, ad: 'ŞİMŞEK' },
  ],
  halat: [
    { min: 1, ad: 'ÇEK' }, { min: 5, ad: 'GÜÇLÜ ÇEKİŞ' }, { min: 20, ad: 'SÜPER ÇEKİŞ' },
    { min: 99, ad: 'RAKİP KAYAR' }, { min: 199, ad: 'DEV YARDIMCI' }, { min: 500, ad: 'DEPREM' },
  ],
};
// Toplam elmasla açılan kalıcı kostümler (halay)
const KOSTUM = { gozluk: 5, fes: 20, altin: 99 };
// Herkesin birlikte doldurduğu elmas hedefleri
const HEDEFLER = [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000, 15000];

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
  const sahneUst = ust + 644;
  const sahneAlt = Math.max(ust + 1095, H * 0.64);
  const yuk = sahneAlt - sahneUst;
  const hz = sahneUst + yuk * 0.45;
  const on = sahneAlt - 15;
  const yh = hz - 190;
  return {
    ust, panel: ust + 78, talimat: ust + 262, menu: ust + 380, lider: ust + 570,
    sahneUst, sahneAlt, hz, yh, on,
    arkaY: yh + 0.58 * (on - yh),
    sOn: sinir(yuk / 640, 0.7, 0.95),
    alt: sahneAlt + 26,
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
function yildiz(c, x, y, r, renk = SARI) {
  c.fillStyle = renk; c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath(); c.fill();
}
function elmasIkon(c, x, y, r, renk = '#7FE7FF') {
  c.fillStyle = renk; c.beginPath();
  c.moveTo(x - r, y - r * 0.35); c.lineTo(x - r * 0.5, y - r); c.lineTo(x + r * 0.5, y - r);
  c.lineTo(x + r, y - r * 0.35); c.lineTo(x, y + r); c.closePath(); c.fill();
}
function simsek(c, x, y, k, renk = SARI) {
  c.fillStyle = renk; c.beginPath();
  c.moveTo(x + 6 * k, y - 40 * k); c.lineTo(x - 16 * k, y + 4 * k); c.lineTo(x - 1 * k, y + 4 * k);
  c.lineTo(x - 8 * k, y + 40 * k); c.lineTo(x + 18 * k, y - 8 * k); c.lineTo(x + 3 * k, y - 8 * k); c.closePath(); c.fill();
}
function muz(c, x, y, k) {
  c.save(); c.translate(x, y); c.rotate(-0.3);
  c.beginPath(); c.moveTo(-26 * k, 0); c.quadraticCurveTo(0, 26 * k, 26 * k, 0); c.quadraticCurveTo(0, 12 * k, -26 * k, 0);
  c.fillStyle = SARI; c.fill(); c.restore();
}
function hoparlor(c, x, y, k, renk = BEYAZ) {
  c.fillStyle = renk; c.beginPath();
  c.moveTo(x - 14 * k, y - 8 * k); c.lineTo(x - 4 * k, y - 8 * k); c.lineTo(x + 8 * k, y - 18 * k);
  c.lineTo(x + 8 * k, y + 18 * k); c.lineTo(x - 4 * k, y + 8 * k); c.lineTo(x - 14 * k, y + 8 * k); c.closePath(); c.fill();
  c.lineWidth = 4 * k; c.strokeStyle = renk; c.lineCap = 'round';
  for (const r of [14, 24]) { c.beginPath(); c.arc(x + 8 * k, y, r * k, -0.8, 0.8); c.stroke(); }
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
  salla2: [[58, -236], [140, -280], [118, -384]],
  bel: [[58, -236], [120, -186], [72, -146]],
  asagi: [[58, -236], [96, -176], [90, -112]],
  havada: [[58, -236], [104, -288], [132, -392]],
};
function kafa(c, x, gy, s, r, o = {}) {
  const X = (v) => x + s * v, Y = (v) => gy + s * v;
  for (const e of [-1, 1]) kutu(c, X(e * 83) - 9 * s, Y(-350), 18 * s, 40 * s, 8 * s, r.koyu);
  if (!o.fes) {
    cizgi(c, [[X(0), Y(-386)], [X(0), Y(-424)]], 9 * s, r.koyu);
    daire(c, X(0), Y(-434), 15 * s, BEYAZ);
  }
  kutu(c, X(-78), Y(-388), 156 * s, 116 * s, 42 * s, r.ana);
  c.globalAlpha = 0.45; kutu(c, X(-58), Y(-380), 70 * s, 10 * s, 5 * s, BEYAZ); c.globalAlpha = 1;
  kutu(c, X(-57), Y(-366), 114 * s, 70 * s, 30 * s, INK);
  if (o.gozluk) {
    for (const lx of [-56, 8]) {
      kutu(c, X(lx), Y(-352), 48 * s, 34 * s, 12 * s, '#05030C');
      c.lineWidth = 5 * s; c.strokeStyle = SARI; yol(c, X(lx), Y(-352), 48 * s, 34 * s, 12 * s); c.stroke();
      cizgi(c, [[X(lx + 12), Y(-344)], [X(lx + 22), Y(-334)]], 4 * s, BEYAZ);
    }
    c.fillStyle = SARI; c.fillRect(X(-8), Y(-342), 16 * s, 6 * s);
  } else {
    for (const e of [-1, 1]) {
      const ex = X(e * 26), ey = Y(-330), rr = 13 * s;
      if (o.goz === 'acik') daire(c, ex, ey, rr * 0.95, BEYAZ);
      else {
        c.beginPath(); c.moveTo(ex - rr, ey + rr * 0.55); c.quadraticCurveTo(ex, ey - rr * 1.35, ex + rr, ey + rr * 0.55);
        c.lineWidth = 9 * s; c.strokeStyle = BEYAZ; c.lineCap = 'round'; c.stroke();
      }
    }
  }
  if (o.fes) {
    c.fillStyle = '#D7263D'; c.beginPath();
    c.moveTo(X(-60), Y(-380)); c.lineTo(X(-46), Y(-452)); c.lineTo(X(46), Y(-452)); c.lineTo(X(60), Y(-380)); c.closePath(); c.fill();
    c.fillStyle = '#A3172A'; c.beginPath(); c.ellipse(X(0), Y(-452), 46 * s, 9 * s, 0, 0, Math.PI * 2); c.fill();
    const sal = Math.sin(zaman() * 6) * 6;
    c.beginPath(); c.moveTo(X(0), Y(-452)); c.quadraticCurveTo(X(40 + sal), Y(-458), X(48 + sal), Y(-412));
    c.lineWidth = 5 * s; c.strokeStyle = INK; c.stroke();
    daire(c, X(48 + sal), Y(-404), 10 * s, INK);
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
  if (o.parla) {
    c.save(); c.globalAlpha = 0.35 + 0.25 * Math.sin(zaman() * 10);
    daire(c, x, by - 230 * s, 190 * s, BEYAZ); c.restore();
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
  kafa(c, x, by, s, r, o);
  if (o.altin) {
    const t = zaman();
    parilti(c, X(70), Y(-300 + 20 * Math.sin(t * 3)), (14 + 6 * Math.sin(t * 7)) * s, BEYAZ);
    parilti(c, X(-80), Y(-180 + 20 * Math.cos(t * 2.5)), (10 + 5 * Math.cos(t * 6)) * s, BEYAZ);
  }
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
  c.lineWidth = 7 * m; c.strokeStyle = PEMBE; c.lineCap = 'round'; c.stroke();
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
function isimEtiketi(c, k, x, y, boy, o = {}) {
  const basMi = !!o.bas;
  const metin = kisalt(k.ad, o.uzun || (basMi ? 12 : 10));
  const yildizVar = !!k.takip;
  const h = boy * 1.4;
  const w = genislik(c, metin, boy) + boy * 1.9 + (yildizVar ? boy * 0.9 : 0);
  const sol = x - w / 2;
  kutu(c, sol, y - h / 2, w, h, h / 2, basMi ? SARI : k.altin ? '#7A4E00' : 'rgba(27,16,64,0.86)');
  if (k.altin && !basMi) { c.lineWidth = 3; c.strokeStyle = ALTIN.ana; yol(c, sol + 1.5, y - h / 2 + 1.5, w - 3, h - 3, h / 2); c.stroke(); }
  avatar(c, k, sol + h / 2, y, h / 2 - 4);
  let tx = sol + h + 4;
  if (yildizVar) { yildiz(c, tx + boy * 0.38, y, boy * 0.42, basMi ? INK : SARI); tx += boy * 0.9; }
  yazi(c, metin, tx, y + boy * 0.34, boy, basMi ? INK : BEYAZ, { hiza: 'left' });
  if (basMi) tac(c, x, y - h / 2 - 4, boy * 1.3);
  return { ust: y - h / 2 };
}
function balon(c, metin, x, y, boy) {
  const w = genislik(c, metin, boy, 700) + boy * 1.2, h = boy * 1.5;
  kutu(c, x - w / 2, y - h, w, h, h / 2, BEYAZ);
  c.fillStyle = BEYAZ; c.beginPath(); c.moveTo(x - 10, y - 2); c.lineTo(x + 10, y - 2); c.lineTo(x, y + 12); c.closePath(); c.fill();
  yazi(c, metin, x, y - h / 2 + boy * 0.34, boy, INK, { w: 700 });
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
      const L = (70 + 40 * Math.sin(t * 40 + i * 2)) * s * (o.roket ? 1.8 : 1);
      c.fillStyle = i === 0 ? '#FF6B2C' : i === 1 ? SARI : BEYAZ;
      c.beginPath(); c.moveTo(X(-160), Y(-66 + i * 6)); c.lineTo(X(-160) - L * (1 - i * 0.3), Y(-56)); c.lineTo(X(-160), Y(-46 - i * 6)); c.closePath(); c.fill();
    }
  }
  c.save();
  if (o.kayma) { c.translate(x, y - 40 * s); c.rotate(Math.sin((o.t || 0) * 18) * 0.18); c.translate(-x, -(y - 40 * s)); }
  c.save(); c.globalAlpha = 0.4; c.beginPath(); c.ellipse(X(4), Y(4), 176 * s, 14 * s, 0, 0, Math.PI * 2); c.fillStyle = '#120A2E'; c.fill(); c.restore();
  c.fillStyle = r.koyu; c.fillRect(X(-150), Y(-128), 12 * s, 30 * s);
  kutu(c, X(-176), Y(-142), 68 * s, 16 * s, 8 * s, r.koyu);
  const hs = 0.6 * s;
  kafa(c, X(-34), Y(-100) + 272 * hs, hs, r, { goz: o.dur ? 'acik' : 'mutlu' });
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
  c.restore();
  if (o.dur) simsek(c, X(40), Y(-200), 1.4 * s);
}

// ------------------------------------------------------------------ ses (davul ve efektler)
const Ses = (() => {
  let ac = null, ana = null, konusma = null, gurultu = null, sonraki = 0, adim = 0, davulAcik = false;
  const DAVUL_SES = 0.45;
  function baslat(davul, spiker) {
    davulAcik = !!davul;
    if (ac || (!davul && !spiker)) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      ana = ac.createGain(); ana.gain.value = DAVUL_SES; ana.connect(ac.destination);
      konusma = ac.createGain(); konusma.gain.value = 1; konusma.connect(ac.destination);
      gurultu = ac.createBuffer(1, ac.sampleRate * 0.25, ac.sampleRate);
      const d = gurultu.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      sonraki = ac.currentTime + 0.1;
    } catch { ac = null; }
  }
  function devam() { if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); }
  function kis(kisik) {
    if (!ana) return;
    ana.gain.cancelScheduledValues(ac.currentTime);
    ana.gain.setTargetAtTime(kisik ? DAVUL_SES * 0.25 : DAVUL_SES, ac.currentTime, 0.12);
  }
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
    if (!ac || !davulAcik || ac.state !== 'running') return;
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
    baslat, devam, zamanla, kis,
    baglam: () => (ac && ac.state === 'running' ? ac : null),
    konusmaCikisi: () => konusma,
    pop: () => dizi([660, 990], 0.06, 0.09, 'sine', 0.14),
    hediye: () => dizi([784, 988, 1175, 1568], 0.06, 0.18),
    buyuk: () => dizi([523, 659, 784, 1047, 1319, 1568], 0.08, 0.3, 'triangle', 0.22),
    zafer: () => dizi([523, 659, 784, 1047, 784, 1047], 0.13, 0.32, 'square', 0.09),
    sayim: () => dizi([880], 0, 0.18, 'square', 0.09),
    basla: () => dizi([1320], 0, 0.45, 'square', 0.1),
    boing: () => dizi([300, 220, 160], 0.07, 0.12, 'sine', 0.2),
  };
})();

// ------------------------------------------------------------------ yapay zekâ sunucu (Türkçe anlatıcı)
const Spiker = (() => {
  const kuyruk = [];
  let acik = false, konusuyor = false, sonBitis = zaman(), sunucuYokBitis = 0;
  const anahtarSon = new Map();
  function baslat(evet) { acik = !!evet; }
  // aynı anahtarla en az "aralik" saniye arayla konuşur; daha önemli işler öne geçer
  function ekle(metin, oncelik = 1, anahtar = null, aralik = 0) {
    if (!acik || !metin) return;
    const t = zaman();
    if (anahtar) {
      if (aralik && t - (anahtarSon.get(anahtar) || -1e9) < aralik) return;
      const eski = kuyruk.findIndex((x) => x.anahtar === anahtar);
      if (eski >= 0) kuyruk.splice(eski, 1);
      anahtarSon.set(anahtar, t);
    }
    kuyruk.push({ metin, oncelik, t, anahtar });
    kuyruk.sort((a, b) => b.oncelik - a.oncelik || a.t - b.t);
    while (kuyruk.length > 4) kuyruk.pop();
    calis();
  }
  async function calis() {
    if (konusuyor || !kuyruk.length) return;
    const is = kuyruk.shift();
    if (zaman() - is.t > (is.oncelik >= 3 ? 20 : 9)) { calis(); return; }
    konusuyor = true;
    Ses.kis(true);
    try { await sunucudanOku(is.metin); }
    catch { try { await tarayicidanOku(is.metin); } catch {} }
    Ses.kis(false);
    konusuyor = false;
    sonBitis = zaman();
    setTimeout(calis, 300);
  }
  async function sunucudanOku(metin) {
    const ac = Ses.baglam();
    if (zaman() < sunucuYokBitis || !ac) throw new Error('yok');
    const r = await fetch('/konus?m=' + encodeURIComponent(metin));
    if (r.status === 429) return; // sunucu yoğun: bu cümleyi atla
    // ses henüz kurulu değilse 5 dakika telefonun kendi sesiyle konuş, sonra tekrar dene
    if (!r.ok) { if (r.status === 503 || r.status === 404) sunucuYokBitis = zaman() + 300; throw new Error('yok'); }
    const tampon = await ac.decodeAudioData(await r.arrayBuffer());
    await new Promise((bitti) => {
      const s = ac.createBufferSource();
      s.buffer = tampon; s.connect(Ses.konusmaCikisi()); s.onended = bitti; s.start();
      setTimeout(bitti, tampon.duration * 1000 + 800);
    });
  }
  function tarayicidanOku(metin) {
    return new Promise((bitti, hata) => {
      if (!('speechSynthesis' in window)) { hata(new Error('yok')); return; }
      const u = new SpeechSynthesisUtterance(metin);
      u.lang = 'tr-TR';
      const ses = speechSynthesis.getVoices().find((v) => /^tr/i.test(v.lang));
      if (ses) u.voice = ses;
      u.rate = 1.05;
      u.onend = bitti; u.onerror = bitti;
      speechSynthesis.speak(u);
      setTimeout(bitti, 12000);
    });
  }
  return { baslat, ekle, acik: () => acik, konusuyor: () => konusuyor, sessizlik: () => (konusuyor ? 0 : zaman() - sonBitis) };
})();

// İsimleri sesli okumaya uygun hale getir (emoji, sayı ve küfür yok)
function okunurAd(ad) {
  const n = String(ad || '').replace(/[_.\-]+/g, ' ').replace(/[^\p{L} ]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (n.length < 2 || !temizMi(n)) return 'arkadaşım';
  return n.length > 18 ? n.slice(0, 18) : n;
}

// ------------------------------------------------------------------ oyun durumu
const S = {
  tur: 'halay', siraIdx: 0, turBitis: zaman() + SURE.halay,
  kisiler: new Map(),
  hediye: new Map(),
  cosku: 0, seviye: 1, tempoBitis: 0, vurus: 0, bpm: 96,
  hedefIdx: 0, hedefElmas: 0, altinBitis: 0,
  oyun: null, bas: null, dev: null, parlak: new Map(), kartFlas: new Map(),
  durum: DEMO ? 'deneme' : 'bekliyor', durumMesaj: '', izleyici: 0, sunucu: DEMO,
  sonGirisToast: 0, sonKatilToast: 0,
  yeniKatilan: [], sonKatilimAnonsu: 0, topluHediye: [], topluTakip: [], sonTopluAnons: 0, sonYorumOkuma: 0, sonMenuHatirlatma: 0, hatirlatmaIdx: 0,
};

function kisi(k) {
  if (!k || !k.id) return null;
  let r = S.kisiler.get(k.id);
  if (!r) {
    r = { id: k.id, ad: k.ad || k.id, av: k.av || '', renk: RENKLER[karma(k.id) % RENKLER.length], halayda: false, katilma: 0, son: 0, zipla: -9,
      toplam: 0, gozluk: false, fes: false, altin: false, takip: false, balon: null, selam: -9 };
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
    if (!sessiz) S.yeniKatilan.push(r);
    Ses.pop();
  }
  r.son = t;
}
function ziplat(r) { r.zipla = zaman(); }

// ------------------------------------------------------------------ efektler
const parca = [];
function kivilcim(x, y, adet, renkler = [SARI, BEYAZ, PEMBE, CAMGOBEGI]) {
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
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, omur: 4, yas: 0, renk: rastgele([SARI, CAMGOBEGI, PEMBE, '#62E68B', BEYAZ]), w: 14 + Math.random() * 10, h: 8 + Math.random() * 6 });
  }
}
function kalpler(n, x = 940, y = null) {
  for (let i = 0; i < Math.min(n, 8) && parca.length < 900; i++) {
    parca.push({ tip: 'h', x: x + (Math.random() - 0.5) * 120, y: y ?? D.sahneAlt - 20, vx: (Math.random() - 0.5) * 60, vy: -(260 + Math.random() * 200),
      omur: 1.8 + Math.random() * 0.6, yas: Math.random() * -0.4, renk: rastgele(['#FF4F9A', PEMBE, '#FF8FC0', SARI]), boy: 16 + Math.random() * 12 });
  }
}

const tostlar = [];
function tost(metin, r, tip = 'bilgi') {
  if (tip === 'katil' && tostlar.filter((x) => x.tip === 'katil').length >= 2) return;
  tostlar.push({ metin, r, tip, t0: zaman(), sure: tip === 'hediye' ? 4 : 2.6 });
  while (tostlar.length > 6) {
    const i = tostlar.findIndex((x) => x.tip !== 'hediye');
    tostlar.splice(i >= 0 ? i : 0, 1);
  }
}
let afis = null;
function duyuru(baslik, alt = '', renk = SARI, sure = 2.6, oncelik = 0) {
  if (afis && zaman() - afis.t0 < afis.sure && (afis.oncelik || 0) > oncelik) return;
  afis = { baslik, alt, renk, t0: zaman(), sure, oncelik };
}

// ------------------------------------------------------------------ yorum süzgeci (balonlar ve sesli okuma için)
const KUFUR = ['amk', 'aq', 'amq', 'mk', 'oç', 'oc', 'piç', 'pic', 'sik', 'sık', 'göt', 'got', 'mal', 'ibne', 'gavat', 'kahpe', 'yarak', 'yarrak',
  'orospu', 'siktir', 'sikerim', 'sikeyim', 'sikiş', 'amına', 'amina', 'ananı', 'anani', 'bacını', 'pezevenk', 'yavşak', 'şerefsiz', 'serefsiz', 'gerizekalı', 'salak', 'aptal', 'dangalak'];
function kelimeler(m) { return buyuk(m).toLocaleLowerCase('tr').split(/[^0-9a-zçğıöşüâîû]+/u).filter(Boolean); }
function temizMi(m) {
  if (!m || m.length > 26) return false;
  if (/https?:|www\.|\.com|\.net|@|\d{4,}/i.test(m)) return false;
  const w = kelimeler(m);
  return !w.some((x) => KUFUR.some((k) => x === k || (k.length >= 5 && x.startsWith(k))));
}

// ------------------------------------------------------------------ olaylar (izleyici hareketleri)
const GIR = new Set(['gir', 'gır', 'katıl', 'katil', 'halay', 'gire', 'girdim']);
const HOP = new Set(['hop', 'hopp', 'hoppa', 'zıpla', 'zipla', 'oley', 'hey']);
const SELAM = new Set(['selam', 'slm', 'merhaba', 'mrb', 'sa', 'selamun']);
const TAKIM_KELIME = { yaris: { '1': 1, '2': 2, '3': 3, 'sarı': 1, 'sari': 1, 'mavi': 2, 'pembe': 3 }, halat: { '1': 1, '2': 2, 'sarı': 1, 'sari': 1, 'mavi': 2 } };

function olay(e) {
  const r = kisi(e.k);
  if (!r && e.t !== 'izleyici') return;
  const t = zaman();
  switch (e.t) {
    case 'yorum': {
      const m = String(e.m || '').trim();
      const w = kelimeler(m);
      const komut = w.some((x) => GIR.has(x) || HOP.has(x) || SELAM.has(x) || /^[1-3]$/.test(x));
      if (S.tur === 'halay') {
        if (w.some((x) => GIR.has(x) || HOP.has(x))) { halayaKat(r); ziplat(r); }
        else if (w.some((x) => SELAM.has(x))) {
          halayaKat(r); r.selam = t;
          Spiker.ekle(`Selam ${okunurAd(r.ad)}, hoş geldin!`, 1, 'selam', 6);
        }
        else if (r.halayda) { r.son = t; S.cosku += 1.2; }
        if (r.halayda && temizMi(m)) r.balon = { metin: m, t0: t };
      } else {
        const no = w.map((x) => TAKIM_KELIME[S.tur][x]).find(Boolean);
        if (no) takimSec(r, no);
        else takimKatki(r, 3, 3);
        if (w.some((x) => GIR.has(x) || HOP.has(x))) halayaKat(r, true);
      }
      // ara sıra izleyicinin yorumunu sesli oku
      if (!komut && m.length >= 3 && temizMi(m) && t - S.sonYorumOkuma > 25 && Spiker.sessizlik() > 3) {
        S.sonYorumOkuma = t;
        Spiker.ekle(`${okunurAd(r.ad)} diyor ki: ${m}`, 1, 'yorum');
      }
      break;
    }
    case 'begeni': {
      kalpler(Math.ceil(e.n / 3));
      if (S.tur === 'halay') {
        S.cosku += (e.n * 0.8) / (1 + 0.25 * (S.seviye - 1));
        if (r.halayda) { r.son = t; if (Math.random() < 0.35) ziplat(r); }
      } else takimKatki(r, e.n, e.n);
      break;
    }
    case 'hediye': hediye(r, e); break;
    case 'takip':
      if (!r.takip) {
        r.takip = true;
        tost(`${r.ad} takip etti, yıldızını aldı!`, r, 'takip');
        S.topluTakip.push(r);
      }
      if (S.tur === 'halay') { S.cosku += 6; halayaKat(r, true); ziplat(r); } else takimKatki(r, 10, 10);
      break;
    case 'paylasim':
      tost(`${r.ad} yayını paylaştı`, r, 'takip');
      Spiker.ekle(`${okunurAd(r.ad)}, paylaştığın için teşekkürler!`, 1, 'paylasim', 10);
      if (S.tur === 'halay') S.cosku += 8; else takimKatki(r, 12, 12);
      break;
    case 'giris':
      if (t - S.sonGirisToast > 4 && !r.halayda) {
        S.sonGirisToast = t;
        tost(S.tur === 'halay' ? `${r.ad} geldi · GİR yaz, halaya katıl` : `${r.ad} geldi · takım numarasını yaz`, r, 'giris');
        const ad = okunurAd(r.ad);
        Spiker.ekle(S.tur === 'halay' ? `Hoş geldin ${ad}! Gir yaz, halaya katıl.` : `Hoş geldin ${ad}! Takım numaranı yaz.`, 1, 'giris', 18);
      }
      break;
    case 'izleyici': S.izleyici = e.n; break;
  }
}

function kademe(elmas, tur) {
  const k = KADEMELER[tur];
  let i = 0;
  for (let j = 0; j < k.length; j++) if (elmas >= k[j].min) i = j;
  return i;
}

function hediye(r, e) {
  const elmas = Math.max(1, Number(e.elmas) || 1);
  const t = zaman();
  const h = S.hediye.get(r.id) || { id: r.id, elmas: 0 };
  h.elmas += elmas;
  S.hediye.set(r.id, h);
  r.toplam = h.elmas;
  const adetYazi = e.adet > 1 ? ` ×${e.adet}` : '';
  tost(`${r.ad}: ${e.ad || 'Hediye'}${adetYazi}`, r, 'hediye');
  halayaKat(r, true);
  ziplat(r);
  S.parlak.set(r.id, t + 3);
  const k = kademe(elmas, S.tur);
  S.kartFlas.set(`${S.tur}:${k}`, t + 1.4);
  const ad = okunurAd(r.ad);
  const hediyeAdi = String(e.ad || 'hediye').replace(/[^\p{L}\p{N} ]/gu, ' ').trim() || 'hediye';

  // kalıcı kostümler (toplam elmas)
  if (!r.gozluk && r.toplam >= KOSTUM.gozluk) { r.gozluk = true; tost(`${r.ad} gözlük taktı!`, r, 'takip'); }
  if (!r.fes && r.toplam >= KOSTUM.fes) { r.fes = true; tost(`${r.ad} fes giydi!`, r, 'takip'); }
  if (!r.altin && r.toplam >= KOSTUM.altin) { r.altin = true; duyuru('ALTIN ROBOT!', r.ad, ALTIN.ana, 2.4, 2); }

  // halaybaşı
  const yeniBas = basHesapla();
  if (yeniBas && yeniBas !== S.bas) {
    S.bas = yeniBas;
    if (S.tur === 'halay') {
      duyuru('HALAYBAŞI!', `mendil artık ${yeniBas.ad} elinde`, SARI, 2.4, 1);
      Spiker.ekle(`Yeni halaybaşı ${okunurAd(yeniBas.ad)}! Mendil artık onda.`, 3, 'halaybasi');
    }
  }

  // ortak hedef
  S.hedefElmas += elmas;
  const hedef = HEDEFLER[Math.min(S.hedefIdx, HEDEFLER.length - 1)];
  if (S.hedefElmas >= hedef) {
    S.hedefElmas -= hedef;
    S.hedefIdx++;
    S.altinBitis = t + 30;
    duyuru('HEDEF TAMAM!', '30 saniye herkes altın!', ALTIN.ana, 3.2, 5);
    konfeti(240); havaiFisek(4); Ses.buyuk();
    Spiker.ekle('Hedef tamam! Hepinize teşekkürler. Otuz saniye boyunca herkes altın!', 4, 'hedef');
  }

  if (S.tur === 'halay') halayHediye(r, elmas, k, ad, hediyeAdi);
  else takimHediye(r, elmas, k, ad);
}

function halayHediye(r, elmas, k, ad, hediyeAdi) {
  const t = zaman();
  S.cosku += Math.min(60, elmas * 4);
  kalpler(4 + k * 2, 540, D.sahneAlt - 120);
  if (k >= 5) {
    duyuru('HALAY ŞÖLENİ!', r.ad, PEMBE, 3.2, 4); seviyeAtla(true); konfeti(260); havaiFisek(5); Ses.buyuk(); S.tempoBitis = t + 12;
    Spiker.ekle(`${ad}, çok teşekkürler! Halay şöleni başlasın!`, 4, 'hediye:' + r.id);
  } else if (k >= 4) {
    S.dev = { id: r.id, bitis: t + 20 }; duyuru('DEV ROBOT!', r.ad, CAMGOBEGI, 2.6, 3); havaiFisek(3); Ses.buyuk();
    Spiker.ekle(`${ad}, teşekkürler! Artık dev robotsun!`, 3, 'hediye:' + r.id);
  } else if (k >= 3) {
    duyuru('HERKES ZIPLASIN!', r.ad, CAMGOBEGI, 2.4, 3); for (const x of S.kisiler.values()) if (x.halayda) x.zipla = t + Math.random() * 0.25; havaiFisek(3); Ses.buyuk(); S.tempoBitis = t + 10;
    Spiker.ekle(`${ad}, harikasın! Altın robot oldun, herkes zıplasın!`, 3, 'hediye:' + r.id);
  } else if (k >= 2) {
    duyuru('DAVUL ZURNA!', r.ad, SARI, 2.2, 2); havaiFisek(2); Ses.hediye(); S.tempoBitis = t + 8;
    Spiker.ekle(`${ad}, teşekkürler! Davul zurna çalsın!`, 2, 'hediye:' + r.id);
  } else {
    Ses.hediye();
    S.topluHediye.push({ r, hediyeAdi });
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
function seviyeAtla(sessiz = false) {
  S.seviye++; S.cosku = 0;
  if (!sessiz) {
    duyuru(`COŞKU ${S.seviye}!`, 'Halay hızlandı', SARI, 2.4, 1);
    Spiker.ekle(`Coşku ${S.seviye}! Beğenileriniz halayı hızlandırdı!`, 2, 'cosku');
  }
  havaiFisek(3); Ses.buyuk();
}

// ------------------------------------------------------------------ takım oyunları (yarış, halat)
function takimOyunuBaslat(tur) {
  S.tur = tur;
  S.oyun = {
    tur, asama: 'secim', bitis: zaman() + SURE.secim, sonSayim: 0, o: 0,
    takimlar: TAKIM_TANIM[tur].map((t) => ({ ...t, p: 0, enerji: 0, nitro: 0, turbo: 0, kayma: 0, dur: 0, dev: 0, roket: 0, uyeler: 0, hiz: 0, katki: new Map(), son: [] })),
    uye: new Map(), kazanan: null, berabere: false, yardimcilar: [],
  };
  if (tur === 'yaris') {
    duyuru('ARABA YARIŞI', '1, 2 ya da 3 yaz, takımını seç', CAMGOBEGI, 3);
    Spiker.ekle('Araba yarışı başlıyor! Bir sarı, iki mavi, üç pembe. Yoruma numaranı yaz, takımını seç.', 4, 'tur');
  } else {
    duyuru('HALAT ÇEKME', '1 SARI · 2 MAVİ yaz, takımını seç', CAMGOBEGI, 3);
    Spiker.ekle('Halat çekme zamanı! Bir sarı, iki mavi. Yoruma numaranı yaz, takımını seç.', 4, 'tur');
  }
}
function takim(no) { return S.oyun.takimlar[no - 1]; }
function takimSec(r, no) {
  const y = S.oyun;
  if (!y || y.asama === 'sonuc') return;
  const onceki = y.uye.get(r.id);
  if (onceki === no) return;
  if (onceki) { const ot = takim(onceki); ot.uyeler--; ot.son = ot.son.filter((x) => x !== r); }
  y.uye.set(r.id, no);
  const tk = takim(no);
  tk.uyeler++;
  tk.son = [r, ...tk.son.filter((x) => x !== r)].slice(0, 4);
  if (!onceki) tost(`${r.ad} → ${tk.ad} takım`, r, 'katil');
}
function otomatikTakim(r) {
  const y = S.oyun;
  if (y.uye.has(r.id)) return y.uye.get(r.id);
  const en = Math.min(...y.takimlar.map((t) => t.uyeler));
  const no = rastgele(y.takimlar.filter((t) => t.uyeler === en)).no;
  takimSec(r, no);
  return no;
}
function takimKatki(r, enerji, puan) {
  const y = S.oyun;
  if (!y || y.asama === 'sonuc') return;
  const no = otomatikTakim(r);
  if (y.asama !== 'oyun') return;
  const t = takim(no);
  t.enerji += enerji;
  t.katki.set(r.id, (t.katki.get(r.id) || 0) + puan);
}
function takimHediye(r, elmas, k, ad) {
  const y = S.oyun;
  if (!y || y.asama === 'sonuc') { Ses.hediye(); if (k >= 2) Spiker.ekle(`${ad}, çok teşekkürler!`, 3, 'hediye:' + r.id); else S.topluHediye.push({ r, hediyeAdi: 'hediye' }); return; }
  const no = otomatikTakim(r);
  const t = takim(no);
  const rakipler = y.takimlar.filter((x) => x !== t);
  Ses.hediye();
  const efekt = KADEMELER[y.tur][k].ad;
  const takimAdi = t.ad.toLocaleLowerCase('tr');
  if (k >= 2) Spiker.ekle(takimCumlesi(y.tur, k, ad, takimAdi), 3, 'hediye:' + r.id);
  else S.topluHediye.push({ r, hediyeAdi: 'hediye' });
  if (y.asama !== 'oyun') return;
  t.katki.set(r.id, (t.katki.get(r.id) || 0) + elmas * 10);
  if (y.tur === 'yaris') {
    t.enerji += Math.min(60, elmas * 10);
    if (k >= 1) t.turbo = Math.max(t.turbo, 2.5);
    if (k >= 2) t.nitro = Math.min(6, t.nitro + 3);
    if (k === 3) { for (const x of rakipler) x.kayma = 3; Ses.boing(); }
    if (k === 4) { t.p = Math.min(0.96, t.p + 0.15); t.roket = 1.2; }
    if (k >= 5) { for (const x of rakipler) x.dur = 4; }
  } else {
    const yon = t.no === 1 ? -1 : 1;
    const darbe = [0.02, 0.05, 0.1, 0.1, 0.1, 0.2][k];
    y.o = sinir(y.o + yon * darbe, -1, 1);
    t.enerji += Math.min(60, elmas * 10);
    if (k === 3) { for (const x of rakipler) x.kayma = 3; Ses.boing(); }
    if (k === 4) t.dev = 8;
    if (k >= 5) { for (const x of rakipler) x.kayma = 4; }
  }
  if (k >= 2) duyuru(efekt + '!', `${r.ad} · ${t.ad}`, t.renk.ana, 1.6, k);
}
function takimCumlesi(tur, k, ad, takimAdi) {
  const yaris = [null, null, `${ad} ${takimAdi} takıma nitro verdi!`, `${ad} rakiplerin önüne muz kabuğu attı!`,
    `${ad} ${takimAdi} takımı rokete bindirdi!`, `${ad} şimşek çaktırdı, rakipler durdu!`];
  const halat = [null, null, `${ad} ${takimAdi} takıma süper çekiş verdi!`, `${ad} rakipleri kaydırdı!`,
    `${ad} ${takimAdi} takıma dev yardımcı getirdi!`, `${ad} deprem yaptı, rakipler sendeledi!`];
  return (tur === 'yaris' ? yaris : halat)[k];
}
function takimGuncelle(dt) {
  const y = S.oyun, t = zaman();
  if (y.asama === 'secim' && t >= y.bitis) {
    y.asama = 'sayim'; y.bitis = t + SURE.sayim; y.sonSayim = 0;
    Spiker.ekle('Üç, iki, bir!', 4, 'sayim');
  }
  if (y.asama === 'sayim') {
    const kalan = Math.ceil(y.bitis - t);
    if (kalan !== y.sonSayim && kalan > 0) { y.sonSayim = kalan; Ses.sayim(); }
    if (t >= y.bitis) {
      y.asama = 'oyun'; y.bitis = t + SURE.oyun; Ses.basla();
      duyuru('BAŞLA!', y.tur === 'yaris' ? 'Beğen, gaz ver!' : 'Beğen, halatı çek!', YESIL, 1.4);
      Spiker.ekle(y.tur === 'yaris' ? 'Başla! Beğenileri basın, gaz verin!' : 'Başla! Beğenileri basın, halatı çekin!', 4, 'basla');
    }
  }
  if (y.asama === 'oyun') {
    for (const k of y.takimlar) {
      k.enerji *= Math.exp(-dt / 2.3);
      k.turbo = Math.max(0, k.turbo - dt); k.kayma = Math.max(0, k.kayma - dt); k.dur = Math.max(0, k.dur - dt);
      k.dev = Math.max(0, k.dev - dt); k.roket = Math.max(0, k.roket - dt);
    }
    if (y.tur === 'yaris') {
      let bitti = null;
      for (const k of y.takimlar) {
        let v = Math.min(0.09, 0.004 + 0.0042 * Math.sqrt(k.enerji));
        if (k.turbo > 0) v += 0.025;
        if (k.nitro > 0) { v += 0.05; k.nitro = Math.max(0, k.nitro - dt); }
        if (k.kayma > 0) v *= 0.25;
        if (k.dur > 0) v = 0;
        k.hiz = v;
        k.p = Math.min(1, k.p + v * dt);
        if (k.p >= 1 && !bitti) bitti = k;
      }
      if (bitti || t >= y.bitis) takimOyunuBitir(bitti || [...y.takimlar].sort((a, b) => b.p - a.p)[0]);
    } else {
      const [sari, mavi] = y.takimlar;
      const guc = (k) => (k.kayma > 0 ? 0 : 0.012 + 0.016 * Math.sqrt(k.enerji)) + (k.dev > 0 ? 0.06 : 0);
      sari.hiz = guc(sari); mavi.hiz = guc(mavi);
      y.o = sinir(y.o + (mavi.hiz - sari.hiz) * dt, -1, 1);
      if (Math.abs(y.o) >= 1) takimOyunuBitir(y.o < 0 ? sari : mavi);
      else if (t >= y.bitis) {
        if (Math.abs(y.o) < 0.03) takimOyunuBitir(null);
        else takimOyunuBitir(y.o < 0 ? sari : mavi);
      }
    }
  }
  if (y.asama === 'sonuc' && t >= y.bitis) sonrakiTur();
}
function takimOyunuBitir(k) {
  const y = S.oyun;
  y.asama = 'sonuc'; y.bitis = zaman() + SURE.sonuc; y.kazanan = k; y.berabere = !k;
  for (const tk of y.takimlar) tk.hiz = 0;
  if (k) y.yardimcilar = [...k.katki.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => S.kisiler.get(id)).filter(Boolean);
  konfeti(220); havaiFisek(4); Ses.zafer();
  if (!k) Spiker.ekle('Berabere! Halat ortada kaldı. Bir dahakine görüşürüz!', 4, 'sonuc');
  else {
    const yardim = y.yardimcilar[0] ? ` En büyük destek ${okunurAd(y.yardimcilar[0].ad)} oldu.` : '';
    Spiker.ekle(`Kazanan ${k.ad.toLocaleLowerCase('tr')} takım! Tebrikler!${yardim}`, 4, 'sonuc');
  }
}
function sonrakiTur() {
  S.siraIdx = (S.siraIdx + 1) % SIRA.length;
  const tur = SIRA[S.siraIdx];
  const t = zaman();
  if (tur === 'halay') {
    S.tur = 'halay'; S.turBitis = t + SURE.halay; S.oyun = null;
    duyuru('HALAY ZAMANI', 'GİR yaz, halaya katıl', SARI, 3);
    Spiker.ekle('Halay zamanı! Yoruma gir yazan halaya katılıyor. Beğenileri basın, coşku yükselsin!', 4, 'tur');
  } else takimOyunuBaslat(tur);
}
function siradakiAd() {
  const tur = SIRA[(S.siraIdx + 1) % SIRA.length];
  return { halay: 'halay', yaris: 'araba yarışı', halat: 'halat çekme' }[tur];
}

// Sessiz anlarda sunucunun söyleyecekleri
const HATIRLATMALAR = {
  halay: [
    'Yoruma gir yaz, robotun senin adınla halaya katılsın.',
    'Hangi robot sensin? Sarı mı, mavi mi, pembe mi? Yoruma yaz.',
    'Beğenileri basın, coşku dolsun, halay hızlansın!',
    'Hop yazan zıplıyor, selam yazan el sallıyor. Haydi deneyin!',
    'Takip edenin isminin yanına yıldız geliyor.',
    'Memleketin neresi? Plakanı yoruma yaz.',
  ],
  yaris: ['Beğenileri basın, arabanız hızlansın!', 'Takımını seçmeyen yoruma numarasını yazsın.', 'Yorum yazan takımına güç veriyor!'],
  halat: ['Beğenileri basın, halatı çekin!', 'Sarı mı kazanacak, mavi mi? Yoruma takımını yaz.', 'Yorum yazan takımına güç veriyor!'],
};
const MENU_HATIRLATMA = 'Ekrandaki menüde her hediyenin oyunda ne yaptığı yazıyor. Gözlük, fes ve altın robot sizi bekliyor.';

// "ayşe, can ve 3 kişi daha" gibi okunur liste
function adListesi(kisiler) {
  const adlar = [...new Set(kisiler.map((r) => okunurAd(r.ad)))].filter((a) => a !== 'arkadaşım');
  const goster = adlar.slice(0, 2);
  const fazla = new Set(kisiler.map((r) => r.id)).size - goster.length;
  if (!goster.length) return fazla === 1 ? 'arkadaşım' : `${fazla} arkadaşım`;
  return goster.join(goster.length === 2 && fazla <= 0 ? ' ve ' : ', ') + (fazla > 0 ? ` ve ${fazla} kişi daha` : '');
}

function spikerGuncelle() {
  if (!Spiker.acik()) { S.topluHediye.length = 0; S.topluTakip.length = 0; S.yeniKatilan.length = 0; return; }
  const t = zaman();
  // küçük hediyeler ve takipler tek tek değil, birkaç saniyede bir toplu teşekkür edilir
  if ((S.topluHediye.length || S.topluTakip.length) && t - S.sonTopluAnons > 9 && Spiker.sessizlik() > 1) {
    S.sonTopluAnons = t;
    if (S.topluHediye.length) {
      const liste = S.topluHediye.splice(0);
      const tekHediye = liste.length === 1 && liste[0].hediyeAdi !== 'hediye' ? liste[0].hediyeAdi : 'hediyeler';
      Spiker.ekle(`${adListesi(liste.map((x) => x.r))}, ${tekHediye} için çok teşekkürler!`, 2, 'toplu-hediye');
    } else {
      const liste = S.topluTakip.splice(0);
      Spiker.ekle(`${adListesi(liste)}, takip için teşekkürler, yıldızınızı aldınız!`, 2, 'toplu-takip');
    }
  }
  if (S.yeniKatilan.length && t - S.sonKatilimAnonsu > 8 && Spiker.sessizlik() > 1.5) {
    const liste = S.yeniKatilan.splice(0);
    S.sonKatilimAnonsu = t;
    if (S.tur === 'halay') Spiker.ekle(liste.length === 1 ? `${adListesi(liste)} halaya katıldı, hoş geldin!` : `${adListesi(liste)} halaya katıldı!`, 1, 'katilim');
  }
  const canli = S.durum === 'canli' || S.durum === 'deneme';
  if (canli && Spiker.sessizlik() > 22) {
    let metin;
    if (t - S.sonMenuHatirlatma > 240) { metin = MENU_HATIRLATMA; S.sonMenuHatirlatma = t; }
    else {
      const liste = HATIRLATMALAR[S.tur];
      metin = liste[S.hatirlatmaIdx++ % liste.length];
    }
    Spiker.ekle(metin, 0, 'hatirlatma');
  }
}

// ------------------------------------------------------------------ güncelleme
let sonTurKalan = 99;
function guncelle(dt) {
  const t = zaman();
  if (S.tur === 'halay') {
    if (S.cosku > 0) S.cosku = Math.max(0, S.cosku - dt * 0.6);
    if (S.cosku >= 100) seviyeAtla();
    const kalan = S.turBitis - t;
    if (kalan < 10 && sonTurKalan >= 10) Spiker.ekle(`On saniye sonra ${siradakiAd()} başlıyor!`, 2, 'uyari');
    sonTurKalan = kalan;
    if (t >= S.turBitis) { sonTurKalan = 99; sonrakiTur(); }
  } else takimGuncelle(dt);
  if (S.dev && t > S.dev.bitis) S.dev = null;
  spikerGuncelle();
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

// ------------------------------------------------------------------ halay sahnesi
function halaySirasi() {
  const halay = [...S.kisiler.values()].filter((k) => k.halayda);
  const bas = S.bas && S.bas.halayda ? S.bas : null;
  const digerleri = halay.filter((k) => k !== bas).sort((a, b) => b.son - a.son).slice(0, bas ? HALAY_GORUNEN - 1 : HALAY_GORUNEN);
  const dev = S.dev && S.kisiler.get(S.dev.id);
  if (dev && dev.halayda && dev !== bas && !digerleri.includes(dev)) { digerleri.pop(); digerleri.push(dev); }
  digerleri.sort((a, b) => a.katilma - b.katilma);
  return { sira: bas ? [bas, ...digerleri] : digerleri, toplam: halay.length };
}
function robotRengi(k, t) { return k.altin || t < S.altinBitis ? ALTIN : k.renk; }

function halayCiz() {
  const c = ctx, t = zaman();
  const { sira } = halaySirasi();
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
    let s = D.sOn * (gy - D.yh) / (D.on - D.yh);
    const dev = !!(S.dev && S.dev.id === k.id);
    if (dev) s *= 1.5;
    const x = 540 - span / 2 + u * span + yay * s;
    const zt = t - k.zipla;
    const zipla = zt >= 0 && zt < 0.55 ? Math.sin((zt / 0.55) * Math.PI) * 110 * s : 0;
    const zipBob = Math.abs(Math.sin(faz * Math.PI)) * 9 * s;
    return { k, x, gy, s, zipla: zipla + zipBob, dev, i };
  });
  // el ele tutuşan kollar
  for (let i = 0; i < n - 1; i++) {
    const a = konum[i], b = konum[i + 1];
    const ya = a.gy - a.zipla, yb = b.gy - b.zipla;
    const elbowA = [a.x + a.s * 98, ya - a.s * 190], elbowB = [b.x - b.s * 98, yb - b.s * 190];
    const sal = Math.sin(faz * Math.PI * 2) * 14 * (a.s + b.s) / 2;
    const el = [(elbowA[0] + elbowB[0]) / 2, Math.min(elbowA[1], elbowB[1]) - 70 * (a.s + b.s) / 2 + sal];
    cizgi(c, [[a.x + a.s * 58, ya - a.s * 236], elbowA, el], 27 * a.s, robotRengi(a.k, t).koyu);
    cizgi(c, [[b.x - b.s * 58, yb - b.s * 236], elbowB, el], 27 * b.s, robotRengi(b.k, t).koyu);
    daire(c, el[0], el[1], 22 * Math.max(a.s, b.s), BEYAZ);
  }
  // robotlar (arkadan öne, dev robot en önde)
  const cizimSirasi = [...konum].sort((a, b) => (a.dev - b.dev) || (b.i - a.i));
  for (const p of cizimSirasi) {
    const i = p.i, k = p.k;
    const ilk = i === 0, son = i === n - 1;
    let kolSol = null, kolSag = null;
    if (ilk) kolSol = 'yukari';
    if (son && n > 1) kolSag = Math.floor(vurus) % 2 ? 'salla' : 'havada';
    if (n === 1) { kolSol = 'yukari'; kolSag = 'bel'; }
    if (t - k.selam < 1.6 && !ilk) kolSag = Math.floor(t * 6) % 2 ? 'salla' : 'salla2';
    const parla = (S.parlak.get(k.id) || 0) > t;
    robot(c, p.x, p.gy, p.s, robotRengi(k, t), { adim, faz, zipla: p.zipla, kolSol, kolSag, isik: k === S.bas ? SARI : BEYAZ,
      gozluk: k.gozluk, fes: k.fes, altin: k.altin || t < S.altinBitis, parla });
    if (ilk) {
      const el = [p.x - p.s * 100, p.gy - p.zipla - p.s * 376];
      mendil(c, el[0], el[1], 1.18 * p.s, Math.sin(t * 7) * 0.45 - 0.1);
      daire(c, el[0], el[1], 22 * p.s, BEYAZ);
    }
  }
  // isim etiketleri ve konuşma balonları
  const kalabalik = n > 5;
  for (let i = n - 1; i >= 0; i--) {
    const p = konum[i];
    const boy = Math.max(26, (kalabalik && !p.dev ? 30 : 34) * Math.min(p.s, 1.1));
    const ekstra = (p.k.fes ? 70 : 0) * p.s;
    const y = p.gy - p.zipla - p.s * 485 - ekstra - (kalabalik && i % 2 === 1 && !p.dev ? 50 : 0);
    const e = isimEtiketi(c, p.k, p.x, y, boy, { bas: p.k === S.bas, uzun: kalabalik ? 8 : 10 });
    const b = p.k.balon;
    if (b && t - b.t0 < 3) balon(c, kisalt(b.metin, 22), p.x, e.ust - (p.k === S.bas ? 34 : 12), 28);
  }
}

// ------------------------------------------------------------------ yarış sahnesi
function yarisCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const ust = D.sahneUst + 16, alt = D.sahneAlt + 80, seritH = (alt - ust) / 3;
  const basX = 70, bitisX = 1010;
  c.fillStyle = 'rgba(27,16,64,0.55)';
  yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.fill();
  for (let i = 0; i < 3; i++) {
    const tk = y.takimlar[i];
    const sy = ust + i * seritH;
    if (i > 0) {
      c.save(); c.setLineDash([26, 22]); c.lineDashOffset = y.asama === 'oyun' ? -t * 600 * (0.5 + tk.hiz * 10) : 0;
      cizgi(c, [[50, sy], [1030, sy]], 6, 'rgba(255,255,255,0.55)'); c.restore();
    }
    const kare = 22;
    for (let r = 0; r * kare < seritH - 8; r++) for (let q = 0; q < 2; q++) {
      c.fillStyle = (r + q) % 2 ? INK : BEYAZ;
      c.fillRect(bitisX - 44 + q * kare, sy + 4 + r * kare, kare, Math.min(kare, seritH - 8 - r * kare));
    }
    const s = sinir((seritH - 60) / 205, 0.45, 0.92);
    const yolU = bitisX - 44 - basX - 170 * s - 176 * s;
    const ax = basX + 176 * s + tk.p * yolU + (y.asama === 'oyun' ? Math.sin(t * 30 + i) * 1.5 : 0);
    const ay = sy + seritH - 14;
    if (tk.kayma > 0) muz(c, ax + 210 * s, ay - 14, 1.2);
    araba(c, ax, ay, s, tk.renk, tk.no, { hiz: y.asama === 'oyun' ? tk.hiz : 0, nitro: tk.nitro > 0 || tk.turbo > 0 || tk.roket > 0, roket: tk.roket > 0, kayma: tk.kayma > 0, dur: tk.dur > 0, t });
    const lx = 60, ly = sy + 34;
    const w = hap(c, `${tk.no} · ${tk.ad}`, lx, ly, 34, tk.renk.ana, INK, { hiza: 'left' });
    yazi(c, `${tk.uyeler} kişi`, lx + w + 14, ly + 12, 32, BEYAZ, { hiza: 'left', w: 600, golge: true });
    const enIyi = [...tk.katki.entries()].sort((a, b) => b[1] - a[1])[0];
    if (enIyi && S.kisiler.get(enIyi[0])) yazi(c, `gaz: ${kisalt(S.kisiler.get(enIyi[0]).ad, 12)}`, bitisX - 60, ly + 12, 30, LILA, { hiza: 'right', w: 600 });
  }
  takimOyunuKaplama(ust, alt);
}

// ------------------------------------------------------------------ halat çekme sahnesi
function halatCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const gy = D.on - 10, s = D.sOn * 0.74;
  const merkez = 540 + y.o * 330;
  for (const [x, tk] of [[210, y.takimlar[0]], [870, y.takimlar[1]]]) {
    c.save(); c.setLineDash([22, 16]); cizgi(c, [[x, D.hz + 30], [x, gy + 26]], 8, tk.renk.ana); c.restore();
  }
  c.save(); c.setLineDash([14, 14]); cizgi(c, [[540, D.hz + 30], [540, gy + 26]], 5, 'rgba(255,255,255,0.7)'); c.restore();
  const eller = [];
  const robotlar = [];
  for (const [ti, yan] of [[0, -1], [1, 1]]) {
    const tk = y.takimlar[ti];
    const liste = tk.son.length ? tk.son.slice(0, 4) : [null, null, null];
    const cekis = y.asama === 'oyun' ? Math.min(0.12, tk.hiz * 1.5) : 0;
    liste.forEach((k, i) => {
      const x = merkez + yan * (115 + i * 92);
      const aci = yan * (0.12 + cekis) + (tk.kayma > 0 ? -yan * 0.35 * Math.abs(Math.sin(t * 8)) : 0);
      robotlar.push({ k, x, aci, yan, tk, i });
    });
    if (tk.dev > 0) robotlar.push({ k: null, x: merkez + yan * (115 + liste.length * 92 + 40), aci: yan * 0.18, yan, tk, dev: true, i: 9 });
  }
  for (const r of robotlar) {
    const rs = r.dev ? s * 1.5 : s;
    c.save(); c.translate(r.x, gy); c.rotate(r.aci);
    const renk = r.k ? robotRengi(r.k, t) : r.tk.renk;
    robot(c, 0, 0, rs, renk, { dur: true, gozluk: r.k && r.k.gozluk, fes: r.k && r.k.fes, altin: r.k && (r.k.altin || t < S.altinBitis), golge: false });
    const yon = -r.yan;
    const el1 = kol(c, 0, 0, rs, renk, 1, [[-58 * yon, -236], [40 * yon, -214], [140 * yon, -196]]);
    const el2 = kol(c, 0, 0, rs, renk, 1, [[58 * yon, -236], [110 * yon, -206], [176 * yon, -192]]);
    const m = c.getTransform();
    for (const el of [el1, el2]) {
      const p = new DOMPoint(el[0], el[1]).matrixTransform(m);
      eller.push([p.x / olcek - ox, p.y / olcek]);
    }
    c.restore();
  }
  eller.sort((a, b) => a[0] - b[0]);
  if (eller.length) {
    const ip = [[eller[0][0] - 80, eller[0][1] + 8], ...eller, [eller[eller.length - 1][0] + 80, eller[eller.length - 1][1] + 8]];
    cizgi(c, ip, 16, '#8A5A2B');
    c.save(); c.setLineDash([10, 12]); cizgi(c, ip, 6, '#C99A5B'); c.restore();
    for (const el of eller) daire(c, el[0], el[1], 22 * s, BEYAZ);
    let my = eller[0][1];
    for (let i = 0; i < eller.length - 1; i++) if (eller[i][0] <= merkez && eller[i + 1][0] >= merkez) {
      const u = (merkez - eller[i][0]) / Math.max(1, eller[i + 1][0] - eller[i][0]);
      my = ara(eller[i][1], eller[i + 1][1], u);
    }
    c.fillStyle = '#E53950'; c.beginPath(); c.moveTo(merkez - 18, my); c.lineTo(merkez + 18, my); c.lineTo(merkez, my + 70); c.closePath(); c.fill();
  }
  for (const r of robotlar) if (r.k) isimEtiketi(c, r.k, sinir(r.x + r.yan * 20, 110, 970), gy - s * 520 - (r.i % 2 ? 46 : 0), 28, { uzun: 8 });
  for (const [ti, x, hiza] of [[0, 60, 'left'], [1, 1020, 'right']]) {
    const tk = y.takimlar[ti];
    const ly = D.sahneUst + 40;
    hap(c, `${tk.no} · ${tk.ad} · ${tk.uyeler} kişi`, x, ly, 32, tk.renk.ana, INK, { hiza });
    if (tk.kayma > 0) yazi(c, 'KAYIYOR!', x + (hiza === 'left' ? 10 : -10), ly + 62, 36, PEMBE, { hiza, golge: true });
    else if (tk.dev > 0) yazi(c, 'DEV YARDIMCI!', x + (hiza === 'left' ? 10 : -10), ly + 62, 36, CAMGOBEGI, { hiza, golge: true });
  }
  takimOyunuKaplama(D.sahneUst + 16, D.sahneAlt + 80);
}

function takimOyunuKaplama(ust, alt) {
  const c = ctx, y = S.oyun, t = zaman();
  const my = ust + (alt - ust) / 2;
  if (y.asama === 'secim' || y.asama === 'sayim') {
    c.fillStyle = 'rgba(27,16,64,0.66)';
    yol(c, 110, my - 150, 860, 300, 40); c.fill();
    if (y.asama === 'secim') {
      yazi(c, 'TAKIMINI SEÇ', 540, my - 40, 86, BEYAZ, { golge: true });
      yazi(c, y.tur === 'yaris' ? '1 · 2 · 3 yaz' : '1 SARI · 2 MAVİ yaz', 540, my + 40, 60, SARI, { golge: true });
      yazi(c, `${Math.ceil(y.bitis - t)} sn`, 540, my + 110, 44, LILA, { w: 600 });
    } else {
      const kalan = Math.max(1, Math.ceil(y.bitis - t));
      const k = 1 + (1 - ((y.bitis - t) % 1)) * 0.25;
      yazi(c, String(kalan), 540, my + 70 * k, 220 * k, SARI, { golge: true });
    }
  }
  if (y.asama === 'sonuc') {
    c.fillStyle = 'rgba(27,16,64,0.88)';
    yol(c, 70, my - 210, 940, 420, 44); c.fill();
    if (y.berabere) {
      yazi(c, 'BERABERE!', 540, my + 20, 120, BEYAZ, { golge: true });
      yazi(c, 'Halat ortada kaldı', 540, my + 100, 44, LILA, { w: 600 });
    } else {
      const k = y.kazanan;
      yazi(c, 'KAZANAN', 540, my - 120, 58, LILA);
      yazi(c, `${k.ad} TAKIM`, 540, my - 20, 120, k.renk.ana, { golge: true, maxW: 860 });
      if (y.yardimcilar.length) {
        yazi(c, y.tur === 'yaris' ? 'En çok gaz verenler' : 'En çok çekenler', 540, my + 62, 36, LILA, { w: 600 });
        yazi(c, y.yardimcilar.map((r) => kisalt(r.ad, 12)).join(' · '), 540, my + 130, 46, BEYAZ, { maxW: 860 });
      }
    }
  }
}

// ------------------------------------------------------------------ üst bilgi (HUD)
function sure(sn) { sn = Math.max(0, Math.ceil(sn)); return `${Math.floor(sn / 60)}:${String(sn % 60).padStart(2, '0')}`; }

function talimatSatiri(c, y, parcalar) {
  let x = 60;
  for (const [anahtar, metin] of parcalar) {
    if (anahtar) { const w = hap(c, anahtar, x, y, 31, SARI, INK, { hiza: 'left', h: 44 }); x += w + 12; }
    if (metin) { const tw = yazi(c, metin, x, y + 11, 33, BEYAZ, { hiza: 'left', w: 600, golge: true }); x += tw + 30; }
  }
}

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
  if (S.durum === 'deneme') { dRenk = CAMGOBEGI; dYazi = 'DENEME'; }
  else if (!S.sunucu) { dRenk = '#FF5A5A'; dYazi = 'SUNUCU YOK'; }
  else if (S.durum === 'canli') { dRenk = YESIL; dYazi = S.izleyici ? `CANLI · ${S.izleyici}` : 'CANLI'; }
  else if (S.durum === 'kapali') { dRenk = '#9AA0B5'; dYazi = 'YAYIN KAPALI'; }
  else if (S.durum === 'hata') { dRenk = '#FF9F43'; dYazi = 'BAĞLANTI SORUNU'; }
  const dw = genislik(c, dYazi, 28) + 64;
  kutu(c, 1040 - dw, my - 26, dw, 52, 26, 'rgba(27,16,64,0.7)');
  daire(c, 1040 - dw + 26, my, 9 + (S.durum === 'canli' ? Math.sin(t * 5) * 2 : 0), dRenk);
  yazi(c, dYazi, 1040 - dw + 44, my + 10, 28, BEYAZ, { hiza: 'left' });
  if (Spiker.konusuyor()) hoparlor(c, 1040 - dw - 36, my, 1 + 0.1 * Math.sin(t * 14), SARI);

  // tur paneli + ortak hedef
  const py = D.panel;
  kutu(c, 40, py, 1000, 172, 34, 'rgba(27,16,64,0.58)');
  const halay = S.tur === 'halay';
  const baslik = { halay: 'HALAY TURU', yaris: 'ARABA YARIŞI', halat: 'HALAT ÇEKME' }[S.tur];
  const kalan = halay ? S.turBitis - t : (S.oyun.asama === 'sayim' ? 0 : S.oyun.bitis - t);
  yazi(c, baslik, 74, py + 76, 72, BEYAZ, { hiza: 'left', golge: true, maxW: 640 });
  yazi(c, sure(kalan), 1006, py + 76, 72, SARI, { hiza: 'right', golge: true });
  let alt;
  if (halay) alt = `Halayda ${[...S.kisiler.values()].filter((k) => k.halayda).length} kişi · Sırada: ${siradakiAd()}`;
  else alt = { secim: 'Takımlar kuruluyor', sayim: 'Hazır ol!', oyun: S.tur === 'yaris' ? 'Beğen, gaz ver!' : 'Beğen, halatı çek!', sonuc: `Sırada: ${siradakiAd()}` }[S.oyun.asama];
  yazi(c, alt, 76, py + 112, 29, LILA, { hiza: 'left', w: 600, maxW: 930 });
  const hedef = HEDEFLER[Math.min(S.hedefIdx, HEDEFLER.length - 1)];
  const hx = 70, hyy = py + 128, hw = 940, hh = 32;
  kutu(c, hx, hyy, hw, hh, hh / 2, 'rgba(27,16,64,0.85)');
  const oran = sinir(S.hedefElmas / hedef, 0, 1);
  if (oran > 0.005) kutu(c, hx + 3, hyy + 3, Math.max(hh - 6, (hw - 6) * oran), hh - 6, (hh - 6) / 2, ALTIN.ana);
  elmasIkon(c, hx + 26, hyy + hh / 2, 10);
  yazi(c, `HEDEF ${S.hedefElmas} / ${hedef} → 30 sn HERKES ALTIN`, hx + 46, hyy + 23, 22, BEYAZ, { hiza: 'left', golge: true, maxW: hw - 60 });

  // nasıl oynanır
  const satirlar = {
    halay: [[['GİR', 'katıl'], ['HOP', 'zıpla'], ['SELAM', 'el salla']], [['BEĞEN', 'coşku'], ['TAKİP', 'yıldız al'], ['', 'yorumun balonda!']]],
    yaris: [[['1 · 2 · 3', 'yaz, takımını seç']], [['BEĞEN', 'gaz'], ['YORUM', 'güç'], ['TAKİP', 'yıldız']]],
    halat: [[['1 SARI', ''], ['2 MAVİ', 'yaz, takım seç']], [['BEĞEN', 'çek'], ['YORUM', 'güç'], ['TAKİP', 'yıldız']]],
  }[S.tur];
  talimatSatiri(c, D.talimat + 22, satirlar[0]);
  talimatSatiri(c, D.talimat + 74, satirlar[1]);

  // hediye menüsü
  const mt = D.menu;
  yazi(c, 'HEDİYE MENÜSÜ', 60, mt + 12, 28, SARI, { hiza: 'left' });
  yazi(c, 'hediye at, efekt hemen çalışır', 1020, mt + 12, 24, LILA, { hiza: 'right', w: 600 });
  const kd = KADEMELER[S.tur];
  const kw = 312, kh = 72;
  kd.forEach((kad, i) => {
    const x = 60 + (i % 3) * (kw + 12), y = mt + 24 + Math.floor(i / 3) * (kh + 10);
    const flas = (S.kartFlas.get(`${S.tur}:${i}`) || 0) > t;
    kutu(c, x, y, kw, kh, 20, flas ? SARI : 'rgba(27,16,64,0.62)');
    elmasIkon(c, x + 30, y + kh / 2, 13, flas ? INK : '#7FE7FF');
    const fw = yazi(c, `${kad.min}+`, x + 52, y + kh / 2 + 13, 36, flas ? INK : SARI, { hiza: 'left' });
    const ax = x + Math.max(134, 52 + fw + 14);
    yazi(c, kad.ad, ax, y + kh / 2 + 11, 28, flas ? INK : BEYAZ, { hiza: 'left', maxW: x + kw - 12 - ax });
  });

  // en çok hediye atanlar
  const ly = D.lider;
  const lis = liderler();
  const cw = 312, gap = 12;
  for (let i = 0; i < 3; i++) {
    const x = 60 + i * (cw + gap), y = ly;
    const L = lis[i];
    kutu(c, x, y, cw, 58, 20, i === 0 ? 'rgba(255,210,63,0.22)' : 'rgba(27,16,64,0.55)');
    if (i === 0) { c.lineWidth = 3; c.strokeStyle = SARI; yol(c, x + 1.5, y + 1.5, cw - 3, 55, 19); c.stroke(); }
    if (L) {
      avatar(c, L.k, x + 32, y + 29, 21);
      if (i === 0) tac(c, x + 32, y + 8, 24);
      yazi(c, kisalt(L.k.ad, 10), x + 62, y + 28, 26, BEYAZ, { hiza: 'left', maxW: cw - 74 });
      elmasIkon(c, x + 70, y + 44, 8);
      yazi(c, String(L.elmas), x + 84, y + 53, 22, '#7FE7FF', { hiza: 'left' });
    } else if (i === 0) {
      tac(c, x + 30, y + 40, 30);
      yazi(c, 'İlk hediye, taç senin', x + 56, y + 38, 25, BEYAZ, { hiza: 'left', maxW: cw - 66 });
    } else yazi(c, `${i + 1}. sıra boş`, x + 22, y + 38, 25, '#9C8FD9', { hiza: 'left' });
  }

  // coşku çubuğu
  if (halay) {
    const cy = D.alt, cx = 60, cwid = 960, ch = 58;
    kutu(c, cx, cy, cwid, ch, ch / 2, 'rgba(27,16,64,0.7)');
    const o = sinir(S.cosku / 100, 0, 1);
    if (o > 0.01) {
      const g = c.createLinearGradient(cx, 0, cx + cwid, 0);
      g.addColorStop(0, SARI); g.addColorStop(1, PEMBE);
      yol(c, cx + 5, cy + 5, Math.max(ch - 10, (cwid - 10) * o), ch - 10, (ch - 10) / 2); c.fillStyle = g; c.fill();
    }
    yazi(c, `COŞKU ${S.seviye}`, cx + 26, cy + 41, 34, BEYAZ, { hiza: 'left', golge: true });
    yazi(c, 'BEĞEN → halay hızlanır', cx + cwid - 26, cy + 41, 28, BEYAZ, { hiza: 'right', golge: true });
  }
}

function susler() {
  const c = ctx, b = 1 + Math.abs(Math.sin(S.vurus * Math.PI)) * 0.25;
  const y0 = D.sahneUst;
  parilti(c, 170, y0 + 90, 24 * b, SARI);
  parilti(c, 930, y0 + 70, 30 * b, BEYAZ);
  parilti(c, 980, y0 + 170, 15 * b, SARI);
  parilti(c, 110, y0 + 210, 13 * b, BEYAZ, 0.9);
  if (S.tur === 'halay') {
    c.save(); c.globalAlpha = 0.9; nota(c, 860, y0 + 250 + Math.sin(S.vurus * Math.PI) * 8, 0.85, BEYAZ);
    nota(c, 150, y0 + 320 + Math.cos(S.vurus * Math.PI) * 8, 0.75, SARI); c.restore();
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
  const goster = tostlar.slice(-2);
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
  const my = S.tur !== 'yaris' ? D.sahneUst + 150 : (D.sahneUst + D.sahneAlt) / 2 - 20;
  c.save(); c.globalAlpha = Math.max(0, a);
  c.translate(540, my); c.scale(k, k); c.rotate(-0.03);
  kutu(c, -500, -96, 1000, afis.alt ? 192 : 150, 36, 'rgba(27,16,64,0.9)');
  yazi(c, afis.baslik, 0, afis.alt ? 10 : 30, 104, afis.renk, { golge: true, maxW: 940 });
  if (afis.alt) yazi(c, kisalt(afis.alt, 36), 0, 74, 44, BEYAZ, { w: 600, maxW: 940 });
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
  kutu(c, 60, y, 12, 128, 6, PEMBE);
  yazi(c, baslik, 540, y + 56, 46, BEYAZ, { maxW: 900 });
  yazi(c, alt, 540, y + 102, 30, LILA, { w: 600, maxW: 900 });
}

function ciz() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(arka, 0, 0);
  ctx.setTransform(olcek, 0, 0, olcek, ox * olcek, 0);
  susler();
  if (S.tur === 'halay') halayCiz(); else if (S.tur === 'yaris') yarisCiz(); else halatCiz();
  hudCiz();
  parcaCiz();
  tostCiz();
  afisCiz();
  durumCiz();
}

// ------------------------------------------------------------------ kayıt (sayfa yenilenirse halay kaybolmasın)
const KAYIT = 'herkesPiste.v2';
function kaydet() {
  try {
    const t = zaman();
    const k = [...S.kisiler.values()].filter((r) => r.halayda || S.hediye.has(r.id) || r.takip).sort((a, b) => b.son - a.son).slice(0, 200)
      .map((r) => ({ id: r.id, ad: r.ad, av: r.av, h: r.halayda, ky: Math.round(t - r.katilma), sy: Math.round(t - r.son), tk: r.takip }));
    localStorage.setItem(KAYIT, JSON.stringify({ z: Date.now(), k, h: [...S.hediye.values()], sv: S.seviye, c: S.cosku, hi: S.hedefIdx, he: S.hedefElmas }));
  } catch {}
}
function yukle() {
  try {
    const v = JSON.parse(localStorage.getItem(KAYIT) || 'null');
    if (!v || Date.now() - v.z > 30 * 60 * 1000) return;
    const t = zaman();
    for (const x of v.k || []) {
      const r = kisi({ id: x.id, ad: x.ad, av: x.av });
      r.halayda = !!x.h; r.katilma = t - (x.ky || 0); r.son = t - (x.sy || 0); r.takip = !!x.tk;
    }
    for (const h of v.h || []) {
      const r = S.kisiler.get(h.id);
      if (!r) continue;
      S.hediye.set(h.id, { id: h.id, elmas: h.elmas });
      r.toplam = h.elmas; r.gozluk = h.elmas >= KOSTUM.gozluk; r.fes = h.elmas >= KOSTUM.fes; r.altin = h.elmas >= KOSTUM.altin;
    }
    S.seviye = v.sv || 1; S.cosku = v.c || 0; S.hedefIdx = v.hi || 0; S.hedefElmas = v.he || 0;
    S.bas = basHesapla();
  } catch {}
}

// ------------------------------------------------------------------ sunucu bağlantısı
const hesapEl = document.getElementById('hesap');
if (DEMO) hesapEl.textContent = 'Deneme modu: sahte izleyiciler';
function sunucuyaBaglan() {
  const url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
  let ws;
  try { ws = new WebSocket(url); } catch { setTimeout(sunucuyaBaglan, 3000); return; }
  ws.onopen = () => { S.sunucu = true; };
  ws.onmessage = (m) => {
    let e; try { e = JSON.parse(m.data); } catch { return; }
    if (e.t === 'durum') {
      const once = S.durum;
      S.durum = e.durum; S.durumMesaj = e.m || ''; if (e.izleyici) S.izleyici = e.izleyici;
      if (e.kullanici) hesapEl.textContent = `Bağlanacak TikTok hesabı: @${e.kullanici}`;
      if (once !== 'canli' && S.durum === 'canli') Spiker.ekle('Herkes Piste\'ye hoş geldiniz! Yoruma gir yazan halaya katılıyor.', 4, 'acilis');
    } else olay(e);
  };
  ws.onclose = () => { S.sunucu = false; setTimeout(sunucuyaBaglan, 2000 + Math.random() * 2000); };
  ws.onerror = () => { try { ws.close(); } catch {} };
}

// ------------------------------------------------------------------ deneme modu (sahte izleyiciler)
function denemeBaslat() {
  const adlar = ['ayse.k', 'mehmet_34', 'zeynep.y', 'can06', 'elifim', 'burak.tr', 'selin', 'emre_35', 'deniz', 'merve.gs', 'kaan', 'irem', 'ali_veli', 'gökhan', 'sude', 'oğuz', 'buse', 'tolga', 'ecem', 'yusuf'];
  const kucuk = [['Gül', 1], ['TikTok', 1], ['Parmak kalp', 5], ['Dondurma', 1], ['Parfüm', 20]];
  const buyukH = [['Donut', 30], ['Kalpli mektup', 99], ['Konfeti', 100], ['Gül buketi', 199], ['Aslan', 500]];
  const sohbet = ['harika', 'kral', 'çok iyi', 'süper', 'bravo', 'eline sağlık'];
  setInterval(() => {
    const ad = rastgele(adlar);
    const k = { id: ad, ad, av: '' };
    const r = Math.random();
    if (S.tur === 'halay') {
      if (r < 0.22) olay({ t: 'yorum', k, m: rastgele(['gir', 'GİR', 'gir!', 'hop', 'selam']) });
      else if (r < 0.32) olay({ t: 'yorum', k, m: rastgele(sohbet) });
      else if (r < 0.86) olay({ t: 'begeni', k, n: 1 + Math.floor(Math.random() * 15) });
      else if (r < 0.95) { const [g, e] = rastgele(kucuk); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
      else if (r < 0.98) { const [g, e] = rastgele(buyukH); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
      else olay({ t: 'takip', k });
    } else {
      const takimlar = S.tur === 'yaris' ? ['1', '2', '3', 'mavi', 'sarı'] : ['1', '2', 'sarı', 'mavi'];
      if (r < 0.3) olay({ t: 'yorum', k, m: rastgele(takimlar) });
      else if (r < 0.9) olay({ t: 'begeni', k, n: 1 + Math.floor(Math.random() * 15) });
      else { const [g, e] = rastgele([...kucuk, ...buyukH.slice(0, 3)]); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
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
  const davul = document.getElementById('sesKutu').checked;
  const spiker = document.getElementById('spikerKutu').checked;
  Ses.baslat(davul, spiker);
  Spiker.baslat(spiker);
  Ses.devam();
  if (spiker && 'speechSynthesis' in window) { try { speechSynthesis.getVoices(); } catch {} }
  await tamEkran();
  uyanikTut();
  tamBtnGuncelle();
  if (DEMO || S.durum === 'canli') Spiker.ekle('Herkes Piste\'ye hoş geldiniz! Yoruma gir yazan halaya katılıyor.', 4, 'acilis');
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
(document.fonts && document.fonts.load ? Promise.all([document.fonts.load(font(40, 800)), document.fonts.load(font(40, 600)), document.fonts.load(font(40, 700))]) : Promise.resolve())
  .catch(() => {}).finally(() => requestAnimationFrame(kare));

// test kancası (yalnızca ?test ile)
if (P.has('test')) window.__hp = { S, olay, takimOyunuBaslat, sonrakiTur, zaman, duyuru, Spiker };
})();
