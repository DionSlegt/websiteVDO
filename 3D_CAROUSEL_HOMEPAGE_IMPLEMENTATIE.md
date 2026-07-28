# 3D Sponsors Carousel - Homepage Implementatie

## Overzicht
De 3D sponsors carousel is succesvol verplaatst van de aparte sponsors pagina naar de homepage en geoptimaliseerd voor een "ronder" en soepeler 3D effect.

## Wijzigingen

### 1. Index.html Aanpassingen
- ✅ **Navbar**: "Sponsors" navigatie-item verwijderd uit de navbar
- ✅ **Carousel Sectie**: Volledige 3D carousel sectie toegevoegd met class `.sponsors-carousel-section`
- ✅ **JavaScript**: `sponsors-carousel.js` toegevoegd aan de script imports

### 2. CSS Optimalisaties (styles.css)

#### Verbeterd 3D Effect
- **Sectie hoogte**: Verhoogd van `300vh` naar `400vh` voor volledige 360° rotatie
- **Perspective**: Verhoogd van `1400px` naar `2200px` voor diepere 3D ervaring
- **Stage hoogte**: Vergroot van `520px` naar `600px`
- **Card dimensies**: Vergroot van `320x360px` naar `340x380px`

#### Soepelere Transitions
- **Opacity transition**: Verbeterd met `cubic-bezier(0.4, 0, 0.2, 1)` voor vloeiender overgangen
- **Gecombineerde transitions**: Opacity, border-color en box-shadow geconsolideerd in één smooth transition

#### Responsive Updates
- **Tablet (768px)**: Perspective `1800px`, cards `300x340px`, stage `500px`
- **Mobile (480px)**: Perspective `1400px`, cards `260x300px`, stage `450px`

### 3. JavaScript Verbeteringen (sponsors-carousel.js)

#### Grotere Cilinder Radius
- **Radius**: Vergroot van `520px` naar `680px` voor ronder effect

#### Volledige 360° Rotatie
- **Totale rotatie**: Exact `360` graden voor complete cyclus
- **Sticky behavior**: Blijft sticky tijdens volledige rotatie, daarna sticky op laatste positie

#### Betere Visibility Berekening
```javascript
// Oude berekening:
const visibility = Math.max(0, 1 - distanceFromFront / 120);

// Nieuwe berekening met power curve:
const visibility = Math.max(0, 1 - Math.pow(distanceFromFront / 140, 1.5));
```
- Meer sponsors tegelijk zichtbaar rondom de cilinder
- Soepelere fade-out naar de zijkanten
- Verbeterde "active" zone van 15° naar 20°

## Technische Details

### 3D Transform Stack
Elk sponsor card krijgt de volgende transform:
```css
transform: 
    translateX(-50%) translateY(-50%)
    rotateY(var(--angle))
    translateZ(var(--radius));
```

### Scroll-Driven Animation
- Sectie hoogte van 400vh zorgt voor voldoende scroll-ruimte
- Sticky positioning houdt de carousel centraal tijdens scrollen
- Progress berekening: `(distance - rect.top) / distance`
- Smooth interpolation met factor 0.1 voor natuurlijke beweging

### Performance
- `will-change: transform` op `.carousel-ring`
- `requestAnimationFrame` voor 60fps animatie
- Throttled opacity updates per card
- `transform-style: preserve-3d` voor hardware acceleratie

## Testen

### Checklist
- [ ] Carousel draait soepel tijdens scrollen
- [ ] Alle 10 sponsors zijn zichtbaar tijdens volledige rotatie
- [ ] Active state wordt correct toegepast op voorste card
- [ ] Sticky behavior werkt correct (blijft sticky na 360°)
- [ ] Responsive design werkt op tablet en mobiel
- [ ] Geen "Sponsors" link meer in navbar
- [ ] Kaarten hebben glasmorphism effect met blur
- [ ] Smooth opacity transitions naar de zijkanten

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Safari (WebKit)
- ✅ Firefox
- ✅ Mobiele browsers (iOS Safari, Chrome Mobile)

## Bestanden Gewijzigd
1. `index.html` - Navbar + carousel sectie + script import
2. `styles.css` - 3D carousel styling optimalisaties
3. `sponsors-carousel.js` - Rotatie en visibility logica

## Volgende Stappen (Optioneel)
- [ ] Voeg een subtiele blur toe aan niet-actieve kaarten voor extra depth
- [ ] Overweeg een indicator te tonen voor scroll progress
- [ ] Test met verschillende aantallen sponsor kaarten
- [ ] Voeg keyboard navigation toe voor accessibility
- [ ] Overweeg prefers-reduced-motion support

## Live Preview
Open `http://localhost:8080/index.html` in de browser om de carousel te testen.
