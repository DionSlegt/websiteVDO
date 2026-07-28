gsap.registerPlugin(ScrollTrigger);

const backgroundImage = document.querySelector(".site-background img");

if (backgroundImage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.to(backgroundImage, {
        yPercent: -55,
        ease: "none",
        scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true
        }
    });
}
