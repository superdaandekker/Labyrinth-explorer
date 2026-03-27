import { Point, GameMode } from '../types';
import { WALL, PATH, COIN, BREAKABLE_WALL, DOOR, LEVER, PRESSURE_PLATE, SPIKES, POISON_GAS, KEY, KEY_DOOR, KEY_BLUE, KEY_DOOR_BLUE, KEY_GREEN, KEY_DOOR_GREEN, KEY_YELLOW, KEY_DOOR_YELLOW, KEY_PURPLE, KEY_DOOR_PURPLE, PREMIUM_LOOT, PREMIUM_LOOT_WEIGHTS, HIDDEN_BUTTON, TOGGLE_WALL, GAME_MODES } from '../constants';

// Module-level cache voor premium loot positie→powerupId mapping
let _premiumLootMap: Record<string, string> = {};
export const getPremiumLootMap = (): Record<string, string> => ({ ..._premiumLootMap });

export const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const MAX_GENERATION_RETRIES = 5;
const COLOR_KEY_PAIRS: [number, number][] = [
  [KEY, KEY_DOOR],
  [KEY_BLUE, KEY_DOOR_BLUE],
  [KEY_GREEN, KEY_DOOR_GREEN],
  [KEY_YELLOW, KEY_DOOR_YELLOW],
  [KEY_PURPLE, KEY_DOOR_PURPLE],
];

// IMP-008: centrale walkability helper — walkDoors=false voor hints (BUG-011), true voor generatie
const WALKABLE_ALWAYS = new Set([
  PATH, COIN, KEY, KEY_BLUE, KEY_GREEN, KEY_YELLOW, KEY_PURPLE,
  LEVER, PRESSURE_PLATE, HIDDEN_BUTTON, SPIKES, POISON_GAS,
]);
const WALKABLE_DOORS = new Set([KEY_DOOR, KEY_DOOR_BLUE, KEY_DOOR_GREEN, KEY_DOOR_YELLOW, KEY_DOOR_PURPLE, DOOR]);

export const isWalkable = (cell: number, walkDoors = true): boolean =>
  WALKABLE_ALWAYS.has(cell) || (walkDoors && WALKABLE_DOORS.has(cell));

// BUG-011: default walkDoors=false zodat hints geen pad door vergrendelde deuren tonen
export const findPath = (
  start: Point, end: Point, currentMaze: number[][],
  opts: { walkDoors?: boolean } = {}
): Point[] => {
  const walkDoors = opts.walkDoors ?? false;
  if (!currentMaze.length) return [];
  const queue: { pos: Point; path: Point[] }[] = [{ pos: start, path: [] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    if (pos.x === end.x && pos.y === end.y) return path;

    const neighbors = [
      { x: pos.x + 1, y: pos.y },
      { x: pos.x - 1, y: pos.y },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x, y: pos.y - 1 },
    ];

    for (const n of neighbors) {
      if (
        n.x >= 0 && n.x < currentMaze[0].length &&
        n.y >= 0 && n.y < currentMaze.length &&
        isWalkable(currentMaze[n.y][n.x], walkDoors) &&
        !visited.has(`${n.x},${n.y}`)
      ) {
        visited.add(`${n.x},${n.y}`);
        queue.push({ pos: n, path: [...path, n] });
      }
    }
  }
  return [];
};

// FEAT-006: maze-validatie — controleert of speler het uitgang kan bereiken
const getReachableCells = (
  maze: number[][],
  start: Point,
  blockedTypes: number[] = []
): Set<string> => {
  const reachable = new Set<string>();
  const queue: Point[] = [{ ...start }];
  reachable.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (reachable.has(key)) continue;
      if (nx < 0 || nx >= maze[0].length || ny < 0 || ny >= maze.length) continue;
      const cell = maze[ny][nx];
      if (cell === WALL || blockedTypes.includes(cell)) continue;
      reachable.add(key);
      queue.push({ x: nx, y: ny });
    }
  }

  return reachable;
};

const validateKeyDoorChain = (maze: number[][], playerPos: Point): boolean => {
  const placedPairs = COLOR_KEY_PAIRS.filter(([keyType, doorType]) =>
    maze.some((row) => row.includes(keyType)) || maze.some((row) => row.includes(doorType))
  );
  if (placedPairs.length === 0) return true;

  const allDoorTypes = placedPairs.map(([, doorType]) => doorType);
  for (let i = 0; i < placedPairs.length; i++) {
    const [keyType] = placedPairs[i];
    const reachable = getReachableCells(maze, playerPos, allDoorTypes.slice(i));
    const canReachKey = maze.some((row, y) =>
      row.some((cell, x) => cell === keyType && reachable.has(`${x},${y}`))
    );
    if (!canReachKey) return false;
  }

  return true;
};

export interface MazeValidation {
  hasReachableExit: boolean;
  hasSolvableKeyDoors: boolean;
  isValid: boolean;
}

export const getMazeValidation = (maze: number[][], playerPos: Point, exitPos: Point): MazeValidation => {
  const hasReachableExit = findPath(playerPos, exitPos, maze, { walkDoors: true }).length > 0;
  const hasSolvableKeyDoors = validateKeyDoorChain(maze, playerPos);
  return {
    hasReachableExit,
    hasSolvableKeyDoors,
    isValid: hasReachableExit && hasSolvableKeyDoors,
  };
};

export const validateMaze = (maze: number[][], playerPos: Point, exitPos: Point): boolean =>
  getMazeValidation(maze, playerPos, exitPos).isValid;

export interface MazeData {
  maze: number[][];
  playerPos: Point;
  exitPos: Point;
  breakableWallsHealth: Record<string, number>;
  puzzleState: {
    activeElements: Set<string>;
    connections: Record<string, string[]>;
  };
}

// Verschuift een level-drempel per game mode: hard=-2, premium=-1, normal=0, timed=+1
const getThreshold = (base: number, gameMode: GameMode): number => {
  const offsets: Record<GameMode, number> = { normal: 0, timed: 1, premium: -1, hard: -2 };
  return Math.max(1, base + offsets[gameMode]);
};

// Ramt dichtheid geleidelijk op over 8 levels na de drempel, met een harde cap
const scaledCount = (levelIdx: number, threshold: number, maxCount: number): number => {
  if (levelIdx < threshold) return 0;
  const levelsIn = levelIdx - threshold + 1;
  const scale = Math.min(1, levelsIn / 8);
  return Math.max(1, Math.round(maxCount * scale));
};

export const generateMaze = (
  width: number,
  height: number,
  seed?: number,
  levelIdx: number = 0,
  gameMode: GameMode = 'normal',
  retryCount: number = 0
): MazeData => {
  const newMaze = Array(height).fill(null).map(() => Array(width).fill(WALL));
  let currentSeed = seed !== undefined ? seed : Math.random();
  const rnd = () => seed !== undefined ? seededRandom(currentSeed++) : Math.random();
  const config = GAME_MODES[gameMode];
  const branchingFactor = config.branchingFactor;

  const activeCells: Point[] = [{ x: 1, y: 1 }];
  newMaze[1][1] = PATH;

  while (activeCells.length > 0) {
    let index: number;
    const r = seed !== undefined ? seededRandom(currentSeed++) : Math.random();

    if (r < branchingFactor) {
      const r2 = seed !== undefined ? seededRandom(currentSeed++) : Math.random();
      index = Math.floor(r2 * activeCells.length);
    } else {
      index = activeCells.length - 1;
    }

    const { x, y } = activeCells[index];
    const neighbors: Point[] = [];

    const directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && newMaze[ny][nx] === WALL) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    if (neighbors.length > 0) {
      const r3 = seed !== undefined ? seededRandom(currentSeed++) : Math.random();
      const next = neighbors[Math.floor(r3 * neighbors.length)];
      newMaze[next.y][next.x] = PATH;
      newMaze[y + (next.y - y) / 2][x + (next.x - x) / 2] = PATH;
      activeCells.push(next);
    } else {
      activeCells.splice(index, 1);
    }
  }

  let ex = width - 2;
  let ey = height - 2;
  if (newMaze[ey][ex] === WALL) {
    for (let i = height - 2; i > 0; i--) {
      for (let j = width - 2; j > 0; j--) {
        if (newMaze[i][j] === PATH) { ex = j; ey = i; break; }
      }
      if (newMaze[ey][ex] === PATH) break;
    }
  }

  const exitPos = { x: ex, y: ey };
  const playerPos = { x: 1, y: 1 };

  // Premium mode — skip alle drempels, vul maze met coins + gewogen powerup-loot
  if (gameMode === 'premium') {
    _premiumLootMap = {};
    const allPath: Point[] = [];
    for (let py = 1; py < height - 1; py++) {
      for (let px = 1; px < width - 1; px++) {
        if (newMaze[py][px] === PATH && !(px === 1 && py === 1) && !(px === ex && py === ey))
          allPath.push({ x: px, y: py });
      }
    }
    // Shuffle met seeded rnd
    for (let i = allPath.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [allPath[i], allPath[j]] = [allPath[j], allPath[i]];
    }
    const coinSlots = Math.floor(allPath.length * 0.20);
    const lootSlots = Math.floor(allPath.length * 0.10);
    const totalWeight = PREMIUM_LOOT_WEIGHTS.reduce((s, w) => s + w.weight, 0);

    for (let i = 0; i < coinSlots && i < allPath.length; i++)
      newMaze[allPath[i].y][allPath[i].x] = COIN;

    for (let i = coinSlots; i < coinSlots + lootSlots && i < allPath.length; i++) {
      const pos = allPath[i];
      let r = rnd() * totalWeight;
      let selectedId = PREMIUM_LOOT_WEIGHTS[PREMIUM_LOOT_WEIGHTS.length - 1].id;
      for (const w of PREMIUM_LOOT_WEIGHTS) { r -= w.weight; if (r <= 0) { selectedId = w.id; break; } }
      newMaze[pos.y][pos.x] = PREMIUM_LOOT;
      _premiumLootMap[`${pos.x},${pos.y}`] = selectedId;
    }
    return { maze: newMaze, playerPos, exitPos, breakableWallsHealth: {}, puzzleState: { activeElements: new Set(), connections: {} } };
  }

  // Coins — schaars gehouden zodat shop-aankopen relevant blijven
  const coinThreshold = getThreshold(5, gameMode);
  const coinMax = Math.floor((width * height) / 80);
  const coinCount = scaledCount(levelIdx, coinThreshold, coinMax);

  // Verzamel doodlopende cellen (precies 1 PATH-buur) — coins voelen als beloning voor verkenning
  const deadEnds: Point[] = [];
  for (let cy = 1; cy < height - 1; cy++) {
    for (let cx = 1; cx < width - 1; cx++) {
      if (newMaze[cy][cx] !== PATH) continue;
      if (cx === 1 && cy === 1) continue;
      if (cx === ex && cy === ey) continue;
      const pathNeighbors = [
        { x: cx+1, y: cy }, { x: cx-1, y: cy },
        { x: cx, y: cy+1 }, { x: cx, y: cy-1 },
      ].filter(n => newMaze[n.y][n.x] === PATH);
      if (pathNeighbors.length === 1) deadEnds.push({ x: cx, y: cy });
    }
  }

  // Shuffle dead ends met seeded rnd
  for (let i = deadEnds.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [deadEnds[i], deadEnds[j]] = [deadEnds[j], deadEnds[i]];
  }

  let coinsPlaced = 0;
  // Eerst doodlopende gangen, daarna willekeurig als fallback
  for (const de of deadEnds) {
    if (coinsPlaced >= coinCount) break;
    if (newMaze[de.y][de.x] === PATH) { newMaze[de.y][de.x] = COIN; coinsPlaced++; }
  }
  for (let attempt = 0; attempt < coinCount * 5 && coinsPlaced < coinCount; attempt++) {
    const rx = Math.floor(rnd() * (width - 2)) + 1;
    const ry = Math.floor(rnd() * (height - 2)) + 1;
    if (newMaze[ry][rx] === PATH && (rx !== 1 || ry !== 1) && (rx !== ex || ry !== ey)) {
      newMaze[ry][rx] = COIN;
      coinsPlaced++;
    }
  }

  // Breakable walls — geleidelijk oplopend vanaf drempel
  const breakableWallsHealth: Record<string, number> = {};
  const bwThreshold = getThreshold(20, gameMode);
  const bwMax = Math.floor((width * height) / 60) + 2;
  const numSecrets = scaledCount(levelIdx, bwThreshold, bwMax);
  for (let i = 0; i < numSecrets; i++) {
    let attempts = 0;
    while (attempts < 50) {
      attempts++;
      const rx = Math.floor(rnd() * (width - 4)) + 2;
      const ry = Math.floor(rnd() * (height - 4)) + 2;
      if (newMaze[ry][rx] === WALL) {
        const ns = [{ x: rx+1, y: ry }, { x: rx-1, y: ry }, { x: rx, y: ry+1 }, { x: rx, y: ry-1 }];
        const pathNs = ns.filter(n => newMaze[n.y][n.x] === PATH);
        if (pathNs.length === 1) {
          newMaze[ry][rx] = BREAKABLE_WALL;
          breakableWallsHealth[`${rx},${ry}`] = 3;
          const dir = { x: rx - pathNs[0].x, y: ry - pathNs[0].y };
          const roomX = rx + dir.x;
          const roomY = ry + dir.y;
          if (roomX > 0 && roomX < width - 1 && roomY > 0 && roomY < height - 1) {
            newMaze[roomY][roomX] = rnd() > 0.6 ? COIN : PATH;
            break;
          }
        }
      }
    }
  }

  // Puzzle: lever + deur — de lever bewaakt spikes (interactie)
  const leverThreshold = getThreshold(35, gameMode);
  const spikeThreshold = getThreshold(35, gameMode);
  let puzzleState = {
    activeElements: new Set<string>(),
    connections: {} as Record<string, string[]>
  };
  if (levelIdx >= leverThreshold) {
    const path = findPath(playerPos, exitPos, newMaze, { walkDoors: true });
    if (path.length > 10) {
      const doorIdx = Math.floor(path.length * 0.6);
      const doorPos = path[doorIdx];
      let leverPos: Point | null = null;
      for (let i = 0; i < 100; i++) {
        const lx = Math.floor(rnd() * (width - 2)) + 1;
        const ly = Math.floor(rnd() * (height - 2)) + 1;
        if (newMaze[ly][lx] === PATH && (lx !== 1 || ly !== 1) && (lx !== ex || ly !== ey)) {
          if (!path.some(p => p.x === lx && p.y === ly)) {
            leverPos = { x: lx, y: ly };
            break;
          }
        }
      }
      if (leverPos) {
        newMaze[doorPos.y][doorPos.x] = DOOR;
        newMaze[leverPos.y][leverPos.x] = LEVER;
        puzzleState.connections[`${leverPos.x},${leverPos.y}`] = [`${doorPos.x},${doorPos.y}`];

        // Interactie: spikes bewaken de lever — speler moet risico nemen om de deur te openen
        if (levelIdx >= spikeThreshold) {
          const leverNeighbors = [
            { x: leverPos.x + 1, y: leverPos.y },
            { x: leverPos.x - 1, y: leverPos.y },
            { x: leverPos.x, y: leverPos.y + 1 },
            { x: leverPos.x, y: leverPos.y - 1 },
          ].filter(n =>
            n.x > 0 && n.x < width - 1 && n.y > 0 && n.y < height - 1 &&
            newMaze[n.y][n.x] === PATH &&
            (n.x !== 1 || n.y !== 1) &&
            (n.x !== ex || n.y !== ey)
          );
          const spikesToPlace = Math.min(2, Math.floor(leverNeighbors.length / 2));
          for (let s = 0; s < spikesToPlace; s++) {
            newMaze[leverNeighbors[s].y][leverNeighbors[s].x] = SPIKES;
          }
        }
      }
    }
  }

  // Spikes — geleidelijk oplopend, harde cap zodat het niet oneerlijk vol raakt
  const spikeMax = Math.floor((width * height) / 22);
  const spikeCount = scaledCount(levelIdx, spikeThreshold, spikeMax);
  let spikesPlaced = 0;
  for (let attempt = 0; attempt < spikeCount * 5 && spikesPlaced < spikeCount; attempt++) {
    const rx = Math.floor(rnd() * (width - 2)) + 1;
    const ry = Math.floor(rnd() * (height - 2)) + 1;
    if (newMaze[ry][rx] === PATH && (rx !== 1 || ry !== 1) && (rx !== ex || ry !== ey)) {
      newMaze[ry][rx] = SPIKES;
      spikesPlaced++;
    }
  }

  // Poison gas — geleidelijk oplopend, gebiased naar de exit-helft van de maze
  const gasThreshold = getThreshold(55, gameMode);
  const gasMax = Math.floor((width * height) / 28);
  const gasCount = scaledCount(levelIdx, gasThreshold, gasMax);
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);
  let gasPlaced = 0;
  for (let attempt = 0; attempt < gasCount * 5 && gasPlaced < gasCount; attempt++) {
    // 70% kans op exit-helft, 30% willekeurig — gas voelt gevaarlijker dicht bij het doel
    const biasExit = rnd() < 0.7;
    const rx = biasExit
      ? Math.floor(rnd() * (width - 2 - halfW)) + halfW
      : Math.floor(rnd() * (width - 2)) + 1;
    const ry = biasExit
      ? Math.floor(rnd() * (height - 2 - halfH)) + halfH
      : Math.floor(rnd() * (height - 2)) + 1;
    if (newMaze[ry][rx] === PATH && (rx !== 1 || ry !== 1) && (rx !== ex || ry !== ey)) {
      newMaze[ry][rx] = POISON_GAS;
      gasPlaced++;
    }
  }

  // Hidden button + toggle walls
  const toggleThreshold = getThreshold(80, gameMode);
  if (levelIdx >= toggleThreshold) {
    const candidates: Point[] = [];
    for (let ry = 1; ry < height - 1; ry++) {
      for (let rx = 1; rx < width - 1; rx++) {
        if (newMaze[ry][rx] !== WALL) continue;
        const ns = [{ x: rx+1, y: ry }, { x: rx-1, y: ry }, { x: rx, y: ry+1 }, { x: rx, y: ry-1 }];
        const pathNeighbors = ns.filter(n => newMaze[n.y][n.x] === PATH);
        if (pathNeighbors.length >= 2) candidates.push({ x: rx, y: ry });
      }
    }
    if (candidates.length > 0) {
      const toggleIdx = Math.floor(rnd() * candidates.length);
      newMaze[candidates[toggleIdx].y][candidates[toggleIdx].x] = TOGGLE_WALL;
      const mainPath = findPath(playerPos, exitPos, newMaze, { walkDoors: true });
      for (let attempt = 0; attempt < 100; attempt++) {
        const bx = Math.floor(rnd() * (width - 2)) + 1;
        const by = Math.floor(rnd() * (height - 2)) + 1;
        if (
          newMaze[by][bx] === PATH &&
          (bx !== 1 || by !== 1) &&
          (bx !== ex || by !== ey) &&
          !mainPath.some(p => p.x === bx && p.y === by)
        ) {
          newMaze[by][bx] = HIDDEN_BUTTON;
          break;
        }
      }
    }
  }

  // KEY mechanic — multi-kleur: 1 deur bij drempel, +1 per 15 levels, max 5
  const keyThreshold = getThreshold(10, gameMode);
  if (levelIdx >= keyThreshold) {
    const doorCount = Math.min(5, 1 + Math.floor((levelIdx - keyThreshold) / 15));
    const mainPath = findPath(playerPos, exitPos, newMaze, { walkDoors: true });
    if (mainPath.length > doorCount * 6) {
      // Stap 1: deuren op evenredige posities op het hoofdpad
      const doorPositions: (Point | null)[] = [];
      for (let d = 0; d < doorCount; d++) {
        const [, doorType] = COLOR_KEY_PAIRS[d];
        const frac = doorCount === 1 ? 0.65 : 0.4 + (d / (doorCount - 1)) * 0.4;
        const doorIdx = Math.min(Math.floor(mainPath.length * frac), mainPath.length - 2);
        const doorPos = mainPath[doorIdx];
        if (newMaze[doorPos.y][doorPos.x] === PATH) {
          newMaze[doorPos.y][doorPos.x] = doorType;
          doorPositions.push(doorPos);
        } else {
          doorPositions.push(null);
        }
      }

      // BFS helper — bereikbare cellen met opgegeven deur-types als muren
      const getReachable = (blockedTypes: number[]): Set<string> =>
        getReachableCells(newMaze, playerPos, blockedTypes);

      // Stap 2: sleutels plaatsen — sleutel d bereikbaar als deuren 0..d-1 al open zijn
      const allDoorTypes = COLOR_KEY_PAIRS.slice(0, doorCount).map(([, dt]) => dt);
      for (let d = 0; d < doorCount; d++) {
        if (!doorPositions[d]) continue;
        const [keyType] = COLOR_KEY_PAIRS[d];
        // BFS met deuren d..doorCount-1 geblokkeerd (eerder geopende deuren zijn passeerbaar)
        const reachable = getReachable(allDoorTypes.slice(d));
        let keyPos: Point | null = null;
        for (let attempt = 0; attempt < 200; attempt++) {
          const kx = Math.floor(rnd() * (width - 2)) + 1;
          const ky = Math.floor(rnd() * (height - 2)) + 1;
          if (
            newMaze[ky][kx] === PATH &&
            reachable.has(`${kx},${ky}`) &&
            (kx !== 1 || ky !== 1) &&
            (kx !== ex || ky !== ey)
          ) { keyPos = { x: kx, y: ky }; break; }
        }
        if (keyPos) newMaze[keyPos.y][keyPos.x] = keyType;
      }
    }
  }

  const result = { maze: newMaze, playerPos, exitPos, breakableWallsHealth, puzzleState };
  const validation = getMazeValidation(result.maze, result.playerPos, result.exitPos);
  if (validation.isValid || retryCount >= MAX_GENERATION_RETRIES) {
    return result;
  }

  const nextSeed = seed !== undefined ? seed + retryCount + 1 : undefined;
  return generateMaze(width, height, nextSeed, levelIdx, gameMode, retryCount + 1);
};

export default generateMaze;
