import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.slice(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function processImage() {
  const buf = fs.readFileSync('d:/MindAnchor/public/logo.png');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);

  let pos = 8;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IDAT') idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = 1 + width * bpp;
  const raw = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(width * bpp);

  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * stride];
    const curr = Buffer.alloc(width * bpp);
    const src = y * stride + 1;
    for (let x = 0; x < width * bpp; x++) {
      const orig = decompressed[src + x];
      const a = x >= bpp ? curr[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let val = orig;
      if (filter === 1) val = (orig + a) & 0xff;
      else if (filter === 2) val = (orig + b) & 0xff;
      else if (filter === 3) val = (orig + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        val = (orig + pr) & 0xff;
      }
      curr[x] = val;
      raw[(y * width) * 4 + x] = val;
    }
    prev = curr;
  }

  // Orb center:
  const centerX = 166;
  const centerY = 146;
  // Maximum radius covering the orb, planetary ring, and glowing aura
  const maxR = 142;

  // Process pixels: make light background transparent while keeping the glowing orb & orbit
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = raw[idx];
      const g = raw[idx + 1];
      const b = raw[idx + 2];

      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Light/smoky background detection: high brightness and low saturation
      const isLightBg = (r > 165 && g > 155 && b > 145 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30);
      const isCorner = (dist > maxR);

      if (isCorner) {
        // Outside the emblem radius
        raw[idx + 3] = 0;
      } else if (dist > 125 && isLightBg) {
        // Soft feather near the edge for background smoke
        const feather = Math.max(0, Math.min(1, (maxR - dist) / (maxR - 125)));
        raw[idx + 3] = Math.round(feather * 0.3 * 255);
      } else if (isLightBg && dist > 110) {
        // Fade background outside the core dark orb
        const t = Math.max(0, Math.min(1, (dist - 110) / 25));
        raw[idx + 3] = Math.round((1 - t) * 255);
      }
    }
  }

  // Encode as new PNG
  const outScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    outScanlines[y * (1 + width * 4)] = 0; // Filter None
    raw.copy(outScanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(outScanlines);
  const headerBuf = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const resultPng = Buffer.concat([headerBuf, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync('d:/MindAnchor/public/mindanchor-emblem.png', resultPng);
  fs.writeFileSync('d:/MindAnchor/src/assets/mindanchor-emblem.png', resultPng);
  console.log('Successfully saved transparent emblem to public/mindanchor-emblem.png and src/assets/mindanchor-emblem.png!');
}

processImage();
