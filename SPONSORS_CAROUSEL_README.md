# 3D Sponsors Carrousel Implementatie

## Overzicht
De sponsorsectie is succesvol omgebouwd naar een scroll-gestuurde 3D-carrousel met kaarten rondom een verticale cilinder.

## Wijzigingen

### 1. HTML Structuur (`sponsors.html`)
- **Oud**: Simpel grid met `.sponsors-grid` en `.sponsor-item`
- **Nieuw**: 3D carrousel structuur met:
  - `.sponsors-carousel-section` (300vh hoog voor scroll ruimte)
  - `.sponsors-carousel-sticky` (sticky container)
  - `.sponsors-carousel-stage` (perspective container)
  - `.carousel-ring` (roterende ring met preserve-3d)
  - `.sponsor-card` (individuele sponsor kaarten)

### 2. CSS Styling (`styles.css`)
Nieuwe 3D carrousel styling toegevoegd:

**Hoofdsectie**:
- `position: relative` met `height: 300vh` voor scroll-ruimte
- Sticky container met `display: grid` en `place-items: center`

**Carrousel stage**:
- `perspective: 1400px` voor 3D diepte-effect
- `width: min(100%, 1280px)` voor responsive design
- `height: 520px` voor voldoende ruimte

**Carrousel ring**:
- `transform-style: preserve-3d` voor 3D transformaties
- `will-change: transform` voor betere performance

**Sponsor kaarten**:
- Vaste afmetingen: `320px × 360px` (desktop)
- `backdrop-filter: blur(20px) saturate(150%)` voor frosted glass effect
- `border-radius: 20px` voor zachte hoeken
- Transform: `translateX(-50%) translateY(-50%) rotateY(var(--angle)) translateZ(var(--radius))`
- `.active` state met blauwe rand (`rgba(0, 102, 255, 0.6)`) en extra glow

**Responsive aanpassingen**:
- Tablet: `280px × 320px` kaarten, `perspective: 1200px`
- Mobile: `240px × 280px` kaarten, `perspective: 1000px`

### 3. JavaScript Functionaliteit (`sponsors-carousel.js`)

**Initialisatie**:
- Selecteert alle sponsor kaarten en berekent posities
- `radius = 520` voor cilinder grootte
- Plaatst elke kaart op vaste hoek: `angle = (360 / count) × index`

**Scroll-gedreven rotatie**:
- Berekent scroll progress: `progress = (distance - rect.top) / distance`
- Totale rotatie: `360° - 360° / cards.length` (eerste en laatste kaart centraal)
- Smooth interpolatie: `currentRotation += (targetRotation - currentRotation) × 0.1`

**Visibility management**:
- Berekent afstand van voorkant voor elke kaart
- Opacity fade-out op basis van afstand: `1 - distanceFromFront / 120`
- Active class voor centrale kaart (binnen 15° van voorkant)
- Pointer-events disabled voor niet-centrale kaarten

**Performance**:
- `requestAnimationFrame` voor smooth animaties
- `passive: true` scroll listeners
- Cancel RAF wanneer target bereikt is

## Features
✅ Scroll-gestuurde rotatie zonder autoplay
✅ Eerste kaart centraal bij start, laatste bij einde
✅ Middelste kaart met actieve staat (blauwe rand + glow)
✅ Perspectivisch weggedraaide zijkaarten
✅ Opacity fade voor kaarten verder van center
✅ Sticky tijdens scroll
✅ Responsive design voor alle schermformaten
✅ Behoud van bestaande sponsor logo's
✅ Smooth interpolatie voor natuurlijke beweging
✅ Geen andere secties gewijzigd

## Kleuren gebruikt
- Actieve rand: `rgba(0, 102, 255, 0.6)` (--primary-color met alpha)
- Glow effect: `rgba(0, 102, 255, 0.3)`
- Kaart achtergrond: `rgba(255, 255, 255, 0.5)` met backdrop blur
- Shadow: `rgba(0, 36, 61, 0.12)` en `rgba(0, 36, 61, 0.18)` voor active

## Testen
1. Open `http://localhost:8080/sponsors.html` (met lokale server)
2. Scroll door de sponsors sectie
3. Controleer of:
   - Eerste kaart centraal start
   - Laatste kaart centraal eindigt
   - Carrousel smooth roteert tijdens scroll
   - Centrale kaart blauwe rand krijgt
   - Zijkaarten perspectivisch wegdraaien
   - Opacity smooth fade-out heeft

## Bestanden gewijzigd
1. `/sponsors.html` - HTML structuur aangepast
2. `/styles.css` - Nieuwe 3D carrousel CSS toegevoegd (met specifieke selectors)
3. `/sponsors-carousel.js` - Nieuwe JavaScript logica (aangemaakt)

## Belangrijke opmerking
De nieuwe carrousel op `sponsors.html` gebruikt specifieke CSS selectors (`.sponsors-carousel-section .sponsor-card`) om conflicten te voorkomen met de bestaande carrousel op `index.html` (die `.sponsors-section-outer` gebruikt). Beide implementaties kunnen nu naast elkaar bestaan zonder interferentie.
