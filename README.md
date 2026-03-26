# Labyrinth Explorer 🧩

Labyrinth Explorer is een uitdagend, multi-level doolhofspel gebouwd met moderne webtechnologieën. Verken procedureel gegenereerde doolhoven, verzamel munten, ontwijk vallen en ontgrendel nieuwe thema's terwijl je dieper in de sectoren afdaalt.

## 🚀 Wat is Labyrinth Explorer?

In dit spel navigeer je door complexe labyrinten die bij elk level groter en moeilijker worden. 
- **Procedurele Doolhoven:** Geen enkel level is hetzelfde.
- **Verschillende Modi:** Speel 'Normal', 'Timed' (tegen de klok) of 'Premium' voor de ultieme uitdaging.
- **Interactieve Elementen:** Gebruik hendels, drukplaten en breekbare muren om je weg te vinden.
- **Gevaren:** Pas op voor stekels en giftig gas die je gezondheid (HP) verminderen.
- **Shop & Thema's:** Gebruik verzamelde munten om nieuwe visuele stijlen zoals 'Ancient Ruins' of 'Enchanted Forest' te kopen.

## 🛠️ Lokaal Starten

Volg deze stappen om het project op je eigen computer te draaien:

1. **Clone de repository:**
   ```bash
   git clone https://github.com/jouw-gebruikersnaam/Labyrinth-explorer.git
   cd Labyrinth-explorer
   ```

2. **Installeer de afhankelijkheden:**
   ```bash
   npm install
   ```

3. **Start de development server:**
   ```bash
   npm run dev
   ```

4. **Open de browser:**
   Ga naar `http://localhost:3000` (of de poort die in je terminal verschijnt).

## 💻 Gebruikte Stack

Dit project is gebouwd met de volgende technologieën:
- **Framework:** [React](https://reactjs.org/) (met TypeScript)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animaties:** [Framer Motion](https://www.framer.com/motion/) (via `motion/react`)
- **Iconen:** [Lucide React](https://lucide.dev/)
- **Deployment:** GitHub Actions & GitHub Pages

## 💾 Hoe Saves Werken

Je voortgang wordt automatisch bijgehouden zodat je later verder kunt spelen:
- **Technologie:** Er wordt gebruik gemaakt van de `localStorage` API van je browser.
- **Opgeslagen data:** Je huidige level, verzamelde munten, ontgrendelde thema's, achievements en leaderboard-scores.
- **Locatie:** De data wordt opgeslagen onder de keys `labyrinth_save` en `labyrinth_leaderboard`.
- *Let op: Als je je browsergeschiedenis/cache wist, kan je voortgang verloren gaan.*

## ⚠️ Bekende Beperkingen

- **Browser-gebonden:** Omdat saves lokaal zijn, kun je niet verder spelen op een ander apparaat.
- **Audio:** De geluidseffecten worden gegenereerd via de Web Audio API (synthese) en zijn functioneel maar simpel.
- **Performance:** Bij extreem hoge levels (zeer grote doolhoven) kan de maze-generatie op oudere apparaten iets langer duren.

## 🗺️ Roadmap

Plannen voor toekomstige updates:
- [ ] **Online Leaderboards:** Vergelijk je tijden met spelers wereldwijd.
- [ ] **Multiplayer Race:** Race in real-time tegen een vriend door hetzelfde doolhof.
- [ ] **Nieuwe Hazards:** Bewegende vijanden en vallende objecten.
- [ ] **Level Editor:** Bouw en deel je eigen doolhoven.
- [ ] **Mobiele App:** Native versies voor iOS en Android.
