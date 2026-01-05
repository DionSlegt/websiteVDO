# 🚀 Backend Server Instructies

## Snelle Start

1. **Installeer dependencies** (alleen de eerste keer):
```bash
npm install
```

2. **Start de server**:
```bash
npm start
```

3. **Open de editor**:
- Ga naar: http://localhost:3000/admin-simple.html
- Of: http://localhost:3000/index.html (voor de website)

## Wat doet de server?

De backend server:
- ✅ Laadt content uit JSON bestanden
- ✅ Slaat wijzigingen op in JSON bestanden
- ✅ Serveert je website statisch
- ✅ Biedt een REST API voor content beheer

## API Endpoints

- `GET /api/content/home` - Haal home content op
- `POST /api/content/home` - Sla home content op
- `GET /api/content/contact` - Haal contact info op
- `POST /api/content/contact` - Sla contact info op
- `GET /api/content/over` - Haal over content op
- `POST /api/content/over` - Sla over content op
- `GET /api/content/meppers` - Haal meppers content op
- `POST /api/content/meppers` - Sla meppers content op
- `GET /api/health` - Check of server draait

## Gebruik

1. Start de server met `npm start`
2. Open http://localhost:3000/admin-simple.html
3. Bewerk content en klik op "Opslaan"
4. Wijzigingen worden automatisch opgeslagen in `_data/*.json`
5. Ververs de website pagina om wijzigingen te zien

## Stoppen

Druk op `Ctrl+C` in de terminal waar de server draait.

## Troubleshooting

**"Port 3000 already in use"**
→ Stop andere processen op poort 3000, of verander de poort in `server.js`

**"Cannot find module 'express'"**
→ Run `npm install` opnieuw

**"Failed to save"**
→ Controleer of de `_data/` folder bestaat en schrijfrechten heeft

## Productie

Voor productie gebruik je beter:
- GitHub + Netlify (gratis hosting)
- Decap CMS (volledig CMS systeem)
- Of een andere hosting provider

Deze server is vooral voor lokale ontwikkeling!

