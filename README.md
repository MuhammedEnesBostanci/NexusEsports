# NEXUS ESPORTS — Sunum Notları

---

## Projenin Konusu

Nexus Esports, Türkiye'ye yönelik kurgusal bir espor haber ve maç takip platformudur.
HLTV.org'dan ilham alınarak tasarlanmıştır; koyu tema, turuncu vurgu rengi ve kompakt bilgi yoğunluğu bu ilhamın doğrudan yansımalarıdır.

Platform şu sayfalardan oluşur:

| Sayfa | İçerik |
|---|---|
| `index.html` | Ana sayfa — canlı maçlar, haberler, maç takvimi, sonuçlar |
| `haberler.html` | Haber listesi, oyun bazlı filtre sekmeleri |
| `maclar.html` | 5 oyunun canlı maç kartları, detaylı canlı panel |
| `hakkimda.html` | Takım sayfası |
| `iletisim.html` | İletişim formu |
| `haber-*.html` | 5 ayrı haber detay sayfası |
| `admin.html` | Gelen mesajlar için şifreli admin paneli |

---

## Hedef Kullanıcı Kitlesi

- **Birincil:** Türkiye'deki rekabetçi oyun takipçileri (CS2, VALORANT, LoL, Dota 2, PUBG)
- **İkincil:** Espor organizasyonları ve takımlar
- Kullanıcıların siteyi hem masaüstünde hem telefonda rahatça kullanabilmesi esas alındı
- Haber okuma, canlı skor takibi ve iletişim formunu hızlıca bulabilme önceliklendirildi

---

## Kullanılan Tasarım Yaklaşımı

**Dark-first tasarım:** Tüm tasarım koyu temadan başlatıldı, açık tema alternatifi kurgulanmadı. Espor kullanıcılarının beklentisi bu yönde.

**Renk sistemi:**
- Arka plan: `#1b1c1f` (derin koyu gri)
- Yüzey katmanı: `#242528`
- Ana vurgu: `#f5a31a` (HLTV turuncusu)
- Canlı maç yeşili: `#5ec76c`

**Tipografi:**
- Başlıklar: `Rajdhani` — espor dünyasına özgü köşeli, kompakt görünüm
- Gövde: `Inter` — uzun okuma için okunabilirlik

**Bilgi hiyerarşisi:** Her sayfa tek bir ana akış üzerine kuruldu. Kullanıcı sayfaya girdiğinde önce en güncel/önemli içerik görünür (canlı maçlar → haberler → program).

---

## Responsive Yapı Çalışmaları

Projenin tamamı mobil öncelikli (mobile-first) değil, içerik öncelikli bir yaklaşımla yazıldı; ancak tüm breakpoint'lerde çalışır.

**Kullanılan teknikler:**

### CSS Grid — `auto-fit` ile otomatik sütun dağılımı
```css
/* Canlı maç kartları — ekran genişliğine göre otomatik sütun sayısı */
.live-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-sm);
}

/* İki sütunlu sayfa düzeni */
.content-grid {
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width);
}
```

### Fluid tipografi — `clamp()` ile ekrana duyarlı boyutlar
```css
--text-3xl: clamp(1.6rem, 3.8vw, 2rem);
--space-xl: clamp(1.5rem, 3.5vw, 2.5rem);
```
Sabit `px` yerine `clamp()` kullanıldığı için yazı boyutu ve boşluklar ekrana orantılı küçülüp büyür; medya sorgusu gerekmez.

### Media query breakpoint'leri
```css
@media (max-width: 900px) { /* Tablet */ }
@media (max-width: 600px) { /* Mobil */ }
```
- 900px altında sidebar gizlenir, tek sütuna düşülür
- 600px altında detay panelleri tek sütuna geçer, kill feed gizlenir
- Navbar hamburger menüye dönüşür, JavaScript ile toggle edilir

### `min()` ile güvenli container genişliği
```css
.container {
  width: min(1240px, 100% - 2rem);
  margin-inline: auto;
}
```

---

## Kullanılan Modern CSS Özellikleri

### 1. CSS Custom Properties (Değişkenler)
Tüm renkler, boşluklar, yarı çaplar ve geçişler `:root` içinde değişken olarak tanımlandı. Bir reng değiştirmek istediğinizde tek satır yeterli.

```css
:root {
  --clr-primary: #f5a31a;
  --radius-md:   8px;
  --transition:  0.25s ease;
}
```

### 2. `clamp()` — Fluid boyutlandırma
Hem font boyutu hem boşluk sistemi `clamp(min, tercih, max)` ile yazıldı. Toplam 18 fluid değişken tanımlandı.

### 3. CSS Grid — karmaşık layout'lar
- `grid-template-columns: repeat(auto-fit, minmax(...))` ile responsive kart grid'i
- `grid-template-columns: 1fr sidebar` ile ana içerik + kenar çubuğu düzeni
- Detay panel içinde `1fr 1fr 260px` üç sütunlu oyuncu tablosu

### 4. `backdrop-filter` — Cam efekti navbar
```css
.navbar {
  background: rgba(13, 14, 15, 0.96);
  backdrop-filter: blur(8px);
}
```
Sayfayı kaydırdıkça navbar arka planı buzlu cam gibi içeriği bulanıklaştırır.

### 5. `color-mix()` — Dinamik renk karıştırma
```css
.ldp-feed-item.kill {
  background: color-mix(in srgb, var(--clr-primary) 10%, transparent);
}
```
Sabit hex kodu yerine CSS içinde canlı renk karıştırma kullanıldı.

### 6. CSS Animations ve `@keyframes`
- `.tag-live::before` — canlı nokta nabız animasyonu
- `score-flash` — skor değişince kısa parıldama
- `slide-in`, `fade-up` — scroll reveal için giriş animasyonları
- Maç kartlarında `translateY(-2px)` hover kaldırma efekti

### 7. Sticky positioning
```css
.navbar { position: sticky; top: 0; z-index: 1000; }
```

### 8. `aspect-ratio`
Haber görselleri için sabit oran korundu, görseller uzamaz.

### 9. Logical properties
```css
margin-inline: auto;    /* margin-left + margin-right */
padding-inline: 1rem;
```

---

## Erişilebilirlik Çalışmaları

Erişilebilirlik sonradan eklenen bir özellik değil, HTML yazılırken entegre edildi.

### Semantik HTML yapısı
- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` doğru amaçlarına uygun kullanıldı
- Başlık hiyerarşisi (`h1` → `h2` → `h3`) her sayfada doğru sıra izliyor
- Tablo yapılarında `role="table"`, `role="row"`, `role="columnheader"` kullanıldı

### ARIA etiketleri
```html
<nav aria-label="Ana Navigasyon">
<button aria-expanded="false" aria-controls="navLinks" aria-label="Menüyü aç/kapat">
<section aria-labelledby="liveTitle">
<span aria-hidden="true">🔴</span>   <!-- Dekoratif ikonlar ekran okuyucudan gizlendi -->
```
Projede 200'den fazla `aria-` niteliği kullanıldı.

### Klavye erişimi
- `:focus-visible` ile klavye odağı görünür hale getirildi, mouse ile gezinirken gösterilmedi
- Arama overlay'i `Escape` tuşuyla kapatılıyor, `Ctrl+K` ile açılıyor
- Tüm buton ve linkler klavyeyle ulaşılabilir

### Görsel kontrastı
- Metin renklerinde WCAG AA standardı hedeflendi
- Dekoratif SVG logoların `alt=""` niteliği boş bırakıldı (ekran okuyucu atlar)
- Bilgi taşıyan görsellerde açıklayıcı `alt` metni yazıldı

### Visually hidden yardımcı sınıf
```css
.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  clip: rect(0,0,0,0);
  white-space: nowrap;
}
```
Ekranda görünmesi gerekmeyen ama ekran okuyucunun okuması gereken metinler için kullanıldı.

---

## Karşılaşılan Problemler

### 1. Canlı maç simülasyonu — sözdizimi hataları
CS2, VALORANT, LoL, Dota 2 ve PUBG için ayrı simülasyon döngüleri yazıldı (~400 satır). Kod büyüdükçe eski fonksiyon kalıntıları JavaScript dosyasında sözdizimi hatası oluşturdu. Hata ayıklama `node --check script.js` komutuyla yapıldı, problem birden fazla düzenleme geçişiyle çözüldü.

### 2. Aynı element ID'sinin iki sayfada kullanımı
Canlı skor güncellemesi `getElementById` ile çalıştığından `live-cs2-a` gibi ID'ler hem `index.html` hem `maclar.html`'de kullanıldı. JavaScript aynı dosya olduğundan, ilgili eleman hangi sayfada yoksa sessizce geçiyor — bu davranış kasıtlı kullanıldı.

### 3. CSS panel görünürlüğü — class çakışması
Detay paneller başlangıçta `.ldp-wrap` sarmalayıcıyla gizleniyordu; JavaScript ise `.ldp-panel.active` üzerinde çalışıyordu. İki katman arası çakışma panellerin açılmamasına neden oldu. Çözüm: sarmalayıcı katman kaldırıldı, `.ldp-panel` hem görünürlük hem stil hedefi yapıldı.

### 4. Responsive detay paneli
Üç sütunlu oyuncu tablosu (CT oyuncular / T oyuncular / kill feed) dar ekranlarda taşıyordu. `@media` sorgusuyla 900px altında iki sütuna, 600px altında tek sütuna düşürüldü; kill feed mobilde gizlendi.

---

## Projede Yapılan Özgün Tasarım Kararları

### 1. Canlı maç detay sistemi
Standart bir skor göstergesi yerine gerçek bir maç yayını deneyimi tasarlandı:
- Her oyunun kendine özgü simülasyon mantığı var (CS2 raund ekonomisi, VALORANT spike timer, LoL ejder/baron/kule, Dota 2 Roshan, PUBG zone kapanması)
- Kill feed'de öldüren oyuncu, kullanılan silah/yetenek ve ölen oyuncu ayrı renklerle gösteriliyor
- CS2'de bomba yüklenince kırmızı countdown bar devreye giriyor
- VALORANT'ta spike plant olduğunda timer rengi kırmızıya dönüyor
- PUBG'de takımlar elenince tablodan düşüyor

### 2. Admin paneli — localStorage mesaj sistemi
İletişim formu şifresiz ziyaretçilere açık, gelen mesajlar `localStorage`'a yazılıyor (`nx_mesajlar` anahtarı). Admin paneli (`admin.html`) sessionStorage tabanlı şifre koruması ile açılıyor (kullanıcı: `admin` / şifre: `nexus2026`). Panel; mesajları okundu/okunmadı işaretleme, arama, filtre ve silme özellikleriyle tam işlevsel.

### 3. Tek CSS değişken sistemiyle tutarlı tema
Tüm sayfalar aynı `style.css` dosyasını kullanıyor. Hiçbir sayfaya özgü renk hardcode edilmedi; bir değişken değiştirince tüm site değişiyor.

### 4. Haber detay sayfaları
5 ayrı oyuna ait 5 ayrı detay haberinin her biri kendi içeriğiyle yazıldı (Aurora haber, VALORANT patch notları, LoL Shadow Canyon, Dota 2 Invitational, PUBG kadrosu). Şablon değil, özgün içerik.

### 5. Breaking news ticker
Sayfanın üstündeki kayan haber bandı saf CSS `animation` ile yazıldı; JavaScript kullanılmadı. `translateX` keyframe animasyonu sonsuz döngüde çalışıyor.

---

## Proje İstatistikleri

| Ölçüm | Değer |
|---|---|
| Toplam HTML dosyası | 12 |
| style.css satır sayısı | ~1800 satır |
| script.js satır sayısı | ~1050 satır |
| CSS custom property sayısı | 40+ |
| ARIA niteliği kullanımı | 200+ (index.html tek başına) |
| Desteklenen oyun | 5 (CS2, VALORANT, LoL, Dota 2, PUBG) |
| Backend / Framework | Yok — saf HTML, CSS, JavaScript |
