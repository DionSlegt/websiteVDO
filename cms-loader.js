const API_BASE = window.location.port === '3000' ? '/api/content' : (window.location.port === '8000' ? 'http://localhost:3000/api/content' : (window.location.hostname === 'localhost' ? 'http://localhost:3000/api/content' : '/api/content'));

async function loadContent(file) {
    try {
        try {
            const apiResponse = await fetch(`${API_BASE}/${file}`);
            if (apiResponse.ok) {
                return await apiResponse.json();
            }
        } catch (apiError) {
        }
        
        const response = await fetch(`_data/${file}.json`);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
        return null;
    }
}
async function loadHomeContent() {
    try {
        const homeData = await loadContent('home');
        if (homeData) {
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) {
                heroTitle.textContent = homeData.heroTitle || 'VDO Uithoorn';
            }

            const aboutContent = document.querySelector('.about-content');
            if (aboutContent && homeData.aboutText) {
                // Support both old format (string) and new format (object with nl/en)
                const aboutText = typeof homeData.aboutText === 'string' 
                    ? homeData.aboutText 
                    : (homeData.aboutText.nl || homeData.aboutText);
                const aboutTextEn = typeof homeData.aboutText === 'object' 
                    ? (homeData.aboutText.en || '') 
                    : '';
                
                const paragraphs = aboutText.split('\n\n');
                const paragraphsEn = aboutTextEn ? aboutTextEn.split('\n\n') : [];
                
                const html = paragraphs
                    .map((para, index) => {
                        const paraEn = paragraphsEn[index] || '';
                        const paraText = para.replace(/\n/g, '<br>');
                        const paraTextEn = paraEn.replace(/\n/g, '<br>');
                        if (paraEn) {
                            return `<p data-nl="${para.replace(/"/g, '&quot;')}" data-en="${paraEn.replace(/"/g, '&quot;')}">${paraText}</p>`;
                        } else {
                            return `<p>${paraText}</p>`;
                        }
                    })
                    .join('');
                aboutContent.innerHTML = html;

                // Update language after content is loaded
                const currentLang = document.documentElement.getAttribute('lang') || 'nl';
                if (typeof updateLanguage === 'function') {
                    updateLanguage(currentLang);
                }
            }

            const inschrijvenText = document.querySelector('#inschrijven .contact-info p');
            if (inschrijvenText && homeData.inschrijvenText) {
                inschrijvenText.textContent = homeData.inschrijvenText;
            }
        } else {
            console.warn('No home data loaded');
        }
    } catch (error) {
        console.error('Error loading home content:', error);
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && heroTitle.textContent === 'Laden...') {
            heroTitle.textContent = 'VDO Uithoorn';
        }
    }
}
async function loadContactInfo() {
    const contactData = await loadContent('contact');
    if (contactData) {
        const emailLink = document.querySelector('footer a[href^="mailto:"]');
        if (emailLink && contactData.email) {
            emailLink.href = `mailto:${contactData.email}`;
            emailLink.textContent = contactData.email;
        }

        const phoneLink = document.querySelector('footer a[href^="tel:"]');
        if (phoneLink && contactData.phone) {
            phoneLink.href = `tel:${contactData.phone.replace(/\s/g, '')}`;
            phoneLink.textContent = contactData.phone;
        }

        if (contactData.address) {
            const addressParagraphs = document.querySelectorAll('.footer-section:nth-child(2) p');
            if (addressParagraphs.length >= 3 && contactData.address) {
                addressParagraphs[0].textContent = contactData.address.street || '';
                addressParagraphs[1].textContent = contactData.address.district || '';
                addressParagraphs[2].textContent = contactData.address.city || '';
            }
        }
    }
}
async function loadOverContent() {
    const overData = await loadContent('over');
    if (overData) {
        const aboutContent = document.querySelector('.about-content');
        if (aboutContent && overData.content) {
            const html = overData.content
                .split('\n\n')
                .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
                .join('');
            aboutContent.innerHTML = html;
        }
    }
}

// Load meppers content
async function loadMeppersContent() {
    const meppersData = await loadContent('meppers');
    if (meppersData) {
        const aboutContent = document.querySelector('.about-content');
        if (aboutContent && meppersData.content) {
            const html = meppersData.content
                .split('\n\n')
                .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
                .join('');
            aboutContent.innerHTML = html;
        }
    }
}

function initContentLoader() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '' || currentPage.includes('index')) {
        loadHomeContent();
        loadContactInfo();
    } else if (currentPage === 'over.html') {
        loadOverContent();
        loadContactInfo();
    } else if (currentPage === 'meppers.html') {
        loadMeppersContent();
        loadContactInfo();
    } else {
        loadContactInfo();
    }
}

(function() {
    function runLoader() {
        try {
            initContentLoader();
        } catch (e) {
            console.error('Error in content loader:', e);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runLoader);
    } else {
        runLoader();
    }
    
    setTimeout(runLoader, 100);
    setTimeout(runLoader, 500);
    setTimeout(runLoader, 1000);
})();

