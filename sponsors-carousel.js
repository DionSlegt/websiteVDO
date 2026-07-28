/**
 * Sponsors 3D Scene - Ring met Batje en Balletje
 * 
 * De sponsor-ring draait rondom een centraal batje en pingpongballetje.
 * Ring draait op scroll, batje en balletje blijven vast.
 * Langzame, proportionele scroll-koppeling: elke sponsor krijgt ~75vh scroll.
 */

function initSponsorsScene() {
    const section = document.querySelector('.sponsors-scene-section');
    const sticky = document.querySelector('.sponsors-scene-sticky');
    const ring = document.querySelector('.sponsor-ring');
    const cards = [...document.querySelectorAll('.sponsor-ring .sponsor-card')];

    if (!section || !sticky || !ring || cards.length === 0) return;

    const cardCount = cards.length;
    const angleStep = 360 / cardCount;
    
    // Grotere radius voor de ring (cards verder van centrum)
    const radius = 850;

    // Totale rotatie: van sponsor 1 tot en met laatste sponsor
    // Elke sponsor komt precies één keer vooraan
    // Progress 0 = sponsor 1 vooraan, progress 1 = laatste sponsor vooraan
    const totalRotation = -angleStep * (cardCount - 1);

    // Dynamische sectie hoogte: elke sponsor-overgang krijgt 75vh scroll
    // Bereken volledige hoogte in JavaScript en zet inline (CSS calc met var() vermenigvuldiging is ongeldig)
    const scrollPerStep = 75;
    const steps = Math.max(cardCount - 1, 1);
    
    // Alleen op desktop (>768px) lange scroll sectie zetten
    // Op mobiel wordt height via CSS media query met !important overschreven naar auto
    if (window.innerWidth > 768) {
        section.style.height = `calc(100vh + ${steps * scrollPerStep}vh)`;
    }

    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = null;

    // Positioneer alle sponsor cards op de ring
    cards.forEach((card, index) => {
        const angle = angleStep * index;
        card.style.setProperty('--angle', `${angle}deg`);
        card.style.setProperty('--radius', `${radius}px`);
    });

    // Ring heeft lichte rotateX voor 3/4 front view (top-down kijk)
    // Max 14deg zoals aanbevolen
    ring.style.transform = 'rotateX(14deg)';

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function getScrollProgress() {
        const sectionRect = section.getBoundingClientRect();
        
        // Totale scroll-afstand binnen de sectie
        // Van wanneer top = 0 (sticky start) tot einde sectie
        const scrollDistance = section.offsetHeight - window.innerHeight;

        // Vóór sticky start (sectionRect.top > 0): progress = 0
        // Tijdens sticky (sectionRect.top <= 0): progress berekenen
        if (sectionRect.top > 0) return 0;

        // Progress: clamp(-sectionRect.top / scrollDistance, 0, 1)
        // Bij top = 0: progress = 0 (sponsor 1 vooraan)
        // Bij top = -scrollDistance: progress = 1 (laatste sponsor vooraan)
        const progress = clamp(
            -sectionRect.top / scrollDistance,
            0,
            1
        );

        return progress;
    }

    function updateScroll() {
        targetProgress = getScrollProgress();

        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        rafId = requestAnimationFrame(render);
    }

    function render() {
        // Smooth easing: kleine scrollbeweging = klein deel van rotatie
        // Factor 0.08 voor extra smoothe beweging
        currentProgress += (targetProgress - currentProgress) * 0.08;

        // Map progress lineair naar rotatie
        // Progress 0: rotation = 0 (sponsor 1 vooraan)
        // Progress 1: rotation = totalRotation (laatste sponsor vooraan)
        const rotation = currentProgress * totalRotation;

        // Ring draait, batje en balletje blijven op hun plek
        ring.style.transform = `rotateX(14deg) rotateY(${rotation}deg)`;

        // Bepaal welke card vooraan staat (active)
        let activeIndex = 0;
        let smallestDistance = Infinity;

        cards.forEach((card, index) => {
            const cardAngle = angleStep * index;
            
            // Huidige hoek van deze card t.o.v. voorkant (0°)
            const normalizedAngle = ((cardAngle + rotation) % 360 + 360) % 360;
            
            // Afstand tot voorkant (0° of 360°)
            const distanceFromFront = Math.min(
                normalizedAngle,
                360 - normalizedAngle
            );

            if (distanceFromFront < smallestDistance) {
                smallestDistance = distanceFromFront;
                activeIndex = index;
            }

            // Opacity: voorste duidelijk, zijkanten zichtbaar, achterkant transparant
            // Bij 0° afstand: opacity = 1
            // Bij 90° afstand: opacity = 0.5
            // Bij 180° afstand: opacity = 0
            const opacity = clamp(
                1 - distanceFromFront / 180,
                0,
                1
            );

            card.style.opacity = String(opacity);
            
            // Pointer events alleen voor voorste cards
            card.style.pointerEvents = 
                distanceFromFront < angleStep * 0.45 ? "auto" : "none";
        });

        // Markeer active card (vooraan)
        cards.forEach((card, index) => {
            if (index === activeIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Continue rendering als nog niet op target
        // Kleine threshold voor smooth stop
        if (Math.abs(targetProgress - currentProgress) > 0.0005) {
            rafId = requestAnimationFrame(render);
        } else {
            currentProgress = targetProgress;
            rafId = null;
        }
    }

    // Passive listeners voor betere scroll performance
    window.addEventListener('scroll', updateScroll, { passive: true });
    
    // Resize listener: herbereken hoogte bij schermgrootte wijziging
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            section.style.height = `calc(100vh + ${steps * scrollPerStep}vh)`;
        } else {
            section.style.height = '';
        }
        updateScroll();
    }, { passive: true });

    // Initial render
    updateScroll();
}

// Start wanneer DOM klaar is
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSponsorsScene);
} else {
    initSponsorsScene();
}
