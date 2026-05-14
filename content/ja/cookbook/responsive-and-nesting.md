---
title: レスポンシブ画像と CSS Nesting ガイド
description: Vivliostyle.js v2.42 の CSS Nesting と v2.42 の <picture> / <source media> 対応
lang: ja
order: 6
---

# レスポンシブ画像と CSS Nesting ガイド

> **対象バージョン**:
>
> - **CSS Nesting**: Vivliostyle.js v2.42+（2026-04-25リリース）
> - **`<picture>` / `<source media>`**: Vivliostyle.js v2.42+（2026-05-13リリース）
> - Vivliostyle CLI v10.6+ は Viewer 2.42 を同梱しているため、追加設定なしに両機能が利用できます。
>
> **公開日**: 2026-05-14
> **最終更新日**: 2026-05-14

このガイドは Vivliostyle.js v2.42 シリーズで追加された 2 つの「現代的な Web プラットフォーム」機能を、組版ユースケースに引き寄せて解説します。両者ともテーマ作者・原稿執筆者の双方に直接的な利点があります。

## このガイドが扱う 2 機能

- **CSS Nesting** — テーマ CSS のオーサリングが格段に楽になる。Sass を経由せずに `&` 構文でルールをネストできる。
- **`<picture>` / `<source media>`** — 1 つの原稿から出力サイズ・印刷/プレビュー・カラー/モノクロなどで画像を出し分けできる。

---

## Part 1 · CSS Nesting

### 何ができるようになったか

[CSS Nesting Module](https://www.w3.org/TR/css-nesting-1/) は、CSS 内で `&` を使ってルールを階層化する仕組みです。従来の CSS では `.chapter h2 { ... }` のように**繰り返しセレクタを書く必要がありましたが、ネスト記法では親セレクタ `.chapter { }` の中にまとめて書けます**。変換ツール不要で、ブラウザと Vivliostyle がそのまま解釈します。

```css
.chapter {
  font-family: 'Source Serif Pro', serif;

  & h2 {
    font-size: 1.4em;
    border-bottom: 1px solid currentColor;
  }

  & p:first-of-type::first-letter {
    font-size: 3em;
    float: left;
    margin-right: 0.1em;
  }
}
```

これは展開すると以下と等価です。

```css
.chapter { font-family: 'Source Serif Pro', serif; }
.chapter h2 { font-size: 1.4em; border-bottom: 1px solid currentColor; }
.chapter p:first-of-type::first-letter { font-size: 3em; float: left; margin-right: 0.1em; }
```

### 組版での使いどころ

#### 1. `@page` ルールのネスト

書籍では「左ページ・右ページで余白とノンブル位置を変える」という指定を頻出します。ネスト記法なら 1 ブロックにまとめられます。

```css
@page {
  size: A5;
  margin: 18mm;

  & :left {
    margin-left: 24mm;
    @bottom-left { content: counter(page); }
  }

  & :right {
    margin-right: 24mm;
    @bottom-right { content: counter(page); }
  }

  & :first {
    @bottom-left { content: none; }
    @bottom-right { content: none; }
  }
}
```

#### 2. 章ごとの差分スタイル

[名前付きページ](../page-groups/)と組み合わせると、章別レイアウトのスタイルが大幅に整理できます。

```css
@page chapter-glossary {
  size: A5;
  margin: 12mm;

  & :left  { margin-left: 16mm; }
  & :right { margin-right: 16mm; }
}
```

#### 3. メディアクエリのインライン化

`@media print` を必要なルールの内側に書けます。プレビュー時にだけ強調する装飾を切り分けやすくなります。

```css
.cover {
  background: var(--cover-bg);

  @media screen {
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  @media print {
    box-shadow: none;
    break-after: page;
  }
}
```

### 既存テーマへの取り込み Tips

- **既存の CSS ファイルへの追加**: 今あるテーマの CSS ファイルにネスト記法をそのまま追記できます。特別な設定変更は不要です。
- **ブラウザプレビュー**: モダンブラウザはすでに CSS Nesting を実装しているため、Vivliostyle Viewer でも `vivliostyle preview` でも同じ見た目になります。
- **書き手の凡ミスを避ける**: 各ネストの先頭は **`&` から始める** のが安全です（生のセレクタから始めると CSS パーサが宣言と誤認することがあります）。

### 知っておきたい制限

- ネストできるのはルール（`@page` / `@media` / クラス・要素セレクタ）の中身です。**プロパティの中にネストはできません**。
- 不正なセレクタが現れたときは、v2.42+ のセレクタ復帰処理によって以降のスタイルは正常に解釈されます（[#5c11c33 / fix invalid selector recovery for css nesting](https://github.com/vivliostyle/vivliostyle.js/issues/1032)）。

---

## Part 2 · `<picture>` / `<source media>`

### 何ができるようになったか

Vivliostyle.js v2.42 から、HTML の `<picture>` 要素と `<source media>` 属性が組版時に評価されるようになりました（[#1089](https://github.com/vivliostyle/vivliostyle.js/issues/1089)）。**1 つの Markdown / HTML 原稿から、出力条件に応じて自動的に画像を切り替えられる** ようになります。

### 組版での使いどころ

#### 1. 印刷とスクリーンで画像を切り替える

PDF には CMYK 化した重い画像、Viewer でのプレビューには軽い RGB 画像、という出し分けが可能になります。

```html
<picture>
  <source media="print" srcset="./img/cover-cmyk.tiff" />
  <img src="./img/cover-rgb.jpg" alt="表紙" />
</picture>
```

`media="print"` がマッチする条件は Vivliostyle.js の組版時（Viewer / CLI とも `print` media に該当します）と一致するため、PDF / EPUB 出力には CMYK 版が選択されます。

#### 2. 出力サイズで解像度を切り替える

A4 と新書版で同じ原稿を使い回すときに、サイズに合わせた解像度を出し分けます。

```html
<picture>
  <source media="(min-width: 180mm)" srcset="./img/diagram-2x.png" />
  <source media="(min-width: 120mm)" srcset="./img/diagram-1.5x.png" />
  <img src="./img/diagram-1x.png" alt="システム構成図" />
</picture>
```

#### 3. WebP / AVIF を優先利用

新しい形式に対応した Viewer ではより軽い形式を使いつつ、EPUB の互換性のため PNG を最後のフォールバックにします。

```html
<picture>
  <source type="image/avif" srcset="./img/photo.avif" />
  <source type="image/webp" srcset="./img/photo.webp" />
  <img src="./img/photo.png" alt="写真" />
</picture>
```

### VFM の画像段落との組み合わせ

VFM の `![alt](src)` は `<img>` を出すだけなので、`<picture>` を使うには HTML を直接書きます。VFM は GFM 互換の HTML パススルーをサポートしているため、Markdown の中に `<picture>` ブロックをそのまま書いて問題ありません。

```markdown
本文中の図版です。

<picture>
  <source media="print" srcset="./img/figure-cmyk.tiff" />
  <img src="./img/figure-rgb.jpg" alt="図 1: 構造図" />
</picture>

続く本文…
```

[VFM 拡張機能ガイド](../vfm-extensions/)の `captionlessImagePolicy: 'figure-with-figcaption'` と組み合わせれば、`<picture>` を含む段落も `<figure>` 化してキャプションスロットを揃えられます。

### EPUB / SVG 出力での挙動

- **EPUB**: Vivliostyle CLI が生成する webpub / EPUB には `<picture>` 要素がそのまま含まれます。EPUB リーダーが `<picture>` を解釈すれば適切な `<source>` が選ばれ、未対応のリーダーでも `<img>` フォールバックが表示されます。
- **PDF**: PDF はラスター/ベクトル画像にフラット化されるため、`media="print"` にマッチした 1 枚だけが埋め込まれます。CMYK 化が必要な場合は `<source media="print">` の側で CMYK 版を指定するのが基本パターンです。
- **SVG 内の `<picture>`**: SVG ファイル *内部* には `<picture>` を直接書けません。SVG を `<img>` で参照し、その `<img>` を `<picture>` で囲んでください。

---

## 2 機能の組み合わせ例

ネスト記法を使って、印刷時のみ `<picture>` の選択画像にトリミング枠を付けるサンプル:

```css
figure {
  margin: 0;

  & picture img {
    display: block;
    max-width: 100%;
  }

  @media print {
    & picture img {
      outline: 0.25mm solid black;
      outline-offset: 0.5mm;
    }
  }
}
```

---

## 対象バージョン早見表

| 機能                                | 対応開始バージョン | 注                                              |
| ----------------------------------- | ------------------ | ----------------------------------------------- |
| CSS Nesting                         | Vivliostyle.js v2.42 | セレクタ復帰の改善は同 2.42 で追加          |
| `<picture>` / `<source media>`      | Vivliostyle.js v2.42 | CLI v10.6 は Viewer 2.42 を同梱             |
| `<img srcset>` のロード安定化       | Vivliostyle.js v2.42 | `<picture>` 利用時の前提（[2579d4a](https://github.com/vivliostyle/vivliostyle.js/commit/2579d4a4d7bc7a9216f0f25d99987f49d866f285)）|

## 関連ガイド

- [VFM 拡張機能ガイド](../vfm-extensions/)
- [脚注（フットノート）](../footnotes/) — v2.42 で同時に脚注機能も拡張されました
- [CMYK 変換](../cmyk/)
- [ページグループ](../page-groups/)

## 参考リンク

- [CSS Nesting Module — W3C](https://www.w3.org/TR/css-nesting-1/)
- [HTML `<picture>` element — MDN](https://developer.mozilla.org/docs/Web/HTML/Element/picture)
- [Vivliostyle.js #1032 — Add CSS Nesting support](https://github.com/vivliostyle/vivliostyle.js/issues/1032)
- [Vivliostyle.js #1089 — `<picture>` support](https://github.com/vivliostyle/vivliostyle.js/issues/1089)
