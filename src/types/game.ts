export type GameState = 'title' | 'playing' | 'item_draft' | 'paused' | 'gameover' | 'progression';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  facing: Direction;
  isMoving: boolean;
  walkFrame: number;
  animTimer: number;
  throwCooldown: number;
  maxThrowCooldown: number;
  bombRadius: number; // in tiles
  bombDamage: number;
  bombSlideSpeed: number;
  selfDamageMult: number; // multiplier for bomb damage to self (0.5 = 50% less)
  bombsPerThrow: number;
  weaponType: string;
  revivesRemaining: number;
  invulnerableTimer: number;
  hitFlashTimer: number;
  cheeseTrapReady: boolean;
  score: number;
  bombsThrown: number;
  enemiesDefeated: number;
  coinsEarned: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  type: 'maus_normal' | 'maus_fast' | 'maus_tank';
  walkFrame: number;
  animTimer: number;
  hitFlashTimer: number;
  biteCooldown: number;
  frozenTimer: number; // if attracted to cheese
}

/**
 * Isaac Dr. Fetus Bomb with sliding physics, friction, kick momentum, and fuse
 */
export interface Bomb {
  id: number;
  x: number;
  y: number;
  vx: number; // sliding velocity X
  vy: number; // sliding velocity Y
  radius: number;
  fuseTimer: number; // seconds remaining until detonation
  maxFuse: number;
  blastRadius: number; // tiles
  damage: number;
  weaponType: string;
  exploded: boolean;
  kickCooldown: number;
}

export interface MiniClusterBomb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuse: number;
  radius: number;
}

export interface ExplosionBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  axis: 'horizontal' | 'vertical';
  duration: number; // seconds remaining
  maxDuration: number;
  damageDoneToPlayer: boolean;
  hitEnemies: Set<number>;
  width: number;
  damage: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'square' | 'spark' | 'smoke' | 'heart' | 'paw';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  vy: number;
}

export interface CheeseDrop {
  id: number;
  x: number;
  y: number;
  life: number;
}

export interface Item {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
  apply: (player: Player) => void;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  // Isaac 4-way shooting controls or direct fire
  shootUp: boolean;
  shootDown: boolean;
  shootLeft: boolean;
  shootRight: boolean;
  throwBomb: boolean;
  aimX: number;
  aimY: number;
}

export interface RunStats {
  wave: number;
  enemiesKilled: number;
  bombsThrown: number;
  score: number;
  coinsEarned: number;
  timeAlive: number;
  causeOfDeath: string;
}
