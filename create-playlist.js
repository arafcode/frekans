// create-playlist.js - Yeni çalma listesi oluşturma sayfası

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 Create Playlist sayfası yüklendi');
    
    // Kullanıcı girişi kontrolü
    const currentUser = checkUserSession();
    if (!currentUser) {
        console.log('No user session, redirecting to login...');
        return;
    }
    
    // Form elementlerini al
    const form = document.getElementById('create-playlist-form');
    const nameInput = document.getElementById('playlist-name');
    const descInput = document.getElementById('playlist-description');
    const privacySelect = document.getElementById('playlist-privacy');
    const selectedCoverInput = document.getElementById('selected-cover');
    
    // Karakter sayaçları
    nameInput.addEventListener('input', function() {
        updateCharCounter('playlist-name', 'name-char-count', 50);
        updatePreview();
        // Hata temizle
        const nameError = document.getElementById('name-error');
        if (nameError && this.value.trim()) {
            nameError.textContent = '';
            this.classList.remove('error');
        }
    });
    
    descInput.addEventListener('input', function() {
        updateCharCounter('playlist-description', 'desc-char-count', 200);
        updatePreview();
    });
    
    privacySelect.addEventListener('change', function() {
        updatePreview();
    });
    
    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createPlaylist();
    });
    
    // İlk önizlemeyi güncelle
    updatePreview();
    
    // İlk input'a focus
    nameInput.focus();
});

// Karakter sayacı güncelle
function updateCharCounter(inputId, counterId, maxLength) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    
    if (input && counter) {
        const currentLength = input.value.length;
        counter.textContent = currentLength;
        
        // Limit yaklaşınca renk değiştir
        if (currentLength >= maxLength * 0.9) {
            counter.style.color = '#ff6b6b';
        } else {
            counter.style.color = 'rgba(255, 255, 255, 0.5)';
        }
    }
}

// Kapak seçimi
function selectCover(element, coverType) {
    console.log('Kapak seçildi:', coverType);
    
    // Tüm cover'lardan selected class'ını kaldır
    document.querySelectorAll('.cover-option').forEach(cover => {
        cover.classList.remove('selected');
    });
    
    // Seçilen cover'a ekle
    element.classList.add('selected');
    
    // Hidden input'a kaydet
    document.getElementById('selected-cover').value = coverType;
    
    // Önizlemeyi güncelle
    updatePreview();
}

// Önizleme güncelle
function updatePreview() {
    const nameInput = document.getElementById('playlist-name');
    const descInput = document.getElementById('playlist-description');
    const privacySelect = document.getElementById('playlist-privacy');
    const selectedCover = document.getElementById('selected-cover').value;
    
    const previewName = document.getElementById('preview-name');
    const previewDesc = document.getElementById('preview-desc');
    const previewPrivacy = document.getElementById('preview-privacy');
    const previewCover = document.getElementById('preview-cover');
    
    // İsim
    if (nameInput.value.trim()) {
        previewName.textContent = nameInput.value.trim();
    } else {
        previewName.textContent = 'Yeni Çalma Listesi';
    }
    
    // Açıklama
    if (descInput.value.trim()) {
        previewDesc.textContent = descInput.value.trim();
    } else {
        previewDesc.textContent = 'Açıklama yok';
    }
    
    // Gizlilik
    if (privacySelect.value === 'private') {
        previewPrivacy.innerHTML = '<i class="fas fa-lock"></i> Özel';
    } else {
        previewPrivacy.innerHTML = '<i class="fas fa-globe"></i> Herkese Açık';
    }
    
    // Kapak
    const coverClasses = {
        'gradient1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient6': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    };
    
    previewCover.style.background = coverClasses[selectedCover] || coverClasses['gradient1'];
}

// Kapak resmi URL'si al
function getCoverImageUrl(coverType) {
    const coverMap = {
        'gradient1': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
        'gradient2': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
        'gradient3': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        'gradient4': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        'gradient5': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
        'gradient6': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400'
    };
    
    return coverMap[coverType] || coverMap['gradient1'];
}

// Form validasyonu
function validateForm() {
    const nameInput = document.getElementById('playlist-name');
    const nameError = document.getElementById('name-error');
    
    // İsim kontrolü
    if (!nameInput.value.trim()) {
        nameError.textContent = '⚠️ Liste adı zorunludur';
        nameInput.classList.add('error');
        nameInput.focus();
        
        // Scroll to error
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    
    // İsim uzunluk kontrolü
    if (nameInput.value.trim().length < 2) {
        nameError.textContent = '⚠️ Liste adı en az 2 karakter olmalıdır';
        nameInput.classList.add('error');
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    
    // Hataları temizle
    nameError.textContent = '';
    nameInput.classList.remove('error');
    
    return true;
}

// Çalma listesi oluştur
function createPlaylist() {
    console.log('🎵 createPlaylist çağrıldı');
    
    // Validasyon
    if (!validateForm()) {
        console.log('❌ Form validasyonu başarısız');
        return;
    }
    
    // Form verilerini al
    const nameInput = document.getElementById('playlist-name');
    const descInput = document.getElementById('playlist-description');
    const privacySelect = document.getElementById('playlist-privacy');
    const selectedCoverInput = document.getElementById('selected-cover');
    
    const name = nameInput.value.trim();
    const description = descInput.value.trim() || 'Açıklama yok';
    const privacy = privacySelect.value;
    const coverType = selectedCoverInput.value;
    
    console.log('📋 Form verileri:', { name, description, privacy, coverType });
    
    // Button loading state
    const createBtn = document.getElementById('create-btn');
    const originalBtnText = createBtn.innerHTML;
    createBtn.disabled = true;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Oluşturuluyor...';
    
    try {
        // Mevcut listeleri al
        const storedPlaylists = localStorage.getItem('userPlaylists');
        let playlists = storedPlaylists ? JSON.parse(storedPlaylists) : [];
        
        // Yeni liste oluştur
        const newPlaylist = {
            id: Date.now(),
            name: name,
            description: description,
            image: getCoverImageUrl(coverType),
            coverType: coverType,
            trackCount: 0,
            duration: '0 dk',
            isDefault: false,
            privacy: privacy,
            createdDate: new Date().toISOString().split('T')[0],
            tracks: []
        };
        
        console.log('📦 Yeni playlist:', newPlaylist);
        
        // Listeye ekle (başa)
        playlists.unshift(newPlaylist);
        
        // LocalStorage'a kaydet
        localStorage.setItem('userPlaylists', JSON.stringify(playlists));
        
        console.log('✅ Playlist kaydedildi, toplam:', playlists.length);
        
        // Success message için flag
        sessionStorage.setItem('playlistCreated', JSON.stringify({
            name: name,
            id: newPlaylist.id
        }));
        
        // Başarı bildirimi göster
        if (typeof showNotification === 'function') {
            showNotification(`✨ "${name}" çalma listesi oluşturuldu!`, 'success');
        }
        
        // 500ms sonra playlists sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'playlists.html';
        }, 500);
        
    } catch (error) {
        console.error('❌ Playlist oluşturma hatası:', error);
        
        // Button'u eski haline getir
        createBtn.disabled = false;
        createBtn.innerHTML = originalBtnText;
        
        // Error notification
        if (typeof showNotification === 'function') {
            showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        } else {
            alert('❌ Çalma listesi oluşturulurken bir hata oluştu!');
        }
    }
}

// Global scope'a ekle
window.selectCover = selectCover;
window.createPlaylist = createPlaylist;
