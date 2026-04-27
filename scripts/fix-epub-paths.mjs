#!/usr/bin/env node
/**
 * 生成された EPUB の XHTML 内 root-absolute パス（`src="/foo.svg"` など）
 * を、各 XHTML ファイルの位置からの相対パスに書き換える。
 *
 * 背景：EPUB には Web サーバのような「サイトルート」の概念がないため、
 * `/foo` のような root-absolute パスはほとんどの EPUB リーダーで解決できず
 * リンク切れになる。Astro が出力する HTML はサイト内アセットを
 * root-absolute で参照しているため、EPUB に組み込まれた XHTML でも
 * その参照が残ってしまう。
 *
 * このスクリプトは vivliostyle CLI の EPUB 出力後に実行され、
 * src / href / poster / data 等の root-absolute パスを EPUB 内
 * 「dist/」をルートと見なした相対パスに変換する。
 *
 * EPUB の zip 構造制約（mimetype を先頭に store 形式で配置）も守る。
 *
 * 使い方： node scripts/fix-epub-paths.mjs [<file.epub>...]
 *   引数を省略すると public/downloads/*.epub をすべて対象にする。
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, statSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, dirname, sep } from 'node:path';
import { glob } from 'node:fs/promises';

const ROOT = new URL('..', import.meta.url).pathname;

// 引数または public/downloads/*.epub
const targets = process.argv.slice(2);
let epubs = [];
if (targets.length > 0) {
  epubs = targets.map((t) => (t.startsWith('/') ? t : join(ROOT, t)));
} else {
  const dir = join(ROOT, 'public', 'downloads');
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.epub')) epubs.push(join(dir, name));
  }
}

// XHTML 内で書き換える属性
const ATTR_RE = /\b(src|href|poster|data|srcset)="(\/[^"]*?)"/g;

function listXhtmlFiles(rootDir) {
  const out = [];
  function walk(d) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.xhtml') || entry.name.endsWith('.html')) {
        out.push(p);
      }
    }
  }
  walk(rootDir);
  return out;
}

function fixOne(epubPath) {
  const tmp = mkdtempSync(join(tmpdir(), 'epub-fix-'));
  try {
    execFileSync('unzip', ['-q', epubPath, '-d', tmp]);

    // EPUB レイアウトの基本：./EPUB/ がコンテンツルート
    const contentBase = join(tmp, 'EPUB');
    let totalRewrites = 0;
    let touchedFiles = 0;

    if (!safeStat(contentBase)?.isDirectory()) {
      console.warn(`  skip ${epubPath}: unexpected EPUB layout`);
      return;
    }
    processDir(contentBase, contentBase);

    function processDir(walkRoot, contentRoot) {
      for (const file of listXhtmlFiles(walkRoot)) {
        // この XHTML から「contentRoot（dist/相当）」までの相対プレフィクスを計算
        const upDir = relative(dirname(file), contentRoot);
        const prefix = upDir === '' ? '.' : upDir.split(sep).join('/');

        const original = readFileSync(file, 'utf8');
        let count = 0;
        const rewritten = original.replace(ATTR_RE, (_, attr, value) => {
          // value は "/something..." 形式
          // srcset は複数 URL があり得るが、root-absolute の場合は単純に同じ規則で置換
          count++;
          const rel = `${prefix}${value}`; // "../../" + "/foo.svg" -> "../..//foo.svg" → 後で `//` を `/` に
          return `${attr}="${rel.replace(/\/+/g, '/')}"`;
        });

        if (count > 0) {
          writeFileSync(file, rewritten);
          totalRewrites += count;
          touchedFiles++;
        }
      }
    }

    if (totalRewrites === 0) {
      console.log(`  ${relative(ROOT, epubPath)}: no root-absolute paths found`);
      return;
    }

    // EPUB を再パック：mimetype 先頭・store 形式、その他は deflate
    const tmpEpub = join(tmp, 'rebuilt.epub');

    // 1) mimetype を store 形式で
    execFileSync('zip', ['-X0', tmpEpub, 'mimetype'], { cwd: tmp });
    // 2) 残りを deflate で追記
    execFileSync('zip', ['-rgX', tmpEpub, '.', '-x', 'mimetype'], { cwd: tmp });

    renameSync(tmpEpub, epubPath);
    console.log(
      `  ${relative(ROOT, epubPath)}: rewrote ${totalRewrites} paths in ${touchedFiles} files`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function safeStat(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

console.log(`Fixing root-absolute paths in ${epubs.length} EPUB(s)…`);
for (const epub of epubs) {
  fixOne(epub);
}
console.log('Done.');
