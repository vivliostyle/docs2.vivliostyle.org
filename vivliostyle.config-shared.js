/**
 * vivliostyle.config-*.js 共通設定ヘルパー
 *
 * vivliostyle CLI の copyAsset 既定動作はプロジェクトルート以下の
 * 全アセット拡張子（png/jpg/svg/ttf/woff2 等）を再帰的にワークスペースへ
 * コピーするため、submodules や他プロダクトの dist 配下のファイルまで
 * EPUB に取り込まれてしまう。
 *
 * 各ビルドに必要なファイルだけを残すため、無関係なディレクトリを
 * excludes で除外する。
 */

const PRODUCTS = ['cli', 'vfm', 'themes', 'viewer', 'reference'];
const ALL_LANGUAGES = ['en', 'ja'];

/**
 * 指定したプロダクト・言語のビルドで copyAsset から除外すべきパスを返す。
 *
 * @param {{ product: 'cli'|'vfm'|'themes'|'viewer'|'reference', lang: 'en'|'ja' }} options
 */
export function getCopyAssetExcludes({ product, lang }) {
  const otherLanguages = ALL_LANGUAGES.filter((l) => l !== lang);
  const otherProducts = PRODUCTS.filter((p) => p !== product);

  return [
    // プロジェクトのソース・補助ディレクトリ（EPUBには不要）
    'submodules/**',
    'packages/**',
    'public/**',
    'src/**',
    '_investigation/**',
    // Astro/Pagefind の生成物（EPUBには不要）
    'dist/_pagefind/**',
    'dist/_astro/**',
    // 他言語版を除外
    ...otherLanguages.map((l) => `dist/${l}/**`),
    // 他プロダクトの top-level アセットディレクトリを除外
    ...otherProducts.map((p) => `dist/${p}/**`),
    // 他プロダクトの言語別 HTML を除外
    ...otherProducts.map((p) => `dist/${lang}/${p}/**`),
  ];
}
