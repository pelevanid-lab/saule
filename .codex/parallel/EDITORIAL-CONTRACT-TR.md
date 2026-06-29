# Saule Yaşayan Kitabı — Türkçe Editoryal Sözleşme

Bu sözleşme, Bölüm 6–24 ile ilgili eklerin paralel yazımında bütünlüğü korumak için bağlayıcı çalışma standardıdır. Ana metne yalnızca merkezi editoryal kontrolden geçen taslaklar alınır.

## 1. Kitabın yeni bağlamı

- Yaşayan Kitap, Saule Core'un kurucu bilgi ve ürün felsefesi kaynağıdır.
- İnsan ve gündelik hayat ağırlık merkezi Saule Life'tır; Saule Business ve Saule Creative aynı ilkelerin farklı bağlamlarda nasıl göründüğünü doğal örneklerle taşır.
- Core, Life, Business ve Creative adları her alt başlıkta mekanik biçimde tekrarlanmaz. Bağlam gerektirdiğinde görünür olur.
- Metin, bir yapay zekânın insanı daha çok yönetmesini değil; onun bağlamını anlamasını, iradesini korumasını ve baskıyı azaltmasını temellendirir.

## 2. Bölüm sırası

1–5 onaylı temel bağlamdır. Devam sırası şöyledir:

- 06 — Sürekli Bağlam Değiştirmenin Bilişsel Maliyeti
- 07 — Mevcut Üretkenlik Sistemleri Neden Başarısız Oluyor
- 08 — Bellek
- 09 — Kimlik
- 10 — Duygular
- 11 — Motivasyon
- 12 — Alışkanlıklar
- 13 — Karar Verme
- 14 — İlişkiler
- 15 — Yansıtma
- 16 — Anlam
- 17 — Saule Neden Var?
- 18 — Uyum Sağlamak Ne Demektir?
- 19 — Uyumlanabilir Zekâ
- 20 — Güven
- 21 — Şefkat
- 22 — Unutma
- 23 — Etik
- 24 — İrade

## 3. Editoryal derinlik

- Her ana bölüm tek bir fikrin uzatılmış özeti değildir; kavramsal ayrımlar, mekanizmalar, gündelik örnekler, karşı örnekler, sınırlar ve ürün sonuçları birlikte işlenir.
- Bölüm 5'in seviyesi alt sınırdır. Genel hedef 9–12 anlamlı alt başlık, gerektiği kadar uzun ve akıcı paragraf, 8–12 açık soru ve 9–14 tasarım kararıdır.
- Metin akademik makale gibi donuk, pazarlama metni gibi iddialı veya kişisel gelişim metni gibi buyurgan yazılmaz.
- Okur suçlanmaz. Davranış; kişi, bağlam, çevre, kapasite, ilişki ve sistem baskısı birlikte düşünülerek açıklanır.
- Bölümün merkez önermesi açıkça kurulmalı ve sonuçta Saule'nin tasarımına bağlanmalıdır.

## 4. Kaynak ve atıf standardı

- Kaynakçada bulunan temel yazar ve çalışmalar, destekledikleri iddianın yakınında metin içinde doğal biçimde anılır.
- Bir kaynak yalnızca kaynakçayı kalabalıklaştırmak için eklenmez. Metinde karşılığı olmayan kaynak çıkarılır; kaynağı olmayan güçlü bilimsel iddia yumuşatılır veya desteklenir.
- Birincil araştırmalar, sistematik derlemeler, meta-analizler ve alanın kurucu çalışmaları tercih edilir.
- Popüler kitaplar kavramsal çerçeve veya anlatı için kullanılabilir; klinik ya da nedensel kanıt yerine geçirilmez.
- Kaynak künyeleri tutarlı ve yeterince tam olmalıdır: yazar, yıl, başlık, yayın/dergi, cilt-sayı ve sayfa/DOI mümkün olduğunda belirtilir.
- Doğrudan alıntı zorunlu olmadıkça kullanılmaz; fikirler özgün Türkçeyle ve anlamı bozulmadan aktarılır.

## 5. Klinik ve etik sınır

- Saule tanı koymaz, tedavi önermez, kriz yönetimini tek başına üstlenmez ve kendisini terapist, hekim ya da ruhsal otorite olarak sunmaz.
- Klinik kavramlarla gündelik güçlükler birbirine karıştırılmaz. Normal insan çeşitliliği otomatik olarak patolojikleştirilmez.
- Riskli veya hassas alanlarda belirsizlik görünür kılınır; gerektiğinde profesyonel ve insani desteğe yönlendirme sınırı korunur.
- Hassas veriler için açık izin, veri minimizasyonu, düzeltme, unutma, silme ve geri alma hakkı temel kabul edilir.

## 6. Saule ürün felsefesine çeviri

Her bölüm şu sorulara somut yanıt vermelidir:

- Saule bu insan gerçeğini nasıl fark edebilir?
- Hangi çıkarımı yapmamalıdır?
- Ne zaman konuşmalı, ne zaman sessiz kalmalıdır?
- Kullanıcıya hangi denetim, düzeltme ve geri dönüş yolunu vermelidir?
- Başarıyı etkileşim, tamamlama ya da bağımlılık yerine hangi insani ölçütle değerlendirmelidir?

## 7. Dil ve biçim

- Dil doğal, çağdaş ve temiz Türkçedir. “Chapter”, gereksiz İngilizce terimler ve yarı çevrilmiş ifadeler kullanılmaz.
- Türkçe karakterler, apostroflar, tırnaklar ve noktalama UTF-8 olarak korunur.
- Başlıklar iddialı olabilir; içerik başlığın iddiasını gerçekten karşılamalıdır.
- “Dolayısıyla”, “bu nedenle” ve benzeri bağlaçlar mekanik tekrar edilmez.
- Core adları özel isim olarak yazılır: Saule Core, Saule Life, Saule Business, Saule Creative.

## 8. Teknik teslim şeması

Her taslak yalnızca şu biçimde teslim edilir:

```json
{
  "draft": {
    "sections": [],
    "open_questions": [],
    "design_decisions": [],
    "future_evolution": "",
    "references": []
  }
}
```

Ek alanlar üretim JSON'una eklenmez. Her dosya `JSON.parse` ile doğrulanır. Merkezi birleşimden sonra tüm Türkçe içerik dosyaları yeniden ayrıştırılır; bozuk karakter dizileri ve metin–kaynak uyumu ayrıca taranır.

## 9. Onay kapısı

- Önce yalnızca Türkçe sürüm editoryal kontrol noktasına getirilir.
- Kullanıcı Türkçe metni onaylamadan diğer dillere çeviri yapılmaz.
- Çeviri, sözcük sözcük aktarım değil; onaylı anlam, ton, atıf ve ürün felsefesinin hedef dilde korunmasıdır.
