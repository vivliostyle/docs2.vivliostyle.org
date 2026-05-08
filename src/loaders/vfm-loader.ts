/**
 * VFM (Vivliostyle Flavored Markdown) カスタムローダー
 * 
 * Astro Content Collections用のカスタムローダー。
 * VFMでMarkdownをHTMLに変換し、コレクションに格納する。
 */

import type { Loader, LoaderContext } from 'astro/loaders';
import { stringify } from '@vivliostyle/vfm';
import GithubSlugger from 'github-slugger';
import matter from 'gray-matter';
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative, basename, dirname } from 'path';

/**
 * HTML 内のフラグメントリンク（`<a href="#...">`）が、
 * 本文中の見出しに付与された ID と大文字小文字や括弧などで
 * 食い違っている場合に、github-slugger 互換の正規化を介して
 * 解決し、書き換える。
 *
 * 例：[Web出版物](#Web出版物（複数HTML文書）) と書かれた markdown が
 * `id="web出版物複数html文書"` の見出しに対応する場合、
 * href を `#web出版物複数html文書` に書き換える。
 */
function rewriteFragmentLinks(html: string): string {
  // 既存の ID を収集
  const existingIds = new Set<string>();
  const idMatches = html.matchAll(/\sid="([^"]+)"/g);
  for (const m of idMatches) {
    existingIds.add(m[1]);
  }
  if (existingIds.size === 0) return html;

  return html.replace(
    /href="#([^"]+)"/g,
    (full, encodedFragment: string) => {
      // すでに対応 ID が存在する場合はそのまま
      if (existingIds.has(encodedFragment)) return full;

      // URL デコードを試みる（失敗しても続行）
      let decoded: string;
      try {
        decoded = decodeURIComponent(encodedFragment);
      } catch {
        decoded = encodedFragment;
      }
      if (existingIds.has(decoded)) {
        return `href="#${decoded}"`;
      }

      // github-slugger で正規化して見出し ID と突合
      const slugger = new GithubSlugger();
      const candidate = slugger.slug(decoded);
      if (existingIds.has(candidate)) {
        return `href="#${candidate}"`;
      }
      // 見つからなければ元のまま（外部 URL や無関係なフラグメントの可能性）
      return full;
    },
  );
}

export interface RewriteRelativeLinksOptions {
  lang?: string;
  collectionName?: string;
  /**
   * ソース MD が index ページ（index.md）か否か。
   * Astro はすべてのページを `dist/{lang}/{product}/{slug}/index.html` に
   * flat 展開するため、非 index ページから兄弟ページへの相対リンクは
   * `./X/` ではなく `../X/` を生成する必要がある（前者だと
   * `/{lang}/{product}/{slug}/X/` という存在しない URL に解決されてしまう）。
   * 既定は false（非 index）。
   */
  isIndexPage?: boolean;
}

/**
 * VFM が生成した HTML に対して、相対リンクを Astro/EPUB ルーティングに合うよう
 * 書き換える。各正規表現は `./X.md`／`./X.md#anchor` のどちらにもマッチするよう
 * 末尾フラグメントを optional capture でつかみ、新 URL に引き継ぐ。
 * 兄弟参照については `.md` の有無を問わず統一的に処理する。
 *
 * 純粋関数（同じ入力に対して同じ出力）にしてあるのは Vitest 等から
 * 単体テストできるようにするため。
 */
export function rewriteRelativeLinks(
  html: string,
  options: RewriteRelativeLinksOptions = {},
): string {
  const { lang, collectionName, isIndexPage = false } = options;

  // 1. ./ja/index.md のような言語ディレクトリへのリンクを削除（言語スイッチャーで対応）
  html = html.replace(/<li>\s*<a href="\.\/ja\/index[^"]*"[^>]*>.*?<\/a>\s*<\/li>/gi, '');

  // 1.5. 空の li 要素を削除（Markdown の構造による空箇条書き項目を削除）
  html = html.replace(/<li>\s*<\/li>/gi, '');

  // 2. Themes Contributing 専用: ./docs/X.md(#a)? -> /[lang]/themes/X/(#a)?
  if (collectionName?.includes('themes-contributing')) {
    html = html.replace(
      /href="\.\/docs\/([^"#]+?)\.md(#[^"]*)?"/g,
      (_m, p: string, frag = '') => `href="/${lang}/themes/${p}/${frag}"`,
    );
  }

  // 3. vivliostyle.js docs（viewer / reference 配下）のクロスプロダクト
  // 参照を補正する。upstream では vivliostyle-viewer.md と
  // supported-css-features.md / api.md / contribution-guide.md は
  // 同じ docs/ 内の sibling だが、本サイトでは前者を /viewer/、
  // 後者群を /reference/ に振り分けているため、`./X.md` 形式の
  // 相対リンクを正しい絶対パスに書き換える。
  if (
    collectionName?.startsWith('vivliostyle-viewer-') ||
    collectionName?.startsWith('vivliostyle-reference-')
  ) {
    const referenceFiles = ['api', 'supported-css-features', 'contribution-guide'];
    for (const f of referenceFiles) {
      const re = new RegExp(`href="\\.\\/${f}\\.md(#[^"]*)?"`, 'g');
      html = html.replace(re, (_m, frag = '') => `href="/${lang}/reference/${f}/${frag}"`);
    }
    // Reference → Viewer の逆参照
    html = html.replace(
      /href="\.\/vivliostyle-viewer\.md(#[^"]*)?"/g,
      (_m, frag = '') => `href="/${lang}/viewer/vivliostyle-viewer/${frag}"`,
    );
  }

  // 4. 同一ディレクトリの兄弟参照 ./X(.md)?(#a)? を書き換え。
  //    - パスの文字クラスから '.' '/' '#' を除外することで、画像（./foo.png 等）や
  //      サブディレクトリ（./docs/spec.md は themes-contributing 特例で先に処理済）
  //      には誤マッチさせない。
  //    - .md の有無を `(?:\.md)?` で吸収するので、ソース MD が `./X.md` でも `./X` でも
  //      同じ出力になる。
  //    - 出力プレフィクスは isIndexPage で分岐：
  //        index ページ（URL が /lang/product/）→ ./X/
  //        非 index ページ（URL が /lang/product/{slug}/）→ ../X/
  const siblingPrefix = isIndexPage ? './' : '../';
  html = html.replace(
    /href="\.\/([^"#./]+)(?:\.md)?(#[^"]*)?"/g,
    (_m, p: string, frag = '') => `href="${siblingPrefix}${p}/${frag}"`,
  );

  // Awesome Vivliostyle: CONTRIBUTING.md を GitHub にリンク
  if (collectionName?.includes('awesome-vivliostyle')) {
    html = html.replace(
      /href="CONTRIBUTING\.md"/g,
      'href="https://github.com/vivliostyle/awesome-vivliostyle/blob/master/CONTRIBUTING.md"',
    );
  }

  // Themes Contributing: CODE_OF_CONDUCT.md を GitHub にリンク
  // upstream の submodules/themes/CONTRIBUTING.md:16 が
  // `[Code of Conduct](CODE_OF_CONDUCT.md)` と `./` プレフィックス無しの
  // 相対リンクを使っているため、汎用 ./X.md 規則では拾えない。
  if (collectionName?.includes('themes-contributing')) {
    html = html.replace(
      /href="CODE_OF_CONDUCT\.md"/g,
      'href="https://github.com/vivliostyle/themes/blob/main/CODE_OF_CONDUCT.md"',
    );
  }

  // 5. ../X.md(#a)? の処理（言語コンテキストを維持）
  if (lang === 'ja') {
    html = html.replace(
      /href="\.\.\/([^"#]+?)\.md(#[^"]*)?"/g,
      (_m, p: string, frag = '') => `href="/ja/cli/${p}/${frag}"`,
    );
  } else {
    html = html.replace(
      /href="\.\.\/([^"#]+?)\.md(#[^"]*)?"/g,
      (_m, p: string, frag = '') => `href="../${p}/${frag}"`,
    );
  }

  return html;
}

export interface VFMLoaderOptions {
  /** ベースディレクトリのパス（絶対パスまたはプロジェクトルートからの相対パス） */
  base: string;
  /** 検索するファイルのglobパターン */
  pattern?: string;
  /** 言語コード（en, ja など） */
  lang?: string;
  /** 除外するディレクトリ名の配列 */
  excludeDirs?: string[];
  /** 含めるファイルパターン（正規表現、ベースディレクトリからの相対パスにマッチ） */
  includePattern?: RegExp;
  /** コレクション名（画像パス変換に使用。例: vivliostyle-cli-en → cli） */
  collectionName?: string;
}

interface DocEntry {
  id: string;
  slug: string;
  body: string;
  data: Record<string, unknown>;
  rendered: {
    html: string;
  };
  filePath: string;
}

/**
 * ディレクトリを再帰的に走査してMarkdownファイルを収集
 */
async function collectMarkdownFiles(dir: string, baseDir: string, excludeDirs: string[] = [], includePattern?: RegExp): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        // 除外ディレクトリかチェック
        const shouldExclude = entry.name.startsWith('.') || 
                              entry.name === 'node_modules' || 
                              excludeDirs.includes(entry.name);
        
        if (shouldExclude) {
          // ログはloadメソッド内でまとめて出力されるため、ここでは出力しない
          continue;
        }
        
        const subFiles = await collectMarkdownFiles(fullPath, baseDir, excludeDirs, includePattern);
        files.push(...subFiles);
      } else if (entry.isFile() && /\.md$/i.test(entry.name)) {
        // includePatternが指定されている場合はフィルタリング
        if (includePattern) {
          let relativePath = relative(baseDir, fullPath);
          // Windows対応: バックスラッシュをスラッシュに変換
          relativePath = relativePath.replace(/\\/g, '/');
          const matches = includePattern.test(relativePath);
          if (matches) {
            files.push(fullPath);
          }
        } else {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error);
    // エラー時は警告のみ出して処理継続（throwしない）
    return files;
  }
  return files;
}

/**
 * ファイルパスからスラッグを生成
 */
function generateSlug(filePath: string, baseDir: string): string {
  let relativePath = relative(baseDir, filePath);
  
  // .md 拡張子を除去
  relativePath = relativePath.replace(/\.md$/i, '');
  
  // index ファイルの場合はディレクトリ名をスラッグに
  if (basename(relativePath) === 'index') {
    const dir = dirname(relativePath);
    relativePath = (dir === '.' || dir === '') ? 'index' : dir;
  }
  
  // Windows対応: バックスラッシュをスラッシュに
  relativePath = relativePath.replace(/\\/g, '/');
  
  // 先頭のスラッシュを除去
  relativePath = relativePath.replace(/^\/+/, '');
  
  return relativePath || 'index';
}

/**
 * 日本語コンテンツの和欧境界の半角スペースを除去する。
 *
 * モダンブラウザは和欧間隔を自動処理するため、ソース上で半角スペースを
 * 入れると二重に間隔が空く。submodule 由来の ja コンテンツも含めて
 * 一律で除去するため、HTML 化した直後にここで処理する。
 *
 * `<pre>`、`<code>`、`<style>`、`<script>`、`<kbd>` の中身はコード扱いで
 * 保護する（コード例の文字列を改変しないため）。
 */
const PROSE_PROTECTED_TAGS = ['pre', 'code', 'style', 'script', 'kbd'];
const PROSE_PROTECTED_REGEX = new RegExp(
  `<(${PROSE_PROTECTED_TAGS.join('|')})\\b[^>]*>[\\s\\S]*?</\\1>`,
  'gi',
);
const PROSE_JA_RANGE = '\\u3040-\\u30FF\\u4E00-\\u9FFF\\u3000-\\u303F\\uFF00-\\uFFEF';
const PROSE_RE_JA_SPACE_ASCII = new RegExp(`([${PROSE_JA_RANGE}]) ([!-~])`, 'g');
const PROSE_RE_ASCII_SPACE_JA = new RegExp(`([!-~]) ([${PROSE_JA_RANGE}])`, 'g');

function cleanJaeuSpacesInHtml(html: string): string {
  if (!html) return html;
  // 保護対象タグの中身をセンチネルで隠す
  const SENTINEL = '\u0000';
  const protectedSegments: string[] = [];
  const masked = html.replace(PROSE_PROTECTED_REGEX, (match) => {
    protectedSegments.push(match);
    return SENTINEL;
  });

  // 残った prose 部分の和欧境界スペースを除去（連続パターン対応で fixed-point）
  let cleaned = masked;
  let prev: string;
  do {
    prev = cleaned;
    cleaned = cleaned.replace(PROSE_RE_JA_SPACE_ASCII, '$1$2');
    cleaned = cleaned.replace(PROSE_RE_ASCII_SPACE_JA, '$1$2');
  } while (cleaned !== prev);

  // 保護対象を復元
  let i = 0;
  return cleaned.replace(new RegExp(SENTINEL, 'g'), () => protectedSegments[i++]);
}

/**
 * VFMローダーを作成
 */
export function vfmLoader(options: VFMLoaderOptions): Loader {
  const { base, lang, excludeDirs = [], includePattern, collectionName } = options;

  return {
    name: `vfm-loader[${collectionName || lang || 'unknown'}]`,
    
    async load(context: LoaderContext): Promise<void> {
      const { store, logger, config } = context;
      
      // ベースディレクトリを解決
      const baseDir = base.startsWith('/') 
        ? base 
        : join(config.root.pathname, base);
      
      logger.info(`VFM Loader [${lang}]: Scanning ${baseDir}`);
      if (excludeDirs.length > 0) {
        logger.info(`VFM Loader [${lang}]: Excluding directories: ${excludeDirs.join(', ')}`);
      }
      
      // ベースディレクトリの存在確認
      try {
        await stat(baseDir);
      } catch (error) {
        logger.error(`VFM Loader [${lang}]: Failed to access base directory: ${baseDir}. Error: ${error}`);
        return;
      }
      
      // Markdownファイルを収集
      const markdownFiles = await collectMarkdownFiles(baseDir, baseDir, excludeDirs, includePattern);
      
      logger.info(`VFM Loader [${lang}]: Found ${markdownFiles.length} markdown files`);
      logger.debug(`VFM Loader [${lang}]: Debugging load method at baseDir: ${baseDir}`);
      logger.debug(`VFM Loader [${lang}]: Markdown files collected: ${markdownFiles.length}`);
      
      try {
        // 各ファイルを同期的に処理
        for (const filePath of markdownFiles) {
          logger.debug(`VFM Loader [${lang}]: Starting processing for file: ${filePath}`);
          try {
            const content = await readFile(filePath, 'utf-8');
            logger.debug(`VFM Loader [${lang}]: Successfully read file: ${filePath}`);

            const { data: frontmatter, content: markdownBody } = matter(content);
            logger.debug(`VFM Loader [${lang}]: Extracted frontmatter and markdown body for file: ${filePath}`);

            // doctoc生成TOCを抽出（<!-- START doctoc generated TOC ... --> ... <!-- END doctoc generated TOC --> の部分）
            let extractedToc: string | undefined;
            let processedMarkdownBody = markdownBody;
            const doctocMatch = markdownBody.match(/<!-- START doctoc generated TOC[^\n]*-->\s*\n([\s\S]*?)\n<!-- END doctoc generated TOC[^\n]*-->/);
            if (doctocMatch) {
              extractedToc = doctocMatch[1].trim();
              // TOC部分をMarkdownから削除
              processedMarkdownBody = markdownBody.replace(/<!-- START doctoc generated TOC[^\n]*-->\s*\n[\s\S]*?\n<!-- END doctoc generated TOC[^\n]*-->\s*\n?/, '');
              if (collectionName?.includes('awesome-vivliostyle')) {
                processedMarkdownBody = processedMarkdownBody.replace(/##\s+Table of Contents\s*\n/, '');
              }
            } else {
              // doctocマーカーがない場合、「## 目次」または「## Table of Contents」セクションを探す
              // api.mdの場合は見出しだけ削除してリストは残す、それ以外は従来通り
              const fileBaseName = basename(filePath);
              const manualTocMatch = markdownBody.match(/##\s+(目次|Table of Contents|Contents)\s*\n([\s\S]*?)(?=\n##\s)/m);
              
              if (manualTocMatch) {
                if (fileBaseName === 'api.md') {
                  // api.mdの場合：見出しだけ削除、リストはそのまま残す
                  processedMarkdownBody = markdownBody.replace(/##\s+(目次|Table of Contents|Contents)\s*\n/, '');
                  // extractedTocには何も入れない（リストはMarkdown本体に残る）
                } else {
                  // それ以外：従来通り、TOCを抽出してMarkdownから削除
                  const tocContent = manualTocMatch[2];
                  const listMatch = tocContent.match(/^(?:.*\n)*?(- .*(?:\n(?:  - .*|- .*))*)/m);
                  if (listMatch) {
                    extractedToc = listMatch[1].trim();
                  }
                  processedMarkdownBody = markdownBody.replace(/##\s+(目次|Table of Contents|Contents)\s*\n[\s\S]*?(?=\n##\s)/m, '');
                }
              }
            }

            // markdownBodyから最初の見出し（H1またはH2）をタイトルとして抽出
            const h1Match = processedMarkdownBody.match(/^#\s+(.+)$/m);
            const h2Match = processedMarkdownBody.match(/^##\s+(.+)$/m);
            const headingTitle = h1Match ? h1Match[1].trim() : (h2Match ? h2Match[1].trim() : undefined);

            let html: string;
            try {
              // partial: true で `<html>` / `<head>` / `<body>` ラッパーを
              // 出力しないようにする。我々は DocsLayout 内の `<article>`
              // にコンテンツを注入するため、フルドキュメントを set:html で
              // 埋め込むと `<meta charset>` や `<title>` が body 内に出て
              // しまい、HTML 仕様上不正な構造（および EPUB ビルド成果物
              // の警告原因）になっていた。
              html = stringify(processedMarkdownBody, {
                hardLineBreaks: false,
                disableFormatHtml: false,
                partial: true,
              });
              logger.debug(`VFM Loader [${lang}]: Successfully converted markdown to HTML for file: ${filePath}`);
            } catch (stringifyError) {
              logger.error(
                `VFM Loader [${lang}]: Failed to stringify VFM for ${filePath}: ${
                  stringifyError instanceof Error ? stringifyError.message : String(stringifyError)
                }`,
              );
              continue;
            }

            // doctoc TOCをHTMLに変換（存在する場合）
            let extractedTocHtml: string | undefined;
            if (extractedToc) {
              try {
                extractedTocHtml = stringify(extractedToc, {
                  hardLineBreaks: false,
                  disableFormatHtml: false,
                });
                if (collectionName?.includes('awesome-vivliostyle')) {
                  extractedTocHtml = extractedTocHtml
                    .replace(/>PrintCSS sites</g, '>Print CSS sites</')
                    .replace(/href="#printcss-sites"/g, 'href="#print-css-sites"');
                }
              } catch (tocError) {
                logger.warn(`VFM Loader [${lang}]: Failed to convert doctoc TOC to HTML: ${tocError}`);
              }
            }

            // api.mdの場合、「## 目次」または「## Table of Contents」の見出しだけを削除
            // (リスト構造はそのまま残す) - すでにMarkdown段階で処理済みなので、この処理は不要
            
            // HTMLのリンクと画像パスを修正
            
            // 1. 画像パスを修正: ../assets/ -> /{product}/assets/, ./image.svg -> /{product}/assets/image.svg
            // すべてのsubmoduleドキュメントで docs/assets に画像を格納する前提
            // collectionNameから製品名を抽出して適切なパスに変換
            // 例: vivliostyle-cli-en → /cli/assets/, vivliostyle-themes-ja → /themes/assets/
            if (collectionName && collectionName.startsWith('vivliostyle-')) {
              const productMatch = collectionName.match(/^vivliostyle-([^-]+)/);
              if (productMatch) {
                const productName = productMatch[1]; // cli, themes, vfm など
                html = html.replace(/src="\.\.\/assets\//g, `src="/${productName}/assets/`);
                html = html.replace(/src="\.\/assets\//g, `src="/${productName}/assets/`);
                // vivliostyle.js (viewer) の場合: ../../assets/ -> /viewer/assets/
                html = html.replace(/src="\.\.\/\.\.\/assets\//g, `src="/${productName}/assets/`);
                // VFMなど、docsディレクトリ直下に画像がある場合も対応
                // ./image.svg -> /vfm/assets/image.svg
                html = html.replace(/src="\.\/([^/]+\.(svg|png|jpg|jpeg|gif|webp))"/g, `src="/${productName}/assets/$1"`);
              }
            }
            
            // 2. href 系の相対リンク書き換えを一括適用（rewriteRelativeLinks 内で
            // .md → / 変換、cross-product 補正、親ディレクトリ参照、upstream タイポ
            // 補正、CONTRIBUTING.md などをまとめて処理する。各 regex は `.md#anchor`
            // 形式にもマッチし、フラグメントを保持する）。
            // 兄弟参照 ./X(.md)? の出力プレフィクスは「ソース MD が index.md か否か」で
            // 分岐するため、ファイル名から isIndexPage を計算して渡す。
            const isIndexPage = basename(filePath, '.md') === 'index';
            html = rewriteRelativeLinks(html, { lang, collectionName, isIndexPage });

            // 3. フラグメントリンクの正規化：見出しの自動 slug と
            // markdown 中のリンク先（原文ママの大文字・括弧入り）の
            // 食い違いを解消する。
            html = rewriteFragmentLinks(html);

            // 6. 日本語コンテンツの和欧境界半角スペースを除去（submodule も含む全 ja コレクション対象）
            //    モダンブラウザの自動和欧間隔と二重にならないようにする
            if (lang === 'ja') {
              html = cleanJaeuSpacesInHtml(html);
              if (extractedTocHtml) {
                extractedTocHtml = cleanJaeuSpacesInHtml(extractedTocHtml);
              }
            }

            // HTMLから見出しを抽出（h2, h3）
            const headings: Array<{ depth: number; slug: string; text: string }> = [];
            const headingMatches = html.matchAll(/<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi);
            for (const match of headingMatches) {
              const depth = parseInt(match[1], 10); // 2 or 3
              const slug = match[2];
              const text = match[3].trim(); // すでにHTMLなのでそのまま使用
              
              if (slug) {
                headings.push({ depth, slug, text });
              }
            }

            const slug = generateSlug(filePath, baseDir);
            const id = slug;

            // ja の frontmatter 文字列値（title / description）も和欧スペースを除去
            // サイドバーやパンくずなど、Markdown 本文を経由しない箇所で使われるため
            const cleanedFrontmatter =
              lang === 'ja'
                ? Object.fromEntries(
                    Object.entries(frontmatter).map(([key, value]) => [
                      key,
                      typeof value === 'string' ? cleanJaeuSpacesInHtml(value) : value,
                    ]),
                  )
                : frontmatter;
            const cleanedTitle =
              lang === 'ja'
                ? cleanJaeuSpacesInHtml(frontmatter.title || headingTitle || basename(slug))
                : frontmatter.title || headingTitle || basename(slug);

            const entry: DocEntry = {
              id,
              slug,
              body: processedMarkdownBody,
              data: {
                ...cleanedFrontmatter,
                lang: lang || frontmatter.lang || 'en',
                title: cleanedTitle,
                extractedToc: extractedTocHtml, // 抽出したTOCをデータに追加
                headings, // 見出しデータを追加
              },
              rendered: {
                html,
              },
              filePath: relative(config.root.pathname, filePath),
            };

            // データ検証
            if (!entry.id || !entry.slug || !entry.rendered.html) {
              logger.error(`VFM Loader [${lang}]: Invalid entry data for file: ${filePath}`);
              throw new Error(`Invalid entry data: ${JSON.stringify(entry)}`);
            }

            store.set({
              id: entry.id,
              data: entry.data,
              body: entry.body,
              rendered: entry.rendered,
            });


            logger.debug(`VFM Loader [${lang}]: Successfully stored entry for file: ${filePath}`);
          } catch (error) {
            logger.error(`VFM Loader [${lang}]: Failed to process ${filePath}: ${error}`);
          }
        }
      } finally {
        logger.info(`VFM Loader [${lang}]: Completed loading ${markdownFiles.length} documents`);
      }
    },
  };
}

export default vfmLoader;
