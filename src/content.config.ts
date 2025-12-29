/**
 * Content Collections 設定
 * 
 * VFMローダーを使用してMarkdownドキュメントを管理
 */

import { defineCollection, z } from 'astro:content';
import { vfmLoader } from './loaders/vfm-loader';

// ドキュメントのスキーマ定義
const docsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  lang: z.string().default('en'),
  order: z.number().optional(),
  draft: z.boolean().optional().default(false),
});

// 英語ドキュメントコレクション
const docsEn = defineCollection({
  loader: vfmLoader({
    base: 'content/en',
    lang: 'en',
  }),
  schema: docsSchema,
});

// 日本語ドキュメントコレクション
const docsJa = defineCollection({
  loader: vfmLoader({
    base: 'content/ja',
    lang: 'ja',
  }),
  schema: docsSchema,
});

// CLI ドキュメント（英語）
const cliDocsEn = defineCollection({
  loader: vfmLoader({
    base: 'submodules/vivliostyle-cli/docs',
    lang: 'en',
    excludeDirs: ['ja'], // 日本語ディレクトリを除外
  }),
  schema: docsSchema,
});

// CLI ドキュメント（日本語）
const cliDocsJa = defineCollection({
  loader: async (ctx) => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const jaBase = 'submodules/vivliostyle-cli/docs/ja';
    const enBase = 'submodules/vivliostyle-cli/docs';
    const slug = ctx.slug;
    let filePath = path.join(ctx.config.root.pathname, jaBase, `${slug}.md`);
    let exists = false;
    try {
      await fs.access(filePath);
      exists = true;
    } catch {}
    if (!exists && (slug === 'config' || slug === 'api-javascript')) {
      filePath = path.join(ctx.config.root.pathname, enBase, `${slug}.md`);
    }
    return vfmLoader({ base: exists ? jaBase : enBase, lang: 'ja' }).load({
      ...ctx,
      filePath,
    });
  },
  schema: docsSchema,
});

export const collections = {
  'docs-en': docsEn,
  'docs-ja': docsJa,
  'cli-docs-en': cliDocsEn,
  'cli-docs-ja': cliDocsJa,
};
