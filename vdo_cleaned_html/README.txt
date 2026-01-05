VDO site cleanup (HTML)

Wat is aangepast:
- Header/navbar en footer zijn overal gelijkgetrokken (minder dubbele/rommelige code).
- Inline styles voor logo-link en dividers zijn verwijderd.
- De horizontale 'lijn' divs zijn vervangen door: <hr class="section-divider">

Wat je nog in styles.css moet toevoegen (of checken):
.logo-link { text-decoration: none; color: inherit; }
.section-divider { width: 100%; max-width: 1200px; margin: 0 auto; border: 0; height: 1px; background: rgba(255,255,255,0.1); }

Voor de grote 'ruimte' bovenin de homepage:
- Zoek in styles.css naar .hero / .hero-content en verlaag min-height / padding-top.
  Bijvoorbeeld:
  .hero { min-height: calc(100vh - 72px); padding-top: 72px; display:flex; align-items:center; }
  .hero-content { margin-top: 0; padding-top: 0; }
