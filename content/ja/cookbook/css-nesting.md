---
title: CSS Nesting ガイド
description: Vivliostyle.js v2.42 の CSS Nesting で組版テーマ CSS を整理する
lang: ja
order: 5
---

# CSS Nesting ガイド

> **対象バージョン**: Vivliostyle.js v2.42（2026-04-25）
> Vivliostyle CLI v10.6 は Viewer 2.42 を同梱しているため、追加設定なしに利用できます。
>
> **公開日**: 2026-05-14
> **最終更新日**: 2026-05-14

[CSS Nesting Module](https://www.w3.org/TR/css-nesting-1/) は、CSS のルールを入れ子にして記述するしくみです。従来の CSS では `.chapter { ... } .chapter h2 { ... }` のように親セレクタを繰り返し書く必要がありましたが、ネスト記法では `.chapter { }` の中に子ルールをまとめて書けます。

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

子ルール先頭の `&` は省略できます（`h2 { ... }` と書いても同じ意味です）。本ガイドでは、ネストであることを明示するため `&` を付けています。

## 組版での使いどころ

### 1. 疑似要素のネスト（Vivliostyle 固有の組版疑似要素にも対応）

Vivliostyle.js v2.42 の CSS Nesting は、Vivliostyle が組版時に処理する CSS GCPM の疑似要素 `::footnote-call` / `::footnote-marker` などに対しても動作します。これにより、脚注スタイルを 1 ブロックにまとめて記述できます。

```css
.footnote {
  float: footnote;

  &::footnote-call {
    content: "注" counter(footnote);
  }

  &::footnote-marker {
    content: "注" counter(footnote) " ";
  }
}
```

`.footnote` クラスを脚注として使用しつつ、本文中の呼び出し記号と脚注領域のマーカーを同じスコープで定義できます。

![疑似要素 ::footnote-call と ::footnote-marker のネストが動作する例。本文中に「注1」「注2」が、ページ下部の脚注領域に「注1 ...」「注2 ...」が表示される](/cookbook/css-nesting/ja/01-pseudo-element-nesting.png)

<details>
<summary>HTMLソース</summary>

```html
<p>Vivliostyle.js v2.42 の CSS Nesting は、組版用の疑似要素にも対応しています<span class="footnote">脚注の本体テキストです。</span>。たとえば <code>::footnote-call</code> と <code>::footnote-marker</code> を <code>.footnote</code> のネストとして一緒に書けます<span class="footnote">2 つめの脚注です。</span>。</p>
<p>このページ下部の脚注領域に「注1 ...」「注2 ...」が表示されているはずです。</p>
```

</details>

> 参考: [メイユール（@u1f992）氏の投稿](https://x.com/u1f992/status/2053013531600257211)

### 2. メディアクエリのインライン化

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

## 既存テーマへの取り込み

- **既存の CSS ファイルへの追加**: 今あるテーマの CSS ファイルにネスト記法をそのまま追記できます。特別な設定変更は不要です。

## 知っておきたい制限

- ネストできるのはルール（`@page` / `@media` / クラス・要素セレクタ）の中身です。**プロパティの中にネストはできません**。

## 関連ガイド

- [脚注（フットノート）](../footnotes/) — v2.42 で同時に脚注機能も拡張されました
- [CMYK 変換](../cmyk/)
- [ページグループ](../page-groups/)

## 参考リンク

- [CSS Nesting Module — W3C](https://www.w3.org/TR/css-nesting-1/)
- [Vivliostyle.js #1032 — Add CSS Nesting support](https://github.com/vivliostyle/vivliostyle.js/issues/1032)
