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
const TAKIM3 = [{ no: 1, ad: 'SARI', renk: RENKLER[0] }, { no: 2, ad: 'MAVİ', renk: RENKLER[1] }, { no: 3, ad: 'PEMBE', renk: RENKLER[2] }];
const TAKIM2 = TAKIM3.slice(0, 2);
const sayiAyar = (ad, varsayilan) => { const v = Number(P.get(ad)); return v > 0 ? v : varsayilan; };
const SURE = { halay: sayiAyar('halay', 80), secim: 15, sayim: 3, oyun: sayiAyar('oyun', 45), sonuc: 8 };
// Turlar bu sırayla kendiliğinden döner (?sira=yaris,bilgi gibi bir adresle değiştirilebilir)
const SIRA = (P.get('sira') || 'halay,yaris,bilgi,tarih,kelime,balon,bayrak,cografya,halay,matematik,halat,memleket,hayvan,dogruyanlis,ingilizce,kule,halay,atasozu,bilim,renk,gures,deyim,plaka,uzay,halay,roket,hafiza,yazim,spor,futbol,kactane,baskent,halay,esanlam,boya,dizi,mutfak,encok,anket,kayik,halay,zitanlam,turkiye,basket,saat,eksikharf,kartopu,bolge,halay,farkli,tirmanma,enler,tersten,dans,isimsehir,yazma')
  .split(',').map((x) => x.trim()).filter(Boolean);
const HALAY_GORUNEN = 10;

// Hediye menüsü: tek seferde gelen elmas değerine göre en yüksek kademe çalışır.
const kd = (...adlar) => [1, 5, 20, 99, 199, 500].map((min, i) => ({ min, ad: adlar[i] }));
const KADEMELER = {
  halay: kd('KALP YAĞMURU', 'GÖZLÜK TAKAR', 'FES + DAVUL', 'ALTIN ROBOT', 'DEV ROBOT', 'HALAY ŞÖLENİ'),
  yaris: kd('GAZ', 'TURBO', 'NİTRO', 'MUZ KABUĞU', 'ROKET', 'ŞİMŞEK'),
  halat: kd('ÇEK', 'GÜÇLÜ ÇEKİŞ', 'SÜPER ÇEKİŞ', 'RAKİP KAYAR', 'DEV YARDIMCI', 'YILDIRIM'),
  balon: kd('HAVA', 'TURBO POMPA', 'SÜPER POMPA', 'POMPA TIKANIR', 'DEV POMPA', 'BUZ FIRTINASI'),
  kule: kd('TUĞLA', 'HIZLI USTA', 'VİNÇ', 'RÜZGÂR', '3 KAT BİRDEN', 'ŞİMŞEK'),
  roket: kd('YAKIT', 'TURBO', 'NİTRO', 'METEOR YAĞMURU', 'SÜPER İTKİ', 'KARA DELİK'),
  gures: kd('İT', 'GÜÇLÜ İTİŞ', 'PEHLİVAN GÜCÜ', 'RAKİP KAYAR', 'DEV PEHLİVAN', 'ŞAMPİYON GÜCÜ'),
  futbol: kd('PAS', 'ŞUT', 'SERT ŞUT', 'RAKİP KAYAR', 'YILDIZ OYUNCU', 'SÜPER ATAK'),
  bilgi: kd('KALP YAĞMURU', 'İPUCU', '+5 SANİYE', 'ÇİFT PUAN', 'DEV KUPA', 'BİLGİ ŞÖLENİ'),
  memleket: kd('KALP YAĞMURU', 'ŞEHİR YILDIZI', 'DAVUL ZURNA', 'HAVAİ FİŞEK', 'DEV BAYRAK', 'MEMLEKET ŞÖLENİ'),
};
KADEMELER.kelime = KADEMELER.matematik = KADEMELER.atasozu = KADEMELER.bilgi;
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
  // Telefon (uzun ekran): üstte TikTok başlığına, altta yorumlara yer bırakılır.
  // Tablet (Galaxy Tab S11 Ultra gibi geniş dikey ekran): TikTok görüntüyü kutu içinde gösterir, üstünü ve altını kapatmaz;
  // bu yüzden boşluk bırakmadan bütün yükseklik kullanılır.
  const kompakt = H < 2000;
  const ust = kompakt ? 36 : Math.max(150, H * 0.075);
  const sahneUst = ust + 644;
  const sahneAlt = kompakt ? Math.max(ust + 1000, H - 100) : Math.max(ust + 1095, H * 0.64);
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

// Sahne arka planı (bir kez çizilir): derin mor ışık, bulanık ışık topları, parlak zemin ve kenar gölgesi
function arkaCiz() {
  const c = actx;
  c.setTransform(olcek, 0, 0, olcek, ox * olcek, 0);
  const merkezY = (D.sahneUst + D.hz) / 2;
  const bg = c.createRadialGradient(540, merkezY, 60, 540, merkezY, Math.max(W, H) * 0.75);
  bg.addColorStop(0, '#6E48F2'); bg.addColorStop(0.45, '#4A22D4'); bg.addColorStop(1, '#1E0B6E');
  c.fillStyle = bg; c.fillRect(-ox - 2, -2, W + 4, H + 4);
  // bulanık ışık topları
  for (let i = 0; i < 26; i++) {
    const bx = -ox + ((i * 263) % (W + 40)), byy = 40 + ((i * 157) % Math.max(200, D.hz - 60)), r = 18 + (i % 5) * 14;
    const g = c.createRadialGradient(bx, byy, 0, bx, byy, r);
    const renk = ['255,210,63', '63,224,234', '255,111,174', '255,255,255'][i % 4];
    g.addColorStop(0, `rgba(${renk},0.22)`); g.addColorStop(1, `rgba(${renk},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(bx, byy, r, 0, Math.PI * 2); c.fill();
  }
  // sahnenin arkasındaki parlak halka
  const hg = c.createRadialGradient(540, merkezY + 60, 300, 540, merkezY + 60, 480);
  hg.addColorStop(0, 'rgba(140,110,255,0.55)'); hg.addColorStop(0.85, 'rgba(140,110,255,0.25)'); hg.addColorStop(1, 'rgba(140,110,255,0)');
  c.fillStyle = hg; c.beginPath(); c.arc(540, merkezY + 60, 480, 0, Math.PI * 2); c.fill();
  zemin(c, D.hz, -ox, 1080 + ox, H);
  // zemin: arkaya doğru koyulaşır, önde parlama
  const zg = c.createLinearGradient(0, D.hz, 0, H);
  zg.addColorStop(0, 'rgba(20,8,60,0.55)'); zg.addColorStop(0.35, 'rgba(20,8,60,0.12)'); zg.addColorStop(1, 'rgba(20,8,60,0.35)');
  c.fillStyle = zg; c.fillRect(-ox - 2, D.hz, W + 4, H - D.hz + 2);
  const parla = c.createRadialGradient(540, D.on, 20, 540, D.on, 520);
  parla.addColorStop(0, 'rgba(255,255,255,0.22)'); parla.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = parla; c.fillRect(-ox - 2, D.hz, W + 4, H - D.hz + 2);
  const ufuk = c.createLinearGradient(0, D.hz - 6, 0, D.hz + 6);
  ufuk.addColorStop(0, 'rgba(255,255,255,0)'); ufuk.addColorStop(0.5, 'rgba(255,255,255,0.95)'); ufuk.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = ufuk; c.fillRect(-ox - 2, D.hz - 6, W + 4, 12);
  // kenar gölgesi
  const vg = c.createRadialGradient(540, H * 0.45, Math.min(W, H) * 0.45, 540, H * 0.45, Math.max(W, H) * 0.85);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(8,2,30,0.55)');
  c.fillStyle = vg; c.fillRect(-ox - 2, -2, W + 4, H + 4);
}
// Sahne ışıkları: yukarıdan yavaşça gezinen renkli huzmeler
function isiklar(c, t) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const renkler = ['255,210,63', '63,224,234', '255,111,174'];
  for (let i = 0; i < 3; i++) {
    const kaynak = 180 + i * 360, hedef = 540 + Math.sin(t * 0.35 + i * 2.1) * 420;
    const alt = D.sahneAlt + 40;
    const g = c.createLinearGradient(kaynak, D.ust, hedef, alt);
    g.addColorStop(0, `rgba(${renkler[i]},0.16)`); g.addColorStop(1, `rgba(${renkler[i]},0)`);
    c.fillStyle = g; c.beginPath();
    c.moveTo(kaynak - 18, D.ust - 40); c.lineTo(kaynak + 18, D.ust - 40); c.lineTo(hedef + 170, alt); c.lineTo(hedef - 170, alt); c.closePath(); c.fill();
  }
  c.restore();
}
// Cam görünümlü panel: üstten aydınlanan koyu mor zemin ve ince parlak kenar
function cam(c, x, y, w, h, r, alfa = 0.62) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(70,44,160,${alfa})`); g.addColorStop(1, `rgba(22,10,58,${Math.min(0.95, alfa + 0.15)})`);
  yol(c, x, y, w, h, r); c.fillStyle = g; c.fill();
  c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.16)'; yol(c, x + 1, y + 1, w - 2, h - 2, r); c.stroke();
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

// ------------------------------------------------------------------ insan karakterler
// Ölçüler karakterin kendi biriminde: ayak tabanı y=0, baş tepesi yaklaşık y=-430.
const OMUZ = [54, -296];
const KOL = {
  yukari: [OMUZ, [104, -336], [92, -432]],
  salla: [OMUZ, [124, -320], [146, -410]],
  salla2: [OMUZ, [136, -344], [114, -438]],
  bel: [OMUZ, [112, -236], [66, -190]],
  asagi: [OMUZ, [80, -226], [76, -150]],
  havada: [OMUZ, [100, -350], [126, -446]],
};
const TENLER = ['#F7D7BC', '#EFC09B', '#DDA47E', '#C08460', '#946347'];
const SACLAR = ['#2A1A12', '#4B2C1B', '#6E4426', '#151515', '#8F5B2C', '#C9A15A'];
const YAZMALAR = ['#E8475F', '#3FA9F5', '#7B4FE0', '#2FB27A', '#F28C28'];
function renkKaristir(hex, hedef, k) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(hedef.slice(1), 16);
  const ch = (v, sh) => (v >> sh) & 255;
  const m = (sh) => Math.round(ch(a, sh) + (ch(b, sh) - ch(a, sh)) * k);
  return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
}
const acikRenk = (hex, k) => renkKaristir(hex, '#FFFFFF', k);
const koyuRenk = (hex, k) => renkKaristir(hex, '#000000', k);
// Her izleyicinin kendine özgü, her yayında aynı kalan görünümü
const gorunumler = new Map();
function gorunum(anahtar) {
  let g = gorunumler.get(anahtar);
  if (g) return g;
  const h = karma(String(anahtar) + '·insan');
  const kadin = (h >>> 3) % 2 === 0;
  const stil = kadin ? ['uzun', 'topuz', 'yazma', 'uzun'][(h >>> 5) % 4] : ['kisa', 'yan', 'kivircik', 'kel', 'kasket', 'kisa'][(h >>> 5) % 6];
  g = {
    kadin, stil,
    ten: TENLER[(h >>> 9) % TENLER.length],
    sac: stil === 'kel' ? '#B9B4AE' : SACLAR[(h >>> 12) % SACLAR.length],
    biyik: !kadin && (stil === 'kel' || (h >>> 15) % 3 === 0),
    yazma: YAZMALAR[(h >>> 17) % YAZMALAR.length],
    kas: (h >>> 20) % 3,
  };
  if (gorunumler.size > 4000) gorunumler.clear();
  gorunumler.set(anahtar, g);
  return g;
}
function sacArka(c, X, Y, s, g) {
  if (g.stil === 'uzun') {
    c.fillStyle = g.sac; c.beginPath();
    c.moveTo(X(-50), Y(-380)); c.quadraticCurveTo(X(-60), Y(-300), X(-46), Y(-262));
    c.lineTo(X(46), Y(-262)); c.quadraticCurveTo(X(60), Y(-300), X(50), Y(-380)); c.closePath(); c.fill();
  } else if (g.stil === 'yazma') {
    c.fillStyle = g.yazma; c.beginPath();
    c.moveTo(X(-56), Y(-372)); c.quadraticCurveTo(X(-62), Y(-300), X(-30), Y(-286));
    c.lineTo(X(30), Y(-286)); c.quadraticCurveTo(X(62), Y(-300), X(56), Y(-372)); c.closePath(); c.fill();
  }
}
function sacOn(c, X, Y, s, g) {
  const sac = g.sac;
  if (g.stil === 'yazma') {
    c.fillStyle = g.yazma; c.beginPath();
    c.ellipse(X(0), Y(-380), 54 * s, 58 * s, 0, Math.PI, Math.PI * 2); c.lineTo(X(54), Y(-372));
    c.quadraticCurveTo(X(0), Y(-404), X(-54), Y(-372)); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = -3; i <= 3; i++) daire(c, X(i * 14), Y(-394 + Math.abs(i) * 3), 3.2 * s, 'rgba(255,255,255,0.85)');
    return;
  }
  if (g.stil === 'kel') {
    c.fillStyle = sac;
    for (const e of [-1, 1]) { c.beginPath(); c.ellipse(X(e * 42), Y(-376), 9 * s, 20 * s, 0, 0, Math.PI * 2); c.fill(); }
    return;
  }
  c.fillStyle = sac; c.beginPath();
  c.ellipse(X(0), Y(-382), 48 * s, 50 * s, 0, Math.PI, Math.PI * 2);
  if (g.stil === 'yan') { c.lineTo(X(48), Y(-370)); c.quadraticCurveTo(X(10), Y(-402), X(-30), Y(-384)); c.lineTo(X(-48), Y(-360)); }
  else if (g.stil === 'uzun' || g.stil === 'topuz') { c.lineTo(X(48), Y(-360)); c.quadraticCurveTo(X(30), Y(-398), X(0), Y(-396)); c.quadraticCurveTo(X(-30), Y(-398), X(-48), Y(-360)); }
  else { c.lineTo(X(48), Y(-374)); c.quadraticCurveTo(X(24), Y(-394), X(0), Y(-390)); c.quadraticCurveTo(X(-24), Y(-394), X(-48), Y(-374)); }
  c.closePath(); c.fill();
  if (g.stil === 'kivircik') for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; daire(c, X(Math.cos(a) * 46), Y(-378 + Math.sin(a) * 50), 13 * s, sac); }
  if (g.stil === 'topuz') daire(c, X(0), Y(-436), 22 * s, sac);
  if (g.stil === 'kasket') {
    c.fillStyle = '#4A4A52'; c.beginPath(); c.ellipse(X(0), Y(-392), 52 * s, 34 * s, 0, Math.PI, Math.PI * 2); c.closePath(); c.fill();
    kutu(c, X(-10), Y(-394), 70 * s, 14 * s, 7 * s, '#3A3A42');
  }
  c.save(); c.globalAlpha = 0.25; c.fillStyle = BEYAZ;
  c.beginPath(); c.ellipse(X(-16), Y(-414), 16 * s, 6 * s, -0.3, 0, Math.PI * 2); c.fill(); c.restore();
}
// Baş: yüz, saç, aksesuarlar. (x, gy) karakterin ayak noktası
function bas(c, x, gy, s, g, o = {}) {
  const X = (v) => x + s * v, Y = (v) => gy + s * v;
  sacArka(c, X, Y, s, g);
  // kulaklar
  for (const e of [-1, 1]) { c.fillStyle = koyuRenk(g.ten, 0.06); c.beginPath(); c.ellipse(X(e * 44), Y(-368), 9 * s, 13 * s, 0, 0, Math.PI * 2); c.fill(); }
  // yüz
  const yg = c.createRadialGradient(X(-14), Y(-392), 6 * s, X(0), Y(-370), 60 * s);
  yg.addColorStop(0, acikRenk(g.ten, 0.18)); yg.addColorStop(1, koyuRenk(g.ten, 0.08));
  c.fillStyle = yg; c.beginPath(); c.ellipse(X(0), Y(-370), 44 * s, 52 * s, 0, 0, Math.PI * 2); c.fill();
  c.lineWidth = 2.5 * s; c.strokeStyle = 'rgba(40,20,30,0.25)'; c.stroke();
  sacOn(c, X, Y, s, g);
  // yanaklar
  c.save(); c.globalAlpha = 0.28; for (const e of [-1, 1]) daire(c, X(e * 25), Y(-350), 9 * s, '#FF6F8E'); c.restore();
  // kaşlar
  c.lineCap = 'round'; c.strokeStyle = koyuRenk(g.stil === 'kel' ? '#6B6B6B' : g.sac, 0.1); c.lineWidth = 4.5 * s;
  for (const e of [-1, 1]) { c.beginPath(); c.moveTo(X(e * 8), Y(-388)); c.quadraticCurveTo(X(e * 18), Y(-395), X(e * 28), Y(-389)); c.stroke(); }
  // gözler
  if (o.gozluk) {
    c.fillStyle = '#0A0612';
    for (const e of [-1, 1]) { yol(c, X(e * 18) - 16 * s, Y(-382), 32 * s, 22 * s, 9 * s); c.fill(); }
    c.lineWidth = 3.5 * s; c.strokeStyle = SARI;
    for (const e of [-1, 1]) { yol(c, X(e * 18) - 16 * s, Y(-382), 32 * s, 22 * s, 9 * s); c.stroke(); }
    cizgi(c, [[X(-2), Y(-376)], [X(2), Y(-376)]], 3 * s, SARI);
    c.save(); c.globalAlpha = 0.7; for (const e of [-1, 1]) cizgi(c, [[X(e * 18 - 8), Y(-378)], [X(e * 18 - 2), Y(-372)]], 3 * s, BEYAZ); c.restore();
  } else {
    for (const e of [-1, 1]) {
      c.fillStyle = BEYAZ; c.beginPath(); c.ellipse(X(e * 17), Y(-374), 8.5 * s, o.goz === 'acik' ? 10 * s : 8.5 * s, 0, 0, Math.PI * 2); c.fill();
      daire(c, X(e * 17 + 1), Y(-373), 5.6 * s, '#3A2414');
      daire(c, X(e * 17 + 3), Y(-376), 1.9 * s, BEYAZ);
    }
  }
  // burun
  c.strokeStyle = koyuRenk(g.ten, 0.22); c.lineWidth = 3 * s;
  c.beginPath(); c.moveTo(X(1), Y(-366)); c.quadraticCurveTo(X(6), Y(-355), X(0), Y(-353)); c.stroke();
  // bıyık
  if (g.biyik) {
    c.fillStyle = g.stil === 'kel' ? '#9A958F' : koyuRenk(g.sac, 0.05); c.beginPath();
    c.moveTo(X(0), Y(-347)); c.quadraticCurveTo(X(-14), Y(-352), X(-24), Y(-340)); c.quadraticCurveTo(X(-12), Y(-343), X(0), Y(-340));
    c.quadraticCurveTo(X(12), Y(-343), X(24), Y(-340)); c.quadraticCurveTo(X(14), Y(-352), X(0), Y(-347)); c.fill();
  }
  // ağız
  if (o.goz === 'acik') { c.fillStyle = '#7A2335'; c.beginPath(); c.ellipse(X(0), Y(-334), 8 * s, 9 * s, 0, 0, Math.PI * 2); c.fill(); }
  else {
    c.fillStyle = '#8E2B3B'; c.beginPath(); c.moveTo(X(-13), Y(-338)); c.quadraticCurveTo(X(0), Y(-322), X(13), Y(-338)); c.closePath(); c.fill();
    c.fillStyle = BEYAZ; c.beginPath(); c.moveTo(X(-10), Y(-337)); c.quadraticCurveTo(X(0), Y(-332), X(10), Y(-337)); c.closePath(); c.fill();
  }
  if (o.fes) {
    c.fillStyle = '#C8102E'; c.beginPath();
    c.moveTo(X(-40), Y(-404)); c.lineTo(X(-32), Y(-466)); c.lineTo(X(32), Y(-466)); c.lineTo(X(40), Y(-404)); c.closePath(); c.fill();
    c.fillStyle = '#93101F'; c.beginPath(); c.ellipse(X(0), Y(-466), 32 * s, 7 * s, 0, 0, Math.PI * 2); c.fill();
    c.save(); c.globalAlpha = 0.25; c.fillStyle = BEYAZ; c.fillRect(X(-26), Y(-460), 9 * s, 52 * s); c.restore();
    const sal = Math.sin(zaman() * 6) * 6;
    c.beginPath(); c.moveTo(X(0), Y(-466)); c.quadraticCurveTo(X(32 + sal), Y(-470), X(38 + sal), Y(-430));
    c.lineWidth = 4 * s; c.strokeStyle = '#1B1040'; c.stroke();
    daire(c, X(38 + sal), Y(-424), 8 * s, '#1B1040');
  }
}
function kol(c, x, gy, s, r, taraf, spec, ten = '#EFC09B') {
  const pts = (typeof spec === 'string' ? KOL[spec] : spec).map(([px, py]) => [x + s * px * taraf, gy + s * py]);
  cizgi(c, pts, 30 * s, koyuRenk(r.koyu, 0.25));
  cizgi(c, pts, 24 * s, r.koyu);
  const son = pts[pts.length - 1];
  daire(c, son[0], son[1], 15 * s, ten);
  return son;
}
function bacak(c, X, Y, s, noktalar, renk, kalin) {
  const pts = noktalar.map(([a, b]) => [X(a), Y(b)]);
  cizgi(c, pts, (kalin + 6) * s, koyuRenk(renk, 0.35));
  cizgi(c, pts, kalin * s, renk);
  const son = pts[pts.length - 1];
  c.fillStyle = '#20151C'; c.beginPath(); c.ellipse(son[0] + 6 * s, son[1] + 4 * s, 22 * s, 11 * s, 0, 0, Math.PI * 2); c.fill();
}
// İnsan karakter. r: gömlek rengi {ana, koyu}; o.g: görünüm (yoksa o.anahtar ya da renkten üretilir)
function insan(c, x, gy, s, r, o = {}) {
  const g = o.g || gorunum(o.anahtar ?? r.ana);
  const j = o.zipla || 0;
  const by = gy - j;
  const X = (v) => x + s * v, Y = (v) => by + s * v;
  if (o.golge !== false) {
    c.save(); c.globalAlpha = 0.35 * (1 - Math.min(j / 220, 0.6));
    c.beginPath(); c.ellipse(x, gy + 4 * s, 80 * s, 14 * s, 0, 0, Math.PI * 2); c.fillStyle = '#120A2E'; c.fill(); c.restore();
  }
  if (o.parla) {
    c.save(); c.globalAlpha = 0.3 + 0.2 * Math.sin(zaman() * 10);
    const pg = c.createRadialGradient(x, by - 240 * s, 10 * s, x, by - 240 * s, 220 * s);
    pg.addColorStop(0, 'rgba(255,255,255,0.9)'); pg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = pg; c.fillRect(x - 220 * s, by - 460 * s, 440 * s, 440 * s); c.restore();
  }
  if (o.kolSol) kol(c, x, by, s, r, -1, o.kolSol, g.ten);
  if (o.kolSag) kol(c, x, by, s, r, 1, o.kolSag, g.ten);
  // bacaklar
  const pantolon = o.pantolon || (g.kadin ? '#3B2A55' : '#2B2440');
  const kalin = g.kadin ? 24 : 34;
  if (o.bacaksiz) { /* kayıkta otururken bacaklar görünmez */ }
  else if (o.dur) {
    bacak(c, X, Y, s, [[-22, -170], [-24, -90], [-26, -14]], pantolon, kalin);
    bacak(c, X, Y, s, [[22, -170], [24, -90], [26, -14]], pantolon, kalin);
  } else {
    const sgn = (o.adim || 0) % 2 ? 1 : -1;
    const kalk = Math.sin((o.faz || 0) * Math.PI);
    bacak(c, X, Y, s, [[-22 * sgn, -170], [-24 * sgn, -90], [-26 * sgn, -14]], pantolon, kalin);
    bacak(c, X, Y, s, [[22 * sgn, -170], [ara(24, 60, kalk) * sgn, ara(-90, -110, kalk)], [ara(26, 44, kalk) * sgn, ara(-14, -50, kalk)]], pantolon, kalin);
  }
  // etek (entari)
  if (g.kadin && !o.forma && !o.bacaksiz) {
    const eg = c.createLinearGradient(X(-70), 0, X(70), 0);
    eg.addColorStop(0, koyuRenk(r.koyu, 0.1)); eg.addColorStop(0.5, r.koyu); eg.addColorStop(1, koyuRenk(r.koyu, 0.25));
    c.fillStyle = eg; c.beginPath();
    c.moveTo(X(-44), Y(-180)); c.quadraticCurveTo(X(-70), Y(-110), X(-74), Y(-62)); c.quadraticCurveTo(X(0), Y(-48), X(74), Y(-62));
    c.quadraticCurveTo(X(70), Y(-110), X(44), Y(-180)); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,220,120,0.8)'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(X(-72), Y(-66)); c.quadraticCurveTo(X(0), Y(-52), X(72), Y(-66)); c.stroke();
  }
  // boyun ve gövde
  c.fillStyle = koyuRenk(g.ten, 0.08); c.fillRect(X(-13), Y(-334), 26 * s, 44 * s);
  const ciplak = o.ciplak;
  const gg = c.createLinearGradient(X(-60), 0, X(60), 0);
  const govdeRenk = ciplak ? g.ten : r.ana;
  gg.addColorStop(0, acikRenk(govdeRenk, 0.2)); gg.addColorStop(0.55, govdeRenk); gg.addColorStop(1, koyuRenk(govdeRenk, 0.18));
  c.fillStyle = gg; c.beginPath();
  c.moveTo(X(-40), Y(-306)); c.quadraticCurveTo(X(-62), Y(-302), X(-60), Y(-280));
  c.lineTo(X(-46), Y(-176)); c.lineTo(X(46), Y(-176)); c.lineTo(X(60), Y(-280));
  c.quadraticCurveTo(X(62), Y(-302), X(40), Y(-306)); c.quadraticCurveTo(X(0), Y(-292), X(-40), Y(-306)); c.closePath(); c.fill();
  c.lineWidth = 2.5 * s; c.strokeStyle = 'rgba(20,10,40,0.3)'; c.stroke();
  if (!ciplak) {
    // yaka
    c.fillStyle = koyuRenk(r.ana, 0.15); c.beginPath(); c.moveTo(X(-14), Y(-302)); c.lineTo(X(0), Y(-280)); c.lineTo(X(14), Y(-302)); c.closePath(); c.fill();
    if (o.yelek !== false && !o.forma) {
      const yelek = o.yelekRenk || '#2A1745';
      for (const e of [-1, 1]) {
        c.fillStyle = yelek; c.beginPath();
        c.moveTo(X(e * 58), Y(-290)); c.lineTo(X(e * 20), Y(-302)); c.lineTo(X(e * 26), Y(-178)); c.lineTo(X(e * 46), Y(-178)); c.closePath(); c.fill();
        cizgi(c, [[X(e * 20), Y(-300)], [X(e * 26), Y(-180)]], 4 * s, '#E9B44C');
        for (let i = 0; i < 3; i++) daire(c, X(e * 38), Y(-270 + i * 30), 3.5 * s, '#E9B44C');
      }
    }
    if (o.numara) {
      daire(c, X(0), Y(-236), 22 * s, BEYAZ);
      yazi(c, String(o.numara), X(0), Y(-236) + 10 * s, 28 * s, INK);
    }
  } else {
    c.strokeStyle = koyuRenk(g.ten, 0.2); c.lineWidth = 3 * s;
    c.beginPath(); c.moveTo(X(-26), Y(-262)); c.quadraticCurveTo(X(-12), Y(-252), X(-2), Y(-262)); c.moveTo(X(26), Y(-262)); c.quadraticCurveTo(X(12), Y(-252), X(2), Y(-262)); c.stroke();
  }
  // kuşak
  if (!o.forma) {
    kutu(c, X(-48), Y(-192), 96 * s, 22 * s, 6 * s, o.kusak || '#D7263D');
    c.fillStyle = 'rgba(255,215,90,0.9)'; for (let i = -2; i <= 2; i++) c.fillRect(X(i * 18 - 3), Y(-190), 6 * s, 18 * s);
  }
  if (o.isik && o.isik !== BEYAZ) { daire(c, X(-26), Y(-262), 10 * s, o.isik); daire(c, X(-26), Y(-262), 5 * s, '#FFF6C2'); }
  bas(c, x, by, s, g, o);
  if (o.altin) {
    const t = zaman();
    parilti(c, X(70), Y(-320 + 20 * Math.sin(t * 3)), (14 + 6 * Math.sin(t * 7)) * s, BEYAZ);
    parilti(c, X(-80), Y(-200 + 20 * Math.cos(t * 2.5)), (10 + 5 * Math.cos(t * 6)) * s, BEYAZ);
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
  c.beginPath(); c.ellipse(x, gy - 370 * s, 46 * s, 54 * s, 0, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(x - 58 * s, gy - 296 * s); c.lineTo(x - 46 * s, gy - 176 * s); c.lineTo(x + 46 * s, gy - 176 * s); c.lineTo(x + 58 * s, gy - 296 * s); c.closePath(); c.stroke();
  c.beginPath(); c.moveTo(x - 24 * s, gy - 170 * s); c.lineTo(x - 26 * s, gy - 14 * s);
  c.moveTo(x + 24 * s, gy - 170 * s); c.lineTo(x + 26 * s, gy - 14 * s); c.stroke();
  c.setLineDash([]);
  cizgi(c, [[x - 24 * s, gy - 236 * s], [x + 24 * s, gy - 236 * s]], 13 * s, SARI);
  cizgi(c, [[x, gy - 260 * s], [x, gy - 212 * s]], 13 * s, SARI);
  c.restore();
}
function isimEtiketi(c, k, x, y, boy, o = {}) {
  const basMi = !!o.bas;
  const metin = kisalt(k.ad, o.uzun || (basMi ? 12 : 10));
  const yildizVar = !!k.takip;
  const sv = seviyeOku(k);
  const h = boy * 1.4;
  const w = genislik(c, metin, boy) + boy * 1.9 + (yildizVar ? boy * 0.9 : 0) + (sv > 1 ? boy * 1.25 : 0);
  const sol = x - w / 2;
  kutu(c, sol, y - h / 2, w, h, h / 2, basMi ? SARI : k.altin ? '#7A4E00' : 'rgba(27,16,64,0.86)');
  if (k.altin && !basMi) { c.lineWidth = 3; c.strokeStyle = ALTIN.ana; yol(c, sol + 1.5, y - h / 2 + 1.5, w - 3, h - 3, h / 2); c.stroke(); }
  avatar(c, k, sol + h / 2, y, h / 2 - 4);
  let tx = sol + h + 4;
  if (yildizVar) { yildiz(c, tx + boy * 0.38, y, boy * 0.42, basMi ? INK : SARI); tx += boy * 0.9; }
  const tw = yazi(c, metin, tx, y + boy * 0.34, boy, basMi ? INK : BEYAZ, { hiza: 'left' });
  if (sv > 1) {
    const rx = tx + tw + boy * 0.66;
    daire(c, rx, y, boy * 0.52, basMi ? INK : ALTIN.ana);
    yazi(c, String(sv), rx, y + boy * 0.25, boy * 0.68, basMi ? SARI : INK);
  }
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
  bas(c, X(-34), Y(-96) + 320 * hs * 1.15, hs * 1.15, gorunum('surucu' + no), { goz: o.dur ? 'acik' : 'mutlu' });
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
  yeniKatilan: [], sonKatilimAnonsu: 0, begeniSayi: 0, begeniIdx: 0, davetKrali: null, altinTur: false, oyunSayaci: 0,
  sonSeviyeAnons: 0, sonSeriAnons: 0, cagriIdx: 0, sonDavetCagri: 0, sonDestekciAnons: 0, sonCagriAfis: 0, turNo: 0, topluHediye: [], topluTakip: [], sonTopluAnons: 0, sonYorumOkuma: 0, sonMenuHatirlatma: 0, hatirlatmaIdx: 0,
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
  if (r.halayTur !== S.turNo) { r.halayTur = S.turNo; xpEkle(r, 3); }
  if (!r.halayda) {
    r.halayda = true; r.katilma = t;
    if (!sessiz && t - S.sonKatilToast > 0.7) { S.sonKatilToast = t; tost(`${r.ad} halaya katıldı`, r, 'katil'); }
    if (!sessiz) S.yeniKatilan.push(r);
    Ses.pop();
  }
  r.son = t;
}
function ziplat(r) { r.zipla = zaman(); }

// ------------------------------------------------------------------ seviye, günlük seri ve günün en iyileri (bu cihazda kalıcı)
const OYUNCU_KAYIT = 'herkesPiste.oyuncular';
let oyuncular = {};
try { oyuncular = JSON.parse(localStorage.getItem(OYUNCU_KAYIT) || '{}') || {}; } catch { oyuncular = {}; }
function gunYazi(fark = 0) { const d = new Date(Date.now() + fark * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const seviyeHesapla = (xp) => 1 + Math.floor(Math.sqrt((xp || 0) / 20));
function oyuncu(r) {
  let o = oyuncular[r.id];
  if (!o) o = oyuncular[r.id] = { ad: r.ad, xp: 0, seri: 0, sonGun: null, gun: null, gunXp: 0 };
  o.ad = r.ad;
  return o;
}
const seviyeOku = (k) => seviyeHesapla((oyuncular[k.id] || {}).xp);
function xpEkle(r, n) {
  if (!r || !n) return;
  const o = oyuncu(r), g = gunYazi();
  if (o.gun !== g) { o.gun = g; o.gunXp = 0; }
  const kat = S.altinTur ? 2 : 1;
  const once = seviyeHesapla(o.xp);
  o.xp += n * kat; o.gunXp += n * kat;
  const sonra = seviyeHesapla(o.xp);
  if (sonra > once && sonra >= 2) {
    tost(`${r.ad} ${sonra}. seviyeye çıktı!`, r, 'takip');
    kivilcim(540, D.sahneUst + 120, 30, [ALTIN.ana, BEYAZ]);
    if (sonra >= 3 && zaman() - S.sonSeviyeAnons > 8) { S.sonSeviyeAnons = zaman(); Spiker.ekle(`${okunurAd(r.ad)} ${sonra}. seviyeye çıktı! Tebrikler!`, 2, 'seviye'); }
  }
}
// Günün ilk gelişinde seriyi güncelle, eski izleyiciyi adıyla karşıla
function gunlukKontrol(r) {
  const g = gunYazi();
  if (r.gunKontrol === g) return;
  r.gunKontrol = g;
  const o = oyuncu(r);
  if (o.sonGun === g) return;
  const eski = !!o.sonGun;
  o.seri = o.sonGun === gunYazi(-1) ? (o.seri || 0) + 1 : 1;
  o.sonGun = g;
  if (!eski) return;
  r.donusSelami = zaman();
  const ad = okunurAd(r.ad), sv = seviyeHesapla(o.xp);
  if (o.seri >= 2) tost(`${r.ad} ${o.seri}. gün üst üste burada!`, r, 'takip');
  if (zaman() - S.sonSeriAnons > 10) {
    S.sonSeriAnons = zaman();
    Spiker.ekle(o.seri >= 2 ? `Tekrar hoş geldin ${ad}! ${o.seri} gündür üst üste buradasın, harikasın!` : `Tekrar hoş geldin ${ad}! Seviyen ${sv}, kaldığın yerden devam!`, 2, 'seri');
  }
}
let enIyiOnbellek = { t: -9, liste: [] };
function gununEnIyileri(n = 5) {
  // her karede sıralamamak için 2 saniyede bir hesaplanır
  if (zaman() - enIyiOnbellek.t < 2) return enIyiOnbellek.liste.slice(0, n);
  enIyiOnbellek = { t: zaman(), liste: gununEnIyileriHesapla() };
  return enIyiOnbellek.liste.slice(0, n);
}
function gununEnIyileriHesapla(n = 5) {
  const g = gunYazi();
  return Object.entries(oyuncular).filter(([, o]) => o.gun === g && o.gunXp > 0).sort((a, b) => b[1].gunXp - a[1].gunXp).slice(0, n)
    .map(([id, o]) => ({ id, ad: o.ad, xp: Math.round(o.gunXp), sv: seviyeHesapla(o.xp), k: S.kisiler.get(id) }));
}
function oyunculariKaydet() {
  try {
    const ids = Object.keys(oyuncular);
    if (ids.length > 6000) {
      const g = gunYazi();
      ids.sort((a, b) => (oyuncular[a].sonGun === g) - (oyuncular[b].sonGun === g) || oyuncular[a].xp - oyuncular[b].xp);
      for (const id of ids.slice(0, ids.length - 5000)) delete oyuncular[id];
    }
    localStorage.setItem(OYUNCU_KAYIT, JSON.stringify(oyuncular));
  } catch {}
}
setInterval(oyunculariKaydet, 10000);

// Beğeni hedefi: herkesin beğenileriyle dolan çubuk
const BEGENI_HEDEF = [300, 1000, 2500, 5000, 10000, 20000, 40000, 80000, 150000];
function begeniSay(n) {
  S.begeniSayi += n;
  const hedef = BEGENI_HEDEF[Math.min(S.begeniIdx, BEGENI_HEDEF.length - 1)];
  if (S.begeniSayi >= hedef) {
    S.begeniSayi -= hedef; S.begeniIdx++;
    duyuru('BEĞENİ HEDEFİ!', `${hedef.toLocaleString('tr')} beğeni tamam, teşekkürler!`, PEMBE, 3, 5);
    konfeti(200); kalpler(8, 540, D.sahneAlt - 40); Ses.buyuk();
    for (const x of S.kisiler.values()) if (x.halayda) x.zipla = zaman() + Math.random() * 0.3;
    const yeni = BEGENI_HEDEF[Math.min(S.begeniIdx, BEGENI_HEDEF.length - 1)];
    Spiker.ekle(`Beğeni hedefi tamam! Hepinize teşekkürler! Yeni hedef ${yeni.toLocaleString('tr')} beğeni!`, 4, 'begeni-hedef');
  }
}
// Paylaşımlar: en çok davet eden "davet kralı" olur
function paylasimSay(r) {
  r.paylasim = (r.paylasim || 0) + 1;
  if (!S.davetKrali || r.paylasim > (S.davetKrali.paylasim || 0)) {
    const yeni = S.davetKrali !== r;
    S.davetKrali = r;
    if (yeni && r.paylasim >= 2) { duyuru('DAVET KRALI!', r.ad, CAMGOBEGI, 2.2, 2); Spiker.ekle(`Yeni davet kralı ${okunurAd(r.ad)}! Paylaştığın için teşekkürler!`, 3, 'davet'); }
  }
}

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
  const kisi = S.afisKisi && zaman() - S.afisKisi.t < 0.05 ? S.afisKisi.r : null;
  afis = { baslik, alt, renk, t0: zaman(), sure, oncelik, kisi };
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

function olay(e) {
  const r = kisi(e.k);
  if (!r && e.t !== 'izleyici') return;
  const t = zaman();
  const tip = turTipi();
  if (r) gunlukKontrol(r);
  switch (e.t) {
    case 'yorum': {
      const m = String(e.m || '').trim();
      if (t - (r.sonYorumXp || 0) > 10) { r.sonYorumXp = t; xpEkle(r, 1); }
      const w = kelimeler(m);
      let komut = w.some((x) => GIR.has(x) || HOP.has(x) || SELAM.has(x) || /^[1-3]$/.test(x));
      if (tip === 'halay') {
        if (w.some((x) => GIR.has(x) || HOP.has(x))) { halayaKat(r); ziplat(r); }
        else if (w.some((x) => SELAM.has(x))) {
          halayaKat(r); r.selam = t;
          Spiker.ekle(`Selam ${okunurAd(r.ad)}, hoş geldin!`, 1, 'selam', 6);
        }
        else if (r.halayda) { r.son = t; S.cosku += 1.2; }
        if (r.halayda && temizMi(m)) r.balon = { metin: m, t0: t };
      } else if (tip === 'takim') {
        const no = takimNo(w);
        if (no) takimSec(r, no);
        else takimKatki(r, 3, 3);
        if (w.some((x) => GIR.has(x) || HOP.has(x))) halayaKat(r, true);
      } else {
        // bilgi oyunlarında ve memleket yarışında yorumlar cevaptır, sesli okunmaz
        komut = true;
        if (tip === 'soru') soruYorum(r, m, w);
        else memYorum(r, w);
        if (w.some((x) => GIR.has(x))) halayaKat(r, true);
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
      begeniSay(e.n);
      xpEkle(r, Math.min(3, e.n * 0.2));
      if (tip === 'halay') {
        S.cosku += (e.n * 0.8) / (1 + 0.25 * (S.seviye - 1));
        if (r.halayda) { r.son = t; if (Math.random() < 0.35) ziplat(r); }
      } else if (tip === 'takim') takimKatki(r, e.n, e.n);
      else if (tip === 'memleket') memPuan(r, e.n * 0.5);
      break;
    }
    case 'hediye': hediye(r, e); break;
    case 'takip':
      if (!r.takip) {
        r.takip = true;
        tost(`${r.ad} takip etti, yıldızını aldı!`, r, 'takip');
        S.topluTakip.push(r);
        xpEkle(r, 20);
      }
      if (tip === 'halay') { S.cosku += 6; halayaKat(r, true); ziplat(r); }
      else if (tip === 'takim') takimKatki(r, 10, 10);
      else if (tip === 'memleket') memPuan(r, 5);
      break;
    case 'paylasim':
      tost(`${r.ad} yayını paylaştı, davet ettiği herkes gelsin!`, r, 'hediye');
      paylasimSay(r);
      xpEkle(r, 15);
      Spiker.ekle(`${okunurAd(r.ad)}, paylaştığın için teşekkürler!`, 1, 'paylasim', 10);
      if (tip === 'halay') S.cosku += 8;
      else if (tip === 'takim') takimKatki(r, 12, 12);
      else if (tip === 'memleket') memPuan(r, 5);
      break;
    case 'giris':
      if (t - S.sonGirisToast > 4 && !r.halayda) {
        S.sonGirisToast = t;
        const ad = okunurAd(r.ad);
        const [ekran, ses] = {
          halay: ['GİR yaz, halaya katıl', `Hoş geldin ${ad}! Gir yaz, halaya katıl.`],
          takim: ['takım numarasını yaz', `Hoş geldin ${ad}! Takım numaranı yaz.`],
          soru: ['cevabını yoruma yaz', `Hoş geldin ${ad}! Cevabını yoruma yaz, puan topla.`],
          memleket: ['plakanı yaz', `Hoş geldin ${ad}! Memleketin neresi? Plakanı yaz.`],
        }[tip];
        tost(`${r.ad} geldi · ${ekran}`, r, 'giris');
        if (t - (r.donusSelami || -99) > 3) Spiker.ekle(ses, 1, 'giris', 18);
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
  xpEkle(r, Math.max(2, elmas * 1.5));
  S.afisKisi = { r, t };
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

  const tip = turTipi();
  if (tip === 'halay') halayHediye(r, elmas, k, ad, hediyeAdi);
  else if (tip === 'takim') takimHediye(r, elmas, k, ad);
  else if (tip === 'soru') soruHediye(r, elmas, k, ad, hediyeAdi);
  else memHediye(r, elmas, k, ad, hediyeAdi);
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

// ------------------------------------------------------------------ oyun tanımları
// tip: takim (takımlar beğeni ve yorumla yarışır) · soru (ilk bilen puan alır) · memleket (şehirler yarışır)
// fizik: yaris (önce bitişe varan) · cek (halat) · it (güreş) · gol (futbol)
const OYUNLAR = {
  yaris: {
    tip: 'takim', fizik: 'yaris', takimlar: TAKIM3, baslik: 'ARABA YARIŞI', kisa: 'araba yarışı', begen: 'gaz', oyunAlt: 'Beğen, gaz ver!',
    acilis: 'Araba yarışı başlıyor! Bir sarı, iki mavi, üç pembe. Yoruma numaranı yaz, takımını seç.',
    basla: 'Başla! Beğenileri basın, gaz verin!', sonucYazi: 'En çok gaz verenler',
    cumleler: [null, null, '{ad} {takim} takıma nitro verdi!', '{ad} rakiplerin önüne muz kabuğu attı!', '{ad} {takim} takımı rokete bindirdi!', '{ad} şimşek çaktırdı, rakipler durdu!'],
    hatirlatma: ['Beğenileri basın, arabanız hızlansın!', 'Takımını seçmeyen yoruma numarasını yazsın.', 'Yorum yazan takımına güç veriyor!'],
    ciz: () => yarisCiz(),
  },
  halat: {
    tip: 'takim', fizik: 'cek', takimlar: TAKIM2, baslik: 'HALAT ÇEKME', kisa: 'halat çekme', begen: 'çek', oyunAlt: 'Beğen, halatı çek!',
    acilis: 'Halat çekme zamanı! Bir sarı, iki mavi. Yoruma numaranı yaz, takımını seç.',
    basla: 'Başla! Beğenileri basın, halatı çekin!', sonucYazi: 'En çok çekenler', berabere: 'Halat ortada kaldı',
    cumleler: [null, null, '{ad} {takim} takıma süper çekiş verdi!', '{ad} rakipleri kaydırdı!', '{ad} {takim} takıma dev yardımcı getirdi!', '{ad} yıldırım gibi çekti, rakipler sendeledi!'],
    hatirlatma: ['Beğenileri basın, halatı çekin!', 'Sarı mı kazanacak, mavi mi? Yoruma takımını yaz.', 'Yorum yazan takımına güç veriyor!'],
    ciz: () => halatCiz(),
  },
  balon: {
    tip: 'takim', fizik: 'yaris', takimlar: TAKIM3, baslik: 'BALON ŞİŞİRME', kisa: 'balon şişirme', begen: 'hava', oyunAlt: 'Beğen, balonu şişir!',
    acilis: 'Balon şişirme yarışı! Bir sarı, iki mavi, üç pembe. Takımını yaz, balonunu ilk patlatan kazanır!',
    basla: 'Başla! Beğenileri basın, balonları şişirin!', sonucYazi: 'En çok şişirenler',
    cumleler: [null, null, '{ad} {takim} takıma süper pompa verdi!', '{ad} rakiplerin pompasını tıkadı!', '{ad} {takim} takıma dev pompa getirdi!', '{ad} buz fırtınası estirdi, rakipler dondu!'],
    hatirlatma: ['Beğenileri basın, balonunuz şişsin!', 'Takımını seçmeyen yoruma numarasını yazsın.', 'Balonu ilk patlatan takım kazanıyor!'],
    ciz: () => balonCiz(),
  },
  kule: {
    tip: 'takim', fizik: 'yaris', takimlar: TAKIM3, baslik: 'KULE YARIŞI', kisa: 'kule yarışı', begen: 'tuğla', oyunAlt: 'Beğen, kat çık!',
    acilis: 'Kule yarışı! Bir sarı, iki mavi, üç pembe. Takımını yaz, kuleni ilk bitiren kazanır!',
    basla: 'Başla! Beğenileri basın, kat çıkın!', sonucYazi: 'En çok tuğla taşıyanlar',
    cumleler: [null, null, '{ad} {takim} takıma vinç getirdi!', '{ad} rüzgâr estirdi, rakip kuleler sallanıyor!', '{ad} {takim} takıma üç kat birden çıktı!', '{ad} şimşek çaktırdı, rakipler durdu!'],
    hatirlatma: ['Beğenileri basın, kuleniz yükselsin!', 'Takımını seçmeyen yoruma numarasını yazsın.', 'Kulesini ilk bitiren takım kazanıyor!'],
    ciz: () => kuleCiz(),
  },
  roket: {
    tip: 'takim', fizik: 'yaris', takimlar: TAKIM3, baslik: 'ROKET YARIŞI', kisa: 'roket yarışı', begen: 'yakıt', oyunAlt: 'Beğen, roketi uçur!',
    acilis: "Roket yarışı! Bir sarı, iki mavi, üç pembe. Takımını yaz, Ay'a ilk varan kazanır!",
    basla: 'Başla! Beğenileri basın, roketler yükselsin!', sonucYazi: 'En çok yakıt verenler',
    cumleler: [null, null, '{ad} {takim} rokete nitro verdi!', '{ad} rakiplere meteor yağdırdı!', '{ad} {takim} rokete süper itki verdi!', '{ad} kara delik açtı, rakipler durdu!'],
    hatirlatma: ['Beğenileri basın, roketiniz yükselsin!', 'Takımını seçmeyen yoruma numarasını yazsın.', "Ay'a ilk varan takım kazanıyor!"],
    ciz: () => roketCiz(),
  },
  gures: {
    tip: 'takim', fizik: 'it', takimlar: TAKIM2, baslik: 'YAĞLI GÜREŞ', kisa: 'yağlı güreş', begen: 'it', oyunAlt: 'Beğen, pehlivanını it!',
    acilis: 'Yağlı güreş başlıyor! Bir sarı, iki mavi. Takımını yaz, pehlivanına güç ver!',
    basla: 'Başla! Beğenileri basın, pehlivanınız itsin!', sonucYazi: 'En çok güç verenler', berabere: 'Güreş berabere bitti',
    cumleler: [null, null, '{ad} {takim} pehlivana güç verdi!', '{ad} rakibi yağda kaydırdı!', '{ad} {takim} takıma dev pehlivan getirdi!', '{ad} şampiyon gücü verdi, rakip kayıyor!'],
    hatirlatma: ['Beğenileri basın, pehlivanınız itsin!', 'Sarı mı kazanacak, mavi mi? Yoruma takımını yaz.', 'Rakibi minderden çıkaran kazanır!'],
    ciz: () => guresCiz(),
  },
  futbol: {
    tip: 'takim', fizik: 'gol', takimlar: TAKIM2, baslik: 'FUTBOL', kisa: 'futbol', begen: 'şut', oyunAlt: 'Beğen, topu kaleye sür!',
    acilis: 'Futbol maçı başlıyor! Bir sarı, iki mavi. Takımını yaz, en çok golü atan kazanır!',
    basla: 'Başla! Beğenileri basın, topu kaleye sürün!', sonucYazi: 'Maçın yıldızları', berabere: 'Maç berabere bitti',
    cumleler: [null, null, '{ad} {takim} takıma sert şut çektirdi!', '{ad} rakipleri kaydırdı!', '{ad} {takim} takıma yıldız oyuncu getirdi!', '{ad} süper atak başlattı!'],
    hatirlatma: ['Beğenileri basın, topu kaleye sürün!', 'Sarı mı, mavi mi? Yoruma takımını yaz.', 'En çok golü atan takım kazanıyor!'],
    ciz: () => futbolCiz(),
  },
  bilgi: {
    tip: 'soru', baslik: 'BİLGİ YARIŞMASI', kisa: 'bilgi yarışması', adet: 5, sure: 16, altBaslik: 'A, B ya da C yaz!',
    acilis: 'Bilgi yarışması başlıyor! Doğru şıkkın harfini yoruma yaz: A, B ya da C. İlk bilen üç puan alır, diğer bilenler bir puan!',
    satirlar: [[['A · B · C', 'yaz, cevap ver'], ['', 'tek hakkın var']], [['İLK BİLEN', '+3'], ['DOĞRU', '+1'], ['HEDİYE', 'ipucu, süre']]],
    hatirlatma: ['Doğru şıkkın harfini yoruma yaz!', 'İlk bilen üç puan alıyor!', 'Hediye atan herkese ipucu ya da ek süre açıyor.'],
    uret: bilgiSorusu, ciz: () => soruCiz(),
  },
  kelime: {
    tip: 'soru', baslik: 'KELİME AVI', kisa: 'kelime avı', adet: 4, sure: 24, ilkN: 3, altBaslik: 'Karışık harflerden kelimeyi bul!',
    acilis: 'Kelime avı başlıyor! Harfleri karışık kelimeyi bul, yoruma yaz. İlk bilen üç puan alır!',
    satirlar: [[['KELİMEYİ', 'bul, yoruma yaz']], [['1.', '+3'], ['2.', '+2'], ['3.', '+1'], ['HEDİYE', 'harf açar']]],
    hatirlatma: ['Karışık harflerden kelimeyi bul, yoruma yaz!', 'Süre azaldıkça harfler açılıyor.', 'İlk bilen üç puan alıyor!'],
    uret: kelimeSorusu, ciz: () => soruCiz(),
  },
  matematik: {
    tip: 'soru', baslik: 'HIZLI MATEMATİK', kisa: 'hızlı matematik', adet: 6, sure: 13, ilkN: 3, altBaslik: 'Sonucu ilk yazan kazanır!',
    acilis: 'Hızlı matematik! İşlemin sonucunu yoruma yaz. Herkesin tek hakkı var, dikkatli ol!',
    satirlar: [[['SONUCU', 'yaz'], ['', 'tek hakkın var']], [['1.', '+3'], ['2.', '+2'], ['3.', '+1'], ['HEDİYE', 'ipucu, süre']]],
    hatirlatma: ['İşlemin sonucunu yoruma yaz!', 'Herkesin tek hakkı var, acele etme!', 'İlk bilen üç puan alıyor!'],
    uret: matematikSorusu, ciz: () => soruCiz(),
  },
  atasozu: {
    tip: 'soru', baslik: 'ATASÖZÜ TAMAMLA', kisa: 'atasözü tamamla', adet: 5, sure: 22, ilkN: 3, altBaslik: 'Eksik kelimeyi yaz!',
    acilis: 'Atasözü tamamla! Eksik kelimeyi yoruma yaz. İlk bilen üç puan alır!',
    satirlar: [[['EKSİK KELİMEYİ', 'yoruma yaz']], [['1.', '+3'], ['2.', '+2'], ['3.', '+1'], ['HEDİYE', 'harf açar']]],
    hatirlatma: ['Eksik kelimeyi yoruma yaz!', 'Süre azaldıkça harfler açılıyor.', 'Atalarımız ne demiş? Haydi bakalım!'],
    uret: atasozuSorusu, ciz: () => soruCiz(),
  },
  memleket: {
    tip: 'memleket', baslik: 'MEMLEKET YARIŞI', kisa: 'memleket yarışı', sure: 75,
    acilis: 'Memleket yarışı başlıyor! Yoruma plakanı ya da şehrinin adını yaz. Beğenin, yorum yapın, memleketiniz öne geçsin!',
    satirlar: [[['34', 'ya da'], ['İSTANBUL', 'yaz, memleketine katıl']], [['BEĞEN', 'puan'], ['YORUM', 'puan'], ['TAKİP', '+5']]],
    hatirlatma: ['Memleketin neresi? Plakanı yoruma yaz!', 'Beğeniler memleketine puan getiriyor!', 'Gurbetteysen gurbet yaz!'],
    ciz: () => memleketCiz(),
  },
};
const turTipi = () => (S.tur === 'halay' ? 'halay' : OYUNLAR[S.tur].tip);
const turTanim = () => OYUNLAR[S.tur];

// ------------------------------------------------------------------ takım oyunları (yarış, halat, balon, kule, roket, güreş, futbol)
function takimOyunuBaslat(tur) {
  const def = OYUNLAR[tur];
  S.tur = tur;
  S.oyun = {
    tur, def, asama: 'secim', bitis: zaman() + SURE.secim, sonSayim: 0, o: 0, goller: [0, 0], golBitis: 0, golAtan: null,
    takimlar: def.takimlar.map((t) => ({ ...t, p: 0, enerji: 0, nitro: 0, turbo: 0, kayma: 0, dur: 0, dev: 0, roket: 0, uyeler: 0, hiz: 0, can: 1, sayi: 0, atis: 0, katki: new Map(), son: [] })),
    uye: new Map(), kazanan: null, berabere: false, yardimcilar: [],
    kareler: Array(BOYA_KOL * BOYA_SAT).fill(0), kareAni: Array(BOYA_KOL * BOYA_SAT).fill(0), atislar: [], toplar: [],
  };
  duyuru(def.baslik, def.takimlar.length === 3 ? '1, 2 ya da 3 yaz, takımını seç' : '1 SARI · 2 MAVİ yaz, takımını seç', CAMGOBEGI, 3);
  Spiker.ekle(def.acilis, 4, 'tur');
}
function takimNo(w) {
  const sayi = S.oyun.takimlar.length;
  for (const x of w) {
    if (x === '1' || x === 'sarı' || x === 'sari') return 1;
    if (x === '2' || x === 'mavi') return 2;
    if (sayi === 3 && (x === '3' || x === 'pembe')) return 3;
  }
  return 0;
}
function takim(no) { return S.oyun.takimlar[no - 1]; }
function takimSec(r, no) {
  const y = S.oyun;
  if (!y || y.asama === 'sonuc') return;
  const onceki = y.uye.get(r.id);
  if (onceki === no) return;
  if (onceki) { const ot = takim(onceki); ot.uyeler--; ot.son = ot.son.filter((x) => x !== r); }
  y.uye.set(r.id, no);
  if (!onceki) xpEkle(r, 2);
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
function takimCumlesi(def, k, ad, takimAdi) {
  return (def.cumleler[k] || '{ad}, çok teşekkürler!').replace('{ad}', ad).replace('{takim}', takimAdi);
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
  if (k >= 2) Spiker.ekle(takimCumlesi(y.def, k, ad, takimAdi), 3, 'hediye:' + r.id);
  else S.topluHediye.push({ r, hediyeAdi: 'hediye' });
  if (y.asama !== 'oyun') return;
  t.katki.set(r.id, (t.katki.get(r.id) || 0) + elmas * 10);
  const fz = y.def.fizik;
  if (fz === 'yaris' || fz === 'boya' || fz === 'dolum') {
    t.enerji += Math.min(60, elmas * 10);
    if (k >= 1) t.turbo = Math.max(t.turbo, 2.5);
    if (k >= 2) t.nitro = Math.min(6, t.nitro + 3);
    if (k === 3) { for (const x of rakipler) x.kayma = 3; Ses.boing(); }
    if (k === 4) {
      if (fz === 'yaris') { t.p = Math.min(0.96, t.p + 0.15); t.roket = 1.2; }
      else if (fz === 'boya') for (let i = 0; i < 5; i++) kareBoya(y, t);
      else basketAt(y, t);
    }
    if (k >= 5) { for (const x of rakipler) x.dur = 4; }
  } else if (fz === 'can') {
    t.enerji += Math.min(60, elmas * 10);
    for (let i = 0; i < Math.min(6, 1 + k); i++) kartopuAt(y, t);
    if (k === 3) { for (const x of rakipler) x.kayma = 3; Ses.boing(); }
    if (k === 4) { for (const x of rakipler) x.can = Math.max(0, x.can - 0.15); kartopuAt(y, t, true); }
    if (k >= 5) { for (const x of rakipler) x.kayma = 4; }
  } else {
    // halatta sarı sola çeker; güreşte ve futbolda sarı sağa iter
    const yon = y.def.fizik === 'cek' ? (t.no === 1 ? -1 : 1) : (t.no === 1 ? 1 : -1);
    const darbe = [0.02, 0.05, 0.1, 0.1, 0.1, 0.2][k];
    if (!(y.def.fizik === 'gol' && y.golAtan)) y.o = sinir(y.o + yon * darbe, -1, 1);
    t.enerji += Math.min(60, elmas * 10);
    if (k === 3) { for (const x of rakipler) x.kayma = 3; Ses.boing(); }
    if (k === 4) t.dev = 8;
    if (k >= 5) { for (const x of rakipler) x.kayma = 4; }
  }
  if (k >= 2) duyuru(efekt + '!', `${r.ad} · ${t.ad}`, t.renk.ana, 1.6, k);
}
function gol(atan) {
  const y = S.oyun, t = zaman();
  y.goller[atan.no - 1]++;
  y.golAtan = atan; y.golBitis = t + 2.4;
  duyuru('GOL!', `${atan.ad} TAKIM · ${y.goller[0]} - ${y.goller[1]}`, atan.renk.ana, 2.2, 3);
  konfeti(120); Ses.buyuk();
  Spiker.ekle(`Gol! ${atan.ad.toLocaleLowerCase('tr')} takım attı! Skor ${y.goller[0]}, ${y.goller[1]}.`, 3, 'gol');
}
function takimGuncelle(dt) {
  const y = S.oyun, t = zaman(), def = y.def;
  if (y.asama === 'secim' && t >= y.bitis) {
    y.asama = 'sayim'; y.bitis = t + SURE.sayim; y.sonSayim = 0;
    Spiker.ekle('Üç, iki, bir!', 4, 'sayim');
  }
  if (y.asama === 'sayim') {
    const kalan = Math.ceil(y.bitis - t);
    if (kalan !== y.sonSayim && kalan > 0) { y.sonSayim = kalan; Ses.sayim(); }
    if (t >= y.bitis) {
      y.asama = 'oyun'; y.bitis = t + SURE.oyun; Ses.basla();
      duyuru('BAŞLA!', def.oyunAlt, YESIL, 1.4);
      Spiker.ekle(def.basla, 4, 'basla');
    }
  }
  if (y.asama === 'oyun') {
    for (const k of y.takimlar) {
      k.enerji *= Math.exp(-dt / 2.3);
      k.turbo = Math.max(0, k.turbo - dt); k.kayma = Math.max(0, k.kayma - dt); k.dur = Math.max(0, k.dur - dt);
      k.dev = Math.max(0, k.dev - dt); k.roket = Math.max(0, k.roket - dt);
    }
    const hizHesapla = (k) => {
      let v = Math.min(0.09, 0.004 + 0.0042 * Math.sqrt(k.enerji));
      if (k.turbo > 0) v += 0.025;
      if (k.nitro > 0) { v += 0.05; k.nitro = Math.max(0, k.nitro - dt); }
      if (k.kayma > 0) v *= 0.25;
      if (k.dur > 0) v = 0;
      k.hiz = v;
      return v;
    };
    if (def.fizik === 'yaris') {
      let bitti = null;
      for (const k of y.takimlar) {
        k.p = Math.min(1, k.p + hizHesapla(k) * dt);
        if (k.p >= 1 && !bitti) bitti = k;
      }
      if (bitti || t >= y.bitis) takimOyunuBitir(bitti || [...y.takimlar].sort((a, b) => b.p - a.p)[0]);
    } else if (def.fizik === 'boya' || def.fizik === 'dolum') {
      for (const k of y.takimlar) {
        const v = hizHesapla(k);
        if (def.fizik === 'boya') {
          k.p += v * dt * 1.6;
          while (k.p >= 1 / 18) { k.p -= 1 / 18; kareBoya(y, k); }
        } else {
          k.p += v * dt * 2.4;
          if (k.p >= 1) { k.p = 0; basketAt(y, k); }
        }
      }
      if (t >= y.bitis) {
        if (def.fizik === 'boya') { const say = [0, 0, 0]; for (const v of y.kareler) if (v) say[v - 1]++; y.takimlar.forEach((k, i) => { k.sayi = say[i]; }); }
        const sira = [...y.takimlar].sort((a, b) => b.sayi - a.sayi);
        takimOyunuBitir(sira[0].sayi === sira[1].sayi ? null : sira[0]);
      }
    } else if (def.fizik === 'can') {
      const [sari, mavi] = y.takimlar;
      for (const k of y.takimlar) {
        k.hiz = k.kayma > 0 || k.dur > 0 ? 0 : 0.012 + 0.016 * Math.sqrt(k.enerji);
        k.atis += k.hiz * dt * 25;
        while (k.atis >= 1) { k.atis -= 1; kartopuAt(y, k); }
      }
      mavi.can -= sari.hiz * dt * 0.55;
      sari.can -= mavi.hiz * dt * 0.55;
      if (sari.can <= 0 || mavi.can <= 0) takimOyunuBitir(sari.can > mavi.can ? sari : mavi);
      else if (t >= y.bitis) takimOyunuBitir(Math.abs(sari.can - mavi.can) < 0.03 ? null : sari.can > mavi.can ? sari : mavi);
    } else {
      const [sari, mavi] = y.takimlar;
      const guc = (k) => (k.kayma > 0 ? 0 : 0.012 + 0.016 * Math.sqrt(k.enerji)) + (k.dev > 0 ? 0.06 : 0);
      sari.hiz = guc(sari); mavi.hiz = guc(mavi);
      if (def.fizik === 'cek') {
        y.o = sinir(y.o + (mavi.hiz - sari.hiz) * dt, -1, 1);
        if (Math.abs(y.o) >= 1) takimOyunuBitir(y.o < 0 ? sari : mavi);
        else if (t >= y.bitis) takimOyunuBitir(Math.abs(y.o) < 0.03 ? null : y.o < 0 ? sari : mavi);
      } else if (def.fizik === 'it') {
        y.o = sinir(y.o + (sari.hiz - mavi.hiz) * dt, -1, 1);
        if (Math.abs(y.o) >= 1) takimOyunuBitir(y.o > 0 ? sari : mavi);
        else if (t >= y.bitis) takimOyunuBitir(Math.abs(y.o) < 0.03 ? null : y.o > 0 ? sari : mavi);
      } else {
        if (y.golAtan) {
          if (t >= y.golBitis) { y.golAtan = null; y.o = 0; }
        } else {
          y.o = sinir(y.o + (sari.hiz - mavi.hiz) * dt * 1.6, -1, 1);
          if (Math.abs(y.o) >= 1) gol(y.o > 0 ? sari : mavi);
        }
        if (t >= y.bitis) {
          const [a, b] = y.goller;
          takimOyunuBitir(a === b ? null : a > b ? sari : mavi);
        }
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
  else y.yardimcilar = [];
  if (k) for (const [id, no] of y.uye) if (no === k.no) xpEkle(S.kisiler.get(id), 8);
  konfeti(220); havaiFisek(4); Ses.zafer();
  if (!k) Spiker.ekle(`Berabere! ${y.def.berabere || 'Kimse kazanamadı'}. Bir dahakine görüşürüz!`, 4, 'sonuc');
  else {
    const yardim = y.yardimcilar[0] ? ` En büyük destek ${okunurAd(y.yardimcilar[0].ad)} oldu.` : '';
    const skor = y.def.fizik === 'gol' ? ` Skor ${y.goller[0]}, ${y.goller[1]}.` : '';
    Spiker.ekle(`Kazanan ${k.ad.toLocaleLowerCase('tr')} takım! Tebrikler!${skor}${yardim}`, 4, 'sonuc');
  }
}
function turBaslat(tur) {
  S.oyun = null; S.soru = null; S.mem = null;
  S.turNo++;
  S.altinTur = false;
  if (tur !== 'halay' && OYUNLAR[tur]) {
    S.oyunSayaci++;
    S.altinTur = S.oyunSayaci % 6 === 0;
  }
  if (tur === 'halay' || !OYUNLAR[tur]) {
    S.tur = 'halay'; S.turBitis = zaman() + SURE.halay;
    duyuru('HALAY ZAMANI', 'GİR yaz, halaya katıl', SARI, 3);
    Spiker.ekle('Halay zamanı! Yoruma gir yazan halaya katılıyor. Beğenileri basın, coşku yükselsin!', 4, 'tur');
    return;
  }
  const tip = OYUNLAR[tur].tip;
  if (tip === 'takim') takimOyunuBaslat(tur);
  else if (tip === 'soru') soruOyunuBaslat(tur);
  else memleketBaslat();
  if (S.altinTur) {
    duyuru('ALTIN TUR!', 'Bu oyunda puanlar ve seviye puanı iki kat', ALTIN.ana, 3.4, 6);
    konfeti(160); Ses.buyuk();
    Spiker.ekle('Altın tur! Bu oyunda puanlar ve seviye puanları iki kat!', 4, 'altin-tur');
  }
}
// Bir sonraki oyun altın tur mu? (halay sayılmaz)
function siradakiAltinMi() {
  for (let i = 1; i < SIRA.length; i++) {
    const tur = SIRA[(S.siraIdx + i) % SIRA.length];
    if (tur !== 'halay' && OYUNLAR[tur]) return (S.oyunSayaci + 1) % 6 === 0 && i === 1;
  }
  return false;
}
function sonrakiTur() {
  S.siraIdx = (S.siraIdx + 1) % SIRA.length;
  turBaslat(SIRA[S.siraIdx]);
}
function siradakiAd() {
  const tur = SIRA[(S.siraIdx + 1) % SIRA.length];
  return tur === 'halay' || !OYUNLAR[tur] ? 'halay' : OYUNLAR[tur].kisa;
}

// ------------------------------------------------------------------ soru bankaları
// [soru, doğru cevap, yanlış, yanlış] — şıkların yeri her soruda karışır
const BILGI = [
  ["Türkiye'nin başkenti neresidir?", 'Ankara', 'İstanbul', 'İzmir'],
  ['Bir yılda kaç ay vardır?', '12', '10', '14'],
  ['Hangisi bir memelidir?', 'Yunus', 'Köpekbalığı', 'Ahtapot'],
  ['Dünyanın en büyük okyanusu hangisidir?', 'Büyük Okyanus', 'Atlas Okyanusu', 'Hint Okyanusu'],
  ['Suyun kimyasal formülü nedir?', 'H2O', 'CO2', 'O2'],
  ["Türkiye'nin en yüksek dağı hangisidir?", 'Ağrı Dağı', 'Erciyes Dağı', 'Uludağ'],
  ["Türkiye'nin en kalabalık şehri hangisidir?", 'İstanbul', 'Ankara', 'Konya'],
  ["Güneş'e en yakın gezegen hangisidir?", 'Merkür', 'Venüs', 'Mars'],
  ['Kızıl gezegen olarak bilinen hangisidir?', 'Mars', 'Jüpiter', 'Satürn'],
  ['Bir futbol takımı sahaya kaç oyuncuyla çıkar?', '11', '10', '9'],
  ['Örümceklerin kaç bacağı vardır?', '8', '6', '10'],
  ['Arıların ürettiği tatlı besin hangisidir?', 'Bal', 'Pekmez', 'Reçel'],
  ['Hangisi bir Karadeniz şehridir?', 'Trabzon', 'Antalya', 'Konya'],
  ["Mevlana Müzesi hangi şehirdedir?", 'Konya', 'Bursa', 'Kayseri'],
  ['Peri bacalarıyla ünlü bölge hangisidir?', 'Kapadokya', 'Pamukkale', 'Efes'],
  ['Pamukkale travertenleri hangi ildedir?', 'Denizli', 'Muğla', 'Aydın'],
  ['Bir saatte kaç dakika vardır?', '60', '100', '30'],
  ['1 kilogram kaç gramdır?', '1000', '100', '10000'],
  ['Hangisi bir sürüngendir?', 'Kaplumbağa', 'Kurbağa', 'Penguen'],
  ['Hangisi bir kuş değildir?', 'Yarasa', 'Penguen', 'Devekuşu'],
  ['Türk kahvesi hangi kapta pişirilir?', 'Cezve', 'Demlik', 'Tencere'],
  ['Hangisi bir kış sporudur?', 'Kayak', 'Sörf', 'Yelken'],
  ['Tamamı Türkiye içinde akan en uzun nehir hangisidir?', 'Kızılırmak', 'Sakarya', 'Yeşilırmak'],
  ["Türkiye'nin en büyük gölü hangisidir?", 'Van Gölü', 'Tuz Gölü', 'Eğirdir Gölü'],
  ['Hangisi bir meyvedir?', 'Kiraz', 'Ispanak', 'Pırasa'],
  ['Hangisi daha hızlıdır?', 'Işık', 'Ses', 'Rüzgâr'],
  ['Hangisi bir müzik aletidir?', 'Bağlama', 'Kalem', 'Tabak'],
  ['Halayda öndeki kişinin elinde ne olur?', 'Mendil', 'Şemsiye', 'Bayrak'],
  ['Kelaynak kuşlarıyla ünlü ilçe hangisidir?', 'Birecik', 'Bodrum', 'Kaş'],
  ['Truva Antik Kenti hangi ildedir?', 'Çanakkale', 'İzmir', 'Aydın'],
  ['Efes Antik Kenti hangi ildedir?', 'İzmir', 'Muğla', 'Antalya'],
  ['Sümela Manastırı hangi ildedir?', 'Trabzon', 'Rize', 'Artvin'],
  ["Dev heykelleriyle ünlü Nemrut Dağı hangi ildedir?", 'Adıyaman', 'Malatya', 'Mardin'],
  ['Bir üçgenin kaç kenarı vardır?', '3', '4', '5'],
  ["100'ün yarısı kaçtır?", '50', '25', '75'],
  ['"Çölün gemisi" denen hayvan hangisidir?', 'Deve', 'At', 'Fil'],
  ['Ormanlar kralı olarak bilinen hayvan hangisidir?', 'Aslan', 'Kaplan', 'Ayı'],
  ['Hangisi bir sebzedir?', 'Patlıcan', 'Elma', 'Muz'],
  ['Güneş hangi yönden doğar?', 'Doğu', 'Batı', 'Kuzey'],
  ['Yılın en kısa ayı hangisidir?', 'Şubat', 'Nisan', 'Haziran'],
  ['Artık yıl olmayan bir yıl kaç gündür?', '365', '366', '360'],
  ['Türkiye kaç ilden oluşur?', '81', '79', '83'],
  ["İstanbul'un plaka kodu kaçtır?", '34', '06', '35'],
  ["Ankara'nın plaka kodu kaçtır?", '06', '34', '01'],
  ['Hangisi bir Ege şehridir?', 'İzmir', 'Erzurum', 'Sivas'],
  ['Baklavasıyla ünlü şehir hangisidir?', 'Gaziantep', 'Rize', 'Kars'],
  ['İskender kebap hangi şehirle anılır?', 'Bursa', 'Adana', 'Konya'],
  ['Hamsi en çok hangi denizle anılır?', 'Karadeniz', 'Akdeniz', 'Ege Denizi'],
  ['Mantısıyla ünlü şehir hangisidir?', 'Kayseri', 'Rize', 'Edirne'],
  ['Künefesiyle ünlü şehir hangisidir?', 'Hatay', 'Bolu', 'Sinop'],
  ['Ahtapotun kaç kolu vardır?', '8', '6', '10'],
  ['Bir düzine kaç tanedir?', '12', '10', '20'],
  ['Hangisi bir gezegen değildir?', 'Ay', 'Venüs', 'Neptün'],
  ['Gökkuşağında kaç renk sayılır?', '7', '5', '9'],
  ['Satrançta oyunu bitiren hamleye ne denir?', 'Şah mat', 'Rok', 'Gol'],
];

// [kategori, kelime]
const KELIMELER = [
  ['HAYVAN', 'KAPLUMBAĞA'], ['HAYVAN', 'ZÜRAFA'], ['HAYVAN', 'PENGUEN'], ['HAYVAN', 'TİMSAH'], ['HAYVAN', 'KELEBEK'],
  ['HAYVAN', 'PAPAĞAN'], ['HAYVAN', 'KANGURU'], ['HAYVAN', 'SİNCAP'], ['HAYVAN', 'KARINCA'], ['HAYVAN', 'BALİNA'],
  ['MEYVE', 'KARPUZ'], ['MEYVE', 'ÇİLEK'], ['MEYVE', 'ANANAS'], ['MEYVE', 'MANDALİNA'], ['MEYVE', 'ŞEFTALİ'], ['MEYVE', 'KAYISI'],
  ['SEBZE', 'PATLICAN'], ['SEBZE', 'BROKOLİ'], ['SEBZE', 'ISPANAK'],
  ['YEMEK', 'BAKLAVA'], ['YEMEK', 'LAHMACUN'], ['YEMEK', 'KÖFTE'], ['YEMEK', 'SİMİT'], ['YEMEK', 'BÖREK'], ['YEMEK', 'KÜNEFE'],
  ['YEMEK', 'MENEMEN'], ['YEMEK', 'PİLAV'], ['YEMEK', 'MANTI'],
  ['EŞYA', 'ŞEMSİYE'], ['EŞYA', 'BUZDOLABI'], ['EŞYA', 'TELEFON'], ['EŞYA', 'YASTIK'], ['EŞYA', 'GÖZLÜK'], ['EŞYA', 'ÇAYDANLIK'], ['EŞYA', 'MERDİVEN'],
  ['ŞEHİR', 'TRABZON'], ['ŞEHİR', 'ERZURUM'], ['ŞEHİR', 'ANTALYA'], ['ŞEHİR', 'KASTAMONU'], ['ŞEHİR', 'GAZİANTEP'], ['ŞEHİR', 'ESKİŞEHİR'],
  ['SPOR', 'FUTBOL'], ['SPOR', 'VOLEYBOL'], ['SPOR', 'BASKETBOL'], ['SPOR', 'SATRANÇ'], ['MÜZİK', 'DAVUL'], ['MÜZİK', 'ZURNA'], ['MÜZİK', 'BAĞLAMA'],
];

// [atasözü ("_" eksik kelimenin yeri), eksik kelime]
const ATASOZLERI = [
  ['Damlaya damlaya _ olur.', 'göl'], ['Sakla samanı, gelir _.', 'zamanı'], ['Ağaç _ eğilir.', 'yaşken'],
  ['Bugünün işini _ bırakma.', 'yarına'], ['Komşu komşunun _ muhtaçtır.', 'külüne'], ['Az olsun, _ olsun.', 'öz'],
  ['Bin bilsen de bir bilene _.', 'danış'], ['Gülme komşuna, gelir _.', 'başına'], ['Ayağını _ göre uzat.', 'yorganına'],
  ['Acele işe _ karışır.', 'şeytan'], ['Söz gümüşse sükût _.', 'altındır'], ['Üzüm üzüme baka baka _.', 'kararır'],
  ['Sabreden _ muradına ermiş.', 'derviş'], ['İşleyen _ ışıldar.', 'demir'], ['Bir elin nesi var, iki elin _ var.', 'sesi'],
  ['Dost _ günde belli olur.', 'kara'], ['Tatlı dil _ deliğinden çıkarır.', 'yılanı'], ['Ateş düştüğü yeri _.', 'yakar'],
  ['Balık _ kokar.', 'baştan'], ['Dereyi görmeden _ sıvama.', 'paçaları'], ['Keskin sirke _ zarar.', 'küpüne'],
  ['Lafla _ gemisi yürümez.', 'peynir'], ['Meyve veren ağacı _.', 'taşlarlar'], ['Rüzgâr eken _ biçer.', 'fırtına'],
  ['Sütten ağzı yanan _ üfleyerek yer.', 'yoğurdu'], ['Ummadığın _ baş yarar.', 'taş'], ['Yuvayı _ kuş yapar.', 'dişi'],
  ['Ak akçe _ gün içindir.', 'kara'], ['Bal tutan _ yalar.', 'parmağını'], ['Görünen köy _ istemez.', 'kılavuz'],
  ['Hamama giren _.', 'terler'], ['Mum dibine _ vermez.', 'ışık'], ['Nerde birlik, orada _.', 'dirlik'],
  ['Öfkeyle kalkan _ oturur.', 'zararla'], ['Yalancının mumu _ kadar yanar.', 'yatsıya'], ['Her işte bir _ vardır.', 'hayır'],
];

// [cümle, doğru mu]
const DY = [
  ["Ankara Türkiye'nin başkentidir.", true], ["Güneş Dünya'nın etrafında döner.", false], ['Örümceklerin sekiz bacağı vardır.', true],
  ['Penguenler uçabilir.', false], ['Yunuslar memeli hayvanlardır.', true], ['Bir yılda 13 ay vardır.', false],
  ['Deniz seviyesinde su 100 derecede kaynar.', true], ["Güneş'e en yakın gezegen Mars'tır.", false], ["Van Gölü Türkiye'nin en büyük gölüdür.", true],
  ['Arılar bal yapar.', true], ['Zürafaların boynu kısadır.', false], ["Ay, Dünya'nın uydusudur.", true],
  ["Kutup ayıları Antarktika'da yaşar.", false], ['Işık sesten daha hızlıdır.', true], ['Balinalar balık türüdür.', false],
  ['Kayseri mantısıyla ünlüdür.', true], ['Şubat ayı her yıl 31 gündür.', false], ['Trabzon Karadeniz kıyısındadır.', true],
  ["Pamukkale Konya'dadır.", false], ['Bir haftada yedi gün vardır.', true], ['Satrançta her oyuncunun iki şahı vardır.', false],
  ['Ahtapotların sekiz kolu vardır.', true], ["Nemrut Dağı Adıyaman'dadır.", true], ["Dünyanın en büyük okyanusu Atlas Okyanusu'dur.", false],
  ["Efes Antik Kenti İzmir'dedir.", true], ['Kaplumbağalar memeli hayvanlardır.', false], ['Bir futbol takımı sahaya 11 oyuncuyla çıkar.', true],
  ['Kurbağalar sürüngendir.', false], ['Bir düzine 12 tanedir.', true], ['Yarasalar kuştur.', false],
];

// Hızlı yazma için tekerlemeler ve kısa sözler
const TEKERLEMELER = [
  'Kartal kalkar dal sarkar', 'Şu köşe yaz köşesi, şu köşe kış köşesi', 'Kırk küp, kırkının da kulpu kırık küp',
  'Al bu takatukaları takatukacıya götür', 'Üç tunç tas has hoş su', 'Dal sarkar kartal kalkar',
  'Çekoslovakyalılaştıramadıklarımızdan mısınız', 'Herkes piste, halay başlasın', 'Davul zurna çalsın, halay durmasın',
  'Mendili salla, halayı çek', 'Robotlar dans ediyor, herkes piste geliyor', 'Bu yoğurdu sarımsaklasak da mı saklasak',
];

// [soru, 1. seçenek, 2. seçenek]
const ANKETLER = [
  ['Çay mı, kahve mi?', 'ÇAY', 'KAHVE'], ['Kedi mi, köpek mi?', 'KEDİ', 'KÖPEK'], ['Yaz mı, kış mı?', 'YAZ', 'KIŞ'],
  ['Deniz mi, dağ mı?', 'DENİZ', 'DAĞ'], ['Baklava mı, künefe mi?', 'BAKLAVA', 'KÜNEFE'], ['Simit mi, poğaça mı?', 'SİMİT', 'POĞAÇA'],
  ['Döner mi, lahmacun mu?', 'DÖNER', 'LAHMACUN'], ['Tatlı mı, tuzlu mu?', 'TATLI', 'TUZLU'], ['Köy mü, şehir mi?', 'KÖY', 'ŞEHİR'],
  ['Kitap mı, film mi?', 'KİTAP', 'FİLM'], ['Halay mı, horon mu?', 'HALAY', 'HORON'], ['Pizza mı, hamburger mi?', 'PİZZA', 'HAMBURGER'],
  ['Mantı mı, sarma mı?', 'MANTI', 'SARMA'], ['Ayran mı, şalgam mı?', 'AYRAN', 'ŞALGAM'], ['Sabah mı, akşam mı?', 'SABAH', 'AKŞAM'],
];

// Bayraklar: d = dikey şeritler, y = yatay şeritler (soldan/yukarıdan), hac = İskandinav haçı, ciz = özel çizim
const BAYRAKLAR = [
  { ad: 'Türkiye', ciz: 'tr' }, { ad: 'Japonya', ciz: 'jp' }, { ad: 'İsviçre', ciz: 'ch' }, { ad: 'Bangladeş', ciz: 'bd' }, { ad: 'Yunanistan', ciz: 'gr' },
  { ad: 'Fransa', d: ['#0055A4', '#FFFFFF', '#EF4135'] }, { ad: 'İtalya', d: ['#009246', '#FFFFFF', '#CE2B37'] },
  { ad: 'İrlanda', d: ['#169B62', '#FFFFFF', '#FF883E'] }, { ad: 'Belçika', d: ['#111111', '#FAE042', '#ED2939'] },
  { ad: 'Romanya', d: ['#002B7F', '#FCD116', '#CE1126'] }, { ad: 'Nijerya', d: ['#008751', '#FFFFFF', '#008751'] },
  { ad: 'Almanya', y: ['#111111', '#DD0000', '#FFCE00'] }, { ad: 'Hollanda', y: ['#AE1C28', '#FFFFFF', '#21468B'] },
  { ad: 'Avusturya', y: ['#ED2939', '#FFFFFF', '#ED2939'] }, { ad: 'Macaristan', y: ['#CE2939', '#FFFFFF', '#477050'] },
  { ad: 'Bulgaristan', y: ['#FFFFFF', '#00966E', '#D62612'] }, { ad: 'Litvanya', y: ['#FDB913', '#006A44', '#C1272D'] },
  { ad: 'Estonya', y: ['#0072CE', '#111111', '#FFFFFF'] }, { ad: 'Polonya', y: ['#FFFFFF', '#DC143C'] },
  { ad: 'Endonezya', y: ['#CE1126', '#FFFFFF'] }, { ad: 'Kolombiya', y: ['#FCD116', '#FCD116', '#003893', '#CE1126'] },
  { ad: 'İsveç', hac: ['#006AA7', '#FECC02'] }, { ad: 'Finlandiya', hac: ['#FFFFFF', '#002F6C'] },
  { ad: 'Danimarka', hac: ['#C8102E', '#FFFFFF'] }, { ad: 'Norveç', hac: ['#BA0C2F', '#FFFFFF', '#00205B'] },
];

const RENK_LISTESI = [['KIRMIZI', '#FF4D4D'], ['MAVİ', '#3FA9FF'], ['YEŞİL', '#4ADE80'], ['SARI', '#FFD23F'], ['MOR', '#B57BFF'], ['TURUNCU', '#FF9F43'], ['PEMBE', '#FF7EC4']];

// Plaka sırasıyla 81 il
const SEHIRLER = ['Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
  'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
  'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
  'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'];

// ------------------------------------------------------------------ yeni oyunların tanımları (2. paket)
Object.assign(KADEMELER, {
  boya: kd('FIRÇA', 'RULO', 'BOYA KOVASI', 'FIRÇA KURUR', '5 KARE BİRDEN', 'ŞİMŞEK'),
  basket: kd('ATIŞ', 'HIZLI ATIŞ', 'SÜPER ATIŞ', 'TOP KAYAR', 'SMAÇ', 'ŞİMŞEK'),
  kartopu: kd('KARTOPU', 'HIZLI ATIŞ', 'KARTOPU YAĞMURU', 'BUZ KAYAR', 'DEV KARTOPU', 'KAR FIRTINASI'),
  anket: kd('KALP YAĞMURU', 'KONFETİ', 'DAVUL ZURNA', 'HAVAİ FİŞEK', 'DEV KUPA', 'OYLAMA ŞÖLENİ'),
  dogruyanlis: kd('KALP YAĞMURU', '+5 SANİYE', '+5 SANİYE', 'ÇİFT PUAN', 'DEV KUPA', 'BİLGİ ŞÖLENİ'),
});
KADEMELER.bayrak = KADEMELER.hafiza = KADEMELER.renk = KADEMELER.kactane = KADEMELER.bilgi;
KADEMELER.yazma = KADEMELER.dogruyanlis;
const SORU_ALT = [['1.', '+3'], ['2.', '+2'], ['3.', '+1']];
Object.assign(OYUNLAR, {
  boya: {
    tip: 'takim', fizik: 'boya', takimlar: TAKIM3, baslik: 'BOYAMA YARIŞI', kisa: 'boyama yarışı', begen: 'boya', oyunAlt: 'Beğen, kareleri boya!',
    acilis: 'Boyama yarışı! Bir sarı, iki mavi, üç pembe. Takımını yaz, en çok kareyi boyayan kazanır!',
    basla: 'Başla! Beğenileri basın, kareleri boyayın!', sonucYazi: 'En çok boyayanlar', berabere: 'Kareler eşit bölündü', birim: 'kare',
    cumleler: [null, null, '{ad} {takim} takıma boya kovası verdi!', '{ad} rakiplerin fırçasını kuruttu!', '{ad} {takim} takıma beş kare birden boyadı!', '{ad} şimşek çaktırdı, rakipler durdu!'],
    hatirlatma: ['Beğenileri basın, takımınızın rengi yayılsın!', 'Rakibin karesini de boyayabilirsiniz!', 'En çok kareyi boyayan takım kazanıyor!'],
    ciz: () => boyaCiz(),
  },
  basket: {
    tip: 'takim', fizik: 'dolum', takimlar: TAKIM3, baslik: 'BASKET ATIŞI', kisa: 'basket atışı', begen: 'atış', oyunAlt: 'Beğen, potaya at!',
    acilis: 'Basket atışı! Bir sarı, iki mavi, üç pembe. Takımını yaz, en çok sayı atan kazanır!',
    basla: 'Başla! Beğenileri basın, topu potaya atın!', sonucYazi: 'En çok atanlar', berabere: 'Sayılar eşit', birim: 'sayı',
    cumleler: [null, null, '{ad} {takim} takıma süper atış verdi!', '{ad} rakiplerin topunu kaydırdı!', '{ad} {takim} takıma smaç yaptırdı!', '{ad} şimşek çaktırdı, rakipler durdu!'],
    hatirlatma: ['Beğenileri basın, çubuk dolunca top potaya gidiyor!', 'Takımını seçmeyen yoruma numarasını yazsın.', 'En çok sayı atan takım kazanıyor!'],
    ciz: () => basketCiz(),
  },
  kartopu: {
    tip: 'takim', fizik: 'can', takimlar: TAKIM2, baslik: 'KARTOPU SAVAŞI', kisa: 'kartopu savaşı', begen: 'kartopu', oyunAlt: 'Beğen, kartopu at!',
    acilis: 'Kartopu savaşı! Bir sarı, iki mavi. Takımını yaz, rakibin kardan duvarını ilk yıkan kazanır!',
    basla: 'Başla! Beğenileri basın, kartopu atın!', sonucYazi: 'En çok atanlar', berabere: 'İki duvar da ayakta kaldı',
    cumleler: [null, null, '{ad} {takim} takıma kartopu yağmuru verdi!', '{ad} rakipleri buzda kaydırdı!', '{ad} dev kartopu fırlattı!', '{ad} kar fırtınası çıkardı!'],
    hatirlatma: ['Beğenileri basın, kartopları uçsun!', 'Sarı mı, mavi mi? Yoruma takımını yaz.', 'Rakibin duvarını ilk yıkan kazanıyor!'],
    ciz: () => kartopuCiz(),
  },
  bayrak: {
    tip: 'soru', baslik: 'BAYRAK BİL', kisa: 'bayrak bil', adet: 5, sure: 15, altBaslik: 'A, B ya da C yaz!',
    acilis: 'Bayrak bil! Ekrandaki bayrak hangi ülkenin? Doğru şıkkın harfini yaz: A, B ya da C.',
    satirlar: [[['A · B · C', 'yaz, cevap ver'], ['', 'tek hakkın var']], [['İLK BİLEN', '+3'], ['DOĞRU', '+1'], ['HEDİYE', 'ipucu, süre']]],
    hatirlatma: ['Bayrak hangi ülkenin? Harfini yaz!', 'İlk bilen üç puan alıyor!', 'Hediye atan bir yanlış şıkkı siliyor.'],
    uret: () => bayrakSorusu(), ciz: () => soruCiz(),
  },
  dogruyanlis: {
    tip: 'soru', baslik: 'DOĞRU MU, YANLIŞ MI?', kisa: 'doğru mu yanlış mı', adet: 6, sure: 13, altBaslik: 'D ya da Y yaz!',
    acilis: 'Doğru mu, yanlış mı? Cümle doğruysa D, yanlışsa Y yaz. Tek hakkın var!',
    satirlar: [[['D', 'doğru'], ['Y', 'yanlış'], ['', 'tek hakkın var']], [['İLK BİLEN', '+3'], ['DOĞRU', '+1'], ['HEDİYE', 'süre']]],
    hatirlatma: ['Doğruysa D, yanlışsa Y yaz!', 'İlk bilen üç puan alıyor!', 'Acele etme, tek hakkın var!'],
    uret: () => dyCumlesi(), ciz: () => soruCiz(),
  },
  hafiza: {
    tip: 'soru', baslik: 'HAFIZA OYUNU', kisa: 'hafıza oyunu', adet: 5, sure: 18, ilkN: 3, altBaslik: 'Sayıları aklında tut!',
    acilis: 'Hafıza oyunu! Ekrandaki sayıları aklında tut. Sayılar kaybolunca sırayla yoruma yaz!',
    satirlar: [[['SAYILARI', 'aklında tut, sonra yaz']], [...SORU_ALT, ['', 'tek hakkın var']]],
    hatirlatma: ['Sayılar kaybolunca sırayla yoruma yaz!', 'Her turda sayılar biraz daha uzuyor!', 'İlk bilen üç puan alıyor!'],
    uret: () => hafizaSorusu(), ciz: () => soruCiz(),
  },
  renk: {
    tip: 'soru', baslik: 'RENK TUZAĞI', kisa: 'renk tuzağı', adet: 6, sure: 12, ilkN: 3, altBaslik: 'Yazının RENGİNİ yaz!',
    acilis: 'Renk tuzağı! Ekrandaki kelimeyi değil, yazının rengini yaz. Tek hakkın var, dikkat et!',
    satirlar: [[['RENGİ', 'yaz, kelimeyi değil!']], [...SORU_ALT, ['', 'tek hakkın var']]],
    hatirlatma: ['Kelimeyi değil, yazının rengini yaz!', 'Tuzağa düşme, tek hakkın var!', 'İlk bilen üç puan alıyor!'],
    uret: () => renkSorusu(), ciz: () => soruCiz(),
  },
  kactane: {
    tip: 'soru', baslik: 'KAÇ TANE?', kisa: 'kaç tane', adet: 5, sure: 16, ilkN: 3, altBaslik: 'Say ve sayıyı yaz!',
    acilis: 'Kaç tane? Ekrandakileri say, sayıyı yoruma yaz. Tek hakkın var!',
    satirlar: [[['SAY', 'sayıyı yaz'], ['', 'tek hakkın var']], [...SORU_ALT, ['HEDİYE', 'ipucu']]],
    hatirlatma: ['Dikkatlice say, tek hakkın var!', 'Sayıyı yoruma yaz!', 'İlk bilen üç puan alıyor!'],
    uret: () => kacTaneSorusu(), ciz: () => soruCiz(),
  },
  yazma: {
    tip: 'soru', baslik: 'HIZLI YAZMA', kisa: 'hızlı yazma', adet: 5, sure: 22, ilkN: 3, altBaslik: 'Yazıyı aynen yaz!',
    acilis: 'Hızlı yazma! Ekrandaki tekerlemeyi ilk doğru yazan kazanır. Haydi parmaklar!',
    satirlar: [[['YAZIYI', 'aynen yaz']], [...SORU_ALT, ['', 'Türkçe harf şart değil']]],
    hatirlatma: ['Yazıyı aynen yaz, ilk yazan kazanır!', 'Türkçe harf kullanmasan da olur.', 'Haydi parmaklar, hız zamanı!'],
    uret: () => yazmaSorusu(), ciz: () => soruCiz(),
  },
  anket: {
    tip: 'soru', anket: true, baslik: 'BÜYÜK OYLAMA', kisa: 'büyük oylama', adet: 4, sure: 18, altBaslik: '1 ya da 2 yaz!',
    acilis: 'Büyük oylama! Hangisini seçersin? Bir ya da iki yaz, oyunu ver!',
    satirlar: [[['1', 'ya da'], ['2', 'yaz, oy ver']], [['', 'herkesin bir oyu var'], ['HEDİYE', 'konfeti']]],
    hatirlatma: ['Bir ya da iki yaz, oyunu ver!', 'Bakalım çoğunluk ne diyecek?', 'Herkesin bir oyu var!'],
    uret: () => anketSorusu(), ciz: () => soruCiz(),
  },
});

// ------------------------------------------------------------------ bilgi oyunları (soru-cevap)
const rnd = (n) => Math.floor(Math.random() * Math.max(1, n));
function karistir(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; }
// Türkçe karakterleri sadeleştirip karşılaştırır: "Kaplumbağa!" = "kaplumbaga"
function sade(m) {
  return buyuk(String(m || '')).toLocaleLowerCase('tr').replace(/[âàáä]/g, 'a').replace(/[îíìï]/g, 'i').replace(/[ûúùü]/g, 'u')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/[öô]/g, 'o').replace(/ş/g, 's').replace(/[^a-z0-9]/g, '');
}
const KULLANILAN = {};
function yeniSec(anahtar, liste) {
  const k = KULLANILAN[anahtar] || (KULLANILAN[anahtar] = new Set());
  if (k.size >= liste.length) k.clear();
  let i;
  do { i = rnd(liste.length); } while (k.has(i));
  k.add(i);
  return liste[i];
}

function secenekSorusu(metin, ops, ek = {}) {
  const sira = karistir([0, 1, 2]);
  const secenekler = sira.map((i) => ops[i]);
  const dogru = sira.indexOf(0);
  const harf = 'ABC'[dogru];
  return {
    tur: 'secenek', cizim: 'secenek', metin, secenekler, dogru, gorunen: `${harf}: ${ops[0]}`,
    oku: `{n}. soru: ${metin} A: ${secenekler[0]}. B: ${secenekler[1]}. C: ${secenekler[2]}.`,
    cevapOku: `Doğru cevap ${harf}: ${ops[0]}!`, ...ek,
  };
}
function bilgiSorusu() { const [metin, ...ops] = yeniSec('bilgi', BILGI); return secenekSorusu(metin, ops); }
function bayrakSorusu() {
  const b = yeniSec('bayrak', BAYRAKLAR);
  const yanlis = karistir(BAYRAKLAR.filter((x) => x !== b)).slice(0, 2).map((x) => x.ad);
  const s = secenekSorusu('Bu hangi ülkenin bayrağı?', [b.ad, ...yanlis], { cizim: 'bayrak', bayrak: b });
  s.oku = `{n}. bayrak! Bu hangi ülkenin bayrağı? A: ${s.secenekler[0]}. B: ${s.secenekler[1]}. C: ${s.secenekler[2]}.`;
  return s;
}
function kelimeSorusu() {
  const [kategori, kelime] = yeniSec('kelime', KELIMELER);
  const harfler = [...kelime];
  let karisik;
  do { karisik = karistir(harfler); } while (karisik.join('') === kelime);
  return {
    tur: 'yazi', tekKelime: true, cizim: 'kelime', kategori, kelime, karisik, dogru: sade(kelime), gorunen: kelime, harfIpucu: true,
    oku: `{n}. kelime! İpucu: ${kategori.toLocaleLowerCase('tr')}. ${harfler.length} harfli.`, cevapOku: `Doğru cevap: ${kelime.toLocaleLowerCase('tr')}!`,
  };
}
function matematikSorusu() {
  const tip = rastgele(['+', '+', '-', '×', '×']);
  let a, b, sonuc;
  if (tip === '+') { a = 11 + rnd(78); b = 11 + rnd(78); sonuc = a + b; }
  else if (tip === '-') { a = 30 + rnd(69); b = 10 + rnd(a - 15); sonuc = a - b; }
  else { a = 3 + rnd(10); b = 3 + rnd(10); sonuc = a * b; }
  const sozel = { '+': 'artı', '-': 'eksi', '×': 'çarpı' }[tip];
  return {
    tur: 'sayi', cizim: 'buyuk', ifade: `${a} ${tip === '-' ? '−' : tip} ${b} = ?`, dogru: sonuc, gorunen: String(sonuc),
    oku: `${a} ${sozel} ${b} kaç eder?`, cevapOku: `Cevap ${sonuc}!`, ipucuMetin: `Son rakamı ${sonuc % 10}`,
  };
}
function atasozuSorusu() {
  const [kalip, kelime] = yeniSec('atasozu', ATASOZLERI);
  return {
    tur: 'yazi', tekKelime: true, cizim: 'atasozu', kalip, kelime: buyuk(kelime), dogru: sade(kelime), gorunen: buyuk(kelime), harfIpucu: true,
    oku: `{n}. atasözü: ${kalip.replace('_', 'boşluk')} Eksik kelime ne?`, cevapOku: `Doğru cevap: ${kalip.replace('_', kelime)}`,
  };
}
function dyCumlesi() {
  const [metin, dogruMu] = yeniSec('dy', DY);
  return {
    tur: 'dy', cizim: 'dy', metin, dogru: dogruMu, gorunen: dogruMu ? 'DOĞRU' : 'YANLIŞ', ipucu: false,
    oku: `{n}. soru: ${metin} Doğru mu, yanlış mı?`, cevapOku: `Cevap: ${dogruMu ? 'doğru' : 'yanlış'}!`,
  };
}
function hafizaSorusu() {
  const uzunluk = [4, 5, 5, 6, 6, 7][Math.min(5, S.soru.idx - 1)];
  let rakamlar = '';
  for (let i = 0; i < uzunluk; i++) rakamlar += String(1 + rnd(9));
  const okunus = rakamlar.split('').join(' ');
  return {
    tur: 'sayi', rakam: true, cizim: 'hafiza', rakamlar, dogru: rakamlar, gorunen: okunus, gosterSure: 4, sure: 18,
    oku: '{n}. sayılar! Aklında tut!', cevapOku: `Cevap: ${okunus}!`,
  };
}
function renkSorusu() {
  const kelime = rastgele(RENK_LISTESI);
  let renk;
  do { renk = rastgele(RENK_LISTESI); } while (renk === kelime);
  return {
    tur: 'yazi', tekKelime: true, tekHak: true, tekSecim: RENK_LISTESI.map((x) => sade(x[0])), cizim: 'renk',
    kelime: kelime[0], renk: renk[1], dogru: sade(renk[0]), gorunen: renk[0], ipucuMetin: `İlk harfi ${renk[0][0]}`,
    oku: '{n}. renk! Yazının rengini yaz!', cevapOku: `Yazının rengi ${renk[0].toLocaleLowerCase('tr')}!`,
  };
}
const SEKILLER = [{ ad: 'SARI YILDIZ', sekil: 'yildiz', renk: SARI }, { ad: 'PEMBE KALP', sekil: 'kalp', renk: PEMBE }, { ad: 'MAVİ DAİRE', sekil: 'daire', renk: CAMGOBEGI }];
function kacTaneSorusu() {
  const hedef = rastgele(SEKILLER);
  const n = 6 + rnd(10);
  const hucre = karistir([...Array(40).keys()]);
  const sekiller = [];
  for (let i = 0; i < n; i++) sekiller.push({ sekil: hedef.sekil, renk: hedef.renk, h: hucre[i] });
  const sasirt = 6 + rnd(8);
  for (let j = 0; j < sasirt; j++) {
    const diger = rastgele(SEKILLER.filter((x) => x !== hedef));
    // aynı şekil başka renk ya da aynı renk başka şekil: dikkatli saymak gerekiyor
    sekiller.push(Math.random() < 0.5 ? { sekil: hedef.sekil, renk: diger.renk, h: hucre[n + j] } : { sekil: diger.sekil, renk: hedef.renk, h: hucre[n + j] });
  }
  for (const s of sekiller) { s.dx = Math.random() - 0.5; s.dy = Math.random() - 0.5; s.aci = (Math.random() - 0.5) * 0.6; }
  return {
    tur: 'sayi', cizim: 'kactane', hedef, sekiller, dogru: n, gorunen: String(n), ipucuMetin: n > 10 ? "10'dan fazla" : '10 ya da daha az',
    oku: `{n}. soru! Kaç tane ${hedef.ad.toLocaleLowerCase('tr')} var? Say ve yaz!`, cevapOku: `Cevap ${n}!`,
  };
}
function yazmaSorusu() {
  const metin = yeniSec('yazma', TEKERLEMELER);
  return {
    tur: 'yazi', cizim: 'yazma', metin, dogru: sade(metin), gorunen: metin, ipucu: false,
    oku: `{n}. yazı! ${metin}`, cevapOku: 'Süre bitti! Sıradaki yazıya geçiyoruz.',
  };
}
function anketSorusu() {
  const [metin, a, b] = yeniSec('anket', ANKETLER);
  return {
    tur: 'anket', cizim: 'anket', metin, secenekler: [a, b], secenekSade: [sade(a), sade(b)],
    oku: `{n}. oylama: ${metin} ${a.toLocaleLowerCase('tr')} için bir, ${b.toLocaleLowerCase('tr')} için iki yaz!`,
  };
}

function soruOyunuBaslat(tur) {
  const def = OYUNLAR[tur];
  S.tur = tur;
  S.soru = {
    tur, def, idx: 0, toplam: def.adet, asama: 'giris', basla: zaman(), bitis: zaman() + 5, soru: null, dogrular: [], cevaplayan: new Map(),
    puan: new Map(), cift: 1, ipucu: 0, elenen: new Set(), oylar: [0, 0], sonuclar: [], gizlendi: false, sonTik: 0,
  };
  Spiker.ekle(def.acilis, 4, 'tur');
}
function soruSonraki() {
  const q = S.soru, t = zaman();
  q.idx++;
  q.dogrular = []; q.cevaplayan = new Map(); q.cift = S.altinTur ? 2 : 1; q.ipucu = 0; q.elenen = new Set(); q.oylar = [0, 0]; q.gizlendi = false; q.sonTik = 0;
  q.soru = q.def.uret();
  q.sure = q.soru.sure || q.def.sure;
  q.asama = 'soru'; q.basla = t; q.bitis = t + q.sure;
  if (q.soru.oku) Spiker.ekle(q.soru.oku.replace('{n}', q.idx), 4, 'soru');
  Ses.basla();
}
function soruGuncelle() {
  const q = S.soru, t = zaman();
  if (q.asama === 'giris' && t >= q.bitis) soruSonraki();
  else if (q.asama === 'soru') {
    if (q.soru.gosterSure && !q.gizlendi && t >= q.basla + q.soru.gosterSure) { q.gizlendi = true; Ses.sayim(); Spiker.ekle('Şimdi yaz!', 3, 'gizle'); }
    const kalan = q.bitis - t;
    if (kalan <= 3 && kalan > 0 && Math.ceil(kalan) !== q.sonTik) { q.sonTik = Math.ceil(kalan); Ses.sayim(); }
    if (t >= q.bitis || (q.def.ilkN && q.dogrular.length >= q.def.ilkN)) cevapGoster();
  } else if (q.asama === 'cevap' && t >= q.bitis) {
    if (q.idx >= q.toplam) soruTurBitir(); else soruSonraki();
  } else if (q.asama === 'sonuc' && t >= q.bitis) sonrakiTur();
}
function puanEkle(r, n) {
  const q = S.soru;
  const p = q.puan.get(r.id) || { r, puan: 0 };
  p.puan += n;
  q.puan.set(r.id, p);
}
const soruSiralama = () => [...S.soru.puan.values()].sort((a, b) => b.puan - a.puan);
function cevapGoster() {
  const q = S.soru, s = q.soru, t = zaman();
  q.asama = 'cevap'; q.bitis = t + 5;
  if (q.def.anket) {
    const [a, b] = q.oylar, top = a + b;
    q.sonuclar.push({ s, oylar: [a, b] });
    let soz;
    if (!top) soz = 'Kimse oy vermedi! Sıradaki soruya geçiyoruz.';
    else if (a === b) soz = 'Berabere! İki taraf eşit.';
    else { const i = a > b ? 0 : 1; soz = `${s.secenekler[i].toLocaleLowerCase('tr')} kazandı! Yüzde ${Math.round((Math.max(a, b) / top) * 100)}.`; }
    Spiker.ekle(soz, 4, 'cevap');
    if (top) { konfeti(80); Ses.hediye(); }
    return;
  }
  // herkesin cevap verdiği oyunlarda (şıklı, doğru-yanlış) puanlar şimdi dağıtılır
  if (!q.def.ilkN) q.dogrular.forEach((r, i) => { puanEkle(r, (i === 0 ? 3 : 1) * q.cift); xpEkle(r, i === 0 ? 8 : 5); });
  const ilk = q.dogrular[0];
  const ek = s.tur === 'yazi' && !s.tekKelime ? (ilk ? ` İlk yazan ${okunurAd(ilk.ad)}!` : ' Bu sefer kimse yetişemedi.') : ilk ? ` İlk bilen ${okunurAd(ilk.ad)}!` : ' Bu soruyu kimse bilemedi.';
  Spiker.ekle(`${s.cevapOku}${ek}`, 4, 'cevap');
  if (ilk) { Ses.hediye(); kivilcim(540, D.sahneUst + 220, 40); }
}
function soruTurBitir() {
  const q = S.soru;
  q.asama = 'sonuc'; q.bitis = zaman() + SURE.sonuc + 1;
  konfeti(200); havaiFisek(3); Ses.zafer();
  if (q.def.anket) { Spiker.ekle('Oylama bitti! Oy veren herkese teşekkürler!', 4, 'sonuc'); return; }
  const sira = soruSiralama();
  if (!sira.length) Spiker.ekle('Bu turda kimse puan alamadı. Bir dahaki sefere!', 4, 'sonuc');
  else Spiker.ekle(`Turun birincisi ${okunurAd(sira[0].r.ad)}, ${sira[0].puan} puanla! Tebrikler!`, 4, 'sonuc');
}
function soruYorum(r, m, w) {
  const q = S.soru;
  if (!q || q.asama !== 'soru') return;
  const s = q.soru, t = zaman();
  if (s.gosterSure && t < q.basla + s.gosterSure) return; // sayılar ekrandayken cevap sayılmaz
  let cevap;
  if (s.tur === 'secenek') {
    const h = [...new Set(w.filter((x) => x === 'a' || x === 'b' || x === 'c'))];
    if (h.length !== 1) return;
    cevap = 'abc'.indexOf(h[0]);
    if (q.elenen.has(cevap)) return;
  } else if (s.tur === 'dy') {
    const d = w.some((x) => x === 'd' || sade(x) === 'dogru'), y = w.some((x) => x === 'y' || sade(x) === 'yanlis');
    if (d === y) return;
    cevap = d;
  } else if (s.tur === 'anket') {
    const v = w.find((x) => x === '1' || x === '2');
    cevap = v ? Number(v) - 1 : s.secenekSade.findIndex((o) => w.some((x) => sade(x) === o));
    if (cevap < 0) return;
  } else if (s.tur === 'sayi') {
    const sayi = String(m).replace(/[\s.,\-]+/g, '').match(/\d+/);
    if (!sayi) return;
    cevap = s.rakam ? sayi[0] : Number(sayi[0]);
  } else if (s.gecerli) {
    // isim-şehir: harfe ve kategoriye uyan, daha önce yazılmamış bir kelime
    if (q.dogrular.includes(r)) return;
    const bulunan = [sade(m), ...w.map(sade)].find((x) => s.gecerli.has(x) && !s.alinan.has(x));
    if (!bulunan) return;
    s.alinan.set(bulunan, { r, ad: s.gecerli.get(bulunan) });
    dogruBildi(q, r);
    return;
  } else {
    if (s.tekSecim) {
      // renk tuzağında bir yorumda tek renk yazılmalı
      const secim = [...new Set(w.map(sade).filter((x) => s.tekSecim.includes(x)))];
      if (secim.length !== 1) return;
      cevap = secim[0];
    } else cevap = sade(m);
    if (!cevap) return;
  }
  const tekHak = s.tur !== 'yazi' || s.tekHak;
  if (tekHak) {
    if (q.cevaplayan.has(r.id)) return;
    q.cevaplayan.set(r.id, cevap);
  }
  if (s.tur === 'anket') { q.oylar[cevap]++; xpEkle(r, 1); return; }
  const dogru = s.tur === 'yazi' && s.tekKelime && !s.tekSecim ? cevap === s.dogru || w.some((x) => sade(x) === s.dogru) : cevap === s.dogru;
  if (!dogru || q.dogrular.includes(r)) return;
  dogruBildi(q, r);
}
function dogruBildi(q, r) {
  q.dogrular.push(r);
  xpEkle(r, q.dogrular.length === 1 ? 8 : 5);
  if (q.def.ilkN) {
    const sira = q.dogrular.length;
    const puan = ([3, 2, 1][sira - 1] || 0) * q.cift;
    if (puan) { puanEkle(r, puan); tost(`${r.ad} bildi! +${puan}`, r, 'hediye'); }
    Ses.pop();
    if (sira === 1) Spiker.ekle(`${okunurAd(r.ad)} bildi!`, 3, 'bildi');
  }
}
function soruHediye(r, elmas, k, ad, hediyeAdi) {
  const q = S.soru;
  Ses.hediye();
  kalpler(4 + k * 2, 540, D.sahneAlt - 60);
  const aktif = q && q.asama === 'soru';
  if (!q || q.def.anket) {
    if (k >= 3) { havaiFisek(k - 1); konfeti(60 * k); }
    if (k >= 4) duyuru(KADEMELER.anket[k].ad + '!', r.ad, ALTIN.ana, 2.2, k);
    if (k >= 2) Spiker.ekle(`${ad}, çok teşekkürler!`, 3, 'hediye:' + r.id); else S.topluHediye.push({ r, hediyeAdi });
    return;
  }
  if (k === 0) { S.topluHediye.push({ r, hediyeAdi }); return; }
  const ipucuYok = !aktif || q.soru.ipucu === false;
  if (k === 1 && !ipucuYok) {
    q.ipucu++;
    if (q.soru.tur === 'secenek') {
      const yanlis = [0, 1, 2].filter((i) => i !== q.soru.dogru && !q.elenen.has(i));
      if (yanlis.length > 1) q.elenen.add(rastgele(yanlis));
    }
    duyuru('İPUCU!', r.ad, CAMGOBEGI, 1.4, 1);
    Spiker.ekle(`${ad} herkese ipucu açtı!`, 3, 'hediye:' + r.id);
  } else if (k <= 2) {
    if (aktif) q.bitis += 5;
    duyuru('+5 SANİYE', r.ad, CAMGOBEGI, 1.4, 2);
    Spiker.ekle(`${ad} herkese beş saniye ek süre verdi!`, 3, 'hediye:' + r.id);
  } else if (k === 3) {
    if (aktif) q.cift = 2;
    duyuru('ÇİFT PUAN!', `${r.ad} · bu soru iki kat`, SARI, 2, 3); havaiFisek(2);
    Spiker.ekle(`${ad} çift puan açtı! Bu soru iki kat değerli!`, 3, 'hediye:' + r.id);
  } else if (k === 4) {
    duyuru('DEV KUPA!', r.ad, ALTIN.ana, 2.4, 4); havaiFisek(3); Ses.buyuk();
    Spiker.ekle(`${ad}, dev kupa senin! Çok teşekkürler!`, 3, 'hediye:' + r.id);
  } else {
    if (aktif) { q.cift = 2; q.bitis += 5; }
    duyuru('BİLGİ ŞÖLENİ!', r.ad, PEMBE, 3, 5); konfeti(240); havaiFisek(5); Ses.buyuk();
    Spiker.ekle(`${ad} bilgi şöleni başlattı! Çift puan ve ek süre!`, 4, 'hediye:' + r.id);
  }
}
// Kelime ve atasözünde süre azaldıkça (ve hediyeyle) harfler açılır
function acikHarf(q) {
  const s = q.soru;
  if (!s.harfIpucu) return 0;
  const gecen = (zaman() - q.basla) / q.sure;
  const zamanla = (gecen > 0.5 ? 1 : 0) + (gecen > 0.75 ? 1 : 0);
  return Math.min([...s.kelime].length - 1, zamanla + q.ipucu);
}

// ------------------------------------------------------------------ memleket yarışı
const SEHIR_ADI = new Map(SEHIRLER.map((ad, i) => [sade(ad), i + 1]));
for (const [ad, pl] of [['antep', 27], ['maras', 46], ['kmaras', 46], ['urfa', 63], ['afyon', 3], ['icel', 33], ['izmit', 41], ['adapazari', 54], ['hakari', 30], ['dersim', 62], ['antakya', 31]]) SEHIR_ADI.set(ad, pl);
for (const ad of ['gurbet', 'gurbetci', 'almanya', 'hollanda', 'fransa', 'belcika', 'avusturya', 'ingiltere', 'isvicre', 'amerika', 'yurtdisi', 'kibris', 'azerbaycan']) SEHIR_ADI.set(ad, 0);
function ekDe(ad) { const ham = ad.toLocaleLowerCase('tr').match(/[aeıioöuü]/g); const v = ham ? ham[ham.length - 1] : 'a'; return 'aıou'.includes(v) ? 'da' : 'de'; }
function hemsehri(ad) {
  if (ad === 'Gurbet') return 'gurbetçiler';
  const ham = ad.toLocaleLowerCase('tr').match(/[aeıioöuü]/g);
  const v = ham ? ham[ham.length - 1] : 'a';
  const ek = { a: 'lılar', ı: 'lılar', e: 'liler', i: 'liler', o: 'lular', u: 'lular', ö: 'lüler', ü: 'lüler' }[v];
  return ad + ek;
}
function memleketBaslat() {
  S.tur = 'memleket';
  S.mem = { asama: 'oyun', bitis: zaman() + OYUNLAR.memleket.sure, sehir: new Map(), kisi: new Map(), lider: null, sonLiderAnons: 0, sonYeniAnons: 0, bayrak: null, kazanan: null };
  duyuru('MEMLEKET YARIŞI', 'Plakanı ya da şehrini yaz!', CAMGOBEGI, 3);
  Spiker.ekle(OYUNLAR.memleket.acilis, 4, 'tur');
}
function sehirBul(w) {
  for (const x of w) {
    if (/^\d{1,2}$/.test(x)) { const n = Number(x); if (n >= 1 && n <= 81) return n; }
    const p = SEHIR_ADI.get(sade(x));
    if (p !== undefined) return p;
  }
  return null;
}
function memSehir(pl) {
  const M = S.mem, t = zaman();
  let s = M.sehir.get(pl);
  if (!s) {
    s = { pl, ad: pl === 0 ? 'Gurbet' : SEHIRLER[pl - 1], puan: 0, kisi: 0, yildiz: 0, flas: 0, gor: 0 };
    M.sehir.set(pl, s);
    if (M.sehir.size > 1 && t - M.sonYeniAnons > 7) { M.sonYeniAnons = t; Spiker.ekle(`${s.ad} ${ekDe(s.ad)} yarışa katıldı!`, 1, 'yeni-sehir'); }
  }
  return s;
}
function memYorum(r, w) {
  const M = S.mem;
  if (!M || M.asama !== 'oyun') return;
  const pl = sehirBul(w);
  if (pl === null) { memPuan(r, 1); return; }
  const onceki = M.kisi.get(r.id);
  if (onceki === pl) { memPuan(r, 1); return; }
  if (onceki !== undefined) { const o = M.sehir.get(onceki); o.kisi--; o.puan = Math.max(0, o.puan - 5); }
  M.kisi.set(r.id, pl);
  if (onceki === undefined) xpEkle(r, 3);
  const s = memSehir(pl);
  s.kisi++; s.puan += 5; s.flas = zaman() + 0.8;
  if (onceki === undefined) tost(`${r.ad} → ${s.ad}`, r, 'katil');
}
function memPuan(r, n) {
  const M = S.mem;
  if (!M || M.asama !== 'oyun') return;
  const pl = M.kisi.get(r.id);
  if (pl === undefined) return;
  M.sehir.get(pl).puan += n;
}
function memHediye(r, elmas, k, ad, hediyeAdi) {
  const M = S.mem;
  Ses.hediye();
  kalpler(4 + 2 * k, 540, D.sahneAlt - 60);
  const pl = M ? M.kisi.get(r.id) : undefined;
  const s = pl !== undefined ? M.sehir.get(pl) : null;
  if (s) { s.flas = zaman() + 1.2; if (k >= 1) s.yildiz++; }
  if (k === 0) { S.topluHediye.push({ r, hediyeAdi }); return; }
  if (k >= 2) S.tempoBitis = zaman() + 8;
  if (k >= 3) havaiFisek(k - 1);
  if (k >= 4 && s) M.bayrak = { s, bitis: zaman() + 6, r };
  if (k >= 5) konfeti(240);
  const efekt = KADEMELER.memleket[k].ad;
  duyuru(efekt + '!', s ? `${r.ad} · ${s.ad}` : r.ad, k >= 4 ? ALTIN.ana : SARI, 1.8, k);
  Spiker.ekle(s ? `${ad}, teşekkürler! ${s.ad} için ${efekt.toLocaleLowerCase('tr')}!` : `${ad}, çok teşekkürler! Memleketini yazmayı unutma.`, k >= 2 ? 3 : 2, 'hediye:' + r.id);
}
const memSirala = () => [...S.mem.sehir.values()].sort((a, b) => b.puan - a.puan);
function memGuncelle() {
  const M = S.mem, t = zaman();
  if (M.asama === 'oyun') {
    const sira = memSirala();
    const lider = sira[0];
    if (lider && lider !== M.lider && lider.puan > 0) {
      const once = M.lider;
      M.lider = lider;
      if (once && t - M.sonLiderAnons > 8) { M.sonLiderAnons = t; Spiker.ekle(`${lider.ad} öne geçti!`, 2, 'lider'); }
    }
    if (t >= M.bitis) {
      M.asama = 'sonuc'; M.bitis = t + SURE.sonuc + 1; M.kazanan = sira[0] || null;
      konfeti(240); havaiFisek(4); Ses.zafer();
      Spiker.ekle(M.kazanan ? `Memleket yarışını ${M.kazanan.ad} kazandı! Tebrikler ${hemsehri(M.kazanan.ad)}!` : 'Bu sefer kimse memleketini yazmadı. Bir dahaki sefere!', 4, 'sonuc');
    }
  } else if (t >= M.bitis) sonrakiTur();
}

// ------------------------------------------------------------------ yeni oyunların çizimleri
function sahneAlani() { return { ust: D.sahneUst + 16, alt: D.sahneAlt + 80 }; }
function sahneZemin(c, ust, alt) { cam(c, 30, ust - 10, 1020, alt - ust + 20, 28, 0.4); }
function takimEtiketi(c, tk, x, y, ek) {
  hap(c, `${tk.no} · ${tk.ad}`, x, y, 32, tk.renk.ana, INK);
  yazi(c, ek ?? `${tk.uyeler} kişi`, x, y + 52, 28, BEYAZ, { w: 600, golge: true });
}
function takimDurumu(c, tk, x, y, sozler = {}) {
  let m = null, renk = SARI;
  if (tk.dur > 0) { m = sozler.dur || 'DONDU!'; renk = CAMGOBEGI; }
  else if (tk.kayma > 0) { m = sozler.kayma || 'KAYDI!'; renk = PEMBE; }
  else if (tk.nitro > 0 || tk.turbo > 0) m = sozler.turbo || 'TURBO!';
  else if (tk.dev > 0) m = sozler.dev || 'DEV GÜÇ!';
  if (m) yazi(c, m, x, y, 34, renk, { golge: true });
}
function satirla(c, metin, boy, maxW, agirlik = 800) {
  c.font = font(boy, agirlik);
  const satirlar = [];
  let s = '';
  for (const k of String(metin).split(/\s+/)) {
    const d = s ? s + ' ' + k : k;
    if (s && c.measureText(d).width > maxW) { satirlar.push(s); s = k; } else s = d;
  }
  if (s) satirlar.push(s);
  return satirlar;
}
// Ortalanmış, gerekirse küçülen çok satırlı yazı; son satırın taban çizgisini döndürür
function paragraf(c, metin, x, y, boy, renk, maxW, o = {}) {
  let b = boy, sat = satirla(c, metin, b, maxW, o.w);
  while (sat.length > (o.maxSatir || 3) && b > 22) { b *= 0.9; sat = satirla(c, metin, b, maxW, o.w); }
  const lh = b * 1.2;
  const y0 = o.orta ? y - ((sat.length - 1) * lh) / 2 + b * 0.35 : y;
  sat.forEach((s, i) => yazi(c, s, x, y0 + i * lh, b, renk, { w: o.w, golge: o.golge, hiza: o.hiza, maxW }));
  return y0 + (sat.length - 1) * lh;
}
function yildizAcili(c, x, y, r, aci, renk) {
  c.fillStyle = renk; c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = aci + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath(); c.fill();
}
function patlama(c, x, y, r, renk, metin) {
  c.fillStyle = renk; c.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12, rr = i % 2 ? r * 0.62 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath(); c.fill();
  if (metin) yazi(c, metin, x, y + r * 0.16, r * 0.42, INK);
}

// ---- balon şişirme
function balonCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  sahneZemin(c, ust, alt);
  const gy = alt - 24;
  const rMax = Math.min(150, (gy - 230 - (ust + 120)) / 2);
  y.takimlar.forEach((tk, i) => {
    const x = 200 + i * 340;
    takimEtiketi(c, tk, x, ust + 36);
    const calisiyor = y.asama === 'oyun' && tk.dur <= 0 && tk.kayma <= 0;
    const faz = calisiyor ? (Math.sin(t * (5 + tk.hiz * 150)) + 1) / 2 : 0.5;
    // pompa
    const px = x + 80, pBoy = 120;
    kutu(c, px - 18, gy - pBoy, 36, pBoy, 10, '#C9CEDF');
    kutu(c, px - 34, gy - 12, 68, 12, 6, '#9AA0B5');
    const kolY = gy - pBoy - 16 - faz * 44;
    cizgi(c, [[px, gy - pBoy], [px, kolY]], 8, '#9AA0B5');
    cizgi(c, [[px - 34, kolY], [px + 34, kolY]], 12, INK);
    // pompalayan robot
    const s = 0.42, rx = x - 30;
    const el = [(px - 22 - rx) / s, (kolY - gy) / s];
    insan(c, rx, gy, s, tk.renk, { anahtar: 'balon' + tk.no, forma: true, dur: true, kolSol: 'bel', kolSag: [OMUZ, [(54 + el[0]) / 2 + 10, (-296 + el[1]) / 2 - 30], el], goz: 'mutlu' });
    // hortum ve balon
    const r = 34 + (rMax - 34) * tk.p;
    const bx = x - 10 + (tk.kayma > 0 ? Math.sin(t * 30) * 5 : 0), by = gy - 250 - r;
    c.beginPath(); c.moveTo(px + 18, gy - 24); c.quadraticCurveTo(px + 90, gy - 160, bx, by + r + 16);
    c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
    if (y.asama === 'sonuc' && y.kazanan === tk) patlama(c, bx, by, rMax * 1.05, tk.renk.ana, 'PAT!');
    else {
      c.fillStyle = tk.dur > 0 ? '#CFF4FF' : tk.renk.ana;
      c.beginPath(); c.ellipse(bx, by, r * 0.9, r, 0, 0, Math.PI * 2); c.fill();
      c.save(); c.globalAlpha = 0.45; c.fillStyle = BEYAZ;
      c.beginPath(); c.ellipse(bx - r * 0.35, by - r * 0.4, r * 0.16, r * 0.3, -0.5, 0, Math.PI * 2); c.fill(); c.restore();
      c.fillStyle = tk.renk.koyu; c.beginPath(); c.moveTo(bx - 11, by + r + 16); c.lineTo(bx + 11, by + r + 16); c.lineTo(bx, by + r - 3); c.closePath(); c.fill();
      const yb = Math.max(26, r * 0.42);
      yazi(c, `%${Math.round(tk.p * 100)}`, bx, by + yb * 0.36, yb, INK);
    }
    takimDurumu(c, tk, x, ust + 130, { kayma: 'TIKANDI!' });
  });
  takimOyunuKaplama(ust, alt);
}

// ---- kule yarışı
const KULE_KAT = 15;
function kuleCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  sahneZemin(c, ust, alt);
  const gy = alt - 30, tepe = ust + 170;
  const bh = (gy - tepe) / KULE_KAT;
  c.save(); c.setLineDash([18, 14]); cizgi(c, [[50, tepe], [1030, tepe]], 5, 'rgba(255,255,255,0.8)'); c.restore();
  yazi(c, 'BİTİŞ', 1022, tepe - 12, 26, BEYAZ, { hiza: 'right', golge: true });
  kutu(c, 40, gy, 1000, 16, 8, '#8A5A2B');
  y.takimlar.forEach((tk, i) => {
    const x = 200 + i * 340;
    const n = Math.min(KULE_KAT, Math.floor(tk.p * KULE_KAT + 1e-6)), kesir = tk.p * KULE_KAT - n;
    takimEtiketi(c, tk, x, ust + 36, `${n} / ${KULE_KAT} kat · ${tk.uyeler} kişi`);
    c.save(); c.translate(x, gy); c.rotate(tk.kayma > 0 ? Math.sin(t * 16) * 0.035 : 0);
    for (let j = 0; j < n; j++) {
      const yy = -(j + 1) * bh;
      kutu(c, -88, yy + 2, 176, bh - 4, 8, j % 2 ? tk.renk.koyu : tk.renk.ana);
      if (bh > 24) for (const wx of [-48, 0, 48]) kutu(c, wx - 11, yy + bh * 0.28, 22, bh * 0.44, 4, 'rgba(27,16,64,0.4)');
    }
    if (y.asama === 'oyun' && n < KULE_KAT && kesir > 0.03) {
      c.globalAlpha = 0.7;
      kutu(c, -88, ara(-(gy - ust - 120), -(n + 1) * bh, Math.min(1, kesir * 1.3)) + 2, 176, bh - 4, 8, tk.renk.ana);
      c.globalAlpha = 1;
    }
    insan(c, 0, -n * bh, 0.24, tk.renk, { anahtar: 'kule' + tk.no, forma: true, dur: true, golge: false, kolSol: 'yukari', kolSag: Math.floor(t * 3) % 2 ? 'salla' : 'havada', goz: 'mutlu' });
    c.restore();
    takimDurumu(c, tk, x, ust + 128, { kayma: 'SALLANIYOR!' });
  });
  takimOyunuKaplama(ust, alt);
}

// ---- roket yarışı
function roketCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  const g = c.createLinearGradient(0, ust, 0, alt);
  g.addColorStop(0, '#070320'); g.addColorStop(1, '#2B137A');
  yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.fillStyle = g; c.fill();
  for (let i = 0; i < 46; i++) {
    const sx = 50 + ((i * 197) % 980), sy = ust + 10 + ((i * 131) % (alt - ust - 60));
    c.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + i);
    daire(c, sx, sy, 1.5 + (i % 3), BEYAZ);
  }
  c.globalAlpha = 1;
  const ax = 540, ay = ust + 72;
  daire(c, ax, ay, 62, '#F4F1E6');
  for (const [dx, dy, r] of [[-20, -12, 12], [22, 16, 9], [10, -28, 6], [-26, 22, 7]]) daire(c, ax + dx, ay + dy, r, '#D9D4C2');
  const tepe = ust + 175, taban = alt - 140;
  c.save(); c.setLineDash([14, 12]); cizgi(c, [[50, tepe], [1030, tepe]], 4, 'rgba(255,255,255,0.6)'); c.restore();
  y.takimlar.forEach((tk, i) => {
    const x = 200 + i * 340;
    kutu(c, x - 70, taban + 74, 140, 14, 7, '#9AA0B5');
    const ry = ara(taban, tepe, tk.p);
    if (tk.p > 0.01) { c.save(); c.globalAlpha = 0.18; cizgi(c, [[x, taban + 70], [x, ry + 70]], 34, BEYAZ); c.restore(); }
    const sx = x + (tk.kayma > 0 ? Math.sin(t * 28) * 6 : 0);
    roket(c, sx, ry, 0.95, tk, t, y.asama === 'oyun' && tk.dur <= 0);
    hap(c, `${tk.no} · ${tk.ad} · ${tk.uyeler}`, x, alt - 22, 28, tk.renk.ana, INK);
    takimDurumu(c, tk, x + (i === 1 ? 0 : 0), ry - 120, { kayma: 'METEOR!', dur: 'DURDU!' });
  });
  takimOyunuKaplama(ust, alt);
}
function roket(c, x, y, s, tk, t, ucuyor) {
  const r = tk.renk;
  if (ucuyor) {
    const L = (50 + 30 * Math.sin(t * 40)) * s * (tk.nitro > 0 || tk.turbo > 0 || tk.roket > 0 ? 1.8 : 1) * (0.6 + Math.min(1, tk.hiz * 15));
    for (const [renk, k] of [['#FF6B2C', 1], [SARI, 0.7], [BEYAZ, 0.4]]) {
      c.fillStyle = renk; c.beginPath();
      c.moveTo(x - 22 * s * k, y + 62 * s); c.lineTo(x, y + 62 * s + L * k); c.lineTo(x + 22 * s * k, y + 62 * s); c.closePath(); c.fill();
    }
  }
  c.fillStyle = r.koyu;
  for (const e of [-1, 1]) { c.beginPath(); c.moveTo(x + e * 30 * s, y + 18 * s); c.lineTo(x + e * 60 * s, y + 70 * s); c.lineTo(x + e * 28 * s, y + 60 * s); c.closePath(); c.fill(); }
  c.beginPath();
  c.moveTo(x, y - 92 * s); c.quadraticCurveTo(x + 46 * s, y - 50 * s, x + 34 * s, y + 62 * s);
  c.lineTo(x - 34 * s, y + 62 * s); c.quadraticCurveTo(x - 46 * s, y - 50 * s, x, y - 92 * s);
  c.fillStyle = tk.dur > 0 ? '#CFF4FF' : BEYAZ; c.fill();
  c.beginPath(); c.moveTo(x, y - 92 * s); c.quadraticCurveTo(x + 28 * s, y - 66 * s, x + 34 * s, y - 46 * s); c.lineTo(x - 34 * s, y - 46 * s); c.quadraticCurveTo(x - 28 * s, y - 66 * s, x, y - 92 * s);
  c.fillStyle = r.ana; c.fill();
  daire(c, x, y - 4 * s, 24 * s, r.koyu); daire(c, x, y - 4 * s, 19 * s, '#BDEBFF');
  for (const e of [-1, 1]) daire(c, x + e * 7 * s, y - 6 * s, 3.5 * s, INK);
  c.fillStyle = r.ana; c.fillRect(x - 34 * s, y + 34 * s, 68 * s, 12 * s);
}

// ---- boyama yarışı
const BOYA_KOL = 8, BOYA_SAT = 6;
function kareBoya(y, k) {
  const bos = [], rakip = [];
  y.kareler.forEach((v, i) => { if (!v) bos.push(i); else if (v !== k.no) rakip.push(i); });
  const aday = bos.length ? bos : rakip;
  if (!aday.length) return;
  const i = rastgele(aday);
  y.kareler[i] = k.no; y.kareAni[i] = zaman();
}
function boyaCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  sahneZemin(c, ust, alt);
  const sayi = [0, 0, 0];
  for (const v of y.kareler) if (v) sayi[v - 1]++;
  y.takimlar.forEach((tk, i) => { tk.sayi = sayi[i]; takimEtiketi(c, tk, 200 + i * 340, ust + 36, `${sayi[i]} kare · ${tk.uyeler} kişi`); takimDurumu(c, tk, 200 + i * 340, ust + 128, { kayma: 'KURUDU!' }); });
  const gx = 70, gw = 940, gTop = ust + 150, gh = alt - 20 - gTop;
  const hw = gw / BOYA_KOL, hh = gh / BOYA_SAT;
  for (let i = 0; i < BOYA_KOL * BOYA_SAT; i++) {
    const cx = gx + (i % BOYA_KOL) * hw, cy = gTop + Math.floor(i / BOYA_KOL) * hh;
    kutu(c, cx + 5, cy + 5, hw - 10, hh - 10, 16, 'rgba(255,255,255,0.1)');
    const v = y.kareler[i];
    if (!v) continue;
    const ani = sinir((t - y.kareAni[i]) / 0.3, 0, 1);
    const k = 0.5 + 0.5 * ani, w = (hw - 10) * k, h = (hh - 10) * k;
    const tk = y.takimlar[v - 1];
    kutu(c, cx + hw / 2 - w / 2, cy + hh / 2 - h / 2, w, h, 16, tk.renk.ana);
    if (ani < 1) { c.globalAlpha = 1 - ani; daire(c, cx + hw / 2, cy + hh / 2, hw * 0.6 * ani, BEYAZ); c.globalAlpha = 1; }
  }
  takimOyunuKaplama(ust, alt);
}

// ---- basket atışı
function basketAt(y, k) {
  k.sayi = (k.sayi || 0) + 1;
  y.atislar.push({ k, t0: zaman() });
  Ses.pop();
}
function basketTopu(c, x, y, r) {
  daire(c, x, y, r, '#FF8A3D');
  c.lineWidth = Math.max(2, r * 0.12); c.strokeStyle = '#7A3300';
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke();
}
function basketCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  sahneZemin(c, ust, alt);
  const gy = alt - 24, potaY = ust + 250;
  kutu(c, 40, gy, 1000, 14, 7, '#C98A4B');
  y.takimlar.forEach((tk, i) => {
    const x = 200 + i * 340;
    takimEtiketi(c, tk, x, ust + 36, `${tk.sayi || 0} sayı · ${tk.uyeler} kişi`);
    // pota
    kutu(c, x - 72, potaY - 112, 144, 94, 10, BEYAZ);
    c.lineWidth = 5; c.strokeStyle = '#FF6B2C'; c.strokeRect(x - 30, potaY - 74, 60, 46);
    cizgi(c, [[x, gy], [x, potaY - 18]], 10, '#9AA0B5');
    for (let j = 0; j < 5; j++) { const nx = x - 44 + j * 22; cizgi(c, [[nx, potaY], [x - 28 + j * 14, potaY + 56]], 3, 'rgba(255,255,255,0.85)'); }
    c.lineWidth = 7; c.strokeStyle = '#FF6B2C'; c.beginPath(); c.ellipse(x, potaY, 50, 11, 0, 0, Math.PI * 2); c.stroke();
    // atış göstergesi
    const mx = x + 110, my0 = gy - 250, mh = 220;
    kutu(c, mx - 14, my0, 28, mh, 14, 'rgba(27,16,64,0.7)');
    if (tk.p > 0.02) kutu(c, mx - 10, my0 + 4 + (mh - 8) * (1 - tk.p), 20, (mh - 8) * tk.p, 10, tk.renk.ana);
    // robot ve top
    const s = 0.42;
    insan(c, x - 40, gy, s, tk.renk, { anahtar: 'basket' + tk.no, forma: true, numara: tk.no, dur: true, kolSol: 'yukari', kolSag: 'havada', goz: 'mutlu' });
    const ucuyor = y.atislar.some((a) => a.k === tk && t - a.t0 < 0.8);
    if (!ucuyor) basketTopu(c, x - 40, gy - 410 * s + Math.sin(t * 8) * 4 * tk.p, 24);
    takimDurumu(c, tk, x, ust + 128, { kayma: 'TOP KAYDI!' });
  });
  for (const a of y.atislar) {
    const u = (t - a.t0) / 0.8;
    const i = a.k.no - 1, x = 200 + i * 340;
    if (u < 1) {
      const x0 = x - 40, y0 = gy - 410 * 0.42, x1 = x, y1 = potaY - 10;
      basketTopu(c, ara(x0, x1, u), ara(y0, y1, u) - Math.sin(u * Math.PI) * 160, 24);
    } else if (u < 2) {
      c.globalAlpha = 2 - u;
      yazi(c, '+1', x + 70, potaY - 130 - (u - 1) * 40, 54, a.k.renk.ana, { golge: true });
      c.globalAlpha = 1;
    }
  }
  y.atislar = y.atislar.filter((a) => t - a.t0 < 1.6);
  takimOyunuKaplama(ust, alt);
}

// ---- yağlı güreş
function guresCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  sahneZemin(c, ust, alt);
  const gy = alt - 80;
  c.fillStyle = '#2FA35A'; c.beginPath(); c.ellipse(540, gy, 480, 84, 0, 0, Math.PI * 2); c.fill();
  c.lineWidth = 6; c.strokeStyle = BEYAZ; c.beginPath(); c.ellipse(540, gy, 410, 66, 0, 0, Math.PI * 2); c.stroke();
  const merkez = 540 + y.o * 300;
  const [sari, mavi] = y.takimlar;
  const s = 0.8;
  for (const [tk, yan] of [[sari, -1], [mavi, 1]]) {
    const rs = tk.dev > 0 ? s * 1.2 : s;
    const yon = -yan;
    const zorla = y.asama === 'oyun' ? Math.min(0.14, tk.hiz * 1.4) : 0;
    const aci = yon * (0.3 + zorla) + (tk.kayma > 0 ? -yon * 0.3 * Math.abs(Math.sin(t * 9)) : 0);
    c.save(); c.translate(merkez + yan * 104 * (rs / s), gy); c.rotate(aci);
    const g = { ...gorunum('pehlivan' + tk.no), kadin: false, stil: tk.no === 1 ? 'kisa' : 'kivircik', biyik: true };
    insan(c, 0, 0, rs, tk.renk, { g, ciplak: true, forma: true, pantolon: '#5A3418', dur: true, golge: false, goz: tk.kayma > 0 ? 'acik' : 'mutlu' });
    kutu(c, -52 * rs, -196 * rs, 104 * rs, 110 * rs, 18 * rs, '#6B3E1E');
    kutu(c, -52 * rs, -196 * rs, 104 * rs, 14 * rs, 7 * rs, tk.renk.koyu);
    const kolRenk = { ana: g.ten, koyu: koyuRenk(g.ten, 0.05) };
    kol(c, 0, 0, rs, kolRenk, 1, [[-54 * yon, -296], [40 * yon, -300], [150 * yon, -312]], g.ten);
    kol(c, 0, 0, rs, kolRenk, 1, [[54 * yon, -296], [110 * yon, -288], [168 * yon, -292]], g.ten);
    c.restore();
  }
  for (const [tk, x, hiza] of [[sari, 60, 'left'], [mavi, 1020, 'right']]) {
    hap(c, `${tk.no} · ${tk.ad} · ${tk.uyeler} kişi`, x, ust + 40, 32, tk.renk.ana, INK, { hiza });
    const enIyi = [...tk.katki.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => S.kisiler.get(id)).filter(Boolean);
    enIyi.forEach((r, i) => yazi(c, kisalt(r.ad, 12), x + (hiza === 'left' ? 8 : -8), ust + 102 + i * 38, 28, BEYAZ, { hiza, w: 600, golge: true }));
    takimDurumu(c, tk, x + (hiza === 'left' ? 120 : -120), ust + 230, { kayma: 'KAYIYOR!', dev: 'DEV PEHLİVAN!' });
  }
  takimOyunuKaplama(ust, alt);
}

// ---- futbol
function futbolTopu(c, x, y, r) {
  daire(c, x, y, r, BEYAZ);
  c.fillStyle = INK;
  c.beginPath();
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; c.lineTo(x + Math.cos(a) * r * 0.38, y + Math.sin(a) * r * 0.38); }
  c.closePath(); c.fill();
  c.lineWidth = 2; c.strokeStyle = INK; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
}
function futbolCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  c.save(); yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.clip();
  for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#2E9E57' : '#36B163'; c.fillRect(30 + i * 102, ust - 10, 102, alt - ust + 20); }
  c.restore();
  const fy0 = ust + 120, fy1 = alt - 16, my = (fy0 + fy1) / 2;
  c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.strokeRect(70, fy0, 940, fy1 - fy0);
  c.beginPath(); c.moveTo(540, fy0); c.lineTo(540, fy1); c.stroke();
  c.beginPath(); c.arc(540, my, 80, 0, Math.PI * 2); c.stroke();
  c.strokeRect(70, my - 130, 110, 260); c.strokeRect(900, my - 130, 110, 260);
  for (const [gx, yon] of [[70, -1], [1010, 1]]) {
    const x0 = yon < 0 ? gx - 34 : gx;
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x0, my - 90, 34, 180);
    c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.6)';
    for (let k = 0; k <= 6; k++) { c.beginPath(); c.moveTo(x0, my - 90 + k * 30); c.lineTo(x0 + 34, my - 90 + k * 30); c.stroke(); }
    c.lineWidth = 7; c.strokeStyle = BEYAZ; c.strokeRect(x0, my - 90, 34, 180);
  }
  const [sari, mavi] = y.takimlar;
  // skor tabelası
  kutu(c, 300, ust + 6, 480, 88, 26, 'rgba(27,16,64,0.88)');
  hap(c, sari.ad, 340, ust + 50, 30, sari.renk.ana, INK, { hiza: 'left' });
  hap(c, mavi.ad, 740, ust + 50, 30, mavi.renk.ana, INK, { hiza: 'right' });
  yazi(c, `${y.goller[0]} - ${y.goller[1]}`, 540, ust + 72, 64, BEYAZ, { golge: true });
  yazi(c, `${sari.uyeler} kişi`, 80, ust + 54, 28, BEYAZ, { hiza: 'left', w: 600, golge: true });
  yazi(c, `${mavi.uyeler} kişi`, 1000, ust + 54, 28, BEYAZ, { hiza: 'right', w: 600, golge: true });
  const o = y.golAtan ? Math.sign(y.o || (y.golAtan === sari ? 1 : -1)) * 1.06 : y.o;
  const bx = 540 + o * 452, by = my + 46;
  const s = 0.5, adim = Math.floor(t * 7), faz = (t * 7) % 1, kosuyor = y.asama === 'oyun' && !y.golAtan;
  insan(c, bx - 72, by + 26, s, sari.renk, { anahtar: 'futbol1', forma: true, numara: 10, adim, faz, dur: !kosuyor || sari.kayma > 0, kolSol: 'asagi', kolSag: 'asagi' });
  insan(c, bx + 72, by + 26, s, mavi.renk, { anahtar: 'futbol2', forma: true, numara: 9, adim: adim + 1, faz, dur: !kosuyor || mavi.kayma > 0, kolSol: 'asagi', kolSag: 'asagi' });
  futbolTopu(c, bx, by + Math.abs(Math.sin(t * 9)) * -6, 24);
  takimDurumu(c, sari, 220, fy0 + 40, { kayma: 'KAYDI!', dev: 'YILDIZ!' });
  takimDurumu(c, mavi, 860, fy0 + 40, { kayma: 'KAYDI!', dev: 'YILDIZ!' });
  takimOyunuKaplama(ust, alt);
}

// ---- kartopu savaşı
function kartopuAt(y, k, dev = false) {
  const rakip = y.takimlar.find((x) => x !== k);
  const solda = k.no === 1;
  y.toplar.push({ x0: solda ? 220 : 860, x1: solda ? 760 + rnd(160) : 160 + rnd(160), y1: 0.25 + Math.random() * 0.5, t0: zaman(), dev, renk: k.renk.ana });
  if (y.toplar.length > 40) y.toplar.shift();
  return rakip;
}
function kardanDuvar(c, x, gy, tk) {
  const bloklar = 12, var_ = Math.ceil(sinir(tk.can, 0, 1) * bloklar - 1e-6);
  for (let i = 0; i < var_; i++) {
    const sira = Math.floor(i / 4), kol_ = i % 4;
    const bx = x - 132 + kol_ * 66 + (sira % 2 ? 33 : 0) - (sira % 2 && kol_ === 3 ? 66 * 4 : 0);
    kutu(c, bx, gy - (sira + 1) * 50, 62, 46, 12, '#F4FBFF');
    c.lineWidth = 3; c.strokeStyle = '#B9DFF2'; yol(c, bx, gy - (sira + 1) * 50, 62, 46, 12); c.stroke();
  }
  cizgi(c, [[x, gy - 150], [x, gy - 250]], 6, '#8A5A2B');
  c.fillStyle = tk.renk.ana; c.beginPath(); c.moveTo(x, gy - 250); c.lineTo(x + (tk.no === 1 ? 60 : -60), gy - 232); c.lineTo(x, gy - 214); c.closePath(); c.fill();
}
function kartopuCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  const g = c.createLinearGradient(0, ust, 0, alt);
  g.addColorStop(0, '#8FD3FF'); g.addColorStop(1, '#E8F6FF');
  yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.fillStyle = g; c.fill();
  c.save(); yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.clip();
  c.fillStyle = BEYAZ; c.beginPath(); c.ellipse(540, alt + 40, 720, 170, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 40; i++) {
    const fx = 40 + ((i * 173 + t * 30 * (1 + (i % 3))) % 1000), fy = ust + ((i * 97 + t * 60 * (1 + (i % 2))) % (alt - ust));
    daire(c, fx, fy, 3 + (i % 3), 'rgba(255,255,255,0.9)');
  }
  c.restore();
  const gy = alt - 60;
  const [sari, mavi] = y.takimlar;
  for (const [tk, x, rx, hiza, lx] of [[sari, 250, [140, 330], 'left', 60], [mavi, 830, [750, 940], 'right', 1020]]) {
    const yon = tk.no === 1 ? 1 : -1;
    rx.forEach((robX, j) => {
      const at = y.asama === 'oyun' && tk.kayma <= 0 && Math.sin(t * (6 + tk.hiz * 60) + j * 2) > 0.6;
      insan(c, robX, gy - 30, 0.44, tk.renk, { anahtar: `kar${tk.no}${j}`, forma: true, dur: true, golge: false, kolSol: at ? (yon > 0 ? 'bel' : 'havada') : 'bel', kolSag: at ? (yon > 0 ? 'havada' : 'bel') : 'bel', goz: 'mutlu' });
    });
    kardanDuvar(c, x, gy, tk);
    hap(c, `${tk.no} · ${tk.ad} · ${tk.uyeler} kişi`, lx, ust + 40, 32, tk.renk.ana, INK, { hiza });
    const bw = 300, bx = hiza === 'left' ? lx : lx - bw;
    kutu(c, bx, ust + 82, bw, 26, 13, 'rgba(27,16,64,0.6)');
    if (tk.can > 0) kutu(c, bx + 3, ust + 85, Math.max(20, (bw - 6) * sinir(tk.can, 0, 1)), 20, 10, tk.renk.ana);
    yazi(c, `DUVAR %${Math.max(0, Math.round(tk.can * 100))}`, hiza === 'left' ? bx : bx + bw, ust + 146, 28, INK, { hiza });
    takimDurumu(c, tk, hiza === 'left' ? 200 : 880, ust + 200, { kayma: 'KAYDI!', dur: 'DONDU!' });
  }
  for (const b of y.toplar) {
    const u = (t - b.t0) / 0.7;
    if (u < 0 || u > 1) continue;
    const yy = ara(gy - 170, ara(gy - 150, gy - 50, b.y1), u) - Math.sin(u * Math.PI) * 140;
    daire(c, ara(b.x0, b.x1, u), yy, b.dev ? 34 : 13, BEYAZ);
    c.lineWidth = 2; c.strokeStyle = '#B9DFF2'; c.beginPath(); c.arc(ara(b.x0, b.x1, u), yy, b.dev ? 34 : 13, 0, Math.PI * 2); c.stroke();
  }
  y.toplar = y.toplar.filter((b) => t - b.t0 < 0.75);
  takimOyunuKaplama(ust, alt);
}

// ---- kayık yarışı
function kayikCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  const g = c.createLinearGradient(0, ust, 0, alt);
  g.addColorStop(0, '#2F86EA'); g.addColorStop(1, '#0E3A8C');
  yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.fillStyle = g; c.fill();
  c.save(); yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.clip();
  c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.16)';
  for (let row = 0; row < 16; row++) {
    const yy = ust + (row + 0.5) * (alt - ust) / 16;
    c.beginPath();
    for (let x = 30; x <= 1050; x += 18) { const v = Math.sin(x * 0.028 + t * 2 + row * 1.3) * 5; if (x === 30) c.moveTo(x, yy + v); else c.lineTo(x, yy + v); }
    c.stroke();
  }
  c.restore();
  const seritH = (alt - ust) / 3, basX = 60, bitisX = 1010;
  for (let i = 0; i < 3; i++) {
    const tk = y.takimlar[i], sy = ust + i * seritH;
    if (i > 0) for (let x = 50; x < 1030; x += 46) daire(c, x, sy, 7, x % 92 < 46 ? '#FF5A5A' : BEYAZ);
    const kare = 22;
    for (let r = 0; r * kare < seritH - 8; r++) for (let q = 0; q < 2; q++) { c.fillStyle = (r + q) % 2 ? INK : BEYAZ; c.fillRect(bitisX - 44 + q * kare, sy + 4 + r * kare, kare, Math.min(kare, seritH - 8 - r * kare)); }
    const s = sinir((seritH - 50) / 230, 0.4, 0.85);
    const x = basX + 160 * s + tk.p * (bitisX - 60 - basX - 330 * s);
    const yy = sy + seritH * 0.72 + Math.sin(t * 3 + i) * 4;
    kayik(c, x, yy, s, tk, t, y.asama === 'oyun' ? tk.hiz : 0);
    const w = hap(c, `${tk.no} · ${tk.ad}`, 60, sy + 34, 32, tk.renk.ana, INK, { hiza: 'left' });
    yazi(c, `${tk.uyeler} kişi`, 60 + w + 14, sy + 46, 30, BEYAZ, { hiza: 'left', w: 600, golge: true });
    takimDurumu(c, tk, 880, sy + 46, { kayma: 'DALGA!', dur: 'DURDU!', turbo: 'MOTOR!' });
  }
  takimOyunuKaplama(ust, alt);
}
function kayik(c, x, y, s, tk, t, hiz) {
  const g = gorunum('kayik' + tk.no);
  const hs = s * 0.62;
  const gy = y + 150 * hs;
  const faz = hiz > 0 && tk.dur <= 0 ? t * (3 + hiz * 70) : 0;
  const ileri = Math.cos(faz);
  const el = [70 + 50 * ileri, -228 - 18 * Math.sin(faz)];
  insan(c, x - 10 * s, gy, hs, tk.renk, { g, forma: true, dur: true, golge: false, bacaksiz: true });
  for (const k of [-6, 6]) {
    const omuz = [54 + k, -296];
    const kolSon = kol(c, x - 10 * s, gy, hs, tk.renk, 1, [omuz, [(omuz[0] + el[0]) / 2, -250], el], g.ten);
    const ucX = kolSon[0] - 150 * s * (0.6 + 0.4 * ileri), ucY = y + 46 * s;
    cizgi(c, [[kolSon[0], kolSon[1]], [ucX, ucY]], 7 * s, '#8A5A2B');
    c.fillStyle = '#C98A4B'; c.beginPath(); c.ellipse(ucX, ucY, 22 * s, 9 * s, -0.5, 0, Math.PI * 2); c.fill();
    if (hiz > 0.01) { c.globalAlpha = 0.7; daire(c, ucX - 10 * s, ucY + 6 * s, 9 * s * (0.5 + Math.abs(ileri)), BEYAZ); c.globalAlpha = 1; }
  }
  c.save(); c.translate(x, y);
  if (tk.kayma > 0) c.rotate(Math.sin(t * 14) * 0.08);
  c.fillStyle = tk.renk.koyu; c.beginPath();
  c.moveTo(-170 * s, -10 * s); c.lineTo(170 * s, -10 * s); c.quadraticCurveTo(150 * s, 46 * s, 90 * s, 50 * s); c.lineTo(-120 * s, 50 * s); c.quadraticCurveTo(-160 * s, 40 * s, -170 * s, -10 * s); c.closePath(); c.fill();
  c.fillStyle = tk.renk.ana; c.fillRect(-160 * s, -10 * s, 320 * s, 16 * s);
  c.fillStyle = BEYAZ; c.globalAlpha = 0.5; c.fillRect(-120 * s, 22 * s, 220 * s, 5 * s); c.globalAlpha = 1;
  daire(c, 110 * s, 22 * s, 16 * s, BEYAZ); yazi(c, String(tk.no), 110 * s, 31 * s, 24 * s, INK);
  c.restore();
  if (hiz > 0.01) { c.globalAlpha = Math.min(0.8, hiz * 12); for (let k = 0; k < 3; k++) cizgi(c, [[x - 190 * s - k * 30 * s, y + (20 + k * 12) * s], [x - 240 * s - k * 50 * s, y + (24 + k * 12) * s]], 5 * s, BEYAZ); c.globalAlpha = 1; }
}

// ---- duvar tırmanışı
function tirmanmaCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  sahneZemin(c, ust, alt);
  const duvarUst = ust + 120, duvarAlt = alt - 16;
  y.takimlar.forEach((tk, i) => {
    const x = 200 + i * 340;
    const dg = c.createLinearGradient(x - 130, 0, x + 130, 0);
    dg.addColorStop(0, '#3B3570'); dg.addColorStop(0.5, '#4A4488'); dg.addColorStop(1, '#2E2960');
    yol(c, x - 130, duvarUst, 260, duvarAlt - duvarUst, 22); c.fillStyle = dg; c.fill();
    for (let k = 0; k < 22; k++) {
      const hx = x - 105 + ((k * 73 + i * 31) % 210), hy = duvarUst + 30 + ((k * 97) % (duvarAlt - duvarUst - 60));
      c.fillStyle = ['#FFD23F', '#FF6FAE', '#3FE0EA', '#62E68B', '#FF9F43'][k % 5];
      c.beginPath(); c.ellipse(hx, hy, 11, 8, k, 0, Math.PI * 2); c.fill();
    }
    cizgi(c, [[x - 120, duvarUst + 50], [x + 120, duvarUst + 50]], 4, 'rgba(255,255,255,0.7)');
    yazi(c, 'ZİRVE', x, duvarUst + 40, 24, BEYAZ, { golge: true });
    takimEtiketi(c, tk, x, ust + 36, `%${Math.round(tk.p * 100)} · ${tk.uyeler} kişi`);
    const s = 0.4;
    const gy = ara(duvarAlt - 6, duvarUst + 60 + 440 * s, tk.p);
    cizgi(c, [[x + 6, duvarUst + 10], [x + 6, gy - 300 * s]], 3, 'rgba(255,255,255,0.85)');
    const tirmaniyor = y.asama === 'oyun' && tk.hiz > 0.006 && tk.dur <= 0;
    const adim = tirmaniyor ? Math.floor(t * (3 + tk.hiz * 60)) : 0;
    insan(c, x + (tk.kayma > 0 ? Math.sin(t * 30) * 5 : 0), gy, s, tk.renk, {
      anahtar: 'tirman' + tk.no, forma: true, dur: !tirmaniyor, adim, faz: 0.6, golge: false,
      kolSol: adim % 2 ? 'yukari' : 'havada', kolSag: adim % 2 ? 'havada' : 'yukari', goz: tk.kayma > 0 ? 'acik' : 'mutlu',
    });
    takimDurumu(c, tk, x, ust + 128, { kayma: 'KAYIYOR!', turbo: 'HIZLI!' });
  });
  takimOyunuKaplama(ust, alt);
}

// ---- dans düellosu
function dansCiz() {
  const c = ctx, y = S.oyun, t = zaman();
  const { ust, alt } = sahneAlani();
  sahneZemin(c, ust, alt);
  c.save(); yol(c, 30, ust - 10, 1020, alt - ust + 20, 28); c.clip();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const lx = 540 + Math.sin(t * 0.8 + i * 1.7) * 420, ly = alt - 60 + Math.cos(t + i) * 20;
    const g = c.createRadialGradient(lx, ly, 0, lx, ly, 140);
    const rr = ['255,210,63', '63,224,234', '255,111,174', '98,230,139', '255,159,67'][i];
    g.addColorStop(0, `rgba(${rr},0.35)`); g.addColorStop(1, `rgba(${rr},0)`);
    c.fillStyle = g; c.beginPath(); c.ellipse(lx, ly, 140, 50, 0, 0, Math.PI * 2); c.fill();
  }
  c.restore();
  const [sari, mavi] = y.takimlar;
  // alkış metresi: sarı öndeyse işaret sola, mavi öndeyse sağa kayar
  const by = ust + 110, bw = 820, bx = 540 - bw / 2;
  kutu(c, bx, by, bw, 34, 17, 'rgba(255,255,255,0.12)');
  kutu(c, bx, by, bw / 2, 34, 17, 'rgba(255,210,63,0.35)');
  kutu(c, bx + bw / 2, by, bw / 2, 34, 17, 'rgba(63,224,234,0.35)');
  const mx = 540 - sinir(y.o, -1, 1) * (bw / 2);
  daire(c, mx, by + 17, 30, BEYAZ); yildiz(c, mx, by + 17, 20, SARI);
  hap(c, `1 · ${sari.ad} · ${sari.uyeler}`, bx, by - 30, 30, sari.renk.ana, INK, { hiza: 'left' });
  hap(c, `2 · ${mavi.ad} · ${mavi.uyeler}`, bx + bw, by - 30, 30, mavi.renk.ana, INK, { hiza: 'right' });
  yazi(c, 'ALKIŞ METRESİ', 540, by + 82, 28, BEYAZ, { golge: true });
  const gy = alt - 40;
  for (const [tk, xs] of [[sari, [140, 270, 400]], [mavi, [680, 810, 940]]]) {
    const kisiler = tk.son.length ? tk.son.slice(0, 3) : [null, null, null];
    const coskulu = y.asama === 'oyun' && tk.kayma <= 0 && tk.dur <= 0;
    kisiler.forEach((k, j) => {
      const x = xs[j] + (tk.no === 1 ? 0 : 0);
      const s = (tk.dev > 0 && j === 1 ? 0.62 : 0.5);
      const ritim = Math.floor(t * 2.6 + j * 0.5);
      const pozlar = [['yukari', 'havada'], ['bel', 'salla'], ['havada', 'yukari'], ['salla2', 'bel']];
      const [kl, kr] = coskulu ? pozlar[(ritim + j) % 4] : ['bel', 'bel'];
      const zipla = coskulu ? Math.abs(Math.sin(t * 5.2 + j)) * 22 : 0;
      const g = k ? gorunum(k.id) : gorunum(`dans${tk.no}${j}`);
      insan(c, x, gy, s, tk.renk, { g, forma: true, zipla, adim: ritim, faz: 0.5, kolSol: kl, kolSag: kr, goz: tk.kayma > 0 ? 'acik' : 'mutlu',
        gozluk: k && k.gozluk, fes: k && k.fes });
      if (k) isimEtiketi(c, k, x, gy - zipla - s * 500 - (j % 2 ? 36 : 0), 24, { uzun: 8 });
    });
    takimDurumu(c, tk, tk.no === 1 ? 270 : 810, by + 140, { kayma: 'ŞAŞIRDI!', dev: 'DEV DANSÇI!' });
  }
  takimOyunuKaplama(ust, alt);
}

// ---- bayraklar
function bayrakCiz(c, b, x, y, w, h) {
  c.save();
  yol(c, x, y, w, h, 10); c.clip();
  if (b.d) b.d.forEach((renk, i) => { c.fillStyle = renk; c.fillRect(x + (i * w) / b.d.length - 0.5, y, w / b.d.length + 1, h); });
  else if (b.y) { const n = b.y.length; b.y.forEach((renk, i) => { c.fillStyle = renk; c.fillRect(x, y + (i * h) / n - 0.5, w, h / n + 1); }); }
  else if (b.hac) {
    c.fillStyle = b.hac[0]; c.fillRect(x, y, w, h);
    const cx = x + w * 0.36, cy = y + h / 2;
    const kalin = h * (b.hac[2] ? 0.25 : 0.2);
    c.fillStyle = b.hac[1]; c.fillRect(cx - kalin / 2, y, kalin, h); c.fillRect(x, cy - kalin / 2, w, kalin);
    if (b.hac[2]) { const ince = h * 0.125; c.fillStyle = b.hac[2]; c.fillRect(cx - ince / 2, y, ince, h); c.fillRect(x, cy - ince / 2, w, ince); }
  } else if (b.ciz === 'tr') {
    c.fillStyle = '#E30A17'; c.fillRect(x, y, w, h);
    const G = h;
    daire(c, x + 0.5 * G, y + G / 2, 0.25 * G, BEYAZ);
    daire(c, x + 0.5625 * G, y + G / 2, 0.2 * G, '#E30A17');
    yildizAcili(c, x + 0.86 * G, y + G / 2, 0.125 * G, Math.PI, BEYAZ);
  } else if (b.ciz === 'jp') { c.fillStyle = BEYAZ; c.fillRect(x, y, w, h); daire(c, x + w / 2, y + h / 2, h * 0.3, '#BC002D'); }
  else if (b.ciz === 'bd') { c.fillStyle = '#006A4E'; c.fillRect(x, y, w, h); daire(c, x + w * 0.45, y + h / 2, h / 3, '#F42A41'); }
  else if (b.ciz === 'ch') {
    c.fillStyle = '#DA291C'; c.fillRect(x, y, w, h);
    const k = h * 0.6, kk = h * 0.19;
    c.fillStyle = BEYAZ; c.fillRect(x + w / 2 - kk / 2, y + h / 2 - k / 2, kk, k); c.fillRect(x + w / 2 - k / 2, y + h / 2 - kk / 2, k, kk);
  } else if (b.ciz === 'gr') {
    const sh = h / 9;
    for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? BEYAZ : '#0D5EAF'; c.fillRect(x, y + i * sh - 0.5, w, sh + 1); }
    c.fillStyle = '#0D5EAF'; c.fillRect(x, y, sh * 5, sh * 5);
    c.fillStyle = BEYAZ; c.fillRect(x + sh * 2, y, sh, sh * 5); c.fillRect(x, y + sh * 2, sh * 5, sh);
  }
  c.restore();
  c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.6)'; yol(c, x, y, w, h, 10); c.stroke();
}

// ---- soru oyunlarının ortak çizimi
function soruCiz() {
  const c = ctx, q = S.soru, t = zaman();
  const ust = D.sahneUst + 6, alt = D.sahneAlt + 86, x0 = 44, w = 992;
  cam(c, x0, ust, w, alt - ust, 36, 0.8);
  const def = q.def;
  if (q.asama === 'giris') {
    yazi(c, def.baslik, 540, ust + 200, 92, SARI, { golge: true, maxW: w - 80 });
    paragraf(c, def.altBaslik, 540, ust + 290, 50, BEYAZ, w - 100, { w: 700 });
    yazi(c, `${q.toplam} ${def.anket ? 'oylama' : 'soru'}`, 540, ust + 400, 40, LILA, { w: 600 });
    yazi(c, String(Math.max(1, Math.ceil(q.bitis - t))), 540, alt - 90, 130, SARI, { golge: true });
    return;
  }
  if (q.asama === 'sonuc') { soruSonucCiz(c, q, ust, alt); return; }
  const s = q.soru;
  hap(c, `${q.idx} / ${q.toplam}`, x0 + 28, ust + 46, 30, SARI, INK, { hiza: 'left' });
  if (q.cift > 1) hap(c, 'ÇİFT PUAN', x0 + w - 28, ust + 46, 28, PEMBE, INK, { hiza: 'right' });
  const oran = q.asama === 'soru' ? sinir((q.bitis - t) / q.sure, 0, 1) : 0;
  kutu(c, x0 + 190, ust + 34, 560, 22, 11, 'rgba(255,255,255,0.12)');
  if (oran > 0.01) kutu(c, x0 + 190, ust + 34, 560 * oran, 22, 11, oran < 0.25 ? PEMBE : YESIL);
  const ic = { x: x0 + 30, y: ust + 96, w: w - 60, h: alt - ust - 96 - 120 };
  const cevap = q.asama === 'cevap';
  ({ secenek: secenekCiz, bayrak: secenekCiz, dy: dyCiz, kelime: kelimeCiz, buyuk: buyukCiz, atasozu: atasozuCiz,
    renk: renkCiz, kactane: kacTaneCiz, hafiza: hafizaCiz, yazma: yazmaCiz, anket: anketCiz, saat: secenekCiz, encok: secenekCiz,
    eksik: eksikCiz, isim: isimCiz })[s.cizim](c, q, s, ic, t, cevap);
  bilenlerCiz(c, q, x0, alt - 108, w, t);
}
function cevapRozeti(c, metin, y) {
  const w = hap(c, metin, 540, y, 50, YESIL, INK, { h: 76 });
  return w;
}
function secenekCiz(c, q, s, ic, t, cevap) {
  let yy = ic.y;
  if (s.cizim === 'bayrak') {
    const bh = Math.min(230, ic.h - 3 * 96), bw = bh * 1.5;
    bayrakCiz(c, s.bayrak, 540 - bw / 2, ic.y + 6, bw, bh);
    yy = ic.y + bh + 30;
  } else if (s.cizim === 'saat') {
    const r = Math.min(130, (ic.h - 3 * 96) / 2);
    saatCiz(c, 540, ic.y + 10 + r, r, s.saat.h, s.saat.m);
    yy = ic.y + 2 * r + 36;
  } else if (s.cizim === 'encok') {
    const ah = Math.max(160, ic.h - 3 * 100);
    sekilAlani(c, s.sekiller, ic.x, ic.y, ic.w, ah, null, cevap);
    yy = ic.y + ah + 14;
  } else {
    const son = paragraf(c, s.metin, 540, ic.y + 52, 50, BEYAZ, ic.w - 20, { maxSatir: 3 });
    yy = son + 40;
  }
  const kalan = ic.y + ic.h - yy;
  const sh = Math.min(92, (kalan - 24) / 3);
  const say = [0, 0, 0];
  for (const v of q.cevaplayan.values()) if (typeof v === 'number') say[v]++;
  s.secenekler.forEach((ad, i) => {
    const y = yy + i * (sh + 12);
    const elendi = q.elenen.has(i), dogru = cevap && i === s.dogru;
    c.globalAlpha = elendi || (cevap && !dogru) ? 0.35 : 1;
    kutu(c, ic.x + 20, y, ic.w - 40, sh, sh / 2, dogru ? YESIL : 'rgba(255,255,255,0.12)');
    daire(c, ic.x + 20 + sh / 2, y + sh / 2, sh / 2 - 8, dogru ? INK : SARI);
    yazi(c, 'ABC'[i], ic.x + 20 + sh / 2, y + sh / 2 + 14, 40, dogru ? YESIL : INK);
    yazi(c, ad, ic.x + 20 + sh + 16, y + sh / 2 + 14, 40, dogru ? INK : BEYAZ, { hiza: 'left', maxW: ic.w - sh - 200 });
    if (cevap) yazi(c, `${say[i]} kişi`, ic.x + ic.w - 44, y + sh / 2 + 12, 32, dogru ? INK : LILA, { hiza: 'right', w: 600 });
    if (elendi) cizgi(c, [[ic.x + 40, y + sh / 2], [ic.x + ic.w - 60, y + sh / 2]], 6, PEMBE);
    c.globalAlpha = 1;
  });
}
function dyCiz(c, q, s, ic, t, cevap) {
  paragraf(c, s.metin, 540, ic.y + ic.h * 0.32, 60, BEYAZ, ic.w - 20, { maxSatir: 3, orta: true });
  const say = [0, 0];
  for (const v of q.cevaplayan.values()) say[v ? 0 : 1]++;
  [['D', 'DOĞRU', YESIL, true], ['Y', 'YANLIŞ', '#FF5A5A', false]].forEach(([harf, ad, renk, deger], i) => {
    const x = ic.x + 30 + i * (ic.w / 2), w = ic.w / 2 - 60, y = ic.y + ic.h - 150;
    const dogru = cevap && s.dogru === deger;
    c.globalAlpha = cevap && !dogru ? 0.35 : 1;
    kutu(c, x, y, w, 120, 30, dogru ? renk : 'rgba(255,255,255,0.12)');
    hap(c, harf, x + 60, y + 60, 48, renk, INK, { h: 80 });
    yazi(c, ad, x + 120, y + 76, 52, dogru ? INK : BEYAZ, { hiza: 'left' });
    if (cevap) yazi(c, `${say[i]} kişi`, x + w - 24, y + 74, 30, dogru ? INK : LILA, { hiza: 'right', w: 600 });
    c.globalAlpha = 1;
  });
}
function harfKutulari(c, harfler, acik, y, maxW, renk, cevap) {
  const n = harfler.length;
  const kw = Math.min(86, maxW / n - 10);
  const x0 = 540 - (n * (kw + 10) - 10) / 2;
  harfler.forEach((h, i) => {
    const x = x0 + i * (kw + 10);
    kutu(c, x, y, kw, kw * 1.15, 14, cevap ? YESIL : 'rgba(255,255,255,0.14)');
    if (cevap || i < acik) yazi(c, h, x + kw / 2, y + kw * 0.8, kw * 0.7, cevap ? INK : renk);
    else cizgi(c, [[x + kw * 0.25, y + kw * 0.9], [x + kw * 0.75, y + kw * 0.9]], 5, LILA);
  });
}
function kelimeCiz(c, q, s, ic, t, cevap) {
  hap(c, `İPUCU: ${s.kategori}`, 540, ic.y + 30, 32, CAMGOBEGI, INK);
  const harf = s.karisik, n = harf.length;
  const kw = Math.min(92, (ic.w - 20) / n - 10);
  const x0 = 540 - (n * (kw + 10) - 10) / 2;
  harf.forEach((h, i) => {
    const x = x0 + i * (kw + 10), y = ic.y + 90 + Math.sin(t * 3 + i) * 6;
    kutu(c, x, y, kw, kw * 1.15, 16, SARI);
    yazi(c, h, x + kw / 2, y + kw * 0.82, kw * 0.72, INK);
  });
  yazi(c, `${n} harf`, 540, ic.y + 90 + kw * 1.15 + 54, 32, LILA, { w: 600 });
  harfKutulari(c, [...s.kelime], acikHarf(q), ic.y + ic.h - 130, ic.w - 20, BEYAZ, cevap);
}
function atasozuCiz(c, q, s, ic, t, cevap) {
  const harf = [...s.kelime], acik = acikHarf(q);
  const bosluk = cevap ? s.kelime : harf.map((h, i) => (i < acik ? h : '_')).join(' ');
  paragraf(c, s.kalip.replace('_', bosluk), 540, ic.y + ic.h * 0.36, 62, BEYAZ, ic.w - 20, { maxSatir: 4, orta: true });
  if (cevap) cevapRozeti(c, s.kelime, ic.y + ic.h - 60);
  else yazi(c, `Eksik kelime ${harf.length} harfli`, 540, ic.y + ic.h - 50, 34, LILA, { w: 600 });
}
function buyukCiz(c, q, s, ic, t, cevap) {
  if (s.cevapIfade && !cevap) yazi(c, 'Tersten yazılmış kelimeyi düz yaz', 540, ic.y + 50, 40, LILA, { w: 700 });
  if (s.tur === 'sayi' && !cevap && s.ifade.includes(',')) yazi(c, 'Sıradaki sayı ne?', 540, ic.y + 50, 40, LILA, { w: 700 });
  yazi(c, cevap ? (s.cevapIfade || s.ifade.replace('?', s.gorunen)) : s.ifade, 540, ic.y + ic.h * 0.55, 150, cevap ? YESIL : BEYAZ, { golge: true, maxW: ic.w - 40 });
  if (!cevap && q.ipucu > 0 && s.ipucuMetin) hap(c, `İPUCU: ${s.ipucuMetin}`, 540, ic.y + ic.h - 40, 34, CAMGOBEGI, INK);
}
function renkCiz(c, q, s, ic, t, cevap) {
  yazi(c, 'Yazının RENGİ ne?', 540, ic.y + 50, 46, LILA, { w: 700 });
  yazi(c, s.kelime, 540, ic.y + ic.h * 0.62, 170, s.renk, { maxW: ic.w - 40 });
  if (cevap) cevapRozeti(c, `RENK: ${s.gorunen}`, ic.y + ic.h - 30);
  else if (q.ipucu > 0) hap(c, `İPUCU: ${s.ipucuMetin}`, 540, ic.y + ic.h - 30, 34, CAMGOBEGI, INK);
}
function sekilCiz(c, sekil, x, y, r, renk, aci = 0) {
  if (sekil === 'yildiz') yildizAcili(c, x, y, r, -Math.PI / 2 + aci, renk);
  else if (sekil === 'kalp') kalp(c, x, y, r * 0.85, renk);
  else daire(c, x, y, r * 0.8, renk);
}
function kacTaneCiz(c, q, s, ic, t, cevap) {
  yazi(c, 'Kaç tane', 330, ic.y + 46, 44, BEYAZ, { hiza: 'right' });
  sekilCiz(c, s.hedef.sekil, 370, ic.y + 32, 24, s.hedef.renk);
  yazi(c, `${s.hedef.ad} var?`, 410, ic.y + 46, 44, s.hedef.renk, { hiza: 'left', maxW: 520 });
  const gy = ic.y + 80, gh = ic.h - 80 - (cevap || q.ipucu ? 70 : 10);
  const hw = ic.w / 8, hh = gh / 5;
  const r = Math.min(hw, hh) * 0.36;
  let no = 0;
  for (const sk of s.sekiller) {
    const x = ic.x + ((sk.h % 8) + 0.5 + sk.dx * 0.4) * hw, y = gy + (Math.floor(sk.h / 8) + 0.5 + sk.dy * 0.4) * hh;
    const hedef = sk.sekil === s.hedef.sekil && sk.renk === s.hedef.renk;
    if (cevap && !hedef) c.globalAlpha = 0.25;
    sekilCiz(c, sk.sekil, x, y, r, sk.renk, sk.aci);
    c.globalAlpha = 1;
    if (cevap && hedef) yazi(c, String(++no), x, y + 12, 32, INK);
  }
  if (cevap) cevapRozeti(c, `CEVAP: ${s.gorunen}`, ic.y + ic.h - 34);
  else if (q.ipucu > 0) hap(c, `İPUCU: ${s.ipucuMetin}`, 540, ic.y + ic.h - 34, 34, CAMGOBEGI, INK);
}
function hafizaCiz(c, q, s, ic, t, cevap) {
  const goster = t < q.basla + s.gosterSure;
  const r = [...s.rakamlar];
  const kw = Math.min(120, (ic.w - 20) / r.length - 14);
  const x0 = 540 - (r.length * (kw + 14) - 14) / 2, y = ic.y + ic.h * 0.3;
  r.forEach((d, i) => {
    const x = x0 + i * (kw + 14);
    const acik = goster || cevap || i < q.ipucu;
    kutu(c, x, y, kw, kw * 1.3, 18, cevap ? YESIL : acik ? SARI : 'rgba(255,255,255,0.14)');
    yazi(c, acik ? d : '?', x + kw / 2, y + kw * 0.95, kw * 0.85, acik ? INK : LILA);
  });
  if (goster) {
    yazi(c, 'AKLINDA TUT!', 540, ic.y + 60, 56, SARI, { golge: true });
    yazi(c, String(Math.ceil(q.basla + s.gosterSure - t)), 540, ic.y + ic.h - 40, 90, BEYAZ, { golge: true });
  } else if (!cevap) {
    yazi(c, 'ŞİMDİ YAZ!', 540, ic.y + 60, 56, YESIL, { golge: true });
    yazi(c, `${r.length} rakam, sırayla`, 540, ic.y + ic.h - 40, 36, LILA, { w: 600 });
  }
}
function yazmaCiz(c, q, s, ic, t, cevap) {
  yazi(c, 'Bu yazıyı aynen yaz:', 540, ic.y + 46, 42, LILA, { w: 700 });
  kutu(c, ic.x + 20, ic.y + 80, ic.w - 40, ic.h - 120, 26, '#FFF8E7');
  paragraf(c, s.metin, 540, ic.y + 80 + (ic.h - 120) / 2, 60, INK, ic.w - 100, { maxSatir: 3, orta: true });
  if (cevap && q.dogrular.length) yazi(c, `${q.dogrular.length} kişi yetişti!`, 540, ic.y + ic.h - 4, 34, YESIL, { golge: true });
}
function anketCiz(c, q, s, ic, t, cevap) {
  paragraf(c, s.metin, 540, ic.y + 56, 64, BEYAZ, ic.w - 20, { maxSatir: 2 });
  const [a, b] = q.oylar, top = a + b;
  const kazanan = cevap && top && a !== b ? (a > b ? 0 : 1) : -1;
  s.secenekler.forEach((ad, i) => {
    const w = ic.w / 2 - 30, x = ic.x + 10 + i * (w + 40), y = ic.y + 130, h = ic.h - 160;
    const oran = top ? q.oylar[i] / top : 0;
    const renk = i === 0 ? SARI : CAMGOBEGI;
    kutu(c, x, y, w, h, 30, 'rgba(255,255,255,0.1)');
    if (oran > 0) kutu(c, x, y + h * (1 - oran), w, h * oran, 30, renk);
    hap(c, String(i + 1), x + w / 2, y + 56, 44, renk, INK, { h: 70 });
    yazi(c, ad, x + w / 2, y + h / 2 + 20, 56, BEYAZ, { golge: true, maxW: w - 30 });
    yazi(c, top ? `%${Math.round(oran * 100)}` : '%0', x + w / 2, y + h / 2 + 96, 54, BEYAZ, { golge: true });
    yazi(c, `${q.oylar[i]} oy`, x + w / 2, y + h - 26, 32, BEYAZ, { w: 600, golge: true });
    if (kazanan === i) tac(c, x + w / 2, y + 22, 70);
  });
}
function saatCiz(c, x, y, r, h, m) {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#E4E0F5');
  daire(c, x, y, r + 10, SARI); daire(c, x, y, r, '#FFFFFF'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, uzun = i % 5 === 0;
    cizgi(c, [[x + Math.sin(a) * r * (uzun ? 0.84 : 0.9), y - Math.cos(a) * r * (uzun ? 0.84 : 0.9)], [x + Math.sin(a) * r * 0.96, y - Math.cos(a) * r * 0.96]], uzun ? 5 : 2, INK);
  }
  for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; yazi(c, String(i), x + Math.sin(a) * r * 0.68, y - Math.cos(a) * r * 0.68 + r * 0.08, r * 0.2, INK); }
  const sa = (((h % 12) + m / 60) / 12) * Math.PI * 2, da = (m / 60) * Math.PI * 2;
  cizgi(c, [[x, y], [x + Math.sin(sa) * r * 0.48, y - Math.cos(sa) * r * 0.48]], r * 0.085, INK);
  cizgi(c, [[x, y], [x + Math.sin(da) * r * 0.78, y - Math.cos(da) * r * 0.78]], r * 0.05, '#E5484D');
  daire(c, x, y, r * 0.07, INK);
}
function sekilAlani(c, sekiller, x0, y0, w, h, hedef, cevap) {
  const hw = w / 8, hh = h / 5, r = Math.min(hw, hh) * 0.36;
  for (const sk of sekiller) {
    const x = x0 + ((sk.h % 8) + 0.5 + sk.dx * 0.4) * hw, y = y0 + (Math.floor(sk.h / 8) + 0.5 + sk.dy * 0.4) * hh;
    sekilCiz(c, sk.sekil, x, y, r, sk.renk, sk.aci);
  }
}
function eksikCiz(c, q, s, ic, t, cevap) {
  yazi(c, 'Eksik harfleri tamamla', 540, ic.y + 50, 42, LILA, { w: 700 });
  const n = s.harfler.length, kw = Math.min(90, (ic.w - 20) / n - 10), x0 = 540 - (n * (kw + 10) - 10) / 2, y = ic.y + ic.h * 0.36;
  const acilan = new Set(s.gizli.slice(0, q.ipucu));
  s.harfler.forEach((h, i) => {
    const x = x0 + i * (kw + 10), gizli = s.gizli.includes(i) && !acilan.has(i);
    kutu(c, x, y, kw, kw * 1.2, 16, cevap ? YESIL : gizli ? 'rgba(255,255,255,0.14)' : SARI);
    if (cevap || !gizli) yazi(c, h, x + kw / 2, y + kw * 0.85, kw * 0.72, INK);
    else yazi(c, '?', x + kw / 2, y + kw * 0.85, kw * 0.6, LILA);
  });
  yazi(c, `${s.gizli.length - acilan.size} harf eksik`, 540, ic.y + ic.h - 40, 34, LILA, { w: 600 });
}
function isimCiz(c, q, s, ic, t, cevap) {
  kutu(c, 540 - 90, ic.y + 10, 180, 180, 36, SARI);
  yazi(c, s.harf, 540, ic.y + 150, 150, INK);
  hap(c, `${s.harf} harfiyle başlayan ${s.kategori}`, 540, ic.y + 240, 36, CAMGOBEGI, INK);
  const alinan = [...s.alinan.values()];
  if (cevap) {
    yazi(c, 'Örnek cevaplar:', 540, ic.y + 320, 34, LILA, { w: 600 });
    paragraf(c, s.gorunen, 540, ic.y + 380, 44, BEYAZ, ic.w - 40, { maxSatir: 2 });
  } else if (!alinan.length) yazi(c, 'İlk kelimeyi kim yazacak?', 540, ic.y + 340, 40, LILA, { w: 600 });
  else alinan.slice(-4).forEach((a, i) => yazi(c, `${kisalt(a.r.ad, 12)} → ${buyuk(a.ad)}`, 540, ic.y + 320 + i * 50, 38, BEYAZ, { w: 700, maxW: ic.w - 40 }));
}
function bilenlerCiz(c, q, x0, y, w, t) {
  if (q.def.anket) {
    yazi(c, `${q.oylar[0] + q.oylar[1]} kişi oy verdi`, 540, y + 64, 36, LILA, { w: 600 });
    return;
  }
  const cevap = q.asama === 'cevap';
  const herkes = !q.def.ilkN;
  if (herkes && !cevap) {
    const lider = soruSiralama()[0];
    yazi(c, `${q.cevaplayan.size} kişi cevap verdi${lider ? ` · Lider: ${kisalt(lider.r.ad, 10)} (${lider.puan})` : ''}`, 540, y + 64, 32, LILA, { w: 600, maxW: w - 40 });
    return;
  }
  const liste = q.dogrular.slice(0, 3);
  yazi(c, herkes ? 'İLK BİLENLER' : 'BİLENLER', x0 + 30, y + 34, 26, SARI, { hiza: 'left' });
  if (!liste.length) { yazi(c, cevap ? 'Kimse bilemedi' : 'İlk sen bil!', 540, y + 76, 34, LILA, { w: 600 }); return; }
  const puanlar = herkes ? [3, 1, 1] : [3, 2, 1];
  liste.forEach((r, i) => {
    const cw = 300, x = x0 + 30 + i * (cw + 16);
    kutu(c, x, y + 46, cw, 56, 28, i === 0 ? 'rgba(255,210,63,0.25)' : 'rgba(255,255,255,0.1)');
    avatar(c, r, x + 28, y + 74, 22);
    yazi(c, kisalt(r.ad, 10), x + 58, y + 84, 28, BEYAZ, { hiza: 'left', maxW: cw - 130 });
    yazi(c, `+${puanlar[i] * q.cift}`, x + cw - 16, y + 86, 32, SARI, { hiza: 'right' });
  });
}
function soruSonucCiz(c, q, ust, alt) {
  const def = q.def;
  if (def.anket) {
    yazi(c, 'OYLAMA SONUÇLARI', 540, ust + 90, 64, SARI, { golge: true });
    q.sonuclar.forEach((x, i) => {
      const y = ust + 170 + i * 110, [a, b] = x.oylar, top = a + b;
      kutu(c, 90, y, 900, 90, 30, 'rgba(255,255,255,0.1)');
      const kazanan = !top ? 'oy yok' : a === b ? 'berabere' : `${x.s.secenekler[a > b ? 0 : 1]} %${Math.round((Math.max(a, b) / top) * 100)}`;
      yazi(c, x.s.metin, 120, y + 58, 38, BEYAZ, { hiza: 'left', maxW: 470 });
      yazi(c, kazanan, 960, y + 58, 38, SARI, { hiza: 'right', maxW: 360 });
    });
    return;
  }
  const sira = soruSiralama();
  yazi(c, 'TURUN BİRİNCİSİ', 540, ust + 100, 56, LILA);
  if (!sira.length) { yazi(c, 'Kimse puan alamadı', 540, ust + 220, 70, BEYAZ, { golge: true }); return; }
  const b = sira[0];
  avatar(c, b.r, 540, ust + 220, 70);
  tac(c, 540, ust + 148, 90);
  yazi(c, kisalt(b.r.ad, 16), 540, ust + 360, 86, SARI, { golge: true, maxW: 900 });
  yazi(c, `${b.puan} puan`, 540, ust + 430, 50, BEYAZ, { golge: true });
  sira.slice(1, 3).forEach((p, i) => yazi(c, `${i + 2}. ${kisalt(p.r.ad, 14)} · ${p.puan} puan`, 540, ust + 510 + i * 56, 40, BEYAZ, { w: 600, maxW: 900 }));
}

// ---- memleket yarışı
function plaka(c, x, y, pl) {
  const w = 120, h = 58;
  kutu(c, x - w / 2, y - h / 2, w, h, 10, BEYAZ);
  kutu(c, x - w / 2, y - h / 2, 26, h, 10, '#1F4FBF');
  c.fillStyle = '#1F4FBF'; c.fillRect(x - w / 2 + 14, y - h / 2, 12, h);
  yazi(c, 'TR', x - w / 2 + 13, y + 7, 14, BEYAZ);
  yazi(c, pl === 0 ? '✈' : String(pl).padStart(2, '0'), x + 14, y + 15, 42, INK);
  c.lineWidth = 3; c.strokeStyle = INK; yol(c, x - w / 2, y - h / 2, w, h, 10); c.stroke();
}
function memleketCiz() {
  const c = ctx, M = S.mem, t = zaman();
  const ust = D.sahneUst + 6, alt = D.sahneAlt + 86, x0 = 44, w = 992;
  cam(c, x0, ust, w, alt - ust, 36, 0.78);
  const sira = memSirala();
  if (M.asama === 'sonuc') {
    yazi(c, 'KAZANAN MEMLEKET', 540, ust + 110, 60, LILA);
    if (!M.kazanan) { yazi(c, 'Kimse yazmadı', 540, ust + 260, 80, BEYAZ, { golge: true }); return; }
    plaka(c, 540, ust + 220, M.kazanan.pl);
    tac(c, 540, ust + 176, 70);
    yazi(c, buyuk(M.kazanan.ad), 540, ust + 370, 110, SARI, { golge: true, maxW: 900 });
    yazi(c, `${M.kazanan.kisi} kişi · ${Math.round(M.kazanan.puan)} puan`, 540, ust + 450, 46, BEYAZ, { golge: true });
    sira.slice(1, 4).forEach((s, i) => yazi(c, `${i + 2}. ${s.ad} · ${Math.round(s.puan)}`, 540, ust + 530 + i * 54, 40, BEYAZ, { w: 600 }));
    return;
  }
  yazi(c, 'PLAKANI YA DA ŞEHRİNİ YAZ!', 540, ust + 66, 50, SARI, { golge: true, maxW: w - 60 });
  if (!sira.length) {
    yazi(c, 'İlk memleket kimden gelecek?', 540, ust + 260, 50, BEYAZ, { golge: true });
    [34, 6, 35, 61].forEach((pl, i) => plaka(c, 270 + i * 180, ust + 380, pl));
    return;
  }
  const max = Math.max(1, sira[0].puan);
  const sh = Math.min(96, (alt - ust - 160) / 6);
  sira.slice(0, 6).forEach((s, i) => {
    const y = ust + 112 + i * sh, h = sh - 18;
    s.gor = ara(s.gor || 0, s.puan / max, 0.12);
    const bx = x0 + 160, bw = w - 190;
    kutu(c, bx, y, bw, h, h / 2, 'rgba(255,255,255,0.08)');
    const renk = i === 0 ? SARI : RENKLER[(i + 1) % RENKLER.length].ana;
    kutu(c, bx, y, Math.max(h, bw * s.gor), h, h / 2, renk);
    if (s.flas > t) { c.globalAlpha = 0.5; kutu(c, bx, y, bw, h, h / 2, BEYAZ); c.globalAlpha = 1; }
    plaka(c, x0 + 82, y + h / 2, s.pl);
    if (i === 0) tac(c, x0 + 82, y - 8, 34);
    yazi(c, buyuk(s.ad) + (s.yildiz ? `  ★${s.yildiz}` : ''), bx + 24, y + h / 2 + 13, 36, INK, { hiza: 'left', maxW: bw - 220 });
    yazi(c, `${s.kisi} kişi · ${Math.round(s.puan)}`, bx + bw - 22, y + h / 2 + 12, 32, BEYAZ, { hiza: 'right', golge: true });
  });
  yazi(c, `${M.sehir.size} memleket · ${M.kisi.size} kişi`, 540, alt - 28, 32, LILA, { w: 600 });
  if (M.bayrak && t < M.bayrak.bitis) {
    const b = M.bayrak, dal = Math.sin(t * 6) * 0.04;
    c.save(); c.translate(540, ust + 330); c.rotate(dal);
    kutu(c, -400, -110, 800, 220, 30, '#E30A17');
    yazi(c, buyuk(b.s.ad), 0, 20, 110, BEYAZ, { golge: true, maxW: 740 });
    yazi(c, `${b.r.ad} dev bayrağı açtı!`, 0, 86, 34, BEYAZ, { w: 600, maxW: 740 });
    c.restore();
  }
}


// ------------------------------------------------------------------ 3. paket: 27 yeni oyun (çoğu bilgi yarışması)
const SQ = window.HP_SORULAR || {};
const SATIR_SECENEK = [[['A · B · C', 'yaz, cevap ver'], ['', 'tek hakkın var']], [['İLK BİLEN', '+3'], ['DOĞRU', '+1'], ['HEDİYE', 'ipucu, süre']]];
const SATIR_YAZI = (ust) => [[ust], [['1.', '+3'], ['2.', '+2'], ['3.', '+1'], ['HEDİYE', 'ipucu']]];
function bilgiOyunu(anahtar, baslik, kisa, ad, uret, ek = {}) {
  return {
    tip: 'soru', baslik, kisa, adet: 5, sure: 16, altBaslik: 'A, B ya da C yaz!',
    acilis: `${ad} başlıyor! Doğru şıkkın harfini yoruma yaz: A, B ya da C. İlk bilen üç puan alır!`,
    satirlar: SATIR_SECENEK,
    hatirlatma: ['Doğru şıkkın harfini yoruma yaz!', 'İlk bilen üç puan alıyor!', 'Hediye atan bir yanlış şıkkı siliyor.'],
    uret, ciz: () => soruCiz(), ...ek,
  };
}
function bankaSorusu(anahtar, cevir) {
  const liste = SQ[anahtar] || [];
  const e = yeniSec(anahtar, liste);
  const [metin, ...ops] = cevir ? cevir(e) : e;
  return secenekSorusu(metin, ops);
}
const BOLGELER = {
  'Marmara': ['İstanbul', 'Edirne', 'Kırklareli', 'Tekirdağ', 'Kocaeli', 'Sakarya', 'Yalova', 'Bursa', 'Balıkesir', 'Çanakkale', 'Bilecik'],
  'Ege': ['İzmir', 'Manisa', 'Aydın', 'Denizli', 'Muğla', 'Uşak', 'Kütahya', 'Afyonkarahisar'],
  'Akdeniz': ['Antalya', 'Mersin', 'Adana', 'Hatay', 'Osmaniye', 'Kahramanmaraş', 'Isparta', 'Burdur'],
  'İç Anadolu': ['Ankara', 'Konya', 'Kayseri', 'Eskişehir', 'Sivas', 'Yozgat', 'Kırıkkale', 'Kırşehir', 'Nevşehir', 'Niğde', 'Aksaray', 'Karaman', 'Çankırı'],
  'Karadeniz': ['Trabzon', 'Rize', 'Artvin', 'Giresun', 'Ordu', 'Samsun', 'Sinop', 'Kastamonu', 'Bartın', 'Zonguldak', 'Karabük', 'Düzce', 'Bolu', 'Amasya', 'Tokat', 'Çorum', 'Gümüşhane', 'Bayburt'],
  'Doğu Anadolu': ['Erzurum', 'Kars', 'Ağrı', 'Van', 'Malatya', 'Elazığ', 'Erzincan', 'Bingöl', 'Muş', 'Bitlis', 'Hakkari', 'Iğdır', 'Ardahan', 'Tunceli'],
  'Güneydoğu Anadolu': ['Gaziantep', 'Şanlıurfa', 'Diyarbakır', 'Mardin', 'Batman', 'Siirt', 'Şırnak', 'Adıyaman', 'Kilis'],
};
const iki = (n) => String(n).padStart(2, '0');
function plakaSorusu() {
  const i = rnd(81), ad = SEHIRLER[i], pl = i + 1;
  if (Math.random() < 0.5) {
    const yanlis = karistir(SEHIRLER.filter((x) => x !== ad)).slice(0, 2);
    return secenekSorusu(`Plakası ${iki(pl)} olan il hangisidir?`, [ad, ...yanlis]);
  }
  const yakin = karistir([...Array(81).keys()].map((x) => x + 1).filter((x) => x !== pl && Math.abs(x - pl) <= 12)).slice(0, 2);
  return secenekSorusu(`${ad} ilinin plaka kodu kaçtır?`, [iki(pl), ...yakin.map(iki)]);
}
function bolgeSorusu() {
  const bolgeler = Object.keys(BOLGELER);
  const b = rastgele(bolgeler), il = rastgele(BOLGELER[b]);
  const yanlis = karistir(bolgeler.filter((x) => x !== b)).slice(0, 2);
  return secenekSorusu(`${il} hangi bölgemizdedir?`, [b, ...yanlis]);
}
function saatYazi(h, m) { return `${h}:${iki(m)}`; }
function saatSorusu() {
  const h = 1 + rnd(12), m = rnd(12) * 5;
  const dogru = saatYazi(h, m);
  const adaylar = new Set();
  if (m > 0 && m / 5 !== h) adaylar.add(saatYazi(m / 5, (h % 12) * 5));
  adaylar.add(saatYazi(h, (m + 15) % 60));
  adaylar.add(saatYazi(h === 12 ? 1 : h + 1, m));
  adaylar.add(saatYazi(h === 1 ? 12 : h - 1, (m + 30) % 60));
  const yanlis = karistir([...adaylar].filter((x) => x !== dogru)).slice(0, 2);
  const s = secenekSorusu('Saat kaç?', [dogru, ...yanlis], { cizim: 'saat', saat: { h, m } });
  const soz = (x) => { const [a, b] = x.split(':'); return b === '00' ? `${a}` : `${a} ${Number(b)}`; };
  s.oku = `{n}. soru: Saat kaç? A: ${soz(s.secenekler[0])}. B: ${soz(s.secenekler[1])}. C: ${soz(s.secenekler[2])}.`;
  return s;
}
function enCokSorusu() {
  let say;
  do { say = [5 + rnd(8), 5 + rnd(8), 5 + rnd(8)]; } while (new Set(say).size < 3);
  const hucre = karistir([...Array(40).keys()]);
  const sekiller = [];
  let n = 0;
  SEKILLER.forEach((sk, i) => { for (let j = 0; j < say[i]; j++) sekiller.push({ sekil: sk.sekil, renk: sk.renk, h: hucre[n++], dx: Math.random() - 0.5, dy: Math.random() - 0.5, aci: (Math.random() - 0.5) * 0.6 }); });
  const ad = ['YILDIZ', 'KALP', 'DAİRE'];
  const enb = say.indexOf(Math.max(...say));
  const s = secenekSorusu('Hangisinden en çok var?', [ad[enb], ...ad.filter((_, i) => i !== enb)], { cizim: 'encok', sekiller });
  s.cevapOku = `Doğru cevap ${'ABC'[s.dogru]}: ${ad[enb].toLocaleLowerCase('tr')}, tam ${say[enb]} tane!`;
  return s;
}
function diziSorusu() {
  const tip = rnd(5);
  let d = [];
  if (tip === 0) { const a = 1 + rnd(20), k = 2 + rnd(8); for (let i = 0; i < 6; i++) d.push(a + i * k); }
  else if (tip === 1) { const a = 1 + rnd(5), k = rastgele([2, 2, 3]); for (let i = 0; i < 6; i++) d.push(a * k ** i); }
  else if (tip === 2) { const a = 1 + rnd(5); for (let i = 0; i < 6; i++) d.push((a + i) ** 2); }
  else if (tip === 3) { const x = 2 + rnd(4), y = 6 + rnd(5); let v = 1 + rnd(10); for (let i = 0; i < 6; i++) { d.push(v); v += i % 2 ? y : x; } }
  else { let a = 1 + rnd(3), b = a + 1 + rnd(2); d = [a, b]; while (d.length < 6) d.push(d[d.length - 1] + d[d.length - 2]); }
  const goster = d.slice(0, 5).join(', ') + ', ?';
  return {
    tur: 'sayi', cizim: 'buyuk', ifade: goster, dogru: d[5], gorunen: String(d[5]), ipucuMetin: `Son rakamı ${d[5] % 10}`,
    oku: `{n}. dizi! Sıradaki sayı ne? ${d.slice(0, 5).join(', ')}`, cevapOku: `Cevap ${d[5]}!`, sure: 18,
  };
}
function eksikHarfSorusu() {
  const kelime = yeniSec('eksik', SQ.kelimeler || ['HALAY']);
  const harfler = [...kelime];
  const gizle = karistir(harfler.map((_, i) => i).filter((i) => i > 0)).slice(0, Math.max(2, Math.round(harfler.length * 0.4)));
  return {
    tur: 'yazi', tekKelime: true, cizim: 'eksik', kelime, harfler, gizli: gizle.sort((a, b) => a - b), dogru: sade(kelime), gorunen: kelime,
    oku: `{n}. kelime! Eksik harfleri tamamla, kelimeyi yaz!`, cevapOku: `Doğru cevap: ${kelime.toLocaleLowerCase('tr')}!`, sure: 20,
  };
}
function terstenSorusu() {
  const kelime = yeniSec('tersten', SQ.kelimeler || ['HALAY']);
  const ters = [...kelime].reverse().join('');
  return {
    tur: 'yazi', tekKelime: true, cizim: 'buyuk', ifade: ters, cevapIfade: kelime, dogru: sade(kelime), gorunen: kelime, ipucuMetin: `İlk harfi ${kelime[0]}`,
    oku: '{n}. kelime! Tersten yazılmış kelimeyi düz yaz!', cevapOku: `Doğru cevap: ${kelime.toLocaleLowerCase('tr')}!`, sure: 18,
  };
}
const ISIM_KATEGORI = () => [['ŞEHİR', SEHIRLER], ['ÜLKE', SQ.ulkeler || []], ['HAYVAN', SQ.hayvanlar || []], ['MEYVE YA DA SEBZE', SQ.meyveSebze || []]];
function isimSehirSorusu() {
  const [kategori, liste] = rastgele(ISIM_KATEGORI().filter(([, l]) => l.length));
  const gruplar = new Map();
  for (const w of liste) { const h = buyuk(w)[0]; if (!gruplar.has(h)) gruplar.set(h, []); gruplar.get(h).push(w); }
  const uygun = [...gruplar.entries()].filter(([, l]) => l.length >= 4);
  const [harf, kelimeler] = rastgele(uygun);
  const gecerli = new Map(kelimeler.map((w) => [sade(w), w]));
  return {
    tur: 'yazi', cizim: 'isim', kategori, harf, gecerli, alinan: new Map(), dogru: null, gorunen: kelimeler.slice(0, 4).join(', '), ipucu: false, sure: 20,
    oku: `{n}. tur! ${harf} harfiyle başlayan bir ${kategori.toLocaleLowerCase('tr')} yaz!`,
    cevapOku: `Süre bitti! Mesela ${kelimeler.slice(0, 3).join(', ')}.`,
  };
}
Object.assign(KADEMELER, {
  kayik: kd('KÜREK', 'HIZLI KÜREK', 'MOTOR', 'DALGA', 'SÜPER MOTOR', 'FIRTINA'),
  tirmanma: kd('TUTAMAK', 'HIZLI TIRMANIŞ', 'HALAT', 'KAYGAN DUVAR', 'ASANSÖR', 'ŞİMŞEK'),
  dans: kd('ALKIŞ', 'ISLIK', 'KONFETİ', 'RAKİP ŞAŞIRIR', 'DEV DANSÇI', 'DANS ŞÖLENİ'),
});
for (const k of ['tarih', 'cografya', 'bilim', 'hayvan', 'spor', 'uzay', 'mutfak', 'ingilizce', 'deyim', 'yazim', 'esanlam', 'zitanlam', 'farkli',
  'baskent', 'turkiye', 'enler', 'plaka', 'bolge', 'saat', 'encok', 'dizi', 'eksikharf', 'tersten']) KADEMELER[k] = KADEMELER.bilgi;
KADEMELER.isimsehir = KADEMELER.yazma;
Object.assign(OYUNLAR, {
  tarih: bilgiOyunu('tarih', 'TARİH YARIŞMASI', 'tarih yarışması', 'Tarih yarışması', () => bankaSorusu('tarih')),
  cografya: bilgiOyunu('cografya', 'COĞRAFYA YARIŞMASI', 'coğrafya yarışması', 'Coğrafya yarışması', () => bankaSorusu('cografya')),
  bilim: bilgiOyunu('bilim', 'BİLİM YARIŞMASI', 'bilim yarışması', 'Bilim yarışması', () => bankaSorusu('bilim')),
  hayvan: bilgiOyunu('hayvan', 'HAYVANLAR ALEMİ', 'hayvanlar alemi', 'Hayvanlar alemi yarışması', () => bankaSorusu('hayvan')),
  spor: bilgiOyunu('spor', 'SPOR BİLGİSİ', 'spor bilgisi', 'Spor bilgisi yarışması', () => bankaSorusu('spor')),
  uzay: bilgiOyunu('uzay', 'UZAY YARIŞMASI', 'uzay yarışması', 'Uzay yarışması', () => bankaSorusu('uzay')),
  mutfak: bilgiOyunu('mutfak', 'TÜRK MUTFAĞI', 'Türk mutfağı', 'Türk mutfağı yarışması', () => bankaSorusu('mutfak')),
  ingilizce: bilgiOyunu('ingilizce', 'İNGİLİZCE KELİME', 'İngilizce kelime', 'İngilizce kelime yarışması', () => bankaSorusu('ingilizce', ([w, ...o]) => [`"${w}" ne demek?`, ...o])),
  deyim: bilgiOyunu('deyim', 'DEYİMLER', 'deyimler', 'Deyimler yarışması', () => bankaSorusu('deyim', ([w, ...o]) => [`"${w}" ne demek?`, ...o])),
  yazim: bilgiOyunu('yazim', 'DOĞRU YAZIM', 'doğru yazım', 'Doğru yazım yarışması', () => bankaSorusu('yazim', (o) => ['Hangisi doğru yazılmıştır?', ...o])),
  esanlam: bilgiOyunu('esanlam', 'EŞ ANLAMLILAR', 'eş anlamlılar', 'Eş anlamlı kelimeler yarışması', () => bankaSorusu('esanlam', ([w, ...o]) => [`${w} kelimesinin eş anlamlısı hangisidir?`, ...o])),
  zitanlam: bilgiOyunu('zitanlam', 'ZIT ANLAMLILAR', 'zıt anlamlılar', 'Zıt anlamlı kelimeler yarışması', () => bankaSorusu('zitanlam', ([w, ...o]) => [`${w} kelimesinin zıt anlamlısı hangisidir?`, ...o])),
  farkli: bilgiOyunu('farkli', 'FARKLI OLANI BUL', 'farklı olanı bul', 'Farklı olanı bul', () => bankaSorusu('farkli', (o) => ['Hangisi diğerlerinden farklı?', ...o])),
  baskent: bilgiOyunu('baskent', 'BAŞKENT BİL', 'başkent bil', 'Başkent bil yarışması', () => bankaSorusu('baskent')),
  turkiye: bilgiOyunu('turkiye', "TÜRKİYE'Yİ TANI", "Türkiye'yi tanı", "Türkiye'yi tanı yarışması", () => bankaSorusu('turkiye', ([w, ...o]) => [`${w} hangi ilimizdedir?`, ...o])),
  enler: bilgiOyunu('enler', "EN'LER YARIŞMASI", "en'ler yarışması", "En'ler yarışması", () => bankaSorusu('enler')),
  plaka: bilgiOyunu('plaka', 'PLAKA BİL', 'plaka bil', 'Plaka bil yarışması', () => plakaSorusu()),
  bolge: bilgiOyunu('bolge', 'HANGİ BÖLGEDE?', 'hangi bölgede', 'Hangi bölgede yarışması', () => bolgeSorusu()),
  saat: bilgiOyunu('saat', 'SAAT KAÇ?', 'saat kaç', 'Saat kaç oyunu', () => saatSorusu(), { sure: 14 }),
  encok: bilgiOyunu('encok', 'EN ÇOK HANGİSİ?', 'en çok hangisi', 'En çok hangisi oyunu', () => enCokSorusu(), { sure: 14 }),
  dizi: {
    tip: 'soru', baslik: 'SAYI DİZİSİ', kisa: 'sayı dizisi', adet: 5, sure: 18, ilkN: 3, altBaslik: 'Sıradaki sayıyı bul!',
    acilis: 'Sayı dizisi! Sıradaki sayıyı bul, yoruma yaz. Herkesin tek hakkı var!',
    satirlar: [[['SIRADAKİ SAYI', 'yaz'], ['', 'tek hakkın var']], [...SORU_ALT, ['HEDİYE', 'ipucu']]],
    hatirlatma: ['Kuralı bul, sıradaki sayıyı yaz!', 'Tek hakkın var, dikkatli düşün!', 'İlk bilen üç puan alıyor!'],
    uret: () => diziSorusu(), ciz: () => soruCiz(),
  },
  eksikharf: {
    tip: 'soru', baslik: 'EKSİK HARF', kisa: 'eksik harf', adet: 5, sure: 20, ilkN: 3, altBaslik: 'Eksik harfleri tamamla!',
    acilis: 'Eksik harf! Boşlukları tamamla, kelimeyi yoruma yaz. İlk bilen üç puan alır!',
    satirlar: SATIR_YAZI(['KELİMEYİ', 'tamamla, yaz']),
    hatirlatma: ['Eksik harfleri tamamla, kelimeyi yaz!', 'Hediye atan bir harf açıyor!', 'İlk bilen üç puan alıyor!'],
    uret: () => eksikHarfSorusu(), ciz: () => soruCiz(),
  },
  tersten: {
    tip: 'soru', baslik: 'TERSTEN OKU', kisa: 'tersten oku', adet: 5, sure: 18, ilkN: 3, altBaslik: 'Kelimeyi düz yaz!',
    acilis: 'Tersten oku! Ters yazılmış kelimeyi düz hâliyle yoruma yaz!',
    satirlar: SATIR_YAZI(['KELİMEYİ', 'düz yaz']),
    hatirlatma: ['Kelimeyi sondan başa oku!', 'Düz hâlini yoruma yaz!', 'İlk bilen üç puan alıyor!'],
    uret: () => terstenSorusu(), ciz: () => soruCiz(),
  },
  isimsehir: {
    tip: 'soru', baslik: 'İSİM ŞEHİR', kisa: 'isim şehir', adet: 5, sure: 20, ilkN: 3, altBaslik: 'Harfe uygun kelime yaz!',
    acilis: 'İsim şehir! Ekrandaki harfle başlayan bir kelime yaz. Başkasının yazdığı kelime sayılmaz!',
    satirlar: [[['HARFLE', 'başlayan kelime yaz']], [...SORU_ALT, ['', 'aynı kelime sayılmaz']]],
    hatirlatma: ['Harfle başlayan bir kelime yaz!', 'Başkasının yazdığı kelime sayılmıyor, farklı bul!', 'İlk üç kişi puan alıyor!'],
    uret: () => isimSehirSorusu(), ciz: () => soruCiz(),
  },
  kayik: {
    tip: 'takim', fizik: 'yaris', takimlar: TAKIM3, baslik: 'KAYIK YARIŞI', kisa: 'kayık yarışı', begen: 'kürek', oyunAlt: 'Beğen, kürek çek!',
    acilis: 'Kayık yarışı! Bir sarı, iki mavi, üç pembe. Takımını yaz, kürekleri çek!',
    basla: 'Başla! Beğenileri basın, kürek çekin!', sonucYazi: 'En çok kürek çekenler',
    cumleler: [null, null, '{ad} {takim} kayığa motor taktı!', '{ad} rakiplere dalga gönderdi!', '{ad} {takim} kayığa süper motor taktı!', '{ad} fırtına çıkardı, rakipler durdu!'],
    hatirlatma: ['Beğenileri basın, kayığınız hızlansın!', 'Takımını seçmeyen yoruma numarasını yazsın.', 'Bitişe ilk varan kayık kazanıyor!'],
    ciz: () => kayikCiz(),
  },
  tirmanma: {
    tip: 'takim', fizik: 'yaris', takimlar: TAKIM3, baslik: 'DUVAR TIRMANIŞI', kisa: 'duvar tırmanışı', begen: 'tırman', oyunAlt: 'Beğen, tırman!',
    acilis: 'Duvar tırmanışı! Bir sarı, iki mavi, üç pembe. Takımını yaz, zirveye ilk çıkan kazanır!',
    basla: 'Başla! Beğenileri basın, tırmanın!', sonucYazi: 'En çok destek verenler',
    cumleler: [null, null, '{ad} {takim} takıma halat attı!', '{ad} rakiplerin duvarını kaydırdı!', '{ad} {takim} takımı asansörle yukarı çıkardı!', '{ad} şimşek çaktırdı, rakipler durdu!'],
    hatirlatma: ['Beğenileri basın, tırmanıcınız yükselsin!', 'Takımını seçmeyen yoruma numarasını yazsın.', 'Zirveye ilk çıkan kazanıyor!'],
    ciz: () => tirmanmaCiz(),
  },
  dans: {
    tip: 'takim', fizik: 'it', takimlar: TAKIM2, baslik: 'DANS DÜELLOSU', kisa: 'dans düellosu', begen: 'alkış', oyunAlt: 'Beğen, takımını alkışla!',
    acilis: 'Dans düellosu! Bir sarı, iki mavi. Takımını yaz, alkışla, alkış metresini kendi tarafına çek!',
    basla: 'Müzik! Beğenileri basın, takımınızı alkışlayın!', sonucYazi: 'En çok alkışlayanlar', berabere: 'Alkış metresi ortada kaldı',
    cumleler: [null, null, '{ad} {takim} takıma konfeti attı!', '{ad} rakipleri şaşırttı!', '{ad} {takim} takıma dev dansçı getirdi!', '{ad} dans şöleni başlattı!'],
    hatirlatma: ['Beğenileri basın, alkış metresi sizden yana dönsün!', 'Sarı mı, mavi mi? Yoruma takımını yaz.', 'Takımını seçen dansa katılıyor!'],
    ciz: () => dansCiz(),
  },
});

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
  if (canli && Spiker.sessizlik() > 20) {
    let metin;
    if (t - S.sonMenuHatirlatma > 240) { metin = MENU_HATIRLATMA; S.sonMenuHatirlatma = t; }
    else if (S.hediye.size && t - S.sonDestekciAnons > 360) { S.sonDestekciAnons = t; metin = destekciCumlesi(); }
    else if (S.hatirlatmaIdx++ % 2 === 1) metin = cagriCumlesi();
    else {
      const liste = S.tur === 'halay' ? HATIRLATMALAR.halay : turTanim().hatirlatma;
      metin = liste[Math.floor(S.hatirlatmaIdx / 2) % liste.length];
    }
    Spiker.ekle(metin, 0, 'hatirlatma');
  }
  // halay sırasında birkaç dakikada bir ekranda kısa çağrı
  if (S.tur === 'halay' && canli && t - S.sonCagriAfis > 170 && !afis) {
    S.sonCagriAfis = t;
    const [b, a] = rastgele([['ARKADAŞINI ÇAĞIR!', 'Paylaş butonuna bas, birlikte oynayalım'], ['TAKİP ET!', 'Adının yanına yıldız gelsin'], ['BEĞENİ YAĞDIR!', 'Beğeni hedefi dolsun, herkes zıplasın']]);
    duyuru(b, a, CAMGOBEGI, 2.6, 0);
  }
}
// Paylaşma, takip ve beğeniye çağıran cümleler (hediye istemez)
function cagriCumlesi() {
  const hedef = BEGENI_HEDEF[Math.min(S.begeniIdx, BEGENI_HEDEF.length - 1)];
  const kalan = Math.max(0, Math.round(hedef - S.begeniSayi));
  const liste = [
    'Yayını arkadaşlarına paylaş, onlar da gelsin, takımın güçlensin!',
    'Takip etmeyi unutmayın! Takip edenin adının yanına yıldız geliyor.',
    `Beğeni hedefine ${kalan.toLocaleString('tr')} beğeni kaldı, ekrana dokunun!`,
    'Her gün gelenin serisi büyüyor. Yarın da bekliyoruz!',
    'Oyunlara katıldıkça seviyen yükseliyor, seviyen adının yanında yazıyor!',
    S.davetKrali ? `Davet kralı şu an ${okunurAd(S.davetKrali.ad)}! Paylaş, tacı sen al!` : 'İlk paylaşan davet kralı oluyor!',
  ];
  return liste[S.cagriIdx++ % liste.length];
}
function destekciCumlesi() {
  const enler = [...S.hediye.values()].sort((a, b) => b.elmas - a.elmas).slice(0, 3).map((h) => S.kisiler.get(h.id)).filter(Boolean);
  return enler.length ? `Bugün bizi destekleyen ${adListesi(enler)}, çok teşekkürler! Hediyelerin oyunda ne yaptığı ekrandaki menüde yazıyor.` : MENU_HATIRLATMA;
}
function siradakiYazi() { return (siradakiAltinMi() ? 'ALTIN TUR · ' : '') + siradakiAd(); }

// ------------------------------------------------------------------ güncelleme
let sonTurKalan = 99;
function guncelle(dt) {
  const t = zaman();
  if (S.tur === 'halay') {
    if (S.cosku > 0) S.cosku = Math.max(0, S.cosku - dt * 0.6);
    if (S.cosku >= 100) seviyeAtla();
    const kalan = S.turBitis - t;
    if (kalan < 10 && sonTurKalan >= 10) Spiker.ekle(`On saniye sonra ${siradakiAltinMi() ? 'altın tur, ' : ''}${siradakiAd()} başlıyor!`, 2, 'uyari');
    sonTurKalan = kalan;
    if (t >= S.turBitis) { sonTurKalan = 99; sonrakiTur(); }
  } else {
    const tip = turTipi();
    if (tip === 'takim') takimGuncelle(dt);
    else if (tip === 'soru') soruGuncelle(dt);
    else memGuncelle(dt);
  }
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
    const elbowA = [a.x + a.s * 96, ya - a.s * 250], elbowB = [b.x - b.s * 96, yb - b.s * 250];
    const sal = Math.sin(faz * Math.PI * 2) * 14 * (a.s + b.s) / 2;
    const el = [(elbowA[0] + elbowB[0]) / 2, Math.min(elbowA[1], elbowB[1]) - 52 * (a.s + b.s) / 2 + sal];
    const ra = robotRengi(a.k, t), rb = robotRengi(b.k, t);
    const kolA = [[a.x + a.s * 54, ya - a.s * 296], elbowA, el], kolB = [[b.x - b.s * 54, yb - b.s * 296], elbowB, el];
    cizgi(c, kolA, 30 * a.s, koyuRenk(ra.koyu, 0.25)); cizgi(c, kolA, 24 * a.s, ra.koyu);
    cizgi(c, kolB, 30 * b.s, koyuRenk(rb.koyu, 0.25)); cizgi(c, kolB, 24 * b.s, rb.koyu);
    daire(c, el[0], el[1], 16 * Math.max(a.s, b.s), gorunum(a.k.id).ten);
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
    insan(c, p.x, p.gy, p.s, robotRengi(k, t), { g: gorunum(k.id), adim, faz, zipla: p.zipla, kolSol, kolSag, isik: k === S.bas ? SARI : BEYAZ,
      gozluk: k.gozluk, fes: k.fes, altin: k.altin || t < S.altinBitis, parla });
    if (ilk) {
      const el = [p.x - p.s * 92, p.gy - p.zipla - p.s * 432];
      mendil(c, el[0], el[1], 1.18 * p.s, Math.sin(t * 7) * 0.45 - 0.1);
      daire(c, el[0], el[1], 16 * p.s, gorunum(k.id).ten);
    }
  }
  gununEnIyileriCiz(c, t);
  // isim etiketleri ve konuşma balonları
  const kalabalik = n > 5;
  for (let i = n - 1; i >= 0; i--) {
    const p = konum[i];
    const boy = Math.max(26, (kalabalik && !p.dev ? 30 : 34) * Math.min(p.s, 1.1));
    const ekstra = (p.k.fes ? 50 : 0) * p.s;
    const y = p.gy - p.zipla - p.s * 485 - ekstra - (kalabalik && i % 2 === 1 && !p.dev ? 50 : 0);
    const e = isimEtiketi(c, p.k, p.x, y, boy, { bas: p.k === S.bas, uzun: kalabalik ? 8 : 10 });
    const b = p.k.balon;
    if (b && t - b.t0 < 3) balon(c, kisalt(b.metin, 22), p.x, e.ust - (p.k === S.bas ? 34 : 12), 28);
  }
}

// Halay sırasında 45 saniyede bir: bugün en çok seviye puanı toplayanlar
function seritAcik(t) { const faz = t % 45; return S.tur === 'halay' && faz >= 32 && faz <= 41 && gununEnIyileri(1).length > 0; }
function gununEnIyileriCiz(c, t) {
  if (!seritAcik(t)) return;
  const faz = t % 45;
  const liste = gununEnIyileri(5);
  const a = Math.min(1, (faz - 32) / 0.4, (41 - faz) / 0.4);
  const y = D.sahneUst + 8;
  c.save(); c.globalAlpha = a;
  cam(c, 60, y, 960, 96, 30, 0.85);
  yazi(c, 'BUGÜNÜN EN İYİLERİ', 90, y + 34, 26, SARI, { hiza: 'left' });
  const w = 940 / Math.max(3, liste.length);
  liste.forEach((p, i) => {
    const x = 70 + i * w;
    if (p.k) avatar(c, p.k, x + 30, y + 66, 18); else daire(c, x + 30, y + 66, 18, DISK);
    yazi(c, `${i + 1}. ${kisalt(p.ad, 8)}`, x + 54, y + 74, 24, BEYAZ, { hiza: 'left', maxW: w - 66 });
  });
  c.restore();
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
    const liste = tk.son.length ? tk.son.slice(0, 3) : [null, null, null];
    const cekis = y.asama === 'oyun' ? Math.min(0.12, tk.hiz * 1.5) : 0;
    liste.forEach((k, i) => {
      const x = merkez + yan * (112 + i * 88);
      const aci = yan * (0.12 + cekis) + (tk.kayma > 0 ? -yan * 0.35 * Math.abs(Math.sin(t * 8)) : 0);
      robotlar.push({ k, x, aci, yan, tk, i });
    });
    if (tk.dev > 0) robotlar.push({ k: null, x: merkez + yan * (112 + liste.length * 88 + 40), aci: yan * 0.18, yan, tk, dev: true, i: 9 });
  }
  for (const r of robotlar) {
    const rs = r.dev ? s * 1.5 : s;
    c.save(); c.translate(r.x, gy); c.rotate(r.aci);
    const renk = r.tk.renk;
    const g = r.k ? gorunum(r.k.id) : gorunum('halat' + r.tk.no + r.i);
    insan(c, 0, 0, rs, renk, { g, forma: true, dur: true, gozluk: r.k && r.k.gozluk, fes: r.k && r.k.fes, altin: r.k && (r.k.altin || t < S.altinBitis), golge: false });
    const yon = -r.yan;
    const el1 = kol(c, 0, 0, rs, renk, 1, [[-54 * yon, -296], [40 * yon, -266], [140 * yon, -246]], g.ten);
    const el2 = kol(c, 0, 0, rs, renk, 1, [[54 * yon, -296], [110 * yon, -262], [176 * yon, -246]], g.ten);
    const m = c.getTransform();
    for (const el of [el1, el2]) {
      const p = new DOMPoint(el[0], el[1]).matrixTransform(m);
      eller.push([p.x / olcek - ox, p.y / olcek, g.ten]);
    }
    c.restore();
  }
  eller.sort((a, b) => a[0] - b[0]);
  if (eller.length) {
    const ip = [[eller[0][0] - 80, eller[0][1] + 8], ...eller, [eller[eller.length - 1][0] + 80, eller[eller.length - 1][1] + 8]];
    cizgi(c, ip, 16, '#8A5A2B');
    c.save(); c.setLineDash([10, 12]); cizgi(c, ip, 6, '#C99A5B'); c.restore();
    for (const el of eller) daire(c, el[0], el[1], 15 * s, el[2] || '#EFC09B');
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
      yazi(c, y.takimlar.length === 3 ? '1 · 2 · 3 yaz' : '1 SARI · 2 MAVİ yaz', 540, my + 40, 60, SARI, { golge: true });
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
      yazi(c, y.def.fizik === 'gol' ? `${y.goller[0]} - ${y.goller[1]}` : (y.def.berabere || ''), 540, my + 100, 44, LILA, { w: 600 });
    } else {
      const k = y.kazanan;
      yazi(c, y.def.fizik === 'gol' ? `KAZANAN · ${y.goller[0]} - ${y.goller[1]}` : y.def.birim ? `KAZANAN · ${k.sayi} ${y.def.birim}` : 'KAZANAN', 540, my - 120, 58, LILA);
      yazi(c, `${k.ad} TAKIM`, 540, my - 20, 120, k.renk.ana, { golge: true, maxW: 860 });
      if (y.yardimcilar.length) {
        yazi(c, y.def.sonucYazi, 540, my + 62, 36, LILA, { w: 600 });
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

// Tur paneli için başlık, kalan süre, alt yazı ve "nasıl oynanır" satırları
function turHud(t) {
  if (S.tur === 'halay') {
    return {
      baslik: 'HALAY TURU', kalan: S.turBitis - t,
      alt: `Halayda ${[...S.kisiler.values()].filter((k) => k.halayda).length} kişi · Sırada: ${siradakiYazi()}`,
      satirlar: [[['GİR', 'katıl'], ['HOP', 'zıpla'], ['SELAM', 'el salla']], [['BEĞEN', 'coşku'], ['TAKİP', 'yıldız al'], ['', 'yorumun balonda!']]],
    };
  }
  const def = turTanim();
  if (def.tip === 'takim') {
    const y = S.oyun;
    const uc = def.takimlar.length === 3;
    return {
      baslik: def.baslik, kalan: y.asama === 'sayim' ? 0 : y.bitis - t,
      alt: { secim: 'Takımlar kuruluyor', sayim: 'Hazır ol!', oyun: def.oyunAlt, sonuc: `Sırada: ${siradakiYazi()}` }[y.asama],
      satirlar: [uc ? [['1 · 2 · 3', 'yaz, takımını seç']] : [['1 SARI', ''], ['2 MAVİ', 'yaz, takım seç']],
        [['BEĞEN', def.begen], ['YORUM', 'güç'], ['TAKİP', 'yıldız']]],
    };
  }
  if (def.tip === 'soru') {
    const q = S.soru;
    const alt = { giris: 'Hazır ol!', soru: `Soru ${q.idx} / ${q.toplam} · ${def.altBaslik}`, cevap: `Soru ${q.idx} / ${q.toplam} · Cevap açıklandı`, sonuc: `Sırada: ${siradakiYazi()}` }[q.asama];
    return { baslik: def.baslik, kalan: q.asama === 'soru' ? q.bitis - t : 0, alt, satirlar: def.satirlar };
  }
  const M = S.mem;
  return {
    baslik: def.baslik, kalan: M.asama === 'oyun' ? M.bitis - t : 0,
    alt: M.asama === 'oyun' ? `${M.sehir.size} memleket · ${M.kisi.size} kişi · Sırada: ${siradakiYazi()}` : `Sırada: ${siradakiYazi()}`,
    satirlar: def.satirlar,
  };
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
  cam(c, 40, py, 1000, 172, 34, 0.62);
  const halay = S.tur === 'halay';
  const { baslik, kalan, alt, satirlar } = turHud(t);
  yazi(c, baslik, 74, py + 76, 72, BEYAZ, { hiza: 'left', golge: true, maxW: 640 });
  yazi(c, sure(kalan), 1006, py + 76, 72, SARI, { hiza: 'right', golge: true });
  yazi(c, (S.altinTur ? 'ALTIN TUR ×2 · ' : '') + alt, 76, py + 112, 29, S.altinTur ? ALTIN.ana : LILA, { hiza: 'left', w: 600, maxW: 930 });
  // iki ortak hedef: beğeni (sol) ve elmas (sağ)
  const bh = BEGENI_HEDEF[Math.min(S.begeniIdx, BEGENI_HEDEF.length - 1)];
  const hedef = HEDEFLER[Math.min(S.hedefIdx, HEDEFLER.length - 1)];
  const hyy = py + 128, hh = 32, hw = 462;
  for (const [hx, oran, renk, metin, ikon] of [
    [70, S.begeniSayi / bh, PEMBE, `BEĞENİ ${Math.round(S.begeniSayi).toLocaleString('tr')} / ${bh.toLocaleString('tr')}`, 'kalp'],
    [548, S.hedefElmas / hedef, ALTIN.ana, `HEDEF ${S.hedefElmas} / ${hedef} → HERKES ALTIN`, 'elmas'],
  ]) {
    kutu(c, hx, hyy, hw, hh, hh / 2, 'rgba(27,16,64,0.85)');
    const o = sinir(oran, 0, 1);
    if (o > 0.005) kutu(c, hx + 3, hyy + 3, Math.max(hh - 6, (hw - 6) * o), hh - 6, (hh - 6) / 2, renk);
    if (ikon === 'kalp') kalp(c, hx + 24, hyy + hh / 2, 9, '#FF4F9A'); else elmasIkon(c, hx + 24, hyy + hh / 2, 10);
    yazi(c, metin, hx + 42, hyy + 23, 21, BEYAZ, { hiza: 'left', golge: true, maxW: hw - 54 });
  }

  // nasıl oynanır
  talimatSatiri(c, D.talimat + 22, satirlar[0]);
  talimatSatiri(c, D.talimat + 74, satirlar[1]);

  // hediye menüsü
  const mt = D.menu;
  yazi(c, 'HEDİYE MENÜSÜ', 60, mt + 12, 28, SARI, { hiza: 'left' });
  const cagrilar = ['hediye at, efekt hemen çalışır', 'PAYLAŞ → arkadaşın gelsin, takımın güçlensin', 'TAKİP ET → adının yanına yıldız', 'BEĞEN → beğeni hedefi dolsun'];
  if (S.davetKrali) cagrilar.push(`DAVET KRALI: ${kisalt(S.davetKrali.ad, 14)}`);
  const cagri = cagrilar[Math.floor(t / 4) % cagrilar.length];
  yazi(c, cagri, 1020, mt + 12, 24, cagri.startsWith('hediye') ? LILA : SARI, { hiza: 'right', w: 700, maxW: 640 });
  const kd = KADEMELER[S.tur];
  const kw = 312, kh = 72;
  kd.forEach((kad, i) => {
    const x = 60 + (i % 3) * (kw + 12), y = mt + 24 + Math.floor(i / 3) * (kh + 10);
    const flas = (S.kartFlas.get(`${S.tur}:${i}`) || 0) > t;
    if (flas) kutu(c, x, y, kw, kh, 20, SARI); else cam(c, x, y, kw, kh, 20, 0.62);
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
    if (i === 0) kutu(c, x, y, cw, 58, 20, 'rgba(255,210,63,0.22)'); else cam(c, x, y, cw, 58, 20, 0.55);
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
    cam(c, cx, cy, cwid, ch, ch / 2, 0.7);
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
  // halayda sahnenin üstünde iki satır; diğer oyunlarda sahnedeki takım yazılarını kapatmasın diye liderlik satırının üstünde tek satır
  const halay = S.tur === 'halay' && !seritAcik(t);
  const goster = tostlar.slice(halay ? -2 : -1);
  goster.forEach((x, i) => {
    const yas = t - x.t0;
    const giris = Math.min(1, yas / 0.25), cikis = Math.min(1, (x.sure - yas) / 0.35);
    const a = Math.min(giris, cikis);
    const y = (halay ? D.sahneUst + 34 + i * 74 : D.lider + 29) - (1 - giris) * 30;
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
  const my = S.tur === 'yaris' || S.tur === 'kule' || S.tur === 'boya' ? (D.sahneUst + D.sahneAlt) / 2 - 20 : D.sahneUst + 150;
  c.save(); c.globalAlpha = Math.max(0, a);
  c.translate(540, my); c.scale(k, k); c.rotate(-0.03);
  kutu(c, -500, -96, 1000, afis.alt ? 192 : 150, 36, 'rgba(27,16,64,0.92)');
  c.lineWidth = 4; c.strokeStyle = afis.renk; yol(c, -498, -94, 996, (afis.alt ? 192 : 150) - 4, 34); c.stroke();
  const kx = afis.kisi ? 70 : 0;
  if (afis.kisi) { daire(c, -420, 0, 66, afis.renk); avatar(c, afis.kisi, -420, 0, 60); tac(c, -420, -62, 56, SARI); }
  yazi(c, afis.baslik, kx, afis.alt ? 10 : 30, 104, afis.renk, { golge: true, maxW: 940 - kx * 2 });
  if (afis.alt) yazi(c, kisalt(afis.alt, 36), kx, 74, 44, BEYAZ, { w: 600, maxW: 940 - kx * 2 });
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
  isiklar(ctx, zaman());
  susler();
  if (S.tur === 'halay') halayCiz(); else turTanim().ciz();
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
    localStorage.setItem(KAYIT, JSON.stringify({ z: Date.now(), k, h: [...S.hediye.values()], sv: S.seviye, c: S.cosku, hi: S.hedefIdx, he: S.hedefElmas, si: S.siraIdx, bs: S.begeniSayi, bi: S.begeniIdx, os: S.oyunSayaci }));
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
    S.begeniSayi = v.bs || 0; S.begeniIdx = v.bi || 0; S.oyunSayaci = v.os || 0;
    if (v.si > 0 && v.si < SIRA.length && !P.get('tur')) { S.siraIdx = v.si; S.devamTur = SIRA[v.si]; }
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
      // sunucu yeni sürüme geçtiyse sayfayı yenile (oyun durumu kayıttan geri gelir)
      if (e.surum) {
        if (!S.surum) S.surum = e.surum;
        else if (e.surum !== S.surum && !S.yenileniyor) {
          S.yenileniyor = true;
          kaydet();
          try { if (basladi) sessionStorage.setItem('herkesPiste.yenilendi', '1'); } catch {}
          setTimeout(() => location.reload(), 1200);
        }
      }
      if (once !== 'canli' && S.durum === 'canli') Spiker.ekle('Herkes Piste\'ye hoş geldiniz! Yoruma gir yazan halaya katılıyor.', 4, 'acilis');
    } else olay(e);
  };
  ws.onclose = () => { S.sunucu = false; setTimeout(sunucuyaBaglan, 2000 + Math.random() * 2000); };
  ws.onerror = () => { try { ws.close(); } catch {} };
}

// ------------------------------------------------------------------ deneme modu (sahte izleyiciler)
function denemeCevap(s) {
  const bilsin = Math.random() < 0.35;
  if (s.gecerli) return bilsin ? rastgele([...s.gecerli.values()]) : 'bilmem';
  if (s.tur === 'secenek') return bilsin ? 'abc'[s.dogru] : rastgele(['a', 'b', 'c']);
  if (s.tur === 'dy') return (bilsin ? s.dogru : Math.random() < 0.5) ? 'd' : 'y';
  if (s.tur === 'sayi') return bilsin ? String(s.dogru) : String(1 + rnd(99));
  if (s.tur === 'anket') return rastgele(['1', '2', '1']);
  if (s.tekSecim) return bilsin ? s.gorunen : rastgele(RENK_LISTESI)[0];
  return bilsin ? s.gorunen : 'bilmiyorum';
}
function denemeBaslat() {
  const adlar = ['ayse.k', 'mehmet_34', 'zeynep.y', 'can06', 'elifim', 'burak.tr', 'selin', 'emre_35', 'deniz', 'merve.gs', 'kaan', 'irem', 'ali_veli', 'gökhan', 'sude', 'oğuz', 'buse', 'tolga', 'ecem', 'yusuf'];
  const kucuk = [['Gül', 1], ['TikTok', 1], ['Parmak kalp', 5], ['Dondurma', 1], ['Parfüm', 20]];
  const buyukH = [['Donut', 30], ['Kalpli mektup', 99], ['Konfeti', 100], ['Gül buketi', 199], ['Aslan', 500]];
  const sohbet = ['harika', 'kral', 'çok iyi', 'süper', 'bravo', 'eline sağlık'];
  setInterval(() => {
    const ad = rastgele(adlar);
    const k = { id: ad, ad, av: '' };
    const r = Math.random();
    const tip = turTipi();
    if (tip === 'soru') {
      const q = S.soru;
      if (r < 0.3 && q && q.asama === 'soru') olay({ t: 'yorum', k, m: denemeCevap(q.soru) });
      else if (r < 0.9) olay({ t: 'begeni', k, n: 1 + Math.floor(Math.random() * 15) });
      else { const [g, e] = rastgele([...kucuk, ...buyukH.slice(0, 3)]); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
    } else if (tip === 'memleket') {
      if (r < 0.3) olay({ t: 'yorum', k, m: String(rastgele([34, 34, 6, 35, 61, 1, 16, 42, 27, 7, 55, 25, 'izmir', 'Trabzon', 'gurbet', 'urfa'])) });
      else if (r < 0.9) olay({ t: 'begeni', k, n: 1 + Math.floor(Math.random() * 15) });
      else { const [g, e] = rastgele([...kucuk, ...buyukH]); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
    } else if (tip === 'halay') {
      if (r < 0.22) olay({ t: 'yorum', k, m: rastgele(['gir', 'GİR', 'gir!', 'hop', 'selam']) });
      else if (r < 0.32) olay({ t: 'yorum', k, m: rastgele(sohbet) });
      else if (r < 0.86) olay({ t: 'begeni', k, n: 1 + Math.floor(Math.random() * 15) });
      else if (r < 0.95) { const [g, e] = rastgele(kucuk); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
      else if (r < 0.98) { const [g, e] = rastgele(buyukH); olay({ t: 'hediye', k, ad: g, elmas: e, adet: 1 }); }
      else olay({ t: 'takip', k });
    } else {
      const takimlar = S.oyun && S.oyun.takimlar.length === 3 ? ['1', '2', '3', 'mavi', 'sarı'] : ['1', '2', 'sarı', 'mavi'];
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
// Ses tercihleri hatırlanır; sayfa güncelleme için kendiliğinden yenilenince tek dokunuşla ses geri açılır
const AYAR = 'herkesPiste.ayar';
function sesleriAc(davul, spiker) {
  Ses.baslat(davul, spiker);
  Spiker.baslat(spiker);
  Ses.devam();
  if (spiker && 'speechSynthesis' in window) { try { speechSynthesis.getVoices(); } catch {} }
}
document.getElementById('baslat').addEventListener('click', async () => {
  basladi = true;
  document.getElementById('giris').style.display = 'none';
  const davul = document.getElementById('sesKutu').checked;
  const spiker = document.getElementById('spikerKutu').checked;
  try { localStorage.setItem(AYAR, JSON.stringify({ davul, spiker })); } catch {}
  sesleriAc(davul, spiker);
  await tamEkran();
  uyanikTut();
  tamBtnGuncelle();
  if (DEMO || S.durum === 'canli') Spiker.ekle('Herkes Piste\'ye hoş geldiniz! Yoruma gir yazan halaya katılıyor.', 4, 'acilis');
});
const sesAcBtn = document.getElementById('sesAc');
sesAcBtn.addEventListener('click', async () => {
  let a = { davul: true, spiker: true };
  try { a = { ...a, ...JSON.parse(localStorage.getItem(AYAR) || '{}') }; } catch {}
  sesAcBtn.style.display = 'none';
  sesleriAc(a.davul, a.spiker);
  await tamEkran();
  uyanikTut();
  tamBtnGuncelle();
});
try {
  if (sessionStorage.getItem('herkesPiste.yenilendi') === '1') {
    sessionStorage.removeItem('herkesPiste.yenilendi');
    basladi = true;
    document.getElementById('giris').style.display = 'none';
    sesAcBtn.style.display = 'block';
  }
} catch {}
tamBtn.addEventListener('click', async () => { await tamEkran(); tamBtnGuncelle(); });
document.addEventListener('fullscreenchange', tamBtnGuncelle);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { uyanikTut(); Ses.devam(); tamBtnGuncelle(); } });
if (P.has('direkt')) { basladi = true; document.getElementById('giris').style.display = 'none'; }

window.addEventListener('resize', boyutla);
boyutla();
yukle();
if (DEMO) denemeBaslat(); else sunucuyaBaglan();
// sayfa yenilendiyse kaldığı oyundan devam eder
if (S.devamTur && S.devamTur !== 'halay') turBaslat(S.devamTur);
// ?tur=bilgi gibi bir adresle belli bir oyundan başlanabilir
if (P.get('tur') && OYUNLAR[P.get('tur')]) {
  const i = SIRA.indexOf(P.get('tur'));
  S.siraIdx = i >= 0 ? i : 0;
  turBaslat(P.get('tur'));
}
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
if (P.has('test')) window.__hp = { S, olay, takimOyunuBaslat, turBaslat, sonrakiTur, zaman, duyuru, Spiker, OYUNLAR };
})();
