function initGalleryCarousel() {
    const carousel = document.querySelector('#image-carousel');
    if (!carousel) return;

    new Splide('#image-carousel', {
        type: 'loop',
        perPage: 3,
        focus: 'center',
        gap: '20px',
        arrows: true,
        pagination: false,
        height: '600px',
        breakpoints: {
            1024: {
                perPage: 2,
            },
            768: {
                perPage: 1,
            }
        }
    }).mount();
}

function initGalleryLightbox() {
    const carousel = document.querySelector('#image-carousel');
    if (!carousel) return;

    let lightbox = document.querySelector('.gallery-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'gallery-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.innerHTML = '<button class="gallery-lightbox-prev" aria-label="Previous">‹</button><button class="gallery-lightbox-next" aria-label="Next">›</button><button class="gallery-lightbox-close" aria-label="Close">×</button><img alt=""/>';
        document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('img');
    const prevButton = lightbox.querySelector('.gallery-lightbox-prev');
    const nextButton = lightbox.querySelector('.gallery-lightbox-next');
    const closeButton = lightbox.querySelector('.gallery-lightbox-close');
    const galleryImages = Array.from(carousel.querySelectorAll('.splide__slide img'));
    let currentIndex = -1;

    const showImageAt = (index) => {
        if (!galleryImages.length) return;
        const safeIndex = (index + galleryImages.length) % galleryImages.length;
        const img = galleryImages[safeIndex];
        currentIndex = safeIndex;
        openLightbox(img.src, img.alt);
    };

    const openLightbox = (src, alt) => {
        if (!src) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lightboxImg.src = '';
    };

    carousel.addEventListener('click', (event) => {
        const target = event.target;
        if (target && target.tagName === 'IMG') {
            event.preventDefault();
            const index = galleryImages.indexOf(target);
            showImageAt(index);
        }
    });

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeLightbox();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', (event) => {
            event.stopPropagation();
            showImageAt(currentIndex - 1);
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', (event) => {
            event.stopPropagation();
            showImageAt(currentIndex + 1);
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeLightbox();
        }
        if (lightbox.classList.contains('open')) {
            if (event.key === 'ArrowLeft') {
                showImageAt(currentIndex - 1);
            }
            if (event.key === 'ArrowRight') {
                showImageAt(currentIndex + 1);
            }
        }
    });
}

// About section carousel functionaliteit
function initAboutCarousel() {
    const prevBtn = document.querySelector('.about-images .carousel-btn.prev');
    const nextBtn = document.querySelector('.about-images .carousel-btn.next');
    const images = document.querySelectorAll('.about-images .carousel-image');
    
    if (!prevBtn || !nextBtn || images.length === 0) return;
    
    let currentIndex = 0;
    
    function showImage(index) {
        // Verberg alle afbeeldingen
        images.forEach(img => img.classList.remove('active'));
        
        // Toon de huidige afbeelding
        images[index].classList.add('active');
        currentIndex = index;
    }
    
    function nextImage() {
        const newIndex = (currentIndex + 1) % images.length;
        showImage(newIndex);
    }
    
    function prevImage() {
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(newIndex);
    }
    
    // Event listeners voor de knoppen
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    
    // Keyboard navigatie voor carousel
    document.addEventListener('keydown', (e) => {
        // Alleen actief als we in de about sectie zijn EN lightbox is niet open
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.classList.contains('active')) return;
        
        const aboutSection = document.querySelector('.about');
        if (!aboutSection) return;
        
        const rect = aboutSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (inView) {
            if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            }
        }
    });
    
    // Automatische slideshow (optioneel, uitgeschakeld)
    // setInterval(nextImage, 5000);
}

// Lightbox functionaliteit voor about carousel
function initAboutLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-image');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const carouselImages = document.querySelectorAll('.about-images .carousel-image');
    
    if (!lightbox || !lightboxImg || carouselImages.length === 0) return;
    
    let currentLightboxIndex = 0;
    
    // Open lightbox met een specifieke afbeelding
    function openLightbox(index) {
        currentLightboxIndex = index;
        const img = carouselImages[index];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Sluit lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImg.src = '';
    }
    
    // Navigeer naar volgende afbeelding
    function showNextImage() {
        currentLightboxIndex = (currentLightboxIndex + 1) % carouselImages.length;
        const img = carouselImages[currentLightboxIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    }
    
    // Navigeer naar vorige afbeelding
    function showPrevImage() {
        currentLightboxIndex = (currentLightboxIndex - 1 + carouselImages.length) % carouselImages.length;
        const img = carouselImages[currentLightboxIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    }
    
    // Klik op carousel afbeelding opent lightbox
    carouselImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            openLightbox(index);
        });
    });
    
    // Sluit knop
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    // Navigatie knoppen
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrevImage();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });
    }
    
    // Klik buiten afbeelding sluit lightbox
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigatie
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    });
}

// Initialiseer de gallery carousel wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    initGalleryCarousel();
    initGalleryLightbox();
    initAboutCarousel();
    initAboutLightbox();
});

const hamburger = document.querySelector('.hamburger');

const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}
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

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        if (name && email && message) {
            alert('Bedankt voor uw bericht! We nemen zo spoedig mogelijk contact met u op.');
            contactForm.reset();
        } else {
            alert('Vul alstublieft alle velden in.');
        }
    });
}
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

document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});
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

document.querySelectorAll('.board-member-large, .board-member-alternate').forEach(member => {
    boardObserver.observe(member);
});

document.querySelectorAll('.team-card').forEach(card => {
    boardObserver.observe(card);
});
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
    // Zorg ervoor dat de video automatisch speelt en loopt
    heroVideo.muted = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;
    
    const playVideo = () => {
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Video play error:', error);
                // Retry na een korte delay
                setTimeout(() => {
                    heroVideo.play().catch(err => console.log('Retry play error:', err));
                }, 500);
            });
        }
    };
    
    heroVideo.addEventListener('loadeddata', playVideo, { once: true });
    heroVideo.addEventListener('canplay', playVideo, { once: true });
    heroVideo.addEventListener('canplaythrough', playVideo, { once: true });
    
    heroVideo.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
        console.error('Video source:', heroVideo.querySelector('source')?.src);
    });
    
    // Als video al geladen is, probeer direct te spelen
    if (heroVideo.readyState >= 2) {
        playVideo();
    }
    
    // Zorg ervoor dat de video blijft spelen na een page visibility change
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && heroVideo.paused) {
            playVideo();
}
    });
}
(() => {
  const section = document.getElementById("scrollVideo");
  const scrub = document.getElementById("scrollVideoScrub");
  const video = document.getElementById("bgVideo");
  if (!section || !scrub || !video) return;

    let duration = 0;
  let ticking = false;

  function setScrubHeight() {
    const stickyEl = section.querySelector(".scroll-video__sticky");
    const topOffset = stickyEl ? (parseFloat(getComputedStyle(stickyEl).top) || 0) : 0;
    const viewH = window.innerHeight;
    const stickyH = viewH - topOffset;
    const pxPerSecond = 800;
    const scrubPixels = Math.max(400, duration * pxPerSecond);
    scrub.style.height = `${stickyH + scrubPixels}px`;
  }

  function updateVideo() {
    if (!duration) return;
    if (!video.paused) video.pause();

    const rect = scrub.getBoundingClientRect();
    const viewH = window.innerHeight;
    const total = rect.height - viewH;
    const passed = Math.min(Math.max(-rect.top, 0), total);
    const progress = total > 0 ? passed / total : 0;
    video.currentTime = progress * (duration - 0.001);
    ticking = false;
        }
    
    function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateVideo);
      ticking = true;
    }
  }

  video.preload = "metadata";
  video.pause();
  video.muted = true;
  video.playsInline = true;

  video.addEventListener("loadedmetadata", () => {
    duration = video.duration || 0;
    video.currentTime = 0;
    video.pause();
    setScrubHeight();
    updateVideo();
  });

  if (video.readyState >= 1) {
    duration = video.duration || 0;
    setScrubHeight();
    updateVideo();
        }

  video.addEventListener('play', (e) => {
    e.preventDefault();
    video.pause();
    });
    
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    setScrubHeight();
    updateVideo();
  });
})();
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
            if (text.includes('&copy;') || text.includes('&')) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    const title = lang === 'nl' ? 'VDO - VDO Uithoorn' : 'VDO - VDO Uithoorn';
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = lang === 'nl' 
            ? 'VDO - Professionele dienstverlening' 
            : 'VDO - Professional service';
    }
}

// Theme toggle functionaliteit
(function initThemeToggle() {
    const html = document.documentElement;
    
    // Pastel thema altijd actief
    html.setAttribute('data-theme', 'pastel');
    localStorage.setItem('theme', 'pastel');
})();

// Video autoplay fix
(function initVideoAutoplay() {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Probeer video te spelen wanneer deze klaar is
        const playVideo = () => {
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Video play error:', error);
                });
            }
        };

        heroVideo.addEventListener('loadeddata', playVideo, { once: true });
        heroVideo.addEventListener('canplay', playVideo, { once: true });
        
        // Als video al geladen is, probeer direct te spelen
        if (heroVideo.readyState >= 2) {
            playVideo();
        }
    }
})();

// Bewegende lichtreflectie op glass paneel - DISABLED (element verwijderd)
// (function initGlassReflection() {
//     const card = document.querySelector(".about-text");
//     
//     if (card) {
//         card.addEventListener("pointermove", (event) => {
//             const rect = card.getBoundingClientRect();
//             
//             card.style.setProperty(
//                 "--mouse-x",
//                 `${event.clientX - rect.left}px`
//             );
//             
//             card.style.setProperty(
//                 "--mouse-y",
//                 `${event.clientY - rect.top}px`
//             );
//         });
//     }
// })();

// Pingpong bounce animatie voor de O in VDO
(function initBouncingO() {
    const bouncingO = document.querySelector(".bouncing-o");
    
    if (bouncingO) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Forceer een herstart van de animatie
                void bouncingO.offsetWidth;
                
                bouncingO.classList.remove("is-bouncing");
                bouncingO.classList.add("is-bouncing");
                observer.unobserve(entries[0].target);
            }
        }, {
            threshold: 0.35
        });
        
        observer.observe(bouncingO);
    }
})();

// Openingstijden sectie - 3D Scroll Carrousel
(function initOpeningstijden() {
    const openingHours = [
        { day: "Maandag", short: "MA", open: false },
        { day: "Dinsdag", short: "DI", open: true, start: "19:30", end: "22:30", activity: "Training" },
        { day: "Woensdag", short: "WO", open: true, start: "20:00", end: "22:30", activity: "Vrij spelen" },
        { day: "Donderdag", short: "DO", open: true, start: "19:30", end: "22:30", activity: "Training" },
        { day: "Vrijdag", short: "VR", open: true, start: "20:00", end: "23:00", activity: "Competitie" },
        { day: "Zaterdag", short: "ZA", open: false },
        { day: "Zondag", short: "ZO", open: false }
    ];

    const section = document.querySelector('.openingstijden-section');
    const container = document.querySelector('.openingstijden-container');
    const header = document.getElementById('openingstijden-header');

    if (!container || !header) return;

    // Constants voor 3D carrousel
    const ROTATION_PER_CARD = 40;
    const CARD_SPACING = 400;
    const TOTAL_CARDS = 7;

    // Carrousel state
    let scrollProgress = 0;
    let targetProgress = 0;
    let animationFrame = null;

    // Functie: huidige dag ophalen (0 = maandag, 6 = zondag)
    function getCurrentDay() {
        const today = new Date().getDay();
        return today === 0 ? 6 : today - 1;
    }

    // Functie: eerstvolgende open dag vinden
    function getNextOpenDay(currentDay) {
        for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (openingHours[checkDay].open) {
                return checkDay;
            }
        }
        return null;
    }

    // Functie: dynamische header tekst genereren
    function generateHeaderText() {
        const currentDay = getCurrentDay();
        const todayData = openingHours[currentDay];

        if (todayData.open) {
            return `Vandaag open van ${todayData.start} tot ${todayData.end}`;
        } else {
            const nextDay = getNextOpenDay(currentDay);
            if (nextDay !== null) {
                const nextDayData = openingHours[nextDay];
                return `Eerstvolgende speelavond: ${nextDayData.day.toLowerCase()} om ${nextDayData.start}`;
            }
            return "Openingstijden";
        }
    }

    // Functie: dagkaarten genereren
    function generateCards() {
        const currentDay = getCurrentDay();

        openingHours.forEach((dayData, index) => {
            const card = document.createElement('div');
            card.className = 'dag-kaart';
            if (index === currentDay) {
                card.classList.add('current-day');
            }
            card.dataset.index = index;

            const dayName = document.createElement('h3');
            dayName.className = 'dag-naam';
            dayName.textContent = dayData.day;

            const dayShort = document.createElement('p');
            dayShort.className = 'dag-kort';
            dayShort.textContent = dayData.short;

            card.appendChild(dayName);
            card.appendChild(dayShort);

            if (dayData.open) {
                const times = document.createElement('p');
                times.className = 'dag-tijden';
                times.textContent = `${dayData.start} - ${dayData.end}`;

                const activity = document.createElement('p');
                activity.className = 'dag-activiteit';
                activity.textContent = dayData.activity;

                card.appendChild(times);
                card.appendChild(activity);
            } else {
                const closed = document.createElement('p');
                closed.className = 'dag-gesloten';
                closed.textContent = 'Gesloten';
                card.appendChild(closed);
            }

            container.appendChild(card);
        });
    }

    // Functie: update card transform
    function updateCardTransform(card, index, progress) {
        // Bereken centrum positie
        const centerIndex = (TOTAL_CARDS - 1) * progress;
        const offset = index - centerIndex;
        
        // 3D transformaties
        const rotationY = offset * ROTATION_PER_CARD;
        const translateX = offset * CARD_SPACING;
        const translateZ = -Math.abs(offset) * 100;
        const scale = 1 - Math.abs(offset) * 0.15;
        const opacity = Math.max(0.3, 1 - Math.abs(offset) * 0.3);
        
        // Zichtbaarheid: max 5 kaarten
        const isVisible = Math.abs(offset) < 2.5;
        
        // Apply transforms
        card.style.transform = `
            translateX(${translateX}px)
            translateZ(${translateZ}px)
            rotateY(${rotationY}deg)
            scale(${scale})
        `;
        card.style.opacity = opacity;
        card.style.visibility = isVisible ? 'visible' : 'hidden';
        card.style.pointerEvents = isVisible ? 'auto' : 'none';
        
        // Active state voor middelste kaart
        if (Math.abs(offset) < 0.3) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    }

    // Functie: init carrousel
    function initCarrousel() {
        // Skip op mobiel
        if (window.matchMedia('(max-width: 768px)').matches) return;
        
        // Skip bij reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const cards = document.querySelectorAll('.dag-kaart');
        if (cards.length === 0) return;
        
        // Scroll tracking
        window.addEventListener('scroll', () => {
            const rect = section.getBoundingClientRect();
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            // Bereken scroll progress (0 tot 1)
            if (rect.top <= 0 && rect.bottom >= viewportHeight) {
                const scrolled = Math.abs(rect.top);
                const maxScroll = sectionHeight - viewportHeight;
                targetProgress = Math.min(Math.max(scrolled / maxScroll, 0), 1);
            }
        }, { passive: true });
        
        // Smooth interpolatie
        function updateCarrousel() {
            // Lerp voor smoothness
            scrollProgress += (targetProgress - scrollProgress) * 0.1;
            
            // Update elke kaart positie
            cards.forEach((card, index) => {
                updateCardTransform(card, index, scrollProgress);
            });
            
            animationFrame = requestAnimationFrame(updateCarrousel);
        }
        
        updateCarrousel();
    }

    // Initialisatie
    header.textContent = generateHeaderText();
    generateCards();
    
    // Start carrousel DISABLED - flat layout gewenst
    // setTimeout(() => {
    //     initCarrousel();
    // }, 100);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });
})();

// ============================================
// SPONSORS 3D CARROUSEL
// ============================================
(function initSponsorsCarrousel() {
    const section = document.querySelector('.sponsors-section-outer');
    const container = document.querySelector('.sponsors-container');
    const cards = document.querySelectorAll('.sponsor-card');

    if (!section || !container || cards.length === 0) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Constants
    const ROTATION_PER_CARD = 36;
    const CARD_SPACING = 400;
    const TOTAL_CARDS = cards.length;

    // State
    let scrollProgress = 0;
    let targetProgress = 0;
    let animationFrame = null;

    // Update card transform
    function updateCardTransform(card, index, progress) {
        const centerIndex = (TOTAL_CARDS - 1) * progress;
        const offset = index - centerIndex;

        // 3D transformaties (zelfde als openingstijden)
        const rotationY = offset * ROTATION_PER_CARD;
        const translateX = offset * CARD_SPACING;
        const translateZ = -Math.abs(offset) * 100;
        const scale = 1 - Math.abs(offset) * 0.15;
        const opacity = Math.max(0.3, 1 - Math.abs(offset) * 0.3);

        // Max 5 kaarten zichtbaar
        const isVisible = Math.abs(offset) < 2.5;

        // Apply transforms
        card.style.transform = `
            translateX(${translateX}px)
            translateZ(${translateZ}px)
            rotateY(${rotationY}deg)
            scale(${scale})
        `;
        card.style.opacity = opacity;
        card.style.visibility = isVisible ? 'visible' : 'hidden';
        card.style.pointerEvents = isVisible ? 'auto' : 'none';

        // Active state
        if (Math.abs(offset) < 0.3) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    }

    // Scroll tracking
    window.addEventListener('scroll', () => {
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;

        if (rect.top <= 0 && rect.bottom >= viewportHeight) {
            const scrolled = Math.abs(rect.top);
            const maxScroll = sectionHeight - viewportHeight;
            targetProgress = Math.min(Math.max(scrolled / maxScroll, 0), 1);
        }
    }, { passive: true });

    // Animation loop
    function updateCarrousel() {
        scrollProgress += (targetProgress - scrollProgress) * 0.1;

        cards.forEach((card, index) => {
            updateCardTransform(card, index, scrollProgress);
        });

        animationFrame = requestAnimationFrame(updateCarrousel);
    }

    updateCarrousel();

    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });
})();
