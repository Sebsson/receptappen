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

2. **Alla ingredienser ska listas i instruktionerna.** Varje ingrediens i ett
   recept ska dyka upp som en mängd-tagg i minst ett steg. Det gäller även när
   ett steg säger "alla kryddor", "resten av osten" e.dyl. – skriv hellre ut
   ingredienserna för mycket än för lite. Matchningen (`stepIngredients`) fångar
   böjda och sammansatta ord (t.ex. "grädden" → `vispgrädde`, "löken" → `rödlök`,
   "peppar" → `svartpeppar`) via `ING_HEADS`/`ING_BASES`. Om ett steg ändå inte
   nämner en ingrediens den använder: skriv om steget så att den nämns, eller pinna
   den med en `amounts`-post (se regel 3) så att taggen ändå visas.

3. **Delade mängder ska speglas per steg.** När en ingrediens delas mellan flera
   steg ska varje steg bara visa sin del, och delarna ska summera till
   ingrediensens totala mängd (t.ex. 100 g parmesan = 50 g till basen + 50 g till
   såsen, inte 100 g i båda stegen). Detta uttrycks genom att steget skrivs som ett
   objekt `{ "text": "...", "amounts": { "<ingrediensnamn>": <mängd> } }` där
   mängden anges per **basantal portioner** (`servings`). Ingredienslistans `amount`
   ska fortfarande vara den totala mängden som hela receptet kräver.

4. **Recepten ska vara rimliga.** Kvalitetssäkra steg, tider och mängder så att de
   stämmer med verkligheten (t.ex. blötläggs rispapper bara några sekunder, inte
   1–2 minuter). Justera orimliga tider, temperaturer och proportioner när du
   skapar eller ändrar recept.

## Konventioner

- Håll allt i en fil (`index.html`) – ingen byggkedja, inga externa beroenden
  utöver Tailwind-CDN.
- Följ den befintliga stilen: små rena hjälpfunktioner, `appState` som enda
  källa till sanning, `render()` som ritar om aktuell vy, och `persist()` /
  `loadState()` mot `localStorage` (nycklar under `receptappen:`).
- Skriv UI-text på svenska.
- All receptdata bor i `recipes.json`; ändra inte schemat utan att uppdatera
  både `README.md` och koden som läser fältet.
