/**
 * vivliostyle.config-*.js 共通設定ヘルパー
 *
 * vivliostyle CLI の copyAsset 既定動作は entryContextDir 以下の
 * 全アセット拡張子（png/jpg/svg/ttf/woff2 等）を再帰的にワークスペースへ
 * コピーする。各ビルドの entryContextDir は `dist/` に設定しているため、
 * このヘルパーが返す excludes パターンも `dist/` を基準とする。
 *
 * もう 1 つの export `transformSectionList` は toc.sectionDepth で本文中の
 * h2/h3 等を TOC に取り込むときに、Astro レイアウトのヘッダー・サイドバー・
 * モーダル由来の見出しを除外して、本物のコンテンツ見出しだけを残すための
 * Vivliostyle CLI コールバック。
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

/**
 * toc.sectionDepth で本文の h2/h3 を取り込むとき、Astro レイアウトの
 * 非コンテンツ見出し（グローバルナビの "Documentation"/"Contribution Guides"、
 * サイドバーの "<product> Documentation" / "Downloads ..."、LiveView モーダル
 * の "Vivliostyle.js でライブ組版" など）も拾われてしまう。これらを除外する
 * 共通フィルタ。
 *
 * 判定ルール:
 *   - id が無い見出しは除外（VFM/Markdown 由来のコンテンツ見出しは Astro が
 *     自動で id を付ける。Astro レイアウト内で手書きされた h2/h3 には id が
 *     無いので、このルールでナビ/サイドバー由来を一掃できる）
 *   - id が "liveview-modal-" で始まる見出しは除外（LiveView モーダルの
 *     <h2 class="liveview-title"> は id を持つので別途対応）
 */
export function transformSectionList(nodeList) {
  return (propsList) => {
    const isContentHeading = (node) => {
      if (!node.id) return false;
      if (node.id.startsWith('liveview-modal-')) return false;
      return true;
    };
    const filtered = nodeList
      .map((node, i) => ({ node, props: propsList[i] }))
      .filter(({ node }) => isContentHeading(node));
    return {
      type: 'element',
      tagName: 'ol',
      properties: {},
      children: filtered.map(({ node, props }) => {
        const { children, ...otherProps } = props;
        const headingContent = { type: 'raw', value: node.headingHtml };
        const inner = node.href
          ? {
              type: 'element',
              tagName: 'a',
              properties: { href: node.href },
              children: [headingContent],
            }
          : { type: 'element', tagName: 'span', children: [headingContent] };
        const liChildren = [inner];
        if (children) {
          const c = Array.isArray(children) ? children : [children];
          liChildren.push(...c);
        }
        return {
          type: 'element',
          tagName: 'li',
          properties: { ...otherProps, 'data-section-level': node.level },
          children: liChildren,
        };
      }),
    };
  };
}
