---
title: 変更履歴
description: Vivliostyleドキュメントサイトの更新履歴。収録ドキュメントのバージョンとサイト自体の変更を新しい順にまとめています
lang: ja
order: 1
---

# 変更履歴

このサイトの更新履歴です。上流リポジトリから取り込んだドキュメントのバージョンと、サイト自体の変更を新しい順に並べています。

## 2026年8月24日

収録ドキュメントをVivliostyle.js v2.45.0 / Vivliostyle CLI v11.2.0 / VFM 2.7.2 / theme-base 2.1.1に更新しました。カッコ内は、その機能に対応したバージョンです。

- **[Vivliostyle Viewer / Core](/ja/viewer/) v2.45.0** — 対応CSS機能に [CSS Cascade Layers（`@layer`）](/ja/reference/supported-css-features/#css-cascading-and-inheritance-5)（v2.45.0）と、カスケードを巻き戻す [`revert-layer` / `revert-rule`](/ja/reference/supported-css-features/#値)（v2.45.0）の記述を追加。あわせて、既存機能の記述も整理しました。[CSS Nesting](/ja/reference/supported-css-features/#css-nesting-1)（v2.42.0）の節を新設し、[`attr()`](/ja/reference/supported-css-features/#値)が`content`以外のプロパティでも使え、型・単位を指定できること（v2.43.0）を反映
- **[Vivliostyle CLI](/ja/cli/) v11.2.0** — 目次ナビゲーションの中身を組み立て直す [`toc.compose`オプション](/ja/cli/config/#tocconfig)（v11.2.0）を追加。[`renderMode: docker`](/ja/cli/special-output-settings/#docker-を利用した生成)が非推奨になったこと（v11.0.3）、[プロジェクトの作成](/ja/cli/getting-started/#vivliostyle-プロジェクトを作成する)が`npm create book@latest`になったこと（v11.0.0）、必要なNode.jsがv22.12.0以上になったこと（v11.0.1）も反映
- **[VFM](/ja/vfm/) 2.7.2** — 2.7系で加わったオプションの記述が追いつきました。[数式レンダラー](/ja/vfm/vfm/#数式レンダラー-math-renderer)（2.7.1。`mathml`はビルド時にMathMLへ変換し、実行時スクリプトが不要）、[キャプションなし画像のポリシー](/ja/vfm/vfm/#キャプションなし画像のポリシー-captionless-image-policy)（2.7.0）、[相対リンク拡張子の書き換え](/ja/vfm/vfm/#相対リンク拡張子の書き換え-rewrite-relative-href-extensions)（2.7.1）、[表のセル揃え](/ja/vfm/vfm/#セル揃えの出力-cell-alignment-output)（2.7.1）、[脚注モード](/ja/vfm/vfm/#脚注モード-footnote-mode)。[プラグインオプション](/ja/vfm/plugin-options/)のページと、組み立て済みプラグイン配列に手を入れる [`editPlugins`](/ja/vfm/hooks/#edit-plugins)（2.7.0）の解説を新設
- **[Vivliostyle Themes](/ja/themes/) theme-base 2.1.1** — [使い方](/ja/themes/usage/)と[開発ガイド](/ja/themes/development/)の記述を更新

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
