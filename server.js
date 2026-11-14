// Herkes Piste — oyun sunucusu
// TikTok LIVE yayınındaki yorum, beğeni ve hediyeleri okur, oyun sayfasına WebSocket ile aktarır.
import http from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const KOK = path.dirname(fileURLToPath(import.meta.url));
envYukle(path.join(KOK, '.env'));

const PORT = Number(process.env.PORT || 3000);
const KULLANICI = String(process.env.TIKTOK_KULLANICI || 'herkes.piste').replace(/^@/, '').trim();
const API_KEY = String(process.env.EULER_API_KEY || '').trim();
const SIMULASYON = process.env.SIMULASYON === '1';
const PUBLIC = path.join(KOK, 'public');

function envYukle(dosya) {
  let icerik = '';
  try { icerik = readFileSync(dosya, 'utf8'); } catch { return; } // servis altında değerler zaten systemd'den gelir
  for (const satir of icerik.split(/\r?\n/)) {
    const m = satir.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function log(...a) {
  console.log(new Date().toISOString().slice(11, 19), ...a);
}

// ---------------------------------------------------------------- statik dosyalar
const TURLER = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.ico': 'image/x-icon',
};

const sunucu = http.createServer((istek, yanit) => {
  const url = new URL(istek.url, 'http://x');
  if (url.pathname === '/saglik') {
    yanit.writeHead(200, { 'content-type': 'application/json' });
    yanit.end(JSON.stringify({ tamam: true, kullanici: KULLANICI, durum, istemci: istemciler.size }));
    return;
  }
  let yol = decodeURIComponent(url.pathname);
  if (yol === '/' || yol === '') yol = '/index.html';
  const dosya = path.normalize(path.join(PUBLIC, yol));
  if (!dosya.startsWith(PUBLIC + path.sep) || !existsSync(dosya) || !statSync(dosya).isFile()) {
    yanit.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    yanit.end('Bulunamadı');
    return;
  }
  const uzanti = path.extname(dosya).toLowerCase();
  const onbellek = ['.woff2', '.png'].includes(uzanti) ? 'public, max-age=86400' : 'no-cache';
  yanit.writeHead(200, { 'content-type': TURLER[uzanti] || 'application/octet-stream', 'cache-control': onbellek });
  createReadStream(dosya).pipe(yanit);
});

// ---------------------------------------------------------------- oyun sayfaları (WebSocket)
const istemciler = new Set();
const wss = new WebSocketServer({ server: sunucu, path: '/ws' });

wss.on('connection', (ws) => {
  ws.canli = true;
  istemciler.add(ws);
  ws.on('pong', () => { ws.canli = true; });
  ws.on('close', () => { istemciler.delete(ws); istemciDegisti(); });
  ws.on('error', () => {});
  gonder(ws, durumMesaji());
  istemciDegisti();
});

setInterval(() => {
  for (const ws of istemciler) {
    if (!ws.canli) { ws.terminate(); continue; }
    ws.canli = false;
    try { ws.ping(); } catch {}
  }
}, 25000);

function gonder(ws, veri) {
  if (ws.readyState === 1) ws.send(JSON.stringify(veri));
}
function yayinla(veri) {
  const metin = JSON.stringify(veri);
  for (const ws of istemciler) if (ws.readyState === 1) ws.send(metin);
}

// ---------------------------------------------------------------- TikTok bağlantısı
let durum = 'bekliyor';   // bekliyor | baglaniyor | canli | kapali | hata
let durumAciklama = '';
let izleyici = 0;
let baglanti = null;
let tekrarZamanlayici = null;
let bosZamanlayici = null;

function durumMesaji() {
  return { t: 'durum', durum, m: durumAciklama, kullanici: KULLANICI, izleyici, simulasyon: SIMULASYON };
}
function durumAyarla(yeni, aciklama = '') {
  durum = yeni;
  durumAciklama = aciklama;
  log('durum:', yeni, aciklama);
  yayinla(durumMesaji());
}

function istemciDegisti() {
  if (istemciler.size > 0) {
    clearTimeout(bosZamanlayici);
    bosZamanlayici = null;
    if (SIMULASYON) { simulasyonBaslat(); return; }
    if (!baglanti && !tekrarZamanlayici) baglan();
  } else if (!bosZamanlayici) {
    // Oyun sayfası 10 dakika kapalı kalırsa TikTok bağlantısını bırak (gereksiz istek olmasın).
    bosZamanlayici = setTimeout(() => {
      bosZamanlayici = null;
      if (istemciler.size > 0) return;
      clearTimeout(tekrarZamanlayici);
      tekrarZamanlayici = null;
      if (baglanti) { try { baglanti.disconnect(); } catch {} baglanti = null; }
      simulasyonDurdur();
      durumAyarla('bekliyor', 'Oyun sayfası kapalı');
    }, 10 * 60 * 1000);
  }
}

function tekrarDene(saniye) {
  clearTimeout(tekrarZamanlayici);
  tekrarZamanlayici = setTimeout(() => {
    tekrarZamanlayici = null;
    if (istemciler.size > 0 && !baglanti) baglan();
  }, saniye * 1000);
}

let kutuphane = null;
async function baglan() {
  if (baglanti) return;
  durumAyarla('baglaniyor', `@${KULLANICI} yayını aranıyor`);
  try {
    kutuphane ||= await import('tiktok-live-connector');
  } catch (e) {
    durumAyarla('hata', 'TikTok kütüphanesi yüklenemedi');
    log(e);
    return tekrarDene(120);
  }
  const { TikTokLiveConnection, WebcastEvent, ControlEvent } = kutuphane;
  const secenekler = { processInitialData: false, enableExtendedGiftInfo: true };
  if (API_KEY) secenekler.signApiKey = API_KEY;
  const c = new TikTokLiveConnection(KULLANICI, secenekler);
  baglanti = c;

  c.on(WebcastEvent.CHAT, (d) => {
    const k = kisi(d.user);
    const m = String(d.comment ?? d.content ?? '').trim();
    if (k && m) yayinla({ t: 'yorum', k, m: m.slice(0, 120) });
  });
  c.on(WebcastEvent.LIKE, (d) => {
    const k = kisi(d.user);
    const n = Math.max(1, Math.min(100, Number(d.likeCount ?? d.count ?? 1) || 1));
    if (k) yayinla({ t: 'begeni', k, n });
  });
  c.on(WebcastEvent.GIFT, (d) => {
    const h = hediyeCoz(d);
    if (h) yayinla(h);
  });
  c.on(WebcastEvent.FOLLOW, (d) => { const k = kisi(d.user); if (k) yayinla({ t: 'takip', k }); });
  c.on(WebcastEvent.SHARE, (d) => { const k = kisi(d.user); if (k) yayinla({ t: 'paylasim', k }); });
  c.on(WebcastEvent.MEMBER, (d) => { const k = kisi(d.user); if (k) yayinla({ t: 'giris', k }); });
  c.on(WebcastEvent.ROOM_USER, (d) => {
    const n = Number(d.viewerCount ?? d.total ?? 0) || 0;
    if (n && n !== izleyici) { izleyici = n; yayinla({ t: 'izleyici', n }); }
  });
  c.on(WebcastEvent.STREAM_END, () => {
    log('yayın bitti');
    baglanti = null;
    try { c.disconnect(); } catch {}
    durumAyarla('kapali', 'Yayın bitti');
    tekrarDene(30);
  });
  c.on(ControlEvent.DISCONNECTED, () => {
    if (baglanti !== c) return;
    baglanti = null;
    durumAyarla('baglaniyor', 'Bağlantı koptu, yeniden bağlanılıyor');
    tekrarDene(5);
  });
  c.on(ControlEvent.ERROR, (e) => log('hata olayı:', e?.info || '', e?.exception?.message || ''));

  try {
    const st = await c.connect();
    if (baglanti !== c) return;
    izleyici = Number(st?.roomInfo?.user_count ?? st?.roomInfo?.stats?.user_count ?? izleyici) || izleyici;
    durumAyarla('canli', `@${KULLANICI} yayınına bağlandı`);
  } catch (e) {
    if (baglanti === c) baglanti = null;
    try { c.disconnect(); } catch {}
    const ad = e?.constructor?.name || e?.name || '';
    const mesaj = String(e?.message || e || '');
    if (ad === 'UserOfflineError' || /offline|isn't online|not live|LIVE has ended/i.test(mesaj)) {
      durumAyarla('kapali', 'Yayın kapalı');
      tekrarDene(30);
    } else if (ad === 'SignatureRateLimitError' || /rate ?limit|429/i.test(mesaj)) {
      durumAyarla('hata', 'Bağlantı servisi yoğun, birazdan tekrar denenecek');
      tekrarDene(90);
    } else if (ad === 'InvalidResponseCompositeError' || /Room ID/i.test(mesaj)) {
      // Yayın açık değilken TikTok oda numarası vermiyor; bunu "kapalı" sayıp beklemeye devam et.
      durumAyarla('kapali', 'Yayın bulunamadı');
      tekrarDene(30);
    } else if (ad === 'InvalidUniqueIdError') {
      durumAyarla('hata', `Kullanıcı adı geçersiz: ${KULLANICI}`);
      tekrarDene(300);
    } else {
      durumAyarla('hata', 'Bağlanılamadı, tekrar denenecek');
      log('bağlantı hatası:', ad, mesaj.slice(0, 300));
      tekrarDene(45);
    }
  }
}

// ---------------------------------------------------------------- veri dönüştürme
function avatarSec(...listeler) {
  for (const l of listeler) {
    const arr = Array.isArray(l) ? l : (typeof l === 'string' ? [l] : []);
    const iyi = arr.find((u) => typeof u === 'string' && /^https?:/.test(u) && !/\.heic/i.test(u));
    if (iyi) return iyi;
  }
  return '';
}

function kisi(u) {
  if (!u) return null;
  const id = String(u.uniqueId || u.displayId || u.userId || u.id || '').trim();
  const ad = String(u.nickname || id || '').trim();
  if (!id && !ad) return null;
  const av = avatarSec(u.profilePictureUrl, u.avatarThumb?.urlList, u.avatarMedium?.urlList,
    u.profilePicture?.url, u.profilePicture?.urlList, u.avatarLarge?.urlList);
  return { id: (id || ad).slice(0, 40), ad: (ad || id).slice(0, 40), av };
}

// Seri hediyelerde (gül x10 gibi) her adımı yalnızca bir kez saymak için son adet tutulur.
const seriler = new Map();
function hediyeCoz(d) {
  const k = kisi(d.user);
  if (!k) return null;
  const g = d.gift || d.giftDetails || {};
  const ek = d.extendedGiftInfo || {};
  const elmas = Math.max(1, Number(g.diamondCount ?? g.diamond_count ?? ek.diamondCount ?? ek.diamond_count ?? 1) || 1);
  const ad = String(g.name || g.giftName || ek.name || 'Hediye').slice(0, 30);
  const hediyeId = String(d.giftId ?? g.id ?? ek.id ?? ad);
  const adet = Math.max(1, Number(d.repeatCount ?? d.comboCount ?? 1) || 1);
  const bitti = !!d.repeatEnd;
  const anahtar = `${k.id}|${hediyeId}|${d.groupId ?? ''}`;
  const simdi = Date.now();
  let s = seriler.get(anahtar);
  if (!s || s.bitti || simdi - s.zaman > 30000 || adet < s.adet) s = { adet: 0 };
  const fark = adet - s.adet;
  seriler.set(anahtar, { adet: Math.max(adet, s.adet), bitti, zaman: simdi });
  if (seriler.size > 2000) for (const [a, v] of seriler) if (simdi - v.zaman > 60000) seriler.delete(a);
  if (fark <= 0) return null;
  return { t: 'hediye', k, ad, elmas: elmas * fark, adet: fark, birim: elmas };
}

// ---------------------------------------------------------------- simülasyon (yerel deneme için)
let simZamanlayici = null;
const SIM_ADLAR = ['ayse.k', 'mehmet_34', 'zeynep', 'can.06', 'elif', 'burak', 'selin', 'emre_35', 'deniz', 'merve', 'kaan', 'irem'];
function simulasyonBaslat() {
  if (simZamanlayici) return;
  durumAyarla('canli', 'Simülasyon');
  simZamanlayici = setInterval(() => {
    const ad = SIM_ADLAR[Math.floor(Math.random() * SIM_ADLAR.length)];
    const k = { id: ad, ad, av: '' };
    const r = Math.random();
    if (r < 0.35) yayinla({ t: 'yorum', k, m: ['gir', 'hop', '1', '2', '3', 'selam'][Math.floor(Math.random() * 6)] });
    else if (r < 0.85) yayinla({ t: 'begeni', k, n: 1 + Math.floor(Math.random() * 12) });
    else if (r < 0.95) yayinla({ t: 'hediye', k, ad: 'Gül', elmas: 1, adet: 1, birim: 1 });
    else yayinla({ t: 'hediye', k, ad: 'Parmak kalp', elmas: 99, adet: 1, birim: 99 });
  }, 350);
}
function simulasyonDurdur() {
  clearInterval(simZamanlayici);
  simZamanlayici = null;
}

sunucu.listen(PORT, () => log(`Herkes Piste sunucusu :${PORT} — @${KULLANICI}${SIMULASYON ? ' (simülasyon)' : ''}`));

export { hediyeCoz, kisi };
