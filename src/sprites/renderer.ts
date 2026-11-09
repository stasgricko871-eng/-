import { SINGLE_TEXTURES, PixelGrid } from '../textures/sprites';
import { Player, Enemy, Bomb, ExplosionBeam, MiniClusterBomb } from '../types/game';

// Offscreen canvas cache by sprite ID
const canvasCache = new Map<string, HTMLCanvasElement>();

// Tile coordinates in /textures/spritesheet.png (16x16 pixels per tile)
export const SPRITESHEET_COORDS: Record<string, { col: number; row: number }> = {
  mew_mew_idle: { col: 0, row: 0 },
  mew_mew_walk_1: { col: 1, row: 0 },
  mew_mew_walk_2: { col: 2, row: 0 },
  mew_mew_launch: { col: 3, row: 0 },
  ch2_maus_1: { col: 0, row: 1 },
  ch2_maus_2: { col: 1, row: 1 },
  isaac_fetus_bomb: { col: 2, row: 1 },
  explosion_center: { col: 0, row: 2 },
  explosion_beam_h: { col: 1, row: 2 },
  explosion_beam_v: { col: 2, row: 2 },
};

let spriteSheetImg: HTMLImageElement | null = null;
let isSheetLoaded = false;

// Initialize sprite sheet PNG loading
if (typeof window !== 'undefined') {
  spriteSheetImg = new Image();
  spriteSheetImg.src = '/textures/spritesheet.png';
  spriteSheetImg.onload = () => {
    isSheetLoaded = true;
    canvasCache.clear(); // invalidate cache so sheet cuts are used
  };
  spriteSheetImg.onerror = () => {
    // Falls back to embedded matrices seamlessly
    isSheetLoaded = false;
  };
}

export function getOrCreateSpriteCanvas(spriteId: string): HTMLCanvasElement {
  const existing = canvasCache.get(spriteId);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.imageSmoothingEnabled = false;

    const coords = SPRITESHEET_COORDS[spriteId];
    if (isSheetLoaded && spriteSheetImg && coords) {
      // Extract 16x16 tile from the PNG sprite sheet!
      ctx.drawImage(
        spriteSheetImg,
        coords.col * 16,
        coords.row * 16,
        16,
        16,
        0,
        0,
        16,
        16
      );
    } else {
      // Fallback to embedded pixel grid
      const grid: PixelGrid = SINGLE_TEXTURES[spriteId] || SINGLE_TEXTURES.mew_mew_idle;
      const rows = grid.length;
      const cols = grid[0]?.length || 16;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const color = grid[r][c];
          if (color && color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(c, r, 1, 1);
          }
        }
      }
    }
  }

  canvasCache.set(spriteId, canvas);
  return canvas;
}

/**
 * Draws a pixel sprite scaled and centered at (x, y)
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  spriteId: string,
  centerX: number,
  centerY: number,
  renderSize: number,
  flipX = false,
  alpha = 1.0,
  flashWhite = false
): void {
  const spriteCanvas = getOrCreateSpriteCanvas(spriteId);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  ctx.translate(centerX, centerY);

  if (flipX) {
    ctx.scale(-1, 1);
  }

  const half = renderSize / 2;

  if (flashWhite) {
    ctx.drawImage(spriteCanvas, -half, -half, renderSize, renderSize);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-half, -half, renderSize, renderSize);
  } else {
    ctx.drawImage(spriteCanvas, -half, -half, renderSize, renderSize);
  }

  ctx.restore();
}

/**
 * Draws Mad Mew Mew (Pink the cat girl from Deltarune)
 */
export function drawPlayerSprite(ctx: CanvasRenderingContext2D, player: Player): void {
  let spriteId = 'mew_mew_idle';

  if (player.throwCooldown > player.maxThrowCooldown - 0.2) {
    spriteId = 'mew_mew_launch';
  } else if (player.isMoving) {
    spriteId = player.walkFrame === 0 ? 'mew_mew_walk_1' : 'mew_mew_walk_2';
  }

  const flipX = player.facing === 'left';
  const isInvuln = player.invulnerableTimer > 0;
  const isFlashing = player.hitFlashTimer > 0;
  const alpha = isInvuln ? (Math.floor(Date.now() / 80) % 2 === 0 ? 0.35 : 1.0) : 1.0;

  // Cat shadow below Mew Mew
  ctx.save();
  ctx.fillStyle = 'rgba(12, 6, 24, 0.5)';
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 13, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawSprite(ctx, spriteId, player.x, player.y, 38, flipX, alpha, isFlashing);

  if (player.revivesRemaining > 0) {
    ctx.save();
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 1.5;
    const pulse = 1 + Math.sin(Date.now() * 0.007) * 0.15;
    ctx.strokeRect(player.x - 16 * pulse, player.y - 19 * pulse, 32 * pulse, 36 * pulse);
    ctx.restore();
  }
}

/**
 * Draws an enemy (Cyber Maus from Deltarune Chapter 2)
 */
export function drawEnemySprite(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  const spriteId = enemy.walkFrame === 0 ? 'ch2_maus_1' : 'ch2_maus_2';
  let size = 30;

  if (enemy.type === 'maus_tank') {
    size = 42;
  } else if (enemy.type === 'maus_fast') {
    size = 26;
  }

  const flipX = enemy.vx > 0;
  const isFlashing = enemy.hitFlashTimer > 0;

  ctx.save();
  ctx.fillStyle = 'rgba(10, 6, 20, 0.45)';
  ctx.beginPath();
  ctx.ellipse(enemy.x, enemy.y + (size / 2 - 4), size / 2.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawSprite(ctx, spriteId, enemy.x, enemy.y, size, flipX, 1.0, isFlashing);

  if (enemy.frozenTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.font = '12px "DotGothic16", monospace';
    ctx.fillText('🧀!', enemy.x - 10, enemy.y - size / 2 - 2);
    ctx.restore();
  }

  if (enemy.type === 'maus_tank' && enemy.hp < enemy.maxHp) {
    const barWidth = 32;
    const barHeight = 4;
    const barX = enemy.x - barWidth / 2;
    const barY = enemy.y - size / 2 - 8;
    ctx.fillStyle = '#000000';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(barX, barY, (enemy.hp / enemy.maxHp) * barWidth, barHeight);
  }
}

/**
 * Draws an Isaac Dr. Fetus sliding bomb with floor skid trail, spark, and pulsing fuse
 */
export function drawIsaacBombSprite(ctx: CanvasRenderingContext2D, bomb: Bomb): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(bomb.x, bomb.y + 11, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const speed = Math.sqrt(bomb.vx * bomb.vx + bomb.vy * bomb.vy);
  if (speed > 40) {
    ctx.strokeStyle = 'rgba(255, 85, 163, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bomb.x, bomb.y + 10);
    ctx.lineTo(bomb.x - (bomb.vx / speed) * 16, bomb.y + 10 - (bomb.vy / speed) * 16);
    ctx.stroke();
  }
  ctx.restore();

  const fuseProgress = Math.max(0, bomb.fuseTimer / bomb.maxFuse);
  const flashRate = 5 + (1 - fuseProgress) * 20;
  const isRedFlash = Math.sin(Date.now() * 0.015 * flashRate) > 0.3 && fuseProgress < 0.6;
  const pulseScale = 1.0 + (1 - fuseProgress) * 0.2 * Math.sin(Date.now() * 0.03 * flashRate);

  ctx.save();
  drawSprite(ctx, 'isaac_fetus_bomb', bomb.x, bomb.y, 28 * pulseScale, false, 1.0, isRedFlash);

  const sparkX = bomb.x + 6;
  const sparkY = bomb.y - 12;
  ctx.fillStyle = isRedFlash ? '#ffff00' : '#ff0055';
  ctx.fillRect(sparkX + (Math.random() - 0.5) * 4, sparkY + (Math.random() - 0.5) * 4, 3, 3);

  if (bomb.weaponType === 'laser_remote_10') {
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(bomb.x - 14, bomb.y - 14, 28, 28);
  } else if (bomb.weaponType === 'cluster_kitten_20') {
    ctx.fillStyle = '#ff88c2';
    ctx.fillText('🐾', bomb.x - 6, bomb.y - 16);
  } else if (bomb.weaponType === 'homing_kitty_30') {
    ctx.strokeStyle = '#ffd700';
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(bomb.x - 15, bomb.y - 15, 30, 30);
  }
  ctx.restore();
}

export function drawMiniClusterBomb(ctx: CanvasRenderingContext2D, mini: MiniClusterBomb): void {
  ctx.save();
  ctx.fillStyle = '#ff55a3';
  ctx.beginPath();
  ctx.arc(mini.x, mini.y, mini.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(mini.x - 1, mini.y - 1, 2, 2);
  ctx.restore();
}

export function drawExplosionBeams(
  ctx: CanvasRenderingContext2D,
  beams: ExplosionBeam[],
  centerPoint: { x: number; y: number }
): void {
  for (const beam of beams) {
    const alpha = Math.max(0, beam.duration / beam.maxDuration);
    ctx.save();
    ctx.globalAlpha = alpha;

    if (beam.axis === 'horizontal') {
      const halfW = beam.width / 2;
      const length = beam.endX - beam.startX;

      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.fillRect(beam.startX, beam.startY - halfW * 1.5, length, beam.width * 1.5);

      ctx.fillStyle = '#ff55a3';
      ctx.fillRect(beam.startX, beam.startY - halfW, length, beam.width);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(beam.startX, beam.startY - halfW * 0.35, length, beam.width * 0.7);

      const hCanvas = getOrCreateSpriteCanvas('explosion_beam_h');
      const tileSize = 20;
      const count = Math.ceil(length / tileSize);
      for (let i = 0; i < count; i++) {
        const xPos = beam.startX + i * tileSize;
        ctx.drawImage(hCanvas, xPos, beam.startY - tileSize / 2, tileSize, tileSize);
      }
    } else {
      const halfW = beam.width / 2;
      const height = beam.endY - beam.startY;

      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.fillRect(beam.startX - halfW * 1.5, beam.startY, beam.width * 1.5, height);

      ctx.fillStyle = '#ff55a3';
      ctx.fillRect(beam.startX - halfW, beam.startY, beam.width, height);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(beam.startX - halfW * 0.35, beam.startY, beam.width * 0.7, height);

      const vCanvas = getOrCreateSpriteCanvas('explosion_beam_v');
      const tileSize = 20;
      const count = Math.ceil(height / tileSize);
      for (let i = 0; i < count; i++) {
        const yPos = beam.startY + i * tileSize;
        ctx.drawImage(vCanvas, beam.startX - tileSize / 2, yPos, tileSize, tileSize);
      }
    }
    ctx.restore();
  }

  drawSprite(ctx, 'explosion_center', centerPoint.x, centerPoint.y, 44);
}
