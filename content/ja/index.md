---
title: Vivliostyle ドキュメントへようこそ
description: Vivliostyle公式ドキュメント - CSSによる組版を簡単に
lang: ja
order: 1
---

# Vivliostyle ドキュメントへようこそ

Vivliostyleは、Webテクノロジーを使って美しくフォーマットされたドキュメントを作成するための、CSS組版のエコシステムです。

## Vivliostyleとは？

<figure>
<img src="/product-jp.svg" alt="Vivliostyleプロダクト群">
<figcaption>Vivliostyleプロダクト群（<a href="https://gihyo.jp/article/2024/01/vivliostyle-01">村上真雄／小形克宏「Vivliostyleでなにができるの？」gihyo.jpより</a>）</figcaption>
</figure>

Vivliostyleは以下を提供するオープンソースプロジェクトです：

- **[Vivliostyle Viewer](/ja/viewer/)** - ブラウザでHTML/CSSドキュメントを表示・ページ分割
- **[Vivliostyle CLI](/ja/cli/)** - HTML/MarkdownからPDF / EPUBを生成するコマンドラインツール
- **[VFM (Vivliostyle Flavored Markdown)](/ja/vfm/)** - 出版向け拡張Markdown記法
- **[Vivliostyle Themes](/ja/themes/)** - 美しいドキュメントのための事前設計テーマ

## Single Source, Multi Output {#ssmo}

Vivliostyleの最大のメリットは**SSMO（Single Source Multi Output）**です：

1つのMarkdownソースから以下を生成できます：

- **[WebPub](https://docs.vivliostyle.org/ja/cli/special-output-settings/#web-%E5%87%BA%E7%89%88%E7%89%A9webpub%E3%81%AE%E5%87%BA%E5%8A%9B)** - オンライン閲覧用HTMLページ
- **[PDF](https://docs.vivliostyle.org/ja/cli/special-output-settings/#%E5%8D%B0%E5%88%B7%E7%94%A8-pdfpdfx-1a-%E5%BD%A2%E5%BC%8F%E3%81%AE%E7%94%9F%E6%88%90)** - 印刷可能なドキュメント
- **[EPUB](https://docs.vivliostyle.org/ja/cli/special-output-settings/#epub-%E5%BD%A2%E5%BC%8F%E3%81%AE%E5%87%BA%E5%8A%9B)** - 電子書籍フォーマット

## [活用ガイド](/ja/cookbook/)

最近追加された機能を、プロダクトを横断して実践的に解説:

- [脚注（フットノート）](/ja/cookbook/footnotes/) — DPUB-ARIA脚注、標準 `@page { @footnote { } }` ルール、VFMの新しい `footnote` モード（v2.41.0+）
- [CMYK 変換](/ja/cookbook/cmyk/) — `device-cmyk()` とCLIによるCMYK PDF出力（v2.40.0+）
- [ページグループ](/ja/cookbook/page-groups/) — 名前付きページと `:nth(An+B of C)` ページセレクタ（v2.39.0+）

## VFM機能デモ

### ルビ

VFMの{漢字|かんじ}サポートをデモンストレーションしています。

<details>
<summary>VFM Markdownソース</summary>

```markdown
VFMの{漢字|かんじ}サポートをデモンストレーションしています。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p>VFMの<ruby>漢字<rt>かんじ</rt></ruby>サポートをデモンストレーションしています。</p>
```

</details>

### セクション属性

セクションはCSSスタイリング用の適切なIDで自動的にラップされます。

<details>
<summary>VFM Markdownソース（H2「VFM機能デモ」全体）</summary>

````markdown
## VFM機能デモ

### ルビ

VFMの{漢字|かんじ}サポートをデモンストレーションしています。

### セクション属性

セクションはCSSスタイリング用の適切なIDで自動的にラップされます。
````

</details>

<details>
<summary>VFMが生成するHTML（H2「VFM機能デモ」全体）</summary>

```html
<section class="level2">
  <h2 id="vfm機能デモ">VFM機能デモ</h2>
  <section class="level3">
    <h3 id="ルビ">ルビ</h3>
    <p>VFMの<ruby>漢字<rt>かんじ</rt></ruby>サポートをデモンストレーションしています。</p>
  </section>
  <section class="level3">
    <h3 id="セクション属性">セクション属性</h3>
    <p>セクションはCSSスタイリング用の適切なIDで自動的にラップされます。</p>
  </section>
</section>
```

</details>

## Vivliostyle CLI生成物のダウンロード

Vivliostyle CLIにより、このサイトのドキュメント（Markdownソース）からPDFとEPUBを生成しました（Single Source, Multi Output）。

| プロダクト | PDF | EPUB |
|---|---|---|
| [Vivliostyle Viewer](/ja/viewer/) | [PDF](/downloads/vivliostyle-viewer-ja.pdf) | [EPUB](/downloads/vivliostyle-viewer-ja.epub) |
| [Vivliostyle CLI](/ja/cli/) | [PDF](/downloads/vivliostyle-cli-ja.pdf) | [EPUB](/downloads/vivliostyle-cli-ja.epub) |
| [VFM](/ja/vfm/) | [PDF](/downloads/vfm-ja.pdf) | [EPUB](/downloads/vfm-ja.epub) |
| [Vivliostyle Themes](/ja/themes/) | [PDF](/downloads/vivliostyle-themes-ja.pdf) | [EPUB](/downloads/vivliostyle-themes-ja.epub) |
| [リファレンス](/ja/reference/) | [PDF](/downloads/vivliostyle-reference-ja.pdf) | [EPUB](/downloads/vivliostyle-reference-ja.epub) |
| [活用ガイド](/ja/cookbook/) | [PDF](/downloads/vivliostyle-cookbook-ja.pdf) | [EPUB](/downloads/vivliostyle-cookbook-ja.epub) |
