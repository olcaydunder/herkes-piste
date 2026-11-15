# Herkes Piste

TikTok LIVE için izleyicilerin yönettiği halay, araba yarışı ve halat çekme oyunu. Bilgisayar gerekmez: oyun telefonda tarayıcıda açılır, TikTok'un **Mobil oyun** (ekran paylaşımı) yayınıyla yayına verilir. Sunucu, yayındaki yorum, beğeni ve hediyeleri okuyup oyuna aktarır. Türkçe konuşan bir yapay zekâ sunucu oyunu anlatır.

## Oyun

50 oyun kendiliğinden sırayla döner (her biri 1-1,5 dakika, her 6 oyunda bir halay). Karakterler insan: her izleyicinin kendine özgü, her yayında aynı kalan görünümü var (ten, saç, bıyık, yazma); halayda yöresel kıyafet, takım oyunlarında takım rengi. Ekran telefon ve Galaxy Tab S11 Ultra gibi geniş dikey tabletler için ayrı ayarlanır.

**Halay**: `GİR` katıl, `HOP` zıpla, `SELAM` el salla; beğeni coşkuyu doldurur, en çok hediye atan halaybaşı olur.

**Takım oyunları (13)** — `1` Sarı, `2` Mavi, `3` Pembe yazıp takım seçilir; beğeni ve yorum takıma güç verir:
araba yarışı, balon şişirme, kule, roket, kayık yarışı, duvar tırmanışı, boyama, basket atışı, halat çekme, yağlı güreş, futbol, kartopu savaşı, dans düellosu.

**Bilgi yarışmaları (34)** — cevap yoruma yazılır, ilk bilen 3 puan alır, turun birincisi ilan edilir:
- Şıklı (A/B/C): bilgi, tarih, coğrafya, bilim, hayvanlar alemi, spor, uzay, Türk mutfağı, İngilizce kelime, deyimler, doğru yazım, eş ve zıt anlamlılar, farklı olanı bul, başkentler, Türkiye'yi tanı, en'ler, plaka bil, hangi bölgede, bayrak bil, saat kaç, en çok hangisi, doğru mu yanlış mı (D/Y)
- Yazarak: kelime avı, eksik harf, tersten oku, atasözü tamamla, isim şehir, hızlı matematik, sayı dizisi, renk tuzağı, kaç tane, hafıza oyunu, hızlı yazma

**Topluluk**: memleket yarışı (plaka ya da şehir adı), büyük oylama (1 ya da 2).

Soru bankaları `public/sorular.js` dosyasındadır.

**İzleyiciyi bağlayan sistem**
- Seviye: yorum, beğeni, doğru cevap, takım zaferi, takip, paylaşım ve hediye seviye puanı kazandırır; seviye adın yanında yazar ve yayından yayına kalır (oyunun açık olduğu cihazda saklanır).
- Günlük seri: üst üste gelen izleyici adıyla karşılanır ("3 gündür buradasın").
- Bugünün en iyileri: halay sırasında gün içinde en çok puan toplayanlar gösterilir.
- Altın tur: her 6 oyunda bir puanlar ve seviye puanı iki kat; bir önceki turda duyurulur.
- Beğeni hedefi ve elmas hedefi çubukları, davet kralı (en çok paylaşan), dönen çağrı yazıları ve yapay zekâ sunucunun paylaşma, takip ve beğeniye çağırması.
- Hediye atan kişinin fotoğrafı ve adı büyük gösterilir, destekçilere adlarıyla teşekkür edilir. Sunucu hediye istemez (TikTok kuralı); yalnızca hediyenin oyunda ne yaptığını anlatır.

**Hediye menüsü**: her oyunun ekranında 6 kademe yazar (1+, 5+, 20+, 99+, 199+, 500+ elmas). Takım oyunlarında turbo, nitro, rakibi kaydırma gibi etkiler; bilgi oyunlarında herkese ipucu, ek süre, çift puan; halayda gözlük, fes, altın ve dev karakter. Hediye atan kişi kendine puan almaz.

Belli bir oyunla başlamak için adresin sonuna `?tur=tarih` gibi oyunun adı yazılır; sırayı değiştirmek için `?sira=halay,yaris,bilgi`.

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
