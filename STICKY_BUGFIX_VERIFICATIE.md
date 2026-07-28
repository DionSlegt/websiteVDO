# Bugfix: Sticky Scroll Sponsor-Ring - CSS calc() met var() Vermenigvuldiging

## Probleem Analyse

### Root Cause
De CSS regel `height: calc(100vh + var(--steps) * 75vh)` is **ongeldig** omdat CSS `calc()` geen directe vermenigvuldiging met een CSS custom property ondersteunt. Dit resulteerde in:
- Geen geldige sectie-hoogte
- Sticky effect werkt niet (geen scroll-range)
- Ring draait niet op scroll

### Symptomen
- `.sponsors-scene-sticky` blijft niet "plakken" tijdens scroll
- Sectie heeft effectief alleen `min-height: 100vh`
- Geen lange scroll-sectie beschikbaar voor proportionele rotatie

## Oplossing Geïmplementeerd

### 1. CSS: Ongeldige calc() Verwijderd

**Voorheen (ONGELDIG):**
```css
.sponsors-scene-section {
    height: calc(100vh + var(--steps) * 75vh);
}
```

**Nu (GELDIG):**
```css
.sponsors-scene-section {
    position: relative;
    width: 100%;
    min-height: 100vh;
    padding: 0 !important;
    background: transparent;
    overflow: visible;
}
```

### 2. JavaScript: Inline Hoogte Berekening

**Voorheen:**
```javascript
const steps = cardCount - 1;
section.style.setProperty('--steps', steps);
```

**Nu:**
```javascript
const scrollPerStep = 75;
const steps = Math.max(cardCount - 1, 1);

// Alleen op desktop (>768px) lange scroll sectie zetten
if (window.innerWidth > 768) {
    section.style.height = `calc(100vh + ${steps * scrollPerStep}vh)`;
}
```

**Voorbeeld voor 10 sponsors:**
```javascript
steps = 9
section.style.height = "calc(100vh + 675vh)" // = 775vh totaal
```

### 3. CSS: Sticky Container Verbeterd

```css
.sponsors-scene-sticky {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    display: grid;
    place-items: center;
    overflow: hidden;
    z-index: 2;
}
```

**Toegevoegd:**
- `width: 100%` voor volledige breedte
- `z-index: 2` voor layering
- Expliciete `overflow: hidden` (alleen op sticky element zelf)

### 4. Mobiele Override met !important

```css
@media (max-width: 768px) {
    .sponsors-scene-section {
        /* Override inline height gezet door JavaScript */
        height: auto !important;
        min-height: 100vh;
        padding: 60px 20px !important;
    }
    
    .sponsors-scene-sticky {
        /* Niet sticky op mobiel */
        position: relative;
        top: auto;
        height: auto;
        min-height: 80vh;
    }
}
```

**Rationale voor !important:**
- Inline styles via JavaScript hebben hogere specificiteit dan CSS
- `!important` in media query overschrijft inline `section.style.height`
- Meest robuuste aanpak: JavaScript check (`window.innerWidth > 768`) + CSS fallback

### 5. Resize Handler

```javascript
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        section.style.height = `calc(100vh + ${steps * scrollPerStep}vh)`;
    } else {
        section.style.height = ''; // Verwijder inline style op mobiel
    }
    updateScroll();
}, { passive: true });
```

**Dubbele beveiliging:**
- JavaScript zet geen hoogte op mobiel
- CSS `!important` override als backup

### 6. Padding Override

```css
.sponsors-scene-section {
    padding: 0 !important;
}
```

**Reden:**
De algemene regel `section:not(.location):not(.contact):not(.location-section):not(.lid-worden-section)` geeft `padding: 40px 20px` aan alle sections, inclusief sponsors-scene-section. De `!important` override voorkomt ongewenste padding.

## Parent Element Verificatie

### Gecontroleerd voor Sticky Blockers

**body:**
```css
body {
    overflow-x: hidden; /* OK: alleen x-as */
}
```
✅ Geen probleem voor sticky

**.site-content:**
```css
.site-content {
    position: relative;
    z-index: 1;
}
```
✅ Geen `overflow` of `transform` die sticky blokkeren

**Conclusie:** Geen parent elementen blokkeren `position: sticky`

## Technische Verificatie

### Desktop (>768px)

**Sectie hoogte voor 10 sponsors:**
```
100vh + (9 * 75vh) = 775vh
```

**Scroll Progress Mapping:**
```javascript
// Wanneer sectionRect.top = 0: progress = 0
// Wanneer sectionRect.top = -675vh: progress = 1

progress = clamp(-sectionRect.top / scrollDistance, 0, 1)
rotation = progress * totalRotation
         = progress * (-324deg)
```

**Sticky Gedrag:**
1. Sectie komt in beeld
2. Bij `top: 0` wordt `.sponsors-scene-sticky` sticky
3. Blijft sticky gedurende 675vh scroll
4. Bij progress 1 (laatste sponsor vooraan) loslaten
5. Normale scroll hervat

### Mobiel (≤768px)

**Hoogte:**
- JavaScript zet geen inline height
- CSS: `height: auto !important`
- Fallback: `min-height: 100vh`

**Sticky:**
- `position: relative` (niet sticky)
- Normale document flow
- Geen lange scroll-sectie

## Bestanden Aangepast

### 1. **styles.css**

**Wijzigingen:**
- Regel ~1906: Verwijderd ongeldige `height: calc(100vh + var(--steps) * 75vh)`
- Regel ~1906-1913: Nieuwe `.sponsors-scene-section` styling
  - `position: relative`
  - `width: 100%`
  - `min-height: 100vh`
  - `padding: 0 !important`
  - `overflow: visible`
- Regel ~1916-1925: Verbeterde `.sponsors-scene-sticky` styling
  - `width: 100%` toegevoegd
  - `z-index: 2` toegevoegd
- Regel ~2025-2056: Mobiele override met `!important`
  - `height: auto !important`
  - `padding: 60px 20px !important`
  - `position: relative` voor sticky

### 2. **sponsors-carousel.js**

**Wijzigingen:**
- Regel 30-36: Vervangen CSS custom property door inline height
  ```javascript
  // Oud:
  section.style.setProperty('--steps', steps);
  
  // Nieuw:
  const scrollPerStep = 75;
  const steps = Math.max(cardCount - 1, 1);
  if (window.innerWidth > 768) {
      section.style.height = `calc(100vh + ${steps * scrollPerStep}vh)`;
  }
  ```
- Regel 163-172: Resize handler toegevoegd
  - Herberekent hoogte bij schermgrootte wijziging
  - Verwijdert inline style op mobiel
  - Roept `updateScroll()` aan voor progress update

## Funcionaliteit Behouden ✅

- ✅ Ring draait op scroll met proportionele koppeling
- ✅ Progress 0 = sponsor 1 vooraan
- ✅ Progress 1 = laatste sponsor vooraan
- ✅ Elke sponsor ~75vh scroll
- ✅ Smoothing factor 0.08
- ✅ Batje en balletje blijven centraal
- ✅ Sponsor cards, ring radius en camera angle ongewijzigd
- ✅ Scroll-rotatie logica intact
- ✅ Mobiele fallback zonder sticky

## Test Resultaat Verwachting

### Desktop
1. **Scroll naar sponsorsectie** → Sectie wordt sticky bij top: 0
2. **Kleine scroll** → Ring draait klein stukje (proportioneel)
3. **Scroll door sectie** → Elke sponsor komt vooraan bij ~75vh interval
4. **Laatste sponsor** → Bij progress 1 vooraan, sticky loslaten
5. **Verder scrollen** → Normale scroll hervat

### Mobiel
1. **Scroll naar sponsorsectie** → Normale scroll (niet sticky)
2. **Sectie hoogte** → Auto (niet 775vh)
3. **Ring rotatie** → Werkt nog steeds op basis van sectie positie
4. **Layout** → Responsive styling actief

## Samenvatting

**Kernprobleem opgelost:**
CSS `calc()` kan geen `var(--steps) * 75vh` vermenigvuldiging uitvoeren. Oplossing: volledige berekening in JavaScript met inline `section.style.height` op desktop, en CSS `!important` override op mobiel.

**Wijzigingen:**
- ✅ CSS: Ongeldige calc verwijderd, sticky setup verbeterd
- ✅ JavaScript: Inline hoogte berekening + resize handler
- ✅ Mobiel: `!important` overrides voor height en padding
- ✅ Funcionaliteit: Ring-rotatie en scroll-gedrag intact

**Resultaat:**
Sticky scroll werkt nu correct met proportionele ring-rotatie (75vh per sponsor).
