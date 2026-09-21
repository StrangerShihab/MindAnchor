import fs from 'fs';
import zlib from 'zlib';

function processPNG() {
  const buf = fs.readFileSync('d:/MindAnchor/public/logo.png');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  console.log('PNG width:', width, 'height:', height);

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
  const bpp = 4; // RGBA
  const stride = 1 + width * bpp;
  const rawData = Buffer.alloc(width * height * 4);

  // Unfilter PNG scanlines
  let prevRow = Buffer.alloc(width * bpp);
  for (let y = 0; y < height; y++) {
    const filterType = decompressed[y * stride];
    const currentRow = Buffer.alloc(width * bpp);
    const srcOffset = y * stride + 1;

    for (let x = 0; x < width * bpp; x++) {
      const orig = decompressed[srcOffset + x];
      const a = x >= bpp ? currentRow[x - bpp] : 0;
      const b = prevRow[x];
      const c = x >= bpp ? prevRow[x - bpp] : 0;

      let val = orig;
      if (filterType === 0) val = orig;
      else if (filterType === 1) val = (orig + a) & 0xff;
      else if (filterType === 2) val = (orig + b) & 0xff;
      else if (filterType === 3) val = (orig + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        else pr = c;
        val = (orig + pr) & 0xff;
      }
      currentRow[x] = val;
      rawData[(y * width) * 4 + x] = val;
    }
    prevRow = currentRow;
  }

  console.log('Unfiltered raw pixels total:', rawData.length);
  // Check corner color at (0, 0)
  console.log('Corner pixel (0,0):', rawData[0], rawData[1], rawData[2], rawData[3]);
  console.log('Corner pixel (w-1,0):', rawData[(width - 1) * 4], rawData[(width - 1) * 4 + 1], rawData[(width - 1) * 4 + 2]);
  console.log('Center pixel:', rawData[(Math.floor(height/2) * width + Math.floor(width/2)) * 4],
                              rawData[(Math.floor(height/2) * width + Math.floor(width/2)) * 4 + 1],
                              rawData[(Math.floor(height/2) * width + Math.floor(width/2)) * 4 + 2]);
}

processPNG();
