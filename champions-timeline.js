// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize when GSAP is loaded
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP or ScrollTrigger not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Wait for fonts and content to load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  // Initialize timeline only if elements exist and motion is allowed
  const section = document.querySelector('.champions-timeline');
  if (!section) {
    console.warn('Champions timeline section not found');
  } else if (prefersReducedMotion) {
    // Fallback for reduced motion: make timeline horizontally scrollable
    section.classList.add('champions-timeline--reduced-motion');
  } else {
    initializeTimeline();
  }
}

function initializeTimeline() {
  const section = document.querySelector('.champions-timeline');
  const viewport = document.querySelector('.champions-timeline__viewport');
  const track = document.querySelector('.champions-timeline__track');
  const header = document.querySelector('.champions-timeline__header');
  const progressFill = document.querySelector('.champions-timeline__progress-fill');
  const items = gsap.utils.toArray('.champion-year');

  if (!section || !track || !viewport) {
    console.warn('Required timeline elements not found');
    return;
  }

  // Use matchMedia for responsive behavior
  const mm = gsap.matchMedia();

  mm.add({
    // Desktop: horizontal scroll with pinning
    isDesktop: '(min-width: 768px)',
    // Mobile: vertical layout
    isMobile: '(max-width: 767px)'
  }, (context) => {
    const { isDesktop } = context.conditions;

    if (isDesktop) {
      // Calculate horizontal scroll distance dynamically
      // We need enough distance so both first and last items can be centered
      const getScrollDistance = () => {
        // Simple calculation: track width minus viewport width
        // The 50vw padding on each side naturally allows centering
        const scrollDist = track.scrollWidth - window.innerWidth;
        return Math.max(0, scrollDist);
      };

      // Continuous active item tracking
      let isScrolling = false;
      let scrollTriggerInstance = null;
      let scrollEndTimer = null;
      
      function continuousUpdate() {
        if (isScrolling && scrollTriggerInstance) {
          updateActiveItemByPosition(track, items);
          
          // Update progress bar
          if (progressFill && scrollTriggerInstance.progress !== undefined) {
            progressFill.style.transform = `scaleX(${scrollTriggerInstance.progress})`;
          }
          
          requestAnimationFrame(continuousUpdate);
        }
      }
      
      // Detecteer wanneer scrollen stopt en forceer correcte item
      function onScrollEnd() {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
          if (isScrolling) {
            updateActiveItemByPosition(track, items);
          }
        }, 100); // Check 100ms na laatste scroll event
      }

      // Main horizontal scroll animation
      const horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: viewport,
          scrub: 0.3,
          invalidateOnRefresh: true,
          onEnter: (self) => {
            scrollTriggerInstance = self;
            isScrolling = true;
            updateActiveItemByPosition(track, items);
            requestAnimationFrame(continuousUpdate);
          },
          onLeave: () => {
            isScrolling = false;
            updateActiveItemByPosition(track, items);
          },
          onEnterBack: (self) => {
            scrollTriggerInstance = self;
            isScrolling = true;
            updateActiveItemByPosition(track, items);
            requestAnimationFrame(continuousUpdate);
          },
          onLeaveBack: () => {
            isScrolling = false;
          },
          onUpdate: (self) => {
            scrollTriggerInstance = self;
            onScrollEnd();
          }
        }
      });

      // Header blijft zichtbaar tijdens scrollen (geen fade-out)
      // Originele fade animatie verwijderd op verzoek van gebruiker

      // Set the track position so the first item is centered
      track.style.transform = 'translateX(0)';

      // Set the first item as active initially with bounce animation
      if (items.length > 0) {
        currentActiveItem = items[0];
        setActiveItem(currentActiveItem, items);
      }
    } else {
      // Mobile: vertical layout, no pinning
      section.classList.add('champions-timeline--mobile');
      
      // Simple fade-in animation for mobile items
      items.forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            once: true
          }
        });
      });
    }

    return () => {
      // Cleanup
      section.classList.remove('champions-timeline--mobile');
      
      // Kill ball animation
      if (activeBallTween) {
        activeBallTween.kill();
        activeBallTween = null;
      }
      
      // Reset tracking
      currentActiveItem = null;
    };
  });
}

// Update active item based on scroll progress
function updateActiveItem(progress, items) {
  if (!items || items.length === 0) return;

  // Calculate which item should be active based on scroll progress
  const activeIndex = Math.round(progress * (items.length - 1));

  items.forEach((item, index) => {
    const isActive = index === activeIndex;
    
    gsap.to(item, {
      opacity: isActive ? 1 : 0.45,
      scale: isActive ? 1 : 0.94,
      duration: 0.3,
      ease: 'power2.out'
    });

    // Toggle active class for CSS styling
    if (isActive && !item.classList.contains('is-active')) {
      items.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
    }
  });
}

// Bounce animation state
let activeBallTween = null;
let currentActiveItem = null;

// Animate bouncing ball for active item
function animateActiveBall(activeItem) {
  // Kill existing animation
  if (activeBallTween) {
    activeBallTween.kill();
    activeBallTween = null;
  }

  // Reset all balls
  document.querySelectorAll(".champion-year__ball").forEach((ball) => {
    gsap.set(ball, {
      y: 0,
      scaleX: 1,
      scaleY: 1
    });
  });

  if (!activeItem) return;

  const ball = activeItem.querySelector(".champion-year__ball");
  if (!ball) return;

  // Create bounce animation
  activeBallTween = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.05
  });

  activeBallTween
    .to(ball, {
      y: -25,
      duration: 0.25,
      ease: "power2.out"
    })
    .to(ball, {
      y: 0,
      duration: 0.22,
      ease: "power2.in"
    })
    .set(ball, {
      scaleX: 1.15,
      scaleY: 0.85
    })
    .to(ball, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.1,
      ease: "power1.out"
    });
}

// Set active item and trigger ball animation
function setActiveItem(nextItem, items) {
  items.forEach((item) => {
    const isActive = item === nextItem;
    
    // Directe style updates zonder animatie voor maximale snelheid
    item.style.opacity = isActive ? '1' : '0.45';
    item.style.transform = isActive ? 'scale(1)' : 'scale(0.94)';
    
    // Toggle active class
    if (isActive) {
      item.classList.add('is-active');
    } else {
      item.classList.remove('is-active');
    }
  });

  // Start bounce animation if motion is allowed
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animateActiveBall(nextItem);
  }
}

// Update active item based on position (which item is closest to center)
function updateActiveItemByPosition(track, items) {
  if (!items || items.length === 0) return;

  const centerX = window.innerWidth / 2;
  
  let closestIndex = 0;
  let closestDistance = Infinity;

  items.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const distance = Math.abs(itemCenterX - centerX);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  const closestItem = items[closestIndex];
  
  // Only update if the active item changed
  if (closestItem !== currentActiveItem) {
    currentActiveItem = closestItem;
    setActiveItem(currentActiveItem, items);
  }
}

// Refresh on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 250);
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGSAP);
} else {
  initGSAP();
}
