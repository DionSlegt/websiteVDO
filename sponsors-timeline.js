// Sponsors Timeline - horizontale scroll-gestuurde sponsorsectie
// Zelfde GSAP ScrollTrigger-aanpak als champions-timeline.js:
// pinning, horizontale track-beweging, actief-item op basis van
// positie t.o.v. het midden van het scherm, progressiebalk,
// gsap.matchMedia() voor responsive gedrag en prefers-reduced-motion fallback.

const sponsorsPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initSponsorsTimelineGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP of ScrollTrigger niet geladen (sponsors-timeline)');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  const section = document.querySelector('.sponsors-timeline');
  if (!section) {
    return;
  }

  if (sponsorsPrefersReducedMotion) {
    // Fallback voor reduced motion: gewoon horizontaal scrollbaar maken
    section.classList.add('sponsors-timeline--reduced-motion');
    return;
  }

  initializeSponsorsTimeline();
}

let sponsorsCurrentActiveItem = null;

function initializeSponsorsTimeline() {
  const section = document.querySelector('.sponsors-timeline');
  const viewport = document.querySelector('.sponsors-timeline__viewport');
  const track = document.querySelector('.sponsors-timeline__track');
  const progressFill = document.querySelector('.sponsors-timeline__progress-fill');
  const items = gsap.utils.toArray('.sponsor-item');

  if (!section || !track || !viewport || items.length === 0) {
    return;
  }

  // Berekent hoeveel padding-left/-right de track nodig heeft zodat het
  // EERSTE item bij scroll-start en het LAATSTE item bij scroll-einde
  // daadwerkelijk gecentreerd t.o.v. het midden van het VENSTER (window)
  // komen te staan.
  //
  // Werkwijze (o.b.v. daadwerkelijke offsetLeft/offsetWidth i.p.v. een
  // hardgecodeerd aantal items in CSS, zodat dit blijft kloppen ongeacht
  // hoeveel sponsor-items er in de HTML staan):
  // - trackLeft = de statische (ongetransformeerde) positie van de track
  //   t.o.v. het venster. De sectie/viewport heeft eigen padding, dus de
  //   track begint niet noodzakelijk op x=0; hier houden we daar rekening
  //   mee zodat de centrering écht t.o.v. het schermmidden klopt (en niet
  //   t.o.v. de track's eigen, mogelijk verschoven, coördinaten).
  // - itemsSpan = totale breedte die de items + onderlinge gaps innemen
  //   (van de linkerrand van het eerste item t/m de rechterrand van het
  //   laatste item). Dit is onafhankelijk van de huidige padding-waarden.
  // - padding-left zodanig dat het eerste item exact gecentreerd staat bij
  //   translateX(0) (scroll-start).
  // - padding-right zodanig dat wanneer de track volledig naar links is
  //   bewogen (scroll-einde, translateX = -(scrollWidth - viewportWidth))
  //   het laatste item exact gecentreerd staat.
  function updateTrackSpacing() {
    if (window.innerWidth < 768 || items.length === 0) return;

    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    // Reset tijdelijk om te meten t.o.v. een schone basis (voorkomt dat een
    // eerder ingestelde inline padding/transform de meting beïnvloedt).
    const prevPaddingLeft = track.style.paddingLeft;
    const prevPaddingRight = track.style.paddingRight;
    const prevTransform = track.style.transform;
    track.style.paddingLeft = '';
    track.style.paddingRight = '';
    track.style.transform = 'none';

    const trackLeft = track.getBoundingClientRect().left;
    const itemsSpan = lastItem.offsetLeft + lastItem.offsetWidth - firstItem.offsetLeft;
    const firstItemWidth = firstItem.offsetWidth;
    const lastItemWidth = lastItem.offsetWidth;
    const viewportWidth = window.innerWidth;

    const paddingLeft = Math.max(0, (viewportWidth - firstItemWidth) / 2 - trackLeft);
    const paddingRight = Math.max(0, itemsSpan + (viewportWidth - lastItemWidth) / 2 + trackLeft);

    track.style.transform = prevTransform;

    if (paddingLeft === 0 && paddingRight === 0) {
      // Meting mislukt (bv. items niet zichtbaar): herstel vorige waarden.
      track.style.paddingLeft = prevPaddingLeft;
      track.style.paddingRight = prevPaddingRight;
      return;
    }

    track.style.paddingLeft = `${paddingLeft}px`;
    track.style.paddingRight = `${paddingRight}px`;
  }

  function clearTrackSpacing() {
    track.style.paddingLeft = '';
    track.style.paddingRight = '';
  }

  // gsap.matchMedia() voor responsive gedrag
  const mm = gsap.matchMedia();

  mm.add({
    isDesktop: '(min-width: 768px)',
    isMobile: '(max-width: 767px)'
  }, (context) => {
    const { isDesktop } = context.conditions;

    if (isDesktop) {
      updateTrackSpacing();

      // Dynamische berekening van scroll-afstand: neemt de volledige
      // scrollWidth van de track (incl. de zojuist berekende padding) mee,
      // zodat de pin pas loslaat nadat het laatste item gecentreerd is geweest.
      const getScrollDistance = () => {
        const scrollDist = track.scrollWidth - window.innerWidth;
        return Math.max(0, scrollDist);
      };

      let isScrolling = false;
      let scrollTriggerInstance = null;

      function continuousUpdate() {
        if (isScrolling && scrollTriggerInstance) {
          updateActiveSponsorByPosition(items);

          if (progressFill && scrollTriggerInstance.progress !== undefined) {
            progressFill.style.transform = `scaleX(${scrollTriggerInstance.progress})`;
          }

          requestAnimationFrame(continuousUpdate);
        }
      }

      // Horizontale scroll-animatie, gepind aan de bovenkant
      gsap.to(track, {
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
            updateActiveSponsorByPosition(items);
            requestAnimationFrame(continuousUpdate);
          },
          onLeave: () => {
            isScrolling = false;
            updateActiveSponsorByPosition(items);
          },
          onEnterBack: (self) => {
            scrollTriggerInstance = self;
            isScrolling = true;
            updateActiveSponsorByPosition(items);
            requestAnimationFrame(continuousUpdate);
          },
          onLeaveBack: () => {
            isScrolling = false;
          },
          onUpdate: (self) => {
            scrollTriggerInstance = self;
          }
        }
      });

      track.style.transform = 'translateX(0)';

      // Eerste sponsor als actief item bij start
      sponsorsCurrentActiveItem = items[0];
      setActiveSponsor(sponsorsCurrentActiveItem, items);
    } else {
      // Mobiel: gewone rij, geen pinning of horizontale scroll-jacking
      clearTrackSpacing();
      section.classList.add('sponsors-timeline--mobile');

      items.forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            once: true
          }
        });
      });
    }

    return () => {
      // Cleanup bij media-query wissel
      section.classList.remove('sponsors-timeline--mobile');
      sponsorsCurrentActiveItem = null;
      clearTrackSpacing();
    };
  });

  // Herbereken de padding + scroll-afstand bij resize, zodat de pin-duur
  // correct blijft kloppen op elk schermformaat (analoog aan invalidateOnRefresh).
  let sponsorsSpacingResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(sponsorsSpacingResizeTimer);
    sponsorsSpacingResizeTimer = setTimeout(() => {
      if (window.innerWidth >= 768) {
        updateTrackSpacing();
      }
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 250);
  });
}

// Zet het actieve item (dichtst bij het midden van het scherm)
function setActiveSponsor(nextItem, items) {
  items.forEach((item) => {
    item.classList.toggle('is-active', item === nextItem);
  });
}

// Bepaal actief item op basis van positie t.o.v. het midden van het scherm
function updateActiveSponsorByPosition(items) {
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

  if (closestItem !== sponsorsCurrentActiveItem) {
    sponsorsCurrentActiveItem = closestItem;
    setActiveSponsor(sponsorsCurrentActiveItem, items);
  }
}

// Initialiseren zodra DOM klaar is
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSponsorsTimelineGSAP);
} else {
  initSponsorsTimelineGSAP();
}
