// Modern Settings System - Profesyonel Ayarlar Sistemi

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.themes = {
            dark: {
                primary: '#4ecdc4',
                background: '#1a1a2e',
                surface: '#16213e',
                text: '#ffffff',
                textSecondary: 'rgba(255,255,255,0.7)'
            },
            light: {
                primary: '#4ecdc4', 
                background: '#ffffff',
                surface: '#f8f9fa',
                text: '#333333',
                textSecondary: 'rgba(0,0,0,0.7)'
            },
            purple: {
                primary: '#8b5cf6',
                background: '#0f0f23',
                surface: '#1a1a2e',
                text: '#ffffff',
                textSecondary: 'rgba(255,255,255,0.7)'
            },
            blue: {
                primary: '#3b82f6',
                background: '#0a0e27',
                surface: '#151b3d',
                text: '#ffffff', 
                textSecondary: 'rgba(255,255,255,0.7)'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createSettingsModal();
        this.setupEventListeners();
        this.setupAudioFilters();
        this.applySettings();
        this.addSettingsButtonToAllPages();
    }
    
    loadSettings() {
        const defaultSettings = {
            theme: 'dark',
            language: 'tr',
            audioQuality: 'high',
            autoplay: true,
            shuffle: false,
            repeat: 'off',
            crossfade: true,
            volume: 70,
            bass: 0,
            treble: 0,
            notifications: true,
            updates: true,
            analytics: false,
            showLyrics: true,
            miniPlayer: true
        };
        
        try {
            const saved = localStorage.getItem('music-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            return defaultSettings;
        }
    }
    
    saveSettings() {
        localStorage.setItem('music-settings', JSON.stringify(this.settings));
        this.applySettings();
        this.showNotification('Ayarlar kaydedildi', 'success');
    }
    
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal settings-modal';
        modal.innerHTML = `
            <div class="modal-content settings-content">
                <div class="settings-header">
                    <h2><i class="fas fa-cog"></i> Ayarlar</h2>
                    <button class="close-btn" id="close-settings">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="settings-body">
                    <div class="settings-sidebar">
                        <nav class="settings-nav">
                            <button class="settings-nav-item active" data-section="appearance">
                                <i class="fas fa-palette"></i>
                                <span>Görünüm</span>
                            </button>
                            <button class="settings-nav-item" data-section="audio">
                                <i class="fas fa-volume-up"></i>
                                <span>Ses</span>
                            </button>
                            <button class="settings-nav-item" data-section="playback">
                                <i class="fas fa-play"></i>
                                <span>Oynatma</span>
                            </button>
                            <button class="settings-nav-item" data-section="account">
                                <i class="fas fa-user"></i>
                                <span>Hesap</span>
                            </button>
                            <button class="settings-nav-item" data-section="privacy">
                                <i class="fas fa-shield-alt"></i>
                                <span>Gizlilik</span>
                            </button>
                            <button class="settings-nav-item" data-section="advanced">
                                <i class="fas fa-cogs"></i>
                                <span>Gelişmiş</span>
                            </button>
                        </nav>
                    </div>
                    
                    <div class="settings-main">
                        ${this.createAppearanceSection()}
                        ${this.createAudioSection()}
                        ${this.createPlaybackSection()}
                        ${this.createAccountSection()}
                        ${this.createPrivacySection()}
                        ${this.createAdvancedSection()}
                    </div>
                </div>
                
                <div class="settings-footer">
                    <button class="btn secondary" id="reset-settings">
                        <i class="fas fa-undo"></i>
                        Sıfırla
                    </button>
                    <div class="footer-actions">
                        <button class="btn secondary" id="cancel-settings">İptal</button>
                        <button class="btn primary" id="save-settings">
                            <i class="fas fa-save"></i>
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    createAppearanceSection() {
        return `
            <div class="settings-section active" id="appearance">
                <div class="section-header">
                    <h3>Görünüm & Tema</h3>
                    <p>Arayüzün görünümünü özelleştirin</p>
                </div>
                
                <div class="setting-group">
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Tema</label>
                            <span>Arayüz temasını seçin</span>
                        </div>
                        <div class="theme-selector">
                            <div class="theme-option ${this.settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                                <div class="theme-preview dark-theme">
                                    <div class="theme-color" style="background: #4ecdc4;"></div>
                                    <div class="theme-bg" style="background: #1a1a2e;"></div>
                                </div>
                                <span>Koyu</span>
                            </div>
                            <div class="theme-option ${this.settings.theme === 'light' ? 'active' : ''}" data-theme="light">
                                <div class="theme-preview light-theme">
                                    <div class="theme-color" style="background: #4ecdc4;"></div>
                                    <div class="theme-bg" style="background: #ffffff;"></div>
                                </div>
                                <span>Açık</span>
                            </div>
                            <div class="theme-option ${this.settings.theme === 'purple' ? 'active' : ''}" data-theme="purple">
                                <div class="theme-preview purple-theme">
                                    <div class="theme-color" style="background: #8b5cf6;"></div>
                                    <div class="theme-bg" style="background: #0f0f23;"></div>
                                </div>
                                <span>Mor</span>
                            </div>
                            <div class="theme-option ${this.settings.theme === 'blue' ? 'active' : ''}" data-theme="blue">
                                <div class="theme-preview blue-theme">
                                    <div class="theme-color" style="background: #3b82f6;"></div>
                                    <div class="theme-bg" style="background: #0a0e27;"></div>
                                </div>
                                <span>Mavi</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Dil</label>
                            <span>Arayüz dili</span>
                        </div>
                        <select class="setting-select" id="language-select">
                            <option value="tr" ${this.settings.language === 'tr' ? 'selected' : ''}>Türkçe</option>
                            <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Mini Oynatıcı</label>
                            <span>Küçük pencerede oynatıcı göster</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="mini-player" ${this.settings.miniPlayer ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    createAudioSection() {
        return `
            <div class="settings-section" id="audio">
                <div class="section-header">
                    <h3>Ses Ayarları</h3>
                    <p>Ses kalitesi ve efektlerini ayarlayın</p>
                </div>
                
                <div class="setting-group">
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Ses Kalitesi</label>
                            <span>Oynatma kalitesi</span>
                        </div>
                        <select class="setting-select" id="audio-quality">
                            <option value="low" ${this.settings.audioQuality === 'low' ? 'selected' : ''}>Düşük (128 kbps)</option>
                            <option value="medium" ${this.settings.audioQuality === 'medium' ? 'selected' : ''}>Orta (256 kbps)</option>
                            <option value="high" ${this.settings.audioQuality === 'high' ? 'selected' : ''}>Yüksek (320 kbps)</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Ses Seviyesi</label>
                            <span>Ana ses seviyesi: %${this.settings.volume}</span>
                        </div>
                        <div class="range-control">
                            <input type="range" id="volume-setting" min="0" max="100" value="${this.settings.volume}" class="setting-range">
                            <span class="range-value">${this.settings.volume}%</span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Bass</label>
                            <span>Düşük frekansları ayarla</span>
                        </div>
                        <div class="range-control">
                            <input type="range" id="bass-setting" min="-10" max="10" value="${this.settings.bass}" class="setting-range">
                            <span class="range-value">${this.settings.bass > 0 ? '+' : ''}${this.settings.bass} dB</span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Treble</label>
                            <span>Yüksek frekansları ayarla</span>
                        </div>
                        <div class="range-control">
                            <input type="range" id="treble-setting" min="-10" max="10" value="${this.settings.treble}" class="setting-range">
                            <span class="range-value">${this.settings.treble > 0 ? '+' : ''}${this.settings.treble} dB</span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Crossfade</label>
                            <span>Şarkılar arası yumuşak geçiş</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="crossfade" ${this.settings.crossfade ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    createPlaybackSection() {
        return `
            <div class="settings-section" id="playback">
                <div class="section-header">
                    <h3>Oynatma Ayarları</h3>
                    <p>Müzik oynatma tercihlerinizi belirleyin</p>
                </div>
                
                <div class="setting-group">
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Otomatik Oynat</label>
                            <span>Sayfa açıldığında müziği başlat</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="autoplay" ${this.settings.autoplay ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Karıştır</label>
                            <span>Şarkıları karışık çal</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="shuffle" ${this.settings.shuffle ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Tekrar Modu</label>
                            <span>Oynatma tekrarı</span>
                        </div>
                        <select class="setting-select" id="repeat-mode">
                            <option value="off" ${this.settings.repeat === 'off' ? 'selected' : ''}>Kapalı</option>
                            <option value="one" ${this.settings.repeat === 'one' ? 'selected' : ''}>Tek Şarkı</option>
                            <option value="all" ${this.settings.repeat === 'all' ? 'selected' : ''}>Tümü</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Şarkı Sözlerini Göster</label>
                            <span>Oynatma sırasında sözleri görüntüle</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="show-lyrics" ${this.settings.showLyrics ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    createAccountSection() {
        return `
            <div class="settings-section" id="account">
                <div class="section-header">
                    <h3>Hesap Yönetimi</h3>
                    <p>Profil ve hesap ayarlarınız</p>
                </div>
                
                <div class="setting-group">
                    <div class="account-info">
                        <div class="avatar-section">
                            <div class="avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <button class="btn secondary small">Fotoğraf Değiştir</button>
                        </div>
                        <div class="user-info">
                            <h4>Kullanıcı Adı</h4>
                            <p>user@example.com</p>
                            <button class="btn secondary small">Profil Düzenle</button>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <button class="btn secondary full-width">
                            <i class="fas fa-key"></i>
                            Şifre Değiştir
                        </button>
                    </div>
                    
                    <div class="setting-item">
                        <button class="btn secondary full-width">
                            <i class="fas fa-download"></i>
                            Verilerimi İndir
                        </button>
                    </div>
                    
                    <div class="setting-item danger">
                        <button class="btn danger full-width">
                            <i class="fas fa-sign-out-alt"></i>
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    createPrivacySection() {
        return `
            <div class="settings-section" id="privacy">
                <div class="section-header">
                    <h3>Gizlilik & Güvenlik</h3>
                    <p>Veri paylaşımı ve gizlilik tercihleriniz</p>
                </div>
                
                <div class="setting-group">
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Bildirimler</label>
                            <span>Yeni özellikler ve güncellemeler hakkında bilgi al</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="notifications" ${this.settings.notifications ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Analitik Veriler</label>
                            <span>Uygulamayı geliştirmek için anonim veri paylaş</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="analytics" ${this.settings.analytics ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Otomatik Güncellemeler</label>
                            <span>Yeni sürümleri otomatik kontrol et</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="updates" ${this.settings.updates ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    createAdvancedSection() {
        return `
            <div class="settings-section" id="advanced">
                <div class="section-header">
                    <h3>Gelişmiş Ayarlar</h3>
                    <p>Teknik ayarlar ve geliştirici seçenekleri</p>
                </div>
                
                <div class="setting-group">
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Önbellek Temizle</label>
                            <span>Geçici dosyaları ve önbelleği temizle</span>
                        </div>
                        <button class="btn secondary">Temizle</button>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Veritabanını Sıfırla</label>
                            <span>Tüm yerel verileri sil</span>
                        </div>
                        <button class="btn danger">Sıfırla</button>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Debug Modu</label>
                            <span>Geliştirici konsol mesajlarını göster</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="debug-mode">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="app-info">
                        <h4>Uygulama Bilgileri</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Sürüm:</span>
                                <span class="value">1.0.0</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Son Güncelleme:</span>
                                <span class="value">10 Ekim 2025</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Settings butonu click handler
        document.addEventListener('click', (e) => {
            if (e.target.closest('.settings-trigger')) {
                this.showSettings();
            }
        });
        
        // Modal event listeners
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('settings-modal');
            if (!modal) return;
            
            // Close modal
            if (e.target.id === 'close-settings' || 
                e.target.id === 'cancel-settings' ||
                (e.target === modal && !e.target.closest('.settings-content'))) {
                this.hideSettings();
            }
            
            // Save settings
            if (e.target.id === 'save-settings') {
                this.collectAndSaveSettings();
            }
            
            // Reset settings
            if (e.target.id === 'reset-settings') {
                this.resetSettings();
            }
            
            // Navigation
            if (e.target.closest('.settings-nav-item')) {
                const section = e.target.closest('.settings-nav-item').dataset.section;
                this.switchSection(section);
            }
            
            // Theme selection
            if (e.target.closest('.theme-option')) {
                const theme = e.target.closest('.theme-option').dataset.theme;
                this.previewTheme(theme);
            }
        });
        
        // Range inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('setting-range')) {
                const value = e.target.value;
                const label = e.target.parentElement.querySelector('.range-value');
                if (e.target.id === 'volume-setting') {
                    label.textContent = `${value}%`;
                    // Apply volume in real-time
                    if (window.audioPlayer) {
                        window.audioPlayer.volume = value / 100;
                    }
                } else if (e.target.id === 'bass-setting' || e.target.id === 'treble-setting') {
                    label.textContent = `${value > 0 ? '+' : ''}${value} dB`;
                    // Apply equalizer in real-time
                    if (window.audioContext && this.audioFilters) {
                        if (e.target.id === 'bass-setting') {
                            this.audioFilters.bass.gain.setValueAtTime(value, window.audioContext.currentTime);
                        } else {
                            this.audioFilters.treble.gain.setValueAtTime(value, window.audioContext.currentTime);
                        }
                    }
                }
            }
        });
        
        // Account management buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn')) {
                const btn = e.target.closest('.btn');
                const text = btn.textContent.trim();
                
                if (text.includes('Şifre Değiştir')) {
                    this.showChangePasswordModal();
                } else if (text.includes('Profil Düzenle')) {
                    this.showEditProfileModal();
                } else if (text.includes('Verilerimi İndir')) {
                    this.downloadUserData();
                } else if (text.includes('Çıkış Yap')) {
                    this.logout();
                } else if (text.includes('Fotoğraf Değiştir')) {
                    this.changeProfilePicture();
                } else if (text.includes('Temizle') && btn.closest('.setting-item')) {
                    this.clearCache();
                } else if (text.includes('Sıfırla') && btn.classList.contains('danger')) {
                    this.resetDatabase();
                }
            }
        });
    }
    
    showSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    switchSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }
    
    previewTheme(themeName) {
        // Update theme selection UI
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        // Preview theme (temporary)
        this.applyTheme(themeName);
    }
    
    collectAndSaveSettings() {
        // Collect all form values
        const modal = document.getElementById('settings-modal');
        
        // Theme
        const activeTheme = modal.querySelector('.theme-option.active');
        if (activeTheme) {
            this.settings.theme = activeTheme.dataset.theme;
        }
        
        // Other settings
        this.settings.language = modal.querySelector('#language-select')?.value || this.settings.language;
        this.settings.audioQuality = modal.querySelector('#audio-quality')?.value || this.settings.audioQuality;
        this.settings.volume = parseInt(modal.querySelector('#volume-setting')?.value || this.settings.volume);
        this.settings.bass = parseInt(modal.querySelector('#bass-setting')?.value || this.settings.bass);
        this.settings.treble = parseInt(modal.querySelector('#treble-setting')?.value || this.settings.treble);
        this.settings.autoplay = modal.querySelector('#autoplay')?.checked || false;
        this.settings.shuffle = modal.querySelector('#shuffle')?.checked || false;
        this.settings.repeat = modal.querySelector('#repeat-mode')?.value || this.settings.repeat;
        this.settings.crossfade = modal.querySelector('#crossfade')?.checked || false;
        this.settings.showLyrics = modal.querySelector('#show-lyrics')?.checked || false;
        this.settings.miniPlayer = modal.querySelector('#mini-player')?.checked || false;
        this.settings.notifications = modal.querySelector('#notifications')?.checked || false;
        this.settings.analytics = modal.querySelector('#analytics')?.checked || false;
        this.settings.updates = modal.querySelector('#updates')?.checked || false;
        
        this.saveSettings();
        this.hideSettings();
        
        // Apply playback settings immediately
        this.syncWithPlayer();
    }
    
    syncWithPlayer() {
        // Sync shuffle state
        if (typeof window.toggleShuffle === 'function' && window.isShuffled !== this.settings.shuffle) {
            window.toggleShuffle();
        }
        
        // Sync repeat state  
        if (typeof window.toggleRepeat === 'function') {
            const currentRepeat = window.isRepeating;
            const targetRepeat = this.settings.repeat;
            
            if ((currentRepeat === false && targetRepeat !== 'off') ||
                (currentRepeat === true && targetRepeat === 'off')) {
                window.toggleRepeat();
            }
        }
        
        // Sync volume
        if (window.audioPlayer) {
            window.audioPlayer.volume = this.settings.volume / 100;
            const volumeSlider = document.querySelector('.volume-slider, #volume-slider');
            if (volumeSlider) {
                volumeSlider.value = this.settings.volume;
            }
        }
        
        // Update current volume display
        window.currentVolume = this.settings.volume / 100;
        
        // Sync crossfade setting
        window.crossfadeEnabled = this.settings.crossfade;
    }
    
    resetSettings() {
        if (confirm('Tüm ayarlar varsayılan değerlere sıfırlanacak. Devam etmek istiyor musunuz?')) {
            localStorage.removeItem('music-settings');
            this.settings = this.loadSettings();
            this.hideSettings();
            location.reload();
        }
    }
    
    applySettings() {
        this.applyTheme(this.settings.theme);
        this.applyAudioSettings();
        this.applyPlaybackSettings();
    }
    
    applyAudioSettings() {
        // Apply volume
        if (window.audioPlayer) {
            window.audioPlayer.volume = this.settings.volume / 100;
        }
        
        // Apply equalizer settings
        if (window.audioContext && this.audioFilters) {
            this.audioFilters.bass.gain.setValueAtTime(this.settings.bass, window.audioContext.currentTime);
            this.audioFilters.treble.gain.setValueAtTime(this.settings.treble, window.audioContext.currentTime);
        }
        
        // Update volume slider in player if exists
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.settings.volume;
        }
    }
    
    applyPlaybackSettings() {
        // Apply autoplay
        if (this.settings.autoplay && window.audioPlayer && !window.audioPlayer.paused) {
            // Already handled in player initialization
        }
        
        // Apply shuffle
        if (window.isShuffled !== this.settings.shuffle) {
            window.isShuffled = this.settings.shuffle;
            const shuffleBtn = document.querySelector('.shuffle-btn');
            if (shuffleBtn) {
                shuffleBtn.classList.toggle('active', this.settings.shuffle);
            }
        }
        
        // Apply repeat mode
        if (window.isRepeating !== this.settings.repeat) {
            window.isRepeating = this.settings.repeat;
            const repeatBtn = document.querySelector('.repeat-btn');
            if (repeatBtn) {
                repeatBtn.classList.toggle('active', this.settings.repeat !== 'off');
                repeatBtn.dataset.mode = this.settings.repeat;
            }
        }
    }
    
    setupAudioFilters() {
        if (!window.audioContext) return;
        
        try {
            // Create audio filters for equalizer
            this.audioFilters = {
                bass: window.audioContext.createBiquadFilter(),
                treble: window.audioContext.createBiquadFilter()
            };
            
            // Configure bass filter
            this.audioFilters.bass.type = 'lowshelf';
            this.audioFilters.bass.frequency.setValueAtTime(320, window.audioContext.currentTime);
            
            // Configure treble filter  
            this.audioFilters.treble.type = 'highshelf';
            this.audioFilters.treble.frequency.setValueAtTime(3200, window.audioContext.currentTime);
            
            // Connect filters if audio source exists
            if (window.audioSource) {
                window.audioSource.connect(this.audioFilters.bass);
                this.audioFilters.bass.connect(this.audioFilters.treble);
                this.audioFilters.treble.connect(window.audioContext.destination);
            }
        } catch (error) {
            console.log('Audio filters not supported');
        }
    }
    
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;
        
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--bg-color', theme.background);
        root.style.setProperty('--surface-color', theme.surface);
        root.style.setProperty('--text-color', theme.text);
        root.style.setProperty('--text-secondary-color', theme.textSecondary);
        
        document.body.className = `theme-${themeName}`;
    }
    
    addSettingsButtonToAllPages() {
        // Header'a settings butonu ekle
        const headers = document.querySelectorAll('.header-right, .top-header .header-right');
        headers.forEach(header => {
            if (!header.querySelector('.settings-trigger')) {
                const settingsBtn = document.createElement('button');
                settingsBtn.className = 'settings-trigger control-btn';
                settingsBtn.title = 'Ayarlar';
                settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
                header.appendChild(settingsBtn);
            }
        });
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
    
    showChangePasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'modal password-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Şifre Değiştir</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label>Mevcut Şifre</label>
                        <input type="password" id="current-password" placeholder="Mevcut şifrenizi girin">
                    </div>
                    <div class="input-group">
                        <label>Yeni Şifre</label>
                        <input type="password" id="new-password" placeholder="Yeni şifrenizi girin">
                    </div>
                    <div class="input-group">
                        <label>Yeni Şifre (Tekrar)</label>
                        <input type="password" id="confirm-password" placeholder="Yeni şifreyi tekrar girin">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn secondary" onclick="this.closest('.modal').remove()">İptal</button>
                    <button class="btn primary" onclick="settingsManager.changePassword()">Değiştir</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showEditProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal profile-modal active';
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
                        <input type="text" id="edit-username" value="Kullanıcı" placeholder="Kullanıcı adınız">
                    </div>
                    <div class="input-group">
                        <label>E-posta</label>
                        <input type="email" id="edit-email" value="user@example.com" placeholder="E-posta adresiniz">
                    </div>
                    <div class="input-group">
                        <label>Bio</label>
                        <textarea id="edit-bio" placeholder="Kendiniz hakkında kısa bilgi"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn secondary" onclick="this.closest('.modal').remove()">İptal</button>
                    <button class="btn primary" onclick="settingsManager.updateProfile()">Kaydet</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    changePassword() {
        const current = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;
        
        if (!current || !newPass || !confirm) {
            this.showNotification('Tüm alanları doldurunuz', 'error');
            return;
        }
        
        if (newPass !== confirm) {
            this.showNotification('Yeni şifreler eşleşmiyor', 'error');
            return;
        }
        
        if (newPass.length < 6) {
            this.showNotification('Şifre en az 6 karakter olmalı', 'error');
            return;
        }
        
        // Simulate password change
        setTimeout(() => {
            document.querySelector('.password-modal').remove();
            this.showNotification('Şifre başarıyla değiştirildi', 'success');
        }, 1000);
    }
    
    updateProfile() {
        const username = document.getElementById('edit-username').value;
        const email = document.getElementById('edit-email').value;
        const bio = document.getElementById('edit-bio').value;
        
        if (!username || !email) {
            this.showNotification('Kullanıcı adı ve e-posta gereklidir', 'error');
            return;
        }
        
        // Save to localStorage
        const profile = { username, email, bio, updatedAt: new Date().toISOString() };
        localStorage.setItem('user-profile', JSON.stringify(profile));
        
        document.querySelector('.profile-modal').remove();
        this.showNotification('Profil başarıyla güncellendi', 'success');
    }
    
    changeProfilePicture() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    localStorage.setItem('user-avatar', e.target.result);
                    this.showNotification('Profil fotoğrafı güncellendi', 'success');
                    // Update avatar in UI
                    const avatar = document.querySelector('.avatar');
                    if (avatar) {
                        avatar.style.backgroundImage = `url(${e.target.result})`;
                        avatar.style.backgroundSize = 'cover';
                        avatar.innerHTML = '';
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
    
    downloadUserData() {
        const data = {
            settings: this.settings,
            favorites: JSON.parse(localStorage.getItem('music-favorites') || '[]'),
            playlists: JSON.parse(localStorage.getItem('user-playlists') || '[]'),
            profile: JSON.parse(localStorage.getItem('user-profile') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `muziksite-verileri-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Veriler indirildi', 'success');
    }
    
    logout() {
        if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            // Clear session data but keep settings and favorites
            sessionStorage.clear();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('rememberUser');
            localStorage.removeItem('user-profile');
            localStorage.removeItem('user-avatar');
            
            this.showNotification('Başarıyla çıkış yapıldı', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
    
    clearCache() {
        // Clear non-essential data
        const keysToKeep = ['music-settings', 'music-favorites', 'user-playlists'];
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!keysToKeep.includes(key)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        this.showNotification('Önbellek temizlendi', 'success');
    }
    
    resetDatabase() {
        if (confirm('Bu işlem tüm verilerinizi silecek. Bu işlem geri alınamaz!')) {
            if (confirm('Gerçekten tüm verileri silmek istediğinize emin misiniz?')) {
                localStorage.clear();
                sessionStorage.clear();
                this.showNotification('Tüm veriler silindi', 'success');
                setTimeout(() => location.reload(), 2000);
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});