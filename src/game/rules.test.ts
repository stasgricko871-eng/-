import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCrossExplosionBeams,
  isEntityInBeam,
  calculateSelfDamage,
  isItemDraftWave,
  isWeaponMilestoneWave,
  getWaveConfig,
  draftItems,
  stepIsaacBombPhysics,
  kickBombByPlayer,
} from './rules';
import { INITIAL_PLAYER_STATS } from './constants';
import { Player, Bomb } from '../types/game';

test('isItemDraftWave returns true every 6 waves', () => {
  assert.equal(isItemDraftWave(0), false);
  assert.equal(isItemDraftWave(5), false);
  assert.equal(isItemDraftWave(6), true);
  assert.equal(isItemDraftWave(12), true);
});

test('isWeaponMilestoneWave returns true every 10 waves', () => {
  assert.equal(isWeaponMilestoneWave(0), false);
  assert.equal(isWeaponMilestoneWave(5), false);
  assert.equal(isWeaponMilestoneWave(10), true);
  assert.equal(isWeaponMilestoneWave(20), true);
  assert.equal(isWeaponMilestoneWave(30), true);
});

test('calculateCrossExplosionBeams handles standard and hyperbeam cross', () => {
  const normal = calculateCrossExplosionBeams(400, 300, 4, 65, false);
  assert.equal(normal.length, 2);
  assert.equal(normal[0].damage, 65);

  const hyper = calculateCrossExplosionBeams(400, 300, 4, 150, true);
  assert.equal(hyper.length, 2);
  assert.equal(hyper[0].damage, 150);
  assert.ok(hyper[0].width > normal[0].width);
});

test('isEntityInBeam detects collision on horizontal cross line', () => {
  const beams = calculateCrossExplosionBeams(400, 300, 4);
  const hBeam = beams.find((b) => b.axis === 'horizontal')!;

  assert.equal(isEntityInBeam(450, 300, 14, hBeam), true);
  assert.equal(isEntityInBeam(450, 380, 14, hBeam), false);
});

test('stepIsaacBombPhysics slides bomb, applies friction, and ticks fuse', () => {
  const bomb: Bomb = {
    id: 1,
    x: 400,
    y: 300,
    vx: 200,
    vy: 0,
    radius: 12,
    fuseTimer: 1.2,
    maxFuse: 1.2,
    blastRadius: 4,
    damage: 65,
    weaponType: 'default_fetus',
    exploded: false,
    kickCooldown: 0,
  };

  stepIsaacBombPhysics(bomb, 0.1);
  assert.ok(bomb.x > 400, 'Bomb should slide forward');
  assert.ok(bomb.vx < 200, 'Friction should reduce velocity');
  assert.ok(bomb.fuseTimer < 1.2, 'Fuse timer should decrement');
});

test('kickBombByPlayer pushes bomb on collision', () => {
  const player: Player = {
    ...INITIAL_PLAYER_STATS,
    x: 400,
    y: 300,
    vx: 100,
    vy: 0,
  };

  const bomb: Bomb = {
    id: 2,
    x: 410,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 12,
    fuseTimer: 1.0,
    maxFuse: 1.0,
    blastRadius: 4,
    damage: 65,
    weaponType: 'default_fetus',
    exploded: false,
    kickCooldown: 0,
  };

  const kicked = kickBombByPlayer(player, bomb);
  assert.equal(kicked, true);
  assert.ok(bomb.vx > 100, 'Bomb should gain kick speed');
});

test('calculateSelfDamage respects player damage reduction multiplier', () => {
  const player: Player = {
    ...INITIAL_PLAYER_STATS,
    selfDamageMult: 0.6,
  };
  const reducedDamage = calculateSelfDamage(player, 40);
  assert.equal(reducedDamage, 24);
});
