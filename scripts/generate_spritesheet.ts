import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {
  MEW_MEW_IDLE,
  MEW_MEW_WALK_1,
  MEW_MEW_WALK_2,
  MEW_MEW_LAUNCH,
  CH2_MAUS_1,
  CH2_MAUS_2,
  ISAAC_FETUS_BOMB,
  EXPLOSION_CENTER,
  EXPLOSION_BEAM_H,
  EXPLOSION_BEAM_V,
} from '../src/textures/sprites';

// Sprite Sheet Grid: 4 columns x 4 rows (each tile is 16x16 pixels)
// Total dimensions: 64 x 64 pixels
const TILE_SIZE = 16;
const COLS = 4;
const ROWS = 4;
const WIDTH = COLS * TILE_SIZE; // 64
const HEIGHT = ROWS * TILE_SIZE; // 64

// Map of tiles on the grid (col, row)
const SHEET_LAYOUT: { col: number; row: number; grid: string[][] }[] = [
  // Row 0: Mad Mew Mew (Pink Cat Girl)
  { col: 0, row: 0, grid: MEW_MEW_IDLE },
  { col: 1, row: 0, grid: MEW_MEW_WALK_1 },
  { col: 2, row: 0, grid: MEW_MEW_WALK_2 },
  { col: 3, row: 0, grid: MEW_MEW_LAUNCH },

  // Row 1: Enemies & Weapons
  { col: 0, row: 1, grid: CH2_MAUS_1 },
  { col: 1, row: 1, grid: CH2_MAUS_2 },
  { col: 2, row: 1, grid: ISAAC_FETUS_BOMB },
  { col: 3, row: 1, grid: ISAAC_FETUS_BOMB }, // Secondary bomb frame

  // Row 2: FX & Cross Explosion
  { col: 0, row: 2, grid: EXPLOSION_CENTER },
  { col: 1, row: 2, grid: EXPLOSION_BEAM_H },
  { col: 2, row: 2, grid: EXPLOSION_BEAM_V },
  { col: 3, row: 2, grid: EXPLOSION_CENTER },
];

function hexToRgba(hex: string): [number, number, number, number] {
  if (!hex || hex === 'transparent') return [0, 0, 0, 0];
  if (hex.startsWith('#')) hex = hex.slice(1);
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  return [r, g, b, 255];
}

// Generate raw uncompressed scanlines (Filter byte 0 + RGBA pixels)
const scanlines: Buffer[] = [];
const rowByteWidth = WIDTH * 4;

// Build pixel buffer in memory
const imagePixels: [number, number, number, number][][] = Array.from({ length: HEIGHT }, () =>
  Array.from({ length: WIDTH }, () => [0, 0, 0, 0])
);

// Populate imagePixels from layout
for (const entry of SHEET_LAYOUT) {
  const startX = entry.col * TILE_SIZE;
  const startY = entry.row * TILE_SIZE;
  const grid = entry.grid;

  for (let r = 0; r < TILE_SIZE; r++) {
    for (let c = 0; c < TILE_SIZE; c++) {
      const colorHex = grid[r]?.[c] || '';
      imagePixels[startY + r][startX + c] = hexToRgba(colorHex);
    }
  }
}

// Write PNG scanlines
for (let y = 0; y < HEIGHT; y++) {
  const rowBuffer = Buffer.alloc(1 + rowByteWidth);
  rowBuffer[0] = 0; // Filter type 0 (None)
  let offset = 1;
  for (let x = 0; x < WIDTH; x++) {
    const [r, g, b, a] = imagePixels[y][x];
    rowBuffer[offset++] = r;
    rowBuffer[offset++] = g;
    rowBuffer[offset++] = b;
    rowBuffer[offset++] = a;
  }
  scanlines.push(rowBuffer);
}

const rawData = Buffer.concat(scanlines);
const compressedData = zlib.deflateSync(rawData);

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcTarget = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcTarget);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, crcTarget, crcBuf]);
}

// PNG Header
const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// IHDR chunk: width (4), height (4), bit depth (1), color type (6 = RGBA), compression (0), filter (0), interlace (0)
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(WIDTH, 0);
ihdrData.writeUInt32BE(HEIGHT, 4);
ihdrData[8] = 8; // 8-bit depth
ihdrData[9] = 6; // RGBA color
ihdrData[10] = 0; // Deflate
ihdrData[11] = 0; // Default filter
ihdrData[12] = 0; // No interlace
const ihdrChunk = createChunk('IHDR', ihdrData);

// IDAT chunk
const idatChunk = createChunk('IDAT', compressedData);

// IEND chunk
const iendChunk = createChunk('IEND', Buffer.alloc(0));

const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);

// Save to /textures/spritesheet.png and /public/textures/spritesheet.png
const texturesDir = path.resolve('./textures');
const publicTexturesDir = path.resolve('./public/textures');

if (!fs.existsSync(texturesDir)) fs.mkdirSync(texturesDir, { recursive: true });
if (!fs.existsSync(publicTexturesDir)) fs.mkdirSync(publicTexturesDir, { recursive: true });

fs.writeFileSync(path.join(texturesDir, 'spritesheet.png'), pngBuffer);
fs.writeFileSync(path.join(publicTexturesDir, 'spritesheet.png'), pngBuffer);

console.log('Successfully generated spritesheet.png (64x64 RGBA)');
