# Openingstijden 3D Carrousel Implementatie

## Overzicht
De openingstijdensectie is aangepast van een statische grid naar een scroll-gestuurde 3D carrousel met smooth animaties.

## Wijzigingen

### 1. HTML (index.html)
- **Outer wrapper toegevoegd**: `.openingstijden-section-outer` met `min-height: 250vh` voor scroll space
- **Sticky container**: `.openingstijden-section-sticky` blijft in beeld tijdens scrollen
- **Pingpongbal element verwijderd**
- Bestaande dynamische kaart generatie behouden

### 2. CSS (styles.css)

#### Desktop (>768px)
- **3D Perspective**: `perspective: 1200px` op container
- **Absolute positioning**: Kaarten zijn `position: absolute` met vaste dimensies (320x360px)
- **Active state**: Middelste kaart krijgt blauwe rand en verhoogde z-index
- **3D Transforms**: 
  - `rotateY()` voor rotatie
  - `translateX()` voor horizontale spacing
  - `translateZ()` voor diepte
  - `scale()` voor grootte variatie
- **Visibility**: Max 5 kaarten zichtbaar tegelijk
- **Smooth transitions**: Via `transition` en `will-change`

#### Mobiel (<768px)
- **Horizontale scroll**: `display: flex` met `overflow-x: auto`
- **Scroll snap**: `scroll-snap-type: x mandatory` voor smooth snapping
- **Vaste breedte**: 280px per kaart
- **Geen 3D transforms**: Kaarten blijven relatief gepositioneerd

#### Reduced Motion
- **3D uitgeschakeld**: Grid layout als fallback
- **Geen animaties**: Alle transforms uitgeschakeld

### 3. JavaScript (script.js)

#### Constants
```javascript
const ROTATION_PER_CARD = 40;   // graden rotatie per kaart
const CARD_SPACING = 400;        // pixels tussen kaarten
const TOTAL_CARDS = 7;           // aantal dagen
```

#### Carrousel State
```javascript
let scrollProgress = 0;          // Huidige scroll positie (0-1)
let targetProgress = 0;          // Doel scroll positie (0-1)
let animationFrame = null;       // RequestAnimationFrame ID
```

#### Kern Functionaliteit
1. **Scroll Tracking**: Berekent scroll progress binnen sectie (0 tot 1)
2. **Smooth Interpolatie**: Lerp tussen huidige en doel progress voor vloeiende beweging
3. **Card Transforms**: Berekent en past 3D transforms toe per kaart
4. **Active Detection**: Markeert middelste kaart als actief (offset < 0.3)
5. **Visibility Control**: Toont alleen kaarten binnen 2.5 offset

#### Performance
- **RequestAnimationFrame**: Voor 60fps animaties
- **Passive scroll listeners**: Verbeterde scroll performance
- **Will-change hints**: GPU acceleratie
- **Cleanup**: AnimationFrame wordt opgeruimd bij page unload

## Behouden Functionaliteit
✅ `openingHours` data object ongewijzigd
✅ `generateHeaderText()` functie werkt nog steeds
✅ Huidige dag detectie (zonder pingpongbal)
✅ Dynamische kaart generatie

## Browser Compatibiliteit
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Reduced motion support
- ✅ Fallback voor oudere browsers (geen 3D)

## Test Checklist
- [ ] Scroll is smooth en volgt één-op-één
- [ ] Middelste kaart heeft blauwe rand
- [ ] Max 5 kaarten zichtbaar tegelijk
- [ ] Geen andere delen van website aangepast
- [ ] Mobiel werkt met horizontale scroll
- [ ] Reduced motion respecteert gebruikersvoorkeur
- [ ] Performance is goed (60fps)

## Debug Tips
1. **Kaarten niet zichtbaar**: Check of `min-height: 250vh` op outer wrapper staat
2. **Geen 3D effect**: Controleer `perspective: 1200px` op container
3. **Scroll werkt niet**: Verifieer dat section hoogte correct wordt berekend
4. **Performance issues**: Reduceer `CARD_SPACING` of aantal zichtbare kaarten
5. **Mobiel broken**: Check media query breakpoint op 768px

## Aanpassingen Maken
- **Scroll lengte**: Wijzig `min-height: 250vh` in `.openingstijden-section-outer`
- **Kaart afstand**: Pas `CARD_SPACING` constant aan in JavaScript
- **Rotatie snelheid**: Wijzig `ROTATION_PER_CARD` constant
- **Smoothness**: Pas lerp factor `0.1` aan in `updateCarrousel()`
- **Zichtbare kaarten**: Wijzig `2.5` in visibility check

## Bestanden Gewijzigd
1. `index.html` - Sectie structuur
2. `styles.css` - 3D carrousel styling
3. `script.js` - Scroll-driven animatie logica
