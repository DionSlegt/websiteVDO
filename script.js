// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Simple validation
        if (name && email && message) {
            // In a real application, you would send this to a server
            alert('Bedankt voor uw bericht! We nemen zo spoedig mogelijk contact met u op.');
            contactForm.reset();
        } else {
            alert('Vul alstublieft alle velden in.');
        }
    });
}

// Animate elements on scroll (IntersectionObserver - geen scroll event)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Observe board members for scroll animation
const boardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
});

// Observe all board member elements
document.querySelectorAll('.board-member-large, .board-member-alternate').forEach(member => {
    boardObserver.observe(member);
});

// Observe team cards for scroll animation
document.querySelectorAll('.team-card').forEach(card => {
    boardObserver.observe(card);
});

// Video initialisatie (zonder scroll synchronisatie)
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
    // Functie om eerste frame te tonen
    const showFirstFrame = () => {
        if (heroVideo.readyState >= 2 && heroVideo.duration > 0) {
            heroVideo.currentTime = 0.01;
            heroVideo.pause();
        }
    };
    
    // Probeer video te laden
    heroVideo.load();
    
    // Wacht tot video metadata geladen is
    heroVideo.addEventListener('loadedmetadata', () => {
        showFirstFrame();
    }, { once: true });
    
    // Wacht tot video data geladen is
    heroVideo.addEventListener('loadeddata', () => {
        showFirstFrame();
    }, { once: true });
    
    // Wacht tot video kan afspelen
    heroVideo.addEventListener('canplay', () => {
        showFirstFrame();
    }, { once: true });
    
    // Wacht tot video volledig geladen is
    heroVideo.addEventListener('canplaythrough', () => {
        showFirstFrame();
    }, { once: true });
    
    // Error handling
    heroVideo.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
        console.error('Video source:', heroVideo.querySelector('source')?.src);
    });
    
    // Forceer eerste frame na korte delay
    setTimeout(() => {
        showFirstFrame();
    }, 500);
}

// Scroll-scrubbing video (scrub op scroll, blijft pinned tot einde)
(() => {
  const section = document.getElementById("scrollVideo");
  const scrub = document.getElementById("scrollVideoScrub");
  const video = document.getElementById("bgVideo");
  if (!section || !scrub || !video) return;

  let duration = 0;

  function setScrubHeight() {
    // Meet sticky top (navbar offset) dynamisch
    const stickyEl = section.querySelector(".scroll-video__sticky");
    const topOffset = stickyEl ? (parseFloat(getComputedStyle(stickyEl).top) || 0) : 0;

    const viewH = window.innerHeight;
    const stickyH = viewH - topOffset;

    // Pixels per seconde video: hoger = langzamer scrubben
    const pxPerSecond = 1800; // Verhoogd voor langzamer tempo

    const scrubPixels = Math.max(400, duration * pxPerSecond);

    // Alleen de scrub-wrapper bepaalt de scroll-lengte
    scrub.style.height = `${stickyH + scrubPixels}px`;
  }

  // Simpele, directe scroll-mapping (geen LERP, geen RAF-loop)
  function onScroll() {
    if (!duration) return;

    // Cruciaal: tijdens scrubben altijd pauzeren (geen autoplay conflict)
    if (!video.paused) video.pause();

    const rect = scrub.getBoundingClientRect();
    const viewH = window.innerHeight;

    const total = rect.height - viewH;
    const passed = Math.min(Math.max(-rect.top, 0), total);
    const progress = total > 0 ? passed / total : 0;

    // Direct currentTime zetten op scroll (geen interpolatie)
    video.currentTime = progress * (duration - 0.001);
  }

  // Video instellingen
  video.preload = "auto";
  video.pause(); // NOOIT .play() gebruiken bij scroll-video's
  video.muted = true;
  video.playsInline = true;
  video.load();

  // Als metadata binnen is: hoogte instellen en init scroll mapping
  video.addEventListener("loadedmetadata", () => {
    duration = video.duration || 0;
    video.currentTime = 0;
    video.pause();
    setScrubHeight();
    onScroll(); // Initialiseer scroll mapping
  });

  // Als browser metadata al cached had vóór listener:
  if (video.readyState >= 1) {
    duration = video.duration || 0;
    setScrubHeight();
    onScroll(); // Initialiseer scroll mapping
  }

  // Voorkom autoplay
  video.addEventListener('play', (e) => {
    e.preventDefault();
    video.pause();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    setScrubHeight();
    onScroll();
  });
})();

// Language toggle functionality
function initLanguageToggle() {
    const languageToggle = document.getElementById('language-toggle');
    const languageText = document.querySelector('.language-text');

    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') || 'nl';
    const initialLang = savedLanguage === 'en' ? 'en' : 'nl';
    
    // Set initial language
    document.documentElement.setAttribute('lang', initialLang);
    if (languageText) {
        languageText.textContent = initialLang === 'nl' ? 'EN' : 'NL';
    }
    updateLanguage(initialLang);

    // Toggle language on button click
    if (languageToggle) {
        languageToggle.addEventListener('click', () => {
            const currentLang = document.documentElement.getAttribute('lang');
            const newLang = currentLang === 'nl' ? 'en' : 'nl';
            
            document.documentElement.setAttribute('lang', newLang);
            updateLanguage(newLang);
            
            // Update button text
            if (languageText) {
                languageText.textContent = newLang === 'nl' ? 'EN' : 'NL';
            }
            
            // Save preference
            localStorage.setItem('language', newLang);
        });
    }
}

// Initialize language toggle when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageToggle);
} else {
    initLanguageToggle();
}

// Function to update all text elements with data-nl and data-en attributes
function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-nl][data-en]');
    elements.forEach(element => {
        const text = lang === 'nl' ? element.getAttribute('data-nl') : element.getAttribute('data-en');
        if (text) {
            // For elements that might contain HTML entities, use innerHTML
            if (text.includes('&copy;') || text.includes('&')) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Update page title
    const title = lang === 'nl' ? 'VDO - Welkom' : 'VDO - Welcome';
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = lang === 'nl' 
            ? 'VDO - Professionele dienstverlening' 
            : 'VDO - Professional service';
    }
}
