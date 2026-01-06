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
// 注: config.md と api-javascript.md は英語版のみ存在するため、
// 日本語コレクションでも docs ディレクトリ全体をスキャンし、
// 日本語ファイルと API リファレンスファイルを含める
const cliDocsJa = defineCollection({
  loader: vfmLoader({
    base: 'submodules/vivliostyle-cli/docs',
    lang: 'ja',
    includePattern: /^(ja\/.+|config|api-javascript)\.md$/,
  }),
  schema: docsSchema,
});

export const collections = {
  'docs-en': docsEn,
  'docs-ja': docsJa,
  'vivliostyle-cli-en': cliDocsEn,
  'vivliostyle-cli-ja': cliDocsJa,
};
