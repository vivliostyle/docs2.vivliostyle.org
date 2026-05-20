---
title: ページグループガイド
description: 名前付きページと:nth(An+B of C)ページセレクタ
lang: ja
order: 4
---

# ページグループガイド

> **対象バージョン**: Vivliostyle.js v2.39.0+（2025-12-25リリース）
> **公開日**: 2026-05-05
> **最終更新日**: 2026-05-05

このガイドでは、名前付きページと`:nth(An+B of C)`ページセレクタを解説します。これらを組み合わせることで、同一ファイル内のセクションごとにまったく異なるページレイアウトを与えられるようになります。

## なぜ名前付きページが必要か

書籍では、1冊の中で複数のページデザインが必要になることがよくあります:

- 写真エッセイ章のための、図版に余裕のある幅広レイアウト
- 用語集のための、狭い2段組レイアウト
- 表紙や扉のための、フルブリードレイアウト

CSSは`@page :left` / `:right` / `:first`でページを区別できますが、これらは*見開きの左右*と*文書全体の最初のページ*しか区別しません。**今いる章**を区別することはできません。**名前付きページ**はその穴を埋めます。

## 名前付きページの基本

`page`プロパティで、ブロックレベルの要素（section、`<div>`など）をそれが表示されるページの種類の名前を指定します:

```css
section.glossary {
  page: narrow;
}

section.gallery {
  page: wide;
}
```

そのうえで、対応する`@page`ルールでスタイルを指定します:

```css
@page narrow {
  size: A5;
  margin: 1.5cm 1cm;
}

@page wide {
  size: A4 landscape;
  margin: 1cm;
}
```

`section.glossary`をレイアウトしたページは`narrow`、`section.gallery`のページは`wide`を使います。

## `:nth()`ページセレクタ

1つの`@page`名（または無名のデフォルト）の中で、`:nth()`は位置でページを選択します:

```css
@page :nth(1)      { /* 最初のページ */ }
@page :nth(odd)    { /* 奇数ページ */ }
@page :nth(even)   { /* 偶数ページ */ }
@page :nth(3n+2)   { /* 2ページ目から3ページごと */ }
@page :nth(-n+3)   { /* 最初の3ページ */ }
```

`An+B`形式は`:nth-child`と同じ規則です。`n`は`0, 1, 2, ...`を取り、結果が0以下になる場合は無視されます。

## ページグループという概念

CSS GCPM 3仕様によると、ページグループが生成されるには`page`プロパティと**強制改ページプロパティ**（`break-before: page`など）の**両方**が要素に適用されている必要があります。強制改ページがなければ、`page`名が変わっても新しいページグループは開始されません。

レイアウトエンジンがページにコンテンツを流し込む過程で、フローボックスに付いた`page`名が変わる（例: `glossary`の後に`gallery`が来る）と、Vivliostyleは*強制改ページ*を発行します。1つの名前付きページブロックから生成された、連続するページの塊が**ページグループ**です。

言い換えれば、ページグループは「同じ`@page`名を使い、ソースの同じフローレベル領域から生成された、連続するページの並び」です。これが`:nth(... of <name>)`の選択単位です。

## `:nth(An+B of C)` ―― ページグループ*内*のセレクタ（v2.39.0新機能）

Vivliostyle.js v2.39.0は`:nth(An+B of <name>)`形式に対応しました。インデックスを名前付きページグループ**内**に限定します:

```css
@page :nth(1 of body) {
  /* `page: body` を使う各章の最初のページ */
  @top-center { content: none; }
  margin-top: 4cm;
}

@page :nth(odd of body) {
  /* 各 `body` グループ内の奇数位置のページ */
  @bottom-right { content: counter(page); }
}
```

これにより、「各章の最初のページだけ別デザイン」が簡潔に表現できます。`of <name>`がないと`:nth(1)`は文書全体の最初のページしか選べませんが、`of <name>`を付ければ各グループの最初のページをそれぞれ別個に選択できます。

## 実践例:章構造のある書籍レイアウト

名前付きページ、`counter-reset`、`:nth(... of <name>)`を組み合わせた例:

```css
/* ソース構造
   <article class="cover">      ...   </article>
   <section class="chapter">     ...   </section>
   <section class="chapter">     ...   </section>
   <section class="glossary">    ...   </section>
*/

article.cover    { page: cover; }
section.chapter  { page: body; break-before: page; counter-reset: page 1; }
section.glossary { page: narrow; }

/* 各章の扉ページ */
@page :nth(1 of body) {
  @top-center { content: none; }
  margin-top: 4cm;
}

/* 章の2ページ目以降にはランニングヘッダーを表示 */
@page :nth(n+2 of body) {
  @top-center { content: string(chapter-title); }
}

/* 表紙 */
@page cover {
  size: A4;
  margin: 0;
  background: black;  /* CMYK 入稿用には device-cmyk(0 0 0 1) — v2.40.0+ が必要（CMYK 変換ガイド参照）*/
}
```

このパターンはCSS GCPM 3仕様のExample 13・14で示されており、Vivliostyle.js v2.39.0でネイティブにサポートされるようになりました。

## Vivliostyle Viewerでの確認方法

`@page`ルールはページ分割描画でしか効果が見えません。ページグループ出力を確認するには:

1. `vivliostyle preview`（または`npm run preview`）でビルドする
2. 生成HTMLを[Vivliostyle Viewer](https://vivliostyle.org/viewer/)で開く
3. 「見開き」表示を切り替えて左右ページを確認
4. 各章が扉ページ用のレイアウトで始まっていることを確認

静的に検証したい場合は、`vivliostyle build`を実行して出力PDFを点検します。

## 参照

- W3C [CSS GCPM 3 §3 Selecting Pages](https://www.w3.org/TR/css-gcpm-3/#the-first-page-pseudo-element)
- テストケース:
  - `vivliostyle.js/packages/core/test/files/named-pages/page-groups.html`
  - `vivliostyle.js/packages/core/test/files/nth-page/nth-of-page.html`
