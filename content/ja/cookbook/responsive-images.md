---
title: レスポンシブ画像ガイド
description: <picture> と <source media> で 1 つの原稿から出力ごとに画像を差し替える（Vivliostyle.js v2.42）
lang: ja
order: 6
---

# レスポンシブ画像ガイド

> **対象バージョン**: Vivliostyle.js v2.42（2026-05-13）
> Vivliostyle CLI v10.6 は Viewer 2.42 を同梱しているため、追加設定なしに利用できます。
>
> **公開日**: 2026-05-14
> **最終更新日**: 2026-05-14

Vivliostyle.js v2.42（2026-05-13）から、HTML の `<picture>` 要素と `<source media>` 属性が組版時に評価されるようになりました（[#1089](https://github.com/vivliostyle/vivliostyle.js/issues/1089)）。**1 つの Markdown / HTML 原稿から、出力条件に応じて自動的に画像を切り替えられる**ようになります。

## 組版での使いどころ

### 1. 印刷とスクリーンで画像を切り替える

PDF には CMYK 化した重い画像、Viewer でのプレビューには軽い RGB 画像、という出し分けが可能になります。

```html
<picture>
  <source media="print" srcset="./img/cover-cmyk.tiff" />
  <img src="./img/cover-rgb.jpg" alt="表紙" />
</picture>
```

`media="print"` がマッチする条件は Vivliostyle.js の組版時（Viewer / CLI とも `print` media に該当します）と一致するため、PDF 出力には CMYK 版が選択されます。EPUB 出力の挙動については後述の制限事項を参照してください。

### 2. 出力サイズで解像度を切り替える

A4 と新書版で同じ原稿を使い回すときに、サイズに合わせた解像度を出し分けます。

```html
<picture>
  <source media="(min-width: 180mm)" srcset="./img/diagram-2x.png" />
  <source media="(min-width: 120mm)" srcset="./img/diagram-1.5x.png" />
  <img src="./img/diagram-1x.png" alt="システム構成図" />
</picture>
```

### 3. WebP / AVIF を優先利用

新しい形式に対応した Viewer ではより軽い形式を使いつつ、EPUB の互換性のため PNG を最後のフォールバックにします。

```html
<picture>
  <source type="image/avif" srcset="./img/photo.avif" />
  <source type="image/webp" srcset="./img/photo.webp" />
  <img src="./img/photo.png" alt="写真" />
</picture>
```

## VFM の画像段落との組み合わせ

VFM の `![alt](src)` は `<img>` を出すだけなので、`<picture>` を使うには HTML を直接書きます。VFM は GFM 互換の HTML パススルーをサポートしているため、Markdown の中に `<picture>` ブロックをそのまま書いて問題ありません。

```markdown
本文中の図版です。

<picture>
  <source media="print" srcset="./img/figure-cmyk.tiff" />
  <img src="./img/figure-rgb.jpg" alt="図 1: 構造図" />
</picture>

続く本文…
```

## EPUB / SVG 出力での挙動

- **EPUB**: Vivliostyle CLI v10.6 が生成する EPUB には `<picture>` 要素自体はそのまま含まれますが、**`<source srcset>` で参照されたファイルが EPUB アーカイブに同梱されません**（[vivliostyle-cli #811](https://github.com/vivliostyle/vivliostyle-cli/issues/811)）。そのため、EPUB リーダーが `<picture>` を解釈しても `<source>` 側の画像をロードできず、結果として `<img>` フォールバックが表示されます。出力ごとに画像を出し分けたい場合は、現状 PDF 出力で利用してください。
- **PDF**: PDF はラスター/ベクトル画像にフラット化されるため、`media="print"` にマッチした 1 枚だけが埋め込まれます。CMYK 化が必要な場合は `<source media="print">` の側で CMYK 版を指定するのが基本パターンです。
- **SVG 内の `<picture>`**: SVG ファイル *内部* には `<picture>` を直接書けません。SVG を `<img>` で参照し、その `<img>` を `<picture>` で囲んでください。

## CSS Nesting と組み合わせる

選択された `<picture>` の画像に印刷時のみ枠線を付けるなど、`<picture>` と CSS Nesting を組み合わせると `@media print` をルール内側に書けます。サンプルコードは [CSS Nesting ガイド](../css-nesting/) の「`<picture>` と組み合わせて印刷時のみ画像スタイルを切り替える」節にあります。

## 関連ガイド

- [CSS Nesting ガイド](../css-nesting/) — `<picture>` の選択画像に印刷時のみスタイルを付けるテクニック
- [CMYK 変換](../cmyk/) — `<source media="print">` で CMYK 画像を切り替える際に便利
- [脚注（フットノート）](../footnotes/) — v2.42 で同時に脚注機能も拡張されました
- [ページグループ](../page-groups/)

## 参考リンク

- [HTML `<picture>` element — MDN](https://developer.mozilla.org/docs/Web/HTML/Element/picture)
- [Vivliostyle.js #1089 — `<picture>` support](https://github.com/vivliostyle/vivliostyle.js/issues/1089)
