# Decap CMS Setup Instructies

## Wat is Decap CMS?

Decap CMS (voorheen Netlify CMS) is een content management systeem dat werkt met statische websites. Je kunt content beheren via een gebruiksvriendelijke interface zonder code te hoeven schrijven.

## Toegang tot het CMS

### Voor Productie (met GitHub/Netlify):
1. Zet je website op GitHub
2. Deploy naar Netlify (of vergelijkbare service)
3. Ga naar: `https://jouw-domein.nl/admin/`
4. Log in met je GitHub account via Netlify Identity

### Voor Lokale Ontwikkeling:
**Let op**: Decap CMS werkt volledig alleen met een Git repository backend (GitHub/GitLab). Voor lokale testen kun je:
1. Direct de JSON bestanden in `_data/` bewerken
2. Of gebruik een lokale Git repository en test met `git-gateway` backend
3. De website laadt automatisch de content uit de JSON bestanden

**Tip**: Je kunt de content direct bewerken in de JSON bestanden in de `_data/` folder!

## Content Beheren

### Home Pagina
- **Hero Titel**: De grote titel op de homepage
- **Over VDO Tekst**: De tekst in de "Over VDO" sectie
- **Inschrijven Tekst**: De tekst bij de inschrijfsectie

### Over Ons Pagina
- **Titel**: De titel van de pagina
- **Inhoud**: De hoofdinhoud van de pagina (ondersteunt Markdown)

### De Meppers Pagina
- **Titel**: De titel van de pagina
- **Inhoud**: De hoofdinhoud van de pagina (ondersteunt Markdown)

### Contact Informatie
- **Email**: Het email adres (wordt automatisch bijgewerkt in de footer)
- **Telefoon**: Het telefoonnummer (wordt automatisch bijgewerkt in de footer)
- **Adres**: Straat, wijk en plaats

### Bestuursleden
- Voeg nieuwe bestuursleden toe
- Bewerk bestaande bestuursleden
- Upload foto's
- Stel volgorde in

## Bestandsstructuur

```
WEBSITE/
├── admin/
│   ├── index.html          # CMS admin interface
│   └── config.yml           # CMS configuratie
├── _data/
│   ├── home.json           # Home pagina content
│   ├── over.json           # Over Ons content
│   ├── meppers.json        # De Meppers content
│   ├── contact.json        # Contact informatie
│   └── bestuur/            # Bestuursleden (individuele bestanden)
└── cms-loader.js          # Script dat content laadt
```

## Lokale Ontwikkeling

Voor lokale ontwikkeling zonder GitHub authenticatie, kun je de `git-gateway` backend tijdelijk uitschakelen in `admin/config.yml`:

```yaml
backend:
  name: file-system
  # name: git-gateway  # Comment deze regel uit
```

## Publiceren

1. Bewerk content in het CMS
2. Klik op "Save" of "Publish"
3. De wijzigingen worden opgeslagen in de JSON/Markdown bestanden
4. De website laadt automatisch de nieuwe content

## Markdown Ondersteuning

Je kunt Markdown gebruiken in tekstvelden:
- **Bold**: `**vet**`
- *Italic*: `*cursief*`
- Links: `[tekst](url)`
- Lijsten: `- item 1`
- Paragrafen: scheid met een lege regel

## Troubleshooting

### CMS laadt niet
- Controleer of `admin/index.html` bestaat
- Controleer of `admin/config.yml` correct is geconfigureerd
- Open de browser console voor foutmeldingen

### Content wordt niet bijgewerkt
- Controleer of `cms-loader.js` is toegevoegd aan alle HTML bestanden
- Controleer of de JSON bestanden in `_data/` bestaan
- Ververs de pagina (Ctrl+F5 of Cmd+Shift+R)

### Authenticatie werkt niet
- Voor productie: gebruik GitHub OAuth of andere authenticatie
- Voor lokaal: gebruik `file-system` backend (zie boven)

## Volgende Stappen

1. **GitHub Repository**: Zet je website op GitHub
2. **Netlify/Vercel**: Deploy je website (gratis hosting)
3. **Git Gateway**: Activeer Git Gateway in Netlify voor authenticatie
4. **Custom Domain**: Voeg je eigen domein toe

## Hulp Nodig?

- [Decap CMS Documentatie](https://decapcms.org/docs/)
- [Netlify CMS Documentatie](https://www.netlifycms.org/docs/intro/)

