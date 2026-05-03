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
import { mkdtempSync, readdirSync, statSync, readFileSync, writeFileSync, renameSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, dirname, sep, resolve, posix } from 'node:path';
import { glob } from 'node:fs/promises';

// EPUB 内に存在しない相対リンクを書き換え先とするサイト URL
const SITE_ORIGIN = 'https://docs.vivliostyle.org';

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

    // 防御線：書き換え後に「内部リンクであるべきなのに .md 拡張子が残っている
    // リンク」が一つでも見つかったら異常としてビルドを失敗させる（再発防止用
    // grep ガード）。検知パターン：
    //   - href="https?://docs.vivliostyle.org/.../*.md"
    //     → 主バグ（vfm-loader が .md を取り逃して fix-epub-paths が外部 URL
    //        として書き換えてしまった結果）
    //   - href="（http/mailto/data/# で始まらない）...*.md(#|")
    //     → 相対リンクで .md が残っている（vfm-loader の regex 漏れ）
    // GitHub 等への正当な外部リンク（config.md／README.md 等）は除外する。
    const guardOffenders = [];
    for (const file of listXhtmlFiles(contentBase)) {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const m =
          line.match(/href="https?:\/\/docs\.vivliostyle\.org\/[^"]*\.md/) ||
          line.match(/href="(?!https?:|mailto:|data:|#)[^"]*\.md(?:#|")/);
        if (m) {
          guardOffenders.push(
            `  ${relative(contentBase, file)}:${idx + 1}: ${m[0]}`,
          );
        }
      });
    }
    if (guardOffenders.length > 0) {
      console.error(
        `\n[fix-epub-paths] FAIL: .md 拡張子付きリンクが ${guardOffenders.length} 件残っています:`,
      );
      for (const o of guardOffenders.slice(0, 20)) console.error(o);
      if (guardOffenders.length > 20) {
        console.error(`  ... and ${guardOffenders.length - 20} more`);
      }
      console.error(`  in ${relative(ROOT, epubPath)}`);
      process.exit(1);
    }

    function processDir(walkRoot, contentRoot) {
      for (const file of listXhtmlFiles(walkRoot)) {
        // この XHTML から「contentRoot（dist/相当）」までの相対プレフィクスを計算
        const upDir = relative(dirname(file), contentRoot);
        const prefix = upDir === '' ? '.' : upDir.split(sep).join('/');

        const original = readFileSync(file, 'utf8');
        let count = 0;
        let pathRewrites = 0;

        // 1) root-absolute 属性パス → XHTML 位置からの相対パスに書き換え
        let rewritten = original.replace(ATTR_RE, (_, attr, value) => {
          pathRewrites++;
          const rel = `${prefix}${value}`;
          return `${attr}="${rel.replace(/\/+/g, '/')}"`;
        });
        count += pathRewrites;

        // 2) EPUB 内に存在しない相対リンクは本番サイトの URL に書き換える。
        //    vivliostyle CLI は元の `/ja/reference/...` のような site-absolute
        //    リンクを EPUB 内のパスとして相対化するが、EPUB は単一プロダクト
        //    しか含まないため別プロダクトへのリンクが解決できない。それらを
        //    https://docs.vivliostyle.org/ja/reference/... に戻すことで、
        //    EPUB リーダーが外部リンクとして開けるようにする。
        let crossProductFixes = 0;
        const fileDir = dirname(file);
        rewritten = rewritten.replace(
          /<a\b([^>]*?)\shref="((?!https?:|#|mailto:|data:)[^"]+)"([^>]*)>/gi,
          (full, before, href, after) => {
            // フラグメント抽出
            const [pathPart, fragment] = href.split('#', 2);
            // EPUB 内で実際に解決されるパスを計算
            const resolved = resolve(fileDir, pathPart);
            if (existsSync(resolved) || existsSync(`${resolved}/index.xhtml`)) {
              return full;
            }
            // 解決できない → contentRoot (= EPUB/) からの相対パスを取得し
            // SITE_ORIGIN にぶら下げる
            const fromContent = relative(contentRoot, resolved).split(sep).join('/');
            if (fromContent.startsWith('..')) {
              // EPUB の外に出る場合は対象外
              return full;
            }
            // 元の path が `/` で終わるか、拡張子なしの場合のみ末尾スラッシュを付与
            const hasExtension = /\.[a-z0-9]+$/i.test(pathPart);
            const trailing = pathPart.endsWith('/') || !hasExtension ? '/' : '';
            const newHref =
              `${SITE_ORIGIN}/${fromContent}${trailing}` +
              (fragment ? `#${fragment}` : '');
            crossProductFixes++;
            return `<a${before} href="${newHref}"${after}>`;
          },
        );
        count += crossProductFixes;

        // 3) 外部リンク (http/https) から target / rel 属性を除去。
        //    EPUB リーダー（Apple Books / Thorium 等）は target="_blank" を
        //    そのまま解釈できず、リンクが反応しない事例があるため。
        //    純粋な `<a href="https://...">` の形に統一する。
        let externalLinkFixes = 0;
        rewritten = rewritten.replace(
          /<a\b([^>]*?)\shref="(https?:\/\/[^"]+)"([^>]*)>/gi,
          (_, before, url, after) => {
            const stripped = `${before}${after}`
              .replace(/\s+target="[^"]*"/gi, '')
              .replace(/\s+rel="[^"]*"/gi, '');
            externalLinkFixes++;
            return `<a${stripped} href="${url}">`;
          },
        );
        count += externalLinkFixes;

        // 4) EPUB 用 override CSS（epub.css）を <head> に注入する。
        //    global.css の @media print ブロック内のルール
        //      .prose a[href^="http"]::after { content: " (" attr(href) ")"; ... }
        //    が EPUB リーダー（Apple Books 等）でも発火し、外部リンクの後ろに
        //    URL を本文表示してしまうのを抑止するため、同セレクタを
        //    !important で打ち消す epub.css をここで読み込ませる。
        //    PDF・Web ビルドには epub.css は読み込ませないので、それらの挙動は
        //    変わらない（PDF は引き続き URL を本文に表示する）。
        let cssInjections = 0;
        if (
          rewritten.includes('</head>') &&
          !rewritten.includes('styles/epub.css')
        ) {
          const epubCssLink = `<link rel="stylesheet" type="text/css" href="${prefix}/styles/epub.css" />`;
          rewritten = rewritten.replace('</head>', `${epubCssLink}</head>`);
          cssInjections = 1;
        }
        count += cssInjections;

        if (count > 0) {
          writeFileSync(file, rewritten);
          totalRewrites += count;
          touchedFiles++;
        }
      }
    }

    if (totalRewrites === 0) {
      console.log(`  ${relative(ROOT, epubPath)}: nothing to rewrite`);
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
