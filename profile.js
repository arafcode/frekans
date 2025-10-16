// Profile.js - Profil sayfası fonksiyonları

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
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = `Hoş geldin, ${currentUser.firstName}!`;
    }

    // Kullanıcı menüsünü kur
    setupUserMenu();

    // Kullanıcı bilgilerini yükle
    loadUserProfile();

    // Event listeners
    initializeEventListeners();

    // İstatistikleri yükle
    loadProfileStats();

    // Aktivite verilerini yükle
    loadActivityData();
});

// Kullanıcı profilini yükle
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Kullanıcı bilgilerini göster
    document.getElementById('userName').textContent = `Hoş geldin, ${currentUser.firstName}!`;
    document.getElementById('profileName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    // Profil bilgilerini localStorage'dan yükle veya varsayılanları kullan
    const profileData = JSON.parse(localStorage.getItem('profileData')) || getDefaultProfileData();
    
    if (profileData.bio) {
        document.getElementById('profileBio').textContent = profileData.bio;
    }
    
    if (profileData.location) {
        document.getElementById('location').textContent = profileData.location;
    }
    
    if (profileData.birthday) {
        document.getElementById('birthday').textContent = profileData.birthday;
    }
    
    if (profileData.joinDate) {
        document.getElementById('joinDate').textContent = profileData.joinDate;
    }
    
    // Profil resimlerini yükle
    if (profileData.avatarUrl) {
        document.getElementById('avatarImage').src = profileData.avatarUrl;
    }
    
    if (profileData.coverUrl) {
        document.getElementById('coverImage').src = profileData.coverUrl;
    }
}

// Varsayılan profil verileri
function getDefaultProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const joinDate = new Date(currentUser.registrationDate || Date.now());
    
    return {
        bio: '🎵 Müzik tutkunu | 🎧 Her gün yeni keşifler | 🌟 Müzikte sınır tanımam',
        location: 'İstanbul, Türkiye',
        birthday: '15 Mart',
        joinDate: `${joinDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}'te katıldı`,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=300&fit=crop&crop=center'
    };
}

// Profil istatistiklerini yükle
function loadProfileStats() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playHistory = JSON.parse(localStorage.getItem('playHistory')) || [];
    
    // İstatistikleri hesapla
    const favoritesCount = favorites.length;
    const playlistsCount = playlists.length;
    const followersCount = Math.floor(Math.random() * 1000) + 50; // Simüle edilmiş takipçi sayısı
    
    // Dinleme süresini hesapla (simüle edilmiş)
    const totalMinutes = playHistory.length * 3.5; // Ortalama şarkı süresi
    const hours = Math.floor(totalMinutes / 60);
    const listeningTime = hours > 0 ? `${hours}h` : `${Math.floor(totalMinutes)}m`;
    
    // DOM'u güncelle
    document.getElementById('favoritesCount').textContent = favoritesCount;
    document.getElementById('playlistsCount').textContent = playlistsCount;
    document.getElementById('listeningTime').textContent = listeningTime;
    document.getElementById('followersCount').textContent = followersCount;
}

// Event listeners'ı başlat
function initializeEventListeners() {
    // Sekme navigasyonu
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

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

    // Modal kapatma
    document.addEventListener('click', function(e) {
        if (e.target.matches('.modal')) {
            closeModal(e.target.id);
        }
        
        if (e.target.matches('.close-btn, .close-btn *')) {
            const modal = e.target.closest('.modal');
            if (modal) closeModal(modal.id);
        }
    });

    // Form submissions
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }

    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }

    // Logout
    document.addEventListener('click', function(e) {
        if (e.target.matches('#logoutLink, #logoutLink *')) {
            logout();
        }
    });
}

// Sekme değiştir
function switchTab(tabName) {
    // Tüm sekme butonlarından active'i kaldır
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Tüm sekme içeriklerini gizle
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Seçili sekme butonunu aktif yap
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Seçili sekme içeriğini göster
    const activeContent = document.getElementById(tabName);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// Aktivite verilerini yükle
function loadActivityData() {
    // Son dinlenen şarkıları simüle et
    const recentTracks = [
        { title: "Bohemian Rhapsody", artist: "Queen", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop&crop=center", time: "2 saat önce" },
        { title: "Hotel California", artist: "Eagles", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop&crop=center", time: "3 saat önce" },
        { title: "Imagine", artist: "John Lennon", image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=80&h=80&fit=crop&crop=center", time: "5 saat önce" },
        { title: "Sweet Child O' Mine", artist: "Guns N' Roses", image: "https://images.unsplash.com/photo-1461784180009-21f109c2237a?w=80&h=80&fit=crop&crop=center", time: "1 gün önce" },
        { title: "Stairway to Heaven", artist: "Led Zeppelin", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop&crop=center", time: "2 gün önce" }
    ];

    // En çok dinlenen sanatçıları simüle et
    const topArtists = [
        { name: "Queen", playCount: 87, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop&crop=center" },
        { name: "The Beatles", playCount: 65, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=60&h=60&fit=crop&crop=center" },
        { name: "Led Zeppelin", playCount: 52, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=60&fit=crop&crop=center" },
        { name: "Pink Floyd", playCount: 41, image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=60&h=60&fit=crop&crop=center" }
    ];

    // Son dinlenen şarkıları DOM'a ekle
    const recentTracksContainer = document.querySelector('#overview .recent-tracks .track-list');
    if (recentTracksContainer) {
        recentTracksContainer.innerHTML = recentTracks.map(track => `
            <div class="track-item">
                <img src="${track.image}" alt="${track.title}">
                <div class="track-info">
                    <h4>${track.title}</h4>
                    <p>${track.artist}</p>
                    <span class="track-time">${track.time}</span>
                </div>
                <button class="play-track-btn" onclick="playTrack('${track.title}')">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `).join('');
    }

    // En çok dinlenen sanatçıları DOM'a ekle
    const topArtistsContainer = document.querySelector('#overview .top-artists .artist-list');
    if (topArtistsContainer) {
        topArtistsContainer.innerHTML = topArtists.map(artist => `
            <div class="artist-item">
                <img src="${artist.image}" alt="${artist.name}">
                <div class="artist-info">
                    <h4>${artist.name}</h4>
                    <p>${artist.playCount} çalma</p>
                </div>
            </div>
        `).join('');
    }
}

// Profil düzenleme modalını aç
function editProfile() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) {
        // Mevcut bilgileri forma yükle
        const profileData = JSON.parse(localStorage.getItem('profileData')) || getDefaultProfileData();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        document.getElementById('edit-first-name').value = currentUser.firstName;
        document.getElementById('edit-last-name').value = currentUser.lastName;
        document.getElementById('edit-bio').value = profileData.bio || '';
        document.getElementById('edit-location').value = profileData.location || '';
        document.getElementById('edit-birthday').value = profileData.birthdayDate || '';
        
        modal.classList.add('active');
    }
}

// Profil değişikliklerini kaydet
function saveProfileChanges() {
    const firstName = document.getElementById('edit-first-name').value.trim();
    const lastName = document.getElementById('edit-last-name').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const location = document.getElementById('edit-location').value.trim();
    const birthday = document.getElementById('edit-birthday').value;

    if (!firstName || !lastName) {
        showNotification('Ad ve soyad gereklidir!', 'error');
        return;
    }

    // Kullanıcı bilgilerini güncelle
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Profil verilerini güncelle
    const profileData = JSON.parse(localStorage.getItem('profileData')) || getDefaultProfileData();
    profileData.bio = bio;
    profileData.location = location;
    if (birthday) {
        profileData.birthdayDate = birthday;
        profileData.birthday = new Date(birthday).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    }
    localStorage.setItem('profileData', JSON.stringify(profileData));

    // Sayfayı yenile
    loadUserProfile();
    
    closeModal('edit-profile-modal');
    showNotification('Profil güncellendi!', 'success');
}

// Şifre değiştirme modalını aç
function openChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Şifre değiştir
function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Tüm alanları doldurun!', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('Yeni şifreler eşleşmiyor!', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showNotification('Yeni şifre en az 6 karakter olmalı!', 'error');
        return;
    }

    // Mevcut şifreyi kontrol et
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentPassword !== currentUser.password) {
        showNotification('Mevcut şifre yanlış!', 'error');
        return;
    }

    // Şifreyi güncelle
    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Kayıtlı kullanıcıları da güncelle
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = registeredUsers.findIndex(user => user.email === currentUser.email);
    if (userIndex !== -1) {
        registeredUsers[userIndex].password = newPassword;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    // Formu temizle ve modalı kapat
    document.getElementById('change-password-form').reset();
    closeModal('change-password-modal');
    showNotification('Şifre başarıyla değiştirildi!', 'success');
}

// Avatar değiştir
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                document.getElementById('avatarImage').src = imageUrl;
                
                // Profil verisine kaydet
                const profileData = JSON.parse(localStorage.getItem('profileData')) || getDefaultProfileData();
                profileData.avatarUrl = imageUrl;
                localStorage.setItem('profileData', JSON.stringify(profileData));
                
                showNotification('Profil fotoğrafı güncellendi!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    input.click();
}

// Kapak fotoğrafı değiştir
function changeCoverImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                document.getElementById('coverImage').src = imageUrl;
                
                // Profil verisine kaydet
                const profileData = JSON.parse(localStorage.getItem('profileData')) || getDefaultProfileData();
                profileData.coverUrl = imageUrl;
                localStorage.setItem('profileData', JSON.stringify(profileData));
                
                showNotification('Kapak fotoğrafı güncellendi!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    input.click();
}

// Profil paylaş
function shareProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const shareText = `${currentUser.firstName} ${currentUser.lastName}'nin Frekans profilini inceleyin!`;
    const shareUrl = `${window.location.origin}/profile/${currentUser.email}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Frekans Profili',
            text: shareText,
            url: shareUrl
        }).then(() => {
            showNotification('Profil paylaşıldı!', 'success');
        }).catch(() => {
            copyToClipboard(shareUrl);
        });
    } else {
        copyToClipboard(shareUrl);
    }
}

// Takipçiler modalını aç
function openFollowersModal() {
    showNotification('Takipçiler özelliği yakında geliyor!', 'info');
}

// Şarkı çal
function playTrack(trackTitle) {
    showNotification(`"${trackTitle}" çalınıyor...`, 'info');
}

// Hesap sil
function deleteAccount() {
    const confirmation = prompt('Hesabınızı silmek için "HESABIMI SIL" yazın:');
    
    if (confirmation === 'HESABIMI SIL') {
        // Kullanıcıyı kayıtlı kullanıcılardan kaldır
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const updatedUsers = registeredUsers.filter(user => user.email !== currentUser.email);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        
        // Tüm kullanıcı verilerini temizle
        localStorage.removeItem('currentUser');
        localStorage.removeItem('profileData');
        localStorage.removeItem('favorites');
        localStorage.removeItem('playlists');
        localStorage.removeItem('playHistory');
        sessionStorage.clear();
        
        alert('Hesabınız başarıyla silindi.');
        window.location.href = 'login.html';
    } else {
        showNotification('İşlem iptal edildi.', 'warning');
    }
}

// Modal kapat
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Panoya kopyala
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Bağlantı panoya kopyalandı!', 'success');
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Bağlantı panoya kopyalandı!', 'success');
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

// Navigasyon fonksiyonları
function goBack() {
    window.history.back();
}

function goForward() {
    window.history.forward();
}

function showSearch() {
    document.getElementById('search-input').focus();
}

function showCreatePlaylist() {
    window.location.href = 'playlists.html#create';
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