# Herkes Piste

TikTok LIVE için izleyicilerin yönettiği halay ve araba yarışı oyunu. Bilgisayar gerekmez: oyun telefonda tarayıcıda açılır, TikTok'un **Mobil oyun** (ekran paylaşımı) yayınıyla yayına verilir. Sunucu, yayındaki yorum, beğeni ve hediyeleri okuyup oyuna aktarır.

## Oyun

**Halay turu (2 dk)**
- `GİR` yaz → halaya katıl (robotun adınla sıraya girer)
- `HOP` yaz → robotun zıplar
- Beğeni → coşku çubuğu dolar, halay hızlanır
- Hediye → en çok hediye atan halaybaşı olur, mendil onda. 30+ elmas: davul zurna, 99+: herkes zıplar, 500+: halay şöleni

**Araba yarışı (~1 dk)**
- `1`, `2`, `3` yaz → Sarı, Mavi ya da Pembe takımı seç
- Beğeni → gaz, yorum → takımına güç, hediye → nitro
- Önce bitişe varan takım kazanır, ardından halay tekrar başlar

Para ya da ödül dağıtılmaz; oyun yalnızca eğlence ve sıralama içindir.

## Sunucu kurulumu (tek satır)

Ubuntu/Debian sunucuda root olarak:

```bash
curl -fsSL https://raw.githubusercontent.com/olcaydunder/herkes-piste/main/kur.sh | bash
```

Kurulum Node.js, Caddy (otomatik HTTPS) ve servisi kurar, sonunda oyun adresini yazar. Sunucu 2 dakikada bir bu depodan güncellemeleri çeker.

Ayarlar `/opt/herkes-piste/.env` dosyasındadır:
- `TIKTOK_KULLANICI` — yayın yapan hesap (varsayılan `herkes.piste`)
- `EULER_API_KEY` — isteğe bağlı; bağlantı sınırına takılırsa https://www.eulerstream.com adresinden ücretsiz anahtar alınıp buraya yazılır

## Yayın açarken

1. Oyun adresini telefonda Chrome'da aç, **BAŞLAT**'a dokun.
2. TikTok: **+** → **CANLI** → **Mobil oyun** → **Canlı yayına başla**, ekran paylaşımına izin ver.
3. Chrome'a geri dön. Oyun birkaç saniyede yayına bağlanır.

Deneme için: oyun adresinin sonuna `/?demo` ekle (sahte izleyicilerle çalışır).

## Yerelde çalıştırma

```bash
npm install
npm run simulasyon   # sahte olaylarla
npm start            # gerçek yayına bağlanır
```
