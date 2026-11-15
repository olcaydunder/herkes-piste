# Herkes Piste

TikTok LIVE için izleyicilerin yönettiği halay, araba yarışı ve halat çekme oyunu. Bilgisayar gerekmez: oyun telefonda tarayıcıda açılır, TikTok'un **Mobil oyun** (ekran paylaşımı) yayınıyla yayına verilir. Sunucu, yayındaki yorum, beğeni ve hediyeleri okuyup oyuna aktarır. Türkçe konuşan bir yapay zekâ sunucu oyunu anlatır.

## Oyun

100 oyun kendiliğinden sırayla döner. Halay dahil her oyun 4 dakika sürer; her 6 oyunda bir halay gelir, bir tam tur yaklaşık 8 saattir. Karakterler insan: her izleyicinin kendine özgü, her yayında aynı kalan görünümü var (ten, saç, bıyık, yazma). Ekran telefon ve Galaxy Tab S11 Ultra gibi geniş dikey tabletler için ayrı ayarlanır.

**Halay (4 dakika)**: `GİR` katıl, `HOP` zıpla, `SELAM` el salla; beğeni coşkuyu doldurur, en çok hediye atan halaybaşı olur. Halay sırasında sırayla kısa etkinlikler gelir: kostüm zamanı, hop dalgası, düğün var (gelin ve damat), nereden izliyorsun (şehirlere selam), arkadaşını çağır. Halayın sonunda izleyiciler sıradaki üç oyundan birini `1`, `2` ya da `3` yazarak seçer.

**Kostümler**: izleyici yoruma `gelin`, `damat`, `sağdıç`, `kız`, `erkek` ya da `hamam böceği` yazınca karakteri ona dönüşür (gelinlik, duvak ve taç; takım elbise ve papyon; sağdıç kuşağı; dans eden hamam böceği). Seçim bu cihazda kalıcıdır. "herkes gelin" gibi cümleler kostüm sayılmaz. Halayda hem gelin hem damat varsa düğün kutlaması yapılır.

**Takım oyunları (25, her biri 4 dakika ve birkaç tur)** — `1` Sarı, `2` Mavi, `3` Pembe yazıp takım seçilir; beğeni ve yorum takıma güç verir, en çok turu kazanan şampiyon olur:
araba yarışı, düğün konvoyu, at yarışı, bisiklet, yüzme, tren, kayak, uçurtma, balon şişirme, kule, düğün pastası, roket, kayık, duvar tırmanışı, boyama, basket, havai fişek şovu, halat çekme, yağlı güreş, bilek güreşi, futbol, voleybol, kartopu savaşı, su savaşı, dans düellosu.

**Bilgi yarışmaları (70, her biri 4 dakika)** — cevap yoruma yazılır, ilk bilen 3 puan alır, turun birincisi ilan edilir. Sorular zor: sayısal ve hesaplanan sorularda 4 şık var, üreticiler büyük sayılar ve uzun kelimeler kullanır. Düşünme süresi eskisinin 1,5 katıdır; süre bittiğinde kimse bilememişse bir kez ek süre verilir. Üst üste 3, 5, 7 ve 10 soru bilen kutlanır.
- Şıklı (A/B/C): bilgi, tarih, Osmanlı tarihi, Cumhuriyet tarihi, dünya tarihi, coğrafya, bilim, hayvanlar alemi, evcil dostlar, deniz canlıları, bitkiler, vücudumuz, spor, uzay, müzik, icatlar ve mucitler, ünlü yapılar, kitap kimin, Türk mutfağı, dünya mutfağı, hangi ilin meşhuru, İngilizce kelime, İngilizcesi ne, Almanca kelime, deyimler, eski kelimeler, doğru yazım, eş ve zıt anlamlılar, farklı olanı bul, başkentler, hangi kıtada, para birimleri, Türkiye'yi tanı, en'ler, plaka bil, hangi bölgede, bayrak bil, saat kaç, zaman hesabı, hangisi büyük, alfabe, emoji bilmece, meslekler, kısaltmalar, teknoloji, yavrular ve sesler, düğün gelenekleri, en çok hangisi
- Doğru mu yanlış mı (D/Y): doğru mu yanlış mı, efsane mi gerçek mi, sayı doğru mu
- Yazarak: kelime avı, eksik harf, tersten oku, atasözü tamamla, isim şehir, hızlı matematik, çarpım tablosu, yüzde hesabı, para üstü, Romen rakamı, sayı dizisi, sayılarla bilgi, kaç harfli, kaç heceli, renk tuzağı, kaç tane, hafıza oyunu, hızlı yazma

**Topluluk**: memleket yarışı (plaka ya da şehir adı), büyük oylama, bu mu şu mu, düğün oylaması (1 ya da 2).

Soru bankaları `public/sorular.js` dosyasındadır.

**İzleyiciyi bağlayan sistem**
- Seviye: yorum, beğeni, doğru cevap, takım zaferi, takip, paylaşım ve hediye seviye puanı kazandırır; seviye adın yanında yazar ve yayından yayına kalır (oyunun açık olduğu cihazda saklanır).
- Günlük seri: üst üste gelen izleyici adıyla karşılanır ("3 gündür buradasın").
- Bugünün en iyileri: halay sırasında gün içinde en çok puan toplayanlar gösterilir.
- Altın tur: her 6 oyunda bir puanlar ve seviye puanı iki kat; bir önceki turda duyurulur.
- Beğeni hedefi ve elmas hedefi çubukları, davet kralı (en çok paylaşan), dönen çağrı yazıları ve yapay zekâ sunucunun paylaşma, takip ve beğeniye çağırması.
- Doğum günü: yoruma "doğum günüm" yazan izleyici günde bir kez adıyla kutlanır (afiş, konfeti, havai fişek).
- Beğeni yağmuru: her oyunda birkaç dakikada bir 20 saniyelik ortak beğeni hedefi açılır; tutarsa kalp yağar, beğenen herkes +10 seviye puanı alır, takımlara turbo ya da sıradaki soruya çift puan gelir. Beğeniler arttıkça ekrana kalp yağar.
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

Kurulum Node.js, Caddy (otomatik HTTPS), Türkçe yapay zekâ sesi (Piper) ve servisi kurar, sonunda oyun adresini yazar. Sunucu 2 dakikada bir bu depodan güncellemeleri çeker; ses eksikse onu da kendisi kurar. Açık olan oyun sayfası yeni sürümü sayfayı yenilemeden yükler; ses kapanmaz, kimsenin dokunması gerekmez (yalnızca `index.html` değişirse sayfa bir kez yenilenir).

Ayarlar `/opt/herkes-piste/.env` dosyasındadır:
- `TIKTOK_KULLANICI` — yayın yapan hesap (varsayılan `herkes.piste`)
- `EULER_API_KEY` — isteğe bağlı; bağlantı sınırına takılırsa https://www.eulerstream.com adresinden ücretsiz anahtar alınıp buraya yazılır

## Yayın açarken

1. Oyun adresini telefonda Chrome'da aç, **BAŞLAT**'a dokun. Bir kez başlatıldıktan sonra giriş ekranı bir daha çıkmaz, oyun kendiliğinden başlar.
   Chrome menüsünden **Ana ekrana ekle** yapılırsa oyun ana ekrandaki simgeden tam ekran açılır ve ses hiç dokunmadan açılır (Chrome, ana ekrana eklenen sitelerde sesi kendiliğinden çalmaya izin verir). Eklenmediyse ses için ekrana bir kez dokunmak yeter.
2. TikTok: **+** → **CANLI** → **Mobil oyun** → **Canlı yayına başla**, ekran paylaşımına izin ver.
3. Chrome'a geri dön. Oyun birkaç saniyede yayına bağlanır.

Deneme için: oyun adresinin sonuna `/?demo` ekle (sahte izleyicilerle çalışır).

## Yerelde çalıştırma

```bash
npm install
npm run simulasyon   # sahte olaylarla
npm start            # gerçek yayına bağlanır
```
