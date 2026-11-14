// Herkes Piste — oyun sunucusu
// TikTok LIVE yayınındaki yorum, beğeni ve hediyeleri okur, oyun sayfasına WebSocket ile aktarır.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const KOK = path.dirname(fileURLToPath(import.meta.url));
envYukle(path.join(KOK, '.env'));

const PORT = Number(process.env.PORT || 3000);
const KULLANICI = String(process.env.TIKTOK_KULLANICI || 'herkes.piste').replace(/^@/, '').trim();
const API_KEY = String(process.env.EULER_API_KEY || '').trim();
const SIMULASYON = process.env.SIMULASYON === '1';
const SURUM = (() => {
  // GitHub'dan çekilen sürümün kısa kimliği (sunucunun güncellenip güncellenmediğini görmek için)
  try {
    let h = readFileSync(path.join(KOK, '.git', 'HEAD'), 'utf8').trim();
    if (h.startsWith('ref: ')) {
      const ref = h.slice(5);
      try { h = readFileSync(path.join(KOK, '.git', ref), 'utf8').trim(); }
      catch { h = (readFileSync(path.join(KOK, '.git', 'packed-refs'), 'utf8').split('\n').find((x) => x.endsWith(' ' + ref)) || '').split(' ')[0]; }
    }
    return h.slice(0, 7);
  } catch { return ''; }
})();
const PUBLIC = path.join(KOK, 'public');
const TTS_DIZIN = process.env.PIPER_DIZIN || '/opt/herkes-piste-tts';
const PIPER_PY = process.env.PIPER_PY || path.join(TTS_DIZIN, 'venv', 'bin', 'python');
const PIPER_MODEL = process.env.PIPER_MODEL || path.join(TTS_DIZIN, 'tr_TR-dfki-medium.onnx');
const PIPER_ISCI = process.env.PIPER_ISCI || path.join(KOK, 'tts', 'piper_isci.py');
const SES_DIZIN = path.join(process.env.CACHE_DIRECTORY || os.tmpdir(), 'herkes-piste-ses');

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
    yanit.end(JSON.stringify({ tamam: true, surum: SURUM, kullanici: KULLANICI, durum, aciklama: durumAciklama, istemci: istemciler.size, ses: sesVarMi(), anahtar: !!API_KEY, sonHata }));
    return;
  }
  if (url.pathname === '/konus') { konus(url.searchParams.get('m') || '', yanit); return; }
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

// ---------------------------------------------------------------- yapay zekâ sunucunun sesi (Piper, Türkçe)
// Python işçisi sesi bir kez yükler; cümleler sırayla seslendirilir ve önbelleğe yazılır.
const ses = { isci: null, hazir: null, sira: 1, bekleyen: new Map(), zincir: Promise.resolve(), kuyruk: 0, araVer: 0 };

function sesVarMi() {
  return existsSync(PIPER_PY) && existsSync(PIPER_MODEL) && existsSync(PIPER_MODEL + '.json') && existsSync(PIPER_ISCI);
}

function isciBaslat() {
  if (ses.isci) return ses.hazir;
  const p = spawn(PIPER_PY, [PIPER_ISCI, PIPER_MODEL], {
    cwd: os.tmpdir(), stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONUNBUFFERED: '1' },
  });
  ses.isci = p;
  let tampon = '', yuklendi = false;
  ses.hazir = new Promise((hazir, hata) => {
    const zaman = setTimeout(() => { hata(new Error('ses yüklenemedi')); isciDurdur(); }, 90000);
    p.stdout.on('data', (parca) => {
      tampon += parca;
      let i;
      while ((i = tampon.indexOf('\n')) >= 0) {
        const satir = tampon.slice(0, i); tampon = tampon.slice(i + 1);
        let v; try { v = JSON.parse(satir); } catch { continue; }
        if (v.hazir) { yuklendi = true; clearTimeout(zaman); hazir(); log('ses hazır'); continue; }
        const b = ses.bekleyen.get(v.id);
        if (b) { ses.bekleyen.delete(v.id); v.ok ? b.tamam() : b.hata(new Error(v.hata || 'seslendirilemedi')); }
      }
    });
    p.on('exit', (kod) => {
      clearTimeout(zaman);
      if (ses.isci === p) { ses.isci = null; ses.hazir = null; }
      if (!yuklendi) ses.araVer = Date.now() + 5 * 60000; // ses açılamadıysa 5 dakika tarayıcı sesi kullanılsın
      for (const b of ses.bekleyen.values()) b.hata(new Error('ses işçisi kapandı'));
      ses.bekleyen.clear();
      hata(new Error('ses işçisi kapandı: ' + kod));
    });
  });
  ses.hazir.catch(() => {});
  p.on('error', (e) => log('ses işçisi başlatılamadı:', e.message));
  p.stderr.on('data', (d) => { const m = String(d).trim(); if (m && !/warn/i.test(m)) log('ses:', m.slice(0, 200)); });
  p.stdin.on('error', () => {});
  return ses.hazir;
}
function isciDurdur() {
  const p = ses.isci;
  ses.isci = null; ses.hazir = null;
  if (p) try { p.kill('SIGKILL'); } catch {}
}

async function seslendir(metin, hedef) {
  await isciBaslat();
  const p = ses.isci;
  if (!p) throw new Error('ses işçisi yok');
  const id = ses.sira++;
  await new Promise((tamam, hata) => {
    const zaman = setTimeout(() => { ses.bekleyen.delete(id); hata(new Error('zaman aşımı')); if (ses.isci === p) isciDurdur(); }, 20000);
    ses.bekleyen.set(id, { tamam: () => { clearTimeout(zaman); tamam(); }, hata: (e) => { clearTimeout(zaman); hata(e); } });
    p.stdin.write(JSON.stringify({ id, metin, cikis: hedef }) + '\n');
  });
}

function konus(ham, yanit) {
  const metin = String(ham).normalize('NFC').replace(/[\u0000-\u001f\u007f<>{}\[\]\\|^~`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220);
  if (!metin) { yanit.writeHead(400); yanit.end(); return; }
  if (!sesVarMi() || Date.now() < ses.araVer) { yanit.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' }); yanit.end('Ses kurulu değil'); return; }
  const dosya = path.join(SES_DIZIN, createHash('sha1').update(PIPER_MODEL + '|' + metin).digest('hex') + '.wav');
  const gonderDosya = () => {
    yanit.writeHead(200, { 'content-type': 'audio/wav', 'cache-control': 'private, max-age=86400' });
    createReadStream(dosya).pipe(yanit);
  };
  if (existsSync(dosya)) { gonderDosya(); return; }
  if (ses.kuyruk >= 6) { yanit.writeHead(429); yanit.end(); return; }
  ses.kuyruk++;
  const is = ses.zincir.then(async () => {
    if (yanit.destroyed) return;
    if (!existsSync(dosya)) { mkdirSync(SES_DIZIN, { recursive: true }); await seslendir(metin, dosya); }
  });
  ses.zincir = is.catch(() => {});
  is.then(() => { if (!yanit.destroyed) gonderDosya(); })
    .catch((e) => { log('seslendirme hatası:', e.message); if (!yanit.headersSent) { yanit.writeHead(500); yanit.end(); } })
    .finally(() => { ses.kuyruk--; });
}

// Önbellekte 3 günden eski sesleri sil
setInterval(() => {
  try {
    const sinir = Date.now() - 3 * 86400000;
    for (const ad of readdirSync(SES_DIZIN)) {
      const d = path.join(SES_DIZIN, ad);
      if (statSync(d).mtimeMs < sinir) unlinkSync(d);
    }
  } catch {}
}, 3600000).unref();

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
let sonHata = null;        // son bağlantı hatası (sorun giderme için /saglik'te görünür)
let odaBilgisiAtla = false; // oda bilgisi TikTok'tan alınamıyorsa bir sonraki denemede bu adım atlanır
let tekrarZamanlayici = null;
let bosZamanlayici = null;

function durumMesaji() {
  return { t: 'durum', durum, m: durumAciklama, kullanici: KULLANICI, izleyici, simulasyon: SIMULASYON, surum: SURUM };
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
  // enableExtendedGiftInfo kapalı: hediye listesi imzalı istek ister ve ücretsiz kullanımda bağlantıyı düşürür.
  // Hediyenin adı ve elmas değeri zaten her hediye mesajının içinde geliyor.
  const secenekler = { processInitialData: false, enableExtendedGiftInfo: false, fetchRoomInfoOnConnect: !odaBilgisiAtla };
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
    sonHata = null;
    durumAyarla('canli', `@${KULLANICI} yayınına bağlandı`);
  } catch (e) {
    if (baglanti === c) baglanti = null;
    try { c.disconnect(); } catch {}
    const ad = e?.constructor?.name || e?.name || '';
    const mesaj = String(e?.message || e || '');
    const ayrinti = [e?.reason, e?.requestErr?.message, e?.exception?.message, Array.isArray(e?.errors) ? e.errors.map((x) => x?.message).join(' | ') : '']
      .filter(Boolean).join(' · ');
    sonHata = { zaman: new Date().toISOString(), ad, mesaj: mesaj.slice(0, 300), ayrinti: String(ayrinti).slice(0, 400), odaBilgisiAtla };
    log('bağlantı denemesi başarısız:', ad, mesaj.slice(0, 300), ayrinti ? '· ' + String(ayrinti).slice(0, 300) : '');
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
    } else if (ad === 'PremiumFeatureError') {
      durumAyarla('hata', 'Bağlantı servisi anahtar istiyor (PremiumFeatureError)');
      tekrarDene(120);
    } else if (!odaBilgisiAtla) {
      // Oda bilgisi adımı sunucu IP'sinden engellenmiş olabilir: bir sonraki denemede bu adımı atla
      odaBilgisiAtla = true;
      durumAyarla('baglaniyor', `İkinci yol deneniyor (${ad || 'hata'})`);
      tekrarDene(5);
    } else {
      odaBilgisiAtla = false;
      durumAyarla('hata', `Bağlanılamadı (${ad || 'bilinmeyen hata'}), tekrar denenecek`);
      tekrarDene(30);
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
    else if (r < 0.98) yayinla({ t: 'hediye', k, ad: 'Parmak kalp', elmas: 5, adet: 1, birim: 5 });
    else yayinla({ t: 'hediye', k, ad: 'Kalpli mektup', elmas: 99, adet: 1, birim: 99 });
  }, 350);
}
function simulasyonDurdur() {
  clearInterval(simZamanlayici);
  simZamanlayici = null;
}

sunucu.listen(PORT, () => log(`Herkes Piste sunucusu :${PORT} — @${KULLANICI}${SIMULASYON ? ' (simülasyon)' : ''} — ses: ${sesVarMi() ? 'hazır' : 'kurulu değil'}`));

export { hediyeCoz, kisi };
