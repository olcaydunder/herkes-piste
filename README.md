# Herkes Piste

TikTok LIVE için izleyicilerin yönettiği halay, araba yarışı ve halat çekme oyunu. Bilgisayar gerekmez: oyun telefonda tarayıcıda açılır, TikTok'un **Mobil oyun** (ekran paylaşımı) yayınıyla yayına verilir. Sunucu, yayındaki yorum, beğeni ve hediyeleri okuyup oyuna aktarır. Türkçe konuşan bir yapay zekâ sunucu oyunu anlatır.

## Oyun

Turlar kendiliğinden döner: halay → araba yarışı → halay → halat çekme.

**Halay turu (~100 sn)**
- `GİR` yaz → halaya katıl (robotun adınla sıraya girer), `HOP` → zıpla, `SELAM` → el salla
- Halaydaki kişinin yorumu robotun üstünde balonda görünür
- Beğeni → coşku çubuğu dolar, halay hızlanır; takip → isminin yanına yıldız

**Araba yarışı / Halat çekme (~70 sn)**
- Yarışta `1`, `2`, `3` (Sarı, Mavi, Pembe), halatta `1`, `2` (Sarı, Mavi) yaz → takımını seç
- Beğeni → gaz / çekiş, yorum → takımına güç

**Hediye menüsü** (ekranda yazar; tek seferdeki elmas değerine göre)

| Elmas | Halay | Araba yarışı | Halat çekme |
|---|---|---|---|
| 1+ | Kalp yağmuru | Gaz | Çek |
| 5+ | Gözlük takar | Turbo | Güçlü çekiş |
| 20+ | Fes + davul zurna | Nitro | Süper çekiş |
| 99+ | Altın robot, herkes zıplar | Muz kabuğu (rakipler kayar) | Rakip kayar |
| 199+ | Dev robot (20 sn) | Roket | Dev yardımcı |
| 500+ | Halay şöleni | Şimşek (rakipler durur) | Deprem |

En çok hediye atan halaybaşı olur, mendil onda. Herkesin birlikte doldurduğu elmas hedefi tamamlanınca 30 saniye bütün robotlar altın olur.

Para ya da ödül dağıtılmaz; oyun yalnızca eğlence ve sıralama içindir.

**Yapay zekâ sunucu**: oyunun açılış ekranındaki "Yapay zekâ sunucu konuşsun" kutusu açıksa turları duyurur, gelenleri karşılar, hediye ve takip için teşekkür eder, sessiz anlarda izleyicileri oyuna çağırır. Ses sunucuda Piper (Türkçe `tr_TR-dfki-medium`) ile üretilir; ses henüz kurulmadıysa telefonun kendi Türkçe sesi kullanılır.

## Sunucu kurulumu (tek satır)

Ubuntu/Debian sunucuda root olarak:

```bash
curl -fsSL https://raw.githubusercontent.com/olcaydunder/herkes-piste/main/kur.sh | bash
```

Kurulum Node.js, Caddy (otomatik HTTPS), Türkçe yapay zekâ sesi (Piper) ve servisi kurar, sonunda oyun adresini yazar. Sunucu 2 dakikada bir bu depodan güncellemeleri çeker; ses eksikse onu da kendisi kurar.

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
