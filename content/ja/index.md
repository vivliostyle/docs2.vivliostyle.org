---
title: Vivliostyle ドキュメントへようこそ
description: Vivliostyle公式ドキュメント - CSSによる組版を簡単に
lang: ja
order: 1
---

# Vivliostyle ドキュメントへようこそ

Vivliostyleは、Webテクノロジーを使って美しくフォーマットされたドキュメントを作成できる、CSS組版のエコシステムです。

## Vivliostyleとは？

<figure>
<img src="/product-jp.svg" alt="Vivliostyleプロダクト群">
<figcaption>Vivliostyleプロダクト群（<a href="https://gihyo.jp/article/2024/01/vivliostyle-01" target="_blank" rel="noopener noreferrer">村上真雄／小形克宏「Vivliostyleでなにができるの？」gihyo.jpより ↗</a>）</figcaption>
</figure>

Vivliostyleは以下を提供するオープンソースプロジェクトです：

- **[Vivliostyle Viewer](/ja/viewer/)** - ブラウザでHTML/CSSドキュメントを表示・ページ分割
- **[Vivliostyle CLI](/ja/cli/)** - HTML/MarkdownからPDF / EPUBを生成するコマンドラインツール
- **[VFM (Vivliostyle Flavored Markdown)](/ja/vfm/)** - 出版向け拡張Markdown記法
- **[Vivliostyle Themes](/ja/themes/)** - 美しいドキュメントのための事前設計テーマ

## Vivliostyleビギナーはこちら

- <a href="https://vivliostyle.org/ja/tutorials/" target="_blank" rel="noopener noreferrer">チュートリアル ↗</a>
- <a href="https://vivliostyle.org/ja/faq/" target="_blank" rel="noopener noreferrer">FAQ ↗</a>
- [リファレンス](/ja/reference/)
- <a href="https://vivliostyle.org/ja/samples/" target="_blank" rel="noopener noreferrer">サンプル ↗</a>

## [活用ガイド](/ja/cookbook/)

最近追加された機能を、プロダクトを横断して実践的に解説:

- [脚注（フットノート）](/ja/cookbook/footnotes/) — DPUB-ARIA脚注、標準 `@page { @footnote { } }` ルール、VFMの新しい `footnote` モード（v2.41）
- [CMYK 変換](/ja/cookbook/cmyk/) — `device-cmyk()` とCLIによるCMYK PDF出力（v2.40）
- [ページグループ](/ja/cookbook/page-groups/) — 名前付きページと `:nth(An+B of C)` ページセレクタ（v2.39）
- [CSS Nesting ガイド](/ja/cookbook/css-nesting/) — Vivliostyle.js v2.42 の CSS Nesting と組版疑似要素への応用
- [レスポンシブ画像ガイド](/ja/cookbook/responsive-images/) — `<picture>` と `<source media>` による出力ごとの画像差し替え（v2.42、2026-05-13）

## Single Source, Multi Output {#ssmo}

Vivliostyleの最大のメリットは**SSMO（Single Source Multi Output）**です：

1つのMarkdownソースから以下を生成できます：

- **[WebPub](https://docs.vivliostyle.org/ja/cli/special-output-settings/#web-%E5%87%BA%E7%89%88%E7%89%A9webpub%E3%81%AE%E5%87%BA%E5%8A%9B)** - オンライン閲覧用HTMLページ
- **[PDF](https://docs.vivliostyle.org/ja/cli/special-output-settings/#%E5%8D%B0%E5%88%B7%E7%94%A8-pdfpdfx-1a-%E5%BD%A2%E5%BC%8F%E3%81%AE%E7%94%9F%E6%88%90)** - 印刷可能なドキュメント
- **[EPUB](https://docs.vivliostyle.org/ja/cli/special-output-settings/#epub-%E5%BD%A2%E5%BC%8F%E3%81%AE%E5%87%BA%E5%8A%9B)** - 電子書籍フォーマット

## VFM機能デモ

### ルビ

{智|ち}に{棹|さお}させば{流|なが}される。{意地|いじ}を{通|とお}せば{窮屈|きゅうくつ}だ。

**VFM Markdownソース:**

```markdown
{智|ち}に{棹|さお}させば{流|なが}される。{意地|いじ}を{通|とお}せば{窮屈|きゅうくつ}だ。
```

### 脚注

文化庁調査（2022年）[^1]によると、「棹さす」を「流れに乗る」の意味で使う人は23.4%なのに対し、「勢いを止める」は59.4％にのぼる。

[^1]: [平成24年度「国語に関する世論調査」の結果の概要](https://www.bunka.go.jp/tokei_hakusho_shuppan/tokeichosa/kokugo_yoronchosa/pdf/h24_chosa_kekka.pdf)

**VFM Markdownソース:**

```markdown
文化庁調査（2022年）[^1]によると、「棹さす」を「流れに乗る」の意味で使う人は23.4%なのに対し、「勢いを止める」は59.4％にのぼる。

[^1]: [平成24年度「国語に関する世論調査」の結果の概要](https://www.bunka.go.jp/tokei_hakusho_shuppan/tokeichosa/kokugo_yoronchosa/pdf/h24_chosa_kekka.pdf)
```

## Vivliostyle CLI生成物のダウンロード

Vivliostyle CLIにより、このサイトのドキュメント（Markdownソース）からWeb Pub、PDFとEPUBを生成しました（Single Source, Multi Output）。

| プロダクト | Vivliostyle Viewer | PDF | EPUB |
|---|---|---|---|
| [Vivliostyle Viewer](/ja/viewer/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/viewer-ja/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-viewer-ja.pdf) | [EPUB](/downloads/vivliostyle-viewer-ja.epub) |
| [Vivliostyle CLI](/ja/cli/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/cli-ja/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-cli-ja.pdf) | [EPUB](/downloads/vivliostyle-cli-ja.epub) |
| [VFM](/ja/vfm/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/vfm-ja/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vfm-ja.pdf) | [EPUB](/downloads/vfm-ja.epub) |
| [Vivliostyle Themes](/ja/themes/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/themes-ja/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-themes-ja.pdf) | [EPUB](/downloads/vivliostyle-themes-ja.epub) |
| [リファレンス](/ja/reference/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/reference-ja/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-reference-ja.pdf) | [EPUB](/downloads/vivliostyle-reference-ja.epub) |
| [活用ガイド](/ja/cookbook/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/cookbook-ja/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-cookbook-ja.pdf) | [EPUB](/downloads/vivliostyle-cookbook-ja.epub) |
