# Deployment naar Render.com

## Stappen voor deployment

1. **Ga naar [Render.com](https://render.com) en log in**

2. **Maak een nieuwe Web Service:**
   - Klik op "New +" → "Web Service"
   - Kies "Build and deploy from a Git repository"
   - Selecteer je GitHub repository: `DionSlegt/websiteVDO`

3. **Configureer de service:**
   - **Name:** `vdo-website` (of een andere naam naar keuze)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Kies een gratis plan of betaald plan

4. **Environment Variables (optioneel):**
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render stelt dit automatisch in, maar je kunt het expliciet zetten)

5. **Klik op "Create Web Service"**

6. **Render zal automatisch:**
   - De code van GitHub ophalen
   - `npm install` uitvoeren
   - `npm start` uitvoeren
   - Je website live zetten op een URL zoals `vdo-website.onrender.com`

## Belangrijke notities

- Render.com gebruikt automatisch de `render.yaml` configuratie die in de repository staat
- De website draait op Node.js met Express
- Static files worden geserveerd vanuit de root directory
- De server luistert op de PORT die Render.com instelt (meestal via environment variable)

## Auto-deploy

Render.com zal automatisch opnieuw deployen wanneer je naar de `main` branch pusht op GitHub.

## Troubleshooting

- Als de build faalt, check de logs in Render.com dashboard
- Zorg dat alle dependencies in `package.json` staan
- Check of de PORT environment variable correct is ingesteld
