# 3D Carousel Testplan

## 🧪 Handmatige Tests

### Test 1: Basis Functionaliteit
**Doel**: Verifiëren dat de carousel correct draait bij scrollen

**Stappen**:
1. Open `http://localhost:8080/index.html`
2. Scroll naar de sponsors sectie
3. Continue scrollen naar beneden
4. Observeer de carousel rotatie

**Verwacht Resultaat**:
- ✅ Carousel begint te draaien wanneer in beeld
- ✅ Draait soepel zonder haperingen
- ✅ Maakt volledige 360° rotatie
- ✅ Alle 10 sponsors komen voorbij

---

### Test 2: Sticky Behavior
**Doel**: Verifiëren sticky behavior tot volledige rotatie

**Stappen**:
1. Scroll langzaam naar sponsors sectie
2. Let op wanneer sectie sticky wordt
3. Continue scrollen tot 360° compleet
4. Observeer wat er daarna gebeurt

**Verwacht Resultaat**:
- ✅ Carousel blijft in view tijdens scrollen
- ✅ Bij 360° rotatie blijft sticky
- ✅ Sectie blijft op laatste positie staan

---

### Test 3: Zichtbaarheid & Opacity
**Doel**: Verifiëren dat meerdere sponsors tegelijk zichtbaar zijn

**Stappen**:
1. Navigeer naar carousel
2. Tel hoeveel sponsors tegelijk zichtbaar zijn
3. Observeer fade-in/fade-out effect

**Verwacht Resultaat**:
- ✅ 3-4 sponsors tegelijk zichtbaar
- ✅ Soepele opacity transitions
- ✅ Voorste card het meest prominent
- ✅ Zijdelingse cards faden geleidelijk uit

---

### Test 4: Active State
**Doel**: Verifiëren active state op voorste card

**Stappen**:
1. Observeer de carousel tijdens rotatie
2. Let op de voorste (center) card
3. Check visuele verschillen

**Verwacht Resultaat**:
- ✅ Voorste card heeft blauwe border (2px)
- ✅ Subtiele glow effect rondom active card
- ✅ Brightness 1.05 op active card image
- ✅ Smooth transition tussen active states

---

### Test 5: Navbar Update
**Doel**: Verifiëren dat Sponsors link verwijderd is

**Stappen**:
1. Bekijk de navbar
2. Tel aantal menu items
3. Check dat sponsors niet in menu staat

**Verwacht Resultaat**:
- ✅ Geen "Sponsors" link in navbar
- ✅ Alleen: Home, Over Ons, Bestuur, Teams
- ✅ Carousel zichtbaar op homepage

---

### Test 6: Responsive - Tablet
**Doel**: Verifiëren werking op tablet schermen

**Stappen**:
1. Resize browser naar ~768px breedte
2. Observeer carousel
3. Test scroll functionaliteit

**Verwacht Resultaat**:
- ✅ Carousel past zich aan aan scherm
- ✅ Cards zijn 300x340px
- ✅ Perspective 1800px
- ✅ Rotatie blijft soepel

---

### Test 7: Responsive - Mobiel
**Doel**: Verifiëren werking op mobiele schermen

**Stappen**:
1. Resize browser naar ~400px breedte
2. Observeer carousel
3. Test scroll functionaliteit

**Verwacht Resultaat**:
- ✅ Carousel past zich aan aan scherm
- ✅ Cards zijn 260x300px
- ✅ Perspective 1400px
- ✅ Rotatie blijft soepel

---

### Test 8: Cross-Browser Compatibiliteit
**Doel**: Verifiëren werking in verschillende browsers

**Browsers om te testen**:
- [ ] Chrome (v100+)
- [ ] Safari (v15+)
- [ ] Firefox (v100+)
- [ ] Edge (v100+)
- [ ] iOS Safari
- [ ] Chrome Mobile

**Verwacht Resultaat**:
- ✅ 3D transforms werken in alle browsers
- ✅ Backdrop-filter (glasmorphism) werkt waar supported
- ✅ Fallback voor oude browsers zonder 3D support
- ✅ Smooth animations op alle platforms

---

### Test 9: Performance
**Doel**: Verifiëren 60fps performance

**Stappen**:
1. Open DevTools → Performance tab
2. Start recording
3. Scroll door carousel sectie
4. Stop recording en analyseer

**Verwacht Resultaat**:
- ✅ Consistent 60fps tijdens scrollen
- ✅ Geen frame drops
- ✅ GPU compositie actief
- ✅ Geen memory leaks

---

### Test 10: JavaScript Console
**Doel**: Verifiëren geen errors in console

**Stappen**:
1. Open DevTools → Console
2. Reload pagina
3. Scroll door hele pagina
4. Check voor errors/warnings

**Verwacht Resultaat**:
- ✅ Geen JavaScript errors
- ✅ `sponsors-carousel.js` laadt correct
- ✅ Carousel initialiseert zonder problemen
- ✅ Geen missing resources (images, etc.)

---

## 🔍 Visuele Checklist

### Glasmorphism Effect
- [ ] Kaarten hebben frosted glass effect
- [ ] Backdrop blur is zichtbaar
- [ ] Witte border met semi-transparency
- [ ] Subtle inner glow

### 3D Diepte
- [ ] Kaarten lijken daadwerkelijk in ruimte te zweven
- [ ] Perspective geeft gevoel van afstand
- [ ] Rotatie is vloeiend en natuurlijk
- [ ] Geen "flat" 2D gevoel

### Typography & Images
- [ ] Sponsor logo's zijn scherp en leesbaar
- [ ] Images laden correct (geen 404s)
- [ ] Aspect ratio blijft behouden
- [ ] Geen vervorming of pixelation

---

## 🐛 Mogelijke Issues & Oplossingen

### Issue 1: Carousel draait niet
**Symptoom**: Statische kaarten, geen rotatie bij scroll

**Mogelijke oorzaken**:
- `sponsors-carousel.js` niet geladen
- JavaScript error in console
- `.sponsors-carousel-section` class mist

**Oplossing**:
```javascript
// Check in console:
document.querySelector('.sponsors-carousel-section')
// Moet element returnen, niet null
```

---

### Issue 2: Kaarten niet zichtbaar
**Symptoom**: Lege ruimte waar carousel zou moeten zijn

**Mogelijke oorzaken**:
- Z-index issues
- Opacity = 0 op alle kaarten
- Transform buiten viewport

**Oplossing**:
```css
/* Check in DevTools:
   Element → Computed → transform, opacity
*/
```

---

### Issue 3: Haperige animatie
**Symptoom**: Stuttering of lag tijdens scrollen

**Mogelijke oorzaken**:
- Geen GPU acceleratie
- Te veel DOM reflows
- Heavy images

**Oplossing**:
```css
.carousel-ring {
    will-change: transform;
    transform: translateZ(0); /* Force GPU layer */
}
```

---

### Issue 4: Sticky werkt niet correct
**Symptoom**: Carousel scrollt mee of blijft niet op plek

**Mogelijke oorzaken**:
- Height te klein/groot
- Sticky positioning conflict
- Parent overflow issues

**Oplossing**:
```css
/* Adjust section height: */
.sponsors-carousel-section {
    height: 400vh; /* Tweak this value */
}
```

---

## 📊 Performance Metrics

### Target Metrics
- **FPS**: 60fps steady
- **Frame time**: <16.67ms per frame
- **JS execution**: <10ms per scroll event
- **Memory**: Stable, no growth over time
- **Paint time**: <5ms per frame

### Chrome DevTools Checks
```
1. Performance tab → Record → Scroll carousel
2. Check for:
   - Green bars (GPU raster)
   - No red/orange warnings
   - Smooth FPS graph
   - Low CPU usage
```

---

## ✅ Acceptance Criteria

De implementatie is geslaagd als:

1. ✅ Sponsors link verwijderd uit navbar
2. ✅ 3D carousel zichtbaar op homepage
3. ✅ Volledige 360° rotatie tijdens scrollen
4. ✅ Sticky blijft tot rotatie compleet
5. ✅ 3-4 sponsors tegelijk zichtbaar
6. ✅ Soepele opacity transitions
7. ✅ Active state op voorste card
8. ✅ Responsive op alle schermgroottes
9. ✅ 60fps performance
10. ✅ Cross-browser compatible

---

## 🚀 Live Test URLs

- **Homepage**: http://localhost:8080/index.html
- **Originele Sponsors**: http://localhost:8080/sponsors.html (voor vergelijking)

---

## 📝 Test Rapport Template

```markdown
## Test Sessie - [Datum]

**Tester**: [Naam]
**Browser**: [Chrome/Safari/Firefox] v[versie]
**OS**: [macOS/Windows/Linux]
**Schermgrootte**: [1920x1080 / etc]

### Resultaten
- [ ] Test 1: Basis Functionaliteit - PASS/FAIL
- [ ] Test 2: Sticky Behavior - PASS/FAIL
- [ ] Test 3: Zichtbaarheid - PASS/FAIL
- [ ] Test 4: Active State - PASS/FAIL
- [ ] Test 5: Navbar Update - PASS/FAIL
- [ ] Test 6: Responsive Tablet - PASS/FAIL
- [ ] Test 7: Responsive Mobiel - PASS/FAIL
- [ ] Test 8: Cross-Browser - PASS/FAIL
- [ ] Test 9: Performance - PASS/FAIL
- [ ] Test 10: Console Errors - PASS/FAIL

### Issues Gevonden
1. [Beschrijf issue]
2. [Beschrijf issue]

### Screenshots
[Voeg screenshots toe]

### Opmerkingen
[Eventuele extra opmerkingen]
```
