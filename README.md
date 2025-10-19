# 🎵 Frekans - Müzik Paylaşım Platformu

Modern ve şık bir müzik paylaşım platformu. Kullanıcılar şarkıları dinleyebilir, beğenebilir, çalma listeleri oluşturabilir ve sosyal özellikleri kullanabilir.

## ✨ Özellikler

### 🎶 Müzik Özellikleri
- **Müzik Çalma**: Gelişmiş müzik oynatıcı ile şarkı dinleme
- **Çalma Listeleri**: Kendi çalma listelerinizi oluşturun ve yönetin
- **Beğendiklerim**: Favori şarkılarınızı kaydedin
- **Arama**: Şarkı, sanatçı ve albüm araması

### 👥 Sosyal Özellikler
- **Arkadaş Sistemi**: Arkadaşlarınızı bulun ve takip edin
- **Müzik Paylaşımı**: Şarkıları arkadaşlarınızla paylaşın
- **Aktivite Akışı**: Arkadaşlarınızın dinleme aktivitelerini görün

### 🎨 Tasarım
- Modern ve şık arayüz
- Karanlık tema
- Responsive tasarım
- Profesyonel UI/UX

## 🚀 Kurulum

1. Projeyi klonlayın:
\`\`\`bash
git clone https://github.com/arafcode/frekans.git
cd frekans
\`\`\`

2. Basit bir HTTP sunucusu ile çalıştırın:

**Python ile:**
\`\`\`bash
python -m http.server 8000
\`\`\`

**Node.js ile (http-server):**
\`\`\`bash
npx http-server -p 8000
\`\`\`

3. Tarayıcınızda açın:
\`\`\`
http://localhost:8000
\`\`\`

## 📁 Proje Yapısı

\`\`\`
frekans/
├── index.html              # Ana sayfa
├── login.html              # Giriş sayfası
├── favorites.html          # Beğendiklerim sayfası
├── playlists.html          # Çalma listeleri sayfası
├── social.html             # Sosyal sayfa
├── profile.html            # Profil sayfası
├── settings.html           # Ayarlar sayfası
├── style.css               # Ana CSS dosyası
├── pages.css               # Sayfa özel CSS'leri
├── login.css               # Giriş sayfası CSS'i
├── script.js               # Ana JavaScript dosyası
├── player.js               # Müzik oynatıcı
├── auth.js                 # Kimlik doğrulama
├── favorites.js            # Beğendiklerim işlemleri
├── playlists.js            # Çalma listesi işlemleri
├── social.js               # Sosyal özellikler
├── profile.js              # Profil işlemleri
├── settings.js             # Ayarlar işlemleri
└── images/                 # Görseller
    └── frekans-logo.png    # Logo
\`\`\`

## 🔐 Giriş Bilgileri (Demo)

- **Email:** demo@muziksite.com
- **Şifre:** demo123

## 💡 Kullanılan Teknolojiler

- **HTML5**: Yapısal işaretleme
- **CSS3**: Stil ve tasarım
- **Vanilla JavaScript**: Dinamik özellikler
- **LocalStorage**: Veri saklama
- **Font Awesome**: İkonlar

## 🎯 Özellik Detayları

### Müzik Oynatıcı
- Oynat/Duraklat
- İleri/Geri atlama
- Ses kontrolü
- Karıştır ve tekrar modları
- Progress bar ile şarkı içinde gezinme

### Çalma Listeleri
- Yeni liste oluşturma
- Şarkı ekleme/çıkarma
- Liste düzenleme ve silme
- İstatistikler (toplam şarkı, süre)

### Sosyal Özellikler
- Arkadaş önerileri
- Müzik türlerine göre filtreleme
- Aktivite akışı
- Paylaşım özellikleri

## 🎨 Tema

Proje modern bir karanlık tema kullanmaktadır:
- **Ana renk:** #ff6b6b (Kırmızı/Coral)
- **Arka plan:** #1f1f1f (Koyu gri)
- **Sidebar:** #252526 (Daha koyu gri)
- **Üst bar:** #2c2c2c (Orta ton gri)

## 📱 Responsive Tasarım

Site mobil cihazlarda da kullanılabilir şekilde tasarlanmıştır.

## 🔄 Güncellemeler

- ✅ Tema optimizasyonu
- ✅ Login sistemi
- ✅ "Beni Hatırla" özelliği
- ✅ Gelişmiş çalma listesi yönetimi
- ✅ Sosyal özellikler
- ✅ Logo entegrasyonu

## 📄 Lisans

Bu proje açık kaynaklıdır.

## 👤 Geliştirici

- **GitHub:** [@arafcode](https://github.com/arafcode)

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue açarak ne değiştirmek istediğinizi tartışın.

---

**Frekans** ile müzik keyfini yaşayın! 🎵✨
