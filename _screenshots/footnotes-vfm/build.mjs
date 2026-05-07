/**
 * VFM Markdown → 自己完結HTMLへ変換するビルドスクリプト。
 *
 *各ja/{N}-name.md / en/{N}-name.mdを読み、frontmatterのvfm.footnote
 *モード（pandoc / gcpm / dpub）に従ってVFMのstringify()を呼び、
 *出力HTMLの<body>部分を取り出して、_base.css +該当example CSSと
 *一緒に短冊サイズの自己完結HTMLとしてdist/{lang}/{N}-name.htmlに
 *書き出す。
 *
 *実行:
 *   cd _screenshots/footnotes-vfm
 *   node build.mjs
 */

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from '@vivliostyle/vfm';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stylesDir = join(__dirname, 'styles');
const baseCssPath = join(stylesDir, '_base.css');

/**
 * 04-page-footnote-styledだけは見出しテキストが言語ごとに違うので
 * `<stem>.<lang>.css`を読む。それ以外は`<stem>.css`共通。
 */
function perExampleCssPath(stem, lang) {
  if (stem === '04-page-footnote-styled') {
    return join(stylesDir, `${stem}.${lang}.css`);
  }
  return join(stylesDir, `${stem}.css`);
}

async function readIfExists(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (err) {
    if (err && err.code === 'ENOENT') return '';
    throw err;
  }
}

async function buildOne(lang, mdPath) {
  const raw = await readFile(mdPath, 'utf8');
  const { data, content } = matter(raw);
  const mode = data?.vfm?.footnote ?? 'pandoc';
  const title = data?.title ?? '';
  const stem = basename(mdPath, '.md');

  const baseCss = await readFile(baseCssPath, 'utf8');
  const perCss = await readIfExists(perExampleCssPath(stem, lang));

  // VFMが完全なHTMLを返すので<body>内だけ取り出す
  const vfmHtml = stringify(content, { footnote: mode });
  const bodyMatch = vfmHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  const bodyContent = (bodyMatch ? bodyMatch[1] : vfmHtml).trim();

  const finalHtml = [
    '<!DOCTYPE html>',
    `<html lang="${lang}">`,
    '<head>',
    '<meta charset="utf-8">',
    `<title>${title}</title>`,
    '<style>',
    baseCss.trimEnd(),
    perCss.trimEnd(),
    '</style>',
    '</head>',
    '<body>',
    bodyContent,
    '</body>',
    '</html>',
    '',
  ].join('\n');

  const outPath = join(__dirname, 'dist', lang, `${stem}.html`);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, finalHtml);
  return outPath;
}

async function main() {
  const built = [];
  for (const lang of ['ja', 'en']) {
    const dir = join(__dirname, lang);
    const files = (await readdir(dir))
      .filter((f) => f.endsWith('.md'))
      .sort();
    for (const f of files) {
      built.push(await buildOne(lang, join(dir, f)));
    }
  }
  console.log(`Built ${built.length} files:`);
  for (const p of built) console.log(`  ${p}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
