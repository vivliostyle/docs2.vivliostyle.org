---
title: 変更履歴
description: Vivliostyleドキュメントサイトの更新履歴。収録ドキュメントのバージョンとサイト自体の変更を新しい順にまとめています
lang: ja
order: 1
---

# 変更履歴

このサイトの更新履歴です。上流リポジトリから取り込んだドキュメントのバージョンと、サイト自体の変更を新しい順に並べています。

## 2026年8月24日

- **[Vivliostyle Viewer / Core](/ja/viewer/) v2.45.0** — カスケードを巻き戻す [`revert-layer` / `revert-rule`](/ja/reference/supported-css-features/#値)に対応。`@page`ルールやページマージンボックス、カスタムプロパティでも使えることを明記
- **[Vivliostyle CLI](/ja/cli/) v11.2.0** — 同梱するVivliostyle.jsが2.45.0になりCSS Cascade Layersに対応。ドキュメント自体の変更はなし

## 2026年8月19日

- **[Vivliostyle Viewer / Core](/ja/viewer/) v2.44.1** — 対応CSS機能に [CSS Cascade Layers（`@layer`）](/ja/reference/supported-css-features/#css-cascading-and-inheritance-5)と [CSS Nesting](/ja/reference/supported-css-features/#css-nesting-1)を追加。[`attr()`](/ja/reference/supported-css-features/#値)は`content`以外のプロパティでも使えるようになり、型・単位の指定にも対応
- **[Vivliostyle CLI](/ja/cli/) v11.1.0** — 目次ナビゲーションの中身を組み立て直す [`toc.compose`オプション](/ja/cli/config/#tocconfig)を追加。[`renderMode: docker`](/ja/cli/special-output-settings/#docker-を利用した生成)は非推奨に。[プロジェクトの作成](/ja/cli/getting-started/#vivliostyle-プロジェクトを作成する)は`npm create book@latest`に統一し、必要なNode.jsのバージョンをv22.12.0以上に更新
- **[VFM](/ja/vfm/) v2.7.2** — v2.7で加わったオプションを記述。[数式レンダラー](/ja/vfm/vfm/#数式レンダラー-math-renderer)（`mathml`はビルド時にMathMLへ変換し、実行時スクリプトが不要）、[キャプションなし画像のポリシー](/ja/vfm/vfm/#キャプションなし画像のポリシー-captionless-image-policy)、[相対リンク拡張子の書き換え](/ja/vfm/vfm/#相対リンク拡張子の書き換え-rewrite-relative-href-extensions)、[表のセル揃え](/ja/vfm/vfm/#セル揃えの出力-cell-alignment-output)、[脚注モード](/ja/vfm/vfm/#脚注モード-footnote-mode)。[プラグインオプション](/ja/vfm/plugin-options/)のページと、組み立て済みプラグイン配列に手を入れる [`editPlugins`](/ja/vfm/hooks/#edit-plugins)の解説を新設
- **[Vivliostyle Themes](/ja/themes/) theme-base v2.1.1** — theme-baseのスタイルシートが`css/`直下にフラット化。[`@import`の記述例](/ja/themes/usage/#theme-baseを直接使う)と[モジュール一覧](/ja/themes/development/#theme-baseのモジュール活用)を更新（`css/common/reset.css` → `css/reset.css`、`meta-properties.css` → `define.css`）

## 2026年5月29日

- 収録ドキュメントをVivliostyle.js v2.42.1 / Vivliostyle CLI 10.6.0 / VFM 2.7.0に更新
- 活用ガイドに [CSS Nestingガイド](/ja/cookbook/css-nesting/)を追加

## 2026年5月21日

- [活用ガイド](/ja/cookbook/)を新設。[脚注](/ja/cookbook/footnotes/)、[CMYK変換](/ja/cookbook/cmyk/)、[ページグループ](/ja/cookbook/page-groups/)の3記事を収録

## 2026年5月8日

- PDF / EPUB / WebPubの配布を開始。各ドキュメントをVivliostyle CLIでビルドし、[トップページ](/ja/)からダウンロードできるように

## 2026年4月21日

- Vivliostyle Themesのドキュメントを更新

## 2026年4月14日

- 収録ドキュメントをVivliostyle.js v2.41.0 / Vivliostyle CLI 10.5.0 / VFM 2.6.0に更新

## 2026年2月27日

- [Awesome Vivliostyle](/ja/reference/awesome-vivliostyle/)をリファレンスに追加

## 2026年2月16日

- ヘッダーのデザインを刷新

## 2026年2月2日

- ブラウザの言語設定に応じた自動リダイレクトを追加

## 2026年1月14日

- Vivliostyle Themes・VFM・Vivliostyle.jsのドキュメントを統合し、[リファレンス](/ja/reference/)を新設。収録バージョンはVivliostyle.js 2.40.0 / Vivliostyle CLI 10.3.0 / VFM 2.5.0 / theme-academic 2.0.1

## 2026年1月8日

- [Vivliostyle CLI](/ja/cli/)のドキュメント（10.2.1）を統合。日英の言語切り替えに対応
