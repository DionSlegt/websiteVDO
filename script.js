// Gallery carousel met Splide.js
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

// Initialiseer de gallery carousel wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    initGalleryCarousel();
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

// Parallax effect per blok/sectie op alle pagina's
(function initParallax() {
    let ticking = false;
    
    function updateParallax() {
        const scrollY = window.pageYOffset || window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Hero section - hele blok beweegt langzamer (op alle pagina's)
        const hero = document.querySelector('.hero');
        if (hero) {
            const heroRect = hero.getBoundingClientRect();
            const heroTop = heroRect.top + scrollY;
            const heroHeight = hero.offsetHeight;
            
            if (scrollY >= heroTop - windowHeight && scrollY <= heroTop + heroHeight) {
                const scrollProgress = (scrollY - heroTop + windowHeight) / (heroHeight + windowHeight);
                const parallaxValue = scrollProgress * 300;
                
                // Hele hero sectie beweegt langzamer
                hero.style.transform = `translateY(${parallaxValue * 0.6}px) translateZ(0)`;
            }
        }
        
        // About section - hele blok beweegt sneller
        const about = document.querySelector('.about');
        if (about) {
            const aboutRect = about.getBoundingClientRect();
            const aboutTop = aboutRect.top + scrollY;
            const aboutHeight = about.offsetHeight;
            
            if (scrollY >= aboutTop - windowHeight && scrollY <= aboutTop + aboutHeight) {
                const scrollProgress = (scrollY - aboutTop + windowHeight) / (aboutHeight + windowHeight);
                const parallaxValue = scrollProgress * 200;
                
                // Hele about sectie beweegt sneller omhoog
                about.style.transform = `translateY(${parallaxValue * -0.5}px) translateZ(0)`;
            }
        }
        
        // Location section - hele blok beweegt langzamer
        const location = document.querySelector('.location');
        if (location) {
            const locationRect = location.getBoundingClientRect();
            const locationTop = locationRect.top + scrollY;
            const locationHeight = location.offsetHeight;
            
            if (scrollY >= locationTop - windowHeight && scrollY <= locationTop + locationHeight) {
                const scrollProgress = (scrollY - locationTop + windowHeight) / (locationHeight + windowHeight);
                const parallaxValue = scrollProgress * 250;
                
                // Hele location sectie beweegt langzamer
                location.style.transform = `translateY(${parallaxValue * 0.5}px) translateZ(0)`;
            }
        }
        
        // Contact section - hele blok beweegt sneller
        const contact = document.querySelector('.contact');
        if (contact) {
            const contactRect = contact.getBoundingClientRect();
            const contactTop = contactRect.top + scrollY;
            const contactHeight = contact.offsetHeight;
            
            if (scrollY >= contactTop - windowHeight && scrollY <= contactTop + contactHeight) {
                const scrollProgress = (scrollY - contactTop + windowHeight) / (contactHeight + windowHeight);
                const parallaxValue = scrollProgress * 180;
                
                // Hele contact sectie beweegt sneller
                contact.style.transform = `translateY(${parallaxValue * -0.4}px) translateZ(0)`;
            }
        }
        
        // Teams section - hele blok beweegt langzamer
        const teamsSection = document.querySelector('.teams-section');
        if (teamsSection) {
            const teamsRect = teamsSection.getBoundingClientRect();
            const teamsTop = teamsRect.top + scrollY;
            const teamsHeight = teamsSection.offsetHeight;
            
            if (scrollY >= teamsTop - windowHeight && scrollY <= teamsTop + teamsHeight) {
                const scrollProgress = (scrollY - teamsTop + windowHeight) / (teamsHeight + windowHeight);
                const parallaxValue = scrollProgress * 220;
                
                // Hele teams sectie beweegt langzamer
                teamsSection.style.transform = `translateY(${parallaxValue * 0.4}px) translateZ(0)`;
            }
        }
        
        // Board section - hele blok beweegt sneller
        const boardSection = document.querySelector('.board-section');
        if (boardSection) {
            const boardRect = boardSection.getBoundingClientRect();
            const boardTop = boardRect.top + scrollY;
            const boardHeight = boardSection.offsetHeight;
            
            if (scrollY >= boardTop - windowHeight && scrollY <= boardTop + boardHeight) {
                const scrollProgress = (scrollY - boardTop + windowHeight) / (boardHeight + windowHeight);
                const parallaxValue = scrollProgress * 190;
                
                // Hele board sectie beweegt sneller
                boardSection.style.transform = `translateY(${parallaxValue * -0.45}px) translateZ(0)`;
            }
        }
        
        // Sponsors section - hele blok beweegt sneller
        const sponsorsSection = document.querySelector('.sponsors');
        if (sponsorsSection) {
            const sponsorsRect = sponsorsSection.getBoundingClientRect();
            const sponsorsTop = sponsorsRect.top + scrollY;
            const sponsorsHeight = sponsorsSection.offsetHeight;
            
            if (scrollY >= sponsorsTop - windowHeight && scrollY <= sponsorsTop + sponsorsHeight) {
                const scrollProgress = (scrollY - sponsorsTop + windowHeight) / (sponsorsHeight + windowHeight);
                const parallaxValue = scrollProgress * 170;
                
                // Hele sponsors sectie beweegt sneller
                sponsorsSection.style.transform = `translateY(${parallaxValue * -0.35}px) translateZ(0)`;
            }
        }
        
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    // Initialiseer parallax
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });
    
    // Initial call
    updateParallax();
})();

// Theme toggle functionaliteit
(function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Laad opgeslagen thema of gebruik standaard
    const savedTheme = localStorage.getItem('theme') || 'default';
    if (savedTheme === 'pastel') {
        html.setAttribute('data-theme', 'pastel');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            
            if (currentTheme === 'pastel') {
                html.removeAttribute('data-theme');
                localStorage.setItem('theme', 'default');
            } else {
                html.setAttribute('data-theme', 'pastel');
                localStorage.setItem('theme', 'pastel');
            }
        });
    }
})();

// Interactieve tafeltennisbal animatie met fysica
(function initBallAnimation() {
    const ball = document.getElementById("ball");
    const sound = document.getElementById("hit-sound");

    if (!ball) return;

    // Bal wordt gepositioneerd via CSS (80% van container, 50% hoogte)
    // We gebruiken getBoundingClientRect voor collision detection
    function getBallPosition() {
        const rect = ball.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
    
    // Initialiseer bal positie variabelen
    const initialPos = getBallPosition();
    ballX = initialPos.x;
    ballY = initialPos.y;
    
    let velocityX = 0;
    let velocityY = 0;
    let gravity = 0.5;
    let bounce = 0.6;
    let isHit = false;
    let lastMouse = { x: 0, y: 0 };

    function updateBall() {
        if (isHit) {
            // Zwaartekracht toepassen
            velocityY += gravity;
            
            // Positie updaten
            ballX += velocityX;
            ballY += velocityY;
        }

        // Stuiteren onderaan
        if (ballY + 10 > window.innerHeight) {
            ballY = window.innerHeight - 10;
            velocityY *= -bounce;
        }

        // Demp X ook langzaam
        velocityX *= 0.98;

        // Stuiteren aan de zijkanten
        if (ballX - 10 < 0 || ballX + 10 > window.innerWidth) {
            velocityX *= -bounce;
            ballX = Math.max(10, Math.min(window.innerWidth - 10, ballX));
        }

        // Update positie met fixed positioning
        ball.style.position = 'fixed';
        ball.style.left = `${ballX}px`;
        ball.style.top = `${ballY}px`;
        ball.style.transform = 'translate(-50%, -50%)';

        requestAnimationFrame(updateBall);
    }

    document.addEventListener("mousemove", (e) => {
        const mouseBox = {
            left: e.clientX - 10,
            right: e.clientX + 10,
            top: e.clientY - 10,
            bottom: e.clientY + 10
        };

        const ballBox = ball.getBoundingClientRect();

        const collision = mouseBox.left < ballBox.right &&
                         mouseBox.right > ballBox.left &&
                         mouseBox.top < ballBox.bottom &&
                         mouseBox.bottom > ballBox.top;

        if (collision && !isHit) {
            // Slag richting berekenen
            velocityX = (e.clientX - lastMouse.x) * 0.5;
            velocityY = (e.clientY - lastMouse.y) * 0.5;
            isHit = true;

            // Geluid afspelen
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(() => {}); // Ignore errors if sound fails
            }
        }

        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
    });

    // Reset bal na een tijdje
    setInterval(() => {
        if (isHit && Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1 && ballY > window.innerHeight - 15) {
            isHit = false;
            // Reset naar start positie (rechts in hero)
            const hero = document.querySelector('.hero');
            if (hero) {
                const heroRect = hero.getBoundingClientRect();
                ballX = heroRect.left + heroRect.width * 0.8;
                ballY = heroRect.top + heroRect.height * 0.5;
            } else {
                ballX = window.innerWidth * 0.8;
                ballY = window.innerHeight * 0.4;
            }
            
            velocityX = 0;
            velocityY = 0;
        }
    }, 1000);

    updateBall();
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
