import { Point, GameMode } from '../types';
import { WALL, PATH, COIN, BREAKABLE_WALL, DOOR, LEVER, SPIKES, POISON_GAS, KEY, KEY_DOOR, GAME_MODES } from '../constants';

export const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const findPath = (start: Point, end: Point, currentMaze: number[][]): Point[] => {
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
        (currentMaze[n.y][n.x] === PATH || currentMaze[n.y][n.x] === COIN) &&
        !visited.has(`${n.x},${n.y}`)
      ) {
        visited.add(`${n.x},${n.y}`);
        queue.push({ pos: n, path: [...path, n] });
      }
    }
  }
  return [];
};

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

export const generateMaze = (
  width: number,
  height: number,
  seed?: number,
  levelIdx: number = 0,
  gameMode: GameMode = 'normal'
): MazeData => {
  const newMaze = Array(height).fill(null).map(() => Array(width).fill(WALL));
  let currentSeed = seed || Math.random();
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

  // Coins (level 10+)
  if (levelIdx >= 10) {
    for (let i = 0; i < (width * height) / 40; i++) {
      const rx = Math.floor(Math.random() * (width - 2)) + 1;
      const ry = Math.floor(Math.random() * (height - 2)) + 1;
      if (newMaze[ry][rx] === PATH && (rx !== 1 || ry !== 1) && (rx !== ex || ry !== ey))
        newMaze[ry][rx] = COIN;
    }
  }

  // Breakable walls (level 15+)
  const breakableWallsHealth: Record<string, number> = {};
  if (levelIdx >= 15) {
    const numSecrets = Math.floor((width * height) / 80) + 1;
    for (let i = 0; i < numSecrets; i++) {
      let attempts = 0;
      while (attempts < 50) {
        attempts++;
        const rx = Math.floor(Math.random() * (width - 4)) + 2;
        const ry = Math.floor(Math.random() * (height - 4)) + 2;
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
              newMaze[roomY][roomX] = Math.random() > 0.3 ? COIN : PATH;
              break;
            }
          }
        }
      }
    }
  }

  // Puzzle: lever + door (level 20+)
  let puzzleState = {
    activeElements: new Set<string>(),
    connections: {} as Record<string, string[]>
  };
  if (levelIdx >= 20) {
    const path = findPath(playerPos, exitPos, newMaze);
    if (path.length > 10) {
      const doorIdx = Math.floor(path.length * 0.6);
      const doorPos = path[doorIdx];
      let leverPos: Point | null = null;
      for (let i = 0; i < 100; i++) {
        const lx = Math.floor(Math.random() * (width - 2)) + 1;
        const ly = Math.floor(Math.random() * (height - 2)) + 1;
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
      }
    }
  }

  // Spikes (level 5+)
  if (levelIdx >= 5) {
    for (let i = 0; i < (width * height) / 30; i++) {
      const rx = Math.floor(Math.random() * (width - 2)) + 1;
      const ry = Math.floor(Math.random() * (height - 2)) + 1;
      if (newMaze[ry][rx] === PATH && (rx !== 1 || ry !== 1) && (rx !== ex || ry !== ey))
        newMaze[ry][rx] = SPIKES;
    }
  }

  // Poison gas (level 30+)
  if (levelIdx >= 30) {
    for (let i = 0; i < (width * height) / 40; i++) {
      const rx = Math.floor(Math.random() * (width - 2)) + 1;
      const ry = Math.floor(Math.random() * (height - 2)) + 1;
      if (newMaze[ry][rx] === PATH && (rx !== 1 || ry !== 1) && (rx !== ex || ry !== ey))
        newMaze[ry][rx] = POISON_GAS;
    }
  }

  // KEY mechanic (level 3+): key + locked door on the main path
  if (levelIdx >= 3) {
    const mainPath = findPath(playerPos, exitPos, newMaze);
    if (mainPath.length > 8) {
      const doorIdx = Math.floor(mainPath.length * 0.65);
      const keyDoorPos = mainPath[doorIdx];
      let keyPos: Point | null = null;
      for (let attempt = 0; attempt < 150; attempt++) {
        const kx = Math.floor(Math.random() * (width - 2)) + 1;
        const ky = Math.floor(Math.random() * (height - 2)) + 1;
        if (
          newMaze[ky][kx] === PATH &&
          (kx !== 1 || ky !== 1) &&
          (kx !== ex || ky !== ey) &&
          (kx !== keyDoorPos.x || ky !== keyDoorPos.y)
        ) {
          const onMainPath = mainPath.slice(0, doorIdx).some(p => p.x === kx && p.y === ky);
          if (!onMainPath || attempt > 100) { keyPos = { x: kx, y: ky }; break; }
        }
      }
      if (keyPos) {
        newMaze[keyDoorPos.y][keyDoorPos.x] = KEY_DOOR;
        newMaze[keyPos.y][keyPos.x] = KEY;
      }
    }
  }

  return { maze: newMaze, playerPos, exitPos, breakableWallsHealth, puzzleState };
};

export default generateMaze;
