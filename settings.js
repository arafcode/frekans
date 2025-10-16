// Settings.js - Ayarlar sayfası fonksiyonları

// Kullanıcı oturum kontrolü fonksiyonu
function checkUserSession() {
    try {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        const rememberUser = localStorage.getItem('rememberUser');
        
        if (currentUser || rememberUser === 'true') {
            if (currentUser) {
                return JSON.parse(currentUser);
            } else {
                return { username: 'Kullanıcı', email: 'user@example.com' };
            }
        }
        
        setTimeout(() => { window.location.href = 'login.html'; }, 100);
        return false;
    } catch (error) {
        console.error('Auth error:', error);
        return { username: 'Kullanıcı', email: 'user@example.com' };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı girişi kontrolü
    const currentUser = checkUserSession();
    if (!currentUser) {
        return;
    }

    // Kullanıcı adını göster
    document.getElementById('userName').textContent = `Hoş geldin, ${currentUser.firstName}!`;

    // Kullanıcı menüsünü kur
    setupUserMenu();

    // Ayarları yükle
    loadSettings();

    // Event listeners
    initializeEventListeners();

    // Navigasyon event listeners
    initializeNavigation();

    // Slider değerlerini güncelle
    updateSliderValues();
});

// Ayarları yükle
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings')) || getDefaultSettings();
    
    // Her ayarı form elementlerine yükle
    Object.keys(settings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = settings[key];
            } else if (element.type === 'range') {
                element.value = settings[key];
            } else {
                element.value = settings[key];
            }
        }
    });

    // Slider değerlerini güncelle
    updateSliderValues();
}

// Varsayılan ayarlar
function getDefaultSettings() {
    return {
        language: 'tr',
        country: 'tr',
        theme: 'gradient',
        animations: true,
        albumCovers: true,
        autoStart: false,
        startPage: 'home',
        streamQuality: 'high',
        downloadQuality: 'high',
        bassBoost: 0,
        normalize: true,
        audioDevice: 'default',
        autoplay: true,
        crossfade: 0,
        gapless: true,
        defaultShuffle: false,
        defaultRepeat: 'off',
        trackChangeNotif: true,
        newMusicNotif: true,
        weeklyDigest: false,
        recommendations: false,
        saveHistory: true,
        privateSession: false,
        profileVisibility: 'public',
        allowPlaylistSharing: true,
        cacheSize: '2',
        autoCleanCache: true,
        betaFeatures: false,
        debugMode: false
    };
}

// Event listeners'ı başlat
function initializeEventListeners() {
    // Ayarlar navigasyonu
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSettingsSection(section);
        });
    });

    // Ayar değişiklikleri
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('change', function() {
            // Auto-save özelliği
            if (element.id && element.id !== 'search-input') {
                saveSettings();
            }
        });
    });

    // Slider değerleri
    document.querySelectorAll('.setting-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            updateSliderValue(this);
        });
    });

    // Buton event listeners
    document.addEventListener('click', function(e) {
        if (e.target.matches('#logoutLink, #logoutLink *')) {
            logout();
        }
    });

    // Arama fonksiyonu
    document.getElementById('search-input').addEventListener('input', function() {
        searchSettings(this.value);
    });
}

// Navigasyon event listeners
function initializeNavigation() {
    // Dropdown menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });
    }
}

// Ayarlar bölümünü göster
function showSettingsSection(sectionId) {
    // Tüm bölümleri gizle
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });

    // Tüm nav itemlardan active'i kaldır
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Seçili bölümü göster
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Nav item'ı aktif yap
    const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    }
}

// Slider değerlerini güncelle
function updateSliderValues() {
    document.querySelectorAll('.setting-slider').forEach(slider => {
        updateSliderValue(slider);
    });
}

// Tek slider değerini güncelle
function updateSliderValue(slider) {
    const valueSpan = slider.parentElement.querySelector('.slider-value');
    if (valueSpan) {
        let value = slider.value;
        
        if (slider.id === 'crossfade') {
            value += 's';
        } else if (slider.id === 'bassBoost') {
            value = value === '0' ? 'Kapalı' : value;
        }
        
        valueSpan.textContent = value;
    }
}

// Ayarları kaydet
function saveSettings() {
    const settings = {};
    
    // Tüm form elementlerinden ayarları topla
    document.querySelectorAll('input, select').forEach(element => {
        if (element.id && element.id !== 'search-input') {
            if (element.type === 'checkbox') {
                settings[element.id] = element.checked;
            } else {
                settings[element.id] = element.value;
            }
        }
    });

    // LocalStorage'a kaydet
    localStorage.setItem('userSettings', JSON.stringify(settings));

    // Başarı mesajı göster
    showNotification('Ayarlar kaydedildi!', 'success');

    // Tema değişikliği varsa uygula
    if (settings.theme) {
        applyTheme(settings.theme);
    }
}

// Varsayılana sıfırla
function resetToDefaults() {
    if (confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
        localStorage.removeItem('userSettings');
        loadSettings();
        showNotification('Ayarlar varsayılan değerlere sıfırlandı!', 'info');
    }
}

// Tema uygula
function applyTheme(theme) {
    document.body.className = ''; // Mevcut tema sınıflarını temizle
    
    switch(theme) {
        case 'dark':
            document.body.classList.add('dark-theme');
            break;
        case 'light':
            document.body.classList.add('light-theme');
            break;
        case 'auto':
            // Sistem temasını kontrol et
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.add('light-theme');
            }
            break;
        default: // gradient
            // Varsayılan gradient tema
            break;
    }
}

// Ayarlarda arama
function searchSettings(query) {
    const searchTerm = query.toLowerCase();
    const settingSections = document.querySelectorAll('.settings-section');
    
    if (!query.trim()) {
        // Arama boşsa tüm bölümleri göster
        settingSections.forEach(section => {
            section.style.display = 'block';
            section.querySelectorAll('.setting-item').forEach(item => {
                item.style.display = 'block';
            });
        });
        return;
    }

    settingSections.forEach(section => {
        let hasVisibleItems = false;
        
        section.querySelectorAll('.setting-item').forEach(item => {
            const label = item.querySelector('label');
            const span = item.querySelector('.setting-info span');
            
            const labelText = label ? label.textContent.toLowerCase() : '';
            const spanText = span ? span.textContent.toLowerCase() : '';
            
            if (labelText.includes(searchTerm) || spanText.includes(searchTerm)) {
                item.style.display = 'block';
                hasVisibleItems = true;
            } else {
                item.style.display = 'none';
            }
        });

        section.style.display = hasVisibleItems ? 'block' : 'none';
    });
}

// Özel fonksiyonlar
function openEqualizer() {
    showNotification('Equalizer özelliği yakında geliyor!', 'info');
}

function clearCache() {
    if (confirm('Cache temizlensin mi? Bu işlem biraz zaman alabilir.')) {
        // Simüle edilmiş cache temizleme
        showNotification('Cache temizlendi! 1.2 GB alan boşaltıldı.', 'success');
    }
}

function exportData() {
    const userData = {
        user: JSON.parse(localStorage.getItem('currentUser')),
        settings: JSON.parse(localStorage.getItem('userSettings')),
        favorites: JSON.parse(localStorage.getItem('favorites')),
        playlists: JSON.parse(localStorage.getItem('playlists')),
        history: JSON.parse(localStorage.getItem('playHistory'))
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `muziksite-verileri-${new Date().getTime()}.json`;
    link.click();

    showNotification('Verileriniz indiriliyor...', 'success');
}

function deleteAllData() {
    const confirmText = 'Tüm verilerimi sil';
    const userInput = prompt(`Bu işlem geri alınamaz! Devam etmek için "${confirmText}" yazın:`);
    
    if (userInput === confirmText) {
        // Tüm localStorage verilerini temizle
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userSettings');
        localStorage.removeItem('favorites');
        localStorage.removeItem('playlists');
        localStorage.removeItem('playHistory');
        localStorage.removeItem('registeredUsers');

        alert('Tüm verileriniz silindi. Giriş sayfasına yönlendiriliyorsunuz...');
        window.location.href = 'login.html';
    } else {
        showNotification('İşlem iptal edildi.', 'warning');
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    // Mevcut bildirimi kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Sayfaya ekle
    document.body.appendChild(notification);

    // 3 saniye sonra otomatik kaldır
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Bildirim ikonunu al
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
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

// Geri/İleri navigasyon
function goBack() {
    window.history.back();
}

function goForward() {
    window.history.forward();
}

function showCreatePlaylist() {
    window.location.href = 'playlists.html#create';
}

// Arama göster
function showSearch() {
    document.getElementById('search-input').focus();
}

// Yeni çalma listesi oluştur
function showCreatePlaylist() {
    window.location.href = 'playlists.html#create';
}

// Sayfa yüklendiğinde tema uygula
window.addEventListener('load', function() {
    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (settings && settings.theme) {
        applyTheme(settings.theme);
    }
});

// Sistem tema değişikliğini dinle
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(function(e) {
        const settings = JSON.parse(localStorage.getItem('userSettings'));
        if (settings && settings.theme === 'auto') {
            applyTheme('auto');
        }
    });
}

// Kullanıcı menüsü fonksiyonları
function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (userMenuBtn && userDropdown) {
        // Kullanıcı menü butonuna tıklama
        userMenuBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleUserDropdown();
        });
        
        // Dropdown dışına tıklandığında kapat
        document.addEventListener('click', function(event) {
            if (!userDropdown.contains(event.target) && !userMenuBtn.contains(event.target)) {
                closeUserDropdown();
            }
        });
        
        // Profil linki
        if (profileLink) {
            profileLink.addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = 'profile.html';
            });
        }
        
        // Çıkış linki
        if (logoutLink) {
            logoutLink.addEventListener('click', function(event) {
                event.preventDefault();
                logout();
            });
        }
    }
}

// Dropdown toggle
function toggleUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.classList.toggle('show');
    }
}

// Dropdown kapat
function closeUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.classList.remove('show');
    }
}

// Çıkış yapma
function logout() {
    // Onay sorusu
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
        sessionStorage.clear();
        
        // Başarı mesajı
        showNotification('Başarıyla çıkış yaptınız', 'success');
        
        // 1 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}