import { ARENA_WIDTH, ARENA_HEIGHT, TILE_SIZE, BASE_SELF_BOMB_DAMAGE, ITEMS_CATALOG } from './constants';
import { ExplosionBeam, Player, Bomb, Item } from '../types/game';

/**
 * Generates horizontal and vertical explosion beams for a detonated bomb
 */
export function calculateCrossExplosionBeams(
  bombX: number,
  bombY: number,
  radiusTiles: number,
  damage = 65,
  isHyperbeam = false,
  duration = 0.45
): ExplosionBeam[] {
  const pixelRadius = isHyperbeam ? ARENA_WIDTH : radiusTiles * TILE_SIZE;
  const halfBeamWidth = isHyperbeam ? 22 : 14;

  // Horizontal beam (clamped to arena bounds)
  const hStartX = Math.max(10, bombX - pixelRadius);
  const hEndX = Math.min(ARENA_WIDTH - 10, bombX + pixelRadius);

  // Vertical beam (clamped to arena bounds)
  const vStartY = Math.max(10, bombY - pixelRadius);
  const vEndY = Math.min(ARENA_HEIGHT - 10, bombY + pixelRadius);

  return [
    {
      startX: hStartX,
      startY: bombY,
      endX: hEndX,
      endY: bombY,
      axis: 'horizontal',
      duration,
      maxDuration: duration,
      damageDoneToPlayer: false,
      hitEnemies: new Set<number>(),
      width: halfBeamWidth * 2,
      damage,
    },
    {
      startX: bombX,
      startY: vStartY,
      endX: bombX,
      endY: vEndY,
      axis: 'vertical',
      duration,
      maxDuration: duration,
      damageDoneToPlayer: false,
      hitEnemies: new Set<number>(),
      width: halfBeamWidth * 2,
      damage,
    },
  ];
}

/**
 * Checks if a circle entity (player or enemy) intersects a cross beam segment
 */
export function isEntityInBeam(
  entityX: number,
  entityY: number,
  entityRadius: number,
  beam: ExplosionBeam
): boolean {
  const halfWidth = beam.width / 2;

  if (beam.axis === 'horizontal') {
    const minX = Math.min(beam.startX, beam.endX);
    const maxX = Math.max(beam.startX, beam.endX);
    const minY = beam.startY - halfWidth;
    const maxY = beam.startY + halfWidth;

    const closestX = Math.max(minX, Math.min(entityX, maxX));
    const closestY = Math.max(minY, Math.min(entityY, maxY));
    const dx = entityX - closestX;
    const dy = entityY - closestY;
    return dx * dx + dy * dy <= entityRadius * entityRadius;
  } else {
    const minX = beam.startX - halfWidth;
    const maxX = beam.startX + halfWidth;
    const minY = Math.min(beam.startY, beam.endY);
    const maxY = Math.max(beam.startY, beam.endY);

    const closestX = Math.max(minX, Math.min(entityX, maxX));
    const closestY = Math.max(minY, Math.min(entityY, maxY));
    const dx = entityX - closestX;
    const dy = entityY - closestY;
    return dx * dx + dy * dy <= entityRadius * entityRadius;
  }
}

/**
 * Updates Isaac Dr. Fetus sliding bomb physics:
 * Applies friction, slides bomb, bounces off arena walls, and handles kick
 */
export function stepIsaacBombPhysics(
  bomb: Bomb,
  dt: number,
  friction = 0.94
): void {
  // Update position
  bomb.x += bomb.vx * dt;
  bomb.y += bomb.vy * dt;

  // Apply friction deceleration
  const frictionPerSec = Math.pow(friction, dt * 60);
  bomb.vx *= frictionPerSec;
  bomb.vy *= frictionPerSec;

  // Arena wall bounce with damping
  const margin = 20;
  if (bomb.x < margin) {
    bomb.x = margin;
    bomb.vx = -bomb.vx * 0.75;
  } else if (bomb.x > ARENA_WIDTH - margin) {
    bomb.x = ARENA_WIDTH - margin;
    bomb.vx = -bomb.vx * 0.75;
  }

  if (bomb.y < margin) {
    bomb.y = margin;
    bomb.vy = -bomb.vy * 0.75;
  } else if (bomb.y > ARENA_HEIGHT - margin) {
    bomb.y = ARENA_HEIGHT - margin;
    bomb.vy = -bomb.vy * 0.75;
  }

  // Fuse timer countdown
  bomb.fuseTimer -= dt;
  if (bomb.kickCooldown > 0) {
    bomb.kickCooldown -= dt;
  }
}

/**
 * Handles Isaac player kicking a sliding bomb
 */
export function kickBombByPlayer(
  player: Player,
  bomb: Bomb
): boolean {
  if (bomb.kickCooldown > 0) return false;
  const dx = bomb.x - player.x;
  const dy = bomb.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const kickRadius = player.radius + bomb.radius;

  if (dist < kickRadius) {
    const angle = Math.atan2(dy, dx);
    const kickSpeed = 260;
    bomb.vx = Math.cos(angle) * kickSpeed + player.vx * 0.5;
    bomb.vy = Math.sin(angle) * kickSpeed + player.vy * 0.5;
    bomb.kickCooldown = 0.25;
    return true;
  }
  return false;
}

/**
 * Calculates self-damage when player is caught in their own cross explosion
 */
export function calculateSelfDamage(player: Player, baseDamage = BASE_SELF_BOMB_DAMAGE): number {
  const raw = baseDamage * player.selfDamageMult;
  return Math.max(5, Math.round(raw));
}

/**
 * Checks if a wave warrants an item draft (every 6 waves)
 */
export function isItemDraftWave(wave: number): boolean {
  return wave > 0 && wave % 6 === 0;
}

/**
 * Checks if a wave hits a milestone (every 10 waves: 10, 20, 30, 40)
 */
export function isWeaponMilestoneWave(wave: number): boolean {
  return wave > 0 && wave % 10 === 0;
}

/**
 * Calculates mouse wave spawn parameters based on wave number
 */
export function getWaveConfig(wave: number): {
  totalMaus: number;
  spawnInterval: number;
  tankRatio: number;
  fastRatio: number;
} {
  const totalMaus = 6 + wave * 4 + Math.floor(Math.pow(wave, 1.25));
  const spawnInterval = Math.max(0.35, 1.5 - wave * 0.08);
  const fastRatio = Math.min(0.45, Math.max(0, (wave - 2) * 0.08));
  const tankRatio = Math.min(0.25, Math.max(0, (wave - 5) * 0.05));

  return {
    totalMaus,
    spawnInterval,
    tankRatio,
    fastRatio,
  };
}

/**
 * Drafts 3 random unique items from catalog
 */
export function draftItems(count = 3, existingItemIds: string[] = []): Item[] {
  const pool = [...ITEMS_CATALOG];
  const selected: Item[] = [];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  for (const item of pool) {
    if (selected.length >= count) break;
    selected.push(item);
  }

  return selected;
}

/**
 * Calculates distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
