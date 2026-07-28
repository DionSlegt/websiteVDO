# 3D Sponsor-Ring met Batje en Balletje - Proportionele Scroll

## Overzicht

De sponsorsectie is herontworpen als een 3D scène met een horizontale sponsor-ring die rondom een centraal tafeltennisbatje en pingpongballetje draait. De ring draait op scroll met een langzame, volledig proportionele koppeling: elke sponsor-overgang krijgt ~75vh scroll.

## Scroll-gedrag

### Proportionele Scroll-koppeling
- **Sectie hoogte**: Dynamisch via CSS custom property `--steps`
  - Formule: `height: calc(100vh + var(--steps) * 75vh)`
  - `--steps` wordt in JavaScript gezet op `cards.length - 1`
  - Voor 10 sponsors: `100vh + 9 * 75vh = 775vh` totaal
- **Per sponsor**: ~75vh verticale scroll voor elke overgang
- **Geen sprongen**: Kleine scrollbeweging = klein proportioneel deel van rotatie
- **Progress berekening**: 
  - `scrollDistance = section.offsetHeight - window.innerHeight`
  - `progress = clamp(-sectionRect.top / scrollDistance, 0, 1)`
  - Voor sticky start (sectionRect.top > 0): progress = 0
- **Smoothing**: RequestAnimationFrame met factor 0.08
  - `currentProgress += (targetProgress - currentProgress) * 0.08`

### Rotatie Mapping
- **Progress 0**: Sponsor 1 staat vooraan (rotation = 0deg)
- **Progress 1**: Laatste sponsor staat vooraan (rotation = totalRotation)
- **Formule**: `rotation = currentProgress * totalRotation`
- **Total rotation**: `-angleStep * (cardCount - 1)`
  - Voor 10 sponsors: `-36deg * 9 = -324deg`
  - Geen volledige 360° rondgang
  - Sponsor 1 verschijnt niet opnieuw aan het einde

### Start en Eind
- **Start**: Sectie komt in beeld, sticky wordt actief, sponsor 1 vooraan
- **Tijdens**: Elke 75vh scroll draait de ring één sponsor verder
- **Eind**: Bij progress 1 staat laatste sponsor vooraan, daarna loslaten sticky

## Hoofdelementen

### 1. Sponsor-Ring
- **Functie**: Horizontale ring van sponsor-kaarten rondom het centrum
- **Gedrag**: Draait op scroll via `rotateY`
- **Positionering**: Grotere radius (850px) om ruimte te maken voor het middenobject
- **Zichtbaarheid**: 
  - Voorste sponsor duidelijkst zichtbaar (opacity 1)
  - Zijkanten perspectivisch weggedraaid (opacity afhankelijk van hoek)
  - Achterkant zeer transparant of verborgen (opacity ~0)
- **Z-layering**: Ring loopt achter en rondom het batje, niet ervoor

### 2. Centraal Batje
- **Stijl**: Soft-3D tafeltennisbatje gemaakt met CSS
- **Positie**: Vast in het midden (draait niet mee met ring)
- **Styling**: 
  - Glassmorphism effect consistent met site-stijl
  - Rode batje-blad met radial gradient
  - Donkerbruin handvat met gradient
  - Schaduwen en inset shadows voor 3D effect
  - Lichte kanteling (rotateY -8deg, rotateX -5deg)

### 3. Pingpongballetje
- **Positie**: Boven het batje, vast in het midden
- **Animatie**: Subtiele bounce/float animatie (alsof het hoog wordt gehouden)
- **Styling**: Witte bal met radial gradient en highlights
- **Bounce**: 2 seconden cyclus, 14px beweging

## Technische Specificaties

### Camera Angle
- **Perspective**: 2200px
- **RotateX**: 14deg (lichte top-down look)
- **View**: Rustige 3/4 front view

### Scroll Behavior Details
- **Listener type**: Passive scroll en resize listeners
- **Geen scroll hijacking**: Geen wheel events, preventDefault, of vaste stappen
- **Lineaire mapping**: Progress maps exact lineair naar rotatie
- **Sticky gedrag**: Sectie blijft sticky tijdens hele scroll-range
- **Na laatste sponsor**: Sticky loslaten, normale scroll hervat

### HTML Structuur
```html
<section class="sponsors-scene-section">
  <div class="sponsors-scene-sticky">
    <div class="sponsors-scene-stage">
      
      <div class="centerpiece">
        <div class="batje"></div>
        <div class="balletje"></div>
      </div>
      
      <div class="sponsor-ring">
        <article class="sponsor-card">...</article>
        <!-- alle sponsors -->
      </div>
      
    </div>
  </div>
</section>
```

### CSS Approach
- **sponsors-scene-section**: 
  - Dynamische hoogte via `--steps` custom property
  - `height: calc(100vh + var(--steps) * 75vh)`
- **sponsors-scene-stage**: `perspective` en `transform-style: preserve-3d`
- **sponsor-ring**: 
  - `rotateX(14deg)` voor camera angle
  - `rotateY` voor rotatie (wordt via JS geanimeerd)
  - `z-index: 1` (onder centerpiece)
- **sponsor-card**: 
  - `rotateY(var(--angle))` voor positie op ring
  - `translateZ(var(--radius))` voor radius (850px)
  - Kleinere cards (300px breedte)
  - Opacity afhankelijk van hoek
- **centerpiece**: 
  - Vast in het midden
  - `z-index: 5` (boven ring achterste helft)
- **batje**: 
  - CSS shapes met `::before` (handvat) en `::after` (blad)
  - Soft shadows, gradients, inset shadows
- **balletje**: 
  - CSS keyframe bounce animatie
  - Radial gradient voor realisme

### JavaScript Approach
```javascript
// Dynamische sectie hoogte
const steps = cardCount - 1;
section.style.setProperty('--steps', steps);

// Progress berekening
const scrollDistance = section.offsetHeight - window.innerHeight;
const progress = clamp(-sectionRect.top / scrollDistance, 0, 1);

// Smoothing
currentProgress += (targetProgress - currentProgress) * 0.08;

// Rotatie
const rotation = currentProgress * totalRotation;
ring.style.transform = `rotateX(14deg) rotateY(${rotation}deg)`;
```

## Parameters

### Scroll
- **Scroll per sponsor**: 75vh
- **Smoothing factor**: 0.08
- **Progress range**: 0 tot 1
- **Rotation range**: 0 tot `-(360/n) * (n-1)` graden

### Ring
- **Radius**: 850px (desktop)
- **Camera angle**: rotateX(14deg)
- **Card width**: 300px
- **Card aspect-ratio**: 4/3
- **Angle step**: 360 / cardCount

### Batje
- **Width**: 140px (desktop), 100px (mobiel), 80px (klein)
- **Height**: 200px (desktop), 150px (mobiel), 120px (klein)
- **Blad**: 140x140px, rood met gradient
- **Handvat**: 35x85px, donkerbruin met gradient

### Balletje
- **Diameter**: 45px (desktop), 35px (mobiel), 30px (klein)
- **Positie**: 20px van top centerpiece
- **Bounce**: 14px verticaal, 2s cyclus

## Voorbeeld Berekening (10 sponsors)

```
cardCount = 10
steps = 9
angleStep = 360 / 10 = 36deg
totalRotation = -36 * 9 = -324deg

Sectie hoogte = 100vh + 9 * 75vh = 775vh

Progress 0.00 → rotation 0deg     → sponsor 1 vooraan
Progress 0.11 → rotation -36deg   → sponsor 2 vooraan
Progress 0.22 → rotation -72deg   → sponsor 3 vooraan
Progress 0.33 → rotation -108deg  → sponsor 4 vooraan
Progress 0.44 → rotation -144deg  → sponsor 5 vooraan
Progress 0.56 → rotation -180deg  → sponsor 6 vooraan
Progress 0.67 → rotation -216deg  → sponsor 7 vooraan
Progress 0.78 → rotation -252deg  → sponsor 8 vooraan
Progress 0.89 → rotation -288deg  → sponsor 9 vooraan
Progress 1.00 → rotation -324deg  → sponsor 10 vooraan
```

## Responsive Design

### Desktop (>768px)
- Volledige proportionele scroll met lange sectie-hoogte
- Batje: 140x200px
- Balletje: 45px
- Cards: 300px breed
- Radius: 850px

### Mobiel (<768px)
- Geen lange scroll sectie (height: auto, min-height: 100vh)
- Normale sticky behavior
- Batje: 100x150px
- Balletje: 35px
- Cards: 260px breed

### Extra klein (<480px)
- Batje: 80x120px
- Balletje: 30px
- Cards: 220px breed

## Bestanden Aangepast

### 1. `styles.css`
- Dynamische sectie-hoogte met `--steps` custom property
- Centerpiece absolute positioning verfijnd
- Batje en balletje styling verbeterd
- Responsive breakpoints aangepast

### 2. `sponsors-carousel.js`
- Dynamische `--steps` berekening
- Progress formule: `clamp(-sectionRect.top / scrollDistance, 0, 1)`
- Smoothing factor aangepast naar 0.08
- Lineaire rotatie mapping
- Passive listeners
- Uitgebreide documentatie

### 3. `index.html`
- HTML structuur met `sponsors-scene-section`
- Centerpiece met batje en balletje
- Sponsor-ring met alle sponsor cards

### 4. `SPONSORS_3D_RING_README.md` (dit bestand)
- Volledige documentatie van proportionele scroll-koppeling
- Technische specificaties en berekeningen
- Voorbeeld met 10 sponsors

## Browser Compatibility

- **Moderne browsers**: Volledige 3D ondersteuning
- **Safari**: Gebruikt `-webkit-backdrop-filter`
- **Reduced motion**: Volle functionaliteit behouden, animaties uitgeschakeld

## Prestaties

- **will-change**: `transform` op ring
- **requestAnimationFrame**: Smooth rendering met 0.08 easing
- **Passive scroll listeners**: Betere scroll performance
- **Transform-only animaties**: GPU-accelerated
- **Geen scroll hijacking**: Natuurlijke browser scroll behavior
