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

## 🐛 Bugfixes

### v1.0.1
- **[mazeGenerator.ts]** Level-drempelwaarden voor gameplay-elementen gecorrigeerd. Coins, breakable walls, puzzle (lever+door) en poison gas werden nooit gegenereerd omdat hun drempelwaarden (10/15/20/30) hoger lagen dan het maximale level (9). Nieuwe drempelwaarden:
  - Coins: level 2+ (was 10+)
  - Breakable walls: level 4+ (was 15+)
  - Lever + door puzzle: level 5+ (was 20+)
  - Poison gas: level 6+ (was 30+)
- **[App.tsx — movePlayer]** Stale closure bug in game-over check opgelost. De `playerHealth` controle na schade gebruikte een verouderde closure-waarde, waardoor game-over bij snel opeenvolgende schade (spikes/poison gas) kon worden gemist. Health-verlies en game-over check gecombineerd in één functionele `setPlayerHealth` update.
- **[App.tsx]** Dubbele `CELL_SIZE` declaratie opgelost. Lokale `const CELL_SIZE = 30` verwijderd; `CELL_SIZE` wordt nu correct geïmporteerd vanuit `constants.ts`.
- **[useGameLogic.ts — checkAchievements]** Verkeerde achievement-IDs gecorrigeerd. De functie controleerde op IDs die niet bestaan (`first_steps`, `coin_collector`, `speed_demon`, `survivor`, `maze_master`), waardoor achievements nooit werden ontgrendeld. Vervangen door correcte IDs: `speedrunner` (level < 15s), `rich` (500 coins), `veteran` (level 9 bereikt). Drempel voor `rich` gecorrigeerd van 1000 naar 500 coins.
- **[mazeGenerator.ts — generateMaze]** Seed-initialisatie bug opgelost: `seed || Math.random()` behandelde seed-waarde `0` als falsy, waarna een willekeurige seed werd gebruikt. Vervangen door `seed !== undefined ? seed : Math.random()`.
- **[mazeGenerator.ts — findPath]** Hint-pathfinding gecorrigeerd: `KEY_DOOR`, `DOOR`, `LEVER` en `PRESSURE_PLATE` cellen werden niet als doorloopbaar beschouwd, waardoor hints geen geldig pad konden vinden in levels met een sleutel/deur. Deze celtypes zijn nu toegevoegd als doorloopbare cellen.
- **[App.tsx]** TypeScript-type van `activeTutorial` gecorrigeerd van `Achievement | null` naar `TutorialConfig | null`. `TutorialConfig` is het correcte type voor tutorial-objecten; `Achievement` bevat extra velden (`id`, `condition`) die tutorials niet hebben.
- **[mazeGenerator.ts]** Inconsistent gebruik van `Math.random()` in plaats van `seededRandom()` opgelost. Coins, breakable walls, lever-plaatsing, spikes, poison gas en key-plaatsing gebruikten `Math.random()` ook wanneer een seed meegegeven was. Alle calls vervangen via een lokale `rnd()` helper die automatisch `seededRandom(currentSeed++)` of `Math.random()` kiest op basis van de aanwezigheid van een seed. Daily challenges zijn nu volledig reproduceerbaar.
- **[useGameLogic.ts + App.tsx]** `startDailyChallenge()` ontgrendelt nu altijd 'hard' mode voordat `setGameMode('hard')` wordt aangeroepen. Voorheen werd 'hard' ingesteld zonder te controleren of de speler het ontgrendeld had, wat tot inconsistente staat leidde.
- **[App.tsx]** `TopBar` wordt nu alleen gerenderd wanneer `gameState === 'playing'`. Voorheen werd de TopBar ook getoond in start/gameover/won-schermen, wat visuele ruis veroorzaakte.
- **[App.tsx — useEffect]** `gameState` toegevoegd aan de dependency array van de level-reset effect. Voorheen miste `gameState`, wat betekende dat state bij een level-wisseling niet altijd correct werd gereset.
- **[useSaveLoad.ts]** `try/catch` toegevoegd rondom `JSON.parse()` in zowel `loadInitialData` als `loadSavedGame`. Corrupte of incomplete localStorage-data veroorzaakte een onafgevangen exception die de app deed crashen. Foutafhandeling herstelt nu gracefully.
- **[App.tsx]** Dode celtypen `TOGGLE_WALL` en `HIDDEN_BUTTON` verwijderd uit imports en move-handler. Deze constants bestaan niet in de maze-generator en werden nooit gegenereerd — de bijbehorende logica was onbereikbaar code.
- **[App.tsx]** Powerup-duur voor POWERUP_MAP gecorrigeerd van 15 seconden naar 5 seconden (`Date.now() + 15000` → `Date.now() + 5000`), consistent met het ontwerp.
- **[App.tsx, GameUI.tsx, EndScreen.tsx]** Lokale `formatTime()` duplicaten verwijderd. Alle bestanden importeren nu de gedeelde implementatie vanuit `src/utils/formatTime.ts`.
- **[useGameLogic.ts, StartMenu.tsx, utils/dailyChallenge.ts]** Dagelijkse modifier-selectie gecentraliseerd. Drie aparte, inconsistente berekeningen (`parseInt(date.replace(/-/g,'')) % n`) vervangen door één gedeelde `getDailyModifierIndex(n)` in `src/utils/dailyChallenge.ts`, gebaseerd op de dag van het jaar.
- **[useGameLogic.ts + App.tsx]** `ILLUSIONARY_WALLS` dagelijkse modifier geïmplementeerd. Het `ILLUSIONARY_WALL` celtype (constant 11) bestond al en werd al gerenderd in `MazeCell.tsx`, maar werd nooit gegenereerd. Oplossing: in `startLevel` worden na maze-generatie ~15% van de interne WALL-cellen vervangen door `ILLUSIONARY_WALL`. In `movePlayer` wordt het celtype afgehandeld als een doorgaanbare cel: de cel wordt omgezet naar PATH bij aanraking, met een distinct reveal-geluid (880 Hz). De maze-generatie zelf is ongewijzigd. `startLevel` accepteert nu een optionele `modifierOverride` parameter zodat `startDailyChallenge` de modifier direct kan doorgeven — dit voorkomt een stale-closure timing bug waarbij de state-update van `setActiveModifier` nog niet verwerkt zou zijn op het moment van de `startLevel(0)` aanroep.
- **[audioManager.ts — startProximityAudio]** Tweede `AudioContext` aanmaak opgelost. `startProximityAudio()` maakte altijd een nieuwe `AudioContext` aan naast de bestaande singleton, waardoor elke sessie een extra audio-context lekte. Vervangen door `this.getCtx()`. `proximityCtx` field en de bijbehorende `close()` aanroep verwijderd.
- **[useSaveLoad.ts]** `eslint-disable-next-line react-hooks/exhaustive-deps` comments verwijderd. De `setters` object werd gevangen in de closure van `loadInitialData` en `loadSavedGame`, maar stond niet in de deps array. Opgelost via een `useRef` die altijd de laatste setters bijhoudt; callbacks zijn hierdoor correct zonder suppressie.
- **[GameUI.tsx, MazeCell.tsx, useGameLogic.ts]** `any` type-annotaties vervangen door concrete types: `activePowerups: PowerupState`, `activeModifier: ActiveModifier | null`, `puzzleState: Set<string>`, `playerTrail: TrailPoint[]`, `joystick: JoystickState`, `setJoystick`/`setGameState` met correcte signaturen, pan-handlers met `PanInfo` uit `motion/react`.
- **[MazeCell.tsx]** Latente type-fout in `isPressurePlateActive` opgelost die werd blootgelegd na de `any`-verwijdering. De oude code gebruikte `puzzleState.activeElements?.has(...)` wat niet geldig is op `Set<string>`. Vereenvoudigd naar `puzzleState.has(...)` — correct en type-safe.
- **[useSaveLoad.ts]** Resterende `any` cast in auto-save interval opgelost: `s.shownTutorials as any` vervangen door `as Iterable<string>` — de smalste correcte cast voor `Set<string> | string[]`.

---
### v1.0.2 — Verbeterpunten
- **[constants.ts, App.tsx, GameUI.tsx]** `VIEWPORT_SIZE = 9` geëxporteerd vanuit `constants.ts`. De hardcoded `9` in de `dynamicCellSize` berekening (App.tsx) en de maze-container breedte/hoogte (GameUI.tsx) zijn vervangen door de constante. Eén wijziging volstaat nu om de viewport-grootte aan te passen.
- **[useShop.ts — buyCoins]** Maximumlimiet van 9999 coins toegevoegd aan `buyCoins()`. Voorheen was er geen bovengrens; `Math.min(9999, prev + amount)` voorkomt nu overflow.
- **[useSaveLoad.ts + App.tsx]** `playerHealth` wordt nu opgeslagen in en hersteld vanuit de save data. Bij "Continue" wordt de opgeslagen health hersteld ná de `startLevel()` aanroep (die health normaal terugzet naar `maxHealth`). De `saveProgress` signature is uitgebreid met een optionele `health` parameter; `autoSaveRef` en de handmatige save in de Settings modal zijn bijgewerkt.
- **[src/hooks/useUIState.ts — nieuw] [src/hooks/usePlayerAnim.ts — nieuw] [App.tsx]** 12 losse `useState`-declaraties samengevoegd in twee `useReducer`-hooks. `useUIState` groepeert 7 modal/UI-states (`showSettings`, `showShop`, `showAchievements`, `showLeaderboard`, `isPaused`, `shopCategory`, `shopSort`). `usePlayerAnim` groepeert 5 animatiestates (`damageFlash`, `isBumping`, `isDashing`, `moveDirection`, `previousPos`). Elke setter is een stabiele `useCallback`-wrapper — de publieke interface van App.tsx is ongewijzigd.

- **[App.tsx, GameUI.tsx, ShopModal.tsx, constants.ts, types.ts, useShop.ts, useSaveLoad.ts]** Momentum-dash (bug: speler liep door muren) vervangen door twee nieuwe verbruiksitems: **Jump** (175 coins — springt 2 cellen in de huidige looprichting) en **Jump Pro** (200 coins — richtingspicker met 4 pijlknoppen + annuleer, dan 2 cellen springen). Beide items zijn te kopen in de shop, zijn stapelbaar tot 99, tonen een teller op hun knop in de GameUI, en worden opgeslagen in de save data.

*22 bugs + 4 verbeterpunten + Jump/Jump Pro feature geïmplementeerd.*

## ⚠️ Bekende Beperkingen

- **Browser-gebonden:** Omdat saves lokaal zijn, kun je niet verder spelen op een ander apparaat.
- **Audio:** De geluidseffecten worden gegenereerd via de Web Audio API (synthese) en zijn functioneel maar simpel.
- **Performance:** Bij extreem hoge levels (zeer grote doolhoven) kan de maze-generatie op oudere apparaten iets langer duren.

## 🗺️ Roadmap

Plannen voor toekomstige updates:
- [x] **HTML Title:** De HTML-titel is ingesteld op 'Labyrinth Explorer'.
- [x] **Meta Tags:** SEO en Open Graph meta-tags toegevoegd aan `index.html`.
- [x] **Package Name:** Projectnaam in `package.json` bijgewerkt naar `labyrinth-explorer`.
- [x] **Dependency Cleanup:** Ongebruikte pakketten (`@google/genai`, `express`, `dotenv`, `tsx`) verwijderd.
- [ ] **Online Leaderboards:** Vergelijk je tijden met spelers wereldwijd.
- [ ] **Multiplayer Race:** Race in real-time tegen een vriend door hetzelfde doolhof.
- [ ] **Nieuwe Hazards:** Bewegende vijanden en vallende objecten.
- [ ] **Level Editor:** Bouw en deel je eigen doolhoven.
- [ ] **Mobiele App:** Native versies voor iOS en Android.
