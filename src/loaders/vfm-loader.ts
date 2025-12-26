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
async function collectMarkdownFiles(dir: string, baseDir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // node_modules, .git などは除外
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await collectMarkdownFiles(fullPath, baseDir);
          files.push(...subFiles);
        }
      } else if (entry.isFile() && /\.md$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error);
    throw error;
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
  const { base, lang } = options;

  return {
    name: 'vfm-loader',
    
    async load(context: LoaderContext): Promise<void> {
      const { store, logger, config } = context;
      
      // ベースディレクトリを解決
      const baseDir = base.startsWith('/') 
        ? base 
        : join(config.root.pathname, base);
      
      logger.info(`VFM Loader: Scanning ${baseDir}`);
      
      // ディレクトリの存在確認
      try {
        await stat(baseDir);
      } catch {
        logger.warn(`VFM Loader: Base directory does not exist: ${baseDir}`);
        return;
      }
      
      // Markdownファイルを収集
      const markdownFiles = await collectMarkdownFiles(baseDir, baseDir);
      
      logger.info(`VFM Loader: Found ${markdownFiles.length} markdown files`);
      
      // 各ファイルを処理
      for (const filePath of markdownFiles) {
        try {
          const content = await readFile(filePath, 'utf-8');
          
          // frontmatterを抽出
          const { data: frontmatter, content: markdownBody } = matter(content);
          
          // VFMでHTMLに変換
          const html = stringify(markdownBody, {
            hardLineBreaks: false,
            disableFormatHtml: false,
          });
          
          // スラッグを生成
          const slug = generateSlug(filePath, baseDir);
          
          // IDを生成（言語プレフィックス付き）
          const id = lang ? `${lang}/${slug}` : slug;
          
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
            data: entry.data,
            body: entry.body,
            rendered: entry.rendered,
            filePath: entry.filePath,
          });
          
          logger.debug(`VFM Loader: Processed ${id}`);
        } catch (error) {
          logger.error(`VFM Loader: Failed to process ${filePath}: ${error}`);
        }
      }
      
      logger.info(`VFM Loader: Completed loading ${markdownFiles.length} documents`);
    },
  };
}

export default vfmLoader;
