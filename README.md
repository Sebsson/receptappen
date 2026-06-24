# Receptappen

En liten, mobilanpassad receptapp byggd som **PWA** med vanlig HTML, JavaScript och [Tailwind CSS](https://tailwindcss.com/) (via CDN). Ingen byggprocess – allt körs direkt i webbläsaren.

## Funktioner

- **Receptöversikt** – kortrutnät (2 kolumner på mobil, 3 på desktop) med titel, tid, svårighetsgrad och taggar.
- **Sök & filter** – realtidssökning på titel, taggar och ingredienser. Filtren (snabbfilter som Favoriter/I veckoplanen/Under 30 min/svårighetsgrad samt kategorier) samlas i en filter-popup som öppnas via filterknappen, med en räknare för aktiva filter och borttagbara filter-pillrar i headern. Dessutom en slumpknapp.
- **Receptvy** – detaljvy som modal (desktop) eller bottensheet (mobil), med portionsjustering som skalar om ingredienserna, ingredienser grupperade per kategori och numrerade steg. Hash-baserad routing (`#recept/<id>`) med stöd för bakåt/framåt.
- **Veckoplan** – lägg till recept, justera portioner och ta bort, och öppna ett recept direkt genom att trycka på dess kort.
- **Inköpslista** – aggregerar och slår ihop ingredienser från veckoplanen (per kategori, summerar lika enheter), bockbara rader, kopiera till urklipp.
- **Favoriter, veckoplan och inköpslista sparas** i `localStorage`.
- **Offline** – service worker cachar appskalet och fungerar utan nätverk efter första laddningen.

## Köra lokalt

Appen är en PWA och måste serveras över HTTP (service workern och hämtning av `recipes.json` fungerar inte via `file://`). Starta en enkel webbserver i projektmappen:

```bash
python -m http.server 4173
```

Öppna sedan **http://localhost:4173** i webbläsaren.

> Testa offline-läget: DevTools → Network → kryssa i **Offline** → ladda om sidan.

## Projektstruktur

| Fil | Beskrivning |
| --- | --- |
| `index.html` | Hela appen – uppmärkning, stil och logik. |
| `recipes.json` | Receptdata (enda datakällan). |
| `manifest.json` | PWA-manifest. |
| `sw.js` | Service worker (cache-first). |
| `icon.svg` | Appikon. |

## Receptschema

Varje recept i `recipes.json` följer:

```json
{
  "id": "unik-slug",
  "title": "Receptnamn",
  "description": "Beskrivning i en mening",
  "image": "",
  "tags": ["vegetariskt", "snabbt"],
  "cuisine": "italienskt",
  "difficulty": "lätt",
  "time_minutes": 30,
  "servings": 4,
  "ingredients": [
    { "amount": 200, "unit": "g", "name": "pasta", "category": "torrvaror" }
  ],
  "steps": ["Koka pastan ...", "..."]
}
```

Tillåtna ingredienskategorier: `grönsaker`, `mejeri`, `kött & fisk`, `torrvaror`, `kryddor`, `övrigt`.
