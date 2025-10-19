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

    // Settings navigation
    initializeSettingsNavigation();

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
    
    // Temayı uygula
    if (settings.theme) {
        applyTheme(settings.theme);
    }
    
    // Diğer ayarları uygula
    applySettings(settings);
    
    console.log('Ayarlar yüklendi:', settings);
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

    // Ayar değişiklikleri - Otomatik kaydetme
    document.querySelectorAll('input, select').forEach(element => {
        if (element.id && element.id !== 'search-input') {
            // Checkbox ve select için change eventi
            if (element.type === 'checkbox' || element.tagName === 'SELECT') {
                element.addEventListener('change', function() {
                    autoSaveSettings();
                });
            }
            // Range slider için input eventi
            else if (element.type === 'range') {
                element.addEventListener('change', function() {
                    autoSaveSettings();
                });
            }
            // Diğer input'lar için change eventi
            else {
                element.addEventListener('change', function() {
                    autoSaveSettings();
                });
            }
        }
    });

    // Slider değerleri - Anlık güncelleme
    document.querySelectorAll('input[type="range"]').forEach(slider => {
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
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchSettings(this.value);
        });
    }
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

// Ayarlar sayfası navigasyonu
function initializeSettingsNavigation() {
    // Settings nav item'lara click event ekle
    document.querySelectorAll('.settings-nav-item').forEach(navItem => {
        navItem.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                showSettingsSection(sectionId);
            }
        });
    });
    
    // Sayfa yüklendiğinde URL hash'e göre bölüm göster
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        showSettingsSection(sectionId);
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
    showNotification('✅ Ayarlar başarıyla kaydedildi!', 'success');

    // Tema değişikliği varsa uygula
    if (settings.theme) {
        applyTheme(settings.theme);
    }
}

// Otomatik kaydetme (sessiz)
function autoSaveSettings() {
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

    // Mini bildirim göster (opsiyonel)
    showMiniNotification('💾 Kaydedildi');

    // Tema değişikliği varsa uygula
    if (settings.theme) {
        applyTheme(settings.theme);
    }
    
    // Animasyonları uygula
    if (settings.animations !== undefined) {
        applyAnimationSettings(settings.animations);
    }
    
    // Diğer ayarları uygula
    applySettings(settings);
}

// Ayarları uygula
function applySettings(settings) {
    // Animasyonlar
    if (settings.animations === false) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }
    
    // Albüm kapakları
    if (settings.albumCovers === false) {
        document.body.classList.add('hide-album-covers');
    } else {
        document.body.classList.remove('hide-album-covers');
    }
    
    console.log('Ayarlar uygulandı:', settings);
}

// Animasyon ayarlarını uygula
function applyAnimationSettings(enabled) {
    if (!enabled) {
        document.body.classList.add('no-animations');
        document.body.style.setProperty('--transition-speed', '0s');
    } else {
        document.body.classList.remove('no-animations');
        document.body.style.setProperty('--transition-speed', '0.3s');
    }
    console.log('Animasyonlar:', enabled ? 'Açık' : 'Kapalı');
}

// Mini bildirim (kısa süre göster)
function showMiniNotification(message) {
    // Mevcut mini bildirimi kaldır
    const existingMini = document.querySelector('.mini-notification');
    if (existingMini) {
        existingMini.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'mini-notification';
    notification.textContent = message;
    
    // Stil ekle (eğer yoksa)
    if (!document.getElementById('mini-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'mini-notification-styles';
        style.textContent = `
            .mini-notification {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: rgba(26, 26, 46, 0.95);
                backdrop-filter: blur(10px);
                padding: 10px 20px;
                border-radius: 20px;
                color: #10b981;
                font-size: 13px;
                font-weight: 600;
                z-index: 9999;
                animation: miniSlideIn 0.2s ease-out, miniSlideOut 0.2s ease-in 1.3s;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            
            @keyframes miniSlideIn {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes miniSlideOut {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(50px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 1.5 saniye sonra otomatik kaldır
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, 1500);
}

// Varsayılana sıfırla
function resetToDefaults() {
    showConfirmModal(
        'Ayarları Sıfırla',
        'Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?',
        function() {
            localStorage.removeItem('userSettings');
            loadSettings();
            showNotification('🔄 Ayarlar varsayılan değerlere sıfırlandı!', 'info');
        }
    );
}

// Tema uygula
function applyTheme(theme) {
    // Mevcut tema sınıflarını temizle
    document.body.classList.remove('dark-theme', 'light-theme', 'theme-apple-squid-glass');
    
    switch(theme) {
        case 'dark':
            document.body.classList.add('dark-theme');
            console.log('Koyu tema uygulandı');
            break;
        case 'light':
            document.body.classList.add('light-theme');
            console.log('Açık tema uygulandı');
            break;
        case 'auto':
            // Sistem temasını kontrol et
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-theme');
                console.log('Sistem teması (Koyu) uygulandı');
            } else {
                document.body.classList.add('light-theme');
                console.log('Sistem teması (Açık) uygulandı');
            }
            break;
        case 'gradient':
        default:
            // Varsayılan gradient tema
            document.body.classList.add('theme-apple-squid-glass');
            console.log('Modern Gradient tema uygulandı');
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
    showConfirmModal(
        'Cache Temizle',
        'Önbelleği temizlemek istediğinizden emin misiniz? Bu işlem biraz zaman alabilir.',
        function() {
            // Simüle edilmiş cache temizleme
            showNotification('🗑️ Cache temizlendi! 1.2 GB alan boşaltıldı.', 'success');
        }
    );
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
    link.download = `frekans-verileri-${new Date().getTime()}.json`;
    link.click();

    showNotification('📥 Verileriniz indiriliyor...', 'success');
}

function deleteAllData() {
    showConfirmModal(
        'Tüm Verileri Sil',
        '⚠️ Bu işlem geri alınamaz! Tüm verileriniz (favoriler, çalma listeleri, geçmiş) kalıcı olarak silinecektir.',
        function() {
            // Tüm localStorage verilerini temizle
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userSettings');
            localStorage.removeItem('favorites');
            localStorage.removeItem('playlists');
            localStorage.removeItem('playHistory');
            localStorage.removeItem('profileData');
            localStorage.removeItem('followersCount');
            localStorage.removeItem('followingCount');
            localStorage.removeItem('registeredUsers');

            showNotification('🗑️ Tüm verileriniz silindi!', 'success');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    );
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

// Debug: Settings.js yüklendi
console.log('Settings.js loaded successfully');

// Sayfa yüklendikten sonra user menu'yu tekrar kur
window.addEventListener('load', function() {
    console.log('Page loaded, setting up user menu');
    setTimeout(function() {
        const btn = document.getElementById('userMenuBtn');
        const dropdown = document.getElementById('userDropdown');
        console.log('User menu button:', btn);
        console.log('User dropdown:', dropdown);
        
        if (btn && dropdown) {
            // Event listener'ı direkt ekle
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('User menu clicked!');
                dropdown.classList.toggle('show');
            };
            
            // Dışarı tıklandığında kapat
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.user-dropdown')) {
                    dropdown.classList.remove('show');
                }
            });
        }
    }, 100);
});// Kullanıcı menüsü fonksiyonları
function setupUserMenu() {
    console.log('setupUserMenu called');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const profileLink = document.getElementById('profileLink');
    const settingsLink = document.getElementById('settingsLink');
    const logoutLink = document.getElementById('logoutLink');
    
    console.log('Elements found:', {userMenuBtn, userDropdown, profileLink, settingsLink, logoutLink});
    
    if (userMenuBtn && userDropdown) {
        console.log('Setting up user menu event listeners');
        // Kullanıcı menü butonuna tıklama
        userMenuBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Dropdown'u aç/kapat
            const isOpen = userDropdown.classList.contains('show');
            
            // Önce tüm dropdownları kapat
            document.querySelectorAll('.dropdown-content').forEach(dd => {
                dd.classList.remove('show');
            });
            
            // Bu dropdown'u aç (eğer kapalıysa)
            if (!isOpen) {
                userDropdown.classList.add('show');
            }
        });
        
        // Dropdown dışına tıklandığında kapat
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.user-dropdown')) {
                userDropdown.classList.remove('show');
            }
        });
        
        // Profil linki
        if (profileLink) {
            profileLink.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = 'profile.html';
            });
        }
        
        // Ayarlar linki (şu anki sayfada olduğumuz için sadece kapat)
        if (settingsLink) {
            settingsLink.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                userDropdown.classList.remove('show');
            });
        }
        
        // Çıkış linki
        if (logoutLink) {
            logoutLink.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
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
    document.getElementById('logoutModal').classList.add('active');
}

// Logout modalını kapat
function closeLogoutModal() {
    document.getElementById('logoutModal').classList.remove('active');
}

// Çıkışı onayla
function confirmLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberUser');
    sessionStorage.clear();
    
    closeLogoutModal();
    showNotification('👋 Başarıyla çıkış yaptınız', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Onay modalı göster
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.onclick = function() {
        closeConfirmModal();
        if (onConfirm) onConfirm();
    };
    
    document.getElementById('confirmModal').classList.add('active');
}

// Onay modalını kapat
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

// Modern bildirim göster
function showNotification(message, type = 'info') {
    // Mevcut bildirimi kaldır
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'times-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // 3 saniye sonra otomatik kaldır
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 3000);
}