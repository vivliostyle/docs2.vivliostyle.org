/**
 * 記事 content/{ja,en}/new-features/footnotes.md の各セクションにある
 * <details> ブロック対を、最新の VFM Markdown ソース + VFM 生成 HTML に
 * 書き換える。
 *
 * 各セクションは画像 (`/new-features/footnotes/{lang}/{N}-...png`) を
 * アンカーとして識別する。画像直後の連続する 2 つの <details>...</details>
 * を、サンプル N に対応する新しい 2 ブロックで置換する。
 *
 * 入力:
 *   - _screenshots/footnotes-vfm/{lang}/{stem}.md (VFM Markdown ソース)
 *   - _screenshots/footnotes-vfm/dist/{lang}/{stem}.html (VFM 生成 HTML)
 * 出力:
 *   - content/{lang}/new-features/footnotes.md (in place 書き換え)
 *
 * 何度実行しても結果は同じ (idempotent)。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

// VFM 版のサンプル名 (stem) と、記事に張られている旧来の画像ファイル名 (基底名)
const SAMPLES = [
  { stem: '01-gcpm-class', img: '01-html-class-themebase' },
  { stem: '02-pandoc-endnotes', img: '02-vfm-pandoc-endnotes' },
  { stem: '03-dpub-default', img: '03-dpub-aria-default' },
  { stem: '04-page-footnote-styled', img: '04-page-footnote-styled' },
  { stem: '05-footnote-display-inline', img: '05-footnote-display-inline' },
  { stem: '06-footnote-display-compact', img: '06-footnote-display-compact' },
  { stem: '07-footnote-marker-outside', img: '07-footnote-marker-outside' },
];

const SUMMARY = {
  ja: {
    md: 'VFM Markdownソース',
    html: 'VFMが生成するHTML（body部）',
  },
  en: {
    md: 'VFM Markdown source',
    html: 'VFM-generated HTML (body only)',
  },
};

function extractBody(html) {
  const m = html.match(/<body[^>]*>\n([\s\S]*?)\n<\/body>/);
  let body = m ? m[1] : html;
  // VFM の stringify は冒頭以外の行に 4 スペース余分なインデントを入れる。
  // 記事内のコードブロックでは見栄えが悪いので一律でデデント。
  body = body
    .split('\n')
    .map((line) => (line.startsWith('    ') ? line.slice(4) : line))
    .join('\n')
    .trimEnd();
  return body;
}

function buildNewBlock(lang, sampleIndex) {
  const { stem } = SAMPLES[sampleIndex];
  const mdPath = path.join(__dirname, lang, `${stem}.md`);
  const distPath = path.join(__dirname, 'dist', lang, `${stem}.html`);
  const mdSource = fs.readFileSync(mdPath, 'utf8').trimEnd();
  const distHtml = fs.readFileSync(distPath, 'utf8');
  const body = extractBody(distHtml);
  const sum = SUMMARY[lang];

  return [
    '<details>',
    `<summary>${sum.md}</summary>`,
    '',
    '```markdown',
    mdSource,
    '```',
    '',
    '</details>',
    '',
    '<details>',
    `<summary>${sum.html}</summary>`,
    '',
    '```html',
    body,
    '```',
    '',
    '</details>',
  ].join('\n');
}

function findIndex(haystack, needle, from = 0) {
  const idx = haystack.indexOf(needle, from);
  if (idx === -1) throw new Error(`marker not found: ${needle}`);
  return idx;
}

function rewriteArticle(lang) {
  const articlePath = path.join(
    repoRoot,
    'content',
    lang,
    'new-features',
    'footnotes.md',
  );
  let article = fs.readFileSync(articlePath, 'utf8');

  for (let i = 0; i < SAMPLES.length; i++) {
    const { img } = SAMPLES[i];
    // 画像参照行に含まれる一意なパス文字列をアンカーにする
    const imgRef = `(/new-features/footnotes/${lang}/${img}.png)`;
    const imgIdx = findIndex(article, imgRef);
    // 画像行直後にある 2 つの <details>…</details> ブロックを範囲特定
    const open1 = findIndex(article, '<details>', imgIdx);
    const close1 = findIndex(article, '</details>', open1) + '</details>'.length;
    const open2 = findIndex(article, '<details>', close1);
    const close2 = findIndex(article, '</details>', open2) + '</details>'.length;

    const newBlock = buildNewBlock(lang, i);
    article = article.slice(0, open1) + newBlock + article.slice(close2);
  }

  fs.writeFileSync(articlePath, article);
  return SAMPLES.length;
}

for (const lang of ['ja', 'en']) {
  const n = rewriteArticle(lang);
  console.log(`${lang}: rewrote ${n} <details> pairs`);
}
