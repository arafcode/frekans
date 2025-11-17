// Profile.js - Profil sayfası fonksiyonları

// Kullanıcı oturum kontrolü
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

    // Kullanıcı menüsünü kur
    setupUserMenu();

    // Kullanıcı bilgilerini yükle
    loadUserProfile();

    // Tab sistemi
    setupTabs();

    // İstatistikleri yükle
    loadProfileStats();

    // Son dinlenenleri ve aktivite verilerini yükle
    loadRecentActivity();
});

// Tab sistemi
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Aktif tab ve içeriği değiştir
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Aktivite sekmesi açıldığında gerçek verileri yükle
            if (targetTab === 'activity') {
                loadActivityTimeline();
            }
        });
    });
}

// Aktivite timeline'ını yükle - GERÇEK VERİ
function loadActivityTimeline() {
    const activityTimeline = document.querySelector('.activity-timeline');
    if (!activityTimeline) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playHistory = JSON.parse(localStorage.getItem('playHistory')) || [];
    const sharedMusic = JSON.parse(localStorage.getItem('sharedMusic')) || [];
    
    const activities = [];
    
    // Son dinlenenler
    playHistory.slice(0, 5).forEach(track => {
        if (track.playedAt) {
            activities.push({
                icon: 'fa-play',
                title: 'Şarkı dinledin',
                description: `${track.title} - ${track.artist}`,
                timestamp: track.playedAt,
                type: 'play'
            });
        }
    });
    
    // Beğenilen şarkılar
    favorites.slice(0, 5).forEach(track => {
        if (track.addedAt) {
            activities.push({
                icon: 'fa-heart',
                title: 'Şarkı beğendin',
                description: `${track.title} - ${track.artist}`,
                timestamp: track.addedAt,
                type: 'favorite'
            });
        }
    });
    
    // Oluşturulan çalma listeleri
    playlists.forEach(playlist => {
        if (playlist.createdAt) {
            activities.push({
                icon: 'fa-list',
                title: 'Çalma listesi oluşturdun',
                description: playlist.name,
                timestamp: playlist.createdAt,
                type: 'playlist'
            });
        }
    });
    
    // Paylaşılan müzikler
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    sharedMusic.filter(s => s.from === (currentUser?.id)).slice(0, 3).forEach(share => {
        if (share.timestamp) {
            activities.push({
                icon: 'fa-share',
                title: 'Müzik paylaştın',
                description: share.title || 'Müzik',
                timestamp: share.timestamp,
                type: 'share'
            });
        }
    });
    
    // Timestamp'e göre sırala (en yeni en üstte)
    activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Boş kontrolü
    if (activities.length === 0) {
        activityTimeline.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5);">
                <i class="fas fa-clock" style="font-size: 64px; color: rgba(255,255,255,0.1); margin-bottom: 20px;"></i>
                <p style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Henüz aktivite yok</p>
                <p style="font-size: 14px;">Müzik dinlemeye, beğenmeye ve paylaşmaya başladığında burada görünecek</p>
            </div>
        `;
        return;
    }
    
    // Aktiviteleri göster
    activityTimeline.innerHTML = activities.map(activity => {
        const timeAgo = getTimeAgo(activity.timestamp);
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Zaman farkını hesapla
function getTimeAgo(timestamp) {
    if (!timestamp) return 'Bilinmeyen zaman';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Az önce';
    if (minutes < 60) return minutes + ' dakika önce';
    if (hours < 24) return hours + ' saat önce';
    if (days < 7) return days + ' gün önce';
    if (days < 30) return Math.floor(days / 7) + ' hafta önce';
    if (days < 365) return Math.floor(days / 30) + ' ay önce';
    return Math.floor(days / 365) + ' yıl önce';
}

// Kullanıcı profilini yükle
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    // Kullanıcı bilgilerini göster
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = `Hoş geldin, ${currentUser.firstName}!`;
    }
    
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    // Profil bilgilerini localStorage'dan yükle
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    
    // Biyografi
    const profileBio = document.getElementById('profileBio');
    if (profileBio) {
        profileBio.textContent = profileData.bio || '🎵 Müzik tutkunu | 🎧 Her gün yeni keşifler';
    }
    
    // Lokasyon
    const location = document.getElementById('location');
    if (location) {
        location.textContent = profileData.location || 'İstanbul, Türkiye';
    }
    
    // Doğum günü
    const birthday = document.getElementById('birthday');
    if (birthday) {
        birthday.textContent = profileData.birthday || '15 Mart';
    }
    
    // Katılma tarihi
    const joinDate = document.getElementById('joinDate');
    if (joinDate) {
        const date = new Date(currentUser.registrationDate || Date.now());
        joinDate.textContent = `${date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}'te katıldı`;
    }
    
    // Profil resimlerini yükle
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage && profileData.avatarUrl) {
        avatarImage.src = profileData.avatarUrl;
    }
    
    const coverImage = document.getElementById('coverImage');
    if (coverImage && profileData.coverUrl) {
        coverImage.src = profileData.coverUrl;
    }
}

// Profil istatistiklerini yükle
function loadProfileStats() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playHistory = JSON.parse(localStorage.getItem('playHistory')) || [];
    
    // İstatistikleri güncelle
    const favoritesCount = document.getElementById('favoritesCount');
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
    
    const playlistsCount = document.getElementById('playlistsCount');
    if (playlistsCount) {
        playlistsCount.textContent = playlists.length;
    }
    
    // Dinleme süresini hesapla
    const totalMinutes = playHistory.length * 3.5; // Ortalama şarkı süresi
    const hours = Math.floor(totalMinutes / 60);
    const listeningTime = document.getElementById('listeningTime');
    if (listeningTime) {
        listeningTime.textContent = hours > 0 ? `${hours}h` : `${Math.floor(totalMinutes)}m`;
    }
    
    // Takipçi sayısı (gerçek arkadaş sayısı)
    const followersCount = document.getElementById('followersCount');
    if (followersCount) {
        const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentUserId = currentUser ? currentUser.id : null;
        
        const friendCount = friendships.filter(f => 
            f.user1 === currentUserId || f.user2 === currentUserId
        ).length;
        
        followersCount.textContent = friendCount;
    }
}

// Son aktiviteleri yükle
function loadRecentActivity() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const playHistory = JSON.parse(localStorage.getItem('playHistory')) || [];
    
    // Son dinlenenleri göster - GERÇEK VERİ
    const recentTracks = document.getElementById('recentTracks');
    if (recentTracks && playHistory.length > 0) {
        // Son dinlenenleri tarih sırasına göre sırala
        const sortedHistory = [...playHistory].sort((a, b) => {
            return (b.playedAt || 0) - (a.playedAt || 0);
        }).slice(0, 5);
        
        recentTracks.innerHTML = sortedHistory.map(track => {
            const playCount = playHistory.filter(h => h.title === track.title).length;
            return `
                <div class="track-item">
                    <img src="${track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop'}" 
                         alt="${track.title}" class="track-cover">
                    <div class="track-info">
                        <div class="track-name">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                    </div>
                    <div class="track-plays">${playCount} kez dinledin</div>
                </div>
            `;
        }).join('');
    } else if (recentTracks) {
        recentTracks.innerHTML = `
            <div class="empty-state-text">
                <i class="fas fa-music" style="font-size: 48px; color: rgba(255,255,255,0.2); margin-bottom: 16px;"></i>
                <p>Henüz dinleme geçmişiniz yok</p>
                <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">Ana sayfadan müzik dinlemeye başlayın</p>
            </div>
        `;
    }
    
    // En çok dinlenen şarkıları göster - GERÇEK VERİ
    const topTracks = document.getElementById('topTracks');
    if (topTracks && playHistory.length > 0) {
        // Şarkıları dinlenme sayısına göre grupla ve sırala
        const trackCounts = {};
        playHistory.forEach(track => {
            const key = `${track.title}|${track.artist}`;
            if (!trackCounts[key]) {
                trackCounts[key] = { ...track, playCount: 0 };
            }
            trackCounts[key].playCount++;
        });
        
        const topTracksArray = Object.values(trackCounts)
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 5);
        
        topTracks.innerHTML = topTracksArray.map((track, index) => `
            <div class="track-item">
                <div style="width: 24px; text-align: center; font-weight: 700; color: ${index === 0 ? '#FFD700' : 'rgba(255,255,255,0.5)'};">
                    ${index + 1}
                </div>
                <img src="${track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop'}" 
                     alt="${track.title}" class="track-cover">
                <div class="track-info">
                    <div class="track-name">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-plays">${track.playCount} dinleme</div>
            </div>
        `).join('');
    } else if (topTracks) {
        topTracks.innerHTML = `
            <div class="empty-state-text">
                <i class="fas fa-chart-line" style="font-size: 48px; color: rgba(255,255,255,0.2); margin-bottom: 16px;"></i>
                <p>Henüz dinleme istatistiğiniz yok</p>
                <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">Müzik dinledikçe en çok dinledikleriniz burada görünecek</p>
            </div>
        `;
    }
}

// Kapak fotoğrafı değiştirme
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
                const coverImage = document.getElementById('coverImage');
                if (coverImage) {
                    coverImage.src = imageUrl;
                }
                
                // Profil verisine kaydet
                const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
                profileData.coverUrl = imageUrl;
                localStorage.setItem('profileData', JSON.stringify(profileData));
                
                showNotification('Kapak fotoğrafı güncellendi!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    input.click();
}

// Profil fotoğrafı değiştirme
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
                const avatarImage = document.getElementById('avatarImage');
                if (avatarImage) {
                    avatarImage.src = imageUrl;
                }
                
                // Profil verisine kaydet
                const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
                profileData.avatarUrl = imageUrl;
                localStorage.setItem('profileData', JSON.stringify(profileData));
                
                showNotification('Profil fotoğrafı güncellendi!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    input.click();
}

// Profil düzenleme modalı aç
function editProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    
    // Modal inputlarını doldur
    document.getElementById('editFirstName').value = currentUser.firstName || '';
    document.getElementById('editLastName').value = currentUser.lastName || '';
    document.getElementById('editBio').value = profileData.bio || '';
    document.getElementById('editLocation').value = profileData.location || '';
    document.getElementById('editBirthday').value = profileData.birthday || '';
    
    // Modalı göster
    document.getElementById('editProfileModal').classList.add('active');
}

// Profil düzenleme modalını kapat
function closeEditModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

// Profil değişikliklerini kaydet
function saveProfileChanges() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    
    // Değerleri al
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const location = document.getElementById('editLocation').value.trim();
    const birthday = document.getElementById('editBirthday').value.trim();
    
    // Validasyon
    if (!firstName) {
        showNotification('Lütfen adınızı girin', 'error');
        return;
    }
    
    // Kullanıcı bilgilerini güncelle
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Profil verilerini güncelle
    profileData.bio = bio;
    profileData.location = location;
    profileData.birthday = birthday;
    localStorage.setItem('profileData', JSON.stringify(profileData));
    
    // UI'ı güncelle
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = `${firstName} ${lastName}`;
    }
    
    const profileBio = document.getElementById('profileBio');
    if (profileBio) {
        profileBio.textContent = bio || '🎵 Müzik tutkunu | 🎧 Her gün yeni keşifler';
    }
    
    const locationEl = document.getElementById('location');
    if (locationEl) {
        locationEl.textContent = location || 'İstanbul, Türkiye';
    }
    
    const birthdayEl = document.getElementById('birthday');
    if (birthdayEl) {
        birthdayEl.textContent = birthday || '15 Mart';
    }
    
    // Modalı kapat ve bildirim göster
    closeEditModal();
    showNotification('Profil başarıyla güncellendi!', 'success');
}

// Profil paylaşma
function shareProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const shareText = `🎵 ${currentUser.firstName} ${currentUser.lastName}'nin Frekans profilini inceleyin!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Frekans Profili',
            text: shareText,
            url: shareUrl
        }).then(() => {
            showNotification('✨ Profil başarıyla paylaşıldı!', 'success');
        }).catch((error) => {
            // Kullanıcı iptal ettiyse sessizce geç
            if (error.name !== 'AbortError') {
                copyToClipboard(shareUrl);
            }
        });
    } else {
        // Web Share API desteklenmiyorsa linki kopyala
        copyToClipboard(shareUrl);
    }
}

// Takipçiler modalı aç - GERÇEK VERİ
function openFollowersModal() {
    const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser ? currentUser.id : null;
    
    // Gerçek arkadaş sayısı
    const friendCount = friendships.filter(f => 
        f.user1 === currentUserId || f.user2 === currentUserId
    ).length;
    
    // Modal içeriğini güncelle
    document.getElementById('modalFollowersCount').textContent = friendCount;
    document.getElementById('modalFollowingCount').textContent = friendCount;
    
    // Arkadaş listesini göster
    displayFriendsInModal(friendships, currentUserId);
    
    // Modalı göster
    document.getElementById('followersModal').classList.add('active');
}

// Arkadaşları modalda göster
function displayFriendsInModal(friendships, currentUserId) {
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) return;
    
    if (friendships.length === 0) {
        friendsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">
                <i class="fas fa-user-friends" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>Henüz arkadaşın yok</p>
                <p style="font-size: 12px; margin-top: 8px;">Sosyal sayfasından arkadaş ekleyebilirsin</p>
            </div>
        `;
        return;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    
    friendsList.innerHTML = friendships.map(friendship => {
        const friendId = friendship.user1 === currentUserId ? friendship.user2 : friendship.user1;
        const friend = allUsers.find(u => u.id === friendId);
        
        if (!friend) return '';
        
        const avatar = friend.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(friend.firstName);
        
        return `
            <div style="display: flex; align-items: center; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.05); margin-bottom: 8px;">
                <img src="${avatar}" alt="${friend.firstName}" style="width: 48px; height: 48px; border-radius: 50%; margin-right: 12px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${friend.firstName} ${friend.lastName || ''}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${friend.email}</div>
                </div>
                <button class="btn secondary small" onclick="window.location.href='social.html'">
                    Profil
                </button>
            </div>
        `;
    }).join('');
}

// Takipçiler modalını kapat
function closeFollowersModal() {
    document.getElementById('followersModal').classList.remove('active');
}

// 3 nokta menüsü
function showMoreOptions() {
    document.getElementById('moreOptionsModal').classList.add('active');
}

// Daha fazla seçenekler modalını kapat
function closeMoreModal() {
    document.getElementById('moreOptionsModal').classList.remove('active');
}

// Profil seçeneklerini işle
function handleProfileOption(option) {
    closeMoreModal();
    
    switch(option) {
        case 'hide':
            showNotification('Profil gizleme özelliği yakında geliyor!', 'info');
            break;
        case 'links':
            showNotification('Bağlantı yönetimi özelliği yakında geliyor!', 'info');
            break;
        case 'privacy':
            setTimeout(() => {
                window.location.href = 'settings.html';
            }, 300);
            break;
        case 'qr':
            showNotification('QR kod özelliği yakında geliyor!', 'info');
            break;
    }
}

// Panoya kopyala
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('🔗 Profil linki kopyalandı!', 'success');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showNotification('🔗 Profil linki kopyalandı!', 'success');
    } catch (err) {
        showNotification('❌ Kopyalama başarısız oldu', 'error');
    }
    document.body.removeChild(textArea);
}

// Bildirim göster
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

    // Stil ekle (eğer yoksa)
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-toast {
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
                backdrop-filter: blur(20px);
                padding: 16px 24px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                gap: 14px;
                z-index: 10001;
                animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                font-size: 15px;
                font-weight: 500;
                max-width: 400px;
                min-width: 280px;
                color: #fff;
            }
            
            .notification-toast i {
                font-size: 22px;
                flex-shrink: 0;
            }
            
            .notification-toast span {
                flex: 1;
                line-height: 1.4;
            }
            
            .notification-success {
                border-left: 3px solid #10b981;
            }
            
            .notification-success i {
                color: #10b981;
            }
            
            .notification-error {
                border-left: 3px solid #ef4444;
            }
            
            .notification-error i {
                color: #ef4444;
            }
            
            .notification-warning {
                border-left: 3px solid #f59e0b;
            }
            
            .notification-warning i {
                color: #f59e0b;
            }
            
            .notification-info {
                border-left: 3px solid #667eea;
            }
            
            .notification-info i {
                color: #667eea;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(450px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(450px);
                    opacity: 0;
                }
            }

            .empty-state-text {
                padding: 40px 20px;
                text-align: center;
                color: #888;
                font-style: italic;
            }

            @media (max-width: 768px) {
                .notification-toast {
                    top: 70px;
                    right: 16px;
                    left: 16px;
                    max-width: none;
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }

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

// Navigasyon fonksiyonları
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    }
}

function goForward() {
    window.history.forward();
}

function showSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.focus();
    }
}

function showCreatePlaylist() {
    window.location.href = 'playlists.html#create';
}

// Kullanıcı menüsü fonksiyonları
function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const profileLink = document.getElementById('profileLink');
    const settingsLink = document.getElementById('settingsLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (userMenuBtn && userDropdown) {
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
        
        // Profil linki (şu anki sayfada olduğumuz için sadece kapat)
        if (profileLink) {
            profileLink.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                userDropdown.classList.remove('show');
            });
        }
        
        // Ayarlar linki
        if (settingsLink) {
            settingsLink.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = 'settings.html';
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

// Çıkış yapma
function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
        sessionStorage.clear();
        
        showNotification('Başarıyla çıkış yaptınız', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// SPA için profile yükleme fonksiyonu
function loadProfile() {
    console.log('🎭 Profile sayfası yükleniyor (SPA)...');
    
    // Kullanıcı girişi kontrolü
    const currentUser = checkUserSession();
    if (!currentUser) {
        return;
    }

    // Kullanıcı menüsünü kur
    if (typeof setupUserMenu === 'function') {
        setupUserMenu();
    }

    // Kullanıcı bilgilerini yükle
    if (typeof loadUserProfile === 'function') {
        loadUserProfile();
    }

    // Tab sistemi
    if (typeof setupTabs === 'function') {
        setupTabs();
    }

    // İstatistikleri yükle
    if (typeof loadProfileStats === 'function') {
        loadProfileStats();
    }

    // Son dinlenenleri ve aktivite verilerini yükle
    if (typeof loadRecentActivity === 'function') {
        loadRecentActivity();
    }
    
    console.log('✅ Profile sayfası yüklendi');
}
