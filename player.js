// Enhanced Music Player Controller
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one
        this.currentVolume = 0.7;
        this.currentTrackIndex = 0;
        this.playlist = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializePlayer();
    }
    
    initializeElements() {
        // Play/Pause button
        this.playBtn = document.getElementById('play-btn');
        this.playIcon = this.playBtn?.querySelector('.play-icon');
        this.loadingCircle = this.playBtn?.querySelector('.loading-circle');
        
        // Control buttons
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.repeatBtn = document.getElementById('repeat-btn');
        this.likeBtn = document.getElementById('like-btn');
        
        // Progress elements
        this.progressSlider = document.getElementById('progress-slider');
        this.progressFill = document.getElementById('progress-fill');
        this.progressHandle = document.getElementById('progress-handle');
        this.progressLine = document.getElementById('progress-line');
        this.miniProgress = document.getElementById('mini-progress');
        
        // Volume elements
        this.volumeBtn = document.getElementById('volume-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeFill = document.getElementById('volume-fill');
        
        // Time displays
        this.currentTime = document.getElementById('time-current');
        this.totalTime = document.getElementById('time-total');
        
        // Track info
        this.trackImage = document.getElementById('current-track-image');
        this.trackName = document.getElementById('current-track-name');
        this.artistName = document.getElementById('current-artist-name');
        this.trackArtwork = document.getElementById('track-artwork');
        
        // Additional controls
        this.queueBtn = document.getElementById('queue-btn');
        this.deviceBtn = document.getElementById('device-btn');
        this.equalizerBtn = document.getElementById('equalizer-btn');
        this.lyricsBtn = document.getElementById('lyrics-btn');
        this.shareBtn = document.getElementById('share-btn');
        
        // Waveform
        this.waveformCanvas = document.getElementById('waveform-canvas');
        this.waveformCtx = this.waveformCanvas?.getContext('2d');
    }
    
    setupEventListeners() {
        // Play/Pause
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }
        
        // Navigation
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousTrack());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextTrack());
        }
        
        // Shuffle and repeat
        if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }
        if (this.repeatBtn) {
            this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        }
        
        // Like/Unlike
        if (this.likeBtn) {
            this.likeBtn.addEventListener('click', () => this.toggleLike());
        }
        
        // Progress control
        if (this.progressSlider) {
            this.progressSlider.addEventListener('input', (e) => this.seekTo(e.target.value));
            this.progressSlider.addEventListener('change', (e) => this.seekTo(e.target.value));
        }
        
        // Volume control
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
        }
        if (this.volumeBtn) {
            this.volumeBtn.addEventListener('click', () => this.toggleMute());
        }
        
        // Audio events
        if (this.audio) {
            this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('ended', () => this.handleTrackEnd());
            this.audio.addEventListener('play', () => this.onPlay());
            this.audio.addEventListener('pause', () => this.onPause());
            this.audio.addEventListener('error', (e) => this.handleError(e));
        }
        
        // Additional controls
        if (this.queueBtn) {
            this.queueBtn.addEventListener('click', () => this.toggleQueue());
        }
        if (this.deviceBtn) {
            this.deviceBtn.addEventListener('click', () => this.showDevices());
        }
        if (this.equalizerBtn) {
            this.equalizerBtn.addEventListener('click', () => this.toggleEqualizer());
        }
        if (this.lyricsBtn) {
            this.lyricsBtn.addEventListener('click', () => this.showLyrics());
        }
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', () => this.shareTrack());
        }
        
        // Track artwork interaction
        if (this.trackArtwork) {
            this.trackArtwork.addEventListener('click', () => this.pulseArtwork());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    initializePlayer() {
        // Set initial volume
        if (this.audio) {
            this.audio.volume = this.currentVolume;
        }
        this.updateVolumeDisplay();
        
        // Initialize waveform
        this.initializeWaveform();
        
        // Update favorites display on page load
        setTimeout(() => {
            this.updateFavoritesDisplay();
        }, 500);
        
        // Load sample playlist
        this.playlist = [
            {
                title: "Relaxing Piano",
                artist: "Test Artist",
                src: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
                artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center"
            },
            {
                title: "Nature Sounds", 
                artist: "Ambient",
                src: "https://file-examples.com/storage/fe68d8fca66da90ecb8de2f/2017/11/file_example_MP3_700KB.mp3",
                artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=center"
            }
        ];
        
        // Initialize waveform
        this.initializeWaveform();
    }
    
    togglePlay() {
        if (!this.audio) return;
        
        this.showLoadingState();
        
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            // Load current track if no source
            if (!this.audio.src && this.playlist.length > 0) {
                this.loadTrack(this.currentTrackIndex);
            }
            
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Playback failed:', error);
                    this.hideLoadingState();
                });
            }
        }
    }
    
    showLoadingState() {
        if (this.playIcon && this.loadingCircle) {
            this.playIcon.style.display = 'none';
            this.loadingCircle.style.display = 'flex';
        }
    }
    
    hideLoadingState() {
        if (this.playIcon && this.loadingCircle) {
            this.playIcon.style.display = 'flex';
            this.loadingCircle.style.display = 'none';
        }
    }
    
    onPlay() {
        this.isPlaying = true;
        this.hideLoadingState();
        
        if (this.playIcon) {
            this.playIcon.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        this.playBtn?.classList.add('playing');
        this.startWaveformAnimation();
    }
    
    onPause() {
        this.isPlaying = false;
        this.hideLoadingState();
        
        if (this.playIcon) {
            this.playIcon.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        this.playBtn?.classList.remove('playing');
        this.stopWaveformAnimation();
    }
    
    previousTrack() {
        if (this.playlist.length === 0) return;
        
        this.currentTrackIndex = this.currentTrackIndex > 0 
            ? this.currentTrackIndex - 1 
            : this.playlist.length - 1;
            
        this.loadTrack(this.currentTrackIndex);
        
        if (this.isPlaying) {
            this.audio?.play();
        }
    }
    
    nextTrack() {
        if (this.playlist.length === 0) return;
        
        if (this.isShuffle) {
            this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentTrackIndex = this.currentTrackIndex < this.playlist.length - 1 
                ? this.currentTrackIndex + 1 
                : 0;
        }
        
        this.loadTrack(this.currentTrackIndex);
        
        if (this.isPlaying) {
            this.audio?.play();
        }
    }
    
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtn?.classList.toggle('active', this.isShuffle);
        
        // Visual feedback
        if (this.isShuffle) {
            this.showNotification('Karıştırma açık');
        } else {
            this.showNotification('Karıştırma kapalı');
        }
    }
    
    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        
        this.repeatBtn?.classList.remove('active', 'repeat-one');
        
        switch (this.repeatMode) {
            case 1:
                this.repeatBtn?.classList.add('active');
                this.showNotification('Tümünü tekrarla');
                break;
            case 2:
                this.repeatBtn?.classList.add('active', 'repeat-one');
                if (this.repeatBtn) {
                    this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span class="repeat-indicator">1</span>';
                }
                this.showNotification('Şarkıyı tekrarla');
                break;
            default:
                if (this.repeatBtn) {
                    this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
                }
                this.showNotification('Tekrar kapalı');
        }
    }
    
    toggleLike() {
        const icon = this.likeBtn?.querySelector('i');
        if (!icon) return;
        
        // script.js'deki currentPlaylist ve currentTrackIndex'i kullan
        const currentTrack = window.currentPlaylist ? window.currentPlaylist[window.currentTrackIndex] : null;
        if (!currentTrack) {
            this.showNotification('Önce bir şarkı seçin');
            return;
        }
        
        // script.js'deki şarkı nesnesini player.js formatına çevir
        const trackForFavorites = {
            title: currentTrack.name || currentTrack.title,
            artist: currentTrack.artist,
            image: currentTrack.image,
            audioUrl: currentTrack.audioUrl || '',
            id: currentTrack.id,
            duration: currentTrack.duration,
            durationSeconds: currentTrack.durationSeconds
        };
        
        const isLiked = icon.classList.contains('fas');
        
        if (isLiked) {
            // Remove from favorites
            this.removeFromFavorites(trackForFavorites);
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.likeBtn?.classList.remove('liked');
            this.showNotification('Beğenilerden kaldırıldı');
        } else {
            // Add to favorites
            this.addToFavorites(trackForFavorites);
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.likeBtn?.classList.add('liked');
            this.showNotification('Beğenilere eklendi');
        }
    }
    
    addToFavorites(track) {
        // Get existing favorites from localStorage
        let favorites = this.getFavorites();
        
        // Check if track already exists
        const existsIndex = favorites.findIndex(fav => 
            fav.title === track.title && fav.artist === track.artist
        );
        
        if (existsIndex === -1) {
            // Add track with timestamp
            const favoriteTrack = {
                ...track,
                dateAdded: new Date().toISOString(),
                id: Date.now() + Math.random() // Simple ID generation
            };
            
            favorites.unshift(favoriteTrack); // Add to beginning
            this.saveFavorites(favorites);
            
            // Update favorites page if it exists
            this.updateFavoritesDisplay();
        }
    }
    
    removeFromFavorites(track) {
        let favorites = this.getFavorites();
        
        // Remove track from favorites
        favorites = favorites.filter(fav => 
            !(fav.title === track.title && fav.artist === track.artist)
        );
        
        this.saveFavorites(favorites);
        
        // Update favorites page if it exists
        this.updateFavoritesDisplay();
    }
    
    getFavorites() {
        try {
            const favorites = localStorage.getItem('music-favorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }
    
    saveFavorites(favorites) {
        try {
            localStorage.setItem('music-favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }
    
    updateFavoritesDisplay() {
        // Update favorites page if we're currently on it
        if (typeof loadFavoritesFromStorage === 'function') {
            loadFavoritesFromStorage();
        }
        
        // Update favorites counter in sidebar
        const favoritesList = document.querySelector('a[href="favorites.html"]');
        if (favoritesList) {
            const count = this.getFavorites().length;
            let countElement = favoritesList.querySelector('.favorites-count');
            if (!countElement) {
                countElement = document.createElement('span');
                countElement.className = 'favorites-count';
                countElement.style.marginLeft = '5px';
                countElement.style.color = '#4ecdc4';
                countElement.style.fontSize = '11px';
                favoritesList.appendChild(countElement);
            }
            countElement.textContent = `(${count})`;
        }
        
        // Update page stats if on favorites page
        const favoritesCount = document.getElementById('favorites-count');
        if (favoritesCount) {
            const count = this.getFavorites().length;
            favoritesCount.textContent = `${count} şarkı`;
        }
    }
    
    renderFavorites() {
        const favoritesGrid = document.getElementById('favorites-grid');
        if (!favoritesGrid) return;
        
        const favorites = this.getFavorites();
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-favorites">
                    <div class="empty-icon">
                        <i class="far fa-heart"></i>
                    </div>
                    <h3>Henüz beğenilen şarkı yok</h3>
                    <p>Şarkıları beğenerek buraya ekleyebilirsin</p>
                </div>
            `;
            return;
        }
        
        favoritesGrid.innerHTML = favorites.map(track => `
            <div class="favorite-item" data-track-id="${track.id}">
                <div class="favorite-artwork">
                    <img src="${track.artwork}" alt="${track.title}">
                    <div class="favorite-overlay">
                        <button class="play-favorite" onclick="window.musicPlayer.playFavoriteTrack('${track.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="remove-favorite" onclick="window.musicPlayer.removeFavoriteById('${track.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
                <div class="favorite-info">
                    <h4 class="favorite-title">${track.title}</h4>
                    <p class="favorite-artist">${track.artist}</p>
                    <small class="favorite-date">Eklenme: ${this.formatDate(track.dateAdded)}</small>
                </div>
            </div>
        `).join('');
        
        // Add CSS for favorites if not exists
        this.addFavoriteStyles();
    }
    
    playFavoriteTrack(trackId) {
        const favorites = this.getFavorites();
        const track = favorites.find(fav => fav.id == trackId);
        
        if (track) {
            // Add to current playlist if not exists
            const existsInPlaylist = this.playlist.findIndex(p => 
                p.title === track.title && p.artist === track.artist
            );
            
            if (existsInPlaylist === -1) {
                this.playlist.push(track);
            }
            
            // Play the track
            const trackIndex = existsInPlaylist !== -1 ? existsInPlaylist : this.playlist.length - 1;
            this.playTrack(trackIndex);
        }
    }
    
    removeFavoriteById(trackId) {
        let favorites = this.getFavorites();
        const track = favorites.find(fav => fav.id == trackId);
        
        if (track) {
            favorites = favorites.filter(fav => fav.id != trackId);
            this.saveFavorites(favorites);
            this.renderFavorites();
            this.showNotification(`${track.title} beğenilerden kaldırıldı`);
            
            // Update like button if this track is currently playing
            const currentTrack = this.playlist[this.currentTrackIndex];
            if (currentTrack && currentTrack.title === track.title && currentTrack.artist === track.artist) {
                const icon = this.likeBtn?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    this.likeBtn?.classList.remove('liked');
                }
            }
        }
    }
    
    checkIfLiked(track) {
        if (!track) return false;
        
        const favorites = this.getFavorites();
        return favorites.some(fav => 
            fav.title === track.title && fav.artist === track.artist
        );
    }
    
    updateLikeButtonState() {
        const currentTrack = this.playlist[this.currentTrackIndex];
        const icon = this.likeBtn?.querySelector('i');
        
        if (icon && currentTrack) {
            const isLiked = this.checkIfLiked(currentTrack);
            
            if (isLiked) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.likeBtn?.classList.add('liked');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.likeBtn?.classList.remove('liked');
            }
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Bugün';
        if (diffDays === 2) return 'Dün';
        if (diffDays <= 7) return `${diffDays} gün önce`;
        
        return date.toLocaleDateString('tr-TR');
    }
    
    addFavoriteStyles() {
        if (document.getElementById('favorites-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'favorites-styles';
        style.textContent = `
            .empty-favorites {
                text-align: center;
                padding: 60px 20px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .empty-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: rgba(255, 255, 255, 0.3);
            }
            
            .favorite-item {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 15px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .favorite-item:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }
            
            .favorite-artwork {
                position: relative;
                width: 100%;
                aspect-ratio: 1;
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            
            .favorite-artwork img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .favorite-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .favorite-item:hover .favorite-overlay {
                opacity: 1;
            }
            
            .play-favorite, .remove-favorite {
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .play-favorite {
                background: linear-gradient(45deg, #4ecdc4, #45b7d1);
            }
            
            .play-favorite:hover {
                transform: scale(1.1);
            }
            
            .remove-favorite {
                background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            }
            
            .remove-favorite:hover {
                transform: scale(1.1);
            }
            
            .favorite-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 4px;
                color: white;
            }
            
            .favorite-artist {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 6px;
            }
            
            .favorite-date {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.5);
            }
            
                .favorites-count {
                    font-size: 11px;
                    color: #4ecdc4;
                    margin-left: 5px;
                }
                
                /* Track Cards for Favorites Page */
                .track-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 15px;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                }
                
                .track-card:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                }
                
                .track-card-artwork {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }
                
                .track-card-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .track-card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .track-card:hover .track-card-overlay {
                    opacity: 1;
                }
                
                .card-play-btn, .card-remove-btn {
                    width: 40px;
                    height: 40px;
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .card-play-btn {
                    background: linear-gradient(45deg, #4ecdc4, #45b7d1);
                }
                
                .card-remove-btn {
                    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
                }
                
                .card-play-btn:hover, .card-remove-btn:hover {
                    transform: scale(1.1);
                }
                
                .track-card-title {
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 4px;
                    color: white;
                }
                
                .track-card-artist {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 4px;
                }
                
                .track-card-date {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                }
            `;
            
            document.head.appendChild(style);
        }    seekTo(percentage) {
        if (!this.audio || !this.audio.duration) return;
        
        const time = (percentage / 100) * this.audio.duration;
        this.audio.currentTime = time;
    }
    
    setVolume(volume) {
        this.currentVolume = Math.max(0, Math.min(1, volume));
        
        if (this.audio) {
            this.audio.volume = this.currentVolume;
        }
        
        this.updateVolumeDisplay();
    }
    
    toggleMute() {
        if (this.currentVolume === 0) {
            this.setVolume(0.7);
        } else {
            this.setVolume(0);
        }
        
        if (this.volumeSlider) {
            this.volumeSlider.value = this.currentVolume * 100;
        }
    }
    
    updateProgress() {
        if (!this.audio || !this.audio.duration) return;
        
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        
        // Update progress displays
        if (this.progressSlider) this.progressSlider.value = progress;
        if (this.progressFill) this.progressFill.style.width = progress + '%';
        if (this.progressHandle) this.progressHandle.style.left = progress + '%';
        if (this.progressLine) this.progressLine.style.width = progress + '%';
        if (this.miniProgress) this.miniProgress.style.width = progress + '%';
        
        // Update time displays
        if (this.currentTime) {
            this.currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    updateDuration() {
        if (!this.audio || !this.audio.duration) return;
        
        if (this.totalTime) {
            this.totalTime.textContent = this.formatTime(this.audio.duration);
        }
    }
    
    updateVolumeDisplay() {
        if (this.volumeFill) {
            this.volumeFill.style.width = (this.currentVolume * 100) + '%';
        }
        
        // Update volume icon
        if (this.volumeBtn) {
            const icon = this.volumeBtn.querySelector('i');
            if (icon) {
                icon.className = this.currentVolume === 0 
                    ? 'fas fa-volume-mute' 
                    : this.currentVolume < 0.5 
                        ? 'fas fa-volume-down' 
                        : 'fas fa-volume-up';
            }
        }
    }
    
    loadTrack(index) {
        if (!this.playlist[index] || !this.audio) return;
        
        const track = this.playlist[index];
        
        // Update audio source
        this.audio.src = track.src;
        
        // Update UI
        if (this.trackName) this.trackName.textContent = track.title;
        if (this.artistName) this.artistName.textContent = track.artist;
        if (this.trackImage) this.trackImage.src = track.artwork;
        
        // Reset progress
        if (this.progressSlider) this.progressSlider.value = 0;
        if (this.currentTime) this.currentTime.textContent = '0:00';
        
        // Update like button state
        this.updateLikeButtonState();
        
        this.showNotification(`Yükleniyor: ${track.title}`);
    }
    
    handleTrackEnd() {
        switch (this.repeatMode) {
            case 2: // Repeat one
                this.audio?.play();
                break;
            case 1: // Repeat all
                this.nextTrack();
                break;
            default: // No repeat
                if (this.currentTrackIndex < this.playlist.length - 1) {
                    this.nextTrack();
                } else {
                    this.onPause();
                }
        }
    }
    
    handleError(error) {
        console.error('Audio error:', error);
        this.showNotification('Şarkı yüklenirken hata oluştu', 'error');
        this.onPause();
    }
    
    toggleQueue() {
        // Toggle queue visibility
        let queuePanel = document.getElementById('queue-panel');
        
        if (queuePanel) {
            queuePanel.remove();
            this.queueBtn?.classList.remove('active');
            return;
        }
        
        this.queueBtn?.classList.add('active');
        this.showQueuePanel();
    }
    
    showQueuePanel() {
        const panel = document.createElement('div');
        panel.id = 'queue-panel';
        panel.className = 'queue-panel';
        
        let queueHTML = `
            <div class="queue-header">
                <h3>Çalma Sırası</h3>
                <div class="queue-actions">
                    <button class="queue-clear" onclick="window.musicPlayer.clearQueue()">
                        <i class="fas fa-trash"></i> Temizle
                    </button>
                    <button class="queue-close" onclick="document.getElementById('queue-panel').remove(); window.musicPlayer.queueBtn?.classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="queue-content">
        `;
        
        if (this.playlist.length === 0) {
            queueHTML += '<p class="queue-empty">Sırada şarkı yok</p>';
        } else {
            this.playlist.forEach((track, index) => {
                const isCurrentTrack = index === this.currentTrackIndex;
                queueHTML += `
                    <div class="queue-item ${isCurrentTrack ? 'current' : ''}" onclick="window.musicPlayer.playTrack(${index})">
                        <div class="queue-item-info">
                            <img src="${track.artwork}" alt="${track.title}" class="queue-artwork">
                            <div class="queue-track-details">
                                <div class="queue-track-name">${track.title}</div>
                                <div class="queue-artist-name">${track.artist}</div>
                            </div>
                        </div>
                        <div class="queue-item-actions">
                            ${isCurrentTrack ? '<i class="fas fa-play queue-playing-icon"></i>' : ''}
                            <button class="queue-remove" onclick="event.stopPropagation(); window.musicPlayer.removeFromQueue(${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        queueHTML += '</div>';
        panel.innerHTML = queueHTML;
        document.body.appendChild(panel);
        
        // Add queue styles
        if (!document.getElementById('queue-panel-styles')) {
            const style = document.createElement('style');
            style.id = 'queue-panel-styles';
            style.textContent = `
                .queue-panel {
                    position: fixed;
                    right: 20px;
                    bottom: 120px;
                    width: 350px;
                    max-height: 400px;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    border-radius: 15px;
                    color: white;
                    z-index: 10000;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.3s ease;
                    overflow: hidden;
                }
                
                .queue-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .queue-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .queue-clear, .queue-close {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .queue-content {
                    max-height: 320px;
                    overflow-y: auto;
                    padding: 10px 0;
                }
                
                .queue-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .queue-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .queue-item.current {
                    background: rgba(78, 205, 196, 0.2);
                    border-left: 3px solid #4ecdc4;
                }
                
                .queue-item-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                }
                
                .queue-artwork {
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    object-fit: cover;
                }
                
                .queue-track-name {
                    font-weight: 600;
                    font-size: 13px;
                    margin-bottom: 2px;
                }
                
                .queue-artist-name {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .queue-item-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .queue-playing-icon {
                    color: #4ecdc4;
                    font-size: 12px;
                }
                
                .queue-remove {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    padding: 4px;
                }
                
                .queue-remove:hover {
                    color: #ff6b6b;
                }
                
                .queue-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    clearQueue() {
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.showNotification('Sıra temizlendi');
        
        // Refresh queue panel if open
        const queuePanel = document.getElementById('queue-panel');
        if (queuePanel) {
            queuePanel.remove();
            this.showQueuePanel();
        }
    }
    
    removeFromQueue(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.playlist.splice(index, 1);
        
        // Adjust current track index
        if (index < this.currentTrackIndex) {
            this.currentTrackIndex--;
        } else if (index === this.currentTrackIndex) {
            // If we removed the current track, stop playback
            if (this.isPlaying) {
                this.audio?.pause();
            }
            // Load next track if available
            if (this.playlist.length > 0) {
                this.currentTrackIndex = Math.min(this.currentTrackIndex, this.playlist.length - 1);
                this.loadTrack(this.currentTrackIndex);
            }
        }
        
        this.showNotification('Şarkı sıradan kaldırıldı');
        
        // Refresh queue panel
        const queuePanel = document.getElementById('queue-panel');
        if (queuePanel) {
            queuePanel.remove();
            this.showQueuePanel();
        }
    }
    
    showDevices() {
        // Simulate device list
        const devices = [
            { id: 'browser', name: 'Bu Tarayıcı', type: 'Computer', active: true },
            { id: 'phone', name: 'Telefon', type: 'Smartphone', active: false },
            { id: 'speaker', name: 'Bluetooth Hoparlör', type: 'Speaker', active: false },
            { id: 'headphones', name: 'Kablosuz Kulaklık', type: 'Headphones', active: false }
        ];
        
        // Remove existing device modal
        const existingModal = document.getElementById('device-modal');
        if (existingModal) {
            existingModal.remove();
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'device-modal';
        modal.className = 'device-modal';
        
        let devicesHTML = `
            <div class="device-content">
                <div class="device-header">
                    <h3>Cihazları Seç</h3>
                    <button class="close-device" onclick="document.getElementById('device-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="device-list">
        `;
        
        devices.forEach(device => {
            const icon = device.type === 'Computer' ? 'desktop' : 
                        device.type === 'Smartphone' ? 'mobile-alt' :
                        device.type === 'Speaker' ? 'volume-up' : 'headphones';
                        
            devicesHTML += `
                <div class="device-item ${device.active ? 'active' : ''}" onclick="window.musicPlayer.selectDevice('${device.id}', '${device.name}')">
                    <div class="device-info">
                        <i class="fas fa-${icon} device-icon"></i>
                        <div class="device-details">
                            <div class="device-name">${device.name}</div>
                            <div class="device-type">${device.type}</div>
                        </div>
                    </div>
                    <div class="device-status">
                        ${device.active ? '<i class="fas fa-check-circle"></i>' : ''}
                    </div>
                </div>
            `;
        });
        
        devicesHTML += `
                </div>
                <div class="device-footer">
                    <button class="refresh-devices" onclick="window.musicPlayer.refreshDevices()">
                        <i class="fas fa-sync-alt"></i> Cihazları Yenile
                    </button>
                </div>
            </div>
        `;
        
        modal.innerHTML = devicesHTML;
        document.body.appendChild(modal);
        
        // Add device modal styles
        if (!document.getElementById('device-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'device-modal-styles';
            style.textContent = `
                .device-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .device-content {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    padding: 20px;
                    border-radius: 15px;
                    width: 400px;
                    color: white;
                }
                
                .device-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    padding-bottom: 10px;
                }
                
                .close-device {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                }
                
                .device-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    margin-bottom: 8px;
                }
                
                .device-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .device-item.active {
                    background: rgba(78, 205, 196, 0.2);
                    border: 1px solid #4ecdc4;
                }
                
                .device-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .device-icon {
                    font-size: 20px;
                    color: #4ecdc4;
                    width: 30px;
                }
                
                .device-name {
                    font-weight: 600;
                    font-size: 14px;
                }
                
                .device-type {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .device-status i {
                    color: #4ecdc4;
                    font-size: 18px;
                }
                
                .device-footer {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .refresh-devices {
                    background: rgba(78, 205, 196, 0.2);
                    border: 1px solid #4ecdc4;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    selectDevice(deviceId, deviceName) {
        // Simulate device selection
        document.querySelectorAll('.device-item').forEach(item => {
            item.classList.remove('active');
        });
        
        event.target.closest('.device-item').classList.add('active');
        this.showNotification(`${deviceName} seçildi`, 'success');
        
        setTimeout(() => {
            document.getElementById('device-modal')?.remove();
        }, 1000);
    }
    
    refreshDevices() {
        this.showNotification('Cihazlar yenileniyor...');
        
        // Simulate refresh
        setTimeout(() => {
            this.showNotification('Cihazlar yenilendi', 'success');
        }, 1500);
    }
    
    toggleEqualizer() {
        // Simple equalizer simulation
        const isActive = this.equalizerBtn?.classList.contains('active');
        
        if (isActive) {
            this.equalizerBtn?.classList.remove('active');
            this.showNotification('Ekolayzır kapatıldı');
            // Reset audio filters
            if (this.audio) {
                this.audio.playbackRate = 1.0;
            }
        } else {
            this.equalizerBtn?.classList.add('active');
            this.showNotification('Ekolayzır açıldı');
            // Apply some basic audio enhancement
            if (this.audio) {
                this.audio.playbackRate = 1.0; // Keep normal speed but we could add filters here
            }
        }
    }
    
    showLyrics() {
        // Create lyrics modal
        const currentTrack = this.playlist[this.currentTrackIndex];
        if (!currentTrack) {
            this.showNotification('Önce bir şarkı seçin');
            return;
        }
        
        // Sample lyrics
        const lyrics = `
🎵 ${currentTrack.title} - ${currentTrack.artist} 🎵

[Verse 1]
Bu bir örnek şarkı sözü
Gerçek API'dan gelecek
Müzik dinlerken keyif alın
Her şey çok güzel olacak

[Chorus]  
La la la la la
Müzik hayatımız
La la la la la
Şarkılar sevgimiz

[Verse 2]
Spotify API ile
Gerçek sözler gelecek
Last.fm entegrasyonu
Her şeyi mükemmel edecek

[Outro]
🎶 Şarkı bitti 🎶
        `;
        
        this.showLyricsModal(lyrics);
    }
    
    showLyricsModal(lyrics) {
        // Remove existing modal
        const existingModal = document.getElementById('lyrics-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'lyrics-modal';
        modal.className = 'lyrics-modal';
        modal.innerHTML = `
            <div class="lyrics-content">
                <div class="lyrics-header">
                    <h3>Şarkı Sözleri</h3>
                    <button class="close-lyrics" onclick="document.getElementById('lyrics-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="lyrics-text">${lyrics.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add styles if not exists
        if (!document.getElementById('lyrics-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'lyrics-modal-styles';
            style.textContent = `
                .lyrics-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                
                .lyrics-content {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    padding: 20px;
                    border-radius: 15px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow-y: auto;
                    color: white;
                }
                
                .lyrics-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    padding-bottom: 10px;
                }
                
                .close-lyrics {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .close-lyrics:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .lyrics-text {
                    line-height: 1.6;
                    font-size: 14px;
                    white-space: pre-line;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    shareTrack() {
        const currentTrack = this.playlist[this.currentTrackIndex];
        if (!currentTrack) {
            this.showNotification('Önce bir şarkı seçin');
            return;
        }
        
        // Web Share API support
        if (navigator.share) {
            navigator.share({
                title: currentTrack.title,
                text: `${currentTrack.artist} - ${currentTrack.title} şarkısını dinliyorum!`,
                url: window.location.href
            }).then(() => {
                this.showNotification('Şarkı paylaşıldı!', 'success');
            }).catch(() => {
                this.fallbackShare(currentTrack);
            });
        } else {
            this.fallbackShare(currentTrack);
        }
    }
    
    fallbackShare(track) {
        // Fallback share options
        const shareText = `${track.artist} - ${track.title} şarkısını dinliyorum! ${window.location.href}`;
        
        // Create share modal
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-content">
                <div class="share-header">
                    <h3>Şarkıyı Paylaş</h3>
                    <button class="close-share" onclick="this.closest('.share-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="share-options">
                    <button class="share-option" onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}', '_blank')">
                        <i class="fab fa-twitter"></i> Twitter
                    </button>
                    <button class="share-option" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}', '_blank')">
                        <i class="fab fa-facebook"></i> Facebook
                    </button>
                    <button class="share-option" onclick="navigator.clipboard.writeText('${shareText}').then(() => { this.textContent = 'Kopyalandı!'; setTimeout(() => this.innerHTML = '<i class=\\'fas fa-copy\\'></i> Linki Kopyala', 2000); })">
                        <i class="fas fa-copy"></i> Linki Kopyala
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add share modal styles
        if (!document.getElementById('share-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'share-modal-styles';
            style.textContent = `
                .share-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .share-content {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    padding: 20px;
                    border-radius: 15px;
                    width: 300px;
                    color: white;
                }
                
                .share-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .close-share {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                }
                
                .share-options {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .share-option {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                }
                
                .share-option:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    pulseArtwork() {
        if (this.trackArtwork) {
            this.trackArtwork.style.animation = 'pulse 0.6s ease';
            setTimeout(() => {
                this.trackArtwork.style.animation = '';
            }, 600);
        }
    }
    
    handleKeyboard(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.setVolume(this.currentVolume + 0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.setVolume(this.currentVolume - 0.1);
                break;
        }
    }
    
    initializeWaveform() {
        if (!this.waveformCanvas || !this.waveformCtx) return;
        
        this.waveformCanvas.width = this.waveformCanvas.offsetWidth;
        this.waveformCanvas.height = this.waveformCanvas.offsetHeight;
        
        this.waveformBars = 50;
        this.waveformBarWidth = this.waveformCanvas.width / this.waveformBars;
        this.animationId = null;
    }
    
    startWaveformAnimation() {
        if (!this.waveformCtx || this.animationId) return;
        
        const animate = () => {
            this.drawWaveform();
            if (this.isPlaying) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    stopWaveformAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.waveformCtx) {
            this.waveformCtx.clearRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);
        }
    }
    
    drawWaveform() {
        if (!this.waveformCtx) return;
        
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;
        
        this.waveformCtx.clearRect(0, 0, width, height);
        
        const time = Date.now() * 0.002;
        
        for (let i = 0; i < this.waveformBars; i++) {
            const barHeight = Math.sin(time + i * 0.2) * height * 0.3 + height * 0.2;
            const x = i * this.waveformBarWidth;
            
            // Gradient
            const gradient = this.waveformCtx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)');
            gradient.addColorStop(0.5, 'rgba(78, 205, 196, 0.8)');
            gradient.addColorStop(1, 'rgba(69, 183, 209, 0.8)');
            
            this.waveformCtx.fillStyle = gradient;
            this.waveformCtx.fillRect(x, height - barHeight, this.waveformBarWidth - 1, barHeight);
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    showNotification(message, type = 'info') {
        // Create notification if it doesn't exist
        let notification = document.getElementById('player-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'player-notification';
            notification.className = 'player-notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `player-notification ${type} show`;
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Public methods for external control
    loadPlaylist(playlist) {
        this.playlist = playlist;
        if (playlist.length > 0) {
            this.loadTrack(0);
        }
    }
    
    playTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrackIndex = index;
            this.loadTrack(index);
            this.audio?.play();
        }
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.musicPlayer = new MusicPlayer();
    
    // Add notification styles
    if (!document.getElementById('player-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'player-notification-styles';
        style.textContent = `
            .player-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .player-notification.show {
                transform: translateX(0);
            }
            
            .player-notification.error {
                background: rgba(220, 53, 69, 0.9);
            }
            
            .player-notification.success {
                background: rgba(40, 167, 69, 0.9);
            }
        `;
        document.head.appendChild(style);
    }
});

// Pulse animation for artwork
const pulseKeyframes = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;

if (!document.getElementById('pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'pulse-animation';
    style.textContent = pulseKeyframes;
    document.head.appendChild(style);
}