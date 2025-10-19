// Modern Professional Profile System

class ProfileManager {
    constructor() {
        this.userData = this.loadUserData();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadProfileData();
        this.loadUserStats();
        this.loadRecentActivity();
        this.setupTabs();
        this.startRealTimeUpdates();
    }
    
    loadUserData() {
        const defaultData = {
            username: 'Kullanıcı',
            email: 'user@example.com',
            bio: '🎵 Müzik tutkunu | 🎧 Her gün yeni keşifler | 🌟 Müzikte sınır tanımam',
            location: 'İstanbul, Türkiye',
            joinDate: 'Ocak 2024',
            birthday: '15 Mart',
            avatar: '',
            coverImage: '',
            badges: ['premium', 'verified'],
            preferences: {
                genres: ['Pop', 'Rock', 'Electronic', 'Jazz', 'Classical'],
                listeningHabits: {
                    activeHour: '20:00 - 22:00',
                    avgSession: '45 dakika',
                    skipRate: '12%',
                    repeatRate: '28%'
                }
            }
        };
        
        try {
            const saved = localStorage.getItem('user-profile-data');
            return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
        } catch (error) {
            return defaultData;
        }
    }
    
    saveUserData() {
        localStorage.setItem('user-profile-data', JSON.stringify(this.userData));
    }
    
    loadProfileData() {
        // Populate basic profile info
        document.getElementById('profileName').textContent = this.userData.username;
        document.getElementById('profileEmail').textContent = this.userData.email;
        document.getElementById('profileBio').textContent = this.userData.bio;
        document.getElementById('joinDate').textContent = this.userData.joinDate + "'te katıldı";
        document.getElementById('location').textContent = this.userData.location;
        document.getElementById('birthday').textContent = this.userData.birthday;
        
        // Load avatar and cover images
        if (this.userData.avatar) {
            document.getElementById('avatarImage').src = this.userData.avatar;
        }
        if (this.userData.coverImage) {
            document.getElementById('coverImage').src = this.userData.coverImage;
        }
        
        // Load badges
        this.updateBadges();
    }
    
    updateBadges() {
        const badgesContainer = document.querySelector('.profile-badges');
        badgesContainer.innerHTML = '';
        
        this.userData.badges.forEach(badge => {
            const badgeElement = document.createElement('span');
            badgeElement.className = `badge ${badge}`;
            
            switch(badge) {
                case 'premium':
                    badgeElement.innerHTML = '<i class="fas fa-crown"></i> Premium';
                    badgeElement.title = 'Premium üye';
                    break;
                case 'verified':
                    badgeElement.innerHTML = '<i class="fas fa-check-circle"></i> Doğrulanmış';
                    badgeElement.title = 'Doğrulanmış hesap';
                    break;
                case 'artist':
                    badgeElement.innerHTML = '<i class="fas fa-microphone"></i> Sanatçı';
                    badgeElement.title = 'Sanatçı hesabı';
                    break;
            }
            
            badgesContainer.appendChild(badgeElement);
        });
    }
    
    loadUserStats() {
        // Get real stats from localStorage
        const favorites = JSON.parse(localStorage.getItem('music-favorites') || '[]');
        const playlists = JSON.parse(localStorage.getItem('user-playlists') || '[]');
        const listeningTime = localStorage.getItem('total-listening-time') || '0';
        const followers = localStorage.getItem('followers-count') || Math.floor(Math.random() * 100);
        
        // Update stat displays
        document.getElementById('favoritesCount').textContent = favorites.length;
        document.getElementById('playlistsCount').textContent = playlists.length;
        document.getElementById('listeningTime').textContent = this.formatListeningTime(listeningTime);
        document.getElementById('followersCount').textContent = followers;
        
        // Animate counter updates
        this.animateCounters();
    }
    
    formatListeningTime(minutes) {
        const totalMinutes = parseInt(minutes) || 0;
        if (totalMinutes < 60) {
            return totalMinutes + 'm';
        }
        const hours = Math.floor(totalMinutes / 60);
        if (hours < 24) {
            return hours + 'h';
        }
        const days = Math.floor(hours / 24);
        return days + 'd';
    }
    
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.textContent) || 0;
            const increment = target / 30;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 50);
        });
    }
    
    loadRecentActivity() {
        const activities = [
            {
                type: 'play',
                title: 'Şarkı dinledi',
                description: 'Bohemian Rhapsody - Queen',
                time: '2 dakika önce',
                icon: 'play'
            },
            {
                type: 'like',
                title: 'Şarkı beğendi',
                description: 'Imagine - John Lennon',
                time: '15 dakika önce',
                icon: 'heart'
            },
            {
                type: 'playlist',
                title: 'Çalma listesi oluşturdu',
                description: 'Gece Müzikleri',
                time: '1 saat önce',
                icon: 'list'
            },
            {
                type: 'follow',
                title: 'Sanatçı takip etti',
                description: 'The Beatles',
                time: '3 saat önce',
                icon: 'user-plus'
            }
        ];
        
        this.renderActivityTimeline(activities);
    }
    
    renderActivityTimeline(activities) {
        const timeline = document.querySelector('.activity-timeline');
        if (!timeline) return;
        
        timeline.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-header">
                    <span class="activity-title">
                        <i class="fas fa-${activity.icon}"></i>
                        ${activity.title}
                    </span>
                    <span class="activity-time">${activity.time}</span>
                </div>
                <div class="activity-description">${activity.description}</div>
            </div>
        `).join('');
    }
    
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update active states
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                // Load tab-specific content
                this.loadTabContent(targetTab);
            });
        });
        
        // Load initial tab content
        this.loadTabContent('overview');
    }
    
    loadTabContent(tabName) {
        switch(tabName) {
            case 'overview':
                this.loadOverviewContent();
                break;
            case 'activity':
                this.loadRecentActivity();
                break;
            case 'preferences':
                this.loadPreferencesContent();
                break;
            case 'security':
                this.loadSecurityContent();
                break;
        }
    }
    
    loadOverviewContent() {
        // Load recent tracks
        const recentTracks = this.getRecentTracks();
        this.renderTrackList('recentTracks', recentTracks);
        
        // Load top tracks
        const topTracks = this.getTopTracks();
        this.renderTrackList('topTracks', topTracks);
        
        // Load genre analysis
        this.renderGenreAnalysis();
        
        // Load listening habits
        this.renderListeningHabits();
    }
    
    getRecentTracks() {
        return [
            {
                name: 'Bohemian Rhapsody',
                artist: 'Queen',
                plays: '1,234',
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop'
            },
            {
                name: 'Imagine',
                artist: 'John Lennon',
                plays: '987',
                image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=60&h=60&fit=crop'
            },
            {
                name: 'Hotel California',
                artist: 'Eagles',
                plays: '756',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=60&fit=crop'
            },
            {
                name: 'Sweet Child O Mine',
                artist: 'Guns N Roses',
                plays: '654',
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop'
            }
        ];
    }
    
    getTopTracks() {
        return [
            {
                name: 'Stairway to Heaven',
                artist: 'Led Zeppelin',
                plays: '2,345',
                image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=60&h=60&fit=crop'
            },
            {
                name: 'Smells Like Teen Spirit',
                artist: 'Nirvana',
                plays: '2,123',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=60&fit=crop'
            },
            {
                name: 'Billie Jean',
                artist: 'Michael Jackson',
                plays: '1,987',
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop'
            }
        ];
    }
    
    renderTrackList(containerId, tracks) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = tracks.map(track => `
            <div class="track-item" onclick="profileManager.playTrack('${track.name}', '${track.artist}')">
                <div class="track-artwork">
                    <img src="${track.image}" alt="${track.name}">
                </div>
                <div class="track-details">
                    <div class="track-name">${track.name}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-plays">${track.plays} çalma</div>
            </div>
        `).join('');
    }
    
    renderGenreAnalysis() {
        const genreData = [
            { name: 'Pop', percentage: 35 },
            { name: 'Rock', percentage: 28 },
            { name: 'Electronic', percentage: 18 },
            { name: 'Jazz', percentage: 12 },
            { name: 'Classical', percentage: 7 }
        ];
        
        const container = document.getElementById('genreBars');
        if (!container) return;
        
        container.innerHTML = genreData.map(genre => `
            <div class="genre-bar">
                <span class="genre-name">${genre.name}</span>
                <div class="genre-progress">
                    <div class="genre-fill" style="width: ${genre.percentage}%"></div>
                </div>
                <span class="genre-percentage">${genre.percentage}%</span>
            </div>
        `).join('');
        
        // Animate bars
        setTimeout(() => {
            document.querySelectorAll('.genre-fill').forEach(fill => {
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = fill.getAttribute('style').match(/width: (\d+)%/)[1] + '%';
                }, 100);
            });
        }, 500);
    }
    
    renderListeningHabits() {
        const habits = this.userData.preferences.listeningHabits;
        const container = document.querySelector('.listening-habits');
        if (!container) return;
        
        container.innerHTML = `
            <h4>Dinleme Alışkanlıkları</h4>
            <div class="habit-item">
                <span class="habit-label">En Aktif Saat:</span>
                <span class="habit-value">${habits.activeHour}</span>
            </div>
            <div class="habit-item">
                <span class="habit-label">Ortalama Oturum:</span>
                <span class="habit-value">${habits.avgSession}</span>
            </div>
            <div class="habit-item">
                <span class="habit-label">Atlama Oranı:</span>
                <span class="habit-value">${habits.skipRate}</span>
            </div>
            <div class="habit-item">
                <span class="habit-label">Tekrar Oranı:</span>
                <span class="habit-value">${habits.repeatRate}</span>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Profile actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const btn = e.target.closest('.action-btn');
                const action = btn.textContent.trim();
                
                if (action.includes('Profili Düzenle')) {
                    this.openEditProfileModal();
                } else if (action.includes('Paylaş')) {
                    this.shareProfile();
                } else if (action.includes('Takipçiler')) {
                    this.openFollowersModal();
                }
            }
        });
        
        // Image change handlers
        window.changeAvatar = () => this.changeImage('avatar');
        window.changeCoverImage = () => this.changeImage('cover');
    }
    
    openEditProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal profile-edit-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-edit"></i> Profil Düzenle</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label>Kullanıcı Adı</label>
                        <input type="text" id="edit-username" value="${this.userData.username}" placeholder="Kullanıcı adınız">
                    </div>
                    <div class="input-group">
                        <label>E-posta</label>
                        <input type="email" id="edit-email" value="${this.userData.email}" placeholder="E-posta adresiniz">
                    </div>
                    <div class="input-group">
                        <label>Bio</label>
                        <textarea id="edit-bio" placeholder="Kendiniz hakkında kısa bilgi">${this.userData.bio}</textarea>
                    </div>
                    <div class="input-group">
                        <label>Konum</label>
                        <input type="text" id="edit-location" value="${this.userData.location}" placeholder="Şehir, Ülke">
                    </div>
                    <div class="input-group">
                        <label>Doğum Günü</label>
                        <input type="text" id="edit-birthday" value="${this.userData.birthday}" placeholder="Gün Ay">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn secondary" onclick="this.closest('.modal').remove()">İptal</button>
                    <button class="btn primary" onclick="profileManager.saveProfileChanges()">Kaydet</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    saveProfileChanges() {
        this.userData.username = document.getElementById('edit-username').value;
        this.userData.email = document.getElementById('edit-email').value;
        this.userData.bio = document.getElementById('edit-bio').value;
        this.userData.location = document.getElementById('edit-location').value;
        this.userData.birthday = document.getElementById('edit-birthday').value;
        
        this.saveUserData();
        this.loadProfileData();
        
        document.querySelector('.profile-edit-modal').remove();
        this.showNotification('Profil başarıyla güncellendi!', 'success');
    }
    
    changeImage(type) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    
                    if (type === 'avatar') {
                        this.userData.avatar = imageUrl;
                        document.getElementById('avatarImage').src = imageUrl;
                    } else {
                        this.userData.coverImage = imageUrl;
                        document.getElementById('coverImage').src = imageUrl;
                    }
                    
                    this.saveUserData();
                    this.showNotification(`${type === 'avatar' ? 'Profil' : 'Kapak'} fotoğrafı güncellendi!`, 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
    
    shareProfile() {
        if (navigator.share) {
            navigator.share({
                title: `${this.userData.username} - Frekans Profili`,
                text: this.userData.bio,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
            this.showNotification('Profil linki kopyalandı!', 'success');
        }
    }
    
    openFollowersModal() {
        const modal = document.createElement('div');
        modal.className = 'modal followers-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-users"></i> Takipçiler</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="followers-list">
                        ${this.generateFollowersList()}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    generateFollowersList() {
        const followers = [
            { name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/40?img=1', mutual: true },
            { name: 'Ayşe Demir', avatar: 'https://i.pravatar.cc/40?img=2', mutual: false },
            { name: 'Mehmet Kaya', avatar: 'https://i.pravatar.cc/40?img=3', mutual: true },
            { name: 'Fatma Şahin', avatar: 'https://i.pravatar.cc/40?img=4', mutual: false },
            { name: 'Ali Veli', avatar: 'https://i.pravatar.cc/40?img=5', mutual: true },
            { name: 'Zeynep Özkan', avatar: 'https://i.pravatar.cc/40?img=6', mutual: false }
        ];
        
        return followers.map(follower => `
            <div class="follower-item">
                <img src="${follower.avatar}" alt="${follower.name}" class="follower-avatar">
                <div class="follower-info">
                    <div class="follower-name">${follower.name}</div>
                    ${follower.mutual ? '<div class="mutual-badge">Karşılıklı takip</div>' : ''}
                </div>
                <button class="btn secondary small">Profili Gör</button>
            </div>
        `).join('');
    }
    
    playTrack(name, artist) {
        this.showNotification(`${name} - ${artist} çalınıyor...`, 'info');
        // Integrate with actual player if available
        if (window.playTrack) {
            window.playTrack(name, artist);
        }
    }
    
    startRealTimeUpdates() {
        // Update listening time every minute
        setInterval(() => {
            this.updateListeningTime();
        }, 60000);
        
        // Update activity every 5 minutes
        setInterval(() => {
            this.loadRecentActivity();
        }, 300000);
    }
    
    updateListeningTime() {
        const currentTime = parseInt(localStorage.getItem('total-listening-time') || '0');
        const newTime = currentTime + 1; // Add 1 minute
        localStorage.setItem('total-listening-time', newTime.toString());
        
        document.getElementById('listeningTime').textContent = this.formatListeningTime(newTime);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});