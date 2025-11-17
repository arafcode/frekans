# Playlists'i Temizleme - Hızlı Çözüm

## Yöntem 1: Debug Sayfası (Önerilen)
1. `debug-storage.html` sayfasını tarayıcıda açın
2. "🗑️ Playlists'i Temizle" butonuna tıklayın
3. `playlists.html` sayfasını yenileyin

## Yöntem 2: Tarayıcı Konsolu
1. `playlists.html` sayfasını açın
2. F12 tuşuna basın (Developer Tools)
3. Console (Konsol) sekmesine gidin
4. Şu komutu yazın ve Enter'a basın:

```javascript
localStorage.removeItem('playlists');
location.reload();
```

## Yöntem 3: Reset Sayfası
1. `reset-playlists.html` sayfasını açın
2. "Çalma Listelerini Sıfırla" butonuna tıklayın
3. Otomatik olarak `playlists.html` sayfasına yönlendirileceksiniz

## Sonuç
Artık playlists sayfasında:
- ✅ 1 Liste (Başlangıç Listesi)
- ✅ 3 Şarkı (Demo Şarkı 1, 2, 3)
- ✅ 1 dk 30 sn toplam süre

göreceksiniz. "402 şarkı" gibi demo veriler tamamen temizlenmiş olacak.
