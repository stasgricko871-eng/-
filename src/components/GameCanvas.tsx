import React, { useEffect, useRef } from 'react';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  TILE_SIZE,
  createPlayerFromProgression,
} from '../game/constants';
import {
  calculateCrossExplosionBeams,
  isEntityInBeam,
  calculateSelfDamage,
  isItemDraftWave,
  isWeaponMilestoneWave,
  getWaveConfig,
  stepIsaacBombPhysics,
  kickBombByPlayer,
  distance,
} from '../game/rules';
import {
  drawPlayerSprite,
  drawEnemySprite,
  drawIsaacBombSprite,
  drawMiniClusterBomb,
  drawExplosionBeams,
  drawSprite,
} from '../sprites/renderer';
import {
  playBombThrow,
  playBombExplosion,
  playPlayerHurt,
  playEnemyHurt,
  playEnemyDeath,
  playReviveSound,
  playItemDraftFanfare,
} from '../game/audio';
import {
  Player,
  Enemy,
  Bomb,
  MiniClusterBomb,
  ExplosionBeam,
  Particle,
  FloatingText,
  CheeseDrop,
  InputState,
  RunStats,
} from '../types/game';
import { recordRunProgress } from '../progression/progressionManager';

interface GameCanvasProps {
  inputState: InputState;
  onGameOver: (stats: RunStats) => void;
  onWaveCompleteItemDraft: (wave: number) => void;
  onSyncHud: (player: Player, wave: number, miceRemaining: number) => void;
  activeItemsCount: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  inputState,
  onGameOver,
  onWaveCompleteItemDraft,
  onSyncHud,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable Game state kept in refs for 60fps simulation
  const playerRef = useRef<Player>(createPlayerFromProgression());
  const enemiesRef = useRef<Enemy[]>([]);
  const bombsRef = useRef<Bomb[]>([]);
  const miniClusterBombsRef = useRef<MiniClusterBomb[]>([]);
  const explosionsRef = useRef<{ beams: ExplosionBeam[]; center: { x: number; y: number } }[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const cheeseDropsRef = useRef<CheeseDrop[]>([]);

  // Wave state
  const waveRef = useRef<number>(1);
  const waveSpawnedCountRef = useRef<number>(0);
  const waveTargetCountRef = useRef<number>(10);
  const spawnTimerRef = useRef<number>(0);
  const waveSpawnIntervalRef = useRef<number>(1.2);
  const isTransitioningWaveRef = useRef<boolean>(false);

  // Camera & Juice
  const traumaRef = useRef<number>(0);
  const hitstopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const nextBombIdRef = useRef<number>(1);
  const nextEnemyIdRef = useRef<number>(1);
  const startTimeRef = useRef<number>(Date.now());

  // Input ref
  const inputRef = useRef(inputState);
  useEffect(() => {
    inputRef.current = inputState;
  }, [inputState]);

  const spawnEnemy = (type: 'maus_normal' | 'maus_fast' | 'maus_tank') => {
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    const padding = 20;

    if (side === 0) {
      x = Math.random() * ARENA_WIDTH;
      y = padding;
    } else if (side === 1) {
      x = ARENA_WIDTH - padding;
      y = Math.random() * ARENA_HEIGHT;
    } else if (side === 2) {
      x = Math.random() * ARENA_WIDTH;
      y = ARENA_HEIGHT - padding;
    } else {
      x = padding;
      y = Math.random() * ARENA_HEIGHT;
    }

    let hp = 30;
    let speed = 95 + Math.random() * 20;
    let damage = 14;
    let radius = 12;

    if (type === 'maus_fast') {
      hp = 22;
      speed = 155 + Math.random() * 25;
      damage = 10;
      radius = 10;
    } else if (type === 'maus_tank') {
      hp = 110;
      speed = 65;
      damage = 25;
      radius = 18;
    }

    enemiesRef.current.push({
      id: nextEnemyIdRef.current++,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      hp,
      maxHp: hp,
      speed,
      damage,
      type,
      walkFrame: 0,
      animTimer: 0,
      hitFlashTimer: 0,
      biteCooldown: 0,
      frozenTimer: 0,
    });
  };

  const addFloatingText = (x: number, y: number, text: string, color = '#ffffff') => {
    floatingTextsRef.current.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1.0,
      life: 0.8,
      maxLife: 0.8,
      vy: -35,
    });
  };

  const spawnParticleBurst = (
    x: number,
    y: number,
    count = 14,
    color = '#ff55a3',
    shape: 'square' | 'spark' | 'smoke' = 'spark'
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 180;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.4 ? color : '#ffffff',
        size: 2 + Math.random() * 4,
        alpha: 1.0,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.7,
        shape,
      });
    }
  };

  /**
   * Launch Isaac Dr. Fetus sliding bomb in a directional vector
   */
  const launchIsaacBomb = (dirX: number, dirY: number) => {
    const player = playerRef.current;

    // Remote detonator check: if already has remote bombs out, detonates oldest!
    if (player.weaponType === 'laser_remote_10' && bombsRef.current.length > 0 && player.throwCooldown > 0) {
      const oldest = bombsRef.current[0];
      detonateBomb(oldest);
      return;
    }

    if (player.throwCooldown > 0) return;

    player.throwCooldown = player.maxThrowCooldown;
    player.bombsThrown += 1;
    playBombThrow();

    // Normalize launch direction
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const normX = dirX / len;
    const normY = dirY / len;

    const count = player.bombsPerThrow;
    for (let i = 0; i < count; i++) {
      let angle = Math.atan2(normY, normX);
      if (count > 1) {
        angle += (i - (count - 1) / 2) * 0.35;
      }

      const launchSpeed = player.bombSlideSpeed;
      // Add slight player momentum just like in The Binding of Isaac!
      const initialVx = Math.cos(angle) * launchSpeed + player.vx * 0.25;
      const initialVy = Math.sin(angle) * launchSpeed + player.vy * 0.25;

      bombsRef.current.push({
        id: nextBombIdRef.current++,
        x: player.x + Math.cos(angle) * 16,
        y: player.y + Math.sin(angle) * 16,
        vx: initialVx,
        vy: initialVy,
        radius: 12,
        fuseTimer: 1.15, // Isaac fuse time
        maxFuse: 1.15,
        blastRadius: player.bombRadius,
        damage: player.bombDamage,
        weaponType: player.weaponType,
        exploded: false,
        kickCooldown: 0.15,
      });
    }
  };

  /**
   * Detonates a bomb into the cross explosion
   */
  const detonateBomb = (bomb: Bomb) => {
    if (bomb.exploded) return;
    bomb.exploded = true;

    playBombExplosion();
    traumaRef.current = Math.min(1.0, traumaRef.current + 0.45);
    hitstopRef.current = 0.04;

    const isHyper = bomb.weaponType === 'hyperbeam_cross_40';
    const beams = calculateCrossExplosionBeams(
      bomb.x,
      bomb.y,
      bomb.blastRadius,
      bomb.damage,
      isHyper
    );

    explosionsRef.current.push({
      beams,
      center: { x: bomb.x, y: bomb.y },
    });

    spawnParticleBurst(bomb.x, bomb.y, 22, '#00ffff');
    spawnParticleBurst(bomb.x, bomb.y, 16, '#ff55a3');

    // Wave 20 Cluster Mew Mew Weapon: Spawn 4 diagonal mini-bombs!
    if (bomb.weaponType === 'cluster_kitten_20') {
      const diagAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
      for (const a of diagAngles) {
        miniClusterBombsRef.current.push({
          x: bomb.x,
          y: bomb.y,
          vx: Math.cos(a) * 160,
          vy: Math.sin(a) * 160,
          fuse: 0.5,
          radius: 6,
        });
      }
    }
  };

  const startWave = (waveNum: number) => {
    waveRef.current = waveNum;
    const config = getWaveConfig(waveNum);
    waveTargetCountRef.current = config.totalMaus;
    waveSpawnedCountRef.current = 0;
    waveSpawnIntervalRef.current = config.spawnInterval;
    spawnTimerRef.current = 0.5;
    isTransitioningWaveRef.current = false;
  };

  useEffect(() => {
    startWave(1);
    startTimeRef.current = Date.now();
  }, []);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = (timestamp: number) => {
      animId = requestAnimationFrame(gameLoop);

      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
        return;
      }

      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const player = playerRef.current;
      const input = inputRef.current;

      if (hitstopRef.current > 0) {
        hitstopRef.current -= dt;
      } else {
        // --- 1. SIMULATION TICK ---
        let moveX = 0;
        let moveY = 0;
        if (input.left) moveX -= 1;
        if (input.right) moveX += 1;
        if (input.up) moveY -= 1;
        if (input.down) moveY += 1;

        if (moveX !== 0 && moveY !== 0) {
          const invSqrt2 = 0.7071;
          moveX *= invSqrt2;
          moveY *= invSqrt2;
        }

        player.vx = moveX * player.speed;
        player.vy = moveY * player.speed;
        player.x += player.vx * dt;
        player.y += player.vy * dt;

        player.x = Math.max(player.radius + 10, Math.min(ARENA_WIDTH - player.radius - 10, player.x));
        player.y = Math.max(player.radius + 10, Math.min(ARENA_HEIGHT - player.radius - 10, player.y));

        player.isMoving = moveX !== 0 || moveY !== 0;
        if (moveX < -0.1) player.facing = 'left';
        else if (moveX > 0.1) player.facing = 'right';
        else if (moveY < -0.1) player.facing = 'up';
        else if (moveY > 0.1) player.facing = 'down';

        if (player.isMoving) {
          player.animTimer += dt * 10;
          player.walkFrame = Math.floor(player.animTimer) % 2;
        }

        if (player.throwCooldown > 0) player.throwCooldown -= dt;
        if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt;
        if (player.hitFlashTimer > 0) player.hitFlashTimer -= dt;

        // Isaac 4-way shooting or mouse/touch throw
        let shootX = 0;
        let shootY = 0;
        if (input.shootUp) shootY -= 1;
        if (input.shootDown) shootY += 1;
        if (input.shootLeft) shootX -= 1;
        if (input.shootRight) shootX += 1;

        if (shootX !== 0 || shootY !== 0) {
          launchIsaacBomb(shootX, shootY);
        } else if (input.throwBomb) {
          // Launch toward aim cursor / touch
          const aimDx = input.aimX - player.x;
          const aimDy = input.aimY - player.y;
          launchIsaacBomb(aimDx, aimDy);
        }

        // --- 2. WAVE & ENEMY SPAWN ---
        if (!isTransitioningWaveRef.current) {
          spawnTimerRef.current -= dt;
          if (
            spawnTimerRef.current <= 0 &&
            waveSpawnedCountRef.current < waveTargetCountRef.current
          ) {
            spawnTimerRef.current = waveSpawnIntervalRef.current;
            waveSpawnedCountRef.current += 1;

            const config = getWaveConfig(waveRef.current);
            const roll = Math.random();
            if (roll < config.tankRatio) {
              spawnEnemy('maus_tank');
            } else if (roll < config.tankRatio + config.fastRatio) {
              spawnEnemy('maus_fast');
            } else {
              spawnEnemy('maus_normal');
            }
          }

          if (
            waveSpawnedCountRef.current >= waveTargetCountRef.current &&
            enemiesRef.current.length === 0
          ) {
            isTransitioningWaveRef.current = true;
            const completedWave = waveRef.current;
            const waveCoins = 50 + completedWave * 15;
            player.coinsEarned += waveCoins;

            // Record progress & check 10-wave milestone weapon unlocks
            const { newlyUnlockedWeapons } = recordRunProgress(completedWave, player.enemiesDefeated, waveCoins);
            if (newlyUnlockedWeapons.length > 0) {
              addFloatingText(
                ARENA_WIDTH / 2,
                ARENA_HEIGHT / 2 - 50,
                `★ NEW WEAPON UNLOCKED: ${newlyUnlockedWeapons[0].nameRu}! ★`,
                '#ffd700'
              );
            }

            if (isItemDraftWave(completedWave)) {
              playItemDraftFanfare();
              onWaveCompleteItemDraft(completedWave);
            } else {
              addFloatingText(
                ARENA_WIDTH / 2,
                ARENA_HEIGHT / 2 - 20,
                `WAVE ${completedWave} CLEAR! (+${waveCoins} D$)`,
                '#00ffff'
              );
              setTimeout(() => {
                startWave(completedWave + 1);
              }, 1200);
            }
          }
        }

        // --- 3. ENEMIES SIMULATION ---
        const cheeseDrops = cheeseDropsRef.current;
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const enemy = enemiesRef.current[i];

          if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
          if (enemy.biteCooldown > 0) enemy.biteCooldown -= dt;
          if (enemy.frozenTimer > 0) enemy.frozenTimer -= dt;

          let targetX = player.x;
          let targetY = player.y;

          if (cheeseDrops.length > 0 && enemy.frozenTimer <= 0) {
            let closestDist = 9999;
            for (const cheese of cheeseDrops) {
              const d = distance(enemy.x, enemy.y, cheese.x, cheese.y);
              if (d < closestDist && d < 220) {
                closestDist = d;
                targetX = cheese.x;
                targetY = cheese.y;
              }
            }
          }

          if (enemy.frozenTimer <= 0) {
            const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
            enemy.vx = Math.cos(angle) * enemy.speed;
            enemy.vy = Math.sin(angle) * enemy.speed;

            enemy.x += enemy.vx * dt;
            enemy.y += enemy.vy * dt;

            enemy.animTimer += dt * 8;
            enemy.walkFrame = Math.floor(enemy.animTimer) % 2;

            for (let c = cheeseDrops.length - 1; c >= 0; c--) {
              const ch = cheeseDrops[c];
              if (distance(enemy.x, enemy.y, ch.x, ch.y) < enemy.radius + 12) {
                enemy.frozenTimer = 3.0;
                cheeseDrops.splice(c, 1);
                addFloatingText(enemy.x, enemy.y - 10, 'YUM! 🧀', '#ffd700');
                break;
              }
            }

            const distToPlayer = distance(enemy.x, enemy.y, player.x, player.y);
            if (distToPlayer < enemy.radius + player.radius) {
              if (enemy.biteCooldown <= 0 && player.invulnerableTimer <= 0) {
                enemy.biteCooldown = 0.8;
                player.hp -= enemy.damage;
                player.invulnerableTimer = 0.7;
                player.hitFlashTimer = 0.15;
                traumaRef.current = Math.min(1.0, traumaRef.current + 0.3);
                playPlayerHurt();
                addFloatingText(player.x, player.y - 15, `-${enemy.damage}`, '#ff0055');
                spawnParticleBurst(player.x, player.y, 8, '#ff0055', 'square');

                if (player.hp <= 0) {
                  if (player.revivesRemaining > 0) {
                    player.revivesRemaining -= 1;
                    player.hp = Math.round(player.maxHp * 0.6);
                    player.invulnerableTimer = 2.0;
                    playReviveSound();
                    addFloatingText(player.x, player.y - 30, 'DETERMINATION!', '#ffd700');
                  } else {
                    recordRunProgress(waveRef.current, player.enemiesDefeated, player.coinsEarned);
                    onGameOver({
                      wave: waveRef.current,
                      enemiesKilled: player.enemiesDefeated,
                      bombsThrown: player.bombsThrown,
                      score: player.score,
                      coinsEarned: player.coinsEarned,
                      timeAlive: Math.round((Date.now() - startTimeRef.current) / 1000),
                      causeOfDeath: `Overwhelmed by ${enemy.type === 'maus_tank' ? 'Mega Maus' : 'Cyber Maus swarm'}!`,
                    });
                    return;
                  }
                }
              }
            }
          }
        }

        // --- 4. ISAAC DR. FETUS SLIDING BOMBS ---
        for (let i = bombsRef.current.length - 1; i >= 0; i--) {
          const bomb = bombsRef.current[i];

          // Wave 30 Homing Kitty Weapon: Steer toward nearest mouse
          if (bomb.weaponType === 'homing_kitty_30' && enemiesRef.current.length > 0) {
            let nearestEnemy: Enemy | null = null;
            let nearestDist = 280;
            for (const enemy of enemiesRef.current) {
              const d = distance(bomb.x, bomb.y, enemy.x, enemy.y);
              if (d < nearestDist) {
                nearestDist = d;
                nearestEnemy = enemy;
              }
            }
            if (nearestEnemy) {
              const steerAngle = Math.atan2(nearestEnemy.y - bomb.y, nearestEnemy.x - bomb.x);
              const homingForce = 120 * dt;
              bomb.vx += Math.cos(steerAngle) * homingForce;
              bomb.vy += Math.sin(steerAngle) * homingForce;
            }
          }

          // Step Isaac sliding physics (friction, wall bounce, fuse)
          stepIsaacBombPhysics(bomb, dt);

          // Player can kick the sliding bomb!
          kickBombByPlayer(player, bomb);

          // Remote Laser Bomb (Wave 10): detonates on contact with enemy
          if (bomb.weaponType === 'laser_remote_10') {
            for (const enemy of enemiesRef.current) {
              if (distance(bomb.x, bomb.y, enemy.x, enemy.y) < bomb.radius + enemy.radius) {
                bomb.fuseTimer = 0;
                break;
              }
            }
          }

          // Fuse expiration -> Cross Explosion!
          if (bomb.fuseTimer <= 0) {
            detonateBomb(bomb);
            bombsRef.current.splice(i, 1);
          }
        }

        // --- 4B. MINI CLUSTER BOMBS (Wave 20) ---
        for (let i = miniClusterBombsRef.current.length - 1; i >= 0; i--) {
          const mini = miniClusterBombsRef.current[i];
          mini.x += mini.vx * dt;
          mini.y += mini.vy * dt;
          mini.fuse -= dt;
          if (mini.fuse <= 0) {
            spawnParticleBurst(mini.x, mini.y, 8, '#ff55a3');
            // Deal damage to nearby enemies
            for (const enemy of enemiesRef.current) {
              if (distance(mini.x, mini.y, enemy.x, enemy.y) < 32) {
                enemy.hp -= 35;
                enemy.hitFlashTimer = 0.1;
                playEnemyHurt();
              }
            }
            miniClusterBombsRef.current.splice(i, 1);
          }
        }

        // --- 5. EXPLOSIONS & CROSS BEAMS HITBOXES ---
        for (let e = explosionsRef.current.length - 1; e >= 0; e--) {
          const explosion = explosionsRef.current[e];
          let allBeamsDone = true;

          for (const beam of explosion.beams) {
            beam.duration -= dt;
            if (beam.duration > 0) {
              allBeamsDone = false;

              // Self-damage to Pink the cat girl!
              if (!beam.damageDoneToPlayer && player.invulnerableTimer <= 0) {
                if (isEntityInBeam(player.x, player.y, player.radius, beam)) {
                  beam.damageDoneToPlayer = true;
                  const selfDmg = calculateSelfDamage(player);
                  player.hp -= selfDmg;
                  player.invulnerableTimer = 0.9;
                  player.hitFlashTimer = 0.2;
                  traumaRef.current = Math.min(1.0, traumaRef.current + 0.5);
                  playPlayerHurt();
                  addFloatingText(player.x, player.y - 20, `-${selfDmg} SELF BLAST!`, '#ff55a3');
                  spawnParticleBurst(player.x, player.y, 14, '#ff55a3', 'spark');

                  if (player.hp <= 0) {
                    if (player.revivesRemaining > 0) {
                      player.revivesRemaining -= 1;
                      player.hp = Math.round(player.maxHp * 0.6);
                      player.invulnerableTimer = 2.0;
                      playReviveSound();
                      addFloatingText(player.x, player.y - 30, 'DETERMINATION!', '#ffd700');
                    } else {
                      recordRunProgress(waveRef.current, player.enemiesDefeated, player.coinsEarned);
                      onGameOver({
                        wave: waveRef.current,
                        enemiesKilled: player.enemiesDefeated,
                        bombsThrown: player.bombsThrown,
                        score: player.score,
                        coinsEarned: player.coinsEarned,
                        timeAlive: Math.round((Date.now() - startTimeRef.current) / 1000),
                        causeOfDeath: 'Blown up by your own cross bomb blast!',
                      });
                      return;
                    }
                  }
                }
              }

              // Damage to enemies
              for (const enemy of enemiesRef.current) {
                if (!beam.hitEnemies.has(enemy.id)) {
                  if (isEntityInBeam(enemy.x, enemy.y, enemy.radius, beam)) {
                    beam.hitEnemies.add(enemy.id);
                    const damage = beam.damage;
                    enemy.hp -= damage;
                    enemy.hitFlashTimer = 0.12;
                    playEnemyHurt();
                    addFloatingText(enemy.x, enemy.y - 12, `${damage}`, '#00ffff');
                    spawnParticleBurst(enemy.x, enemy.y, 8, '#00ffff', 'spark');

                    const angle = Math.atan2(enemy.y - explosion.center.y, enemy.x - explosion.center.x);
                    enemy.x += Math.cos(angle) * 22;
                    enemy.y += Math.sin(angle) * 22;
                  }
                }
              }
            }
          }

          if (allBeamsDone) {
            explosionsRef.current.splice(e, 1);
          }
        }

        // Defeated enemies cleanup & coin drop
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const enemy = enemiesRef.current[i];
          if (enemy.hp <= 0) {
            playEnemyDeath();
            player.enemiesDefeated += 1;
            const coins = enemy.type === 'maus_tank' ? 25 : 8;
            player.coinsEarned += coins;
            player.score += enemy.type === 'maus_tank' ? 100 : 25;
            spawnParticleBurst(enemy.x, enemy.y, 20, '#ff55a3', 'smoke');
            addFloatingText(enemy.x, enemy.y - 20, `+${coins} D$`, '#ffd700');

            if (player.cheeseTrapReady && Math.random() < 0.45) {
              cheeseDropsRef.current.push({
                id: Math.random(),
                x: enemy.x,
                y: enemy.y,
                life: 10.0,
              });
            }

            enemiesRef.current.splice(i, 1);
          }
        }

        // Particles & floating texts
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
          }
        }

        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.life -= dt;
          ft.y += ft.vy * dt;
          ft.alpha = Math.max(0, ft.life / ft.maxLife);
          if (ft.life <= 0) {
            floatingTextsRef.current.splice(i, 1);
          }
        }

        onSyncHud(
          player,
          waveRef.current,
          waveTargetCountRef.current - waveSpawnedCountRef.current + enemiesRef.current.length
        );
      }

      // --- RENDERING ---
      let shakeX = 0;
      let shakeY = 0;
      if (traumaRef.current > 0) {
        traumaRef.current = Math.max(0, traumaRef.current - dt * 1.5);
        const shake = traumaRef.current * traumaRef.current * 14;
        shakeX = (Math.random() * 2 - 1) * shake;
        shakeY = (Math.random() * 2 - 1) * shake;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Floor grid
      ctx.fillStyle = '#080512';
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      ctx.strokeStyle = '#1b122c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= ARENA_WIDTH; x += TILE_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_HEIGHT);
      }
      for (let y = 0; y <= ARENA_HEIGHT; y += TILE_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_WIDTH, y);
      }
      ctx.stroke();

      // Floor markers
      ctx.fillStyle = '#26183e';
      for (let x = TILE_SIZE; x < ARENA_WIDTH; x += TILE_SIZE * 2) {
        for (let y = TILE_SIZE; y < ARENA_HEIGHT; y += TILE_SIZE * 2) {
          ctx.fillRect(x - 2, y - 2, 4, 4);
        }
      }

      // Glowing boundaries
      ctx.strokeStyle = '#ff55a3';
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, ARENA_WIDTH - 12, ARENA_HEIGHT - 12);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, ARENA_WIDTH - 16, ARENA_HEIGHT - 16);

      // Cheese drops
      for (const ch of cheeseDropsRef.current) {
        drawSprite(ctx, 'item_cheese', ch.x, ch.y, 22);
      }

      // Isaac Dr. Fetus Sliding Bombs
      for (const bomb of bombsRef.current) {
        drawIsaacBombSprite(ctx, bomb);
      }

      // Mini cluster bombs
      for (const mini of miniClusterBombsRef.current) {
        drawMiniClusterBomb(ctx, mini);
      }

      // Cross explosion beams
      for (const exp of explosionsRef.current) {
        drawExplosionBeams(ctx, exp.beams, exp.center);
      }

      // Enemies (Ch.2 Maus)
      for (const enemy of enemiesRef.current) {
        drawEnemySprite(ctx, enemy);
      }

      // Player (Mad Mew Mew cat girl)
      drawPlayerSprite(ctx, player);

      // Particles
      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.shape === 'spark') {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Floating texts
      for (const ft of floatingTextsRef.current) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 16px "DotGothic16", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Aim line for Dr. Fetus launch
      if (input.aimX && input.aimY) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 85, 163, 0.6)';
        ctx.lineWidth = 1.5;
        const crosshairSize = 8;
        ctx.beginPath();
        ctx.moveTo(input.aimX - crosshairSize, input.aimY);
        ctx.lineTo(input.aimX + crosshairSize, input.aimY);
        ctx.moveTo(input.aimX, input.aimY - crosshairSize);
        ctx.lineTo(input.aimX, input.aimY + crosshairSize);
        ctx.stroke();

        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(input.aimX, input.aimY);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [onGameOver, onWaveCompleteItemDraft, onSyncHud]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    inputRef.current.aimX = clickX;
    inputRef.current.aimY = clickY;
    launchIsaacBomb(clickX - playerRef.current.x, clickY - playerRef.current.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;
    inputRef.current.aimX = (e.clientX - rect.left) * scaleX;
    inputRef.current.aimY = (e.clientY - rect.top) * scaleY;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        width={ARENA_WIDTH}
        height={ARENA_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        data-testid="game-canvas"
        className="pixel-art border-2 border-fuchsia-900 shadow-2xl max-w-full max-h-full object-contain cursor-crosshair"
        style={{
          aspectRatio: `${ARENA_WIDTH} / ${ARENA_HEIGHT}`,
        }}
      />
    </div>
  );
};
