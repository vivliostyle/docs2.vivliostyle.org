/**
 * vivliostyle.config-*.js 共通設定ヘルパー
 *
 * vivliostyle CLI の copyAsset 既定動作は entryContextDir 以下の
 * 全アセット拡張子（png/jpg/svg/ttf/woff2 等）を再帰的にワークスペースへ
 * コピーする。各ビルドの entryContextDir は `dist/` に設定しているため、
 * このヘルパーが返す excludes パターンも `dist/` を基準とする。
 */

const PRODUCTS = ['cli', 'vfm', 'themes', 'viewer', 'reference'];
const ALL_LANGUAGES = ['en', 'ja'];

/**
 * 指定したプロダクト・言語のビルドで copyAsset から除外すべきパスを返す。
 * パターンは entryContextDir (= `dist/`) からの相対 glob。
 *
 * @param {{ product: 'cli'|'vfm'|'themes'|'viewer'|'reference', lang: 'en'|'ja' }} options
 */
export function getCopyAssetExcludes({ product, lang }) {
  const otherLanguages = ALL_LANGUAGES.filter((l) => l !== lang);
  const otherProducts = PRODUCTS.filter((p) => p !== product);

  // 注：fast-glob の `dir/**` パターンはディレクトリのみを示し、
  // 配下のファイルにはマッチしない。ファイルまで除外するには
  // `dir/**/*` と書く必要がある。
  return [
    // Astro/Pagefind の生成物（EPUB には不要）
    '_pagefind/**/*',
    '_astro/**/*',
    // ダウンロード成果物・webpub パッケージ（自分自身を二重に含めない）
    'downloads/**/*',
    'publications/**/*',
    // sitemap や CNAME など
    'sitemap*.xml',
    'CNAME',
    // 他言語版を除外
    ...otherLanguages.map((l) => `${l}/**/*`),
    // 他プロダクトの top-level アセットディレクトリを除外
    ...otherProducts.map((p) => `${p}/**/*`),
    // 他プロダクトの言語別 HTML を除外
    ...otherProducts.map((p) => `${lang}/${p}/**/*`),
  ];
}
