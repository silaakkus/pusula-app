# Pusula

Pusula, universitede okuyan kadin ogrencilerin bolumlerinden bagimsiz olarak teknoloji kariyerine guvenli bir giris yapabilmeleri icin tasarlanmis, yapay zeka destekli bir kariyer yonlendirme uygulamasidir.

## Problem

Bir cok ogrenci "Bolumum teknolojiye ne kadar yakin?", "Nereden baslamaliyim?", "Hangi rol bana uygun?" sorularina net cevap bulamiyor. Internette cok fazla daginik kaynak var; ancak kisinin bolumune, ilgilerine ve ogrenme bicimine gore kisisel bir rota cikarmak zor.

## Cozum

Pusula, kullanicidan topladigi profil sinyallerini (fakulte, bolum, ilgi alanlari, hedef, calisma tercihi) AI ile yorumlayarak:

- uygun rol onerileri,
- baslangic adimlari,
- ogrenme yol haritalari,
- ve paylasilabilir kariyer karti

uretir. Boylece kullanici, genel tavsiyeler yerine kendine ozel, uygulanabilir bir ilk planla ilerler.

## Proje Hikayesi

Bu proje benim kisisel hikayemden dogdu. Hacettepe Universitesi'nde Istatistik okuyorum. YKS surecinde siralamam yeterli olsaydi Bilgisayar Muhendisligi okumayi istiyordum; ancak hedefledigim universitelerde bu bolum gelmedi. Buna ragmen teknoloji alaninda bir seyler uretmek istiyordum ama nereden baslayacagimi bilmiyordum.

Bolum toplulugumuzda paylasilan programlari takip ederken UP School'un "Birbirini Gelistiren Kadinlar 2026" programini gordum. Ilk modulde basarili olanlara 46 dolar degerinde Google yapay zeka egitimi sunulmasi, teknoloji adımında kendimi gelistirmek adina atabileceğim ilk adımın bu olabileceğini düşündüm ve bu firsati degerlendirip programa basvurdum ve kabul edildim.

Bu yolculukta ogrendigim en onemli sey, dogru yonlendirme oldugunda farkli bolumlerden gelen kadinlarin da teknolojiye guclu bir sekilde adim atabilecegiydi. Pusula'yi, bu bilinci ve programin ruhunu yansitan bir bitirme projesi olarak gelistirdim. Bugun Pusula ile, universiteye yeni adim atmis veya yonunu arayan kadinlarin teknoloji yolculugunda daha net, daha guvenli ve daha cesur adimlar atmasina katkida bulunmayi hedefliyorum.

## AI'nin Rolü

- Profil verilerini baglamsal olarak yorumlar.
- Rol/alan onerilerini kisisellestirir.
- Yönelim testini zenginlestirerek aciklayici aksiyon adimlari uretir.
- Kariyer adimlarini daha anlasilir ve uygulanabilir hale getirir.

## Ozellikler

- Cok adimli profil ve akis yonetimi
- Yönelim testi + sonuc yorumlama
- AI destekli rol ve gelisim onerileri
- Yol haritasi (roadmap) modulu
- Engel yeniden cerceveleme adimi
- PNG olarak indirilebilir "Kariyer Rota Karti"
- n8n webhook entegrasyonu

## Canli Demo

Yayin Linki: **https://pusula-app-two.vercel.app**

## Ekran Goruntuleri

Asagidaki goruntuler README'ye eklenecek sekilde proje icinde tutulabilir:

- Landing ekrani
- Profil akisi
- Yönelim testi ekrani
- Sonuc/oneri ekrani
- Kariyer rota karti

Not: Goruntuleri `assets/screenshots/` altina ekleyip bu bolume markdown image satirlari ile baglayabilirsiniz.

## Portfolyo Metni (200 kelime)

Pusula, universitede okuyan kadin ogrencilerin teknoloji dunyasina geciste yasadigi belirsizlik problemini cozen AI destekli bir web uygulamasidir. Projenin cikis noktasi, bolumu teknoloji odakli olmayan ogrencilerin "Bana uygun alan hangisi, ilk adimi nasil atacagim?" sorularina net bir yanit bulamamasiydi. Pusula bu sorunu, kullanicidan topladigi cok boyutlu profil verisiyle ele aliyor: fakulte-bolum bilgisi, ilgi alanlari, hedefler, ogrenme stili ve calisma tercihleri bir araya getirilerek kisisel bir rota uretiliyor.

Uygulama yalnizca tavsiye veren bir sayfa degil; adim adim ilerleyen bir deneyim sunuyor. Kullanici once profilini olusturuyor, ardindan yonelim testiyle hangi teknoloji alanina daha yakin oldugunu goruyor. Sonraki asamada AI, bu sinyalleri yorumlayip rol onerileri, baslangic aksiyonlari ve ogrenme yol haritalari sunuyor. Ayrica kullanicinin zorlandigi noktalar icin "engel yeniden cerceveleme" adimi eklenerek motivasyonun korunmasi hedefleniyor. Surecin sonunda olusan Kariyer Rota Karti PNG olarak indirilebiliyor ve paylasilabiliyor.

Pusula'nin en guclu tarafi, teknik dili sadeleştirip eyleme donuk bir rehberlige cevirmesi. Bu projeyle amacim, "teknoloji kariyeri bana uzak" hissini azaltmak ve her ogrencinin kendi hizinda ama net bir yonle ilerleyebilecegi erisilebilir bir kariyer deneyimi sunmak.

## Gelistirme

On yuz `web/` klasorundedir.

```bash
cd web
npm install
npm run dev
```

Build:

```bash
cd web
npm run build
```

Ortam degiskenleri icin `web/.env.example` dosyasina bakin.
