/**
 * useScore — calculates the run score from game stats.
 *
 * Formula:
 *   base     = (level + 1) * 1000
 *   time     = max(0, 300 - elapsedTime) * 3   (bonus for speed, up to 900 pts)
 *   moves    = max(0, 500 - moves) * 2          (bonus for efficiency, up to 1000 pts)
 *   health   = playerHealth * 200               (surviving bonus)
 *   coins    = coinsCollected * 5               (coins earned this run)
 */

interface ScoreInputs {
  currentLevel: number;
  elapsedTime: number;
  moves: number;
  playerHealth: number;
  coinsCollected: number;
}

export const calculateScore = ({
  currentLevel, elapsedTime, moves, playerHealth, coinsCollected,
}: ScoreInputs): number => {
  const base = (currentLevel + 1) * 1000;
  const timeBonus = Math.max(0, 300 - elapsedTime) * 3;
  const moveBonus = Math.max(0, 500 - moves) * 2;
  const healthBonus = playerHealth * 200;
  const coinBonus = coinsCollected * 5;
  return base + timeBonus + moveBonus + healthBonus + coinBonus;
};

export const getScoreRank = (score: number): { label: string; color: string } => {
  if (score >= 4000) return { label: 'S', color: 'text-amber-400' };
  if (score >= 3000) return { label: 'A', color: 'text-cyan-400' };
  if (score >= 2000) return { label: 'B', color: 'text-emerald-400' };
  if (score >= 1000) return { label: 'C', color: 'text-zinc-300' };
  return { label: 'D', color: 'text-zinc-500' };
};
