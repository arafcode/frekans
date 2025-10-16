// Profesyonel Müzik Çalar - Spotify Benzeri Sistem

// Global değişkenler
let audioPlayer = null;
let audioContext = null;
let currentTrackIndex = 0;
let isPlaying = false;
let currentPlaylist = [];
let originalPlaylist = [];
let isShuffled = false;
let isRepeating = false;
let currentVolume = 0.7;
let isMuted = false;
let previousVolume = 0.7;
let likedTracks = JSON.parse(localStorage.getItem('likedTracks')) || [];

// Global değişkenleri window objesine ekle ki player.js erişebilsin
window.currentPlaylist = currentPlaylist;
window.currentTrackIndex = currentTrackIndex;

// Equalizer değişkenleri
let equalizerFilters = [];
let sourceNode = null;
let gainNode = null;
let isEqualizerEnabled = false;

// Crossfade değişkenleri
let crossfadeDuration = 3.0; // saniye
let isGaplessEnabled = true;
let isAutoCrossfadeEnabled = false;
let nextTrackBuffer = null;

// Visualizer değişkenleri
let analyser = null;
let dataArray = null;
let bufferLength = null;
let visualizerCanvas = null;
let visualizerCtx = null;
let visualizerStyle = 'bars';
let visualizerSensitivity = 1.0;
let visualizerSmoothing = 0.8;
let visualizerColorScheme = 'spotify';
let animationId = null;

// Advanced Audio Controls değişkenleri
let pitchShift = 0; // semitones
let playbackSpeed = 1.0;
let audioEffects = {
    reverb: { enabled: false, amount: 0.3 },
    echo: { enabled: false, amount: 0.2 },
    distortion: { enabled: false, amount: 0.1 },
    bassBoost: { enabled: false, amount: 0.4 }
};
let audioSettings = {
    monoMode: false,
    normalize: false,
    spatialAudio: false,
    bitDepth: 24
};

// AI Recommendations değişkenleri
let aiLearningEnabled = true;
let userBehaviorData = {
    listeningHistory: [],
    genrePreferences: {},
    moodHistory: [],
    skipPatterns: [],
    likedTracks: [],
    playTimes: {},
    searchHistory: []
};
let aiRecommendations = {
    discover: [],
    mood: {},
    similar: [],
    trending: []
};
let currentMood = null;
let aiApiKeys = {
    spotify: null, // Spotify Web API key
    lastfm: null,  // Last.fm API key
    openai: null   // OpenAI API key for advanced recommendations
};
let playHistory = JSON.parse(localStorage.getItem('playHistory')) || [];
let currentOscillator = null;

// Demo ses dosyaları - Çalışan demo müzikler
const sampleTracks = [
    {
        id: 1,
        name: "Demo Şarkı 1",
        artist: "Demo Sanatçı",
        duration: "0:30",
        durationSeconds: 30,
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
        audioUrl: ""  // Boş bırakıyoruz, yerel demo ses dosyası olacak
    },
    {
        id: 2,
        name: "Demo Şarkı 2", 
        artist: "Demo Sanatçı",
        duration: "0:30",
        durationSeconds: 30,
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=center",
        audioUrl: ""
    },
    {
        id: 3,
        name: "Demo Şarkı 3",
        artist: "Demo Sanatçı", 
        duration: "0:30",
        durationSeconds: 30,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center",
        audioUrl: ""
    },
    {
        id: 4,
        name: "Demo Şarkı 4",
        artist: "Demo Sanatçı",
        duration: "0:30", 
        durationSeconds: 30,
        image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop&crop=center",
        audioUrl: ""
    },
    {
        id: 5,
        name: "Demo Şarkı 5",
        artist: "Demo Sanatçı",
        duration: "0:30",
        durationSeconds: 30,
        image: "https://images.unsplash.com/photo-1461784180009-21f109c2237a?w=300&h=300&fit=crop&crop=center",
        audioUrl: ""
    },
    {
        id: 6,
        name: "Demo Şarkı 6", 
        artist: "Demo Sanatçı",
        duration: "0:30",
        durationSeconds: 30,
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop&crop=center",
        audioUrl: ""
    }
];

// Örnek Albümler
const sampleAlbums = [
    {
        id: 1,
        name: "A Night at the Opera",
        artist: "Queen",
        trackCount: 12,
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center"
    },
    {
        id: 2,
        name: "Hotel California",
        artist: "Eagles", 
        trackCount: 9,
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=center"
    },
    {
        id: 3,
        name: "Led Zeppelin IV",
        artist: "Led Zeppelin",
        trackCount: 8,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center"
    },
    {
        id: 4,
        name: "Imagine",
        artist: "John Lennon",
        trackCount: 10,
        image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop&crop=center"
    }
];

// Sayfa yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // Test için varsayılan kullanıcı oluşturma devre dışı - login zorunlu
    // createDefaultUserIfNeeded();
    
    checkUserSession();
    initializePlayer();
    loadTracks();
    loadAlbums();
    setupPlayerControls();
    setupVolumeControl();
    updateLikedTracksUI();
    setupUserMenu();
});

// Runtime enforcement: ensure theme class is present after all stylesheets
(function ensureThemeApplied() {
    function applyTheme() {
        try {
            if (document && document.body) {
                // remove and re-add to force style recalculation
                document.body.classList.remove('theme-apple-squid-glass');
                // small timeout ensures last-run after other scripts/styles
                setTimeout(function() { document.body.classList.add('theme-apple-squid-glass'); }, 30);
            }
        } catch (e) {
            console.warn('Theme apply error', e);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        applyTheme();
    } else {
        document.addEventListener('DOMContentLoaded', applyTheme);
        window.addEventListener('load', applyTheme);
    }
})();

// Test için varsayılan kullanıcı oluştur
function createDefaultUserIfNeeded() {
    const currentUser = localStorage.getItem('currentUser');
    const rememberUser = localStorage.getItem('rememberUser');
    
    if (!currentUser && rememberUser !== 'true') {
        // Varsayılan kullanıcı oluştur
        const defaultUser = {
            name: 'Demo Kullanıcı',
            username: 'demo_user',
            email: 'demo@muziksite.com',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces',
            joinDate: new Date().toISOString(),
            id: 1
        };
        
        localStorage.setItem('currentUser', JSON.stringify(defaultUser));
        sessionStorage.setItem('currentUser', JSON.stringify(defaultUser));
        localStorage.setItem('rememberUser', 'true');
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
        console.log('Demo kullanıcı oluşturuldu ve oturum açıldı');
    }
}

// Kullanıcı oturumu kontrolü
function checkUserSession() {
    // Login sayfasındaysa kontrol yapma
    if (window.location.pathname.includes('login.html')) {
        return true;
    }
    
    try {
        const currentUser = localStorage.getItem('currentUser');
        const rememberUser = localStorage.getItem('rememberUser');
        const sessionUser = sessionStorage.getItem('currentUser');
        
        // Eğer herhangi bir oturum varsa devam et
        if (currentUser || sessionUser) {
            let user = null;
            
            if (currentUser) {
                user = JSON.parse(currentUser);
            } else if (sessionUser) {
                user = JSON.parse(sessionUser);
            }
            
            if (user) {
                updateUserInfo(user);
            }
            return true;
        }
        
        // Beni hatırla işaretliyse ama currentUser yoksa yine login'e yönlendir
        // Hiç oturum yoksa login'e yönlendir
        console.log('Oturum bulunamadı, login sayfasına yönlendiriliyor...');
        window.location.href = 'login.html';
        return false;
        
    } catch (error) {
        console.error('Session kontrol hatası:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// Kullanıcı bilgilerini güncelleme
function updateUserInfo(user) {
    const userNameElements = document.querySelectorAll('.user-name');
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    
    userNameElements.forEach(element => {
        const displayName = user.name || user.username || user.email || 'Kullanıcı';
        element.textContent = `Merhaba, ${displayName}!`;
    });
    
    userAvatarElements.forEach(element => {
        element.src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces';
    });
    
    // Kullanıcı butonunu güncelle
    const userBtn = document.getElementById('userMenuBtn');
    if (userBtn && user.name) {
        userBtn.title = `${user.name} - Menüyü aç`;
    }
}

// Player'ı başlat
function initializePlayer() {
    // Audio element oluştur
    audioPlayer = document.getElementById('audio-player');
    if (!audioPlayer) {
        audioPlayer = document.createElement('audio');
        audioPlayer.id = 'audio-player';
        audioPlayer.preload = 'metadata';
        document.body.appendChild(audioPlayer);
    }
    
    // Playlist'i başlat
    originalPlaylist = [...sampleTracks];
    currentPlaylist = [...originalPlaylist];
    window.currentPlaylist = currentPlaylist;
    
    // Audio event listeners
    setupAudioEventListeners();
    
    // Ses seviyesini ayarla
    audioPlayer.volume = currentVolume;
    
    // İlk şarkıyı yükle (çalmadan)
    if (currentPlaylist.length > 0) {
        loadTrack(currentTrackIndex, false);
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
}

// Audio event listeners kurulumu
function setupAudioEventListeners() {
    audioPlayer.addEventListener('loadstart', () => {
        showLoadingState();
    });
    
    audioPlayer.addEventListener('canplay', () => {
        hideLoadingState();
    });
    
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', handleTrackEnd);
    audioPlayer.addEventListener('error', handleAudioError);
    
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton(true);
        updateMediaSession();
    });
    
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton(false);
    });
    
    audioPlayer.addEventListener('volumechange', () => {
        // AI: Ses seviyesi değişikliğini kaydet
        trackUserBehavior('volume_change', {
            newVolume: audioPlayer.volume,
            volumePercentage: audioPlayer.volume * 100,
            isMuted: audioPlayer.muted,
            timestamp: Date.now()
        });
        
        updateVolumeUI();
    });
}

// Player kontrolleri kurulumu
function setupPlayerControls() {
    // Ana çalma kontrolleri
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const likeBtn = document.getElementById('like-btn');
    
    if (playBtn) {
        playBtn.addEventListener('click', togglePlayPause);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', previousTrack);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextTrack);
    }
    
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', toggleShuffle);
    }
    
    if (repeatBtn) {
        repeatBtn.addEventListener('click', toggleRepeat);
    }
    
    if (likeBtn) {
        likeBtn.addEventListener('click', toggleCurrentTrackLike);
    }
    
    // Progress bar kontrolü
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    
    if (progressContainer) {
        progressContainer.addEventListener('click', seekTo);
    }
    
    if (progressBar) {
        progressBar.addEventListener('input', seekTo);
    }
    
    // Equalizer butonu
    const equalizerBtn = document.getElementById('equalizer-btn');
    if (equalizerBtn) {
        equalizerBtn.addEventListener('click', toggleEqualizer);
    }
    
    // Crossfade butonu
    const crossfadeBtn = document.getElementById('crossfade-btn');
    if (crossfadeBtn) {
        crossfadeBtn.addEventListener('click', toggleCrossfadePanel);
    }
    
    // Visualizer butonu
    const visualizerBtn = document.getElementById('visualizer-btn');
    if (visualizerBtn) {
        visualizerBtn.addEventListener('click', toggleVisualizerPanel);
    }
    
    // Advanced Controls butonu
    const advancedControlsBtn = document.getElementById('advanced-controls-btn');
    if (advancedControlsBtn) {
        advancedControlsBtn.addEventListener('click', toggleAdvancedControlsPanel);
    }
    
    // AI Recommendations butonu
    const aiRecommendationsBtn = document.getElementById('ai-recommendations-btn');
    if (aiRecommendationsBtn) {
        aiRecommendationsBtn.addEventListener('click', toggleAIRecommendationsPanel);
    }
}

// Ses kontrolü kurulumu
function setupVolumeControl() {
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    if (volumeBtn) {
        volumeBtn.addEventListener('click', toggleMute);
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', changeVolume);
        volumeSlider.value = currentVolume * 100;
    }
}

// Klavye kısayolları
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Space bar - Oynat/Durdur
        if (e.code === 'Space' && !isInputFocused()) {
            e.preventDefault();
            togglePlayPause();
        }
        
        // Arrow keys - İleri/Geri
        if (e.code === 'ArrowLeft' && e.ctrlKey) {
            e.preventDefault();
            previousTrack();
        }
        
        if (e.code === 'ArrowRight' && e.ctrlKey) {
            e.preventDefault();
            nextTrack();
        }
        
        // Ses kontrolleri
        if (e.code === 'ArrowUp' && e.ctrlKey) {
            e.preventDefault();
            changeVolume({ target: { value: Math.min(100, currentVolume * 100 + 10) } });
        }
        
        if (e.code === 'ArrowDown' && e.ctrlKey) {
            e.preventDefault();
            changeVolume({ target: { value: Math.max(0, currentVolume * 100 - 10) } });
        }
        
        // Mute
        if (e.code === 'KeyM' && e.ctrlKey) {
            e.preventDefault();
            toggleMute();
        }
    });
}

// Input alanında mı kontrol et
function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.isContentEditable
    );
}

// Demo ses dosyası oluştur
function createDemoAudio() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 30; // 30 saniye
    const frameCount = sampleRate * duration;
    
    const arrayBuffer = audioContext.createBuffer(2, frameCount, sampleRate);
    
    // Basit melodi oluştur
    for (let channel = 0; channel < arrayBuffer.numberOfChannels; channel++) {
        const nowBuffering = arrayBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Basit sinüs dalgası ile melodi
            const frequency = 440 + Math.sin(i / 8000) * 100; // 440Hz base + modulation
            nowBuffering[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1;
        }
    }
    
    return arrayBuffer;
}

// Şarkı yükleme
function loadTrack(index, autoplay = false) {
    const track = currentPlaylist[index];
    if (!track) return;
    
    currentTrackIndex = index;
    window.currentTrackIndex = currentTrackIndex;
    
    // AI: Şarkı yükleme davranışını kaydet
    trackUserBehavior('song_load', {
        trackId: track.id,
        trackName: track.name,
        artist: track.artist,
        album: track.album,
        genre: track.genre,
        loadSource: autoplay ? 'auto_next' : 'manual_select',
        playlistPosition: index,
        playlistSize: currentPlaylist.length,
        timestamp: Date.now()
    });
    
    // UI güncellemeleri
    updateCurrentTrackInfo(track);
    updateActiveTrack();
    
    // Demo ses dosyası kullan
    if (!track.audioUrl) {
        // AudioContext kullanarak demo ses oluştur
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                if (autoplay) {
                    // Basit beep sesi çal
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = 440; // A4 note
                    gainNode.gain.value = 0.1;
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 1);
                    
                    isPlaying = true;
                    updatePlayButton(true);
                    
                    // 1 saniye sonra durdur
                    setTimeout(() => {
                        isPlaying = false;
                        updatePlayButton(false);
                        showNotification(`"${track.name}" demo olarak çalındı`, 'info');
                    }, 1000);
                } else {
                    // Demo şarkı yüklendi bildirimi kaldırıldı
                    console.log('Demo şarkı yüklendi - Çalmak için play butonuna basın');
                }
            } catch (error) {
                console.error('AudioContext error:', error);
                showNotification('Demo ses oluşturulamadı', 'error');
            }
        } else {
            showNotification('Tarayıcınız ses desteği sağlamıyor', 'error');
        }
    } else {
        // Normal ses dosyası yükle
        if (audioPlayer.src !== track.audioUrl) {
            audioPlayer.src = track.audioUrl;
            audioPlayer.load();
        }
        
        if (autoplay) {
            play();
        }
    }
    
    // Geçmişe ekle
    addToHistory(track);
}

// Mevcut şarkı bilgilerini güncelle
function updateCurrentTrackInfo(track) {
    const elements = {
        title: document.getElementById('current-track-title'),
        artist: document.getElementById('current-track-artist'),
        image: document.getElementById('current-track-image'),
        duration: document.getElementById('track-duration')
    };
    
    if (elements.title) elements.title.textContent = track.name;
    if (elements.artist) elements.artist.textContent = track.artist;
    if (elements.image) elements.image.src = track.image;
    if (elements.duration) elements.duration.textContent = track.duration;
    
    // Beğeni durumunu güncelle
    updateLikeButtonState(track.id);
}

// Oynat/Durdur toggle
function togglePlayPause() {
    if (!audioPlayer.src) {
        if (currentPlaylist.length > 0) {
            loadTrack(currentTrackIndex, true);
        }
        return;
    }

    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

// Oynat
function play() {
    const track = currentPlaylist[currentTrackIndex];
    if (!track) return;
    
    // AI: Şarkı başlatma davranışını kaydet
    trackUserBehavior('song_play', {
        trackId: track.id,
        trackName: track.name,
        artist: track.artist,
        playTime: audioPlayer ? audioPlayer.currentTime : 0,
        playSource: 'play_button',
        timestamp: Date.now()
    });
    
    if (!track.audioUrl) {
        // Demo ses çal
        playDemoSound();
    } else if (audioPlayer.src) {
        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayButton(true);
        }).catch(error => {
            console.error('Play error:', error);
            isPlaying = false;
            updatePlayButton(false);
            showNotification('Ses çalınamadı', 'error');
        });
    }
}

// Demo ses çal
function playDemoSound() {
    // Önceki sesi durdur
    stopDemoSound();
    
    if (window.AudioContext || window.webkitAudioContext) {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            currentOscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            currentOscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            currentOscillator.frequency.value = 440; // A4 note
            gainNode.gain.value = 0.1;
            
            isPlaying = true;
            updatePlayButton(true);
            
            currentOscillator.start();
            
            // 2 saniye sonra otomatik durdur
            setTimeout(() => {
                stopDemoSound();
            }, 2000);
            
        } catch (error) {
            console.error('Demo sound error:', error);
            isPlaying = false;
            updatePlayButton(false);
            showNotification('Demo ses çalınamadı', 'error');
        }
    } else {
        // Fallback: Sadece UI'yı güncelle
        isPlaying = true;
        updatePlayButton(true);
        
        setTimeout(() => {
            isPlaying = false;
            updatePlayButton(false);
        }, 2000);
    }
}

// Demo sesi durdur
function stopDemoSound() {
    if (currentOscillator) {
        try {
            currentOscillator.stop();
            currentOscillator.disconnect();
            currentOscillator = null;
        } catch (error) {
            console.log('Oscillator stop error:', error);
        }
    }
    
    isPlaying = false;
    updatePlayButton(false);
}

// Durdur
function pause() {
    const track = currentPlaylist[currentTrackIndex];
    
    // AI: Şarkı durdurma davranışını kaydet
    if (track) {
        trackUserBehavior('song_pause', {
            trackId: track.id,
            trackName: track.name,
            artist: track.artist,
            pauseTime: audioPlayer ? audioPlayer.currentTime : 0,
            pauseSource: 'pause_button',
            timestamp: Date.now()
        });
    }
    
    // Demo sesi durdur
    stopDemoSound();
    
    // Normal audio durdur
    if (audioPlayer && audioPlayer.src) {
        audioPlayer.pause();
    }
    
    isPlaying = false;
    updatePlayButton(false);
}

// Sonraki şarkı
function nextTrack() {
    const currentTrack = currentPlaylist[currentTrackIndex];
    
    // AI: Şarkı atlama davranışını kaydet (eğer şarkı tam bitmemişse)
    if (currentTrack && audioPlayer && audioPlayer.currentTime < audioPlayer.duration - 5) {
        trackUserBehavior('song_skip', {
            trackId: currentTrack.id,
            trackName: currentTrack.name,
            artist: currentTrack.artist,
            skipTime: audioPlayer.currentTime,
            totalDuration: audioPlayer.duration,
            skipPercentage: (audioPlayer.currentTime / audioPlayer.duration) * 100,
            reason: 'next_button',
            timestamp: Date.now()
        });
    }
    
    let nextIndex;
    
    if (isShuffled) {
        // Karışık modda rastgele şarkı seç
        do {
            nextIndex = Math.floor(Math.random() * currentPlaylist.length);
        } while (nextIndex === currentTrackIndex && currentPlaylist.length > 1);
    } else {
        nextIndex = currentTrackIndex + 1;
        if (nextIndex >= currentPlaylist.length) {
            nextIndex = 0; // Başa dön
        }
    }
    
    loadTrack(nextIndex, isPlaying);
}

// Önceki şarkı
function previousTrack() {
    const currentTrack = currentPlaylist[currentTrackIndex];
    
    // Şarkının başındaysak önceki şarkıya geç, yoksa başa sar
    if (audioPlayer.currentTime > 3) {
        // AI: Şarkının başa sarılması davranışını kaydet
        if (currentTrack) {
            trackUserBehavior('song_restart', {
                trackId: currentTrack.id,
                trackName: currentTrack.name,
                artist: currentTrack.artist,
                restartTime: audioPlayer.currentTime,
                reason: 'previous_button',
                timestamp: Date.now()
            });
        }
        audioPlayer.currentTime = 0;
        return;
    }
    
    // AI: Önceki şarkıya geçme davranışını kaydet
    if (currentTrack) {
        trackUserBehavior('song_skip', {
            trackId: currentTrack.id,
            trackName: currentTrack.name,
            artist: currentTrack.artist,
            skipTime: audioPlayer.currentTime,
            totalDuration: audioPlayer.duration,
            skipPercentage: (audioPlayer.currentTime / audioPlayer.duration) * 100,
            reason: 'previous_button',
            timestamp: Date.now()
        });
    }
    
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
        prevIndex = currentPlaylist.length - 1; // Sona git
    }
    
    loadTrack(prevIndex, isPlaying);
}

// Şarkı bitince çalışacak
function handleTrackEnd() {
    const currentTrack = currentPlaylist[currentTrackIndex];
    
    // AI: Şarkı tamamlama davranışını kaydet
    if (currentTrack) {
        trackUserBehavior('song_complete', {
            trackId: currentTrack.id,
            trackName: currentTrack.name,
            artist: currentTrack.artist,
            album: currentTrack.album,
            genre: currentTrack.genre,
            completionPercentage: 100,
            totalDuration: audioPlayer.duration,
            listenTime: audioPlayer.duration,
            completionType: 'natural_end',
            timestamp: Date.now()
        });
    }
    
    if (isRepeating) {
        // Aynı şarkıyı tekrar çal
        audioPlayer.currentTime = 0;
        play();
    } else {
        // Sonraki şarkıya geç
        nextTrack();
    }
}

// Karışık modu toggle
function toggleShuffle() {
    isShuffled = !isShuffled;
    
    // AI: Karışık çalma davranışını kaydet
    trackUserBehavior('playback_mode_change', {
        mode: 'shuffle',
        enabled: isShuffled,
        playlistSize: currentPlaylist.length,
        currentTrack: currentPlaylist[currentTrackIndex]?.name,
        timestamp: Date.now()
    });
    
    const shuffleBtn = document.getElementById('shuffle-btn');
    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', isShuffled);
        shuffleBtn.innerHTML = isShuffled ? 
            '<i class="fas fa-random active"></i>' : 
            '<i class="fas fa-random"></i>';
    }
    
    if (isShuffled) {
        shufflePlaylist();
        showNotification('Karışık çalma açık', 'success');
    } else {
        restoreOriginalPlaylist();
        showNotification('Karışık çalma kapalı', 'info');
    }
}

// Playlist'i karıştır
function shufflePlaylist() {
    const currentTrack = currentPlaylist[currentTrackIndex];
    const shuffledPlaylist = [...originalPlaylist];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
    }
    
    currentPlaylist = shuffledPlaylist;
    window.currentPlaylist = currentPlaylist;
    
    // Mevcut şarkının yeni index'ini bul
    currentTrackIndex = currentPlaylist.findIndex(track => track.id === currentTrack.id);
    window.currentTrackIndex = currentTrackIndex;
}

// Orijinal playlist'e dön
function restoreOriginalPlaylist() {
    const currentTrack = currentPlaylist[currentTrackIndex];
    currentPlaylist = [...originalPlaylist];
    window.currentPlaylist = currentPlaylist;
    
    // Mevcut şarkının orijinal index'ini bul
    currentTrackIndex = currentPlaylist.findIndex(track => track.id === currentTrack.id);
    window.currentTrackIndex = currentTrackIndex;
}

// Tekrar modu toggle
function toggleRepeat() {
    isRepeating = !isRepeating;
    
    // AI: Tekrar çalma davranışını kaydet
    trackUserBehavior('playback_mode_change', {
        mode: 'repeat',
        enabled: isRepeating,
        currentTrack: currentPlaylist[currentTrackIndex]?.name,
        timestamp: Date.now()
    });
    
    const repeatBtn = document.getElementById('repeat-btn');
    if (repeatBtn) {
        repeatBtn.classList.toggle('active', isRepeating);
        repeatBtn.innerHTML = isRepeating ? 
            '<i class="fas fa-redo active"></i>' : 
            '<i class="fas fa-redo"></i>';
    }
    
    showNotification(
        isRepeating ? 'Tekrar açık' : 'Tekrar kapalı', 
        isRepeating ? 'success' : 'info'
    );
}

// Beğenme toggle
function toggleCurrentTrackLike() {
    const currentTrack = currentPlaylist[currentTrackIndex];
    if (!currentTrack) return;
    
    toggleLike(currentTrack.id);
}

function toggleLike(trackId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const track = sampleTracks.find(t => t.id === trackId);
    if (!track) return;
    
    const index = likedTracks.indexOf(trackId);
    const isLiking = index === -1;
    
    // AI: Beğeni davranışını kaydet
    trackUserBehavior(isLiking ? 'song_like' : 'song_unlike', {
        trackId: track.id,
        trackName: track.name,
        artist: track.artist,
        album: track.album,
        genre: track.genre,
        action: isLiking ? 'like' : 'unlike',
        likeSource: trackId === currentPlaylist[currentTrackIndex]?.id ? 'current_playing' : 'track_list',
        totalLikedTracks: isLiking ? likedTracks.length + 1 : likedTracks.length - 1,
        timestamp: Date.now()
    });
    
    if (index === -1) {
        // Beğen
        likedTracks.push(trackId);
        showNotification(`"${track.name}" beğenilere eklendi`, 'success');
    } else {
        // Beğeniyi kaldır
        likedTracks.splice(index, 1);
        showNotification(`"${track.name}" beğenilerden çıkarıldı`, 'info');
    }
    
    // Local storage'a kaydet
    localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
    
    // UI güncelle
    updateLikeButtonState(trackId);
    updateLikedTracksUI();
}

// Beğeni buton durumunu güncelle
function updateLikeButtonState(trackId) {
    const isLiked = likedTracks.includes(trackId);
    
    // Ana player beğeni butonu
    const mainLikeBtn = document.getElementById('like-btn');
    if (mainLikeBtn) {
        const icon = mainLikeBtn.querySelector('i');
        if (icon) {
            icon.className = isLiked ? 'fas fa-heart liked' : 'far fa-heart';
        }
        mainLikeBtn.classList.toggle('liked', isLiked);
    }
    
    // Liste içindeki beğeni butonları
    const trackLikeBtns = document.querySelectorAll(`[data-track-id="${trackId}"] .like-btn`);
    trackLikeBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isLiked ? 'fas fa-heart liked' : 'far fa-heart';
        }
        btn.classList.toggle('liked', isLiked);
    });
}

// Ses seviyesi değiştir
function changeVolume(event) {
    const volume = event.target.value / 100;
    currentVolume = volume;
    audioPlayer.volume = volume;
    
    // Mute durumunu güncelle
    if (volume === 0) {
        isMuted = true;
    } else {
        isMuted = false;
        previousVolume = volume;
    }
    
    updateVolumeUI();
}

// Mute toggle
function toggleMute() {
    if (isMuted) {
        // Sesi aç
        currentVolume = previousVolume;
        audioPlayer.volume = currentVolume;
        isMuted = false;
    } else {
        // Sesi kapat
        previousVolume = currentVolume;
        currentVolume = 0;
        audioPlayer.volume = 0;
        isMuted = true;
    }
    
    updateVolumeUI();
}

// Ses UI'sını güncelle
function updateVolumeUI() {
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    if (volumeSlider) {
        volumeSlider.value = currentVolume * 100;
        // CSS değişkenini güncelle
        volumeSlider.style.setProperty('--volume', `${currentVolume * 100}%`);
    }
    
    if (volumeBtn) {
        const icon = volumeBtn.querySelector('i');
        if (icon) {
            if (currentVolume === 0) {
                icon.className = 'fas fa-volume-mute';
            } else if (currentVolume < 0.5) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        }
    }
}

// Progress bar güncelleme
function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const currentTimeElement = document.getElementById('current-time');
    
    if (!audioPlayer.duration) return;
    
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    
    if (progressBar) {
        progressBar.value = progress;
        
        // Progress bar stilini güncelle
        progressBar.style.setProperty('--progress', `${progress}%`);
    }
    
    if (currentTimeElement) {
        currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
    }
}

// Süre güncelleme
function updateDuration() {
    const durationElement = document.getElementById('track-duration');
    
    if (durationElement && audioPlayer.duration) {
        durationElement.textContent = formatTime(audioPlayer.duration);
    }
}

// Zaman formatla
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Progress bar'a tıklayarak zaman atlama
function seekTo(event) {
    if (!audioPlayer.duration) return;
    
    const progressContainer = event.currentTarget;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    
    const oldTime = audioPlayer.currentTime;
    const seekTime = percentage * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
    
    // AI: Şarkı atlama davranışını kaydet
    const currentTrack = currentPlaylist[currentTrackIndex];
    if (currentTrack) {
        trackUserBehavior('song_seek', {
            trackId: currentTrack.id,
            trackName: currentTrack.name,
            artist: currentTrack.artist,
            fromTime: oldTime,
            toTime: seekTime,
            seekPercentage: percentage * 100,
            seekDirection: seekTime > oldTime ? 'forward' : 'backward',
            seekDistance: Math.abs(seekTime - oldTime),
            timestamp: Date.now()
        });
    }
}

// Oynatma butonunu güncelle
function updatePlayButton(playing) {
    const playBtn = document.getElementById('play-btn');
    if (!playBtn) return;
    
    const icon = playBtn.querySelector('i');
    if (icon) {
        icon.className = playing ? 'fas fa-pause' : 'fas fa-play';
    }
    
    // Liste içindeki aktif şarkının play ikonunu güncelle
    updateTrackPlayIcons();
}

// Şarkı listesindeki play ikonlarını güncelle
function updateTrackPlayIcons() {
    const trackItems = document.querySelectorAll('.track-item');
    
    trackItems.forEach((item, index) => {
        const playOverlay = item.querySelector('.play-overlay i');
        if (playOverlay) {
            if (index === currentTrackIndex && isPlaying) {
                playOverlay.className = 'fas fa-pause';
                item.classList.add('playing');
            } else {
                playOverlay.className = 'fas fa-play';
                item.classList.remove('playing');
            }
        }
    });
}

// Aktif şarkıyı işaretle
function updateActiveTrack() {
    const trackItems = document.querySelectorAll('.track-item');
    
    trackItems.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    updateTrackPlayIcons();
}

// Şarkı çalma (liste item'ına tıklayınca)
function playTrack(index, event) {
    if (event) {
        event.stopPropagation();
    }
    
    if (index >= 0 && index < currentPlaylist.length) {
        const track = currentPlaylist[index];
        
        // AI: Şarkı çalma davranışını kaydet
        trackUserBehavior('song_play', {
            trackId: track.id,
            trackName: track.name,
            artist: track.artist,
            genre: track.genre || 'unknown',
            duration: track.duration,
            timestamp: Date.now(),
            playSource: 'playlist_click',
            previousTrack: currentTrackIndex >= 0 ? currentPlaylist[currentTrackIndex]?.id : null
        });
        
        loadTrack(index, true);
    }
}

// Albüm çalma
function playAlbum(albumId) {
    // Bu örnekte tüm şarkıları çalıyoruz
    // Gerçek uygulamada albüme göre şarkıları filtreleyebilirsiniz
    currentPlaylist = [...originalPlaylist];
    currentTrackIndex = 0;
    window.currentTrackIndex = currentTrackIndex;
    loadTrack(0, true);
    
    showNotification('Albüm çalmaya başlandı', 'success');
}

// Şarkı listesini yükle ve göster
function loadTracks() {
    const trackList = document.getElementById('track-list');
    if (!trackList) return;

    trackList.innerHTML = sampleTracks.map((track, index) => `
        <div class="track-item ${index === currentTrackIndex ? 'active' : ''}" 
             data-track-id="${track.id}" 
             onclick="playTrack(${index}, event)">
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
                <div class="track-image">
                    <img src="${track.image}" alt="${track.name}">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="track-details">
                    <h4>${track.name}</h4>
                    <p>${track.artist}</p>
                </div>
            </div>
            <div class="track-duration">${track.duration}</div>
            <div class="track-actions">
                <button class="like-btn ${likedTracks.includes(track.id) ? 'liked' : ''}" 
                        onclick="toggleLike(${track.id}, event)">
                    <i class="${likedTracks.includes(track.id) ? 'fas fa-heart liked' : 'far fa-heart'}"></i>
                </button>
                <button class="more-btn" onclick="showTrackMenu(${track.id}, event)">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    updateActiveTrack();
}

// Albümleri yükle ve göster
function loadAlbums() {
    const albumGrid = document.getElementById('album-grid');
    if (!albumGrid) return;

    albumGrid.innerHTML = sampleAlbums.map(album => `
        <div class="album-card" onclick="playAlbum(${album.id})">
            <div class="album-image">
                <img src="${album.image}" alt="${album.name}">
                <div class="play-overlay">
                    <button class="play-btn">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
            <div class="album-info">
                <h3>${album.name}</h3>
                <p>${album.artist}</p>
                <span class="track-count">${album.trackCount} şarkı</span>
            </div>
        </div>
    `).join('');
}

// Beğenilen şarkılar UI'sını güncelle
function updateLikedTracksUI() {
    const likedCount = document.getElementById('liked-count');
    if (likedCount) {
        likedCount.textContent = likedTracks.length;
    }
}

// Şarkı menüsünü göster
function showTrackMenu(trackId, event) {
    event.stopPropagation();
    
    // Basit context menu (geliştirilmeye açık)
    const track = sampleTracks.find(t => t.id === trackId);
    if (!track) return;
    
    const options = [
        'Çalma listesine ekle',
        'Paylaş',
        'Sanatçıya git',
        'Albüme git'
    ];
    
    // Örnek alert - gerçek uygulamada dropdown menu kullanılmalı
    const choice = prompt(`"${track.name}" için seçenekler:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nSeçiminizi girin (1-${options.length}):`);
    
    if (choice) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < options.length) {
            showNotification(`"${options[index]}" özelliği yakında eklenecek`, 'info');
        }
    }
}

// Geçmişe şarkı ekle
function addToHistory(track) {
    const existingIndex = playHistory.findIndex(item => item.id === track.id);
    
    if (existingIndex !== -1) {
        playHistory.splice(existingIndex, 1);
    }
    
    playHistory.unshift({
        ...track,
        playedAt: new Date().toISOString()
    });
    
    // En fazla 50 şarkı tut
    if (playHistory.length > 50) {
        playHistory.splice(50);
    }
    
    localStorage.setItem('playHistory', JSON.stringify(playHistory));
}

// Loading durumunu göster
function showLoadingState() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        const icon = playBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-spinner fa-spin';
        }
    }
}

// Loading durumunu gizle
function hideLoadingState() {
    updatePlayButton(isPlaying);
}

// Media Session API (Chrome, Firefox modern sürümler)
function updateMediaSession() {
    if ('mediaSession' in navigator) {
        const track = currentPlaylist[currentTrackIndex];
        if (!track) return;
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name,
            artist: track.artist,
            album: 'Unknown Album',
            artwork: [
                { src: track.image, sizes: '300x300', type: 'image/jpeg' }
            ]
        });
        
        navigator.mediaSession.setActionHandler('play', play);
        navigator.mediaSession.setActionHandler('pause', pause);
        navigator.mediaSession.setActionHandler('previoustrack', previousTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }
}

// Audio hata yönetimi
function handleAudioError(event) {
    console.error('Audio error:', event);
    
    const error = audioPlayer.error;
    let message = 'Ses dosyası yüklenemedi';
    
    if (error) {
        switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
                message = 'Çalma iptal edildi';
                break;
            case error.MEDIA_ERR_NETWORK:
                message = 'İnternet bağlantı hatası';
                break;
            case error.MEDIA_ERR_DECODE:
                message = 'Ses dosyası bozuk';
                break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                message = 'Ses formatı desteklenmiyor';
                break;
        }
    }
    
    showNotification(message, 'error');
    
    // Çalmayı durdur ve UI'yı güncelle
    isPlaying = false;
    updatePlayButton(false);
    hideLoadingState();
}

// Bildirim gösterme
function showNotification(message, type = 'info') {
    // Basit toast notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00C851' : '#33b5e5'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// CSS animasyonları ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .track-item.playing {
        background: rgba(29, 185, 84, 0.1);
        border-left: 3px solid #1DB954;
    }
    
    .track-item.active {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .like-btn.liked i {
        color: #1DB954 !important;
    }
    
    #play-btn:hover, .player-btn:hover {
        transform: scale(1.05);
    }
    
    .player-btn.active {
        color: #1DB954;
    }
    
    #progress-bar {
        --progress: 0%;
        background: linear-gradient(to right, #1DB954 var(--progress), rgba(255,255,255,0.3) var(--progress));
    }
`;
document.head.appendChild(style);

// Kullanıcı menü kurulumu
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
        
        // Scroll sırasında dropdown kapat
        window.addEventListener('scroll', function() {
            if (userDropdown.classList.contains('show')) {
                closeUserDropdown();
            }
        }, { passive: true });
        
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

// Arama fonksiyonu
function searchTracks(query) {
    if (!query) return sampleTracks;
    
    const lowerQuery = query.toLowerCase();
    const results = sampleTracks.filter(track => 
        track.name.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery)
    );
    
    // AI: Arama davranışını kaydet
    trackUserBehavior('search_query', {
        query: query,
        queryLength: query.length,
        resultsCount: results.length,
        searchType: 'track_search',
        hasResults: results.length > 0,
        timestamp: Date.now()
    });
    
    return results;
}

// Sayfa navigasyonu
function navigateTo(page) {
    window.location.href = page;
}

// Spotify benzeri özellikler için ekstra fonksiyonlar
function createPlaylist(name, description = '') {
    showNotification('Çalma listesi oluşturma özelliği yakında eklenecek', 'info');
}

function addToQueue(trackId) {
    const track = sampleTracks.find(t => t.id === trackId);
    if (track) {
        showNotification(`"${track.name}" kuyruğa eklendi`, 'success');
    }
}

function shareTrack(trackId) {
    const track = sampleTracks.find(t => t.id === trackId);
    if (track && navigator.share) {
        navigator.share({
            title: track.name,
            text: `${track.name} - ${track.artist} şarkısını dinle!`,
            url: window.location.href
        });
    } else {
        // Fallback olarak URL'yi panoya kopyala
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link panoya kopyalandı', 'success');
    }
}

// EQUALIZER SİSTEMİ

// Equalizer panelini aç/kapat
function toggleEqualizer() {
    const equalizerPanel = document.getElementById('equalizer-panel');
    const equalizerBtn = document.getElementById('equalizer-btn');
    
    if (equalizerPanel) {
        const isVisible = equalizerPanel.classList.contains('show');
        
        if (isVisible) {
            equalizerPanel.classList.remove('show');
            equalizerBtn.classList.remove('active');
        } else {
            equalizerPanel.classList.add('show');
            equalizerBtn.classList.add('active');
            initializeEqualizer();
        }
    }
}

// Equalizer sistemini başlat
function initializeEqualizer() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('AudioContext oluşturulamadı:', error);
            showNotification('Equalizer desteklenmiyor', 'error');
            return;
        }
    }
    
    // Equalizer event listeners
    setupEqualizerControls();
    
    // Varsayılan ayarları yükle
    loadEqualizerSettings();
}

// Equalizer kontrolleri kurulumu
function setupEqualizerControls() {
    // EQ sliderları
    const eqSliders = document.querySelectorAll('.eq-slider');
    eqSliders.forEach(slider => {
        slider.addEventListener('input', updateEqualizerBand);
    });
    
    // Pre-amp slider
    const preampSlider = document.getElementById('eq-preamp');
    if (preampSlider) {
        preampSlider.addEventListener('input', updatePreamp);
    }
    
    // Preset butonları
    const presetButtons = document.querySelectorAll('.eq-preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', applyEqualizerPreset);
    });
    
    // Reset butonu
    const resetBtn = document.getElementById('eq-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetEqualizer);
    }
    
    // Kapat butonu
    const closeBtn = document.getElementById('eq-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('equalizer-panel').classList.remove('show');
            document.getElementById('equalizer-btn').classList.remove('active');
        });
    }
}

// Equalizer bandını güncelle
function updateEqualizerBand(event) {
    const slider = event.target;
    const frequency = parseInt(slider.dataset.frequency);
    const gain = parseFloat(slider.value);
    
    // Değeri görüntüle
    const valueSpan = slider.parentElement.querySelector('.eq-value');
    if (valueSpan) {
        valueSpan.textContent = `${gain > 0 ? '+' : ''}${gain}dB`;
    }
    
    // Web Audio API filter uygulaması (demo için)
    console.log(`EQ Band ${frequency}Hz: ${gain}dB`);
    
    // Ayarları kaydet
    saveEqualizerSettings();
}

// Pre-amp ayarı
function updatePreamp(event) {
    const gain = parseFloat(event.target.value);
    const valueSpan = document.querySelector('.eq-preamp-value');
    if (valueSpan) {
        valueSpan.textContent = `${gain > 0 ? '+' : ''}${gain}dB`;
    }
    
    console.log(`Pre-Amp: ${gain}dB`);
    saveEqualizerSettings();
}

// Equalizer preset'leri
function applyEqualizerPreset(event) {
    const presetName = event.target.dataset.preset;
    
    // Tüm butonlardan active sınıfını kaldır
    document.querySelectorAll('.eq-preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tıklanan butona active ekle
    event.target.classList.add('active');
    
    const presets = {
        flat: [0, 0, 0, 0, 0, 0],
        rock: [4, 3, -1, 2, 4, 3],
        pop: [2, 4, 2, -1, -2, 2],
        jazz: [3, 2, -2, 2, 4, 3],
        'bass-boost': [6, 4, 2, 0, -2, 0]
    };
    
    const values = presets[presetName] || [0, 0, 0, 0, 0, 0];
    const sliders = document.querySelectorAll('.eq-slider');
    
    sliders.forEach((slider, index) => {
        if (values[index] !== undefined) {
            slider.value = values[index];
            const event = { target: slider };
            updateEqualizerBand(event);
        }
    });
    
    showNotification(`${presetName.toUpperCase()} preset uygulandı`, 'success');
}

// Equalizer sıfırlama
function resetEqualizer() {
    const sliders = document.querySelectorAll('.eq-slider');
    sliders.forEach(slider => {
        slider.value = 0;
        const event = { target: slider };
        updateEqualizerBand(event);
    });
    
    const preampSlider = document.getElementById('eq-preamp');
    if (preampSlider) {
        preampSlider.value = 0;
        updatePreamp({ target: preampSlider });
    }
    
    // Flat preset'i aktif yap
    document.querySelectorAll('.eq-preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-preset="flat"]').classList.add('active');
    
    showNotification('Equalizer sıfırlandı', 'success');
}

// Equalizer ayarlarını kaydet
function saveEqualizerSettings() {
    const settings = {
        bands: {},
        preamp: 0
    };
    
    // Band değerlerini topla
    document.querySelectorAll('.eq-slider').forEach(slider => {
        const frequency = slider.dataset.frequency;
        settings.bands[frequency] = parseFloat(slider.value);
    });
    
    // Pre-amp değeri
    const preampSlider = document.getElementById('eq-preamp');
    if (preampSlider) {
        settings.preamp = parseFloat(preampSlider.value);
    }
    
    localStorage.setItem('equalizerSettings', JSON.stringify(settings));
}

// Equalizer ayarlarını yükle
function loadEqualizerSettings() {
    const savedSettings = localStorage.getItem('equalizerSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Band değerlerini uygula
            Object.keys(settings.bands).forEach(frequency => {
                const slider = document.querySelector(`[data-frequency="${frequency}"]`);
                if (slider) {
                    slider.value = settings.bands[frequency];
                    const event = { target: slider };
                    updateEqualizerBand(event);
                }
            });
            
            // Pre-amp değerini uygula
            const preampSlider = document.getElementById('eq-preamp');
            if (preampSlider && settings.preamp !== undefined) {
                preampSlider.value = settings.preamp;
                updatePreamp({ target: preampSlider });
            }
            
        } catch (error) {
            console.error('Equalizer ayarları yüklenemedi:', error);
        }
    }
}

// CROSSFADE & GAPLESS PLAYBACK SİSTEMİ

// Crossfade panelini aç/kapat
function toggleCrossfadePanel() {
    const crossfadePanel = document.getElementById('crossfade-panel');
    const crossfadeBtn = document.getElementById('crossfade-btn');
    
    if (crossfadePanel) {
        const isVisible = crossfadePanel.classList.contains('show');
        
        if (isVisible) {
            crossfadePanel.classList.remove('show');
            crossfadeBtn.classList.remove('active');
        } else {
            crossfadePanel.classList.add('show');
            crossfadeBtn.classList.add('active');
            initializeCrossfadePanel();
        }
    }
}

// Crossfade panelini başlat
function initializeCrossfadePanel() {
    setupCrossfadeControls();
    loadCrossfadeSettings();
}

// Crossfade kontrolleri kurulumu
function setupCrossfadeControls() {
    // Crossfade duration slider
    const durationSlider = document.getElementById('crossfade-duration');
    if (durationSlider) {
        durationSlider.addEventListener('input', updateCrossfadeDuration);
    }
    
    // Gapless toggle
    const gaplessToggle = document.getElementById('gapless-toggle');
    if (gaplessToggle) {
        gaplessToggle.addEventListener('change', toggleGaplessPlayback);
    }
    
    // Auto crossfade toggle
    const autoCrossfadeToggle = document.getElementById('auto-crossfade-toggle');
    if (autoCrossfadeToggle) {
        autoCrossfadeToggle.addEventListener('change', toggleAutoCrossfade);
    }
    
    // Close button
    const closeBtn = document.getElementById('crossfade-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('crossfade-panel').classList.remove('show');
            document.getElementById('crossfade-btn').classList.remove('active');
        });
    }
}

// Crossfade süresini güncelle
function updateCrossfadeDuration(event) {
    crossfadeDuration = parseFloat(event.target.value);
    
    // Değeri görüntüle
    const valueSpan = document.getElementById('crossfade-value');
    if (valueSpan) {
        valueSpan.textContent = `${crossfadeDuration.toFixed(1)}s`;
    }
    
    saveCrossfadeSettings();
    
    console.log(`Crossfade Duration: ${crossfadeDuration}s`);
}

// Gapless playback toggle
function toggleGaplessPlayback(event) {
    isGaplessEnabled = event.target.checked;
    
    saveCrossfadeSettings();
    
    if (isGaplessEnabled) {
        showNotification('Gapless Playback açık', 'success');
        console.log('Gapless Playback: Enabled');
    } else {
        showNotification('Gapless Playback kapalı', 'info');
        console.log('Gapless Playback: Disabled');
    }
}

// Auto crossfade toggle
function toggleAutoCrossfade(event) {
    isAutoCrossfadeEnabled = event.target.checked;
    
    saveCrossfadeSettings();
    
    if (isAutoCrossfadeEnabled) {
        showNotification('Auto Crossfade açık', 'success');
        console.log('Auto Crossfade: Enabled');
    } else {
        showNotification('Auto Crossfade kapalı', 'info');
        console.log('Auto Crossfade: Disabled');
    }
}

// Crossfade ile şarkı geçişi (gelişmiş versiyon)
function crossfadeToNextTrack() {
    if (!isAutoCrossfadeEnabled || crossfadeDuration === 0) {
        // Normal geçiş
        nextTrack();
        return;
    }
    
    const currentAudio = audioPlayer;
    if (!currentAudio || !isPlaying) return;
    
    // Demo crossfade efekti
    const fadeOutDuration = crossfadeDuration * 1000; // ms
    const currentVolume = audioPlayer.volume;
    const fadeStep = currentVolume / (fadeOutDuration / 50); // 50ms intervals
    
    let volume = currentVolume;
    const fadeInterval = setInterval(() => {
        volume -= fadeStep;
        if (volume <= 0) {
            volume = 0;
            clearInterval(fadeInterval);
            nextTrack();
            
            // Fade in new track
            setTimeout(() => {
                fadeInCurrentTrack();
            }, 100);
        }
        audioPlayer.volume = volume;
    }, 50);
    
    console.log(`Crossfading to next track (${crossfadeDuration}s)`);
}

// Yeni şarkıyı fade in ile başlat
function fadeInCurrentTrack() {
    if (!audioPlayer) return;
    
    const targetVolume = currentVolume;
    const fadeInDuration = crossfadeDuration * 1000; // ms
    const fadeStep = targetVolume / (fadeInDuration / 50); // 50ms intervals
    
    let volume = 0;
    audioPlayer.volume = 0;
    
    const fadeInterval = setInterval(() => {
        volume += fadeStep;
        if (volume >= targetVolume) {
            volume = targetVolume;
            clearInterval(fadeInterval);
        }
        audioPlayer.volume = volume;
    }, 50);
}

// Crossfade ayarlarını kaydet
function saveCrossfadeSettings() {
    const settings = {
        crossfadeDuration: crossfadeDuration,
        isGaplessEnabled: isGaplessEnabled,
        isAutoCrossfadeEnabled: isAutoCrossfadeEnabled
    };
    
    localStorage.setItem('crossfadeSettings', JSON.stringify(settings));
}

// Crossfade ayarlarını yükle
function loadCrossfadeSettings() {
    const savedSettings = localStorage.getItem('crossfadeSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            crossfadeDuration = settings.crossfadeDuration || 3.0;
            isGaplessEnabled = settings.isGaplessEnabled !== undefined ? settings.isGaplessEnabled : true;
            isAutoCrossfadeEnabled = settings.isAutoCrossfadeEnabled || false;
            
            // UI güncelle
            const durationSlider = document.getElementById('crossfade-duration');
            if (durationSlider) {
                durationSlider.value = crossfadeDuration;
                updateCrossfadeDuration({ target: durationSlider });
            }
            
            const gaplessToggle = document.getElementById('gapless-toggle');
            if (gaplessToggle) {
                gaplessToggle.checked = isGaplessEnabled;
            }
            
            const autoCrossfadeToggle = document.getElementById('auto-crossfade-toggle');
            if (autoCrossfadeToggle) {
                autoCrossfadeToggle.checked = isAutoCrossfadeEnabled;
            }
            
        } catch (error) {
            console.error('Crossfade ayarları yüklenemedi:', error);
        }
    }
}

// AUDIO VİSUALİZER SİSTEMİ

// Visualizer panelini aç/kapat
function toggleVisualizerPanel() {
    const visualizerPanel = document.getElementById('visualizer-panel');
    const visualizerBtn = document.getElementById('visualizer-btn');
    
    if (visualizerPanel) {
        const isVisible = visualizerPanel.classList.contains('show');
        
        if (isVisible) {
            visualizerPanel.classList.remove('show');
            visualizerBtn.classList.remove('active');
            stopVisualizer();
        } else {
            visualizerPanel.classList.add('show');
            visualizerBtn.classList.add('active');
            initializeVisualizer();
        }
    }
}

// Visualizer'ı başlat
function initializeVisualizer() {
    visualizerCanvas = document.getElementById('visualizer-canvas');
    if (!visualizerCanvas) return;
    
    visualizerCtx = visualizerCanvas.getContext('2d');
    setupVisualizerControls();
    loadVisualizerSettings();
    
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('AudioContext oluşturulamadı:', error);
            showNotification('Visualizer desteklenmiyor', 'error');
            return;
        }
    }
    
    // Analyzer node oluştur
    if (!analyser) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = visualizerSmoothing;
        
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }
    
    // Demo visualizer başlat
    startDemoVisualizer();
}

// Visualizer kontrolleri kurulumu
function setupVisualizerControls() {
    // Style buttons
    const styleButtons = document.querySelectorAll('.viz-style-btn');
    styleButtons.forEach(btn => {
        btn.addEventListener('click', changeVisualizerStyle);
    });
    
    // Sensitivity slider
    const sensitivitySlider = document.getElementById('viz-sensitivity');
    if (sensitivitySlider) {
        sensitivitySlider.addEventListener('input', updateVisualizerSensitivity);
    }
    
    // Smoothing slider
    const smoothingSlider = document.getElementById('viz-smoothing');
    if (smoothingSlider) {
        smoothingSlider.addEventListener('input', updateVisualizerSmoothing);
    }
    
    // Color scheme select
    const colorSelect = document.getElementById('viz-color-scheme');
    if (colorSelect) {
        colorSelect.addEventListener('change', updateVisualizerColors);
    }
    
    // Close button
    const closeBtn = document.getElementById('visualizer-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('visualizer-panel').classList.remove('show');
            document.getElementById('visualizer-btn').classList.remove('active');
            stopVisualizer();
        });
    }
}

// Visualizer stilini değiştir
function changeVisualizerStyle(event) {
    // Tüm butonlardan active kaldır
    document.querySelectorAll('.viz-style-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tıklanan butona active ekle
    event.target.classList.add('active');
    
    visualizerStyle = event.target.dataset.style;
    saveVisualizerSettings();
    
    console.log(`Visualizer Style: ${visualizerStyle}`);
}

// Visualizer hassasiyetini güncelle
function updateVisualizerSensitivity(event) {
    visualizerSensitivity = parseFloat(event.target.value);
    
    const valueSpan = document.getElementById('viz-sensitivity-value');
    if (valueSpan) {
        valueSpan.textContent = `${visualizerSensitivity.toFixed(1)}x`;
    }
    
    saveVisualizerSettings();
}

// Visualizer yumuşatmayı güncelle
function updateVisualizerSmoothing(event) {
    visualizerSmoothing = parseFloat(event.target.value);
    
    const valueSpan = document.getElementById('viz-smoothing-value');
    if (valueSpan) {
        valueSpan.textContent = `${Math.round(visualizerSmoothing * 100)}%`;
    }
    
    if (analyser) {
        analyser.smoothingTimeConstant = visualizerSmoothing;
    }
    
    saveVisualizerSettings();
}

// Visualizer renk şemasını güncelle
function updateVisualizerColors(event) {
    visualizerColorScheme = event.target.value;
    saveVisualizerSettings();
    
    console.log(`Visualizer Colors: ${visualizerColorScheme}`);
}

// Demo visualizer başlat (gerçek ses analizi olmadan)
function startDemoVisualizer() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    function animate() {
        if (!visualizerCtx || !visualizerCanvas) return;
        
        // Canvas temizle
        visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        
        // Demo veri oluştur
        generateDemoVisualizerData();
        
        // Visualizer çiz
        switch (visualizerStyle) {
            case 'bars':
                drawBars();
                break;
            case 'wave':
                drawWave();
                break;
            case 'circle':
                drawCircle();
                break;
        }
        
        // Frequency ve amplitude bilgilerini güncelle
        updateVisualizerInfo();
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// Demo visualizer verisi oluştur
function generateDemoVisualizerData() {
    if (!dataArray) {
        dataArray = new Uint8Array(128);
    }
    
    const time = Date.now() * 0.002;
    
    for (let i = 0; i < dataArray.length; i++) {
        // Sinüs dalgaları ile demo veri
        const frequency1 = Math.sin(time + i * 0.1) * 50;
        const frequency2 = Math.sin(time * 1.5 + i * 0.05) * 30;
        const frequency3 = Math.sin(time * 0.8 + i * 0.2) * 20;
        
        let value = 128 + frequency1 + frequency2 + frequency3;
        value *= visualizerSensitivity;
        value = Math.max(0, Math.min(255, value));
        
        dataArray[i] = value;
    }
}

// Bar visualizer çiz
function drawBars() {
    const barWidth = visualizerCanvas.width / dataArray.length;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * visualizerCanvas.height * 0.8;
        
        const color = getVisualizerColor(i, dataArray[i]);
        visualizerCtx.fillStyle = color;
        
        visualizerCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
    }
}

// Wave visualizer çiz
function drawWave() {
    visualizerCtx.lineWidth = 2;
    visualizerCtx.beginPath();
    
    const sliceWidth = visualizerCanvas.width / dataArray.length;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * visualizerCanvas.height / 2;
        
        if (i === 0) {
            visualizerCtx.moveTo(x, y);
        } else {
            visualizerCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    visualizerCtx.strokeStyle = getVisualizerColor(0, 200);
    visualizerCtx.stroke();
}

// Circle visualizer çiz
function drawCircle() {
    const centerX = visualizerCanvas.width / 2;
    const centerY = visualizerCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    for (let i = 0; i < dataArray.length; i++) {
        const angle = (i / dataArray.length) * Math.PI * 2;
        const amplitude = (dataArray[i] / 255) * radius * 0.5;
        
        const x1 = centerX + Math.cos(angle) * (radius - amplitude);
        const y1 = centerY + Math.sin(angle) * (radius - amplitude);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        
        visualizerCtx.strokeStyle = getVisualizerColor(i, dataArray[i]);
        visualizerCtx.lineWidth = 2;
        visualizerCtx.beginPath();
        visualizerCtx.moveTo(x1, y1);
        visualizerCtx.lineTo(x2, y2);
        visualizerCtx.stroke();
    }
}

// Visualizer rengi al
function getVisualizerColor(index, value) {
    const intensity = value / 255;
    
    switch (visualizerColorScheme) {
        case 'spotify':
            return `rgba(29, 185, 84, ${intensity})`;
        case 'rainbow':
            const hue = (index / dataArray.length) * 360;
            return `hsla(${hue}, 100%, 50%, ${intensity})`;
        case 'fire':
            return `rgba(255, ${Math.floor(165 * intensity)}, 0, ${intensity})`;
        case 'ocean':
            return `rgba(0, ${Math.floor(191 * intensity)}, 255, ${intensity})`;
        case 'purple':
            return `rgba(138, 43, 226, ${intensity})`;
        default:
            return `rgba(29, 185, 84, ${intensity})`;
    }
}

// Visualizer bilgilerini güncelle
function updateVisualizerInfo() {
    if (!dataArray) return;
    
    // En yüksek frekans bul
    let maxIndex = 0;
    let maxValue = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
        }
    }
    
    const frequency = Math.round((maxIndex / dataArray.length) * 22050); // Nyquist frequency
    const amplitude = Math.round((maxValue / 255) * 100);
    
    const freqElement = document.getElementById('viz-freq');
    const ampElement = document.getElementById('viz-amp');
    
    if (freqElement) freqElement.textContent = `${frequency} Hz`;
    if (ampElement) ampElement.textContent = `${amplitude}%`;
}

// Visualizer'ı durdur
function stopVisualizer() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    if (visualizerCtx && visualizerCanvas) {
        visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    }
}

// Visualizer ayarlarını kaydet
function saveVisualizerSettings() {
    const settings = {
        style: visualizerStyle,
        sensitivity: visualizerSensitivity,
        smoothing: visualizerSmoothing,
        colorScheme: visualizerColorScheme
    };
    
    localStorage.setItem('visualizerSettings', JSON.stringify(settings));
}

// Visualizer ayarlarını yükle
function loadVisualizerSettings() {
    const savedSettings = localStorage.getItem('visualizerSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            visualizerStyle = settings.style || 'bars';
            visualizerSensitivity = settings.sensitivity || 1.0;
            visualizerSmoothing = settings.smoothing || 0.8;
            visualizerColorScheme = settings.colorScheme || 'spotify';
            
            // UI güncelle
            document.querySelectorAll('.viz-style-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.style === visualizerStyle);
            });
            
            const sensitivitySlider = document.getElementById('viz-sensitivity');
            if (sensitivitySlider) {
                sensitivitySlider.value = visualizerSensitivity;
                updateVisualizerSensitivity({ target: sensitivitySlider });
            }
            
            const smoothingSlider = document.getElementById('viz-smoothing');
            if (smoothingSlider) {
                smoothingSlider.value = visualizerSmoothing;
                updateVisualizerSmoothing({ target: smoothingSlider });
            }
            
            const colorSelect = document.getElementById('viz-color-scheme');
            if (colorSelect) {
                colorSelect.value = visualizerColorScheme;
            }
            
        } catch (error) {
            console.error('Visualizer ayarları yüklenemedi:', error);
        }
    }
}

// ADVANCED AUDIO CONTROLS SİSTEMİ

// Advanced controls panelini aç/kapat
function toggleAdvancedControlsPanel() {
    const advancedPanel = document.getElementById('advanced-controls-panel');
    const advancedBtn = document.getElementById('advanced-controls-btn');
    
    if (advancedPanel) {
        const isVisible = advancedPanel.classList.contains('show');
        
        if (isVisible) {
            advancedPanel.classList.remove('show');
            advancedBtn.classList.remove('active');
        } else {
            advancedPanel.classList.add('show');
            advancedBtn.classList.add('active');
            initializeAdvancedControls();
        }
    }
}

// Advanced controls'ü başlat
function initializeAdvancedControls() {
    setupAdvancedControlsListeners();
    loadAdvancedControlsSettings();
}

// Advanced controls event listeners
function setupAdvancedControlsListeners() {
    // Pitch control
    const pitchControl = document.getElementById('pitch-control');
    if (pitchControl) {
        pitchControl.addEventListener('input', updatePitchControl);
    }
    
    // Speed control
    const speedControl = document.getElementById('speed-control');
    if (speedControl) {
        speedControl.addEventListener('input', updateSpeedControl);
    }
    
    // Pitch preset buttons
    document.querySelectorAll('[data-pitch]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pitch = parseFloat(e.target.dataset.pitch);
            document.getElementById('pitch-control').value = pitch;
            updatePitchControl({ target: { value: pitch } });
        });
    });
    
    // Speed preset buttons
    document.querySelectorAll('[data-speed]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const speed = parseFloat(e.target.dataset.speed);
            document.getElementById('speed-control').value = speed;
            updateSpeedControl({ target: { value: speed } });
        });
    });
    
    // Audio effects
    setupAudioEffectsListeners();
    
    // Advanced settings
    setupAdvancedSettingsListeners();
    
    // Footer buttons
    const resetAllBtn = document.getElementById('reset-all-controls');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', resetAllAdvancedControls);
    }
    
    const savePresetBtn = document.getElementById('save-preset');
    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', saveAdvancedPreset);
    }
    
    // Close button
    const closeBtn = document.getElementById('advanced-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('advanced-controls-panel').classList.remove('show');
            document.getElementById('advanced-controls-btn').classList.remove('active');
        });
    }
}

// Audio effects listeners
function setupAudioEffectsListeners() {
    // Reverb
    const reverbEffect = document.getElementById('reverb-effect');
    const reverbAmount = document.getElementById('reverb-amount');
    if (reverbEffect) reverbEffect.addEventListener('change', updateReverbEffect);
    if (reverbAmount) reverbAmount.addEventListener('input', updateReverbAmount);
    
    // Echo
    const echoEffect = document.getElementById('echo-effect');
    const echoAmount = document.getElementById('echo-amount');
    if (echoEffect) echoEffect.addEventListener('change', updateEchoEffect);
    if (echoAmount) echoAmount.addEventListener('input', updateEchoAmount);
    
    // Distortion
    const distortionEffect = document.getElementById('distortion-effect');
    const distortionAmount = document.getElementById('distortion-amount');
    if (distortionEffect) distortionEffect.addEventListener('change', updateDistortionEffect);
    if (distortionAmount) distortionAmount.addEventListener('input', updateDistortionAmount);
    
    // Bass Boost
    const bassBoostEffect = document.getElementById('bass-boost-effect');
    const bassBoostAmount = document.getElementById('bass-boost-amount');
    if (bassBoostEffect) bassBoostEffect.addEventListener('change', updateBassBoostEffect);
    if (bassBoostAmount) bassBoostAmount.addEventListener('input', updateBassBoostAmount);
}

// Advanced settings listeners
function setupAdvancedSettingsListeners() {
    const monoMode = document.getElementById('mono-mode');
    const normalizeAudio = document.getElementById('normalize-audio');
    const spatialAudio = document.getElementById('spatial-audio');
    const bitDepthSelect = document.getElementById('bit-depth-select');
    
    if (monoMode) monoMode.addEventListener('change', updateMonoMode);
    if (normalizeAudio) normalizeAudio.addEventListener('change', updateNormalizeAudio);
    if (spatialAudio) spatialAudio.addEventListener('change', updateSpatialAudio);
    if (bitDepthSelect) bitDepthSelect.addEventListener('change', updateBitDepth);
}

// Pitch control güncelle
function updatePitchControl(event) {
    pitchShift = parseFloat(event.target.value);
    
    const valueSpan = document.getElementById('pitch-value');
    if (valueSpan) {
        valueSpan.textContent = `${pitchShift > 0 ? '+' : ''}${pitchShift.toFixed(1)} st`;
    }
    
    // Demo pitch effect (gerçek pitch shifting Web Audio API ile yapılabilir)
    console.log(`Pitch Shift: ${pitchShift} semitones`);
    
    if (pitchShift !== 0) {
        showNotification(`Pitch: ${pitchShift > 0 ? '+' : ''}${pitchShift.toFixed(1)} st`, 'info');
    }
    
    saveAdvancedControlsSettings();
}

// Speed control güncelle
function updateSpeedControl(event) {
    playbackSpeed = parseFloat(event.target.value);
    
    const valueSpan = document.getElementById('speed-value');
    if (valueSpan) {
        valueSpan.textContent = `${playbackSpeed.toFixed(2)}x`;
    }
    
    // Gerçek audio player'da playback rate ayarlanabilir
    if (audioPlayer) {
        audioPlayer.playbackRate = playbackSpeed;
    }
    
    console.log(`Playback Speed: ${playbackSpeed}x`);
    
    if (playbackSpeed !== 1.0) {
        showNotification(`Speed: ${playbackSpeed.toFixed(2)}x`, 'info');
    }
    
    saveAdvancedControlsSettings();
}

// Audio effects functions
function updateReverbEffect(event) {
    audioEffects.reverb.enabled = event.target.checked;
    console.log(`Reverb: ${audioEffects.reverb.enabled ? 'ON' : 'OFF'}`);
    if (audioEffects.reverb.enabled) {
        showNotification('Reverb effect enabled', 'success');
    }
    saveAdvancedControlsSettings();
}

function updateReverbAmount(event) {
    audioEffects.reverb.amount = parseFloat(event.target.value);
    console.log(`Reverb Amount: ${audioEffects.reverb.amount}`);
    saveAdvancedControlsSettings();
}

function updateEchoEffect(event) {
    audioEffects.echo.enabled = event.target.checked;
    console.log(`Echo: ${audioEffects.echo.enabled ? 'ON' : 'OFF'}`);
    if (audioEffects.echo.enabled) {
        showNotification('Echo effect enabled', 'success');
    }
    saveAdvancedControlsSettings();
}

function updateEchoAmount(event) {
    audioEffects.echo.amount = parseFloat(event.target.value);
    console.log(`Echo Amount: ${audioEffects.echo.amount}`);
    saveAdvancedControlsSettings();
}

function updateDistortionEffect(event) {
    audioEffects.distortion.enabled = event.target.checked;
    console.log(`Distortion: ${audioEffects.distortion.enabled ? 'ON' : 'OFF'}`);
    if (audioEffects.distortion.enabled) {
        showNotification('Distortion effect enabled', 'success');
    }
    saveAdvancedControlsSettings();
}

function updateDistortionAmount(event) {
    audioEffects.distortion.amount = parseFloat(event.target.value);
    console.log(`Distortion Amount: ${audioEffects.distortion.amount}`);
    saveAdvancedControlsSettings();
}

function updateBassBoostEffect(event) {
    audioEffects.bassBoost.enabled = event.target.checked;
    console.log(`Bass Boost: ${audioEffects.bassBoost.enabled ? 'ON' : 'OFF'}`);
    if (audioEffects.bassBoost.enabled) {
        showNotification('Bass Boost effect enabled', 'success');
    }
    saveAdvancedControlsSettings();
}

function updateBassBoostAmount(event) {
    audioEffects.bassBoost.amount = parseFloat(event.target.value);
    console.log(`Bass Boost Amount: ${audioEffects.bassBoost.amount}`);
    saveAdvancedControlsSettings();
}

// Advanced settings functions
function updateMonoMode(event) {
    audioSettings.monoMode = event.target.checked;
    console.log(`Mono Mode: ${audioSettings.monoMode ? 'ON' : 'OFF'}`);
    if (audioSettings.monoMode) {
        showNotification('Mono mode enabled', 'info');
    }
    saveAdvancedControlsSettings();
}

function updateNormalizeAudio(event) {
    audioSettings.normalize = event.target.checked;
    console.log(`Audio Normalization: ${audioSettings.normalize ? 'ON' : 'OFF'}`);
    if (audioSettings.normalize) {
        showNotification('Audio normalization enabled', 'info');
    }
    saveAdvancedControlsSettings();
}

function updateSpatialAudio(event) {
    audioSettings.spatialAudio = event.target.checked;
    console.log(`Spatial Audio: ${audioSettings.spatialAudio ? 'ON' : 'OFF'}`);
    if (audioSettings.spatialAudio) {
        showNotification('Spatial audio enabled', 'success');
    }
    saveAdvancedControlsSettings();
}

function updateBitDepth(event) {
    audioSettings.bitDepth = parseInt(event.target.value);
    console.log(`Bit Depth: ${audioSettings.bitDepth}-bit`);
    showNotification(`Audio quality: ${audioSettings.bitDepth}-bit`, 'info');
    saveAdvancedControlsSettings();
}

// Tüm advanced controls'ü sıfırla
function resetAllAdvancedControls() {
    if (!confirm('Tüm gelişmiş ayarları sıfırlamak istediğinizden emin misiniz?')) {
        return;
    }
    
    // Pitch reset
    pitchShift = 0;
    document.getElementById('pitch-control').value = 0;
    updatePitchControl({ target: { value: 0 } });
    
    // Speed reset
    playbackSpeed = 1.0;
    document.getElementById('speed-control').value = 1;
    updateSpeedControl({ target: { value: 1 } });
    
    // Audio effects reset
    Object.keys(audioEffects).forEach(effect => {
        audioEffects[effect].enabled = false;
        const checkbox = document.getElementById(`${effect.replace(/([A-Z])/g, '-$1').toLowerCase()}-effect`);
        if (checkbox) checkbox.checked = false;
    });
    
    // Settings reset
    audioSettings.monoMode = false;
    audioSettings.normalize = false;
    audioSettings.spatialAudio = false;
    audioSettings.bitDepth = 24;
    
    // UI reset
    document.getElementById('mono-mode').checked = false;
    document.getElementById('normalize-audio').checked = false;
    document.getElementById('spatial-audio').checked = false;
    document.getElementById('bit-depth-select').value = '24';
    
    showNotification('Tüm gelişmiş ayarlar sıfırlandı', 'success');
    saveAdvancedControlsSettings();
}

// Preset kaydet
function saveAdvancedPreset() {
    const presetName = prompt('Preset adını girin:');
    if (!presetName) return;
    
    const preset = {
        pitchShift,
        playbackSpeed,
        audioEffects: { ...audioEffects },
        audioSettings: { ...audioSettings }
    };
    
    localStorage.setItem(`audioPreset_${presetName}`, JSON.stringify(preset));
    showNotification(`"${presetName}" preset kaydedildi`, 'success');
}

// Advanced controls ayarlarını kaydet
function saveAdvancedControlsSettings() {
    const settings = {
        pitchShift,
        playbackSpeed,
        audioEffects,
        audioSettings
    };
    
    localStorage.setItem('advancedControlsSettings', JSON.stringify(settings));
}

// Advanced controls ayarlarını yükle
function loadAdvancedControlsSettings() {
    const savedSettings = localStorage.getItem('advancedControlsSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Değerleri geri yükle
            pitchShift = settings.pitchShift || 0;
            playbackSpeed = settings.playbackSpeed || 1.0;
            audioEffects = { ...audioEffects, ...settings.audioEffects };
            audioSettings = { ...audioSettings, ...settings.audioSettings };
            
            // UI güncelle
            const pitchControl = document.getElementById('pitch-control');
            if (pitchControl) {
                pitchControl.value = pitchShift;
                updatePitchControl({ target: pitchControl });
            }
            
            const speedControl = document.getElementById('speed-control');
            if (speedControl) {
                speedControl.value = playbackSpeed;
                updateSpeedControl({ target: speedControl });
            }
            
            // Effects UI güncelle
            Object.keys(audioEffects).forEach(effect => {
                const effectName = effect.replace(/([A-Z])/g, '-$1').toLowerCase();
                const checkbox = document.getElementById(`${effectName}-effect`);
                const slider = document.getElementById(`${effectName}-amount`);
                
                if (checkbox) checkbox.checked = audioEffects[effect].enabled;
                if (slider) slider.value = audioEffects[effect].amount;
            });
            
            // Settings UI güncelle
            const monoMode = document.getElementById('mono-mode');
            const normalizeAudio = document.getElementById('normalize-audio');
            const spatialAudio = document.getElementById('spatial-audio');
            const bitDepthSelect = document.getElementById('bit-depth-select');
            
            if (monoMode) monoMode.checked = audioSettings.monoMode;
            if (normalizeAudio) normalizeAudio.checked = audioSettings.normalize;
            if (spatialAudio) spatialAudio.checked = audioSettings.spatialAudio;
            if (bitDepthSelect) bitDepthSelect.value = audioSettings.bitDepth.toString();
            
        } catch (error) {
            console.error('Advanced controls ayarları yüklenemedi:', error);
        }
    }
}

// AI RECOMMENDATIONS SİSTEMİ

// AI Recommendations panelini aç/kapat
function toggleAIRecommendationsPanel() {
    const aiPanel = document.getElementById('ai-recommendations-panel');
    const aiBtn = document.getElementById('ai-recommendations-btn');
    
    if (aiPanel) {
        const isVisible = aiPanel.classList.contains('show');
        
        if (isVisible) {
            aiPanel.classList.remove('show');
            aiBtn.classList.remove('active');
        } else {
            aiPanel.classList.add('show');
            aiBtn.classList.add('active');
            initializeAIRecommendations();
        }
    }
}

// AI Recommendations sistemini başlat
function initializeAIRecommendations() {
    setupAIEventListeners();
    loadUserBehaviorData();
    generateInitialRecommendations();
}

// AI event listeners kurulumu
function setupAIEventListeners() {
    // Tab switching
    const aiTabs = document.querySelectorAll('.ai-tab');
    aiTabs.forEach(tab => {
        tab.addEventListener('click', switchAITab);
    });
    
    // Mood buttons
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.addEventListener('click', selectMood);
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', selectTrendFilter);
    });
    
    // AI settings
    const learningToggle = document.getElementById('ai-learning-toggle');
    if (learningToggle) {
        learningToggle.addEventListener('click', toggleAILearning);
    }
    
    const refreshBtn = document.getElementById('ai-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshAIRecommendations);
    }
    
    // Close button
    const closeBtn = document.getElementById('ai-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('ai-recommendations-panel').classList.remove('show');
            document.getElementById('ai-recommendations-btn').classList.remove('active');
        });
    }
}

// Tab değiştirme
function switchAITab(event) {
    const targetTab = event.target.dataset.tab;
    
    // Tüm tabları deactive yap
    document.querySelectorAll('.ai-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.ai-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Seçilen tabı aktif yap
    event.target.classList.add('active');
    document.querySelector(`[data-content="${targetTab}"]`).classList.add('active');
    
    // Tab'e göre veri yükle
    loadTabContent(targetTab);
}

// Tab içeriğini yükle
function loadTabContent(tabName) {
    switch (tabName) {
        case 'discover':
            loadDiscoverRecommendations();
            break;
        case 'mood':
            // Mood seçildiğinde yüklenecek
            break;
        case 'similar':
            loadSimilarRecommendations();
            break;
        case 'trending':
            loadTrendingRecommendations();
            break;
    }
}

// Mood seçme
function selectMood(event) {
    const mood = event.target.dataset.mood;
    
    // Tüm mood butonlarını deactive yap
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Seçilen mood'u aktif yap
    event.target.classList.add('active');
    currentMood = mood;
    
    // Mood'a göre önerileri yükle
    loadMoodRecommendations(mood);
    
    // User behavior'a kaydet
    trackUserBehavior('mood_selection', { mood: mood });
}

// Trend filter seçme
function selectTrendFilter(event) {
    const filter = event.target.dataset.filter;
    
    // Tüm filter butonlarını deactive yap
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Seçilen filtreyi aktif yap
    event.target.classList.add('active');
    
    // Filtreye göre trend'leri yükle
    loadTrendingRecommendations(filter);
}

// AI öğrenmeyi aç/kapat
function toggleAILearning() {
    aiLearningEnabled = !aiLearningEnabled;
    
    const statusSpan = document.getElementById('learning-status');
    if (statusSpan) {
        statusSpan.textContent = aiLearningEnabled ? 'Açık' : 'Kapalı';
    }
    
    const message = aiLearningEnabled ? 'AI öğrenme açıldı' : 'AI öğrenme kapatıldı';
    showNotification(message, 'info');
    
    saveAISettings();
}

// AI önerilerini yenile
function refreshAIRecommendations() {
    showNotification('AI önerileri yenileniyor...', 'info');
    
    // Yenileme animasyonu
    const refreshBtn = document.getElementById('ai-refresh-btn');
    if (refreshBtn) {
        const icon = refreshBtn.querySelector('i');
        icon.classList.add('fa-spin');
        
        setTimeout(() => {
            icon.classList.remove('fa-spin');
            showNotification('AI önerileri güncellendi!', 'success');
        }, 2000);
    }
    
    // Tüm önerileri yeniden oluştur
    generateInitialRecommendations();
}

// İlk önerileri oluştur
function generateInitialRecommendations() {
    generateDiscoverRecommendations();
    generateMoodRecommendations();
    generateSimilarRecommendations();
    generateTrendingRecommendations();
}

// Keşfet önerilerini oluştur
function generateDiscoverRecommendations() {
    const recommendations = [
        {
            id: 'ai_1',
            name: 'Midnight City',
            artist: 'M83',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            reason: 'Elektronik müzik tercihlerinize göre'
        },
        {
            id: 'ai_2',
            name: 'Strobe',
            artist: 'Deadmau5',
            image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop',
            reason: 'Progressive House sevginize uygun'
        },
        {
            id: 'ai_3',
            name: 'Porcelain',
            artist: 'Moby',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            reason: 'Ambient tercihleriniz için'
        },
        {
            id: 'ai_4',
            name: 'Everyday',
            artist: 'A$AP Rocky',
            image: 'https://images.unsplash.com/photo-1571974599782-87cc65da8473?w=300&h=300&fit=crop',
            reason: 'Hip-hop dinleme geçmişinize göre'
        }
    ];
    
    aiRecommendations.discover = recommendations;
}

// Mood önerilerini oluştur
function generateMoodRecommendations() {
    aiRecommendations.mood = {
        happy: [
            { id: 'mood_1', name: 'Good as Hell', artist: 'Lizzo', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
            { id: 'mood_2', name: 'Uptown Funk', artist: 'Bruno Mars', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop' }
        ],
        sad: [
            { id: 'mood_3', name: 'Someone Like You', artist: 'Adele', image: 'https://images.unsplash.com/photo-1571974599782-87cc65da8473?w=300&h=300&fit=crop' },
            { id: 'mood_4', name: 'Mad World', artist: 'Gary Jules', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' }
        ],
        energetic: [
            { id: 'mood_5', name: 'Till I Collapse', artist: 'Eminem', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop' },
            { id: 'mood_6', name: 'Thunder', artist: 'Imagine Dragons', image: 'https://images.unsplash.com/photo-1571974599782-87cc65da8473?w=300&h=300&fit=crop' }
        ],
        calm: [
            { id: 'mood_7', name: 'Weightless', artist: 'Marconi Union', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
            { id: 'mood_8', name: 'Claire de Lune', artist: 'Claude Debussy', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop' }
        ],
        romantic: [
            { id: 'mood_9', name: 'Perfect', artist: 'Ed Sheeran', image: 'https://images.unsplash.com/photo-1571974599782-87cc65da8473?w=300&h=300&fit=crop' },
            { id: 'mood_10', name: 'All of Me', artist: 'John Legend', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' }
        ],
        focused: [
            { id: 'mood_11', name: 'Ludovico Einaudi', artist: 'Nuvole Bianche', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop' },
            { id: 'mood_12', name: 'Max Richter', artist: 'On The Nature of Daylight', image: 'https://images.unsplash.com/photo-1571974599782-87cc65da8473?w=300&h=300&fit=crop' }
        ]
    };
}

// Benzer müzik önerilerini oluştur
function generateSimilarRecommendations() {
    // Şu an çalan şarkıya göre benzer şarkılar
    if (currentPlaylist.length > 0 && currentTrackIndex >= 0) {
        const currentTrack = currentPlaylist[currentTrackIndex];
        // Gerçek AI'da bu şarkının özelliklerini analiz ederiz
        aiRecommendations.similar = [
            { id: 'similar_1', name: 'Similar Track 1', artist: 'Similar Artist 1', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
            { id: 'similar_2', name: 'Similar Track 2', artist: 'Similar Artist 2', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop' }
        ];
    }
}

// Trend önerilerini oluştur
function generateTrendingRecommendations() {
    aiRecommendations.trending = [
        { id: 'trend_1', name: 'Viral Hit 1', artist: 'Trending Artist 1', image: 'https://images.unsplash.com/photo-1571974599782-87cc65da8473?w=300&h=300&fit=crop', plays: '2.5M' },
        { id: 'trend_2', name: 'Viral Hit 2', artist: 'Trending Artist 2', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', plays: '1.8M' },
        { id: 'trend_3', name: 'Viral Hit 3', artist: 'Trending Artist 3', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop', plays: '1.2M' }
    ];
}

// Keşfet önerilerini yükle
async function loadDiscoverRecommendations() {
    const container = document.getElementById('discover-recommendations');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">AI önerileri yükleniyor...</div>';
    
    try {
        // Gerçek API'lardan kişiselleştirilmiş öneriler al
        const userBehavior = getUserBehaviorSummary();
        const personalizedTracks = await musicAPIManager.getPersonalizedRecommendations(userBehavior, 10);
        
        container.innerHTML = '';
        
        if (personalizedTracks.length > 0) {
            personalizedTracks.forEach(track => {
                const card = createRecommendationCard(track, track.reason || 'Kişisel öneriniz');
                container.appendChild(card);
            });
        } else {
            // Fallback: Demo öneriler
            aiRecommendations.discover.forEach(track => {
                const card = createRecommendationCard(track, track.reason);
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Discover recommendations error:', error);
        container.innerHTML = '';
        
        // Fallback: Demo öneriler
        aiRecommendations.discover.forEach(track => {
            const card = createRecommendationCard(track, track.reason);
            container.appendChild(card);
        });
    }
}

// Mood önerilerini yükle
function loadMoodRecommendations(mood) {
    const container = document.getElementById('mood-recommendations');
    if (!container || !aiRecommendations.mood[mood]) return;
    
    container.innerHTML = '';
    
    aiRecommendations.mood[mood].forEach(track => {
        const card = createRecommendationCard(track, `${mood} ruh halin için`);
        container.appendChild(card);
    });
}

// Benzer önerileri yükle
function loadSimilarRecommendations() {
    const container = document.getElementById('similar-recommendations');
    const trackInfo = document.getElementById('current-track-info');
    
    if (!container || !trackInfo) return;
    
    if (currentPlaylist.length > 0 && currentTrackIndex >= 0) {
        const currentTrack = currentPlaylist[currentTrackIndex];
        trackInfo.innerHTML = `
            <div class="current-track-display">
                <img src="${currentTrack.cover}" alt="${currentTrack.name}" width="50" height="50">
                <div>
                    <div class="track-name">${currentTrack.name}</div>
                    <div class="track-artist">${currentTrack.artist}</div>
                </div>
            </div>
        `;
        
        container.innerHTML = '';
        aiRecommendations.similar.forEach(track => {
            const card = createRecommendationCard(track, 'Benzer özellikler');
            container.appendChild(card);
        });
    } else {
        trackInfo.innerHTML = '<div class="track-placeholder">Şarkı çalmaya başla...</div>';
        container.innerHTML = '';
    }
}

// Trend önerilerini yükle
async function loadTrendingRecommendations(filter = 'global') {
    const container = document.getElementById('trending-recommendations');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Trending şarkılar yükleniyor...</div>';
    
    try {
        // Gerçek API'lardan trending veriler al
        const trendingTracks = await musicAPIManager.getTrendingTracks(20);
        
        container.innerHTML = '';
        
        if (trendingTracks.length > 0) {
            trendingTracks.forEach((track, index) => {
                const plays = track.playcount || track.trending_score || (1000000 - index * 50000);
                const reason = `#${index + 1} Trending • ${plays.toLocaleString()} plays`;
                const card = createRecommendationCard(track, reason);
                container.appendChild(card);
            });
        } else {
            // Fallback: Demo trending
            aiRecommendations.trending.forEach((track, index) => {
                const card = createRecommendationCard(track, `#${index + 1} Trending • ${track.plays} plays`);
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Trending recommendations error:', error);
        container.innerHTML = '';
        
        // Fallback: Demo trending
        aiRecommendations.trending.forEach((track, index) => {
            const card = createRecommendationCard(track, `#${index + 1} Trending • ${track.plays} plays`);
            container.appendChild(card);
        });
    }
}

// Öneri kartı oluştur
function createRecommendationCard(track, reason = '') {
    const card = document.createElement('div');
    card.className = 'recommendation-card';
    card.innerHTML = `
        <img src="${track.image}" alt="${track.name}">
        <h5>${track.name}</h5>
        <p>${track.artist}</p>
        ${reason ? `<div class="recommendation-reason">${reason}</div>` : ''}
    `;
    
    card.addEventListener('click', () => {
        playRecommendedTrack(track);
        trackUserBehavior('recommendation_play', track);
    });
    
    return card;
}

// Önerilen şarkıyı çal
function playRecommendedTrack(track) {
    showNotification(`"${track.name}" çalınıyor`, 'success');
    console.log('AI Recommendation played:', track);
    
    // Gerçek sistemde bu şarkıyı playlist'e ekler ve çalarız
    // Şimdilik demo ses çalacak
    playDemoSound();
}

// Kullanıcı davranışını takip et
function trackUserBehavior(action, data) {
    if (!aiLearningEnabled) return;
    
    const behaviorEntry = {
        timestamp: Date.now(),
        action: action,
        data: data
    };
    
    // Behavior türüne göre kaydet
    switch (action) {
        case 'song_play':
            userBehaviorData.listeningHistory.push(data);
            break;
        case 'song_skip':
            userBehaviorData.skipPatterns.push(data);
            break;
        case 'song_like':
            userBehaviorData.likedTracks.push(data);
            break;
        case 'mood_selection':
            userBehaviorData.moodHistory.push(data);
            break;
        case 'search_query':
            userBehaviorData.searchHistory.push(data);
            break;
    }
    
    // Genre preferences güncelle
    if (data.genre) {
        userBehaviorData.genrePreferences[data.genre] = (userBehaviorData.genrePreferences[data.genre] || 0) + 1;
    }
    
    saveUserBehaviorData();
    
    console.log('AI Learning - User behavior tracked:', action, data);
}

// Kullanıcı davranış verilerini kaydet
function saveUserBehaviorData() {
    localStorage.setItem('userBehaviorData', JSON.stringify(userBehaviorData));
}

// Kullanıcı davranış verilerini yükle
function loadUserBehaviorData() {
    const savedData = localStorage.getItem('userBehaviorData');
    if (savedData) {
        try {
            userBehaviorData = { ...userBehaviorData, ...JSON.parse(savedData) };
        } catch (error) {
            console.error('User behavior data yüklenemedi:', error);
        }
    }
}

// AI ayarlarını kaydet
function saveAISettings() {
    const aiSettings = {
        learningEnabled: aiLearningEnabled,
        currentMood: currentMood,
        apiKeys: aiApiKeys
    };
    localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
}

// GERÇEK AI SERVİSLERİ İLE ENTEGRASYON

// Spotify Web API ile entegrasyon
async function getSpotifyRecommendations(seedTracks = [], seedGenres = []) {
    if (!aiApiKeys.spotify) {
        console.log('Spotify API key bulunamadı - Demo veriler kullanılıyor');
        return generateDemoRecommendations();
    }
    
    try {
        // Gerçek Spotify API çağrısı
        const response = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks.join(',')}&seed_genres=${seedGenres.join(',')}`, {
            headers: {
                'Authorization': `Bearer ${aiApiKeys.spotify}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.tracks;
        } else {
            throw new Error('Spotify API error');
        }
    } catch (error) {
        console.error('Spotify API Error:', error);
        return generateDemoRecommendations();
    }
}

// Last.fm API ile benzer sanatçı bulma
async function getLastFmSimilarArtists(artist) {
    if (!aiApiKeys.lastfm) {
        console.log('Last.fm API key bulunamadı - Demo veriler kullanılıyor');
        return [];
    }
    
    try {
        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(artist)}&api_key=${aiApiKeys.lastfm}&format=json`);
        
        if (response.ok) {
            const data = await response.json();
            return data.similarartists?.artist || [];
        } else {
            throw new Error('Last.fm API error');
        }
    } catch (error) {
        console.error('Last.fm API Error:', error);
        return [];
    }
}

// OpenAI ile gelişmiş müzik önerileri
async function getOpenAIRecommendations(userPreferences, currentContext) {
    if (!aiApiKeys.openai) {
        console.log('OpenAI API key bulunamadı - Kural tabanlı öneriler kullanılıyor');
        return generateRuleBasedRecommendations(userPreferences);
    }
    
    try {
        const prompt = `Kullanıcının müzik tercihleri: ${JSON.stringify(userPreferences)}. 
        Şu anki dinleme bağlamı: ${JSON.stringify(currentContext)}. 
        Bu bilgilere göre 5 şarkı öner (JSON formatında):`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aiApiKeys.openai}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } else {
            throw new Error('OpenAI API error');
        }
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return generateRuleBasedRecommendations(userPreferences);
    }
}

// Demo öneriler oluştur (API olmadığında)
function generateDemoRecommendations() {
    return [
        { name: 'Demo Song 1', artist: 'Demo Artist 1', genre: 'pop' },
        { name: 'Demo Song 2', artist: 'Demo Artist 2', genre: 'rock' },
        { name: 'Demo Song 3', artist: 'Demo Artist 3', genre: 'electronic' }
    ];
}

// Kural tabanlı öneriler (basit AI)
function generateRuleBasedRecommendations(preferences) {
    const recommendations = [];
    
    // Genre preferences'a göre öneri
    const topGenres = Object.keys(preferences.genrePreferences)
        .sort((a, b) => preferences.genrePreferences[b] - preferences.genrePreferences[a])
        .slice(0, 3);
    
    topGenres.forEach(genre => {
        recommendations.push({
            name: `AI Önerisi - ${genre}`,
            artist: `${genre} Sanatçısı`,
            genre: genre,
            reason: `${genre} türü tercihlerinize göre`
        });
    });
    
    return recommendations;
}

// ============= GERÇEK VERİ KAYNAKLARI API ENTegrasyonu =============
// Bu fonksiyonlar gerçek müzik servisleri ile bağlantı için hazırlandı

// Spotify Web API Entegrasyonu
class SpotifyAPI {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Access token al (Client Credentials Flow)
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
                },
                body: 'grant_type=client_credentials'
            });

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            
            return this.accessToken;
        } catch (error) {
            console.error('Spotify token error:', error);
            return null;
        }
    }

    // Popüler şarkıları getir
    async getTopTracks(country = 'TR', limit = 20) {
        const token = await this.getAccessToken();
        if (!token) return [];

        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data.items.map(item => ({
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists[0].name,
                album: item.track.album.name,
                image: item.track.album.images[0]?.url,
                popularity: item.track.popularity,
                external_url: item.track.external_urls.spotify
            }));
        } catch (error) {
            console.error('Spotify API error:', error);
            return [];
        }
    }

    // Türe göre öneri
    async getRecommendations(seedGenres, limit = 10) {
        const token = await this.getAccessToken();
        if (!token) return [];

        try {
            const genreString = seedGenres.join(',');
            const response = await fetch(
                `https://api.spotify.com/v1/recommendations?seed_genres=${genreString}&limit=${limit}&market=TR`, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            return data.tracks.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                image: track.album.images[0]?.url,
                popularity: track.popularity,
                external_url: track.external_urls.spotify
            }));
        } catch (error) {
            console.error('Spotify recommendations error:', error);
            return [];
        }
    }

    // Arama yap
    async searchTracks(query, limit = 20) {
        const token = await this.getAccessToken();
        if (!token) return [];

        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=${limit}&market=TR`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            return data.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                image: track.album.images[0]?.url,
                popularity: track.popularity,
                external_url: track.external_urls.spotify
            }));
        } catch (error) {
            console.error('Spotify search error:', error);
            return [];
        }
    }
}

// Last.fm API Entegrasyonu
class LastFmAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://ws.audioscrobbler.com/2.0/';
    }

    // Popüler şarkıları getir
    async getTopTracks(country = 'turkey', limit = 20) {
        try {
            const response = await fetch(
                `${this.baseUrl}?method=geo.gettoptracks&country=${country}&api_key=${this.apiKey}&format=json&limit=${limit}`
            );
            
            const data = await response.json();
            return data.tracks.track.map(track => ({
                name: track.name,
                artist: track.artist.name,
                playcount: track.playcount,
                listeners: track.listeners,
                image: track.image[3]?.['#text'] || '',
                url: track.url
            }));
        } catch (error) {
            console.error('Last.fm API error:', error);
            return [];
        }
    }

    // Benzer sanatçıları getir
    async getSimilarArtists(artist, limit = 10) {
        try {
            const response = await fetch(
                `${this.baseUrl}?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${this.apiKey}&format=json&limit=${limit}`
            );
            
            const data = await response.json();
            return data.similarartists.artist.map(artist => ({
                name: artist.name,
                match: artist.match,
                url: artist.url,
                image: artist.image[3]?.['#text'] || ''
            }));
        } catch (error) {
            console.error('Last.fm similar artists error:', error);
            return [];
        }
    }

    // Sanatçının popüler şarkıları
    async getArtistTopTracks(artist, limit = 10) {
        try {
            const response = await fetch(
                `${this.baseUrl}?method=artist.gettoptracks&artist=${encodeURIComponent(artist)}&api_key=${this.apiKey}&format=json&limit=${limit}`
            );
            
            const data = await response.json();
            return data.toptracks.track.map(track => ({
                name: track.name,
                artist: track.artist.name,
                playcount: track.playcount,
                listeners: track.listeners,
                url: track.url
            }));
        } catch (error) {
            console.error('Last.fm artist tracks error:', error);
            return [];
        }
    }
}

// OpenAI API Entegrasyonu (Gelişmiş AI Önerileri)
class OpenAIRecommendations {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openai.com/v1';
    }

    // Kullanıcı davranışlarına göre AI öneri
    async getPersonalizedRecommendations(userBehaviorData, limit = 10) {
        try {
            const prompt = this.createRecommendationPrompt(userBehaviorData);
            
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a music recommendation expert. Analyze user behavior and recommend songs based on their listening patterns.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 500
                })
            });

            const data = await response.json();
            return this.parseAIRecommendations(data.choices[0].message.content);
        } catch (error) {
            console.error('OpenAI API error:', error);
            return [];
        }
    }

    // AI prompt oluştur
    createRecommendationPrompt(behaviorData) {
        const topGenres = Object.entries(behaviorData.genrePreferences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([genre]) => genre);

        const topArtists = Object.entries(behaviorData.artistPreferences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([artist]) => artist);

        return `
            Kullanıcı müzik davranış analizi:
            - En çok dinlediği türler: ${topGenres.join(', ')}
            - En çok dinlediği sanatçılar: ${topArtists.join(', ')}
            - Toplam dinlenen şarkı sayısı: ${behaviorData.totalPlayed}
            - Beğenilen şarkı sayısı: ${behaviorData.totalLiked}
            - Ortalama dinleme süresi: ${behaviorData.averageListenTime} saniye
            
            Bu verilere göre 10 şarkı öner. Format:
            1. Şarkı Adı - Sanatçı (Tür)
            2. ...
        `;
    }

    // AI yanıtını parse et
    parseAIRecommendations(aiResponse) {
        const lines = aiResponse.split('\n').filter(line => line.trim());
        return lines.map((line, index) => {
            const match = line.match(/\d+\.\s*(.+?)\s*-\s*(.+?)\s*\((.+?)\)/);
            if (match) {
                return {
                    id: `ai-${index}`,
                    name: match[1].trim(),
                    artist: match[2].trim(),
                    genre: match[3].trim(),
                    source: 'AI_Generated',
                    reason: 'OpenAI tabanlı kişisel öneri'
                };
            }
            return null;
        }).filter(Boolean);
    }
}

// API Manager - Tüm servisleri yönet
class MusicAPIManager {
    constructor() {
        // API anahtarları (production'da environment variables'dan alınmalı)
        this.spotifyAPI = null;
        this.lastfmAPI = null;
        this.openaiAPI = null;
        
        // Demo modunda mı çalışıyor
        this.isDemoMode = true;
    }

    // API'ları başlat
    initializeAPIs(apiKeys = {}) {
        if (apiKeys.spotify) {
            this.spotifyAPI = new SpotifyAPI(apiKeys.spotify.clientId, apiKeys.spotify.clientSecret);
            this.isDemoMode = false;
        }
        
        if (apiKeys.lastfm) {
            this.lastfmAPI = new LastFmAPI(apiKeys.lastfm.apiKey);
        }
        
        if (apiKeys.openai) {
            this.openaiAPI = new OpenAIRecommendations(apiKeys.openai.apiKey);
        }
        
        console.log('Music API Manager initialized:', { 
            spotify: !!this.spotifyAPI, 
            lastfm: !!this.lastfmAPI, 
            openai: !!this.openaiAPI,
            demoMode: this.isDemoMode
        });
    }

    // Trending şarkıları getir (gerçek veriler)
    async getTrendingTracks(limit = 20) {
        if (this.isDemoMode) {
            return this.getDemoTrendingTracks(limit);
        }

        try {
            // Önce Spotify'dan dene
            if (this.spotifyAPI) {
                const spotifyTracks = await this.spotifyAPI.getTopTracks('TR', limit);
                if (spotifyTracks.length > 0) return spotifyTracks;
            }

            // Last.fm'den dene
            if (this.lastfmAPI) {
                return await this.lastfmAPI.getTopTracks('turkey', limit);
            }

            return this.getDemoTrendingTracks(limit);
        } catch (error) {
            console.error('Real API error, falling back to demo:', error);
            return this.getDemoTrendingTracks(limit);
        }
    }

    // Demo trending şarkılar
    getDemoTrendingTracks(limit = 20) {
        return sampleTracks.slice(0, limit).map(track => ({
            ...track,
            source: 'Demo',
            trending_score: Math.floor(Math.random() * 100) + 1
        }));
    }

    // Kişiselleştirilmiş öneriler
    async getPersonalizedRecommendations(userBehavior, limit = 10) {
        try {
            // OpenAI ile gelişmiş öneriler
            if (this.openaiAPI && !this.isDemoMode) {
                return await this.openaiAPI.getPersonalizedRecommendations(userBehavior, limit);
            }

            // Kural tabanlı öneriler (yerel AI)
            return generateRuleBasedRecommendations(userBehavior).slice(0, limit);
        } catch (error) {
            console.error('Personalized recommendations error:', error);
            return generateRuleBasedRecommendations(userBehavior).slice(0, limit);
        }
    }
}

// Global API Manager instance
const musicAPIManager = new MusicAPIManager();

// Gerçek API anahtarlarını ayarla (production için)
function setupRealAPIs() {
    // Bu fonksiyon gerçek API anahtarları ile çağrılabilir
    // Örnek kullanım:
    /*
    musicAPIManager.initializeAPIs({
        spotify: {
            clientId: 'YOUR_SPOTIFY_CLIENT_ID',
            clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET'
        },
        lastfm: {
            apiKey: 'YOUR_LASTFM_API_KEY'
        },
        openai: {
            apiKey: 'YOUR_OPENAI_API_KEY'
        }
    });
    */
    
    // Şu an demo modda çalışıyor
    console.log('API Setup: Demo modda çalışıyor. Gerçek API anahtarları için setupRealAPIs() fonksiyonunu kullanın.');
}

// Sayfa yüklendiğinde API'ları başlat
document.addEventListener('DOMContentLoaded', function() {
    setupRealAPIs();
});

// API Settings Modal Functionality
function setupAPISettingsModal() {
    const apiSettingsBtn = document.getElementById('api-settings-btn');
    const apiSettingsModal = document.getElementById('api-settings-modal');
    const closeApiSettings = document.getElementById('close-api-settings');
    const saveApiKeys = document.getElementById('save-api-keys');
    const clearApiKeys = document.getElementById('clear-api-keys');

    if (!apiSettingsBtn || !apiSettingsModal) return;

    // API Settings butonu click
    apiSettingsBtn.addEventListener('click', () => {
        apiSettingsModal.classList.add('show');
        loadSavedAPIKeys();
        updateAPIStatus();
    });

    // Close modal
    if (closeApiSettings) {
        closeApiSettings.addEventListener('click', () => {
            apiSettingsModal.classList.remove('show');
        });
    }

    // Modal dışına click ile kapat
    apiSettingsModal.addEventListener('click', (e) => {
        if (e.target === apiSettingsModal) {
            apiSettingsModal.classList.remove('show');
        }
    });

    // API anahtarlarını kaydet
    if (saveApiKeys) {
        saveApiKeys.addEventListener('click', () => {
            saveAPIKeys();
        });
    }

    // API anahtarlarını temizle
    if (clearApiKeys) {
        clearApiKeys.addEventListener('click', () => {
            clearAllAPIKeys();
        });
    }

    // ESC tuşu ile kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && apiSettingsModal.classList.contains('show')) {
            apiSettingsModal.classList.remove('show');
        }
    });
}

// Kaydedilmiş API anahtarlarını yükle
function loadSavedAPIKeys() {
    try {
        const savedKeys = localStorage.getItem('musicAPIKeys');
        if (savedKeys) {
            const keys = JSON.parse(savedKeys);
            
            if (keys.spotify) {
                document.getElementById('spotify-client-id').value = keys.spotify.clientId || '';
                document.getElementById('spotify-client-secret').value = keys.spotify.clientSecret || '';
            }
            
            if (keys.lastfm) {
                document.getElementById('lastfm-api-key').value = keys.lastfm.apiKey || '';
            }
            
            if (keys.openai) {
                document.getElementById('openai-api-key').value = keys.openai.apiKey || '';
            }
        }
    } catch (error) {
        console.error('API anahtarları yüklenemedi:', error);
    }
}

// API anahtarlarını kaydet ve aktifleştir
function saveAPIKeys() {
    const spotifyClientId = document.getElementById('spotify-client-id').value.trim();
    const spotifyClientSecret = document.getElementById('spotify-client-secret').value.trim();
    const lastfmApiKey = document.getElementById('lastfm-api-key').value.trim();
    const openaiApiKey = document.getElementById('openai-api-key').value.trim();

    const apiKeys = {};

    // Spotify anahtarları
    if (spotifyClientId && spotifyClientSecret) {
        apiKeys.spotify = {
            clientId: spotifyClientId,
            clientSecret: spotifyClientSecret
        };
    }

    // Last.fm anahtarı
    if (lastfmApiKey) {
        apiKeys.lastfm = {
            apiKey: lastfmApiKey
        };
    }

    // OpenAI anahtarı
    if (openaiApiKey) {
        apiKeys.openai = {
            apiKey: openaiApiKey
        };
    }

    try {
        // LocalStorage'a kaydet
        localStorage.setItem('musicAPIKeys', JSON.stringify(apiKeys));
        
        // API Manager'ı güncelleştir
        if (Object.keys(apiKeys).length > 0) {
            musicAPIManager.initializeAPIs(apiKeys);
            
            showNotification(
                `API anahtarları kaydedildi! ${Object.keys(apiKeys).length} servis aktif.`, 
                'success'
            );
            
            // AI önerilerini yenile
            if (document.querySelector('.ai-recommendations-panel.show')) {
                setTimeout(() => {
                    loadDiscoverRecommendations();
                    loadTrendingRecommendations();
                }, 1000);
            }
        } else {
            showNotification('En az bir API anahtarı giriniz.', 'warning');
            return;
        }
        
        updateAPIStatus();
        
        // Modal'ı kapat
        document.getElementById('api-settings-modal').classList.remove('show');
        
    } catch (error) {
        console.error('API anahtarları kaydedilemedi:', error);
        showNotification('API anahtarları kaydedilemedi!', 'error');
    }
}

// API anahtarlarını temizle
function clearAllAPIKeys() {
    if (confirm('Tüm API anahtarları silinecek. Emin misiniz?')) {
        try {
            localStorage.removeItem('musicAPIKeys');
            
            // Input alanlarını temizle
            document.getElementById('spotify-client-id').value = '';
            document.getElementById('spotify-client-secret').value = '';
            document.getElementById('lastfm-api-key').value = '';
            document.getElementById('openai-api-key').value = '';
            
            // API Manager'ı sıfırla
            musicAPIManager.isDemoMode = true;
            musicAPIManager.spotifyAPI = null;
            musicAPIManager.lastfmAPI = null;
            musicAPIManager.openaiAPI = null;
            
            updateAPIStatus();
            showNotification('API anahtarları temizlendi. Demo moda geçildi.', 'info');
            
        } catch (error) {
            console.error('API anahtarları temizlenemedi:', error);
            showNotification('API anahtarları temizlenemedi!', 'error');
        }
    }
}

// API durumu güncelle
function updateAPIStatus() {
    const statusText = document.getElementById('api-status-text');
    const statusDot = document.querySelector('.status-dot');
    
    if (!statusText || !statusDot) return;
    
    try {
        const savedKeys = localStorage.getItem('musicAPIKeys');
        
        if (savedKeys && Object.keys(JSON.parse(savedKeys)).length > 0) {
            const keys = JSON.parse(savedKeys);
            const activeServices = Object.keys(keys);
            
            statusText.textContent = `Aktif Servisler: ${activeServices.join(', ')} - Gerçek veriler aktif`;
            statusDot.className = 'status-dot connected';
            
            // API Manager durumunu güncelle
            if (!musicAPIManager.spotifyAPI && !musicAPIManager.lastfmAPI && !musicAPIManager.openaiAPI) {
                musicAPIManager.initializeAPIs(keys);
            }
        } else {
            statusText.textContent = 'Demo Mode - Gerçek veriler için API anahtarları gerekli';
            statusDot.className = 'status-dot demo';
        }
    } catch (error) {
        console.error('API durumu güncellenemedi:', error);
        statusText.textContent = 'API Durumu Kontrol Edilemiyor';
        statusDot.className = 'status-dot error';
    }
}

// Sayfa yüklendiğinde kaydedilmiş API anahtarlarını kontrol et
function checkSavedAPIKeys() {
    try {
        const savedKeys = localStorage.getItem('musicAPIKeys');
        if (savedKeys) {
            const keys = JSON.parse(savedKeys);
            if (Object.keys(keys).length > 0) {
                musicAPIManager.initializeAPIs(keys);
                console.log('Kaydedilmiş API anahtarları yüklendi:', Object.keys(keys));
            }
        }
    } catch (error) {
        console.error('Kaydedilmiş API anahtarları yüklenemedi:', error);
    }
}

// Initialize API keys on page load
document.addEventListener('DOMContentLoaded', function() {
    checkSavedAPIKeys();
    setupAIDemoButton();
    setupCustomMusicPlayer();
    
    // Kısa bir süre sonra AI önerilerini başlat
    setTimeout(() => {
        if (typeof loadDiscoverRecommendations === 'function') {
            console.log('AI önerileri sistem başlatılıyor...');
        }
    }, 2000);
});

// Legacy compatibility - will be handled by player.js
function setupCustomMusicPlayer() {
    console.log('Music player setup will be handled by player.js');
}

// AI Demo Test Functionality
function setupAIDemoButton() {
    const aiDemoBtn = document.getElementById('ai-demo-btn');
    if (!aiDemoBtn) return;

    aiDemoBtn.addEventListener('click', () => {
        runAIDemo();
    });
}

// Comprehensive AI System Demo
function runAIDemo() {
    showNotification('🤖 AI Sistem Demo Başlatılıyor...', 'info');
    
    const demoSteps = [
        { action: 'simulateUserBehavior', delay: 1000, message: '📊 Kullanıcı davranışları simüle ediliyor...' },
        { action: 'testAPIConnections', delay: 2000, message: '🔗 API bağlantıları test ediliyor...' },
        { action: 'generateRecommendations', delay: 3000, message: '🎵 AI önerileri oluşturuluyor...' },
        { action: 'showResults', delay: 4000, message: '✅ AI sistem demo tamamlandı!' }
    ];

    let stepIndex = 0;
    
    function executeNextStep() {
        if (stepIndex < demoSteps.length) {
            const step = demoSteps[stepIndex];
            
            setTimeout(() => {
                showNotification(step.message, 'info');
                
                switch (step.action) {
                    case 'simulateUserBehavior':
                        simulateUserBehaviorForDemo();
                        break;
                    case 'testAPIConnections':
                        testAPIConnectionsDemo();
                        break;
                    case 'generateRecommendations':
                        generateDemoRecommendations();
                        break;
                    case 'showResults':
                        showAISystemResults();
                        break;
                }
                
                stepIndex++;
                executeNextStep();
            }, step.delay);
        }
    }
    
    executeNextStep();
}

// Simulate user behavior for demo
function simulateUserBehaviorForDemo() {
    console.log('🎯 Demo: Kullanıcı davranışları simüle ediliyor...');
    
    // Simulate various user interactions
    const demoTracks = sampleTracks.slice(0, 5);
    
    demoTracks.forEach((track, index) => {
        setTimeout(() => {
            // Simulate play
            trackUserBehavior('song_play', {
                trackId: track.id,
                trackName: track.name,
                artist: track.artist,
                playTime: 0,
                playSource: 'demo_simulation',
                timestamp: Date.now()
            });
            
            // Simulate like for some tracks
            if (index % 2 === 0) {
                trackUserBehavior('song_like', {
                    trackId: track.id,
                    trackName: track.name,
                    artist: track.artist,
                    action: 'like',
                    likeSource: 'demo_simulation',
                    timestamp: Date.now()
                });
            }
            
            // Simulate skip for some tracks
            if (index % 3 === 0) {
                trackUserBehavior('song_skip', {
                    trackId: track.id,
                    trackName: track.name,
                    artist: track.artist,
                    skipTime: 45,
                    totalDuration: 180,
                    skipPercentage: 25,
                    reason: 'demo_skip',
                    timestamp: Date.now()
                });
            }
            
        }, index * 200);
    });
    
    // Simulate search behavior
    setTimeout(() => {
        trackUserBehavior('search_query', {
            query: 'rock music demo',
            queryLength: 15,
            resultsCount: 8,
            searchType: 'demo_search',
            hasResults: true,
            timestamp: Date.now()
        });
    }, 1200);
    
    console.log('✅ Demo davranış verisi oluşturuldu');
}

// Test API connections
function testAPIConnectionsDemo() {
    console.log('🔗 Demo: API bağlantıları test ediliyor...');
    
    const apiStatus = {
        spotify: musicAPIManager.spotifyAPI !== null,
        lastfm: musicAPIManager.lastfmAPI !== null,
        openai: musicAPIManager.openaiAPI !== null,
        demoMode: musicAPIManager.isDemoMode
    };
    
    console.log('📡 API Durumu:', apiStatus);
    
    if (apiStatus.demoMode) {
        console.log('⚠️ Demo modda çalışıyor - Gerçek API anahtarları bulunamadı');
        showNotification('Demo Mode: Simüle edilmiş veriler kullanılacak', 'warning');
    } else {
        const activeAPIs = Object.keys(apiStatus).filter(key => 
            key !== 'demoMode' && apiStatus[key]
        );
        console.log('✅ Aktif API\'lar:', activeAPIs);
        showNotification(`Gerçek API\'lar aktif: ${activeAPIs.join(', ')}`, 'success');
    }
}

// Generate demo recommendations
function generateDemoRecommendations() {
    console.log('🎵 Demo: AI önerileri oluşturuluyor...');
    
    const userBehavior = getUserBehaviorSummary();
    console.log('📈 Kullanıcı davranış özeti:', userBehavior);
    
    // Generate different types of recommendations
    const recommendations = {
        discover: generateRuleBasedRecommendations(userBehavior),
        mood: aiRecommendations.mood.happy.slice(0, 3),
        similar: aiRecommendations.similar.slice(0, 3),
        trending: aiRecommendations.trending.slice(0, 3)
    };
    
    console.log('🎯 Oluşturulan öneriler:', recommendations);
    
    // Update AI recommendations display if panel is open
    const aiPanel = document.querySelector('.ai-recommendations-panel');
    if (aiPanel && aiPanel.classList.contains('show')) {
        loadDiscoverRecommendations();
        showNotification('AI önerileri güncellendi!', 'success');
    }
}

// Show AI system results
function showAISystemResults() {
    console.log('📊 Demo: AI sistem sonuçları gösteriliyor...');
    
    const behaviorData = getUserBehaviorSummary();
    const systemStatus = {
        totalInteractions: behaviorData.totalPlayed + behaviorData.totalLiked + behaviorData.totalSkipped,
        dataPoints: Object.keys(userBehaviorData).reduce((sum, key) => 
            sum + (Array.isArray(userBehaviorData[key]) ? userBehaviorData[key].length : 0), 0),
        apiStatus: musicAPIManager.isDemoMode ? 'Demo Mode' : 'Real APIs Active',
        recommendationEngine: 'Aktif'
    };
    
    console.log('🎯 AI Sistem Durumu:');
    console.log('   - Toplam Etkileşim:', systemStatus.totalInteractions);
    console.log('   - Veri Noktaları:', systemStatus.dataPoints);
    console.log('   - API Durumu:', systemStatus.apiStatus);
    console.log('   - Öneri Motoru:', systemStatus.recommendationEngine);
    
    // Enhanced insights
    const insights = getDemoBehaviorInsights();
    console.log('🧠 Kullanıcı Profili Analizi:', insights);
    
    // Show detailed results
    const resultsMessage = `
🤖 AI SİSTEM DEMO SONUÇLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ETKILEŞIM İSTATİSTİKLERİ:
   • Toplam Etkileşim: ${systemStatus.totalInteractions}
   • Veri Noktası: ${systemStatus.dataPoints}
   • Skip Oranı: ${insights.listeningProfile.skipRate}%
   • Beğeni Oranı: ${insights.listeningProfile.likeRate}%

🎵 MÜZİK TERCİHLERİ:
   • En Çok Dinlenen Türler: ${insights.preferences.topGenres.join(', ')}
   • Favori Sanatçılar: ${insights.preferences.topArtists.join(', ')}

🔗 SİSTEM DURUMU:
   • API Durumu: ${systemStatus.apiStatus}
   • Öneri Motoru: ${systemStatus.recommendationEngine}
   • Arama Aktivitesi: ${insights.engagement.searchActivity}
   • Mod Değişiklikleri: ${insights.engagement.modeChanges}

✅ AI ÖZELLIKLERI:
   ✓ Kullanıcı Davranış Takibi
   ✓ Gerçek Zamanlı Veri Toplama
   ✓ Akıllı Öneri Algoritmaları
   ✓ API Entegrasyonu Hazır
   ✓ Kişiselleştirilmiş Deneyim

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 AI MÜZİK ÖNERİ SİSTEMİ TAM ÇALIŞIR DURUMDA!
    `;
    
    console.log(resultsMessage);
    
    // Open AI recommendations panel to show results
    const aiRecommendationsBtn = document.getElementById('ai-recommendations-btn');
    if (aiRecommendationsBtn) {
        setTimeout(() => {
            aiRecommendationsBtn.click();
            showNotification('🎉 AI sistem demo başarıyla tamamlandı!', 'success');
        }, 500);
    } else {
        showNotification('AI sistem demo tamamlandı! Konsolu kontrol edin.', 'success');
    }
}

// Enhanced behavior summary for demo
function getDemoBehaviorInsights() {
    const behaviorData = getUserBehaviorSummary();
    
    return {
        listeningProfile: {
            skipRate: behaviorData.totalSkipped > 0 ? 
                (behaviorData.totalSkipped / behaviorData.totalPlayed * 100).toFixed(1) : 0,
            likeRate: behaviorData.totalLiked > 0 ? 
                (behaviorData.totalLiked / behaviorData.totalPlayed * 100).toFixed(1) : 0,
            avgListenTime: behaviorData.averageListenTime
        },
        preferences: {
            topGenres: Object.entries(behaviorData.genrePreferences)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([genre]) => genre),
            topArtists: Object.entries(behaviorData.artistPreferences)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([artist]) => artist)
        },
        engagement: {
            totalSessions: behaviorData.totalPlayed,
            searchActivity: userBehaviorData.searchHistory.length,
            modeChanges: userBehaviorData.playbackModes.length
        }
    };
}

console.log('🤖 AI Recommendation System initialized!')

// Global Playlist Functions
function showCreatePlaylist() {
    // Eğer playlists sayfasındaysak direkt modal'ı aç
    if (window.location.pathname.includes('playlists.html')) {
        if (typeof window.showCreatePlaylist !== 'undefined') {
            return; // playlists.js'teki fonksiyon çalışacak
        }
    }
    
    // Diğer sayfalardaysa playlists sayfasına yönlendir
    window.location.href = 'playlists.html#create';
}