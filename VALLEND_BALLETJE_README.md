# Vallend Pingpongballetje - Implementatie

## Overzicht
Een scroll-gedreven vallend pingpongballetje met realistische rolling texture is geïmplementeerd op de homepage.

## Implementatie Details

### Geïmplementeerde Bestanden

1. **HTML** (`index.html`)
   - Toegevoegd: Falling ball section tussen `</main>` en de Openingstijden sectie
   - Bevat: `.falling-ball-section`, `.falling-ball-container`, `.falling-ball`, en `.ball-inner` elementen

2. **CSS** (`styles.css`)
   - Nieuwe sectie: "Vallend Pingpongballetje Section"
   - Sticky container met 200vh hoogte voor voldoende scroll-ruimte
   - Witte pingpongbal met karakteristieke naad-patroon (diagonale lijnen)
   - Glans-effect voor 3D look
   - Responsive design (50px op mobiel, 60px op desktop)
   - Respecteert `prefers-reduced-motion`

3. **JavaScript** (`falling-ball.js`)
   - GSAP ScrollTrigger implementatie
   - Koppelt Y-positie aan scroll progress
   - 720° rotatie (2 volledige rotaties) tijdens de val voor rollend effect
   - Subtiele horizontale wobble voor natuurlijke beweging
   - Fade in/out aan begin en einde van sectie
   - Responsive resize handling

### Technische Specificaties

#### Scroll-driven Animatie
- **Trigger**: `.falling-ball-section` (200vh hoog)
- **Start**: `top top`
- **End**: `bottom bottom`
- **Scrub**: 0.5 (smooth scrubbing voor natuurlijke beweging)

#### Balletje Eigenschappen
- **Grootte**: 60px × 60px (desktop), 50px × 50px (mobiel)
- **Kleur**: Wit (#fff)
- **Texture**: Twee diagonale naadlijnen die roteren tijdens val
- **Rotatie**: 720° totaal (simuleert rollende beweging)
- **Val-afstand**: viewport hoogte + 100px
- **Horizontale beweging**: ±20px wobble (sine.inOut easing)

#### Accessibility
- Respecteert `prefers-reduced-motion` preference
- Bij reduced motion: statisch balletje op 50% viewport hoogte
- Geen animatie als preference is ingesteld

## Gebruik

Het balletje is automatisch zichtbaar wanneer gebruikers:
1. Naar beneden scrollen na de main hero sectie
2. De falling-ball section betreden
3. Door de sectie scrollen (balletje valt synchroon met scroll)

## Visueel Effect

- **Bij scrollen naar beneden**: Balletje valt van boven viewport naar beneden
- **Texture rotatie**: Diagonale naadlijnen roteren mee, waardoor rollende beweging zichtbaar is
- **Wobble effect**: Subtiele links-rechts beweging maakt val natuurlijker
- **Fade effecten**: Soepel in- en uitfaden bij betreden/verlaten van sectie

## Positie op Pagina

Geplaatst tussen:
- **Boven**: Main content section (`</main>`)
- **Onder**: Openingstijden section

Deze positie zorgt voor een natuurlijke overgang tussen de hero/lid-worden content en de rest van de pagina.

## Browser Compatibiliteit

- Vereist GSAP 3.12.5+
- Vereist GSAP ScrollTrigger plugin
- Moderne browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation voor oudere browsers (balletje niet zichtbaar)

## Customization Opties

### Bal-grootte aanpassen
```css
.falling-ball {
    width: 80px;  /* verander naar gewenste grootte */
    height: 80px;
}
```

### Rotatie-snelheid aanpassen
```javascript
fallingTimeline.to(ballInner, {
    rotation: 1080, // verander naar 1080° voor 3 rotaties
    ease: 'none'
}, 0);
```

### Sectie hoogte aanpassen
```css
.falling-ball-section {
    min-height: 300vh; /* meer ruimte = langere val */
}
```

### Wobble intensiteit aanpassen
```javascript
fallingTimeline.to(ball, {
    x: '+=40', // verander van 20 naar 40 voor meer wobble
    ease: 'sine.inOut',
    repeat: 1,
    yoyo: true
}, 0);
```

## Performance

- `will-change: transform` voor smooth animatie
- `scrub: 0.5` voor balanced performance/smoothness
- Pointer-events: none voor geen interference met klikbare elementen
- Resize debouncing (250ms) voor efficient refresh

## Toekomstige Verbeteringen

Mogelijke uitbreidingen:
- Meerdere balletjes met verschillende kleuren
- Impact-effect bij "landing"
- Sound effect bij bepaalde scroll-punten (optioneel)
- Trail/motion blur effect
- Verschillende bal-groottes (size variation)

---

**Laatste update**: Juli 2026
**Versie**: 1.0
**Status**: ✅ Volledig geïmplementeerd
