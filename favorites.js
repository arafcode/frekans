// Beğendiklerim Sayfası JavaScript

// Global değişkenler
let favorites = [];
let currentView = 'list';
let currentSort = 'recent';

// Kullanıcı oturum kontrolü fonksiyonu
function checkUserSession() {
    try {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        
        if (currentUser) {
            return JSON.parse(currentUser);
        }
        
        // Oturum yoksa login'e yönlendir
        window.location.href = 'login.html';
        return false;
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// DOM yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = checkUserSession();
    if (!currentUser) {
        return;
    }
    
    // Kullanıcı adını göster
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = `Hoş geldin, ${currentUser.firstName}!`;
    }
    
    // setupUserMenu script.js tarafından kurulacak (çakışmayı önlemek için kaldırıldı)
    setupEventListeners();
    loadFavoritesFromStorage();
    setupPlayerControls();
    
    // Global fonksiyonlara erişimi kontrol et
    console.log('🔍 Favorites.js yüklendi');
    console.log('window.playTrack:', typeof window.playTrack);
    console.log('window.currentPlaylist:', typeof window.currentPlaylist);
    
    // Eğer henüz yüklenmediyse, script.js'in yüklenmesini bekle
    if (typeof window.playTrack !== 'function') {
        console.log('⏳ window.playTrack henüz hazır değil, bekleniyor...');
        
        // Script.js'in yüklenmesini bekle
        const checkInterval = setInterval(() => {
            if (typeof window.playTrack === 'function') {
                console.log('✅ window.playTrack hazır!');
                clearInterval(checkInterval);
            }
        }, 100);
        
        // 5 saniye sonra timeout
        setTimeout(() => {
            clearInterval(checkInterval);
            if (typeof window.playTrack !== 'function') {
                console.error('❌ window.playTrack 5 saniye içinde yüklenmedi!');
            }
        }, 5000);
    }
});

// Event listener'ları kurma
function setupEventListeners() {
    // Arama
    document.getElementById('search-input').addEventListener('input', searchFavorites);
    
    // Sıralama ve görünüm değiştirme
    document.getElementById('sort-select').addEventListener('change', changeSorting);
    document.getElementById('view-select').addEventListener('change', changeView);
    
    // Aksiyon butonları
    document.getElementById('play-all-favorites').addEventListener('click', playAllFavorites);
    document.getElementById('shuffle-favorites').addEventListener('click', shuffleFavorites);
    
    // Logout event listener
    document.addEventListener('click', function(e) {
        if (e.target.matches('#logoutLink, #logoutLink *')) {
            logout();
        }
    });
}

// Beğenilen şarkıları localStorage'dan yükle (player.js ile uyumlu)
function loadFavoritesFromStorage() {
    try {
        const storedFavorites = localStorage.getItem('music-favorites');
        favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
        
        updateFavoritesStats();
        renderFavorites();
        
        // Sayfa yüklendiğinde favorites sayısını güncelle
        updateFavoritesCount();
    } catch (error) {
        console.error('Error loading favorites:', error);
        favorites = [];
        renderFavorites();
    }
}

// Beğenilen şarkıları yükle (eski fonksiyon - geriye uyumluluk için)
function loadFavorites() {
    loadFavoritesFromStorage();
}

// Favorites sayısını sidebar'da güncelle
function updateFavoritesCount() {
    const sidebarFavoritesLink = document.querySelector('a[href="favorites.html"]');
    if (sidebarFavoritesLink) {
        let countElement = sidebarFavoritesLink.querySelector('.favorites-count');
        if (!countElement) {
            countElement = document.createElement('span');
            countElement.className = 'favorites-count';
            countElement.style.marginLeft = '5px';
            countElement.style.color = '#4ecdc4';
            countElement.style.fontSize = '11px';
            sidebarFavoritesLink.appendChild(countElement);
        }
        countElement.textContent = `(${favorites.length})`;
    }
}

// İstatistikleri güncelle
function updateFavoritesStats() {
    const count = favorites.length;
    const totalDuration = favorites.reduce((total, track) => {
        const duration = parseDuration(track.duration);
        return total + duration;
    }, 0);
    
    document.getElementById('favorites-count').textContent = `${count} şarkı`;
    document.getElementById('favorites-duration').textContent = formatTotalDuration(totalDuration);
}

// Süre parse etme (mm:ss formatından saniyeye)
function parseDuration(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') return 0;
    
    const parts = durationStr.split(':');
    if (parts.length !== 2) return 0;
    
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    
    return minutes * 60 + seconds;
}

// Toplam süreyi formatla
function formatTotalDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours} sa ${minutes} dk`;
    }
    return `${minutes} dk`;
}

// Tarih formatla
function formatDate(dateString) {
    if (!dateString) return 'Bilinmiyor';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Bugün';
    if (diffDays === 2) return 'Dün';
    if (diffDays <= 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
}

// Beğenilen şarkıları render et
function renderFavorites() {
    const emptyState = document.getElementById('empty-favorites');
    const favoritesList = document.getElementById('favorites-list');
    const favoritesGrid = document.getElementById('favorites-grid');
    
    if (favorites.length === 0) {
        emptyState?.classList.remove('hidden');
        favoritesList?.classList.add('hidden');
        favoritesGrid?.classList.add('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Sıralama uygula
    const sortedFavorites = [...favorites].sort(getSortFunction());
    
    if (currentView === 'list') {
        favoritesList.classList.remove('hidden');
        favoritesGrid.classList.add('hidden');
        renderListView(sortedFavorites);
    } else {
        favoritesList.classList.add('hidden');
        favoritesGrid.classList.remove('hidden');
        renderGridView(sortedFavorites);
    }
}

// Liste görünümünü render et
function renderListView(tracks) {
    const container = document.getElementById('tracks-container');
    container.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const trackElement = createTrackListItem(track, index + 1);
        container.appendChild(trackElement);
    });
}

// Kart görünümünü render et
function renderGridView(tracks) {
    const container = document.getElementById('favorites-grid');
    container.innerHTML = '';
    
    tracks.forEach(track => {
        const trackCard = createTrackCard(track);
        container.appendChild(trackCard);
    });
}

// Liste öğesi oluştur
function createTrackListItem(track, number) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'favorite-track-item';
    trackDiv.setAttribute('data-track-id', track.id);
    
    const formattedDate = track.dateAdded ? formatDate(track.dateAdded) : 'Bilinmiyor';
    
    trackDiv.innerHTML = `
        <div class="track-number">${number}</div>
        <div class="track-title-section">
            <img src="${track.artwork || track.image}" alt="${track.title || track.name}" class="track-cover">
            <div class="track-details">
                <h4>${track.title || track.name}</h4>
                <p>${track.artist}</p>
            </div>
        </div>
        <div class="track-artist">${track.artist}</div>
        <div class="track-date">${formattedDate}</div>
        <div class="track-duration">3:45</div>
        <div class="track-actions-cell">
            <button class="track-action-btn play-btn" onclick="playFavoriteTrack('${track.id}')" title="Oynat">
                <i class="fas fa-play"></i>
            </button>
            <button class="track-action-btn like-btn liked" onclick="removeFavoriteFromPage('${track.id}')" title="Beğenilerden Kaldır">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;
    
    // Şarkıya tıklanma eventi
    trackDiv.addEventListener('click', (e) => {
        // Butonlara tıklanmışsa şarkıyı çalma
        if (!e.target.closest('.track-action-btn')) {
            playFavoriteTrack(track.id);
        }
    });
    
    return trackDiv;
}

// Kart oluştur
function createTrackCard(track) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'track-card';
    cardDiv.setAttribute('data-track-id', track.id);
    
    cardDiv.innerHTML = `
        <div class="track-card-artwork">
            <img src="${track.artwork || track.image}" alt="${track.title || track.name}" class="track-card-image">
            <div class="track-card-overlay">
                <button class="card-play-btn" onclick="playFavoriteTrack('${track.id}')">
                    <i class="fas fa-play"></i>
                </button>
                <button class="card-remove-btn" onclick="removeFavoriteFromPage('${track.id}')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
        <div class="track-card-info">
            <div class="track-card-title">${track.title || track.name}</div>
            <div class="track-card-artist">${track.artist}</div>
            <div class="track-card-date">${formatDate(track.dateAdded)}</div>
        </div>
    `;
    
    return cardDiv;
}

// Player.js ile entegrasyon fonksiyonları
function playFavoriteTrack(trackId) {
    console.log('🎵 Beğenilen şarkıyı çal:', trackId);
    
    const track = favorites.find(fav => fav.id == trackId);
    if (!track) {
        console.error('❌ Track not found:', trackId);
        showNotification('Şarkı bulunamadı', 'error');
        return;
    }
    
    console.log('✅ Şarkı bulundu:', track);
    
    const tryPlay = () => {
        // Script.js'deki global fonksiyonları kullan
        if (typeof window.playTrack === 'function') {
            console.log('✅ window.playTrack bulundu');
            
            // Beğenilenleri playlist olarak ayarla
            window.currentPlaylist = [...favorites];
            window.currentTrackIndex = favorites.findIndex(f => f.id == trackId);
            
            console.log('📋 Playlist ayarlandı:', window.currentPlaylist.length, 'şarkı');
            console.log('📍 Index:', window.currentTrackIndex);
            
            // Şarkıyı çal
            window.playTrack(track);
            showNotification(`"${track.name || track.title}" çalınıyor`, 'success');
        } else {
            console.error('❌ window.playTrack bulunamadı');
            console.log('Mevcut window özellikleri:', Object.keys(window).filter(k => k.includes('play')));
            showNotification('Müzik çalamıyorum, lütfen sayfayı yenileyin', 'error');
        }
    };
    
    // Kısa gecikme ile dene
    setTimeout(tryPlay, 50);
}

function removeFavoriteFromPage(trackId) {
    console.log('🗑️ Beğeniden kaldırılıyor:', trackId);
    
    // Favorilerden kaldır
    const favorites = JSON.parse(localStorage.getItem('music-favorites')) || [];
    const updatedFavorites = favorites.filter(f => f.id != trackId);
    
    // LocalStorage'ı güncelle
    localStorage.setItem('music-favorites', JSON.stringify(updatedFavorites));
    
    // Eski likedTracks'ten de kaldır
    const likedTracks = JSON.parse(localStorage.getItem('likedTracks')) || [];
    const updatedLikedTracks = likedTracks.filter(id => id != trackId);
    localStorage.setItem('likedTracks', JSON.stringify(updatedLikedTracks));
    
    // UI'ı güncelle
    loadFavoritesFromStorage();
    
    // Ana sayfadaki beğeni butonunu da güncelle
    if (typeof window.updateLikeButtonState === 'function') {
        window.updateLikeButtonState(trackId);
    }
    
    // Sidebar sayısını güncelle
    if (typeof window.updateSidebarFavoritesCount === 'function') {
        window.updateSidebarFavoritesCount();
    }
    
    const trackName = favorites.find(f => f.id == trackId)?.name || 'Şarkı';
    showNotification(`"${trackName}" beğenilerden kaldırıldı`, 'info');
}

// Beğeniden kaldır (eski fonksiyon)
function removeFavorite(trackId) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Array'den kaldır
    favorites = favorites.filter(track => track.id != trackId);
    
    // LocalStorage'ı güncelle
    localStorage.setItem(`favorites_${currentUser.email}`, JSON.stringify(favorites));
    
    // UI'ı güncelle
    loadFavorites();
    
    showNotification('Şarkı beğenilenlerden kaldırıldı', 'success');
}

// Sıralama değiştir
function changeSorting() {
    currentSort = document.getElementById('sort-select').value;
    renderFavorites();
}

// Görünüm değiştir
function changeView() {
    currentView = document.getElementById('view-select').value;
    renderFavorites();
}

// Sıralama fonksiyonu al
function getSortFunction() {
    switch (currentSort) {
        case 'name':
            return (a, b) => {
                const nameA = a.name || a.title || '';
                const nameB = b.name || b.title || '';
                return nameA.localeCompare(nameB, 'tr');
            };
        case 'artist':
            return (a, b) => a.artist.localeCompare(b.artist, 'tr');
        case 'duration':
            return (a, b) => parseDuration(b.duration) - parseDuration(a.duration);
        case 'recent':
        default:
            return (a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
    }
}

// Beğenilenlerde arama
function searchFavorites(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderFavorites();
        return;
    }
    
    const filteredFavorites = favorites.filter(track => {
        const trackName = track.name || track.title || '';
        return trackName.toLowerCase().includes(searchTerm) || 
               track.artist.toLowerCase().includes(searchTerm);
    });
    
    // Geçici olarak filtered favorites'ı render et
    const originalFavorites = [...favorites];
    favorites = filteredFavorites;
    renderFavorites();
    favorites = originalFavorites;
}

// Tümünü çal
function playAllFavorites() {
    console.log('▶️ Tümünü çal butonuna tıklandı');
    console.log('📋 Favorites listesi:', favorites);
    
    if (favorites.length === 0) {
        showNotification('Çalınacak şarkı bulunamadı', 'warning');
        return;
    }
    
    // Script.js'in yüklenmesini bekle
    const tryPlay = () => {
        console.log('🔄 PlayTrack kontrol ediliyor...');
        console.log('window.playTrack:', typeof window.playTrack);
        console.log('window.currentPlaylist:', typeof window.currentPlaylist);
        
        if (typeof window.playTrack === 'function') {
            console.log('✅ PlayTrack bulundu, çalınıyor...');
            window.currentPlaylist = [...favorites];
            window.currentTrackIndex = 0;
            window.playTrack(favorites[0]);
            showNotification(`${favorites.length} şarkı çalma listesine eklendi`, 'success');
        } else {
            console.error('❌ window.playTrack bulunamadı!');
            showNotification('Müzik çalar hazır değil, lütfen sayfayı yenileyin', 'error');
        }
    };
    
    // Kısa bir gecikmeyle dene (script.js yüklenme süresi için)
    setTimeout(tryPlay, 100);
}

// Karışık çal
function shuffleFavorites() {
    console.log('🔀 Karışık çal butonuna tıklandı');
    console.log('📋 Favorites listesi:', favorites);
    
    if (favorites.length === 0) {
        showNotification('Çalınacak şarkı bulunamadı', 'warning');
        return;
    }
    
    // Karışık sırada çal
    const shuffledFavorites = [...favorites].sort(() => Math.random() - 0.5);
    console.log('🔀 Karışık liste oluşturuldu:', shuffledFavorites);
    
    const tryPlay = () => {
        console.log('🔄 PlayTrack kontrol ediliyor...');
        
        if (typeof window.playTrack === 'function') {
            console.log('✅ PlayTrack bulundu, karışık çalınıyor...');
            window.currentPlaylist = shuffledFavorites;
            window.currentTrackIndex = 0;
            window.playTrack(shuffledFavorites[0]);
            showNotification('Beğenilenler karışık olarak çalınıyor', 'success');
        } else {
            console.error('❌ window.playTrack bulunamadı!');
            showNotification('Müzik çalar hazır değil, lütfen sayfayı yenileyin', 'error');
        }
    };
    
    setTimeout(tryPlay, 100);
}

// Beğenilenlerden şarkı çal
function playTrackFromFavorites(track) {
    // Ana script.js'deki fonksiyonları kullan
    currentPlaylist = [...favorites];
    currentTrackIndex = favorites.findIndex(t => t.id === track.id);
    playTrack(track);
}

// Tümünü temizle
function clearAllFavorites() {
    if (favorites.length === 0) {
        showNotification('Temizlenecek şarkı bulunamadı', 'info');
        return;
    }
    
    if (confirm(`${favorites.length} beğenilen şarkıyı kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
        console.log('🗑️ Tüm beğeniler temizleniyor...');
        
        // LocalStorage'ı temizle
        localStorage.setItem('music-favorites', JSON.stringify([]));
        localStorage.setItem('likedTracks', JSON.stringify([]));
        
        // Favorites array'ini temizle
        favorites = [];
        
        // UI'ı güncelle
        loadFavoritesFromStorage();
        
        // Sidebar sayısını güncelle
        if (typeof window.updateSidebarFavoritesCount === 'function') {
            window.updateSidebarFavoritesCount();
        }
        
        showNotification('Tüm beğenilen şarkılar kaldırıldı', 'success');
    }
}

// Beğenilenleri dışa aktar
function exportFavorites() {
    if (favorites.length === 0) {
        showNotification('Dışa aktarılacak şarkı bulunamadı', 'warning');
        return;
    }
    
    console.log('📥 Beğeniler dışa aktarılıyor:', favorites);
    
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser'));
        const userName = currentUser ? (currentUser.name || currentUser.email) : 'Kullanıcı';
        
        const exportData = {
            user: userName,
            exportDate: new Date().toISOString(),
            totalTracks: favorites.length,
            favorites: favorites
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        
        // Dosya adını oluştur
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `frekans-begendiklerim-${dateStr}.json`;
        
        // İndirmeyi tetikle
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // URL'i temizle
        URL.revokeObjectURL(link.href);
        
        showNotification('Beğenilenler başarıyla dışa aktarıldı', 'success');
    } catch (error) {
        console.error('Dışa aktarma hatası:', error);
        showNotification('Dışa aktarma başarısız oldu', 'error');
    }
}

// Tarih formatlama
function formatDate(date) {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Player kontrollerini kur (ana script.js'den miras alınacak)
function setupPlayerControls() {
    // Ana script.js'deki player fonksiyonlarını kullan
    if (typeof setupEventListeners === 'function') {
        // Ana player event listener'ları zaten kurulu
        return;
    }
}

// Bildirim göster (ana auth.js'den kopyalandı)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    else if (type === 'error') icon = 'fas fa-times-circle';
    else if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="close-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        padding: 15px 20px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    
    if (type === 'success') {
        notification.style.borderColor = 'rgba(76, 175, 80, 0.5)';
        notification.querySelector('i').style.color = '#4caf50';
    } else if (type === 'error') {
        notification.style.borderColor = 'rgba(244, 67, 54, 0.5)';
        notification.querySelector('i').style.color = '#f44336';
    } else if (type === 'warning') {
        notification.style.borderColor = 'rgba(255, 152, 0, 0.5)';
        notification.querySelector('i').style.color = '#ff9800';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Logout fonksiyonu
function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        // Tüm kullanıcı verilerini temizle
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('lastLoginTime');
        
        window.location.href = 'login.html';
    }
}

// Navigasyon fonksiyonları
function showSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.focus();
    }
}

function showCreatePlaylist() {
    window.location.href = 'playlists.html#create';
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    }
}

function goForward() {
    window.history.forward();
}

// Kullanıcı menüsü fonksiyonları
// Kullanıcı menü fonksiyonları script.js'den kullanılacak
// setupUserMenu, toggleUserDropdown, closeUserDropdown, logout script.js'de tanımlı

// Player kontrollerini kurma