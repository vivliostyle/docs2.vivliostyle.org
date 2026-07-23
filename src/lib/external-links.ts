/**
 * vivliostyle.org(マーケティングサイト、別リポジトリ)へのリンク。
 *
 * 英語ページにはロケールプレフィックスが無く、日本語ページのみ /ja/ を使う
 * (例: /tutorials/ が英語版、/ja/tutorials/ が日本語版。/en/tutorials/ は
 * 存在せず404になる)。この非対称な構造を「揃えよう」として /en/ を足すと
 * 壊れるので、変更前に必ず実際のURLで確認すること。
 * 参照: https://github.com/vivliostyle/docs2.vivliostyle.org/issues/32
 */
export const VIVLIOSTYLE_ORG_LINKS = {
  tutorials: {
    en: 'https://vivliostyle.org/tutorials/',
    ja: 'https://vivliostyle.org/ja/tutorials/',
  },
  faq: {
    en: 'https://vivliostyle.org/faq/',
    ja: 'https://vivliostyle.org/ja/faq/',
  },
} as const;
