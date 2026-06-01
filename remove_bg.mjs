import { removeBackground } from '@imgly/background-removal-node';
import { createWriteStream, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'fortune', 'products');
mkdirSync(outDir, { recursive: true });

const PRODUCTS = [
  {
    name: 'bird-nest',
    url: 'https://cdn1-next.cybassets.com/media/W1siZiIsIjE2NjAwL3Byb2R1Y3RzLzY0ODM4MDYyLzE3Njg4ODE1NzFfNTI4YTU3MjcyOGI2M2I4NzFjYjguanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=8fca16c5cdd9d459',
  },
  {
    name: 'sea-set',
    url: 'https://cdn1-next.cybassets.com/media/W1siZiIsIjE2NjAwL3Byb2R1Y3RzLzU1MjQ1NzU5LzE3NDY1OTI4MzVfMTUwNDk0NmNmZmFmYzRjODYxNjcucG5nIl0sWyJwIiwidGh1bWIiLCI2MDB4NjAwIl1d.png?sha=79c67a503c74e785',
  },
  {
    name: 'sea-spray',
    url: 'https://cdn1-next.cybassets.com/media/W1siZiIsIjE2NjAwL3Byb2R1Y3RzLzU1MjQ1NzQyLzE3NjI1MDQ3MjdfYzY5MjFiNDBkMzlhMGQ3N2ZiMDguanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=c2339161b3794b5b',
  },
  {
    name: 'qi-powder',
    url: 'https://cdn1-next.cybassets.com/media/W1siZiIsIjE2NjAwL3Byb2R1Y3RzLzY1MTY1NDQ0LzE3Njk2NjUwMTZfMzI4MDNlYTZlNmQ4ZmE1MTVjZGIucG5nIl0sWyJwIiwidGh1bWIiLCI2MDB4NjAwIl1d.png?sha=5e72aa162270cc1a',
  },
  {
    name: 'vit-b',
    url: 'https://cdn1-next.cybassets.com/media/W1siZiIsIjE2NjAwL3Byb2R1Y3RzLzY0ODM3ODk5LzE3Njg4ODE4NjBfOTc3YmIxYjE2NmE0NWRhMDg1N2MuanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=adf8d97307164d3a',
  },
  {
    name: 'vit-c',
    url: 'https://cdn1-next.cybassets.com/media/W1siZiIsIjE2NjAwL3Byb2R1Y3RzLzY0ODM3ODI0LzE3Njg4ODE5NDNfYmQ1NjI0MjRmNWQ0ZWQyMmY4ZjIuanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=f0edef0c1383c155',
  },
];

async function fetchArrayBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.arrayBuffer();
}

for (const product of PRODUCTS) {
  const outPath = join(outDir, `${product.name}.png`);
  console.log(`處理 ${product.name}...`);
  try {
    const resultBlob = await removeBackground(product.url, { output: { format: 'image/png' } });
    const arrayBuffer = await resultBlob.arrayBuffer();
    const stream = createWriteStream(outPath);
    stream.write(Buffer.from(arrayBuffer));
    stream.end();
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    console.log(`  ✅ 儲存 ${outPath}`);
  } catch (err) {
    console.error(`  ❌ ${product.name} 失敗:`, err.message);
  }
}
console.log('完成！');
