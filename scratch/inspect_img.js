const fs = require('fs');
const zlib = require('zlib');

// Read PNG
const buf = fs.readFileSync('d:/MindAnchor/public/logo.png');
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('Dimensions:', width, height);

// Let's inspect IDAT
let pos = 8;
const idatChunks = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString('ascii');
  if (type === 'IDAT') {
    idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
// For RGBA, each scanline has 1 filter byte + width * 4 bytes
const stride = 1 + width * 4;
// Sample pixel at (5, 5)
const y = 5;
const x = 5;
const idx = y * stride + 1 + x * 4;
console.log('Pixel (5, 5):', {
  r: decompressed[idx],
  g: decompressed[idx + 1],
  b: decompressed[idx + 2],
  a: decompressed[idx + 3]
});

// Sample pixel at center (width/2, height/2)
const cy = Math.floor(height / 2);
const cx = Math.floor(width / 2);
const cidx = cy * stride + 1 + cx * 4;
console.log('Center pixel:', {
  r: decompressed[cidx],
  g: decompressed[cidx + 1],
  b: decompressed[cidx + 2],
  a: decompressed[cidx + 3]
});
