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
    const parts = durationStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
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
    // MusicPlayer'ı bekle
    if (!window.musicPlayer) {
        console.log('Waiting for music player...');
        setTimeout(() => playFavoriteTrack(trackId), 100);
        return;
    }
    
    const track = favorites.find(fav => fav.id == trackId);
    if (track) {
        console.log('Playing track:', track);
        window.musicPlayer.playFavoriteTrack(trackId);
    } else {
        console.error('Track not found:', trackId);
        showNotification('Şarkı bulunamadı', 'error');
    }
}

function removeFavoriteFromPage(trackId) {
    if (window.musicPlayer) {
        window.musicPlayer.removeFavoriteById(trackId);
        // Sayfayı yenile
        setTimeout(() => {
            loadFavoritesFromStorage();
        }, 100);
    } else {
        // Fallback - doğrudan kaldır
        removeFavorite(trackId);
    }
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
            return (a, b) => a.name.localeCompare(b.name, 'tr');
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
    
    const filteredFavorites = favorites.filter(track => 
        track.name.toLowerCase().includes(searchTerm) || 
        track.artist.toLowerCase().includes(searchTerm)
    );
    
    // Geçici olarak filtered favorites'ı render et
    const originalFavorites = [...favorites];
    favorites = filteredFavorites;
    renderFavorites();
    favorites = originalFavorites;
}

// Tümünü çal
function playAllFavorites() {
    if (favorites.length === 0) return;
    
    // Beğenilen şarkıları playlist olarak ayarla
    currentPlaylist = [...favorites];
    currentTrackIndex = 0;
    playTrack(favorites[0]);
    
    showNotification(`${favorites.length} şarkı çalma listesine eklendi`, 'success');
}

// Karışık çal
function shuffleFavorites() {
    if (favorites.length === 0) return;
    
    // Karışık sırada çal
    const shuffledFavorites = [...favorites].sort(() => Math.random() - 0.5);
    currentPlaylist = shuffledFavorites;
    currentTrackIndex = 0;
    playTrack(shuffledFavorites[0]);
    
    showNotification('Beğenilenler karışık olarak çalınıyor', 'success');
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
    if (favorites.length === 0) return;
    
    if (confirm('Tüm beğenilen şarkıları kaldırmak istediğinizden emin misiniz?')) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        favorites = [];
        localStorage.setItem(`favorites_${currentUser.email}`, JSON.stringify(favorites));
        loadFavorites();
        
        showNotification('Tüm beğenilen şarkılar kaldırıldı', 'success');
    }
}

// Beğenilenleri dışa aktar
function exportFavorites() {
    if (favorites.length === 0) {
        showNotification('Dışa aktarılacak şarkı bulunamadı', 'warning');
        return;
    }
    
    const exportData = {
        user: JSON.parse(sessionStorage.getItem('currentUser')).name,
        exportDate: new Date().toISOString(),
        favorites: favorites
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `muziksite-begendiklerim-${formatDate(new Date())}.json`;
    link.click();
    
    showNotification('Beğenilenler başarıyla dışa aktarıldı', 'success');
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