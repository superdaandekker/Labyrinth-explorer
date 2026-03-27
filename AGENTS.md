# Labyrinth Explorer — Codex regels

## Bevroren bestanden (NOOIT aanpassen — ook niet indirect)
`hooks/useGameLogic.ts` · `utils/mazeGenerator.ts` · `hooks/useSaveLoad.ts` · `audio/audioManager.ts` · `hooks/useAudio.ts` · `hooks/useShop.ts` · `hooks/useScore.ts` · `hooks/useLeaderboard.ts` · `hooks/usePlayerAnim.ts`

Bevat: spelerbeweging · maze generation · collision · save/load · audio · achievements · coin spawning · shop · economy

## Bestandsmap (lees alleen wat de taak raakt)
| Systeem | Bestand(en) |
|---|---|
| App / routing | `App.tsx` |
| Types / constants | `types.ts` · `constants.ts` |
| Spelerbeweging / game loop | `hooks/useGameLogic.ts` |
| Maze rendering | `components/MazeViewport.tsx` · `components/MazeCell.tsx` |
| HUD / header | `components/GameHeader.tsx` |
| Controls | `components/GameControls.tsx` |
| Game wrapper | `components/GameUI.tsx` |
| Start / End scherm | `components/StartMenu.tsx` · `components/EndScreen.tsx` |
| TopBar | `components/TopBar.tsx` |
| Modals | `components/Modals/` (lees alleen de relevante modal) |
| Save / load | `hooks/useSaveLoad.ts` |
| Audio | `audio/audioManager.ts` · `hooks/useAudio.ts` |
| Shop | `hooks/useShop.ts` |
| Score / leaderboard | `hooks/useScore.ts` · `hooks/useLeaderboard.ts` |
| Maze generatie | `utils/mazeGenerator.ts` |
| Animaties | `hooks/usePlayerAnim.ts` |
| UI state | `hooks/useUIState.ts` |
| Tijd / daily | `utils/formatTime.ts` · `utils/dailyChallenge.ts` |

## Vóór GO
1. Lees **alleen** de bestanden uit de bestandsmap die de taak raakt (max 2-3) — geen README tenzij expliciet gevraagd
2. Zoek bestaande logica → hergebruik, of leg uit waarom niet
3. Plan (max 5 bullets): welke files, welke impact
4. Declareer expliciet:
   - **RAAK:** `[bestand1, bestand2]` ← alleen deze worden gewijzigd
   - **RAAK NIET:** alle overige bestanden
5. **Wacht op GO — geen code voor GO**

## Na GO
5. Implementeer — **uitsluitend** de bestanden uit de RAAK-lijst, geen scope-uitbreiding
6. Self-check: Syntax · TypeScript · Imports · Logica · Side effects — elk ✅/❌ + fix
7. Regressie-check: beschermde systemen ✅/❌
8. Fix issues direct
9. Update README.md alleen bij structurele wijzigingen

## Output structuur
`1. Analyse · 2. Plan · 3. Wijzigingen · 4. Self-check · 5. Regressie · 6. Fixes · 7. Risico's`

## Regels
- Geen duplicate logica · geen extra features · geen onnodige refactors
- Minimale wijzigingen · simpel en logisch
- Houd je antworden beknopt en zo kort mogelijk
