import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create PNG from raw RGBA pixels using Node's built-in zlib
function createPNG(width, height, getPixel) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuffer, data]);

  const crc = crc32(body);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([len, body, crcBuffer]);
}

// CRC-32 table calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

// Pixel generator for beautiful rose icon
function petalIconPixel(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background: soft rose gradient
  let r = 255;
  let g = Math.round(241 - 20 * (ny + 1));
  let b = Math.round(242 - 15 * (nx + 1));
  let a = 255;

  // Droplet shape calculation:
  // Center is around (0, 0.25)
  const dx = nx;
  const dy = ny - 0.2;
  const rDrop = Math.sqrt(dx * dx + dy * dy);

  // Bottom circle of droplet
  const inBottomCircle = rDrop < 0.42;

  // Top taper cone
  const inTopCone = ny < 0.2 && Math.abs(nx) < 0.42 * (1 - (0.2 - ny) / 0.85) && ny > -0.65;

  const inDroplet = inBottomCircle || inTopCone;

  if (inDroplet) {
    // Droplet gradient from rose-500 to rose-700
    const grad = (ny + 0.65) / 1.3;
    r = Math.round(244 - 60 * grad); // ~244 to 184
    g = Math.round(63 - 45 * grad);  // ~63 to 18
    b = Math.round(94 - 34 * grad);  // ~94 to 60

    // White core highlight / fertility star
    const coreDist = Math.sqrt(nx * nx + (ny - 0.22) * (ny - 0.22));
    if (coreDist < 0.12) {
      r = 255;
      g = 255;
      b = 255;
    } else if (coreDist < 0.16) {
      const t = (coreDist - 0.12) / 0.04;
      r = Math.round(255 * (1 - t) + r * t);
      g = Math.round(255 * (1 - t) + g * t);
      b = Math.round(255 * (1 - t) + b * t);
    }
  } else {
    // Outer decorative cycle ring
    const ringDist = Math.abs(dist - 0.72);
    if (ringDist < 0.025) {
      r = 244;
      g = 63;
      b = 94;
      a = 180;
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate sizes
const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'pwa-maskable-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  const buf = createPNG(size, size, petalIconPixel);
  fs.writeFileSync(path.join(publicDir, name), buf);
  console.log(`Generated ${name} (${size}x${size})`);
}
