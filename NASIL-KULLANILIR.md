# 🎵 Frekans Müzik Platformu - Kullanım Kılavuzu

## 📌 Şarkı Nasıl Eklenir?

### ✅ Yöntem 1: ANA SAYFA ARAMA (Önerilen)

1. **`index.html` sayfasını aç** (Ana sayfa)
2. **Üstteki arama kutusuna** şarkı veya sanatçı adı yaz
   - Örnek: "Coldplay", "Imagine Dragons", "rock", "pop"
3. Otomatik olarak **Deezer'dan gerçek şarkılar** gelecek
4. Her şarkının yanında butonlar var:
   - ❤️ **Beğen butonu** - Favorilere ekler
   - ➕ **Playlist butonu** - Çalma listene ekler
   - ▶️ **Play butonu** - Şarkıyı çalar (30 sn önizleme)

### ✅ Yöntem 2: AI ÖNERİ SİSTEMİ

1. **`index.html` sayfasındayken**
2. **Sağ üstteki "AI Öneri"** butonuna tıkla
3. 3 seçenek var:
   - 🎭 **Ruh Halime Göre** - Saate göre şarkı önerir (sabah: neşeli, gece: sakin)
   - 🎸 **Türe Göre** - En çok dinlediğin sanatçılara benzer şarkılar
   - 💖 **Favorilerime Benzer** - Beğendiğin şarkılara göre öneri
4. Seçtiğin moda göre **Deezer'dan canlı öneriler** gelir
5. Şarkıları favorilere ekleyebilir, dinleyebilirsin

### ✅ Yöntem 3: POPÜLER ŞARKILAR

1. **`index.html` sayfasını aç**
2. Sayfa açılır açılmaz otomatik olarak **Deezer'ın güncel chart'ı** yüklenir
3. En popüler 20 şarkı görünür
4. Dilediğini beğenebilir, çalma listene ekleyebilirsin

---

## 📁 Şarkılar Nerede Saklanıyor?

### 🎯 Favoriler (Beğendiklerim)
- **Konum**: `favorites.html` sayfası
- **Nasıl Gidilir**: Sol menüden "❤️ Beğendiklerim" tıkla
- **Veri**: `localStorage.favorites` (tarayıcı hafızası)
- **Özellik**: Beğendiğin tüm şarkılar burada toplanır

### 🎯 Çalma Listeleri
- **Konum**: `playlists.html` sayfası
- **Nasıl Gidilir**: Sol menüden "📋 Çalma Listem" tıkla
- **Veri**: `localStorage.playlists` (tarayıcı hafızası)
- **Özellik**: Kendi listelerini oluştur, şarkıları kategorize et

### 🎯 Son Çalınanlar (Play History)
- **Konum**: `profile.html` sayfası - "Son Çaldıklarım" bölümü
- **Nasıl Gidilir**: Sağ üst profil ikonu → "Profil"
- **Veri**: `localStorage.playHistory` (tarayıcı hafızası)
- **Özellik**: Hangi şarkıları kaç kez dinlediğini gösterir

---

## 🎹 Özellikler

### ✅ Gerçek Müzik (Deezer API)
- **30 saniye önizleme** her şarkıda
- **Milyonlarca şarkı** arasından arama
- **Güncel chart'lar** (popüler şarkılar)
- **Sanatçı şarkıları** (Coldplay, Ed Sheeran vs.)

### ✅ Favoriler Sistemi
- Beğendiğin şarkıları kaydet
- İstediğin zaman ulaş
- Profil sayfanda görün

### ✅ Çalma Listeleri
- Kendi listelerini oluştur
- Şarkıları düzenle
- Arkadaşlarınla paylaş

### ✅ Sosyal Özellikler
- Arkadaş ekle
- Arkadaşların neler dinliyor gör
- Şarkı paylaş
- Aktivite akışı

### ✅ Profil & İstatistikler
- Kaç arkadaşın var
- En çok dinlediğin şarkılar
- Toplam çalma sayısı
- Aktivite zaman çizelgesi

---

## 🚀 Hızlı Başlangıç

1. **`login.html`** - Giriş yap veya kayıt ol
2. **`index.html`** - Ana sayfaya git
3. **Arama kutusuna** bir şey yaz
4. **Play butonuna** bas → Şarkı çalsın
5. **❤️ butonuna** bas → Favorilere eklensin
6. **`favorites.html`** - Favorilerini gör

---

## 🔍 Test Sayfaları

### 📊 `test-deezer.html`
**Ne İşe Yarar**: Deezer API'nin gerçekten çalıştığını gösterir
- Popüler şarkıları test et
- Arama yap
- Sanatçı şarkılarını getir
- Her testte **gerçek veriler** görünür

**Nasıl Kullanılır**:
1. `test-deezer.html` dosyasını tarayıcıda aç
2. F12'ye bas (Console'u aç)
3. "Deezer Chart'ı Getir" butonuna tıkla
4. Konsolda **API çağrılarını** gör
5. Play butonuna tıkla → **30 sn gerçek müzik çalar**

---

## 💡 İpuçları

### ✅ Şarkı Bulamıyorum
- İngilizce arama dene (örn: "Coldplay" yerine "coldplay")
- Daha genel terimler kullan (örn: "rock", "pop", "electronic")
- Sanatçı adını tam yaz

### ✅ Şarkı Çalmıyor
- İnternet bağlantını kontrol et
- Sayfayı yenile (F5)
- Konsolda (F12) hata var mı bak
- `test-deezer.html` ile test et

### ✅ Favoriler Kayboldu
- Tarayıcı geçmişini sildin mi? (localStorage siler)
- Gizli pencerede mi çalışıyorsun? (localStorage çalışmaz)
- Başka tarayıcı kullanıyor musun? (Her tarayıcı ayrı localStorage)

### ✅ Daha Hızlı Arama
- En az 2-3 karakter yaz
- 500ms bekledikten sonra arama başlar (debounce)
- Her tuşta arama yapmaz (performans için)

---

## 📞 Teknik Detaylar

### API Bilgileri
- **API**: Deezer Web API (https://api.deezer.com)
- **CORS Proxy**: corsproxy.io
- **Rate Limit**: Yok (free tier)
- **Authentication**: Gerekmiyor
- **Preview**: 30 saniye MP3

### Veri Yapısı
```javascript
// Favoriler
localStorage.favorites = [
  {
    id: 123456,
    title: "Yellow",
    artist: "Coldplay",
    album: "Parachutes",
    cover: "https://...",
    preview: "https://...mp3",
    duration: 266
  }
]

// Çalma Listesi
localStorage.playlists = [
  {
    id: "uuid-123",
    name: "Sabah Kahvesi",
    description: "Güne başlarken...",
    tracks: [...],
    createdAt: "2025-10-19T10:30:00"
  }
]

// Play History
localStorage.playHistory = [
  {
    track: {...},
    playedAt: "2025-10-19T10:30:00",
    count: 5
  }
]
```

---

## 🎯 Özet

**Şarkı Eklemek İçin:**
1. `index.html` aç
2. Arama kutusuna yaz
3. ❤️ butonuna tıkla (favori)
4. ➕ butonuna tıkla (playlist)

**Basit!** 🎵✨
