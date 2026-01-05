/**
 * VFM (Vivliostyle Flavored Markdown) カスタムローダー
 * 
 * Astro Content Collections用のカスタムローダー。
 * VFMでMarkdownをHTMLに変換し、コレクションに格納する。
 */

import type { Loader, LoaderContext } from 'astro/loaders';
import { stringify } from '@vivliostyle/vfm';
import matter from 'gray-matter';
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative, basename, dirname } from 'path';

export interface VFMLoaderOptions {
  /** ベースディレクトリのパス（絶対パスまたはプロジェクトルートからの相対パス） */
  base: string;
  /** 検索するファイルのglobパターン */
  pattern?: string;
  /** 言語コード（en, ja など） */
  lang?: string;
  /** 除外するディレクトリ名の配列 */
  excludeDirs?: string[];
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
async function collectMarkdownFiles(dir: string, baseDir: string, excludeDirs: string[] = []): Promise<string[]> {
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
          console.log(`[vfm-loader] Excluding directory: ${entry.name}`);
          continue;
        }
        
        const subFiles = await collectMarkdownFiles(fullPath, baseDir, excludeDirs);
        files.push(...subFiles);
      } else if (entry.isFile() && /\.md$/i.test(entry.name)) {
        files.push(fullPath);
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
 * VFMローダーを作成
 */
export function vfmLoader(options: VFMLoaderOptions): Loader {
  const { base, lang, excludeDirs = [] } = options;

  return {
    name: `vfm-loader[${lang || 'unknown'}]`,
    
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
      const markdownFiles = await collectMarkdownFiles(baseDir, baseDir, excludeDirs);
      
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

            // markdownBodyから最初の見出し（H1またはH2）をタイトルとして抽出
            const h1Match = markdownBody.match(/^#\s+(.+)$/m);
            const h2Match = markdownBody.match(/^##\s+(.+)$/m);
            const headingTitle = h1Match ? h1Match[1].trim() : (h2Match ? h2Match[1].trim() : undefined);

            let html: string;
            try {
              html = stringify(markdownBody, {
                hardLineBreaks: false,
                disableFormatHtml: false,
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

            // HTMLのリンクを修正
            
            // 2. ./ja/index.md のような言語ディレクトリへのリンクを削除（言語スイッチャーで対応）
            html = html.replace(/<li>\s*<a href="\.\/ja\/index[^"]*"[^>]*>.*?<\/a>\s*<\/li>/gi, '');
            
            // 3. 相対リンクの.md拡張子を削除し、末尾スラッシュを追加
            // 例: ./getting-started.md -> ./getting-started/
            html = html.replace(/href="\.\/([^"]+)\.md"/g, 'href="./$1/"');
            
            // 4. ../で始まるリンク（親ディレクトリ）の処理
            // docs/ja/index.md から docs/config.md への参照を適切に変換
            // ../config.md は /en/cli/config/ になるべき（英語版のみ存在）
            if (lang === 'ja') {
              // 日本語版から親ディレクトリへのリンクは英語版を参照
              html = html.replace(/href="\.\.\/([^"]+)\.md"/g, 'href="/en/cli/$1/"');
            } else {
              // 英語版は通常の相対パス処理
              html = html.replace(/href="\.\.\/([^"]+)\.md"/g, 'href="./$1/"');
            }

            const slug = generateSlug(filePath, baseDir);
            const id = slug;

            const entry: DocEntry = {
              id,
              slug,
              body: markdownBody,
              data: {
                ...frontmatter,
                lang: lang || frontmatter.lang || 'en',
                title: frontmatter.title || headingTitle || basename(slug),
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
