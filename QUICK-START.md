# 🚀 Snelle Start: GitHub + Netlify Setup

## Wat krijg je precies als foutmelding?

Als je een specifieke foutmelding ziet, laat het weten! Maar hier is de complete setup:

## ⚡ Snelle Stappen (5 minuten)

### 1️⃣ Maak GitHub Repository
1. Ga naar https://github.com/new
2. Repository naam: `vdo-website` (of wat je wilt)
3. Kies **Public**
4. **NIET** vink "Add README" aan
5. Klik **Create repository**

### 2️⃣ Upload Website (Kies één optie)

**Optie A: GitHub Desktop (Aanbevolen - Makkelijkst)**
1. Download: https://desktop.github.com/
2. Installeer en log in
3. File → Add Local Repository
4. Selecteer: `/Users/gebruiker23/Desktop/WEBSITE`
5. Klik "Publish repository"
6. Klaar! ✅

**Optie B: Terminal Commando's**
```bash
cd /Users/gebruiker23/Desktop/WEBSITE
git init
git add .
git commit -m "Eerste versie VDO website"
git branch -M main
git remote add origin https://github.com/JOUW-USERNAME/vdo-website.git
git push -u origin main
```
*(Vervang JOUW-USERNAME met je GitHub username)*

### 3️⃣ Netlify Deploy
1. Ga naar https://app.netlify.com
2. Log in met **GitHub**
3. Klik **Add new site** → **Import an existing project**
4. Kies je `vdo-website` repository
5. **Build command**: Laat leeg
6. **Publish directory**: Laat leeg (of `.`)
7. Klik **Deploy**

### 4️⃣ Activeer CMS
1. In Netlify dashboard → **Identity**
2. Klik **Enable Identity**
3. Scroll naar **Git Gateway** → Klik **Enable Git Gateway**
4. Wacht 30 seconden

### 5️⃣ Test CMS
1. Ga naar: `https://jouw-site.netlify.app/admin/`
2. Klik **Sign up** of **Log in**
3. Autoriseer met GitHub
4. Klaar! 🎉

## ❓ Veelvoorkomende Problemen

**"Git Gateway not enabled"**
→ Ga naar Netlify → Identity → Git Gateway → Enable

**"Failed to load config"**
→ Controleer of `admin/config.yml` bestaat in GitHub

**"Authentication failed"**
→ Log uit en log opnieuw in op GitHub

**"Repository not found"**
→ Controleer of je repository **Public** is (of dat Netlify toegang heeft)

## 💡 Tip

Wil je dat ik de Git repository voor je initialiseer? Laat het weten en ik help je verder!

