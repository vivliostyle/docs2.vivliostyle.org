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
  doctocToc: z.string().optional(),
});

// 英語ドキュメントコレクション
const docsEn = defineCollection({
  loader: vfmLoader({
    base: 'content/en',
    lang: 'en',
    collectionName: 'docs-en',
  }),
  schema: docsSchema,
});

// 日本語ドキュメントコレクション
const docsJa = defineCollection({
  loader: vfmLoader({
    base: 'content/ja',
    lang: 'ja',
    collectionName: 'docs-ja',
  }),
  schema: docsSchema,
});

// CLI ドキュメント（英語）
const cliDocsEn = defineCollection({
  loader: vfmLoader({
    base: 'submodules/vivliostyle-cli/docs',
    lang: 'en',
    excludeDirs: ['ja'], // 日本語ディレクトリを除外
    collectionName: 'vivliostyle-cli-en',
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
    collectionName: 'vivliostyle-cli-ja',
  }),
  schema: docsSchema,
});

// Themes ドキュメント（英語）
const themesDocsEn = defineCollection({
  loader: vfmLoader({
    base: 'submodules/themes/docs',
    lang: 'en',
    excludeDirs: ['ja'], // 日本語ディレクトリを除外
    collectionName: 'vivliostyle-themes-en',
  }),
  schema: docsSchema,
});

// Themes ドキュメント（日本語）
const themesDocsJa = defineCollection({
  loader: vfmLoader({
    base: 'submodules/themes/docs/ja',
    lang: 'ja',
    collectionName: 'vivliostyle-themes-ja',
  }),
  schema: docsSchema,
});

// VFM ドキュメント（英語）
const vfmDocsEn = defineCollection({
  loader: vfmLoader({
    base: 'submodules/vfm/docs',
    lang: 'en',
    excludeDirs: ['ja'], // 日本語ディレクトリを除外
    collectionName: 'vivliostyle-vfm-en',
  }),
  schema: docsSchema,
});

// VFM ドキュメント（日本語）
const vfmDocsJa = defineCollection({
  loader: vfmLoader({
    base: 'submodules/vfm/docs/ja',
    lang: 'ja',
    collectionName: 'vivliostyle-vfm-ja',
  }),
  schema: docsSchema,
});

// Vivliostyle.js ドキュメント（英語）
const viewerDocsEn = defineCollection({
  loader: vfmLoader({
    base: 'submodules/vivliostyle.js/docs',
    lang: 'en',
    excludeDirs: ['ja'], // 日本語ディレクトリを除外
    collectionName: 'vivliostyle-viewer-en',
  }),
  schema: docsSchema,
});

// Vivliostyle.js ドキュメント（日本語）
const viewerDocsJa = defineCollection({
  loader: vfmLoader({
    base: 'submodules/vivliostyle.js/docs/ja',
    lang: 'ja',
    collectionName: 'vivliostyle-viewer-ja',
  }),
  schema: docsSchema,
});

export const collections = {
  'docs-en': docsEn,
  'docs-ja': docsJa,
  'vivliostyle-cli-en': cliDocsEn,
  'vivliostyle-cli-ja': cliDocsJa,
  'vivliostyle-themes-en': themesDocsEn,
  'vivliostyle-themes-ja': themesDocsJa,
  'vivliostyle-vfm-en': vfmDocsEn,
  'vivliostyle-vfm-ja': vfmDocsJa,
  'vivliostyle-viewer-en': viewerDocsEn,
  'vivliostyle-viewer-ja': viewerDocsJa,
};
