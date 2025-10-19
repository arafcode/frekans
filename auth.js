// Authentication JavaScript - Modern Giriş Sistemi

// Admin Bilgileri (Gerçek projede veritabanında olacak)
const adminCredentials = {
    email: 'admin@muziksite.com',
    password: 'admin123',
    name: 'Admin Kullanıcı'
};

// Kullanıcı veritabanı simülasyonu
let users = [
    adminCredentials,
    {
        email: 'demo@muziksite.com',
        password: 'demo123',
        name: 'Demo Kullanıcı'
    }
];

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAutoLogin();
    setupPasswordStrength();
});

// Event Listener'ları Kurma
function setupEventListeners() {
    // Giriş formu
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    
    // Kayıt formu
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    
    // Şifremi unuttum formları
    const forgotEmailForm = document.getElementById('forgotEmailForm');
    const forgotCodeForm = document.getElementById('forgotCodeForm');
    const newPasswordForm = document.getElementById('newPasswordForm');
    
    if (forgotEmailForm) {
        forgotEmailForm.addEventListener('submit', handleForgotEmail);
    }
    if (forgotCodeForm) {
        forgotCodeForm.addEventListener('submit', handleVerifyCode);
    }
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', handleNewPassword);
    }
    
    // Doğrulama kodu inputları
    setupCodeInputs();
    
    // Sosyal medya butonları
    document.querySelector('.social-btn.google').addEventListener('click', () => {
        showNotification('Google girişi henüz aktif değil', 'info');
    });
    
    document.querySelector('.social-btn.facebook').addEventListener('click', () => {
        showNotification('Facebook girişi henüz aktif değil', 'info');
    });
    
    // Enter tuşu ile form gönderme
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeForm = document.querySelector('.form-wrapper:not(.hidden)');
            if (activeForm) {
                const submitBtn = activeForm.querySelector('.auth-btn.primary');
                if (submitBtn) submitBtn.click();
            }
        }
    });
}

// Otomatik giriş kontrolü
function checkAutoLogin() {
    const autoLogin = localStorage.getItem('autoLogin');
    const rememberedUser = localStorage.getItem('rememberedUser');
    
    if (autoLogin === 'true' && rememberedUser) {
        const userData = JSON.parse(rememberedUser);
        
        // Son giriş 30 gün içindeyse otomatik giriş yap
        const lastLogin = localStorage.getItem('lastLoginTime');
        if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const now = new Date();
            const daysDiff = (now - lastLoginDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff <= 30) {
                // Otomatik giriş
                performAutoLogin(userData);
                return;
            }
        }
    }
    
    // Otomatik giriş yoksa, sadece e-posta alanını doldur
    if (rememberedUser) {
        const userData = JSON.parse(rememberedUser);
        document.getElementById('loginEmail').value = userData.email;
        document.getElementById('rememberMe').checked = userData.rememberMe || false;
    }
}

// Otomatik giriş gerçekleştir
async function performAutoLogin(userData) {
    showLoading('Otomatik giriş yapılıyor...');
    
    // Simülasyon için kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Kullanıcı doğrulama
    const user = users.find(u => u.email === userData.email && u.password === userData.password);
    
    if (user) {
        // Oturum oluştur
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Son giriş zamanını güncelle
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
        hideLoading();
        showSuccess('Otomatik giriş başarılı! Ana sayfaya yönlendiriliyorsunuz...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        hideLoading();
        // Otomatik giriş başarısızsa, kayıtlı bilgileri temizle
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('rememberedUser');
        showNotification('Otomatik giriş başarısız. Lütfen tekrar giriş yapın.', 'warning');
    }
}

// Giriş İşlemi
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validasyon
    if (!email || !password) {
        showNotification('Lütfen tüm alanları doldurun', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Geçerli bir e-posta adresi girin', 'error');
        return;
    }
    
    // Loading göster
    showLoading('Giriş yapılıyor...');
    
    // Simülasyon için bekleme
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Kullanıcı doğrulama
    const user = users.find(u => u.email === email && u.password === password);
    
    hideLoading();
    
    if (user) {
        // Kullanıcı oturumu oluştur
        localStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('rememberUser', 'true');
        } else {
            localStorage.removeItem('rememberUser');
        }
        
        // Son giriş zamanını kaydet
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
        // Başarı mesajı göster
        showSuccess('Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz...');
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } else {
        showNotification('E-posta veya şifre hatalı', 'error');
        
        // Şifre alanını temizle
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
    }
}

// Kayıt İşlemi
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validasyon
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Lütfen tüm alanları doldurun', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Geçerli bir e-posta adresi girin', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Şifreler eşleşmiyor', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Şifre en az 6 karakter olmalıdır', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('Kullanım şartlarını kabul etmelisiniz', 'error');
        return;
    }
    
    // E-posta kontrolü
    if (users.find(u => u.email === email)) {
        showNotification('Bu e-posta adresi zaten kayıtlı', 'error');
        return;
    }
    
    // Loading göster
    showLoading('Hesap oluşturuluyor...');
    
    // Simülasyon için bekleme
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Yeni kullanıcı ekle
    const newUser = {
        name,
        email,
        password
    };
    
    users.push(newUser);
    
    // Otomatik oturum oluştur
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('rememberUser', 'true');
    
    hideLoading();
    
    // Başarı mesajı ve yönlendirme
    showSuccess('Hesabınız başarıyla oluşturuldu! Ana sayfaya yönlendiriliyorsunuz...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Şifremi Unuttum İşlemi
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        showNotification('E-posta adresini girin', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Geçerli bir e-posta adresi girin', 'error');
        return;
    }
    
    // Loading göster
    showLoading('Sıfırlama bağlantısı gönderiliyor...');
    
    // Simülasyon için bekleme
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    hideLoading();
    
    // Kullanıcı kontrolü
    const userExists = users.find(u => u.email === email);
    
    if (userExists) {
        showNotification('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi', 'success');
    } else {
        // Güvenlik için her durumda aynı mesajı göster
        showNotification('Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi', 'info');
    }
    
    // Giriş sayfasına dön
    setTimeout(() => {
        showLogin();
    }, 2000);
}

// Form Geçişleri
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotForm').classList.add('hidden');
    
    // Focus
    setTimeout(() => {
        document.getElementById('loginEmail').focus();
    }, 300);
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('forgotForm').classList.add('hidden');
    
    // Focus
    setTimeout(() => {
        document.getElementById('registerName').focus();
    }, 300);
}

function showForgotPassword() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotForm').classList.remove('hidden');
    
    // Tüm adımları gizle
    document.getElementById('forgotStep1').classList.remove('hidden');
    document.getElementById('forgotStep2').classList.add('hidden');
    document.getElementById('forgotStep3').classList.add('hidden');
    document.getElementById('forgotSuccess').classList.add('hidden');
    
    // Form alanlarını temizle
    document.getElementById('forgotEmail').value = '';
    clearCodeInputs();
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    
    // Focus
    setTimeout(() => {
        document.getElementById('forgotEmail').focus();
    }, 300);
}

// Şifre Göster/Gizle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const eyeIcon = document.getElementById(inputId + 'Eye');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// Şifre Gücü Kontrolü
function setupPasswordStrength() {
    const passwordInput = document.getElementById('registerPassword');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        strengthIndicator.className = 'password-strength';
        
        if (password.length === 0) {
            strengthIndicator.className += '';
        } else if (strength < 3) {
            strengthIndicator.className += ' weak';
        } else if (strength < 5) {
            strengthIndicator.className += ' medium';
        } else {
            strengthIndicator.className += ' strong';
        }
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Uzunluk kontrolü
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Karakter türü kontrolleri
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
}

// Yardımcı Fonksiyonlar
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Loading Gösterme/Gizleme
function showLoading(message = 'Yükleniyor...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = overlay.querySelector('p');
    loadingText.textContent = message;
    overlay.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Başarı Mesajı
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const messageText = successDiv.querySelector('p');
    messageText.textContent = message;
    successDiv.classList.remove('hidden');
    
    setTimeout(() => {
        successDiv.classList.add('hidden');
    }, 3000);
}

// Bildirim Gösterme
function showNotification(message, type = 'info') {
    // Dinamik bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    else if (type === 'error') icon = 'fas fa-times-circle';
    else if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="close-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Stil ekle
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        padding: 15px 20px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    
    // Renk ayarları
    if (type === 'success') {
        notification.style.borderColor = 'rgba(76, 175, 80, 0.5)';
        notification.querySelector('i').style.color = '#4caf50';
    } else if (type === 'error') {
        notification.style.borderColor = 'rgba(244, 67, 54, 0.5)';
        notification.querySelector('i').style.color = '#f44336';
    } else if (type === 'warning') {
        notification.style.borderColor = 'rgba(255, 152, 0, 0.5)';
        notification.querySelector('i').style.color = '#ff9800';
    } else {
        notification.style.borderColor = 'rgba(33, 150, 243, 0.5)';
        notification.querySelector('i').style.color = '#2196f3';
    }
    
    document.body.appendChild(notification);
    
    // Otomatik kaldırma
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// CSS Animasyonları (Dinamik olarak ekle)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification .close-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        font-size: 14px;
        padding: 0;
        margin-left: 10px;
        transition: color 0.3s ease;
    }
    
    .notification .close-btn:hover {
        color: white;
    }
`;
document.head.appendChild(style);

// Demo için konsola admin bilgilerini yazdır
console.log('🎵 Frekans Demo Giriş Bilgileri:');
console.log('📧 Admin E-posta:', adminCredentials.email);
console.log('🔑 Admin Şifre:', adminCredentials.password);
console.log('📧 Demo E-posta: demo@muziksite.com');
console.log('🔑 Demo Şifre: demo123');

// Şifremi Unuttum - Gelişmiş Sistem

// Global değişkenler
let verificationCode = '';
let forgotPasswordEmail = '';
let resendTimer = 60;
let resendInterval;

// E-posta doğrulama
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// E-posta adımı
function handleForgotEmail(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        showNotification('E-posta adresi gerekli', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Geçerli bir e-posta adresi girin', 'error');
        return;
    }
    
    // E-posta var mı kontrol et
    const userExists = users.some(user => user.email === email);
    if (!userExists) {
        showNotification('Bu e-posta adresi kayıtlı değil', 'error');
        return;
    }
    
    forgotPasswordEmail = email;
    generateVerificationCode();
    
    // E-posta gönderme simülasyonu
    showLoading('Doğrulama kodu gönderiliyor...');
    
    setTimeout(() => {
        hideLoading();
        showForgotStep2();
        startResendTimer();
        showNotification('Doğrulama kodu e-posta adresinize gönderildi', 'success');
    }, 2000);
}

// Doğrulama kodu oluştur
function generateVerificationCode() {
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Doğrulama Kodu:', verificationCode); // Demo için
}

// Adım 2'yi göster
function showForgotStep2() {
    document.getElementById('forgotStep1').classList.add('hidden');
    document.getElementById('forgotStep2').classList.remove('hidden');
    
    // E-posta adresini gizli olarak göster
    const emailDisplay = document.getElementById('sentEmailDisplay');
    const maskedEmail = maskEmail(forgotPasswordEmail);
    emailDisplay.textContent = maskedEmail;
    
    // İlk input'a odaklan
    document.getElementById('code1').focus();
}

// E-posta adresi maskeleme
function maskEmail(email) {
    const [name, domain] = email.split('@');
    const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    return `${maskedName}@${domain}`;
}

// Kod inputları kurulumu
function setupCodeInputs() {
    const inputs = document.querySelectorAll('.code-input');
    
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Sadece rakam kabul et
            if (!/^\d$/.test(value)) {
                e.target.value = '';
                return;
            }
            
            e.target.classList.add('filled');
            
            // Bir sonraki input'a geç
            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
            
            // Tüm inputlar dolu mu kontrol et
            checkAllCodesFilled();
        });
        
        input.addEventListener('keydown', (e) => {
            // Backspace ile önceki input'a geç
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
                inputs[index - 1].classList.remove('filled');
            }
        });
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text');
            
            if (/^\d{6}$/.test(pastedData)) {
                // 6 haneli kod yapıştırıldı
                for (let i = 0; i < 6; i++) {
                    inputs[i].value = pastedData[i];
                    inputs[i].classList.add('filled');
                }
                checkAllCodesFilled();
            }
        });
    });
}

// Tüm kodlar dolu mu kontrol et
function checkAllCodesFilled() {
    const inputs = document.querySelectorAll('.code-input');
    const allFilled = Array.from(inputs).every(input => input.value);
    
    if (allFilled) {
        // Otomatik olarak doğrula
        setTimeout(() => {
            handleVerifyCode({ preventDefault: () => {} });
        }, 500);
    }
}

// Kodu doğrula
function handleVerifyCode(e) {
    e.preventDefault();
    
    const inputs = document.querySelectorAll('.code-input');
    const enteredCode = Array.from(inputs).map(input => input.value).join('');
    
    if (enteredCode.length !== 6) {
        showNotification('Lütfen 6 haneli kodu eksiksiz girin', 'error');
        return;
    }
    
    showLoading('Kod doğrulanıyor...');
    
    setTimeout(() => {
        hideLoading();
        
        if (enteredCode === verificationCode) {
            showForgotStep3();
            showNotification('Kod doğrulandı!', 'success');
        } else {
            // Hatalı kod animasyonu
            inputs.forEach(input => {
                input.classList.add('error');
                input.value = '';
                input.classList.remove('filled');
            });
            
            setTimeout(() => {
                inputs.forEach(input => input.classList.remove('error'));
                inputs[0].focus();
            }, 500);
            
            showNotification('Girilen kod hatalı, tekrar deneyin', 'error');
        }
    }, 1500);
}

// Adım 3'ü göster
function showForgotStep3() {
    document.getElementById('forgotStep2').classList.add('hidden');
    document.getElementById('forgotStep3').classList.remove('hidden');
    
    document.getElementById('newPassword').focus();
    setupPasswordStrengthIndicator();
}

// Şifre gücü göstergesi kurulumu
function setupPasswordStrengthIndicator() {
    const passwordInput = document.getElementById('newPassword');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthLevel = document.getElementById('strengthLevel');
    
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);
        
        strengthFill.className = 'strength-fill ' + strength.level;
        strengthLevel.textContent = strength.text;
        strengthLevel.style.color = strength.color;
    });
}

// Şifre gücü hesaplama
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) {
        return { level: 'weak', text: 'Zayıf', color: '#ff6b6b' };
    } else if (score <= 3) {
        return { level: 'medium', text: 'Orta', color: '#feca57' };
    } else {
        return { level: 'strong', text: 'Güçlü', color: '#48ca65' };
    }
}

// Yeni şifre kaydet
function handleNewPassword(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword.length < 8) {
        showNotification('Şifre en az 8 karakter olmalı', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Şifreler eşleşmiyor', 'error');
        return;
    }
    
    showLoading('Şifre kaydediliyor...');
    
    setTimeout(() => {
        hideLoading();
        
        // Kullanıcının şifresini güncelle
        const userIndex = users.findIndex(user => user.email === forgotPasswordEmail);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
        }
        
        showForgotSuccess();
        showNotification('Şifreniz başarıyla değiştirildi!', 'success');
    }, 2000);
}

// Başarı adımını göster
function showForgotSuccess() {
    document.getElementById('forgotStep3').classList.add('hidden');
    document.getElementById('forgotSuccess').classList.remove('hidden');
}

// Geri dönme fonksiyonları
function goBackToEmailStep() {
    document.getElementById('forgotStep2').classList.add('hidden');
    document.getElementById('forgotStep1').classList.remove('hidden');
    
    clearResendTimer();
    clearCodeInputs();
}

// Kod inputlarını temizle
function clearCodeInputs() {
    const inputs = document.querySelectorAll('.code-input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
}

// Yeniden gönderme zamanlayıcısı
function startResendTimer() {
    resendTimer = 60;
    const countdownElement = document.getElementById('countdown');
    const resendBtn = document.getElementById('resendBtn');
    
    if (!countdownElement || !resendBtn) return;
    
    resendBtn.disabled = true;
    resendBtn.style.opacity = '0.5';
    resendBtn.style.cursor = 'not-allowed';
    
    resendInterval = setInterval(() => {
        resendTimer--;
        countdownElement.textContent = resendTimer;
        
        if (resendTimer <= 0) {
            clearInterval(resendInterval);
            countdownElement.parentElement.style.display = 'none';
            resendBtn.disabled = false;
            resendBtn.style.opacity = '1';
            resendBtn.style.cursor = 'pointer';
        }
    }, 1000);
}

// Zamanlayıcıyı temizle
function clearResendTimer() {
    if (resendInterval) {
        clearInterval(resendInterval);
    }
}

// Kodu yeniden gönder
function resendCode() {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.parentElement.style.display = 'block';
    }
    
    generateVerificationCode();
    
    showLoading('Yeni kod gönderiliyor...');
    
    setTimeout(() => {
        hideLoading();
        startResendTimer();
        clearCodeInputs();
        document.getElementById('code1').focus();
        showNotification('Yeni doğrulama kodu gönderildi', 'success');
    }, 1500);
}

// Şifre göster/gizle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Sayfa kapanırken oturum kontrolü
window.addEventListener('beforeunload', function() {
    // Gerekirse temizlik işlemleri yapılabilir
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC tuşu ile modal/overlay kapatma
    if (e.key === 'Escape') {
        hideLoading();
        const successMsg = document.getElementById('successMessage');
        if (!successMsg.classList.contains('hidden')) {
            successMsg.classList.add('hidden');
        }
    }
});