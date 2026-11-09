import { Item, Player } from '../types/game';
import { loadProgression } from '../progression/progressionManager';

export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 600;
export const TILE_SIZE = 32;

export function createPlayerFromProgression(): Player {
  const p = loadProgression();
  const speedLvl = p.statUpgrades.speed?.level || 0;
  const dmgLvl = p.statUpgrades.damage?.level || 0;
  const radiusLvl = p.statUpgrades.radius?.level || 0;
  const resistLvl = p.statUpgrades.resistance?.level || 0;
  const launchLvl = p.statUpgrades.launchSpeed?.level || 0;

  const speed = 180 + speedLvl * 20;
  const bombDamage = 65 + dmgLvl * 18;
  const bombRadius = 4 + radiusLvl * 1;
  const selfDamageMult = Math.max(0.25, 1.0 - resistLvl * 0.12);
  const bombSlideSpeed = 280 + launchLvl * 35;
  const weaponType = p.selectedWeapon || 'default_fetus';

  return {
    x: ARENA_WIDTH / 2,
    y: ARENA_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: 14,
    hp: 100,
    maxHp: 100,
    speed,
    facing: 'down',
    isMoving: false,
    walkFrame: 0,
    animTimer: 0,
    throwCooldown: 0,
    maxThrowCooldown: 0.85,
    bombRadius,
    bombDamage,
    bombSlideSpeed,
    selfDamageMult,
    bombsPerThrow: 1,
    weaponType,
    revivesRemaining: 0,
    invulnerableTimer: 0,
    hitFlashTimer: 0,
    cheeseTrapReady: false,
    score: 0,
    bombsThrown: 0,
    enemiesDefeated: 0,
    coinsEarned: 0,
  };
}

export const INITIAL_PLAYER_STATS: Player = createPlayerFromProgression();

export const BASE_SELF_BOMB_DAMAGE = 40;

export const ITEMS_CATALOG: Item[] = [
  {
    id: 'cross_amplifier',
    name: 'Cross Laser Core',
    nameRu: 'Усилитель Креста',
    description: '+2 Tiles Cross Blast Length and 20% faster explosion',
    descriptionRu: '+2 клетки к длине взрыва бомбы по кресту',
    icon: 'item_bomb_up',
    rarity: 'common',
    apply: (p) => {
      p.bombRadius += 2;
    },
  },
  {
    id: 'cyber_skates',
    name: 'Cyber Skates',
    nameRu: 'Кибер-Ролики',
    description: '+25% Movement Speed to dodge your own cross blasts',
    descriptionRu: '+25% к скорости бега, чтобы успевать убегать от своих бомб',
    icon: 'item_skates',
    rarity: 'common',
    apply: (p) => {
      p.speed = Math.round(p.speed * 1.25);
    },
  },
  {
    id: 'dark_candy',
    name: 'Dark Candy Bundle',
    nameRu: 'Темные Конфеты',
    description: '+30 Max HP and immediately restore 50 HP',
    descriptionRu: '+30 к максимальному здоровью и мгновенно восстанавливает 50 HP',
    icon: 'item_candy',
    rarity: 'common',
    apply: (p) => {
      p.maxHp += 30;
      p.hp = Math.min(p.maxHp, p.hp + 50);
    },
  },
  {
    id: 'kevlar_ribbon',
    name: 'Mew Mew Cat Ribbon',
    nameRu: 'Защитная Лента Мяу',
    description: 'Reduces self-damage from own bombs by 40%',
    descriptionRu: 'Снижает урон самому себе от собственных бомб на 40%',
    icon: 'item_ribbon',
    rarity: 'rare',
    apply: (p) => {
      p.selfDamageMult *= 0.6;
    },
  },
  {
    id: 'double_pocket',
    name: 'Twin Fetus Sling',
    nameRu: 'Двойной Фетус-Бомбомёт',
    description: 'Launch 2 sliding bombs simultaneously',
    descriptionRu: 'Запускаешь сразу 2 скользящие бомбы веером за один выстрел',
    icon: 'item_twin_bomb',
    rarity: 'epic',
    apply: (p) => {
      p.bombsPerThrow = Math.min(3, p.bombsPerThrow + 1);
    },
  },
  {
    id: 'quick_fuse',
    name: 'Turbo Wick',
    nameRu: 'Турбо-Фитиль',
    description: '-35% Bomb Launch Cooldown for rapid bombardment',
    descriptionRu: '-35% к перезарядке выстрела бомб фетуса',
    icon: 'item_fuse',
    rarity: 'rare',
    apply: (p) => {
      p.maxThrowCooldown = Math.max(0.32, p.maxThrowCooldown * 0.65);
    },
  },
  {
    id: 'cheese_decoy',
    name: 'Dark Cheese Trap',
    nameRu: 'Сырная Приманка',
    description: 'Defeated Maus drop cheese that distracts swarming mice for 3s',
    descriptionRu: 'Из мышек выпадает темный сыр, отвлекающий орду на 3 секунды',
    icon: 'item_cheese',
    rarity: 'rare',
    apply: (p) => {
      p.cheeseTrapReady = true;
    },
  },
  {
    id: 'heart_locket',
    name: 'Determination Locket',
    nameRu: 'Медальон Решимости',
    description: 'Revives you with 60% HP upon fatal bomb or bite damage (once)',
    descriptionRu: 'Спасает от смертельного взрыва или укуса, возрождая с 60% HP',
    icon: 'item_locket',
    rarity: 'epic',
    apply: (p) => {
      p.revivesRemaining += 1;
    },
  },
];
