#!/usr/bin/env node
/**
 * public/ 配下の画像アセットを最適化する。
 *
 * - 幅が MAX_WIDTH を超える画像をその幅にリサイズ（縦横比は維持）
 * - 形式は維持（PNG → PNG, WebP → WebP, JPEG → JPEG）
 * - 公式ロゴ／ファビコンや downloads/ 配下は対象外
 *
 * Web ブラウザでのモバイル表示／PDF 埋め込みの両方を軽量化する目的。
 *
 * 用途：submodule の画像が更新された後にこのスクリプトを再実行する。
 *   $ npm run optimize:images
 */

import sharp from 'sharp';
import { readdir, stat, rename } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';

const MAX_WIDTH = 1500;
const PUBLIC_DIR = 'public';
const SKIP_DIRS = new Set(['downloads']);
const SKIP_FILES = new Set([
  'favicon.png',
  'favicon.svg',
  'vivliostyle-docs.svg',
  'vivliostyle-logo72.png',
  'vivliostyle-docs.png',
]);
const TARGET_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function* walkImages(dir, root = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkImages(path, root);
    } else if (TARGET_EXTS.has(extname(entry.name).toLowerCase())) {
      if (SKIP_FILES.has(entry.name)) continue;
      yield path;
    }
  }
}

function applyEncoder(pipeline, ext) {
  switch (ext) {
    case '.png':
      return pipeline.png({ compressionLevel: 9 });
    case '.webp':
      return pipeline.webp({ quality: 85 });
    case '.jpg':
    case '.jpeg':
      return pipeline.jpeg({ quality: 85, progressive: true, mozjpeg: true });
    default:
      return pipeline;
  }
}

let totalBefore = 0;
let totalAfter = 0;
let processed = 0;
let skipped = 0;

for await (const path of walkImages(PUBLIC_DIR)) {
  const ext = extname(path).toLowerCase();
  const beforeSize = (await stat(path)).size;
  const meta = await sharp(path).metadata();

  if (!meta.width || meta.width <= MAX_WIDTH) {
    skipped++;
    continue;
  }

  const tmpPath = `${path}.optimizing`;
  let pipeline = sharp(path).resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  });
  pipeline = applyEncoder(pipeline, ext);
  await pipeline.toFile(tmpPath);
  await rename(tmpPath, path);

  const afterSize = (await stat(path)).size;
  totalBefore += beforeSize;
  totalAfter += afterSize;
  processed++;

  const rel = relative('.', path);
  const reduction = ((1 - afterSize / beforeSize) * 100).toFixed(1);
  console.log(
    `  ${rel}: ${meta.width}x${meta.height} → ${MAX_WIDTH}x${Math.round((MAX_WIDTH * meta.height) / meta.width)}, ${(beforeSize / 1024).toFixed(1)}KB → ${(afterSize / 1024).toFixed(1)}KB (-${reduction}%)`
  );
}

console.log('');
console.log(`Processed: ${processed} images`);
console.log(`Skipped (already ≤${MAX_WIDTH}px): ${skipped} images`);
if (processed > 0) {
  const totalReduction = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log(
    `Total: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB (-${totalReduction}%)`
  );
}
