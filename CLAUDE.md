# CLAUDE.md

Vägledning för Claude Code (claude.ai/code) när du arbetar i den här repon.

## Översikt

Receptappen är en liten, mobilanpassad **PWA** byggd med vanlig HTML, JavaScript
och [Tailwind CSS](https://tailwindcss.com/) via CDN. Ingen byggprocess – allt
körs direkt i webbläsaren.

- `index.html` – hela appen (uppmärkning, stil och logik i en fil).
- `recipes.json` – receptdata, enda datakällan (se schemat i `README.md`).
- `manifest.json`, `sw.js`, `icon.svg` – PWA-manifest, service worker, ikon.

### Köra / testa lokalt

Appen måste serveras över HTTP (service worker + `fetch` av `recipes.json`
fungerar inte via `file://`):

```bash
python -m http.server 4173
```

Öppna sedan http://localhost:4173.

## Beständiga regler för utveckling

Dessa regler gäller alltid och ska bevaras i framtida ändringar:

1. **Mängd per steg.** I receptets steg ("Gör så här") ska det för varje steg
   framgå hur mycket av varje ingrediens som ska användas. Mängderna **måste**
   anpassas efter valt antal portioner – exakt som ingredienslistan – så att de
   skalas om när användaren ändrar portionsantalet. I koden sker detta genom att
   varje steg matchas mot receptets ingredienser (`stepIngredients`) och de
   ingredienser som nämns visas som små mängd-taggar under steget
   (`stepIngredientChip`). Taggarna återanvänder `[data-base]`-haken så att
   `updateServings` skalar om dem tillsammans med ingredienslistan. När steg- eller
   skalningslogiken ändras ska den här funktionen behållas och fungera.

## Konventioner

- Håll allt i en fil (`index.html`) – ingen byggkedja, inga externa beroenden
  utöver Tailwind-CDN.
- Följ den befintliga stilen: små rena hjälpfunktioner, `appState` som enda
  källa till sanning, `render()` som ritar om aktuell vy, och `persist()` /
  `loadState()` mot `localStorage` (nycklar under `receptappen:`).
- Skriv UI-text på svenska.
- All receptdata bor i `recipes.json`; ändra inte schemat utan att uppdatera
  både `README.md` och koden som läser fältet.
