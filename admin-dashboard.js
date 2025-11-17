// Admin Dashboard JavaScript

// Deezer API yapılandırması
const DEEZER_API_BASE = 'https://api.deezer.com';
const DEEZER_CORS_PROXY = 'https://corsproxy.io/?';

// Global veriler
let allUsers = [];
let allTracks = [];
let allPlaylists = [];
let statistics = {
    totalUsers: 0,
    totalTracks: 0,
    todayPlays: 0,
    activeUsers: 0
};

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    setupEventListeners();
    loadAdminData();
});

// Admin yetkisi kontrolü
function checkAdminAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser') || '{}');
    
    // Admin kontrolü
    if (!currentUser.email || currentUser.email !== 'admin@muziksite.com') {
        // Admin değilse login sayfasına yönlendir
        showNotification('Bu sayfaya erişim yetkiniz yok!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Admin bilgilerini göster
    document.getElementById('adminName').textContent = currentUser.name || 'Admin';
}

// Event listener'ları kur
function setupEventListeners() {
    // Sayfa başlığı güncelleme
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Aktif menüyü güncelle
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Admin verilerini yükle
async function loadAdminData() {
    console.log('Admin dashboard yükleniyor...');
    
    showLoading();
    
    try {
        // Gerçek verileri yükle
        await Promise.all([
            loadUsers(),
            loadTracks(),
            loadPlaylists(),
            loadStatistics()
        ]);
        
        // Dashboard'ı güncelle
        updateDashboard();
        
        hideLoading();
        
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        showNotification('Veriler yüklenirken bir hata oluştu', 'error');
        hideLoading();
    }
    
    // Animasyonlar
    animateStats();
}

// Kullanıcıları yükle
async function loadUsers() {
    // LocalStorage'dan kullanıcıları al
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Demo kullanıcıları ekle
    allUsers = [
        {
            id: 1,
            name: 'Admin Kullanıcı',
            email: 'admin@muziksite.com',
            role: 'admin',
            joinDate: '2024-01-01',
            lastActive: new Date().toISOString(),
            playlists: 5,
            favorites: 45
        },
        {
            id: 2,
            name: 'Demo Kullanıcı',
            email: 'demo@muziksite.com',
            role: 'user',
            joinDate: '2024-06-15',
            lastActive: new Date().toISOString(),
            playlists: 3,
            favorites: 28
        },
        ...savedUsers.map((user, index) => ({
            id: index + 3,
            name: user.name || 'Kullanıcı',
            email: user.email,
            role: 'user',
            joinDate: user.joinDate || new Date().toISOString(),
            lastActive: new Date().toISOString(),
            playlists: Math.floor(Math.random() * 5),
            favorites: Math.floor(Math.random() * 50)
        }))
    ];
    
    statistics.totalUsers = allUsers.length;
    console.log('✅ Kullanıcılar yüklendi:', statistics.totalUsers);
}

// Şarkıları yükle (Deezer'dan)
async function loadTracks() {
    try {
        // Popüler şarkıları Deezer'dan al
        const response = await fetch(`${DEEZER_CORS_PROXY}${encodeURIComponent(DEEZER_API_BASE + '/chart/0/tracks?limit=50')}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            allTracks = data.data.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist.name,
                album: track.album.title,
                image: track.album.cover_medium,
                duration: track.duration,
                plays: track.rank || Math.floor(Math.random() * 100000),
                preview: track.preview
            }));
            
            statistics.totalTracks = allTracks.length;
            console.log('✅ Şarkılar yüklendi:', statistics.totalTracks);
        }
    } catch (error) {
        console.error('Şarkı yükleme hatası:', error);
        allTracks = [];
    }
}

// Playlistleri yükle
async function loadPlaylists() {
    // LocalStorage'dan playlistleri al
    const savedPlaylists = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
    
    allPlaylists = savedPlaylists.map((playlist, index) => ({
        id: index + 1,
        name: playlist.name,
        description: playlist.description || '',
        owner: playlist.owner || 'Kullanıcı',
        trackCount: playlist.tracks?.length || 0,
        createdDate: playlist.createdDate || new Date().toISOString(),
        isPublic: playlist.isPublic || false
    }));
    
    console.log('✅ Playlistler yüklendi:', allPlaylists.length);
}

// İstatistikleri hesapla
async function loadStatistics() {
    // Aktif kullanıcıları hesapla (son 24 saat)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    statistics.activeUsers = allUsers.filter(user => 
        new Date(user.lastActive) > oneDayAgo
    ).length;
    
    // Bugünkü dinleme sayısı (simüle)
    const savedPlays = localStorage.getItem('todayPlays');
    statistics.todayPlays = savedPlays ? parseInt(savedPlays) : Math.floor(Math.random() * 20000);
    
    console.log('✅ İstatistikler hesaplandı');
}

// Dashboard'ı güncelle
function updateDashboard() {
    // İstatistik kartlarını güncelle
    updateStatCards();
    
    // Popüler şarkıları güncelle
    updatePopularSongs();
    
    // Son aktiviteleri güncelle
    updateRecentActivities();
}

// İstatistik kartlarını güncelle
function updateStatCards() {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = formatNumber(statistics.totalUsers);
        statValues[1].textContent = formatNumber(statistics.totalTracks);
        statValues[2].textContent = formatNumber(statistics.todayPlays);
        statValues[3].textContent = formatNumber(statistics.activeUsers);
    }
}

// Popüler şarkıları güncelle
function updatePopularSongs() {
    const popularList = document.querySelector('.popular-list');
    if (!popularList || allTracks.length === 0) return;
    
    // En popüler 5 şarkıyı göster
    const topTracks = allTracks.slice(0, 5);
    
    popularList.innerHTML = topTracks.map((track, index) => `
        <div class="popular-item">
            <span class="rank">${index + 1}</span>
            <div class="song-info">
                <p class="song-title">${track.title}</p>
                <span class="artist">${track.artist}</span>
            </div>
            <span class="plays">${formatNumber(track.plays)}</span>
        </div>
    `).join('');
}

// Son aktiviteleri güncelle
function updateRecentActivities() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    const activities = [
        {
            icon: 'fa-user-plus',
            iconClass: 'blue',
            text: `<strong>${allUsers[allUsers.length - 1]?.name || 'Yeni kullanıcı'}</strong> kaydı`,
            time: '2 dakika önce'
        },
        {
            icon: 'fa-music',
            iconClass: 'purple',
            text: `<strong>${allTracks[0]?.title || 'Yeni şarkı'}</strong> eklendi`,
            time: '15 dakika önce'
        },
        {
            icon: 'fa-list',
            iconClass: 'green',
            text: `<strong>${allPlaylists[allPlaylists.length - 1]?.name || 'Yeni playlist'}</strong> oluşturuldu`,
            time: '1 saat önce'
        }
    ];
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <i class="fas ${activity.icon} activity-icon ${activity.iconClass}"></i>
            <div class="activity-content">
                <p>${activity.text}</p>
                <span>${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Sayıları formatla
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Loading göster/gizle
function showLoading() {
    // Loading overlay oluştur
    const loading = document.createElement('div');
    loading.id = 'adminLoading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    loading.innerHTML = `
        <div style="text-align: center;">
            <div class="spinner" style="
                width: 50px;
                height: 50px;
                border: 4px solid rgba(99, 102, 241, 0.2);
                border-top-color: #6366f1;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <p style="color: white; font-size: 16px;">Veriler yükleniyor...</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('adminLoading');
    if (loading) {
        loading.remove();
    }
}

// Admin verilerini yükle
async function loadAdminData() {
    console.log('Admin dashboard yüklendi');
    
    // Burada gerçek veriler API'den çekilebilir
    // Şimdilik simülasyon yapıyoruz
    
    // Animasyonlar
    animateStats();
}

// İstatistik kartlarını animasyonlu göster
function animateStats() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
}

// Bölüm gösterme
function showSection(sectionName) {
    // Tüm bölümleri gizle
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Seçili bölümü göster
    const selectedSection = document.getElementById(`${sectionName}-section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Sayfa başlığını güncelle
    const titles = {
        'dashboard': 'Dashboard',
        'users': 'Kullanıcı Yönetimi',
        'music': 'Müzik Yönetimi',
        'playlists': 'Playlist Yönetimi',
        'analytics': 'İstatistikler',
        'settings': 'Sistem Ayarları'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';
    
    // Bölüme özel veri yükleme
    if (sectionName === 'users') {
        displayUsers();
    } else if (sectionName === 'music') {
        displayTracks();
    } else if (sectionName === 'playlists') {
        displayPlaylists();
    }
}

// Kullanıcıları göster
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody || allUsers.length === 0) return;
    
    tbody.innerHTML = allUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar-small">${user.name.charAt(0).toUpperCase()}</div>
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role}">${user.role === 'admin' ? 'Admin' : 'Kullanıcı'}</span></td>
            <td>${formatDate(user.joinDate)}</td>
            <td>${user.playlists}</td>
            <td>${user.favorites}</td>
            <td>
                <button class="action-btn" onclick="viewUser(${user.id})" title="Görüntüle">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="editUser(${user.id})" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                ${user.role !== 'admin' ? `
                <button class="action-btn" onclick="deleteUser(${user.id})" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Şarkıları göster
function displayTracks() {
    const musicGrid = document.getElementById('musicGrid');
    if (!musicGrid || allTracks.length === 0) return;
    
    musicGrid.innerHTML = allTracks.map(track => `
        <div class="music-card">
            <img src="${track.image}" alt="${track.title}" class="music-card-image">
            <div class="music-card-title">${track.title}</div>
            <div class="music-card-artist">${track.artist}</div>
            <div class="music-card-plays">
                <i class="fas fa-play"></i>
                ${formatNumber(track.plays)} dinlenme
            </div>
        </div>
    `).join('');
}

// Playlistleri göster
function displayPlaylists() {
    const playlistsGrid = document.getElementById('playlistsGrid');
    if (!playlistsGrid) return;
    
    if (allPlaylists.length === 0) {
        playlistsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-list" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">Henüz playlist oluşturulmamış</p>
            </div>
        `;
        return;
    }
    
    playlistsGrid.innerHTML = allPlaylists.map(playlist => `
        <div class="playlist-card">
            <div class="playlist-card-header">
                <div class="playlist-icon">
                    <i class="fas fa-list"></i>
                </div>
                <div class="playlist-info">
                    <h4>${playlist.name}</h4>
                    <p>${playlist.owner}</p>
                </div>
            </div>
            ${playlist.description ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">${playlist.description}</p>` : ''}
            <div class="playlist-stats">
                <div class="playlist-stat">
                    <i class="fas fa-music"></i>
                    <span>${playlist.trackCount} şarkı</span>
                </div>
                <div class="playlist-stat">
                    <i class="fas fa-${playlist.isPublic ? 'globe' : 'lock'}"></i>
                    <span>${playlist.isPublic ? 'Herkese açık' : 'Özel'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Yenileme fonksiyonları
function refreshUsers() {
    showNotification('Kullanıcılar yenileniyor...', 'info');
    loadUsers().then(() => {
        displayUsers();
        showNotification('Kullanıcılar güncellendi', 'success');
    });
}

function refreshTracks() {
    showNotification('Müzikler yenileniyor...', 'info');
    loadTracks().then(() => {
        displayTracks();
        updatePopularSongs();
        showNotification('Müzikler güncellendi', 'success');
    });
}

function refreshPlaylists() {
    showNotification('Playlistler yenileniyor...', 'info');
    loadPlaylists().then(() => {
        displayPlaylists();
        showNotification('Playlistler güncellendi', 'success');
    });
}

// Kullanıcı işlemleri
function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        showNotification(`${user.name} kullanıcısı görüntüleniyor`, 'info');
    }
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        showNotification(`${user.name} kullanıcısı düzenleniyor`, 'info');
    }
}

function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user && confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) {
        allUsers = allUsers.filter(u => u.id !== userId);
        displayUsers();
        showNotification('Kullanıcı silindi', 'success');
    }
}

// Tarih formatlama
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
}

// Sidebar toggle (mobil için)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Admin çıkış
function adminLogout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        // Oturum bilgilerini temizle
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        
        showNotification('Çıkış yapılıyor...', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Bildirim göster
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
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: white;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    
    // Renk ayarları
    if (type === 'success') {
        notification.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        notification.querySelector('i').style.color = '#10b981';
    } else if (type === 'error') {
        notification.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        notification.querySelector('i').style.color = '#ef4444';
    } else if (type === 'warning') {
        notification.style.borderColor = 'rgba(245, 158, 11, 0.5)';
        notification.querySelector('i').style.color = '#f59e0b';
    } else {
        notification.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        notification.querySelector('i').style.color = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Animasyon stilleri
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Sidebar'ı kapatma (mobil için)
document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target) &&
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

console.log('🎵 Frekans Admin Dashboard Yüklendi');
console.log('📧 Admin E-posta: admin@muziksite.com');
console.log('🔑 Admin Şifre: admin123');
