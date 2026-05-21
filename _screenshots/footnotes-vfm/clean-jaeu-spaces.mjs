/**
 * 日本語コンテンツファイルから和欧境界の半角スペースを除去するスクリプト。
 *
 * 「和欧境界」= 日本語文字（ひらがな/カタカナ/漢字/全角記号）と
 * ASCII 印字可能文字の境界。モダンブラウザは和欧間隔を自動処理するため、
 * ソース上の半角スペースは不要（重複して二重間隔になる）。
 *
 * 保護するもの:
 *   - YAML frontmatter (`---`〜`---`) — `key: value` の `: ` を壊さないため
 *   - フェンス付きコードブロック (` ``` `) — トップレベル / ブロッククオート内
 *   - Markdown 構造マーカー直後のスペース (`# `, `- `, `[^1]: ` など)
 *
 * 使用例:
 *   node clean-jaeu-spaces.mjs path/to/file.md [path/to/another.md ...]
 */

import fs from 'node:fs';

const JA = '[\\u3040-\\u30FF\\u4E00-\\u9FFF\\u3000-\\u303F\\uFF00-\\uFFEF]';
const ASCII = '[!-~]';

const RE_JA_SPACE_ASCII = new RegExp(`(${JA}) (${ASCII})`, 'g');
const RE_ASCII_SPACE_JA = new RegExp(`(${ASCII}) (${JA})`, 'g');

const RE_HEADING = new RegExp(`^(#{1,6})(${JA})`);
const RE_BLOCKQUOTE = new RegExp(`^(>)(${JA})`);
const RE_LIST = new RegExp(`^(\\s*)([*+-])(${JA})`);
const RE_OL = new RegExp(`^(\\s*)(\\d+\\.)(${JA})`);
const RE_FOOTNOTE_DEF = new RegExp(`^(\\[\\^[^\\]]+\\]:)(${JA})`);

function cleanLine(line) {
  let prev;
  do {
    prev = line;
    line = line.replace(RE_JA_SPACE_ASCII, '$1$2');
    line = line.replace(RE_ASCII_SPACE_JA, '$1$2');
  } while (line !== prev);

  line = line.replace(RE_HEADING, '$1 $2');
  line = line.replace(RE_BLOCKQUOTE, '$1 $2');
  line = line.replace(RE_LIST, '$1$2 $3');
  line = line.replace(RE_OL, '$1$2 $3');
  line = line.replace(RE_FOOTNOTE_DEF, '$1 $2');
  return line;
}

function cleanFile(path) {
  const text = fs.readFileSync(path, 'utf8');
  const lines = text.split('\n');
  let inFence = false;
  let inFrontmatter = false;
  let changed = 0;

  const result = lines.map((line, i) => {
    if (i === 0 && line.trim() === '---') {
      inFrontmatter = true;
      return line;
    }
    if (inFrontmatter) {
      if (line.trim() === '---') inFrontmatter = false;
      return line;
    }
    // Fence delimiter (top-level or blockquoted)
    if (/^[> ]*```/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;
    const next = cleanLine(line);
    if (next !== line) changed++;
    return next;
  });

  if (changed > 0) {
    fs.writeFileSync(path, result.join('\n'));
  }
  return changed;
}

const files = process.argv.slice(2);
for (const f of files) {
  const n = cleanFile(f);
  console.log(`${f}: ${n} lines modified`);
}
