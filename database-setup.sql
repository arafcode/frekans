-- Frekans Müzik Platformu - Veritabanı Tabloları

USE frekans;
GO

-- Kullanıcılar Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Kullanicilar')
BEGIN
    CREATE TABLE Kullanicilar (
        KullaniciId INT PRIMARY KEY IDENTITY(1,1),
        Eposta NVARCHAR(100) UNIQUE NOT NULL,
        Sifre NVARCHAR(255) NOT NULL,
        AdSoyad NVARCHAR(100),
        KullaniciAdi NVARCHAR(50) UNIQUE,
        ProfilResmi NVARCHAR(255),
        Biyografi NVARCHAR(500),
        OlusturmaTarihi DATETIME DEFAULT GETDATE(),
        SonGiris DATETIME,
        Aktif BIT DEFAULT 1
    );
    PRINT '✅ Kullanicilar tablosu oluşturuldu';
END
GO

-- Şarkılar Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sarkilar')
BEGIN
    CREATE TABLE Sarkilar (
        SarkiId INT PRIMARY KEY IDENTITY(1,1),
        Baslik NVARCHAR(200) NOT NULL,
        Sanatci NVARCHAR(100) NOT NULL,
        Album NVARCHAR(100),
        Sure INT, -- Saniye cinsinden
        KapakResmi NVARCHAR(255),
        SesUrl NVARCHAR(255),
        Tur NVARCHAR(50),
        CikisTarihi DATE,
        DinlenmeSayisi INT DEFAULT 0,
        BegeniSayisi INT DEFAULT 0,
        OlusturmaTarihi DATETIME DEFAULT GETDATE()
    );
    PRINT '✅ Sarkilar tablosu oluşturuldu';
END
GO

-- Çalma Listeleri Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CalmaListeleri')
BEGIN
    CREATE TABLE CalmaListeleri (
        CalmaListesiId INT PRIMARY KEY IDENTITY(1,1),
        KullaniciId INT FOREIGN KEY REFERENCES Kullanicilar(KullaniciId),
        Ad NVARCHAR(100) NOT NULL,
        Aciklama NVARCHAR(500),
        KapakResmi NVARCHAR(255),
        Herkese_Acik BIT DEFAULT 1,
        SarkiSayisi INT DEFAULT 0,
        ToplamSure INT DEFAULT 0, -- Dakika cinsinden
        OlusturmaTarihi DATETIME DEFAULT GETDATE(),
        GuncellemeTarihi DATETIME DEFAULT GETDATE()
    );
    PRINT '✅ CalmaListeleri tablosu oluşturuldu';
END
GO

-- Çalma Listesi Şarkıları Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CalmaListesiSarkilari')
BEGIN
    CREATE TABLE CalmaListesiSarkilari (
        CalmaListesiSarkiId INT PRIMARY KEY IDENTITY(1,1),
        CalmaListesiId INT FOREIGN KEY REFERENCES CalmaListeleri(CalmaListesiId) ON DELETE CASCADE,
        SarkiId INT FOREIGN KEY REFERENCES Sarkilar(SarkiId) ON DELETE CASCADE,
        Sira INT DEFAULT 0,
        EklenmeTarihi DATETIME DEFAULT GETDATE()
    );
    PRINT '✅ CalmaListesiSarkilari tablosu oluşturuldu';
END
GO

-- Beğeniler Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Begeniler')
BEGIN
    CREATE TABLE Begeniler (
        BegeniId INT PRIMARY KEY IDENTITY(1,1),
        KullaniciId INT FOREIGN KEY REFERENCES Kullanicilar(KullaniciId),
        SarkiId INT FOREIGN KEY REFERENCES Sarkilar(SarkiId) ON DELETE CASCADE,
        BegenilmeTarihi DATETIME DEFAULT GETDATE(),
        UNIQUE(KullaniciId, SarkiId)
    );
    PRINT '✅ Begeniler tablosu oluşturuldu';
END
GO

-- Takipçiler Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Takipciler')
BEGIN
    CREATE TABLE Takipciler (
        TakipId INT PRIMARY KEY IDENTITY(1,1),
        TakipciId INT FOREIGN KEY REFERENCES Kullanicilar(KullaniciId),
        TakipEdilenId INT FOREIGN KEY REFERENCES Kullanicilar(KullaniciId),
        TakipTarihi DATETIME DEFAULT GETDATE(),
        UNIQUE(TakipciId, TakipEdilenId)
    );
    PRINT '✅ Takipciler tablosu oluşturuldu';
END
GO

-- Demo Veriler
-- Admin Kullanıcısı
IF NOT EXISTS (SELECT * FROM Kullanicilar WHERE Eposta = 'admin@muziksite.com')
BEGIN
    INSERT INTO Kullanicilar (Eposta, Sifre, AdSoyad, KullaniciAdi, Biyografi)
    VALUES ('admin@muziksite.com', 'admin123', 'Admin Kullanıcı', 'admin', 'Site yöneticisi');
    PRINT '✅ Admin kullanıcısı eklendi';
END
GO

-- Demo Kullanıcısı
IF NOT EXISTS (SELECT * FROM Kullanicilar WHERE Eposta = 'demo@muziksite.com')
BEGIN
    INSERT INTO Kullanicilar (Eposta, Sifre, AdSoyad, KullaniciAdi, Biyografi)
    VALUES ('demo@muziksite.com', 'demo123', 'Demo Kullanıcı', 'demo', 'Demo hesabı');
    PRINT '✅ Demo kullanıcısı eklendi';
END
GO

-- Demo Şarkılar (Deezer API'den gelen şarkılar için placeholder)
IF NOT EXISTS (SELECT * FROM Sarkilar WHERE Baslik = 'Demo Şarkı 1')
BEGIN
    INSERT INTO Sarkilar (Baslik, Sanatci, Album, Sure, Tur, DinlenmeSayisi, BegeniSayisi)
    VALUES 
    ('Demo Şarkı 1', 'Sanatçı 1', 'Albüm 1', 180, 'Pop', 0, 0),
    ('Demo Şarkı 2', 'Sanatçı 2', 'Albüm 2', 240, 'Rock', 0, 0),
    ('Demo Şarkı 3', 'Sanatçı 3', 'Albüm 3', 200, 'Jazz', 0, 0);
    PRINT '✅ Demo şarkılar eklendi';
END
GO

PRINT '🎉 Veritabanı kurulumu tamamlandı!';
