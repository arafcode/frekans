// Playlists.js - Çalma Listeleri sayfası fonksiyonları

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

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - Playlists sayfası yükleniyor...');
    
    // Kullanıcı girişi kontrolü
    const currentUser = checkUserSession();
    console.log('currentUser:', currentUser);
    
    // currentUser artık her zaman bir değer döndürüyor, false kontrolü kaldırıldı
    
    // Kullanıcı adını göster
    const userNameEl = document.getElementById('userName');
    if (userNameEl && currentUser.firstName) {
        userNameEl.textContent = `Hoş geldin, ${currentUser.firstName}!`;
    }

    // Kullanıcı menüsü script.js tarafından kurulacak (setupUserMenu kaldırıldı)
    
    // Çalma listelerini yükle
    console.log('loadPlaylists çağrılacak...');
    loadPlaylists();

    // Event listeners
    initializeEventListeners();

    // URL hash kontrolü
    if (window.location.hash === '#create') {
        openCreatePlaylistModal();
    }
    
    console.log('DOMContentLoaded tamamlandı');
});

// Boş sample playlists fonksiyonu (geriye dönük uyumluluk için)
function getSamplePlaylists() {
    console.log('⚠️ getSamplePlaylists() çağrıldı - boş array döndürülüyor');
    return [];
}

// Çalma listelerini yükle
function loadPlaylists() {
    console.log('=== loadPlaylists BAŞLADI ===');
    
    try {
        let playlists = localStorage.getItem('playlists');
        console.log('localStorage raw data:', playlists);
        
        if (playlists) {
            playlists = JSON.parse(playlists);
            console.log('Parse edilmiş playlists:', playlists);
        } else {
            // localStorage boşsa boş array kullan, demo oluşturma!
            console.log('📝 localStorage boş, hiç playlist yok');
            playlists = [];
        }

        console.log('displayPlaylists çağrılıyor, liste sayısı:', playlists.length);
        displayPlaylists(playlists);
        
        console.log('updateStats çağrılıyor');
        updateStats(playlists);
        
        console.log('=== loadPlaylists TAMAMLANDI ===');
    } catch (error) {
        console.error('=== loadPlaylists HATA ===', error);
        alert('Çalma listeleri yüklenirken hata oluştu: ' + error.message);
    }
}

// Çalma listelerini göster
function displayPlaylists(playlists) {
    const playlistsGrid = document.getElementById('playlists-grid');
    const emptyState = document.getElementById('empty-playlists');
    
    if (!playlistsGrid) return;

    // Array kontrolü
    if (!Array.isArray(playlists)) {
        playlists = [];
    }

    playlistsGrid.innerHTML = '';

    // Eğer liste yoksa boş durum göster
    if (playlists.length === 0) {
        if (playlistsGrid) playlistsGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    // Liste varsa grid'i göster
    if (playlistsGrid) playlistsGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    playlists.forEach(playlist => {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';
        playlistCard.innerHTML = `
            <div class="playlist-image">
                <img src="${playlist.image}" alt="${playlist.name}">
                <div class="playlist-overlay">
                    <button class="play-playlist-btn" onclick="playPlaylist(${playlist.id})">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
            <div class="playlist-info">
                <h3>${playlist.name}</h3>
                <p class="playlist-description">${playlist.description}</p>
                <div class="playlist-stats">
                    <span><i class="fas fa-music"></i> ${playlist.trackCount} şarkı</span>
                    <span><i class="fas fa-clock"></i> ${playlist.duration}</span>
                </div>
                <div class="playlist-actions">
                    <button class="playlist-action-btn" onclick="editPlaylist(${playlist.id})" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="playlist-action-btn" onclick="sharePlaylist(${playlist.id})" title="Paylaş">
                        <i class="fas fa-share"></i>
                    </button>
                    ${!playlist.isDefault ? `
                        <button class="playlist-action-btn danger" onclick="event.stopPropagation(); showPlaylistContextMenu(event, '${playlist.id}')" title="Seçenekler">⋯</button>
                    ` : ''}
                </div>
            </div>
        `;

        // Çalma listesine tıklama eventi
        playlistCard.addEventListener('click', function(e) {
            if (!e.target.closest('.playlist-actions') && !e.target.closest('.playlist-overlay')) {
                openPlaylistDetail(playlist.id);
            }
        });

        playlistsGrid.appendChild(playlistCard);
    });
}

// İstatistikleri güncelle
function updateStats(playlists) {
    // Array kontrolü
    if (!Array.isArray(playlists)) {
        playlists = [];
    }
    
    const totalPlaylists = playlists.length;
    const totalTracks = playlists.reduce((sum, playlist) => sum + (playlist.trackCount || 0), 0);
    const totalMinutes = playlists.reduce((sum, playlist) => {
        const duration = playlist.duration || '';
        let totalSeconds = 0;
        
        // "2 sa 31 dk" formatı
        if (duration.includes('sa')) {
            const parts = duration.split(' ');
            totalSeconds += parseInt(parts[0] || 0) * 3600; // saat -> saniye
            if (parts[2] && parts[2].includes('dk')) {
                totalSeconds += parseInt(parts[2] || 0) * 60; // dakika -> saniye
            }
        } 
        // "1 dk 30 sn" formatı
        else if (duration.includes('dk')) {
            const parts = duration.split(' ');
            totalSeconds += parseInt(parts[0] || 0) * 60; // dakika -> saniye
            if (parts[2] && parts[2].includes('sn')) {
                totalSeconds += parseInt(parts[2] || 0); // saniye
            }
        }
        // "58 dk" formatı
        else if (duration.includes('dk')) {
            totalSeconds = parseInt(duration || 0) * 60;
        }
        
        return sum + Math.floor(totalSeconds / 60); // saniye -> dakika
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const totalDuration = hours > 0 ? `${hours} sa ${mins} dk` : `${mins} dk`;

    // Stats'ları güncelle
    const totalPlaylistsEl = document.getElementById('total-playlists');
    const totalTracksEl = document.getElementById('total-tracks');
    const totalDurationEl = document.getElementById('total-duration');

    if (totalPlaylistsEl) totalPlaylistsEl.innerHTML = `<i class="fas fa-folder"></i> ${totalPlaylists} Liste`;
    if (totalTracksEl) totalTracksEl.innerHTML = `<i class="fas fa-music"></i> ${totalTracks} Şarkı`;
    if (totalDurationEl) totalDurationEl.innerHTML = `<i class="fas fa-clock"></i> ${totalDuration}`;
}

// Event listeners'ı başlat
function initializeEventListeners() {
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
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Modal kapatma butonları
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Arama
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchPlaylists(this.value);
        });
    }

    // Sıralama
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortPlaylists(this.value);
        });
    }

    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            toggleView(view);
        });
    });

    // Form submit
    const createForm = document.getElementById('create-playlist-form');
    if (createForm) {
        createForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createPlaylist();
        });
    }

    const editForm = document.getElementById('edit-playlist-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updatePlaylist();
        });
    }

    // Logout
    document.addEventListener('click', function(e) {
        if (e.target.matches('#logoutLink, #logoutLink *')) {
            logout();
        }
    });
}

// Yeni çalma listesi oluşturma modalını aç
function openCreatePlaylistModal() {
    showCreatePlaylist();
}

// Modal kapat
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// createPlaylist fonksiyonu aşağıda tanımlı

// Rastgele çalma listesi resmi oluştur
function generatePlaylistImage() {
    const musicImages = [
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1461784180009-21f109c2237a?w=400&h=400&fit=crop"
    ];
    const randomIndex = Math.floor(Math.random() * musicImages.length);
    return musicImages[randomIndex];
}

// Çalma listesini düzenle
function editPlaylist(playlistId) {
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return;

    // Düzenleme modalını hazırla ve aç
    document.getElementById('edit-playlist-name').value = playlist.name;
    document.getElementById('edit-playlist-description').value = playlist.description;
    document.getElementById('edit-playlist-public').checked = playlist.isPublic || false;
    
    // Düzenleme modalını aç
    const modal = document.getElementById('edit-playlist-modal');
    if (modal) {
        modal.classList.add('active');
        modal.dataset.playlistId = playlistId;
    }
}

// Çalma listesini güncelle
function updatePlaylist() {
    const modal = document.getElementById('edit-playlist-modal');
    const playlistId = parseInt(modal.dataset.playlistId);
    
    const name = document.getElementById('edit-playlist-name').value.trim();
    const description = document.getElementById('edit-playlist-description').value.trim();
    const isPublic = document.getElementById('edit-playlist-public').checked;

    if (!name) {
        showNotification('Çalma listesi adı gerekli!', 'error');
        return;
    }

    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex !== -1) {
        playlists[playlistIndex].name = name;
        playlists[playlistIndex].description = description;
        playlists[playlistIndex].isPublic = isPublic;
        
        localStorage.setItem('playlists', JSON.stringify(playlists));
        
        closeModal('edit-playlist-modal');
        loadPlaylists();
        
        showNotification('Çalma listesi güncellendi!', 'success');
    }
}

// Delete çağrıları merkezi modal ile openConfirmDelete üzerinden yönetiliyor
function deletePlaylist(playlistId) {
    // Merkezi delete çağrısı artık doğrudan hemen siler (ellipsis menü kullanılıyor)
    if (typeof deletePlaylistImmediate === 'function') {
        deletePlaylistImmediate(playlistId);
    }
}

// Çalma listesini paylaş
function sharePlaylist(playlistId) {
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return;

    // Basit paylaşım URL'si oluştur
    const shareUrl = `${window.location.origin}/playlist/${playlistId}`;
    
    if (navigator.share) {
        // Web Share API varsa kullan
        navigator.share({
            title: playlist.name,
            text: playlist.description,
            url: shareUrl
        }).then(() => {
            showNotification('Çalma listesi paylaşıldı!', 'success');
        }).catch(() => {
            copyToClipboard(shareUrl);
        });
    } else {
        // Panoya kopyala
        copyToClipboard(shareUrl);
    }
}

// Panoya kopyala
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Bağlantı panoya kopyalandı!', 'success');
        });
    } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Bağlantı panoya kopyalandı!', 'success');
    }
}

// Çalma listesini çal
function playPlaylist(playlistId) {
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return;

    if (playlist.trackCount === 0) {
        showNotification('Bu çalma listesinde şarkı yok!', 'warning');
        return;
    }

    showNotification(`"${playlist.name}" çalma listesi çalınıyor...`, 'info');
    // Burada gerçek çalma fonksiyonu implement edilecek
}

// Çalma listesi detayını aç
function openPlaylistDetail(playlistId) {
    // Çalma listesi detay sayfasına yönlendir veya modal aç
    showNotification('Çalma listesi detayları yakında geliyor!', 'info');
}

// Çalma listelerinde ara
function searchPlaylists(query) {
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    
    if (!query.trim()) {
        displayPlaylists(playlists);
        return;
    }

    const filteredPlaylists = playlists.filter(playlist => 
        playlist.name.toLowerCase().includes(query.toLowerCase()) ||
        playlist.description.toLowerCase().includes(query.toLowerCase())
    );

    displayPlaylists(filteredPlaylists);
}

// Çalma listelerini sırala
function sortPlaylists(sortBy) {
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    
    let sortedPlaylists = [...playlists];

    switch(sortBy) {
        case 'name':
            sortedPlaylists.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'created':
            sortedPlaylists.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            break;
        case 'tracks':
            sortedPlaylists.sort((a, b) => b.trackCount - a.trackCount);
            break;
        case 'duration':
            sortedPlaylists.sort((a, b) => {
                const getDuration = (dur) => {
                    let minutes = 0;
                    if (dur.includes('sa')) {
                        const parts = dur.split(' ');
                        minutes += parseInt(parts[0]) * 60;
                        if (parts[2] && parts[2].includes('dk')) {
                            minutes += parseInt(parts[2]);
                        }
                    } else if (dur.includes('dk')) {
                        minutes = parseInt(dur);
                    }
                    return minutes;
                };
                return getDuration(b.duration) - getDuration(a.duration);
            });
            break;
    }

    displayPlaylists(sortedPlaylists);
}

// Görünüm değiştir
function toggleView(view) {
    const playlistsGrid = document.getElementById('playlists-grid');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    // Aktif buton durumunu güncelle
    viewButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });

    // Grid görünümünü güncelle
    if (playlistsGrid) {
        playlistsGrid.className = view === 'list' ? 'playlists-list' : 'playlists-grid';
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

// showCreatePlaylist fonksiyonu aşağıda tanımlı

// Kullanıcı menü fonksiyonları script.js'den kullanılacak
// setupUserMenu, toggleUserDropdown, closeUserDropdown script.js'de tanımlı

// Çalma listelerini yükle ve görüntüle
function loadPlaylists() {
    try {
        // LocalStorage'dan çalma listelerini al
        const storedPlaylists = localStorage.getItem('userPlaylists');
        let playlists = storedPlaylists ? JSON.parse(storedPlaylists) : getSamplePlaylists();
        
        // Çalma listelerini grid'de göster
        displayPlaylists(playlists);
        
        // Sidebar'daki listeyi güncelle
        updateSidebarPlaylists(playlists);
        
    } catch (error) {
        console.error('Çalma listeleri yüklenemedi:', error);
        displayPlaylists(getSamplePlaylists());
    }
}

// Çalma listelerini görüntüle
function displayPlaylists(playlists) {
    const grid = document.getElementById('playlists-grid');
    const emptyState = document.getElementById('empty-playlists');
    
    if (!playlists || playlists.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    grid.style.display = 'grid';
    
    grid.innerHTML = playlists.map(playlist => `
        <div class="playlist-card" onclick="openPlaylist('${playlist.id}')">
            <div class="playlist-image">
                <img src="${playlist.image}" alt="${playlist.name}" loading="lazy">
                <div class="playlist-overlay">
                    <button class="play-btn" onclick="event.stopPropagation(); playPlaylist('${playlist.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
            <div class="playlist-info">
                <h3>${playlist.name}</h3>
                <p>${playlist.description || 'Açıklama yok'}</p>
                <div class="playlist-stats">
                    <span><i class="fas fa-music"></i> ${playlist.trackCount} şarkı</span>
                    <span><i class="fas fa-clock"></i> ${playlist.duration}</span>
                </div>
            </div>
            <div class="playlist-actions">
                <button class="action-btn" onclick="event.stopPropagation(); editPlaylist('${playlist.id}')" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); sharePlaylist('${playlist.id}')" title="Paylaş">
                    <i class="fas fa-share"></i>
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); showPlaylistMenu(event, '${playlist.id}')" title="Daha fazla">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Sidebar çalma listelerini güncelle
function updateSidebarPlaylists(playlists) {
    const sidebarList = document.getElementById('sidebar-playlist-list');
    if (!sidebarList) return;
    
    // Eğer playlists parametresi gönderilmediyse localStorage'dan al
    if (!playlists) {
        try {
            const stored = localStorage.getItem('playlists');
            playlists = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Playlists yüklenemedi:', error);
            playlists = [];
        }
    }
    
    // Array olduğundan emin ol
    if (!Array.isArray(playlists)) {
        playlists = [];
    }
    
    const createButton = sidebarList.querySelector('li:first-child'); // "Yeni Liste Oluştur" butonunu koru
    
    // Mevcut listeleri temizle (ilk butonu hariç)
    while (sidebarList.children.length > 1) {
        sidebarList.removeChild(sidebarList.lastChild);
    }
    
    // Yeni listeleri ekle
    playlists.forEach(playlist => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" onclick="openPlaylist('${playlist.id}')" title="${playlist.name}">
                <i class="fas fa-list"></i> ${playlist.name}
            </a>
        `;
        sidebarList.appendChild(li);
    });
}

// Yeni çalma listesi oluştur modal'ını göster
function showCreatePlaylist() {
    const modal = document.getElementById('create-playlist-modal');
    if (modal) {
        modal.style.display = 'flex';
        const nameInput = document.getElementById('playlist-name');
        if (nameInput) {
            nameInput.focus();
        }
        // Form'u temizle
        const form = document.getElementById('create-playlist-form');
        if (form) {
            form.reset();
        }
    }
}

// Yeni çalma listesi oluştur modal'ını gizle
function hideCreatePlaylist() {
    const modal = document.getElementById('create-playlist-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Yeni çalma listesi oluştur
function createPlaylist() {
    const nameInput = document.getElementById('playlist-name');
    const descInput = document.getElementById('playlist-description');
    const privacyInput = document.getElementById('playlist-privacy');
    
    if (!nameInput) {
        alert('Form elementi bulunamadı!');
        return;
    }
    
    const name = nameInput.value.trim();
    const description = descInput ? descInput.value.trim() : '';
    const privacy = privacyInput ? privacyInput.value : 'public';
    
    if (!name) {
        alert('Lütfen çalma listesi adını girin!');
        return;
    }
    
    try {
        // Mevcut çalma listelerini al
        let playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
        
        console.log('📝 Yeni playlist oluşturuluyor:', name);
        
        // Yeni çalma listesi oluştur
        const newPlaylist = {
            id: Date.now(), // Benzersiz ID
            name: name,
            description: description || 'Yeni çalma listesi',
            image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
            trackCount: 0,
            duration: '0 dk',
            isDefault: false,
            privacy: privacy,
            createdDate: new Date().toISOString().split('T')[0],
            tracks: []
        };
        
        // Listeye ekle
        playlists.push(newPlaylist);
        
        // LocalStorage'a kaydet
        localStorage.setItem('playlists', JSON.stringify(playlists));
        
        console.log('✅ Playlist oluşturuldu:', newPlaylist);
        
        // UI'ı güncelle
        loadPlaylists();
        hideCreatePlaylist();
        
        // Sidebar'ı güncelle
        if (typeof updateSidebarPlaylists === 'function') {
            updateSidebarPlaylists();
        }
        
        // Başarı mesajı
        alert(`✅ "${name}" çalma listesi oluşturuldu!`);
        
    } catch (error) {
        console.error('❌ Çalma listesi oluşturulamadı:', error);
        alert('Çalma listesi oluşturulurken bir hata oluştu: ' + error.message);
    }
}

// Çalma listesini düzenle
function editPlaylist(playlistId) {
    try {
        const storedPlaylists = localStorage.getItem('userPlaylists');
        const playlists = storedPlaylists ? JSON.parse(storedPlaylists) : [];
        const playlist = playlists.find(p => p.id == playlistId);
        
        if (!playlist) {
            alert('Çalma listesi bulunamadı!');
            return;
        }
        
        // Modal'ı doldur
        document.getElementById('edit-playlist-name').value = playlist.name;
        document.getElementById('edit-playlist-description').value = playlist.description || '';
        document.getElementById('edit-playlist-privacy').value = playlist.privacy || 'public';
        
        // Modal'ı göster
        document.getElementById('edit-playlist-modal').style.display = 'flex';
        
        // Geçerli playlist ID'sini sakla
        window.currentEditingPlaylistId = playlistId;
        
    } catch (error) {
        console.error('Çalma listesi düzenlenemedi:', error);
        alert('Çalma listesi yüklenirken bir hata oluştu!');
    }
}

// Düzenleme modal'ını gizle
function hideEditPlaylist() {
    document.getElementById('edit-playlist-modal').style.display = 'none';
    window.currentEditingPlaylistId = null;
}

// Çalma listesini güncelle
function updatePlaylist() {
    if (!window.currentEditingPlaylistId) return;
    
    const name = document.getElementById('edit-playlist-name').value.trim();
    const description = document.getElementById('edit-playlist-description').value.trim();
    const privacy = document.getElementById('edit-playlist-privacy').value;
    
    if (!name) {
        alert('Lütfen çalma listesi adını girin!');
        return;
    }
    
    try {
        const storedPlaylists = localStorage.getItem('userPlaylists');
        let playlists = storedPlaylists ? JSON.parse(storedPlaylists) : [];
        
        const playlistIndex = playlists.findIndex(p => p.id == window.currentEditingPlaylistId);
        if (playlistIndex === -1) {
            alert('Çalma listesi bulunamadı!');
            return;
        }
        
        // Güncelle
        playlists[playlistIndex].name = name;
        playlists[playlistIndex].description = description;
        playlists[playlistIndex].privacy = privacy;
        
        // Kaydet
        localStorage.setItem('userPlaylists', JSON.stringify(playlists));
        
        // UI'ı güncelle
        loadPlaylists();
        hideEditPlaylist();
        
        showNotification('Çalma listesi güncellendi!', 'success');
        
    } catch (error) {
        console.error('Çalma listesi güncellenemedi:', error);
        alert('Güncelleme sırasında bir hata oluştu!');
    }
}

// Çalma listesini sil
function deleteCurrentPlaylist() {
    if (!window.currentEditingPlaylistId) return;
    // Directly delete the currently editing playlist (ellipsis menu is primary UI)
    if (typeof deletePlaylistImmediate === 'function') {
        deletePlaylistImmediate(window.currentEditingPlaylistId);
    } else if (typeof deletePlaylist === 'function') {
        deletePlaylist(window.currentEditingPlaylistId);
    }
}

// Çalma listesini aç
function openPlaylist(playlistId) {
    console.log('Açılacak playlist ID:', playlistId);
    
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) {
        showNotification('Çalma listesi bulunamadı!', 'error');
        return;
    }
    
    // Modal'ı bul veya oluştur
    let modal = document.getElementById('playlist-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'playlist-detail-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content playlist-detail-content">
                <div class="modal-header">
                    <h2 id="playlist-detail-title"></h2>
                    <button class="close-btn" onclick="closePlaylistDetail()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="playlist-detail-info">
                    <img id="playlist-detail-image" src="" alt="Playlist Cover">
                    <div class="playlist-detail-meta">
                        <p id="playlist-detail-description"></p>
                        <div class="playlist-detail-stats">
                            <span id="playlist-detail-tracks"></span>
                            <span id="playlist-detail-duration"></span>
                        </div>
                        <div class="playlist-detail-actions">
                            <button class="action-btn play-btn" onclick="playPlaylist(${playlistId})">
                                <i class="fas fa-play"></i> Çal
                            </button>
                            <button class="action-btn" onclick="sharePlaylist(${playlistId})">
                                <i class="fas fa-share"></i> Paylaş
                            </button>
                        </div>
                    </div>
                </div>
                <div class="playlist-tracks">
                    <h3>Şarkılar</h3>
                    <div id="playlist-tracks-list"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // İçeriği doldur
    document.getElementById('playlist-detail-title').textContent = playlist.name;
    document.getElementById('playlist-detail-description').textContent = playlist.description || 'Açıklama yok';
    document.getElementById('playlist-detail-image').src = playlist.imageUrl || generatePlaylistImage();
    document.getElementById('playlist-detail-tracks').innerHTML = `<i class="fas fa-music"></i> ${playlist.trackCount} şarkı`;
    document.getElementById('playlist-detail-duration').innerHTML = `<i class="fas fa-clock"></i> ${playlist.duration}`;
    
    // Şarkı listesini oluştur (örnek şarkılar)
    const tracksList = document.getElementById('playlist-tracks-list');
    tracksList.innerHTML = `
        <div class="track-item">
            <span class="track-number">1</span>
            <div class="track-info">
                <div class="track-title">Demo Şarkı 1</div>
                <div class="track-artist">Demo Sanatçı</div>
            </div>
            <span class="track-duration">3:45</span>
        </div>
        <div class="track-item">
            <span class="track-number">2</span>
            <div class="track-info">
                <div class="track-title">Demo Şarkı 2</div>
                <div class="track-artist">Demo Sanatçı</div>
            </div>
            <span class="track-duration">4:12</span>
        </div>
        <div class="track-item">
            <span class="track-number">3</span>
            <div class="track-info">
                <div class="track-title">Demo Şarkı 3</div>
                <div class="track-artist">Demo Sanatçı</div>
            </div>
            <span class="track-duration">3:28</span>
        </div>
    `;
    
    // Modal'ı göster
    modal.style.display = 'flex';
}

function closePlaylistDetail() {
    const modal = document.getElementById('playlist-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Çalma listesini çal
function playPlaylist(playlistId) {
    console.log('Çalınacak playlist ID:', playlistId);
    
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) {
        showNotification('Çalma listesi bulunamadı!', 'error');
        return;
    }
    
    showNotification(`"${playlist.name}" çalma listesi oynatılıyor...`, 'success');
    
    // Modal'ı kapat
    closePlaylistDetail();
    
    // Burada gerçek müzik çalma mantığı eklenebilir
    // Örneğin: player.playPlaylist(playlistId);
}

// Çalma listesini paylaş
function sharePlaylist(playlistId) {
    console.log('Paylaşılacak playlist ID:', playlistId);
    showNotification('Paylaşım özelliği yakında eklenecek!', 'info');
}

// Rastgele playlist resmi getir
function getRandomPlaylistImage() {
    const images = [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    ];
    return images[Math.floor(Math.random() * images.length)];
}

// Basit bildirim sistemi
function showNotification(message, type = 'info') {
    // Eğer daha gelişmiş bir bildirim sistemi varsa onu kullan
    if (typeof window.showToast !== 'undefined') {
        window.showToast(message, type);
        return;
    }
    
    // Basit alert fallback
    alert(message);
}

// Event listeners
function initializeEventListeners() {
    // Modal dışına tıklanınca kapat
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            if (e.target.id === 'create-playlist-modal') {
                hideCreatePlaylist();
            } else if (e.target.id === 'edit-playlist-modal') {
                hideEditPlaylist();
            }
        }
    });
    
    // ESC tuşu ile modal'ları kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideCreatePlaylist();
            hideEditPlaylist();
        }
    });
}

// Logout fonksiyonu
function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
        sessionStorage.clear();
        
        // Başarı mesajı (eğer showNotification fonksiyonu yoksa basit alert)
        if (typeof showNotification !== 'undefined') {
            showNotification('Başarıyla çıkış yaptınız', 'success');
        }
        
        // 1 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}