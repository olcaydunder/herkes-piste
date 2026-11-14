# Herkes Piste

TikTok LIVE için izleyicilerin yönettiği halay, araba yarışı ve halat çekme oyunu. Bilgisayar gerekmez: oyun telefonda tarayıcıda açılır, TikTok'un **Mobil oyun** (ekran paylaşımı) yayınıyla yayına verilir. Sunucu, yayındaki yorum, beğeni ve hediyeleri okuyup oyuna aktarır. Türkçe konuşan bir yapay zekâ sunucu oyunu anlatır.

## Oyun

23 oyun kendiliğinden sırayla döner (her biri 1-1,5 dakika, arada halay). Ekran telefon ve Galaxy Tab S11 Ultra gibi geniş dikey tabletler için ayrı ayarlanır.

**Halay**: `GİR` katıl, `HOP` zıpla, `SELAM` el salla; beğeni coşkuyu doldurur, en çok hediye atan halaybaşı olur.

**Takım oyunları** (`1` Sarı, `2` Mavi, `3` Pembe yazıp takım seçilir; beğeni ve yorum takıma güç verir)
- Araba yarışı, Balon şişirme, Kule yarışı, Roket yarışı (önce bitiren kazanır)
- Boyama yarışı (en çok kare), Basket atışı (en çok sayı)
- Halat çekme, Yağlı güreş, Futbol (en çok gol), Kartopu savaşı (rakibin duvarını ilk yıkan)

**Bilgi oyunları** (cevap yoruma yazılır; ilk bilen 3 puan, turun birincisi ilan edilir)
- Bilgi yarışması ve Bayrak bil (A/B/C), Doğru mu yanlış mı (D/Y)
- Kelime avı, Atasözü tamamla, Hızlı matematik, Renk tuzağı, Kaç tane?, Hafıza oyunu, Hızlı yazma

**Topluluk oyunları**
- Memleket yarışı: plaka ya da şehir adı yazılır, en kalabalık memleket kazanır
- Büyük oylama: "Çay mı, kahve mi?" gibi sorulara 1 ya da 2 yazılır

**Hediye menüsü**: her oyunun ekranında 6 kademe yazar (1+, 5+, 20+, 99+, 199+, 500+ elmas). Takım oyunlarında turbo, nitro, rakibi kaydırma gibi etkiler; bilgi oyunlarında herkese ipucu, ek süre, çift puan; halayda gözlük, fes, altın ve dev robot. Hediye atan kişi kendine puan almaz. Herkesin birlikte doldurduğu elmas hedefi tamamlanınca 30 saniye bütün robotlar altın olur.

Belli bir oyunla başlamak için adresin sonuna `?tur=bilgi` gibi oyunun adı yazılır; sırayı değiştirmek için `?sira=halay,yaris,bilgi`.

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
