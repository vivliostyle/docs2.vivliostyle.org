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

// 修正: DataEntry 型に slug プロパティを追加
interface DataEntry<T> {
  id: string;
  slug: string; // 追加
  data: T;
  body: string;
  rendered: {
    html: string;
  };
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
      let baseDir = base.startsWith('/') 
        ? base 
        : join(config.root.pathname, base);

      // CLI日本語ドキュメント用: config/api-javascript.md がなければ英語版を読む
      if (lang === 'ja' && base.includes('vivliostyle-cli/docs/ja')) {
        const fs = await import('fs/promises');
        const enBaseDir = join(config.root.pathname, 'submodules/vivliostyle-cli/docs');
        const jaFiles = await collectMarkdownFiles(baseDir, baseDir, excludeDirs);
        // config.md
        if (!jaFiles.some(f => f.endsWith('config.md'))) {
          baseDir = enBaseDir;
        }
        // api-javascript.md
        if (!jaFiles.some(f => f.endsWith('api-javascript.md'))) {
          baseDir = enBaseDir;
        }
      }
      
      logger.info(`VFM Loader [${lang}]: Scanning ${baseDir}`);
      if (excludeDirs.length > 0) {
        logger.info(`VFM Loader [${lang}]: Excluding directories: ${excludeDirs.join(', ')}`);
      }
      
      // ディレクトリの存在確認
      try {
        await stat(baseDir);
      } catch {
        logger.warn(`VFM Loader [${lang}]: Base directory does not exist: ${baseDir}`);
        return;
      }
      
      // Markdownファイルを収集
      const markdownFiles = await collectMarkdownFiles(baseDir, baseDir, excludeDirs);
      
      logger.info(`VFM Loader [${lang}]: Found ${markdownFiles.length} markdown files`);
      
      // 各ファイルを処理
      for (const filePath of markdownFiles) {
        try {
          const content = await readFile(filePath, 'utf-8');
          
          // frontmatterを抽出
          const { data: frontmatter, content: markdownBody } = matter(content);
          
          // VFMでHTMLに変換
          let html: string;
          try {
            html = stringify(markdownBody, {
              hardLineBreaks: false,
              disableFormatHtml: false,
            });
          } catch (stringifyError) {
            logger.error(
              `VFM Loader: Failed to stringify VFM for ${filePath}: ${
                stringifyError instanceof Error ? stringifyError.message : String(stringifyError)
              }`,
            );
            // このファイルの処理をスキップし、他のファイルの処理を継続
            continue;
          }
          
          // スラッグを生成
          const slug = generateSlug(filePath, baseDir);
          
          // IDはスラッグそのものを使用（コレクションで言語を区別）
          const id = slug;
          
          // デバッグ情報
          logger.info(`[${lang}] Processing: ${filePath} -> slug: ${slug}, id: ${id}`);
          
          // エントリを作成
          const entry: DocEntry = {
            id,
            slug,
            body: markdownBody,
            data: {
              ...frontmatter,
              lang: lang || frontmatter.lang || 'en',
              title: frontmatter.title || basename(slug),
            },
            rendered: {
              html,
            },
            filePath: relative(config.root.pathname, filePath),
          };
          
          // ストアに格納
          store.set({
            id: entry.id,
            slug: entry.slug,
            data: entry.data,
            body: entry.body,
            rendered: entry.rendered,
          });
          
          logger.debug(`VFM Loader: Processed ${id}`);
        } catch (error) {
          logger.error(`VFM Loader: Failed to process ${filePath}: ${error}`);
        }
      }
      
      logger.info(`VFM Loader: Completed loading ${markdownFiles.length} documents`);
      
      // 修正: context.store.on の代替処理
      // Markdown 内のリンクを変換する処理を直接適用
      const transformLinks = (content: string): string => {
        return content.replace(/\]\(([^)]+\.md)\)/g, (match, p1) => {
          const newPath = p1.replace(/\.md$/, '');
          return match.replace(p1, newPath);
        });
      };

      // Markdown ファイルの内容を変換
      for (const filePath of markdownFiles) {
        try {
          const content = await readFile(filePath, 'utf-8');
          const transformedContent = transformLinks(content);
          // 変換後の内容を使用して処理を続行
          const { data: frontmatter, content: markdownBody } = matter(transformedContent);

          // VFMでHTMLに変換
          let html: string;
          try {
            html = stringify(markdownBody, {
              hardLineBreaks: false,
              disableFormatHtml: false,
            });
          } catch (stringifyError) {
            logger.error(
              `VFM Loader: Failed to stringify VFM for ${filePath}: ${
                stringifyError instanceof Error ? stringifyError.message : String(stringifyError)
              }`,
            );
            continue;
          }

          // スラッグを生成
          const slug = generateSlug(filePath, baseDir);

          // IDはスラッグそのものを使用（コレクションで言語を区別）
          const id = slug;

          // エントリを作成
          const entry: DocEntry = {
            id,
            slug,
            body: markdownBody,
            data: {
              ...frontmatter,
              lang: lang || frontmatter.lang || 'en',
              title: frontmatter.title || basename(slug),
            },
            rendered: {
              html,
            },
            filePath: relative(config.root.pathname, filePath),
          };

          // ストアに格納
          store.set({
            id: entry.id,
            slug: entry.slug,
            data: entry.data,
            body: entry.body,
            rendered: entry.rendered,
          });
        } catch (error) {
          logger.error(`VFM Loader: Failed to process ${filePath}: ${error}`);
        }
      }

      // 特定のファイルを明示的に処理
      const additionalFiles = [
        join(config.root.pathname, 'submodules/vivliostyle-cli/docs/config.md'),
        join(config.root.pathname, 'submodules/vivliostyle-cli/docs/api-javascript.md'),
      ];
      logger.info(`[${lang}] Updated additional files paths: ${additionalFiles.join(', ')}`);
      for (const filePath of additionalFiles) {
        try {
          const content = await readFile(filePath, 'utf-8');
          const { data: frontmatter, content: markdownBody } = matter(content);
          const slug = generateSlug(filePath, baseDir);
          logger.info(`[${lang}] Additional file processed: ${filePath} -> slug: ${slug}`);
        } catch (error) {
          logger.error(`[${lang}] Failed to process additional file: ${filePath}: ${error}`);
        }
      }
    },
  };
}

export default vfmLoader;
