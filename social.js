// Social.js - Sosyal özellikler ve arkadaşlık sistemi

console.log('🎵 Social.js yüklendi');

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
    // DEMO KULLANICILARI TEMİZLE (ilk açılışta)
    localStorage.removeItem('sampleUsers');
    console.log('✅ Demo kullanıcılar temizlendi');
    
    // Kullanıcı girişi kontrolü
    const currentUser = checkUserSession();
    if (!currentUser) {
        return;
    }

    // Kullanıcı adını göster
    document.getElementById('userName').textContent = `Hoş geldin, ${currentUser.firstName}!`;

    // Kullanıcı menüsünü kur
    setupUserMenu();
    
    // Sosyal verileri yükle
    loadSocialData();

    // Event listeners
    initializeEventListeners();
});

// Performans optimizasyonu için cache
const socialCache = {
    users: new Map(),
    friends: new Map(),
    activities: [],
    lastUpdate: null
};

// Debounce fonksiyonu - arama performansı için
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Hata yönetimi fonksiyonu
function handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    showNotification(`Bir hata oluştu: ${context}`, 'error');
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Stil ekle
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 20px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'error' ? '#e74c3c' : 
                        type === 'success' ? '#2ecc71' : '#3498db'
    });
    
    document.body.appendChild(notification);
    
    // Animasyon
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Otomatik kaldır
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Örnek kullanıcılar ve sosyal veriler - Optimized
function initializeSampleData() {
    try {
        // Cache kontrolü
        if (socialCache.lastUpdate && (Date.now() - socialCache.lastUpdate) < 300000) { // 5 dakika cache
            return;
        }
        
        // Örnek kullanıcılar oluştur
        let sampleUsers = JSON.parse(localStorage.getItem('sampleUsers'));
        if (!sampleUsers) {
        sampleUsers = [
            {
                id: 1,
                firstName: 'Ahmet',
                lastName: 'Yılmaz',
                email: 'ahmet@example.com',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                bio: 'Rock müzik tutkunu 🎸',
                location: 'İstanbul',
                favoriteGenres: ['Rock', 'Blues', 'Metal'],
                isOnline: true
            },
            {
                id: 2,
                firstName: 'Elif',
                lastName: 'Kaya',
                email: 'elif@example.com',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3cb?w=150&h=150&fit=crop&crop=face',
                bio: 'Klasik ve caz severim 🎵',
                location: 'Ankara',
                favoriteGenres: ['Klasik', 'Caz', 'Blues'],
                isOnline: false
            },
            {
                id: 3,
                firstName: 'Mehmet',
                lastName: 'Demir',
                email: 'mehmet@example.com',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                bio: 'Electronic müzik prodüktörü 🎧',
                location: 'İzmir',
                favoriteGenres: ['Electronic', 'House', 'Techno'],
                isOnline: true
            },
            {
                id: 4,
                firstName: 'Zeynep',
                lastName: 'Çelik',
                email: 'zeynep@example.com',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                bio: 'Pop ve indie rock hayranı 🌟',
                location: 'Bursa',
                favoriteGenres: ['Pop', 'Indie', 'Alternative'],
                isOnline: false
            },
            {
                id: 5,
                firstName: 'Can',
                lastName: 'Özkan',
                email: 'can@example.com',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                bio: 'Hip-hop ve R&B tutkunu 🎤',
                location: 'İstanbul',
                favoriteGenres: ['Hip-Hop', 'R&B', 'Rap'],
                isOnline: true
            }
        ];
        localStorage.setItem('sampleUsers', JSON.stringify(sampleUsers));
    }

    // Örnek arkadaş istekleri
    let friendRequests = JSON.parse(localStorage.getItem('friendRequests'));
    if (!friendRequests) {
        friendRequests = [
            { from: 1, to: getCurrentUserId(), date: new Date().toISOString(), status: 'pending' },
            { from: 3, to: getCurrentUserId(), date: new Date().toISOString(), status: 'pending' }
        ];
        localStorage.setItem('friendRequests', JSON.stringify(friendRequests));
    }

    // Örnek arkadaşlık ilişkileri
    let friendships = JSON.parse(localStorage.getItem('friendships'));
    if (!friendships) {
        friendships = [
            { user1: getCurrentUserId(), user2: 2, date: new Date().toISOString() },
            { user1: getCurrentUserId(), user2: 4, date: new Date().toISOString() }
        ];
        localStorage.setItem('friendships', JSON.stringify(friendships));
    }

    // Örnek müzik paylaşımları
    let sharedMusic = JSON.parse(localStorage.getItem('sharedMusic'));
    if (!sharedMusic) {
        sharedMusic = [
            {
                id: 1,
                from: 2,
                to: [getCurrentUserId()],
                type: 'track',
                content: { id: 1, name: 'Bohemian Rhapsody', artist: 'Queen' },
                message: 'Bu şarkıyı çok seviyorum, senin de beğeneceğini düşündüm!',
                date: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
                isRead: false
            },
            {
                id: 2,
                from: 4,
                to: [getCurrentUserId()],
                type: 'playlist',
                content: { id: 1, name: 'Favorilerim', trackCount: 15 },
                message: 'Yeni çalma listemi kontrol et!',
                date: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
                isRead: true
            }
        ];
        localStorage.setItem('sharedMusic', JSON.stringify(sharedMusic));
    }
    
    // Cache güncelle
    socialCache.lastUpdate = Date.now();
    
} catch (error) {
    handleError(error, 'initializeSampleData');
}
}

// Mevcut kullanıcının ID'sini al
function getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser.email.hashCode(); // Email'i hash'leyerek unique ID oluştur
}

// String hash fonksiyonu
String.prototype.hashCode = function() {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

// Event listeners'ı başlat - Event delegation ile optimize edildi
function initializeEventListeners() {
    // Event delegation - Ana container'a tek listener
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.tab-btn, .view-btn, .friend-action-btn, .accept-btn, .decline-btn');
        
        if (!target) return;
        
        // Sekme navigasyonu
        if (target.classList.contains('tab-btn')) {
            const tabName = target.getAttribute('data-tab');
            switchTab(tabName);
        }
        
        // Görünüm değiştirme
        else if (target.classList.contains('view-btn')) {
            const viewType = target.getAttribute('data-view');
            switchView(viewType);
        }
        
        // Arkadaş işlemleri
        else if (target.classList.contains('friend-action-btn')) {
            handleFriendAction(target);
        }
        
        // İstek kabul/reddetme
        else if (target.classList.contains('accept-btn') || target.classList.contains('decline-btn')) {
            handleRequestAction(target);
        }
    });

    // Paylaşım filtreleri
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterSharedContent(filter);
        });
    });

    // Keşfet filtreleri
    document.getElementById('discoverFilter').addEventListener('change', function() {
        loadDiscoverUsers(this.value);
    });

    // Arkadaş arama - Debounced for performance
    const debouncedSearch = debounce((query) => {
        searchFriends(query);
    }, 300);
    
    document.getElementById('search-input').addEventListener('input', function() {
        debouncedSearch(this.value);
    });

    // Modal kapatma
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Paylaşım sekmeleri
    document.querySelectorAll('.share-tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchShareTab(tabName);
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

    // Logout
    document.addEventListener('click', function(e) {
        if (e.target.matches('#logoutLink, #logoutLink *')) {
            logout();
        }
    });
}

// Sosyal verileri yükle
function loadSocialData() {
    loadFriends();
    loadFriendRequests();
    loadDiscoverUsers();
    loadActivityFeed();
    loadSharedContent();
    updateSocialStats();
}

// Arkadaşları yükle - Optimized with caching
function loadFriends() {
    try {
        const currentUserId = getCurrentUserId();
        
        // Cache kontrolü
        if (socialCache.friends.has(currentUserId)) {
            const cachedFriends = socialCache.friends.get(currentUserId);
            displayFriends(cachedFriends);
            return;
        }
        
        const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
        const sampleUsers = JSON.parse(localStorage.getItem('sampleUsers')) || [];

        // Performance optimization: Map kullanarak O(1) lookup
        const userMap = new Map(sampleUsers.map(user => [user.id, user]));
        
        const friends = friendships
            .filter(friendship => friendship.user1 === currentUserId || friendship.user2 === currentUserId)
            .map(friendship => {
                const friendId = friendship.user1 === currentUserId ? friendship.user2 : friendship.user1;
                return userMap.get(friendId);
            })
            .filter(Boolean); // undefined değerleri filtrele

        // Cache'e kaydet
        socialCache.friends.set(currentUserId, friends);
        
        displayFriends(friends);
    } catch (error) {
        handleError(error, 'loadFriends');
    }
}

// Arkadaşları göster
function displayFriends(friends) {
    const friendsList = document.getElementById('friendsList');
    
    if (friends.length === 0) {
        friendsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>Henüz arkadaşın yok</h3>
                <p>Yeni arkadaşlar bulmak için "Arkadaş Bul" butonunu kullan</p>
                <button class="btn primary" onclick="findFriends()">
                    <i class="fas fa-user-plus"></i>
                    Arkadaş Bul
                </button>
            </div>
        `;
        return;
    }

    friendsList.innerHTML = friends.map(friend => `
        <div class="friend-card">
            <div class="friend-avatar">
                <img src="${friend.avatar}" alt="${friend.firstName}">
                <div class="online-status ${friend.isOnline ? 'online' : 'offline'}"></div>
            </div>
            <div class="friend-info">
                <h4>${friend.firstName} ${friend.lastName}</h4>
                <p class="friend-bio">${friend.bio}</p>
                <div class="friend-genres">
                    ${friend.favoriteGenres.slice(0, 2).map(genre => `
                        <span class="genre-tag">${genre}</span>
                    `).join('')}
                </div>
            </div>
            <div class="friend-actions">
                <button class="friend-action-btn" onclick="shareWithFriend(${friend.id})" title="Müzik Paylaş">
                    <i class="fas fa-share"></i>
                </button>
                <button class="friend-action-btn" onclick="viewFriendProfile(${friend.id})" title="Profili Görüntüle">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="friend-action-btn danger" onclick="removeFriend(${friend.id})" title="Arkadaşlığı Sonlandır">
                    <i class="fas fa-user-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Arkadaş isteklerini yükle
function loadFriendRequests() {
    const friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
    const sampleUsers = JSON.parse(localStorage.getItem('sampleUsers')) || [];
    const currentUserId = getCurrentUserId();

    const pendingRequests = friendRequests
        .filter(request => request.to === currentUserId && request.status === 'pending')
        .map(request => {
            const fromUser = sampleUsers.find(user => user.id === request.from);
            return { ...request, fromUser };
        })
        .filter(request => request.fromUser !== undefined);

    displayFriendRequests(pendingRequests);
}

// Arkadaş isteklerini göster
function displayFriendRequests(requests) {
    const requestsList = document.getElementById('friendRequestsList');
    const requestsSection = document.getElementById('friendRequestsSection');

    if (requests.length === 0) {
        requestsSection.style.display = 'none';
        return;
    }

    requestsSection.style.display = 'block';
    requestsList.innerHTML = requests.map(request => `
        <div class="request-card">
            <div class="request-avatar">
                <img src="${request.fromUser.avatar}" alt="${request.fromUser.firstName}">
            </div>
            <div class="request-info">
                <h4>${request.fromUser.firstName} ${request.fromUser.lastName}</h4>
                <p>${request.fromUser.bio}</p>
                <span class="request-date">${formatDate(request.date)}</span>
            </div>
            <div class="request-actions">
                <button class="btn primary small" onclick="acceptFriendRequest(${request.from})">
                    <i class="fas fa-check"></i>
                    Kabul Et
                </button>
                <button class="btn secondary small" onclick="rejectFriendRequest(${request.from})">
                    <i class="fas fa-times"></i>
                    Reddet
                </button>
            </div>
        </div>
    `).join('');
}

// Keşfedilebilir kullanıcıları yükle - GERÇEK KULLANICILAR
function loadDiscoverUsers(filter = 'all') {
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
    const friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
    const currentUserId = getCurrentUserId();

    // Mevcut arkadaşların ID'lerini al
    const friendIds = friendships
        .filter(friendship => friendship.user1 === currentUserId || friendship.user2 === currentUserId)
        .map(friendship => friendship.user1 === currentUserId ? friendship.user2 : friendship.user1);

    // Bekleyen isteklerin ID'lerini al
    const pendingRequestIds = friendRequests
        .filter(req => req.from === currentUserId || req.to === currentUserId)
        .map(req => req.from === currentUserId ? req.to : req.from);

    // Arkadaş olmayan ve istek gönderilmemiş gerçek kullanıcıları filtrele
    let discoverUsers = allUsers.filter(user => 
        user.id !== currentUserId && 
        !friendIds.includes(user.id) &&
        !pendingRequestIds.includes(user.id)
    );

    // Filtreye göre düzenle
    switch(filter) {
        case 'nearby':
            // Yakındaki kullanıcılar (location varsa)
            discoverUsers = discoverUsers.filter(user => user.location);
            break;
        case 'interests':
            // Ortak müzik zevkine sahip kullanıcılar
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const myFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const myGenres = [...new Set(myFavorites.map(f => f.genre).filter(Boolean))];
            
            // Favori türleri benzer olanları öne çıkar
            discoverUsers = discoverUsers.filter(user => {
                const userFavorites = JSON.parse(localStorage.getItem('favorites_' + user.id)) || [];
                const userGenres = [...new Set(userFavorites.map(f => f.genre).filter(Boolean))];
                return userGenres.some(genre => myGenres.includes(genre));
            });
            break;
        case 'suggested':
            // En son kayıt olanlar
            discoverUsers = discoverUsers.slice(0, 5);
            break;
    }

    displayDiscoverUsers(discoverUsers);
}

// Keşfedilebilir kullanıcıları göster - GERÇEK KULLANICILAR
function displayDiscoverUsers(users) {
    const discoverList = document.getElementById('discoverList');
    
    if (users.length === 0) {
        discoverList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>Yeni kullanıcı yok</h3>
                <p>Henüz keşfedebileceğin kullanıcı bulunmuyor</p>
            </div>
        `;
        return;
    }

    discoverList.innerHTML = users.map(user => {
        const avatar = user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.firstName + ' ' + (user.lastName || ''));
        const bio = user.bio || 'Müzik sevdalısı 🎵';
        const location = user.location || 'Türkiye';
        
        // Kullanıcının favori türlerini al
        const userFavorites = JSON.parse(localStorage.getItem('favorites_' + user.id)) || [];
        const genres = [...new Set(userFavorites.map(f => f.genre).filter(Boolean))].slice(0, 3);
        
        return `
            <div class="discover-card">
                <div class="discover-avatar">
                    <img src="${avatar}" alt="${user.firstName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName)}'">
                </div>
                <div class="discover-info">
                    <h4>${user.firstName} ${user.lastName || ''}</h4>
                    <p class="discover-bio">${bio}</p>
                    <p class="discover-location"><i class="fas fa-map-marker-alt"></i> ${location}</p>
                    ${genres.length > 0 ? `
                        <div class="discover-genres">
                            ${genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="discover-actions">
                    <button class="btn primary" onclick="sendFriendRequest(${user.id})">
                        <i class="fas fa-user-plus"></i>
                        Arkadaş Ekle
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Aktivite beslemesini yükle - Optimized with lazy loading
function loadActivityFeed() {
    try {
        // Cache kontrolü
        if (socialCache.activities.length > 0 && 
            socialCache.lastUpdate && 
            (Date.now() - socialCache.lastUpdate) < 60000) { // 1 dakika cache
            displayActivityFeed(socialCache.activities);
            return;
        }
        
        // Gerçek aktivite verileri - arkadaşların ve paylaşılan müziklerin aktiviteleri
        const activities = [];
        
        // Arkadaşların paylaşımlarını al
        const sharedMusic = JSON.parse(localStorage.getItem('sharedMusic')) || [];
        const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
        const currentUserId = getCurrentUserId();
        
        // Arkadaş ID'lerini al
        const friendIds = friendships
            .filter(f => f.user1 === currentUserId || f.user2 === currentUserId)
            .map(f => f.user1 === currentUserId ? f.user2 : f.user1);
        
        // Arkadaşların paylaşımlarını aktiviteye çevir
        sharedMusic.forEach(share => {
            if (friendIds.includes(share.from)) {
                // Paylaşan kullanıcının bilgilerini al
                const shareFrom = getUserById(share.from);
                const shareTo = getUserById(share.to);
                
                if (shareFrom && shareTo && share.to === currentUserId) {
                    const timeAgo = getTimeAgo(share.timestamp);
                    activities.push({
                        user: shareFrom.firstName + ' ' + shareFrom.lastName,
                        avatar: shareFrom.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(shareFrom.firstName),
                        action: share.type === 'playlist' ? 'çalma listesi paylaştı' : 'şarkı paylaştı',
                        content: share.title || 'Müzik',
                        time: timeAgo,
                        type: 'share',
                        timestamp: share.timestamp
                    });
                }
            }
        });
        
        // Kendi beğenilerini aktiviteye ekle
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.slice(0, 5).forEach(fav => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && fav.addedAt) {
                const timeAgo = getTimeAgo(fav.addedAt);
                activities.push({
                    user: 'Sen',
                    avatar: currentUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.firstName),
                    action: 'şarkı beğendin',
                    content: fav.title + ' - ' + fav.artist,
                    time: timeAgo,
                    type: 'like',
                    timestamp: fav.addedAt
                });
            }
        });
        
        // Kendi çalma listelerini aktiviteye ekle
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        playlists.slice(0, 3).forEach(playlist => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && playlist.createdAt) {
                const timeAgo = getTimeAgo(playlist.createdAt);
                activities.push({
                    user: 'Sen',
                    avatar: currentUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.firstName),
                    action: 'çalma listesi oluşturdun',
                    content: playlist.name,
                    time: timeAgo,
                    type: 'playlist',
                    timestamp: playlist.createdAt
                });
            }
        });
        
        // Timestamp'e göre sırala (en yeni en üstte)
        activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Cache güncelle
    socialCache.activities = activities;
    socialCache.lastUpdate = Date.now();
    
    displayActivityFeed(activities);
} catch (error) {
    handleError(error, 'loadActivityFeed');
}
}

// Aktivite beslemesini göster - Optimized with DocumentFragment
function displayActivityFeed(activities) {
    try {
        const activityFeed = document.getElementById('activityFeed');
        
        // Performance: DocumentFragment kullan
        const fragment = document.createDocumentFragment();
        
        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            
            // XSS koruması için textContent kullan
            activityElement.innerHTML = `
                <div class="activity-avatar">
                    <img src="${escapeHtml(activity.avatar)}" alt="${escapeHtml(activity.user)}" loading="lazy">
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${escapeHtml(activity.user)}</strong> ${escapeHtml(activity.action)}
                        <span class="activity-target">${escapeHtml(activity.content)}</span>
                    </div>
                    <div class="activity-time">${escapeHtml(activity.time)}</div>
                </div>
                <div class="activity-icon">
                    <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                </div>
            `;
            
            fragment.appendChild(activityElement);
        });
        
        // Tek seferde DOM'a ekle
        activityFeed.innerHTML = '';
        activityFeed.appendChild(fragment);
        
    } catch (error) {
        handleError(error, 'displayActivityFeed');
    }
}

// XSS koruması için HTML escape
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Paylaşılan içeriği yükle
function loadSharedContent() {
    const sharedMusic = JSON.parse(localStorage.getItem('sharedMusic')) || [];
    const currentUserId = getCurrentUserId();

    const myShares = sharedMusic.filter(share => 
        share.to.includes(currentUserId) || share.from === currentUserId
    );

    displaySharedContent(myShares);
}

// Paylaşılan içeriği göster
function displaySharedContent(shares) {
    const sharedList = document.getElementById('sharedList');
    const sampleUsers = JSON.parse(localStorage.getItem('sampleUsers')) || [];
    
    if (shares.length === 0) {
        sharedList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-share"></i>
                <h3>Henüz paylaşım yok</h3>
                <p>Arkadaşlarınla müzik paylaşmaya başla</p>
            </div>
        `;
        return;
    }

    sharedList.innerHTML = shares.map(share => {
        const fromUser = sampleUsers.find(user => user.id === share.from) || 
                        { firstName: 'Bilinmeyen', lastName: 'Kullanıcı', avatar: '' };
        
        return `
            <div class="shared-item ${!share.isRead ? 'unread' : ''}">
                <div class="shared-header">
                    <div class="shared-user">
                        <img src="${fromUser.avatar}" alt="${fromUser.firstName}">
                        <div>
                            <strong>${fromUser.firstName} ${fromUser.lastName}</strong>
                            <span class="shared-time">${formatDate(share.date)}</span>
                        </div>
                    </div>
                    <div class="shared-type">
                        <i class="fas fa-${share.type === 'track' ? 'music' : 'list'}"></i>
                    </div>
                </div>
                <div class="shared-content">
                    <h4>${share.content.name}</h4>
                    ${share.type === 'track' ? 
                        `<p>Sanatçı: ${share.content.artist}</p>` : 
                        `<p>${share.content.trackCount} şarkı</p>`
                    }
                    ${share.message ? `<p class="shared-message">"${share.message}"</p>` : ''}
                </div>
                <div class="shared-actions">
                    <button class="btn primary small" onclick="playSharedContent(${share.id})">
                        <i class="fas fa-play"></i>
                        Dinle
                    </button>
                    <button class="btn secondary small" onclick="likeSharedContent(${share.id})">
                        <i class="fas fa-heart"></i>
                        Beğen
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Sosyal istatistikleri güncelle
function updateSocialStats() {
    const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
    const friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
    const sharedMusic = JSON.parse(localStorage.getItem('sharedMusic')) || [];
    const currentUserId = getCurrentUserId();

    const friendsCount = friendships.filter(friendship => 
        friendship.user1 === currentUserId || friendship.user2 === currentUserId
    ).length;

    const pendingRequestsCount = friendRequests.filter(request => 
        request.to === currentUserId && request.status === 'pending'
    ).length;

    const sharedItemsCount = sharedMusic.filter(share => 
        share.from === currentUserId
    ).length;

    document.getElementById('friendsCount').textContent = friendsCount;
    document.getElementById('pendingRequestsCount').textContent = pendingRequestsCount;
    document.getElementById('sharedItemsCount').textContent = sharedItemsCount;
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

    // Sekme değiştiğinde ilgili verileri yenile
    switch(tabName) {
        case 'friends':
            loadFriends();
            loadFriendRequests();
            break;
        case 'discover':
            loadDiscoverUsers();
            break;
        case 'activity':
            loadActivityFeed();
            break;
        case 'shared':
            loadSharedContent();
            break;
    }
}

// Görünüm değiştir
function switchView(viewType) {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
    
    const friendsList = document.getElementById('friendsList');
    friendsList.className = viewType === 'list' ? 'friends-list' : 'friends-grid';
}

// Paylaşım içeriği filtrele
function filterSharedContent(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Filtreleeme mantığı burada implement edilecek
    loadSharedContent(); // Şimdilik tüm içeriği yükle
}

// Paylaşım sekmesi değiştir
function switchShareTab(tabName) {
    document.querySelectorAll('.share-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.share-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`share${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
}

// Yardımcı fonksiyonlar
function getActivityIcon(type) {
    switch(type) {
        case 'like': return 'heart';
        case 'playlist': return 'list';
        case 'share': return 'share';
        default: return 'music';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString('tr-TR');
}

// Sosyal aksiyonlar
function findFriends() {
    const modal = document.getElementById('add-friend-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function sendFriendRequest(userId) {
    const friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
    const currentUserId = getCurrentUserId();
    
    // Zaten istek gönderilmiş mi kontrol et
    const existingRequest = friendRequests.find(request => 
        request.from === currentUserId && request.to === userId
    );
    
    if (existingRequest) {
        showNotification('Bu kullanıcıya zaten arkadaş isteği gönderdiniz', 'warning');
        return;
    }
    
    // Yeni istek ekle
    friendRequests.push({
        from: currentUserId,
        to: userId,
        date: new Date().toISOString(),
        status: 'pending'
    });
    
    localStorage.setItem('friendRequests', JSON.stringify(friendRequests));
    showNotification('Arkadaş isteği gönderildi', 'success');
    
    // Keşfet listesini yenile
    loadDiscoverUsers(document.getElementById('discoverFilter').value);
}

function acceptFriendRequest(fromUserId) {
    const friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
    const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
    const currentUserId = getCurrentUserId();
    
    // İsteği kabul et
    const requestIndex = friendRequests.findIndex(request => 
        request.from === fromUserId && request.to === currentUserId
    );
    
    if (requestIndex !== -1) {
        friendRequests[requestIndex].status = 'accepted';
        
        // Arkadaşlık ekle
        friendships.push({
            user1: currentUserId,
            user2: fromUserId,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('friendRequests', JSON.stringify(friendRequests));
        localStorage.setItem('friendships', JSON.stringify(friendships));
        
        showNotification('Arkadaş isteği kabul edildi', 'success');
        
        // Verileri yenile
        loadFriends();
        loadFriendRequests();
        updateSocialStats();
    }
}

function rejectFriendRequest(fromUserId) {
    const friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
    const currentUserId = getCurrentUserId();
    
    // İsteği reddet
    const requestIndex = friendRequests.findIndex(request => 
        request.from === fromUserId && request.to === currentUserId
    );
    
    if (requestIndex !== -1) {
        friendRequests[requestIndex].status = 'rejected';
        localStorage.setItem('friendRequests', JSON.stringify(friendRequests));
        
        showNotification('Arkadaş isteği reddedildi', 'info');
        loadFriendRequests();
        updateSocialStats();
    }
}

function removeFriend(friendId) {
    if (confirm('Bu arkadaşlığı sonlandırmak istediğinizden emin misiniz?')) {
        const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
        const currentUserId = getCurrentUserId();
        
        const updatedFriendships = friendships.filter(friendship => 
            !((friendship.user1 === currentUserId && friendship.user2 === friendId) ||
              (friendship.user1 === friendId && friendship.user2 === currentUserId))
        );
        
        localStorage.setItem('friendships', JSON.stringify(updatedFriendships));
        showNotification('Arkadaşlık sonlandırıldı', 'info');
        
        loadFriends();
        updateSocialStats();
    }
}

function openShareModal() {
    // Çalma listelerini ve şarkıları yükle
    loadShareOptions();
    const modal = document.getElementById('share-music-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function loadShareOptions() {
    // Çalma listelerini yükle
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlistSelect = document.getElementById('playlistSelect');
    
    if (playlists.length > 0) {
        playlistSelect.innerHTML = '<option value="">Çalma listesi seçin...</option>' +
            playlists.map(playlist => `<option value="${playlist.id}">${playlist.name} (${playlist.tracks ? playlist.tracks.length : 0} şarkı)</option>`).join('');
    } else {
        playlistSelect.innerHTML = '<option value="">Henüz çalma listeniz yok</option>';
    }
    
    // Favorilerdeki şarkıları yükle
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const trackSelect = document.getElementById('trackSelect');
    
    if (favorites.length > 0) {
        trackSelect.innerHTML = '<option value="">Şarkı seçin...</option>' +
            favorites.map(trackId => {
                // Track bilgilerini bul (basitleştirilmiş)
                return `<option value="${trackId}">Favori Şarkı #${trackId}</option>`;
            }).join('');
    } else {
        trackSelect.innerHTML = '<option value="">Favorilerinizde şarkı yok</option>';
    }
    
    // Arkadaşları yükle
    loadFriendsForShare();
}

function loadFriendsForShare() {
    const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
    const sampleUsers = JSON.parse(localStorage.getItem('sampleUsers')) || [];
    const currentUserId = getCurrentUserId();

    const friends = friendships
        .filter(friendship => friendship.user1 === currentUserId || friendship.user2 === currentUserId)
        .map(friendship => {
            const friendId = friendship.user1 === currentUserId ? friendship.user2 : friendship.user1;
            return sampleUsers.find(user => user.id === friendId);
        })
        .filter(friend => friend !== undefined);

    const friendsSelect = document.getElementById('friendsSelect');
    friendsSelect.innerHTML = friends.map(friend => `
        <label class="friend-checkbox">
            <input type="checkbox" value="${friend.id}">
            <img src="${friend.avatar}" alt="${friend.firstName}">
            <span>${friend.firstName} ${friend.lastName}</span>
        </label>
    `).join('');
}

function shareMusic() {
    const activeTab = document.querySelector('.share-tab-btn.active').getAttribute('data-tab');
    const selectedFriends = Array.from(document.querySelectorAll('#friendsSelect input:checked')).map(cb => parseInt(cb.value));
    const message = document.getElementById('shareMessage').value;
    
    if (selectedFriends.length === 0) {
        showNotification('En az bir arkadaş seçmelisiniz', 'warning');
        return;
    }
    
    let content;
    if (activeTab === 'track') {
        const trackId = document.getElementById('trackSelect').value;
        if (!trackId) {
            showNotification('Bir şarkı seçmelisiniz', 'warning');
            return;
        }
        content = { id: trackId, name: 'Seçilen Şarkı', type: 'track' };
    } else {
        const playlistId = document.getElementById('playlistSelect').value;
        if (!playlistId) {
            showNotification('Bir çalma listesi seçmelisiniz', 'warning');
            return;
        }
        content = { id: playlistId, name: 'Seçilen Çalma Listesi', type: 'playlist' };
    }
    
    const sharedMusic = JSON.parse(localStorage.getItem('sharedMusic')) || [];
    const newShare = {
        id: Date.now(),
        from: getCurrentUserId(),
        to: selectedFriends,
        type: activeTab,
        content: content,
        message: message,
        date: new Date().toISOString(),
        isRead: false
    };
    
    sharedMusic.push(newShare);
    localStorage.setItem('sharedMusic', JSON.stringify(sharedMusic));
    
    showNotification('Müzik başarıyla paylaşıldı', 'success');
    closeModal('share-music-modal');
    updateSocialStats();
}

// Modal işlemleri
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Kullanıcı arama - GERÇEK KULLANICILAR
function searchUsers() {
    const searchQuery = document.getElementById('friend-search').value.trim().toLowerCase();
    
    if (!searchQuery) {
        showNotification('Lütfen bir arama terimi girin', 'warning');
        return;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
    const friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
    const currentUserId = getCurrentUserId();
    
    // Zaten arkadaş olanları filtrele
    const friendIds = friendships
        .filter(f => f.user1 === currentUserId || f.user2 === currentUserId)
        .map(f => f.user1 === currentUserId ? f.user2 : f.user1);
    
    // Bekleyen istekleri filtrele
    const pendingRequestIds = friendRequests
        .filter(r => r.from === currentUserId && r.status === 'pending')
        .map(r => r.to);
    
    // GERÇEK kullanıcılar arasında arama yap
    const searchResults = allUsers.filter(user => 
        user.id !== currentUserId &&
        !friendIds.includes(user.id) &&
        (user.firstName.toLowerCase().includes(searchQuery) ||
         (user.lastName && user.lastName.toLowerCase().includes(searchQuery)) ||
         user.email.toLowerCase().includes(searchQuery))
    );
    
    displaySearchResults(searchResults, pendingRequestIds);
}

// Arama sonuçlarını göster - GERÇEK KULLANICILAR
function displaySearchResults(results, pendingRequestIds) {
    const searchResultsDiv = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResultsDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <p>Kullanıcı bulunamadı</p>
                <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">Farklı bir email veya isim deneyin</p>
            </div>
        `;
        return;
    }
    
    searchResultsDiv.innerHTML = results.map(user => {
        const isPending = pendingRequestIds.includes(user.id);
        const avatar = user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.firstName + ' ' + (user.lastName || ''));
        const bio = user.bio || 'Müzik sevdalısı';
        
        // Kullanıcının favori türlerini al
        const userFavorites = JSON.parse(localStorage.getItem('favorites_' + user.id)) || [];
        const genres = [...new Set(userFavorites.map(f => f.genre).filter(Boolean))].slice(0, 3);
        
        return `
            <div class="search-result-card">
                <div class="search-result-avatar">
                    <img src="${avatar}" alt="${user.firstName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName)}'">
                </div>
                <div class="search-result-info">
                    <h4>${user.firstName} ${user.lastName || ''}</h4>
                    <p>${user.email}</p>
                    <p class="user-bio">${bio}</p>
                    ${genres.length > 0 ? `
                        <div class="user-genres">
                            ${genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="search-result-actions">
                    ${isPending ? 
                        `<button class="btn secondary small" disabled>
                            <i class="fas fa-clock"></i>
                            İstek Gönderildi
                        </button>` :
                        `<button class="btn primary small" onclick="sendFriendRequest(${user.id})">
                            <i class="fas fa-user-plus"></i>
                            Arkadaş Ekle
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Diğer fonksiyonlar
function searchFriends(query) {
    // Arkadaş arama mantığı
    console.log('Arkadaş aranıyor:', query);
}

function shareWithFriend(friendId) {
    // Doğrudan belirli arkadaşla paylaşım
    openShareModal();
    setTimeout(() => {
        const checkbox = document.querySelector(`#friendsSelect input[value="${friendId}"]`);
        if (checkbox) checkbox.checked = true;
    }, 100);
}

function viewFriendProfile(friendId) {
    showNotification('Profil görüntüleme özelliği yakında geliyor', 'info');
}

function playSharedContent(shareId) {
    showNotification('Paylaşılan içerik çalınıyor...', 'info');
}

function likeSharedContent(shareId) {
    showNotification('Paylaşım beğenildi', 'success');
}

// Bildirim göster
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

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

    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

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

// Arkadaş işlemleri handler'ı - Performance optimized
function handleFriendAction(button) {
    try {
        const action = button.classList.contains('message') ? 'message' :
                      button.classList.contains('video') ? 'video' : 'remove';
        
        const friendCard = button.closest('.friend-card, .discover-card');
        const friendName = friendCard.querySelector('h4').textContent;
        
        switch (action) {
            case 'message':
                showNotification(`${friendName} ile mesajlaşma açılıyor...`, 'info');
                // Gerçek uygulamada mesaj modalı açılacak
                break;
                
            case 'video':
                showNotification(`${friendName} ile video call başlatılıyor...`, 'info');
                // Gerçek uygulamada video call başlatılacak
                break;
                
            case 'remove':
                if (confirm(`${friendName} isimli kişiyi arkadaşlarından çıkarmak istediğinden emin misin?`)) {
                    // Arkadaşlık silme işlemi
                    showNotification(`${friendName} arkadaşlarından çıkarıldı`, 'success');
                    // Cache'i temizle
                    socialCache.friends.clear();
                    loadFriends();
                }
                break;
        }
    } catch (error) {
        handleError(error, 'handleFriendAction');
    }
}

// İstek işlemleri handler'ı
function handleRequestAction(button) {
    try {
        const action = button.classList.contains('accept-btn') ? 'accept' : 'decline';
        const requestItem = button.closest('.request-item');
        const requesterName = requestItem.querySelector('h4').textContent;
        
        if (action === 'accept') {
            showNotification(`${requesterName}'in arkadaşlık isteği kabul edildi!`, 'success');
        } else {
            showNotification(`${requesterName}'in arkadaşlık isteği reddedildi`, 'info');
        }
        
        // Cache'leri temizle
        socialCache.friends.clear();
        
        // UI'dan kaldır
        requestItem.remove();
        
        // İstatistikleri güncelle
        updateSocialStats();
        
    } catch (error) {
        handleError(error, 'handleRequestAction');
    }
}

// Sosyal istatistiklerini güncelle
function updateSocialStats() {
    try {
        const friendships = JSON.parse(localStorage.getItem('friendships')) || [];
        const friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
        const currentUserId = getCurrentUserId();
        
        const friendsCount = friendships.filter(f => 
            f.user1 === currentUserId || f.user2 === currentUserId
        ).length;
        
        const pendingRequestsCount = friendRequests.filter(r => 
            r.to === currentUserId && r.status === 'pending'
        ).length;
        
        // UI güncelle
        const friendsCountEl = document.getElementById('friendsCount');
        const pendingCountEl = document.getElementById('pendingRequestsCount');
        
        if (friendsCountEl) friendsCountEl.textContent = friendsCount;
        if (pendingCountEl) pendingCountEl.textContent = pendingRequestsCount;
        
    } catch (error) {
        handleError(error, 'updateSocialStats');
    }
}

// Kullanıcı ID'sine göre kullanıcı bilgilerini getir
function getUserById(userId) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.id === userId) {
            return currentUser;
        }
        
        // Kayıtlı tüm kullanıcıları kontrol et
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        return allUsers.find(u => u.id === userId);
    } catch (error) {
        console.error('getUserById error:', error);
        return null;
    }
}

// Zaman farkını hesapla (örn: "2 saat önce")
function getTimeAgo(timestamp) {
    if (!timestamp) return 'Bilinmeyen zaman';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return 'Az önce';
    if (minutes < 60) return minutes + ' dakika önce';
    if (hours < 24) return hours + ' saat önce';
    if (days < 7) return days + ' gün önce';
    if (weeks < 4) return weeks + ' hafta önce';
    if (months < 12) return months + ' ay önce';
    return years + ' yıl önce';
}

// Logout fonksiyonu
function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('lastLoginTime');
        
        window.location.href = 'login.html';
    }
}

// Kullanıcı menü setup fonksiyonu
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

// DEMO KULLANICI YOK - Gerçek kullanıcılar kullanılacak