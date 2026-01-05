# GitHub + Netlify Setup voor Decap CMS

## Stap 1: Maak een GitHub Repository

1. Ga naar [GitHub.com](https://github.com) en log in
2. Klik op het **+** icoon rechtsboven → **New repository**
3. Geef je repository een naam (bijv. `vdo-website`)
4. Kies **Public** (of Private als je wilt)
5. **NIET** vink "Initialize with README" aan
6. Klik op **Create repository**

## Stap 2: Upload je website naar GitHub

### Optie A: Via GitHub Desktop (Eenvoudigst)
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Installeer en log in met je GitHub account
3. Klik op **File** → **Add Local Repository**
4. Selecteer de `/Users/gebruiker23/Desktop/WEBSITE` folder
5. Klik op **Publish repository**
6. Kies je repository naam en klik **Publish**

### Optie B: Via Terminal (Geavanceerd)
Open Terminal en voer uit:

```bash
cd /Users/gebruiker23/Desktop/WEBSITE
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/JOUW-GITHUB-USERNAME/vdo-website.git
git push -u origin main
```

(Vervang `JOUW-GITHUB-USERNAME` en `vdo-website` met jouw gegevens)

## Stap 3: Deploy naar Netlify

1. Ga naar [Netlify.com](https://www.netlify.com)
2. Klik op **Sign up** en log in met je **GitHub account**
3. Klik op **Add new site** → **Import an existing project**
4. Kies **GitHub** en autoriseer Netlify
5. Selecteer je `vdo-website` repository
6. Bij **Build settings**:
   - **Build command**: Laat leeg
   - **Publish directory**: `.` (of `./` of gewoon leeg)
7. Klik op **Deploy site**

## Stap 4: Activeer Netlify Identity

1. In Netlify, ga naar je site dashboard
2. Klik op **Identity** in het menu
3. Klik op **Enable Identity**
4. Scroll naar beneden naar **Registration preferences**
5. Zet **Registration** op **Invite only** (of **Open** als je wilt)
6. Scroll verder naar **External providers**
7. Klik op **Enable Git Gateway**
8. Volg de instructies om Git Gateway te activeren

## Stap 5: Configureer Decap CMS

1. Ga naar je site op Netlify (bijv. `https://jouw-site.netlify.app`)
2. Ga naar `/admin/`
3. Je ziet nu een login scherm
4. Klik op **Sign up** of **Log in**
5. Je wordt doorgestuurd naar GitHub voor authenticatie
6. Na login kun je content bewerken!

## Stap 6: (Optioneel) Custom Domain

1. In Netlify dashboard, ga naar **Domain settings**
2. Klik op **Add custom domain**
3. Volg de instructies om je eigen domein toe te voegen

## Troubleshooting

### "Git Gateway is not enabled"
- Ga naar Netlify → Identity → Git Gateway
- Klik op **Enable Git Gateway**
- Wacht even en probeer opnieuw

### "Failed to load config.yml"
- Controleer of `admin/config.yml` in je repository staat
- Controleer of de YAML syntax correct is

### "Authentication failed"
- Zorg dat je ingelogd bent op GitHub
- Controleer dat Netlify Identity is geactiveerd
- Probeer uit te loggen en opnieuw in te loggen

## Belangrijk

- Elke keer dat je content bewerkt in het CMS, wordt er automatisch een commit gemaakt naar GitHub
- Je website wordt automatisch opnieuw gedeployed bij elke wijziging
- Je kunt altijd terug naar de code via GitHub

## Hulp Nodig?

- [Netlify Documentatie](https://docs.netlify.com/)
- [Decap CMS Documentatie](https://decapcms.org/docs/)
- [GitHub Documentatie](https://docs.github.com/)

