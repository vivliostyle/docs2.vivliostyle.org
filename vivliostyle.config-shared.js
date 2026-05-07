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
 *   - id が "sidebar-nav" の見出しは除外（CLI の section.id 解決ロジックは
 *     `head.id || head.parentElement.id` なので、サイドバーの id 無し h3 が
 *     親 <nav id="sidebar-nav"> から id を継承して TOC に紛れ込む）
 */
function isContentHeading(node) {
  if (!node.id) return false;
  if (node.id.startsWith('liveview-modal-')) return false;
  if (node.id === 'sidebar-nav') return false;
  return true;
}

/**
 * 見出し HTML 内の <a> タグを剥がす。
 * Markdown で `### [テキスト](URL)` のように見出しそのものをリンク化すると、
 * h3 内に <a href="URL"> が入る。CLI が生成する TOC はその外側にも
 * `<a href="entry#id">...</a>` を付けるため、
 *   <a href="entry#id"><a href="URL">テキスト</a></a>
 * のネストした <a> ができ、Vivliostyle/ブラウザがレンダリング時に
 * 内側の URL を優先してしまい、target-counter() がページ番号を解決できず
 * "??" が表示される。内側の <a> を取り除いて平坦化する。
 */
function stripAnchorTags(html) {
  return html.replace(/<a\b[^>]*>/gi, '').replace(/<\/a>/gi, '');
}

export function transformSectionList(nodeList) {
  return (propsList) => {
    const filtered = nodeList
      .map((node, i) => ({ node, props: propsList[i] }))
      .filter(({ node }) => isContentHeading(node));
    return {
      type: 'element',
      tagName: 'ol',
      properties: {},
      children: filtered.map(({ node, props }) => {
        const { children, ...otherProps } = props;
        const cleanHtml = stripAnchorTags(node.headingHtml);
        const headingContent = { type: 'raw', value: cleanHtml };
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

/**
 * CLI のデフォルト transformDocumentList は entry の sections.length が 1 で
 * かつ level が 1 のときだけ「ページタイトル | Vivliostyle Documentation」を
 * skip する。本リポジトリでは:
 *   - サイドバー/ヘッダー由来の h2/h3 が unfiltered sections に大量に混じる
 *     ため length は常に > 1 になり skip 条件にマッチしない
 *   - reference の index.md のように h1 を使わず h2 から始まる entry もある
 * 結果として TOC で「はじめに | Vivliostyle Documentation」と「はじめに」が
 * 二重表示される。
 *
 * isContentHeading で先に絞り込み、絞り込み後の top-level が 1 件でも残れば
 * （level に関わらず）entry title を skip する。
 */
export function transformDocumentList(nodeList) {
  return (propsList) => {
    return {
      type: 'element',
      tagName: 'ol',
      properties: {},
      children: nodeList.flatMap((node, i) => {
        const { children, ...otherProps } = propsList[i];
        const filteredSections = (node.sections || []).filter(isContentHeading);
        if (filteredSections.length >= 1) {
          // entry title を出さずに children の <ol> をそのまま展開
          const childArr = Array.isArray(children)
            ? children
            : children
              ? [children]
              : [];
          return childArr.flatMap((e) =>
            e && e.type === 'element' && e.tagName === 'ol' ? e.children : e,
          );
        }
        // フィルタ後にコンテンツ見出しが残らない entry（基本起こらないはず）は
        // ページタイトルだけでも残しておく
        return [
          {
            type: 'element',
            tagName: 'li',
            properties: otherProps,
            children: [
              {
                type: 'element',
                tagName: 'a',
                properties: { href: node.href },
                children: [{ type: 'text', value: node.title || '' }],
              },
              ...(children
                ? Array.isArray(children)
                  ? children
                  : [children]
                : []),
            ],
          },
        ];
      }),
    };
  };
}
