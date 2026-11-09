import defaultData from './defaultProgression.json';

export interface StatUpgradeConfig {
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  valuePerLevel: number;
  nameRu: string;
  nameEn: string;
  descRu: string;
}

export interface WeaponMilestone {
  id: string;
  waveRequired: number;
  unlocked: boolean;
  name: string;
  nameRu: string;
  descRu: string;
  icon: string;
}

export interface ProgressionData {
  currency: number;
  highestWave: number;
  totalMiceDefeated: number;
  totalRuns: number;
  selectedWeapon: string;
  statUpgrades: Record<string, StatUpgradeConfig>;
  weaponMilestones: WeaponMilestone[];
}

const STORAGE_KEY = 'deltarune_meow_meow_progression_v1';

let cachedProgression: ProgressionData | null = null;

export function loadProgression(): ProgressionData {
  if (cachedProgression) return cachedProgression;

  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with default in case of new fields
        cachedProgression = {
          ...defaultData,
          ...parsed,
          statUpgrades: {
            ...defaultData.statUpgrades,
            ...(parsed.statUpgrades || {}),
          },
          weaponMilestones: defaultData.weaponMilestones.map((def) => {
            const match = parsed.weaponMilestones?.find((w: WeaponMilestone) => w.id === def.id);
            return match ? { ...def, unlocked: match.unlocked } : def;
          }),
        };
        return cachedProgression!;
      }
    }
  } catch (e) {
    console.warn('Could not load progression, falling back to default', e);
  }

  // Deep clone default data
  cachedProgression = JSON.parse(JSON.stringify(defaultData));
  return cachedProgression!;
}

export function saveProgression(data: ProgressionData): void {
  cachedProgression = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save progression to localStorage', e);
  }
}

export function calculateUpgradeCost(statKey: string): number {
  const p = loadProgression();
  const stat = p.statUpgrades[statKey];
  if (!stat || stat.level >= stat.maxLevel) return 0;
  return Math.round(stat.baseCost * Math.pow(stat.costMultiplier, stat.level));
}

export function upgradeStat(statKey: string): boolean {
  const p = loadProgression();
  const stat = p.statUpgrades[statKey];
  if (!stat || stat.level >= stat.maxLevel) return false;

  const cost = calculateUpgradeCost(statKey);
  if (p.currency < cost) return false;

  p.currency -= cost;
  stat.level += 1;
  saveProgression(p);
  return true;
}

export function selectWeapon(weaponId: string): boolean {
  const p = loadProgression();
  const weapon = p.weaponMilestones.find((w) => w.id === weaponId);
  if (!weapon || !weapon.unlocked) return false;

  p.selectedWeapon = weaponId;
  saveProgression(p);
  return true;
}

/**
 * Called at the end of each wave or run to reward points and check milestone weapon unlocks
 */
export function recordRunProgress(
  waveReached: number,
  miceKilled: number,
  earnedCoins: number
): { newlyUnlockedWeapons: WeaponMilestone[]; totalCoins: number } {
  const p = loadProgression();
  p.currency += earnedCoins;
  p.totalMiceDefeated += miceKilled;
  p.totalRuns += 1;
  if (waveReached > p.highestWave) {
    p.highestWave = waveReached;
  }

  const newlyUnlocked: WeaponMilestone[] = [];

  // Check weapon milestone unlocks every 10 waves!
  for (const milestone of p.weaponMilestones) {
    if (!milestone.unlocked && waveReached >= milestone.waveRequired) {
      milestone.unlocked = true;
      newlyUnlocked.push(milestone);
    }
  }

  saveProgression(p);
  return { newlyUnlockedWeapons: newlyUnlocked, totalCoins: p.currency };
}

export function exportProgressionJson(): string {
  const p = loadProgression();
  return JSON.stringify(p, null, 2);
}

export function importProgressionJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed.currency === 'number' && parsed.statUpgrades) {
      saveProgression(parsed);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Invalid progression JSON', e);
    return false;
  }
}

export function resetProgression(): void {
  cachedProgression = JSON.parse(JSON.stringify(defaultData));
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn(e);
  }
}
