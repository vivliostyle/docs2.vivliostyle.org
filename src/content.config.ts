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
  }),
  schema: docsSchema,
});

// CLI ドキュメント（日本語）
const cliDocsJa = defineCollection({
  loader: vfmLoader({
    base: 'submodules/vivliostyle-cli/docs/ja',
    lang: 'ja',
  }),
  schema: docsSchema,
});

export const collections = {
  'docs-en': docsEn,
  'docs-ja': docsJa,
  'cli-docs-en': cliDocsEn,
  'cli-docs-ja': cliDocsJa,
};
