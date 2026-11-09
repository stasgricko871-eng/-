/**
 * Single authoritative textures for Deltarune: Meow Meow Last Chance
 * Character: Mad Mew Mew / Pink (Cat Girl from Deltarune)
 * Enemy: Cyber Maus (Deltarune Chapter 2)
 * Weapon: Isaac Dr. Fetus sliding bomb
 */

export type PixelGrid = string[][];

const _ = '';
const K = '#000000'; // Black outline
const P1 = '#ff55a3'; // Mad Mew Mew pink
const P2 = '#ff88c2'; // Light pink / inner ear
const P3 = '#b81e64'; // Deep magenta
const W = '#ffffff'; // White
const S = '#ffd2b3'; // Cat girl face / skin
const C1 = '#00ffff'; // Cyber cyan
const C2 = '#0088cc'; // Cyber blue
const G1 = '#ffd700'; // Gold bell
const G2 = '#ff9900'; // Amber
const M1 = '#99aab5'; // Maus grey
const M2 = '#5d6b75'; // Maus dark grey
const R1 = '#ff0055'; // Red cat eyes / heart
const B1 = '#2c1e4a'; // Dark world skirt
const B2 = '#442d72'; // Dark purple

// Mad Mew Mew (Pink Cat Girl) Idle
export const MEW_MEW_IDLE: PixelGrid = [
  [_, _, _, K, P1, P2, K, _, _, K, P1, P2, K, _, _, _],
  [_, _, K, P1, S, P1, K, _, _, K, P1, S, P1, K, _, _],
  [_, K, P1, P2, P1, P1, K, K, K, K, P1, P1, P2, P1, K, _],
  [_, K, P1, P1, S, S, S, S, S, S, S, S, P1, P1, K, _],
  [_, K, P1, S, W, R1, K, S, S, K, C1, W, S, P1, K, _],
  [_, K, P1, S, W, K, S, P1, P1, S, K, W, S, P1, K, _],
  [_, _, K, S, S, S, P2, K, P2, S, S, S, S, K, _, _],
  [_, _, K, K, G1, G1, K, K, K, G1, G1, K, K, _, _, _],
  [_, K, W, P1, P1, P2, W, W, P2, P1, P1, W, K, _, _, _],
  [_, K, W, P1, P1, P1, P2, P2, P1, P1, P1, W, K, K, P1, K],
  [_, _, K, K, B1, B1, P1, P1, B1, B1, K, K, _, _, P1, K],
  [_, _, _, K, P1, P2, P1, P1, P2, P1, K, _, _, _, P2, K],
  [_, _, _, K, S, S, K, K, S, S, K, _, _, K, P1, K],
  [_, _, _, K, P1, P1, K, K, P1, P1, K, _, _, K, K, _],
  [_, _, _, K, K, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Mad Mew Mew Walk 1 (tail sways left)
export const MEW_MEW_WALK_1: PixelGrid = [
  [_, _, _, K, P1, P2, K, _, _, K, P1, P2, K, _, _, _],
  [_, _, K, P1, S, P1, K, _, _, K, P1, S, P1, K, _, _],
  [_, K, P1, P2, P1, P1, K, K, K, K, P1, P1, P2, P1, K, _],
  [_, K, P1, P1, S, S, S, S, S, S, S, S, P1, P1, K, _],
  [_, K, P1, S, W, R1, K, S, S, K, C1, W, S, P1, K, _],
  [_, K, P1, S, W, K, S, P1, P1, S, K, W, S, P1, K, _],
  [_, _, K, S, S, S, P2, K, P2, S, S, S, S, K, _, _],
  [_, _, K, K, G1, G1, K, K, K, G1, G1, K, K, _, _, _],
  [_, K, W, P1, P1, P2, W, W, P2, P1, P1, W, K, _, _, _],
  [_, K, W, P1, P1, P1, P2, P2, P1, P1, P1, W, K, K, P1, K],
  [_, _, K, K, B1, B1, P1, P1, B1, B1, K, K, _, _, P2, K],
  [_, _, _, K, P1, P2, P1, P1, P2, P1, K, _, _, K, P1, K],
  [_, _, K, S, S, K, _, _, K, S, K, _, _, _, K, _],
  [_, _, K, P1, P1, K, _, _, _, K, P1, K, _, _, _, _],
  [_, _, K, K, K, K, _, _, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Mad Mew Mew Walk 2 (tail sways right)
export const MEW_MEW_WALK_2: PixelGrid = [
  [_, _, _, K, P1, P2, K, _, _, K, P1, P2, K, _, _, _],
  [_, _, K, P1, S, P1, K, _, _, K, P1, S, P1, K, _, _],
  [_, K, P1, P2, P1, P1, K, K, K, K, P1, P1, P2, P1, K, _],
  [_, K, P1, P1, S, S, S, S, S, S, S, S, P1, P1, K, _],
  [_, K, P1, S, W, R1, K, S, S, K, C1, W, S, P1, K, _],
  [_, K, P1, S, W, K, S, P1, P1, S, K, W, S, P1, K, _],
  [_, _, K, S, S, S, P2, K, P2, S, S, S, S, K, _, _],
  [_, _, K, K, G1, G1, K, K, K, G1, G1, K, K, _, _, _],
  [_, K, W, P1, P1, P2, W, W, P2, P1, P1, W, K, _, _, _],
  [_, K, W, P1, P1, P1, P2, P2, P1, P1, P1, W, K, _, K, K],
  [_, _, K, K, B1, B1, P1, P1, B1, B1, K, K, _, K, P1, K],
  [_, _, _, K, P1, P2, P1, P1, P2, P1, K, _, K, P2, P1, K],
  [_, _, _, K, S, K, _, _, K, S, S, K, _, K, K, _],
  [_, _, _, K, P1, K, _, _, K, P1, P1, K, _, _, _, _],
  [_, _, _, K, K, K, _, _, K, K, K, K, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Mad Mew Mew Launch (Dr. Fetus firing pose)
export const MEW_MEW_LAUNCH: PixelGrid = [
  [_, _, _, K, P1, P2, K, _, _, K, P1, P2, K, _, _, _],
  [_, _, K, P1, S, P1, K, _, _, K, P1, S, P1, K, _, _],
  [_, K, P1, P2, P1, P1, K, K, K, K, P1, P1, P2, P1, K, _],
  [_, K, P1, P1, S, S, S, S, S, S, S, S, P1, P1, K, _],
  [_, K, P1, S, W, R1, K, S, S, K, C1, W, S, P1, K, _],
  [_, K, P1, S, W, K, S, P1, P1, S, K, W, S, P1, K, _],
  [_, _, K, S, S, S, P2, K, P2, S, S, S, S, K, _, _],
  [_, _, K, K, G1, G1, K, K, K, G1, G1, K, K, S, S, K],
  [_, K, W, P1, P1, P2, W, W, P2, P1, S, W, S, R1, W, K],
  [_, K, W, P1, P1, P1, P2, P2, P1, P1, P1, W, K, K, K, _],
  [_, _, K, K, B1, B1, P1, P1, B1, B1, K, K, _, _, _, _],
  [_, _, _, K, P1, P2, P1, P1, P2, P1, K, _, _, _, _, _],
  [_, _, _, K, S, S, K, K, S, S, K, _, _, _, _, _],
  [_, _, _, K, P1, P1, K, K, P1, P1, K, _, _, _, _, _],
  [_, _, _, K, K, K, K, K, K, K, K, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Chapter 2 Cyber Maus
export const CH2_MAUS_1: PixelGrid = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, K, K, _, _, _, _, _, _, K, K, _, _, _, _],
  [_, K, P1, P2, K, _, _, _, _, K, P1, P2, K, _, _, _],
  [_, K, P2, P1, K, _, _, _, _, K, P2, P1, K, _, _, _],
  [_, _, K, K, M1, M1, M1, M1, M1, M1, K, K, _, _, _, _],
  [_, _, K, M1, M1, M1, M1, M1, M1, M1, M1, K, _, _, _, _],
  [_, K, M1, C1, K, M1, M1, M1, M1, C1, K, M1, K, _, _, _],
  [_, K, M1, W, K, M1, M1, M1, M1, W, K, M1, K, _, _, _],
  [_, K, M1, M1, M1, M1, P1, P1, M1, M1, M1, M1, K, _, _, _],
  [_, K, M1, M2, M1, M1, M1, M1, M1, M1, M2, M1, K, _, _, _],
  [_, _, K, M1, M1, M1, M1, M1, M1, M1, M1, K, C1, K, _, _],
  [_, _, _, K, M2, M2, M2, M2, M2, M2, K, _, K, C1, K, _],
  [_, _, K, P1, K, _, _, _, _, K, P1, K, _, _, K, C1, K],
  [_, _, K, K, K, _, _, _, _, K, K, K, _, _, _, K, K],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

export const CH2_MAUS_2: PixelGrid = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, K, K, _, _, _, _, _, _, K, K, _, _, _, _],
  [_, K, P1, P2, K, _, _, _, _, K, P1, P2, K, _, _, _],
  [_, K, P2, P1, K, _, _, _, _, K, P2, P1, K, _, _, _],
  [_, _, K, K, M1, M1, M1, M1, M1, M1, K, K, _, _, _, _],
  [_, _, K, M1, M1, M1, M1, M1, M1, M1, M1, K, _, _, _, _],
  [_, K, M1, C1, K, M1, M1, M1, M1, C1, K, M1, K, _, _, _],
  [_, K, M1, W, K, M1, M1, M1, M1, W, K, M1, K, _, _, _],
  [_, K, M1, M1, M1, M1, P1, P1, M1, M1, M1, M1, K, _, _, _],
  [_, K, M1, M2, M1, M1, M1, M1, M1, M1, M2, M1, K, _, _, _],
  [_, _, K, M1, M1, M1, M1, M1, M1, M1, M1, K, _, K, C1, K],
  [_, _, _, K, M2, M2, M2, M2, M2, M2, K, _, K, C1, K, _],
  [_, _, _, K, P1, K, _, _, K, P1, K, _, _, K, C1, K, _],
  [_, _, _, K, K, K, _, _, K, K, K, _, _, _, K, K, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Dr. Fetus style Isaac Sliding Bomb
export const ISAAC_FETUS_BOMB: PixelGrid = [
  [_, _, _, _, _, _, _, K, P1, W, _, _, _, _, _, _],
  [_, _, _, _, _, _, K, P1, P2, K, _, _, _, _, _, _],
  [_, _, _, _, _, K, P3, K, K, _, _, _, _, _, _, _],
  [_, _, _, _, K, B1, B2, B2, K, _, _, _, _, _, _, _],
  [_, _, _, K, B1, B2, B2, B2, B2, K, _, _, _, _, _, _],
  [_, _, K, B1, B2, W, B2, B2, B2, B2, K, _, _, _, _, _],
  [_, K, B1, B2, W, W, B2, R1, R1, B2, B2, K, _, _, _, _],
  [_, K, B1, B2, B2, B2, R1, W, R1, B2, B2, K, _, _, _, _],
  [_, K, B1, B2, B2, B2, R1, R1, R1, B2, B2, K, _, _, _, _],
  [_, K, B1, B2, B2, B2, B2, R1, B2, B2, B2, K, _, _, _, _],
  [_, K, B1, B1, B2, B2, B2, B2, B2, B2, B1, K, _, _, _, _],
  [_, _, K, B1, B1, B1, B2, B2, B1, B1, K, _, _, _, _, _],
  [_, _, _, K, B1, B1, B1, B1, B1, B1, K, _, _, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Cross explosion tiles
export const EXPLOSION_CENTER: PixelGrid = [
  [_, _, _, _, _, _, K, C1, C1, K, _, _, _, _, _, _],
  [_, _, _, _, _, K, C1, W, W, C1, K, _, _, _, _, _],
  [_, _, _, _, K, C1, W, W, W, W, C1, K, _, _, _, _],
  [_, _, _, K, C1, W, P2, P1, P1, W, C1, K, _, _, _],
  [_, _, K, C1, W, P2, P1, P1, P1, P2, W, C1, K, _, _],
  [_, K, C1, W, P1, P1, W, W, P1, P1, W, C1, K, _, _],
  [K, C1, W, P1, P1, W, W, W, W, P1, P1, W, C1, K, _, _],
  [C1, W, W, P1, P1, W, W, W, W, P1, P1, W, W, C1, _, _],
  [C1, W, W, P1, P1, W, W, W, W, P1, P1, W, W, C1, _, _],
  [K, C1, W, P1, P1, W, W, W, W, P1, P1, W, C1, K, _, _],
  [_, K, C1, W, P1, P1, W, W, P1, P1, W, C1, K, _, _],
  [_, _, K, C1, W, P2, P1, P1, P1, P2, W, C1, K, _, _],
  [_, _, _, K, C1, W, P2, P1, P1, W, C1, K, _, _, _],
  [_, _, _, _, K, C1, W, W, W, W, C1, K, _, _, _, _],
  [_, _, _, _, _, K, C1, W, W, C1, K, _, _, _, _, _],
  [_, _, _, _, _, _, K, C1, C1, K, _, _, _, _, _, _],
];

export const EXPLOSION_BEAM_H: PixelGrid = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K],
  [C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1],
  [P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1],
  [P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2],
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  [P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2],
  [P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1],
  [C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1, C1],
  [K, K, K, K, K, K, K, K, K, K, K, K, K, K, K, K],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

export const EXPLOSION_BEAM_V: PixelGrid = [
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
  [_, _, K, C1, P1, P2, W, W, P2, P1, C1, K, _, _, _, _],
];

export const SINGLE_TEXTURES: Record<string, PixelGrid> = {
  mew_mew_idle: MEW_MEW_IDLE,
  mew_mew_walk_1: MEW_MEW_WALK_1,
  mew_mew_walk_2: MEW_MEW_WALK_2,
  mew_mew_launch: MEW_MEW_LAUNCH,
  ch2_maus_1: CH2_MAUS_1,
  ch2_maus_2: CH2_MAUS_2,
  isaac_fetus_bomb: ISAAC_FETUS_BOMB,
  explosion_center: EXPLOSION_CENTER,
  explosion_beam_h: EXPLOSION_BEAM_H,
  explosion_beam_v: EXPLOSION_BEAM_V,
};
