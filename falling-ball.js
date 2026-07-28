// Falling Ball Animation - Scroll-driven
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initFallingBall() {
  // Check if GSAP is loaded
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP or ScrollTrigger not loaded for falling ball');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Get the elements
  const section = document.querySelector('.falling-ball-section');
  const ball = document.querySelector('.falling-ball');
  const ballInner = document.querySelector('.ball-inner');

  if (!section || !ball || !ballInner) {
    console.warn('Falling ball elements not found');
    return;
  }

  // Skip animation if user prefers reduced motion
  if (prefersReducedMotion) {
    gsap.set(ball, { y: '50vh', opacity: 1 });
    return;
  }

  // Calculate fall distance (from top of viewport to bottom)
  const fallDistance = window.innerHeight + 100;

  // Create the falling animation
  const fallingTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5, // Smooth scrubbing
      invalidateOnRefresh: true,
      onEnter: () => {
        gsap.set(ball, { opacity: 1 });
      },
      onLeave: () => {
        gsap.set(ball, { opacity: 0 });
      },
      onEnterBack: () => {
        gsap.set(ball, { opacity: 1 });
      },
      onLeaveBack: () => {
        gsap.set(ball, { opacity: 0 });
      }
    }
  });

  // Ball falls down
  fallingTimeline.to(ball, {
    y: fallDistance,
    ease: 'none'
  }, 0);

  // Ball rotates to simulate rolling (multiple rotations during fall)
  // The ball should rotate clockwise as it falls
  // More rotations = faster spinning
  fallingTimeline.to(ballInner, {
    rotation: 720, // 2 full rotations
    ease: 'none'
  }, 0);

  // Add slight horizontal wobble for more natural movement
  fallingTimeline.to(ball, {
    x: '+=20',
    ease: 'sine.inOut',
    repeat: 1,
    yoyo: true
  }, 0);

  // Refresh ScrollTrigger on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFallingBall);
} else {
  initFallingBall();
}
