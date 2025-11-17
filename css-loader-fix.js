// Bu fonksiyonu script.js'teki loadPageSpecificCSS fonksiyonunun yerine kopyala

function loadPageSpecificCSS(doc, url) {
    console.log('CSS yukleme basladi:', url);
    
    return new Promise((resolve) => {
        const pageLinks = doc.querySelectorAll('link[rel="stylesheet"]');
        const newCSSFiles = new Set();
        
        pageLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('style.css') && !href.includes('font-awesome') && !href.includes('http')) {
                newCSSFiles.add(href);
                console.log('Yeni sayfada bulundu:', href);
            }
        });
        
        const currentPageCSS = new Set();
        document.querySelectorAll('link[data-page-css]').forEach(link => {
            currentPageCSS.add(link.getAttribute('href'));
        });
        
        console.log('Mevcut CSS:', Array.from(currentPageCSS));
        console.log('Ihtiyac duyulan CSS:', Array.from(newCSSFiles));
        
        currentPageCSS.forEach(cssFile => {
            if (!newCSSFiles.has(cssFile)) {
                const linkToRemove = document.querySelector(`link[href="${cssFile}"][data-page-css]`);
                if (linkToRemove) {
                    console.log('CSS kaldiriliyor:', cssFile);
                    linkToRemove.remove();
                }
            }
        });
        
        const loadPromises = [];
        newCSSFiles.forEach(cssFile => {
            const existing = document.querySelector(`link[href="${cssFile}"]`);
            if (!existing) {
                const loadPromise = new Promise((resolveCSS) => {
                    const newLink = document.createElement('link');
                    newLink.rel = 'stylesheet';
                    newLink.href = cssFile;
                    newLink.setAttribute('data-page-css', 'true');
                    
                    newLink.onload = () => {
                        console.log('CSS yuklendi:', cssFile);
                        resolveCSS();
                    };
                    
                    newLink.onerror = () => {
                        console.warn('CSS yuklenemd:', cssFile);
                        resolveCSS();
                    };
                    
                    document.head.appendChild(newLink);
                });
                loadPromises.push(loadPromise);
            } else {
                console.log('CSS zaten yuklu:', cssFile);
                if (!existing.hasAttribute('data-page-css')) {
                    existing.setAttribute('data-page-css', 'true');
                }
            }
        });
        
        if (loadPromises.length > 0) {
            Promise.all(loadPromises).then(() => {
                console.log('TUM CSS YUKLENDI!');
                setTimeout(resolve, 50);
            });
        } else {
            console.log('Yeni CSS yok');
            resolve();
        }
    });
}
