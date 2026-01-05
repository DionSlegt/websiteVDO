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

// Add scroll effect to navbar
let lastScroll = 0;
let currentScroll = 0;
let scrollLockPosition = 0;
const header = document.querySelector('header');

// Sync CSS variable for header height so the hero can be exactly fullscreen (minus the sticky header)
function setHeaderHeightVar() {
    const headerEl = document.querySelector('header');
    const h = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--header-h', `${h}px`);
}
window.addEventListener('load', setHeaderHeightVar);
window.addEventListener('resize', () => {
    clearTimeout(window.__hdrResize);
    window.__hdrResize = setTimeout(setHeaderHeightVar, 100);
});


window.addEventListener('scroll', () => {
    // Header is sticky; keep visual consistent without heavy logic
    if (!header) return;
    // No-op: styling handled via CSS
});

// Animate elements on scroll
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

// Parallax systeem per sectie
const parallaxSections = [];

// Initialiseer parallax voor elke sectie
function initParallaxSections() {
    parallaxSections.length = 0;
    
    // Hero sectie (alleen video-scrub; geen text-parallax zodat content exact gecentreerd blijft)
    const hero = document.querySelector('.hero');
    if (hero) {
        parallaxSections.push({
            section: hero,
            elements: [
                { selector: '.hero-video', speed: 0.05, type: 'video' }
            ]
        });
    }
    
    // Fullscreen video sectie - gebruikt pinned scroll systeem (geen parallax)
    
    // About sectie
    const about = document.querySelector('.about');
    if (about) {
        parallaxSections.push({
            section: about,
            elements: [
                { selector: 'h2', speed: 0.3 },
                { selector: '.about-content', speed: 0.5 }
            ]
        });
    }
    
    // Contact/Inschrijven sectie
    const contact = document.querySelector('.contact');
    if (contact) {
        parallaxSections.push({
            section: contact,
            elements: [
                { selector: 'h3', speed: 0.3 },
                { selector: '.contact-info', speed: 0.5 }
            ]
        });
    }
    
    // Footer
    const footer = document.querySelector('footer');
    if (footer) {
        parallaxSections.push({
            section: footer,
            elements: [
                { selector: '.footer-content', speed: 0.4 },
                { selector: '.footer-section', speed: 0.5 }
            ]
        });
    }
}

// Video scroll state voor throttling
let videoScrollState = {
    targetTime: 0,
    ticking: false,
    fps: 25
};

// Frame snapping functie
function snapToFrame(t, fps) {
    return Math.round(t * fps) / fps;
}

// Pas parallax toe op scroll
function applyParallax() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const viewportCenter = scrollTop + windowHeight / 2;
    
    parallaxSections.forEach(sectionData => {
        const section = sectionData.section;
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + scrollTop;
        const sectionHeight = rect.height;
        const sectionCenter = sectionTop + sectionHeight / 2;
        
        // Bereken afstand vanaf viewport center
        const distanceFromCenter = viewportCenter - sectionCenter;
        
        // Alleen parallax toepassen als sectie in viewport is
        if (rect.top < windowHeight && rect.bottom > 0) {
            sectionData.elements.forEach(elementData => {
                const element = section.querySelector(elementData.selector);
                if (element) {
                    if (elementData.type === 'video') {
                        // Video scroll synchronisatie voor hero video (geoptimaliseerd)
                        const hero = document.querySelector('.hero');
                        if (hero && element.duration > 0) {
                            const heroTop = hero.offsetTop;
                            const heroHeight = hero.offsetHeight;
                            const heroBottom = heroTop + heroHeight;
                            const scrollStart = Math.max(0, heroTop - windowHeight);
                            const scrollEnd = heroBottom + windowHeight;
                            const scrollRange = scrollEnd - scrollStart;
                            
                            if (scrollTop >= scrollStart && scrollTop <= scrollEnd && scrollRange > 0) {
                                const scrollProgress = (scrollTop - scrollStart) / scrollRange;
                                const acceleratedProgress = Math.min(1, scrollProgress * 2.5);
                                const clampedProgress = Math.max(0, Math.min(1, acceleratedProgress));
                                
                                const duration = element.duration;
                                if (duration > 0 && !isNaN(duration)) {
                                    // Bereken target time en snap naar frame
                                    const rawTargetTime = clampedProgress * duration;
                                    videoScrollState.targetTime = snapToFrame(rawTargetTime, videoScrollState.fps);
                                    
                                    // Update alleen via requestAnimationFrame (throttling)
                                    if (!videoScrollState.ticking) {
                                        window.requestAnimationFrame(() => {
                                            const t = Math.max(0, Math.min(videoScrollState.targetTime, duration));
                                            const snappedTime = snapToFrame(t, videoScrollState.fps);
                                            
                                            // Alleen updaten als verschil groot genoeg is
                                            if (Math.abs(element.currentTime - snappedTime) > 0.04) {
                                                element.currentTime = snappedTime;
                                            }
                                            videoScrollState.ticking = false;
                                        });
                                        videoScrollState.ticking = true;
                                    }
                                }
                            } else if (scrollTop < scrollStart) {
                                if (!videoScrollState.ticking) {
                                    window.requestAnimationFrame(() => {
                                        element.currentTime = 0.01;
                                        videoScrollState.ticking = false;
                                    });
                                    videoScrollState.ticking = true;
                                }
                            } else if (scrollTop > scrollEnd) {
                                if (!videoScrollState.ticking) {
                                    window.requestAnimationFrame(() => {
                                        if (element.duration > 0) {
                                            element.currentTime = element.duration - 0.01;
                                        }
                                        videoScrollState.ticking = false;
                                    });
                                    videoScrollState.ticking = true;
                                }
                            }
                        }
                    } else if (elementData.type === 'slow-scroll') {
                        // Langzame scroll voor hero containers
                        const hero = document.querySelector('.hero');
                        if (hero) {
                            const heroTop = hero.offsetTop;
                            if (scrollTop > heroTop) {
                                const scrollPastHero = scrollTop - heroTop;
                                // Container beweegt veel langzamer (gebruik speed waarde) zodat video langer zichtbaar blijft
                                const containerOffset = scrollPastHero * elementData.speed;
                                element.style.transform = `translateY(${-containerOffset}px)`;
                                element.style.transition = 'none';
                            } else {
                                element.style.transform = 'translateY(0px)';
                                element.style.transition = 'none';
                            }
                        }
                    } else {
                        // Normale parallax transform
                        const parallaxOffset = distanceFromCenter * elementData.speed * 0.1;
                        element.style.transform = `translateY(${parallaxOffset}px)`;
                        element.style.transition = 'none';
                    }
                }
            });
        } else {
            // Reset transform als sectie buiten viewport is
            sectionData.elements.forEach(elementData => {
                const element = section.querySelector(elementData.selector);
                if (element) {
                    element.style.transform = 'translateY(0px)';
                    element.style.transition = 'transform 0.3s ease';
                }
            });
        }
    });
}

// Initialiseer parallax systeem
initParallaxSections();

// Pas parallax toe na de eerste paint (voorkomt layout-shift bij load)
requestAnimationFrame(() => applyParallax());

// Scroll event listener
window.addEventListener('scroll', applyParallax, { passive: true });

// Re-initialiseer bij resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initParallaxSections();
        applyParallax();
    }, 250);
}, { passive: true });

// Video initialisatie
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
    // Functie om eerste frame te tonen
    const showFirstFrame = () => {
        if (heroVideo.readyState >= 2 && heroVideo.duration > 0) {
            heroVideo.currentTime = 0.01;
            heroVideo.pause();
            // Pas parallax toe om video te initialiseren
            applyParallax();
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
    
    // Check periodiek of video klaar is
    const checkVideoReady = () => {
        if (heroVideo.readyState >= 2 && heroVideo.duration > 0) {
            if (heroVideo.currentTime === 0 || heroVideo.currentTime < 0.01) {
                heroVideo.currentTime = 0.01;
                applyParallax(); // Update scroll synchronisatie
            }
        } else {
            setTimeout(checkVideoReady, 100);
        }
    };
    checkVideoReady();
}

// Fullscreen video pinned scroll systeem
const fullscreenVideoSection = document.querySelector('.fullscreen-video');
const fullscreenVideoElement = document.querySelector('.fullscreen-video .fullscreen-video-element');

if (fullscreenVideoSection && fullscreenVideoElement && fullscreenVideoElement.tagName === 'VIDEO') {
    const section = fullscreenVideoSection;
    const video = fullscreenVideoElement;
    
    // Laatste stuk dat NIET gescrubbed wordt maar automatisch afspeelt
    const OUTRO_SECONDS = 0.6;
    
    // Interne state
    let duration = 0;
    let isOutroPlaying = false;
    let outroArmed = false;
    
    // iOS/Safari: zorg dat video "kan"
    video.muted = true;
    video.playsInline = true;
    
    // Helper: clamping
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }
    
    // Wacht op metadata zodat duration bekend is
    video.addEventListener('loadedmetadata', () => {
        duration = video.duration || 0;
        // Zet eerste frame
        if (duration > 0) {
            video.currentTime = 0.01;
            video.pause();
        }
    });
    
    function onScroll() {
        if (!duration) return;
        
        // progress binnen de sectie (0..1)
        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        const scrolled = clamp(-rect.top, 0, scrollable);
        const progress = scrollable > 0 ? scrolled / scrollable : 0;
        
        const scrubEndTime = Math.max(0, duration - OUTRO_SECONDS);
        
        // Als outro bezig is: negeer scrub updates
        if (isOutroPlaying) return;
        
        // Scrub alleen tot scrubEndTime
        const targetTime = progress * scrubEndTime;
        video.currentTime = clamp(targetTime, 0, scrubEndTime);
        
        // Arm de outro als we (bijna) op het einde zitten
        // (kleine marge om jitter te voorkomen)
        if (progress >= 0.995) {
            if (!outroArmed) {
                outroArmed = true;
                startOutro(scrubEndTime);
            }
        } else {
            outroArmed = false;
        }
    }
    
    function startOutro(scrubEndTime) {
        if (isOutroPlaying) return;
        if (!outroArmed) return;
        
        isOutroPlaying = true;
        
        // Zet exact naar het begin van de outro en speel af
        video.currentTime = scrubEndTime;
        const playPromise = video.play();
        
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                // Autoplay kan falen zonder user gesture op sommige setups.
                // In praktijk: laat user één keer klikken/tappen om video te activeren.
                isOutroPlaying = false;
            });
        }
    }
    
    // Als de video klaar is: "release"
    video.addEventListener('ended', () => {
        isOutroPlaying = false;
        outroArmed = false;
        // Optie A: laat de gebruiker meteen verder scrollen (meestal is dat al zo)
        // Optie B: "snap" de scroll net voorbij de pinned sectie zodat je zeker door bent
        // const y = window.scrollY + section.getBoundingClientRect().bottom;
        // Dit is agressief; alleen gebruiken als je merkt dat mensen "vast" blijven hangen.
        // window.scrollTo({ top: window.scrollY + 2, behavior: 'smooth' });
    });
    
    // Event listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    
    // Eerste sync
    onScroll();
    
    // Probeer video te laden
    video.load();
}

// Dark mode only - no theme toggle needed

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

