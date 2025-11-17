# 🎵 Frekans - MSSQL Veritabanı Kurulum Rehberi

## 📋 Gereksinimler
- SQL Server (MSSQL)
- Node.js ve npm

## 🚀 Kurulum Adımları

### 1. Veritabanını Oluşturun
SQL Server Management Studio (SSMS) veya Azure Data Studio'da:
```sql
CREATE DATABASE frekans;
GO
```

### 2. Tabloları Oluşturun
`database-setup.sql` dosyasını SSMS'de çalıştırın veya:
```bash
sqlcmd -S localhost -U sa -P YourPassword -i database-setup.sql
```

### 3. Bağlantı Ayarlarını Yapın
`.env` dosyasını düzenleyin:
```env
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_SERVER=localhost
DB_NAME=frekans
DB_PORT=1433
PORT=8000
```

### 4. Node.js Paketlerini Yükleyin
```bash
npm install
```

### 5. Sunucuyu Başlatın
```bash
npm start
```

Sunucu `http://localhost:8000` adresinde çalışacak.

## 📊 API Endpoint'leri

### Kullanıcılar
- `GET /api/users` - Tüm kullanıcıları getir

### Şarkılar
- `GET /api/songs` - Tüm şarkıları getir

### Çalma Listeleri
- `GET /api/playlists` - Tüm çalma listelerini getir

## 🗄️ Veritabanı Yapısı

### Tables:
- **Users** - Kullanıcı bilgileri
- **Songs** - Şarkı bilgileri
- **Playlists** - Çalma listeleri
- **PlaylistSongs** - Çalma listesi-şarkı ilişkileri
- **Likes** - Beğeniler
- **Followers** - Takipçi ilişkileri

## 🔐 Varsayılan Kullanıcılar

**Admin:**
- Email: `admin@muziksite.com`
- Şifre: `admin123`

**Demo:**
- Email: `demo@muziksite.com`
- Şifre: `demo123`

## ⚠️ Önemli Notlar

1. **.env dosyasını güvenli tutun** - Gerçek şifrelerinizi buraya yazın
2. **Production'da encrypt: true kullanın** - Güvenlik için
3. **Şifreleri hash'leyin** - Gerçek uygulamada bcrypt kullanın

## 🔧 Sorun Giderme

### Bağlantı Hatası
- SQL Server'ın çalıştığından emin olun
- Firewall ayarlarını kontrol edin
- SQL Server Browser servisinin açık olduğunu kontrol edin
- TCP/IP protokolünün aktif olduğunu kontrol edin (SQL Server Configuration Manager)

### Port Hatası
- 1433 portunun açık olduğunu kontrol edin
- Başka bir uygulama tarafından kullanılmadığından emin olun
