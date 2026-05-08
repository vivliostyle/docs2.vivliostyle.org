---
title: Vivliostyle ドキュメントへようこそ
description: Vivliostyle公式ドキュメント - CSSによる組版を簡単に
lang: ja
order: 1
---

# Vivliostyle ドキュメントへようこそ

Vivliostyleは、Webテクノロジーを使って美しくフォーマットされたドキュメントを作成できるCSS組版エンジンです。

## Vivliostyleとは？

Vivliostyleは以下を提供するオープンソースプロジェクトです：

- **Vivliostyle Viewer** - ブラウザでHTML/CSSドキュメントを表示・ページ分割
- **Vivliostyle CLI** - HTML/MarkdownからPDFを生成するコマンドラインツール
- **VFM (Vivliostyle Flavored Markdown)** - 出版向け拡張Markdown記法
- **Vivliostyle Themes** - 美しいドキュメントのための事前設計テーマ

## Single Source, Multi Output {#ssmo}

Vivliostyleの最大のメリットは**SSMO（Single Source Multi Output）**です：

1つのMarkdownソースから以下を生成できます：

- **[WebPub](https://docs.vivliostyle.org/ja/cli/special-output-settings/#web-%E5%87%BA%E7%89%88%E7%89%A9webpub%E3%81%AE%E5%87%BA%E5%8A%9B)** - オンライン閲覧用HTMLページ
- **[PDF](https://docs.vivliostyle.org/ja/cli/special-output-settings/#%E5%8D%B0%E5%88%B7%E7%94%A8-pdfpdfx-1a-%E5%BD%A2%E5%BC%8F%E3%81%AE%E7%94%9F%E6%88%90)** - 印刷可能なドキュメント
- **[EPUB](https://docs.vivliostyle.org/ja/cli/special-output-settings/#epub-%E5%BD%A2%E5%BC%8F%E3%81%AE%E5%87%BA%E5%8A%9B)** - 電子書籍フォーマット

## はじめに

以下のプロダクトから始めてください：

- [Vivliostyle CLI](/ja/cli/) - コマンドラインからPDFを生成
- [VFM](/ja/vfm/) - Markdownでドキュメントを書く
- [Vivliostyle Themes](/ja/themes/) - ドキュメントをスタイリング

## [活用ガイド](/ja/cookbook/)

最近追加された機能を、プロダクトを横断して実践的に解説:

- [脚注（フットノート）](/ja/cookbook/footnotes/) — DPUB-ARIA脚注、標準 `@page { @footnote { } }` ルール、VFMの新しい `footnote` モード（v2.41.0+）
- [CMYK 変換](/ja/cookbook/cmyk/) — `device-cmyk()` とCLIによるCMYK PDF出力（v2.40.0+）
- [ページグループ](/ja/cookbook/page-groups/) — 名前付きページと `:nth(An+B of C)` ページセレクタ（v2.39.0+）

## VFM機能デモ

### ルビ

VFMの{漢字|かんじ}サポートをデモンストレーションしています。

### セクション属性

セクションはCSSスタイリング用の適切なIDで自動的にラップされます。

## Vivliostyle CLI生成物のダウンロード

このサイトの各プロダクトのドキュメントは、同じ Markdown ソースから Vivliostyle CLI で **PDF / EPUB** として生成しています（[Single Source, Multi Output](#ssmo)）。

| プロダクト | PDF | EPUB |
|---|---|---|
| [Vivliostyle Viewer](/ja/viewer/) | [PDF](/downloads/vivliostyle-viewer-ja.pdf) | [EPUB](/downloads/vivliostyle-viewer-ja.epub) |
| [Vivliostyle CLI](/ja/cli/) | [PDF](/downloads/vivliostyle-cli-ja.pdf) | [EPUB](/downloads/vivliostyle-cli-ja.epub) |
| [VFM](/ja/vfm/) | [PDF](/downloads/vfm-ja.pdf) | [EPUB](/downloads/vfm-ja.epub) |
| [Vivliostyle Themes](/ja/themes/) | [PDF](/downloads/vivliostyle-themes-ja.pdf) | [EPUB](/downloads/vivliostyle-themes-ja.epub) |
| [リファレンス](/ja/reference/) | [PDF](/downloads/vivliostyle-reference-ja.pdf) | [EPUB](/downloads/vivliostyle-reference-ja.epub) |
| [活用ガイド](/ja/cookbook/) | [PDF](/downloads/vivliostyle-cookbook-ja.pdf) | [EPUB](/downloads/vivliostyle-cookbook-ja.epub) |
