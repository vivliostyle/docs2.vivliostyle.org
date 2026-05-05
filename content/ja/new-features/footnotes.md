---
title: 脚注ガイド
description: Vivliostyle.js の脚注サポート — 従来できたことと v2.41.0 の新機能
lang: ja
order: 2
---

# 脚注ガイド

> **対象バージョン**: Vivliostyle.js v2.41.0+（2026-04-11リリース）、Vivliostyle CLI v10.5.0+
> **公開日**: 2026-05-05
> **最終更新日**: 2026-05-05

このガイドでは、Vivliostyle.js（および VFM）で脚注を扱う方法を、**Vivliostyle.js v2.41.0 以前から提供されていた機能**と**v2.41.0 で新たに加わった機能**に分けて解説します。

## Part 1 · 概要

Vivliostyle.js v2.41.0で追加された脚注関連の新機能:

- **DPUB-ARIA 脚注サポート**（[#1700](https://github.com/vivliostyle/vivliostyle.js/issues/1700)、[PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703)）— `role="doc-noteref"` / `role="doc-footnote"` 属性による脚注認識。ビルトインUAスタイルにより**テーマ不要で自動的に `float: footnote` が適用**される
- **CSS `@footnote` ルール**（[#1045](https://github.com/vivliostyle/vivliostyle.js/issues/1045)、[#1723](https://github.com/vivliostyle/vivliostyle.js/issues/1723)）— CSS GCPM 3標準の `@page { @footnote { ... } }` による脚注エリアのスタイリング。`::before` コンテンツレンダリングにも対応
- **`footnote-display` プロパティ**（[#1825](https://github.com/vivliostyle/vivliostyle.js/issues/1825)）— `block` / `inline` / `compact` の指定で脚注のインライン表示が可能に
- **`list-style-position: outside` for `::footnote-marker`**（[#1702](https://github.com/vivliostyle/vivliostyle.js/issues/1702)）
- **ページスコープ脚注リセット** — ページグループ間でのカウンタ連携

### Vivliostyle.js v2.41.0で対応する脚注認識メカニズム

| メカニズム | HTMLパターン | テーマCSS | 備考 |
|---|---|---|---|
| **CSS GCPM**（既存） | `<span class="footnote">` | `.footnote { float: footnote }` を含むテーマが**必要** | theme-base / theme-techbookで対応 |
| **EPUB**（既存） | `epub:type="noteref"` / `epub:type="footnote"` | 不要（ビルトインで認識） | |
| **DPUB-ARIA**（v2.41.0新規） | `<a role="doc-noteref">` → `<aside role="doc-footnote">` | **不要**（ビルトインUAスタイルで自動適用） | [PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703) |

### 早見表（v2.41.0の脚注機能）

| 新 | やりたいこと | `vivliostyle.config.js` | テーマ・CSS | 結果 |
|:---:|---|---|---|---|
| | 後注（文末） | `vfm: { footnote: 'pandoc' }`（デフォルト） | 不要 | 文末の後注セクション |
| | HTMLで直接記述する脚注（CSSクラス方式） | —（HTML直書き） | theme-base / theme-techbook | `float: footnote` による脚注 |
| ★ | 脚注（VFM→GCPM変換） | `vfm: { footnote: 'gcpm' }` | theme-base / theme-techbook | CSSクラスベースの脚注 |
| ★ | 脚注（VFM→DPUB変換） | `vfm: { footnote: 'dpub' }` | **不要**（v2.41.0のUAスタイルで自動適用） | DPUB-ARIAベースの脚注 |
| ★ | 脚注エリアのスタイリング | `gcpm` / `dpub` または HTML直書き | `@page { @footnote { ... } }` | v2.41.0で標準CSS対応 |
| ★ | インライン脚注表示 | `gcpm` / `dpub` または HTML直書き | `footnote-display: inline` | v2.41.0新機能 |

### 用語について

本ガイドの注に関する用語は、W3C [日本語組版処理の要件（JLReq）§4.2「注の処理」](https://www.w3.org/TR/jlreq/#processing-of-notes-in-japanese)の定義に基づきます。

- **脚注**（footnotes）: ページ下部（横組では版面の地側）に配置される注（[JLReq §4.2.5](https://www.w3.org/TR/jlreq/#processing_of_footnotes_in_horizontal_writing_mode)）
- **後注**（endnotes）: 段落・節・章・本文全体の後ろに配置される注（[JLReq §4.2.4](https://www.w3.org/TR/jlreq/#processing_of_endnotes_in_vertical_writing_mode_or_horizontal_writing_mode)）
- **傍注**（sidenotes）: 小口側に配置される注（[JLReq §4.2.6](https://www.w3.org/TR/jlreq/#processing_of_sidenote_in_vertical_writing_mode)）

**VFMの脚注モードと傍注**: VFMの3つのモード（`pandoc` / `gcpm` / `dpub`）はいずれも傍注（sidenotes）を直接サポートしません。`dpub` モードは `<aside role="doc-footnote">` を生成しますが、Vivliostyle.jsのビルトインUAスタイルにより `float: footnote` が自動適用されるため、結果として**ページ脚注**として表示されます。

**CSS `@footnote` の適用範囲**: CSS GCPM 3の `@page { @footnote { ... } }` および `footnote-display` は、`float: footnote` でページ下部に配置される**脚注（footnotes）のみ**に適用されます。後注（endnotes）には影響しません。

## Part 2 · 従来の脚注サポート

### 1. CSS組版における注の役割

注（脚注・後注）は書籍出版に欠かせない要素です。CSS Generated Content for Paged Media（GCPM）Module 3は、ブロックレベルの要素を本文フローから取り出してページ下部の脚注エリアに流し込むメカニズムとして `float: footnote` を定義しています。

### 2. HTMLで直接記述する方法

最も直接的な記法は、HTMLでマークアップする方法です:

```html
<p>本文<span class="footnote">脚注の本文。</span>はここに続く。</p>
```

`.footnote { float: footnote }` を含むテーマ（theme-base / theme-techbook など）を使うと、`<span class="footnote">` の内容がレイアウト時にページ下部の脚注エリアに移動されます。本文中の参照番号と脚注エリアのマーカーは、`::footnote-call` および `::footnote-marker` 擬似要素を介して生成されます。

### 3. VFMのPandoc形式後注（従来のデフォルト）

VFM v2.5.x以前では、Markdownの `[^1]` 記法はPandoc出力スタイルの**後注**を生成しました:

```markdown
本文。[^1]

[^1]: 注の本文。
```

VFMはこれを `<section role="doc-endnotes">` に変換し、**ドキュメント本文の末尾**に配置します。後注は本文と同じフローに置かれるため、**`float: footnote` の対象にはなりません**。組み込みの `@footnote` スタイリングも後注には影響しません。

### 4. theme-techbookの画面表示と印刷表示

theme-techbookは `@media screen` と `@media print` で別々のスタイルを提供しているため、画面プレビューと印刷PDFで注の見た目が異なります。印刷時の見た目を確認するには Vivliostyle Viewer を使ってください。

## Part 3 · v2.41.0の新しい脚注機能

### 5. DPUB-ARIA 脚注サポート（[#1700](https://github.com/vivliostyle/vivliostyle.js/issues/1700)、[PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703)）

Vivliostyle.js v2.41.0は、DPUB-ARIAロールから直接脚注を認識します:

```html
<p>本文<a role="doc-noteref" href="#fn1">1</a>はここに続く。</p>
<aside id="fn1" role="doc-footnote">注の本文。</aside>
```

ビルトインUAスタイルが `[role="doc-footnote"]` に対して `float: footnote` を適用するため、これは**テーマCSSなしで**動作します。注はページ下部に表示され、本文中の参照番号（`::footnote-call`）も自動生成されます。

> **マーカー表示について**: 脚注エリア側のマーカー（`::footnote-marker`）は、UA スタイルでは content を空のままにしています。author CSS で番号を表示したい場合、Vivliostyle の DPUB-ARIA 実装では `::footnote-marker` の `content` プロパティを **`list-style-position: outside`** とセットで指定する必要があります（`outside` でなければ author の `content` は描画されません）:
>
> ```css
> aside[role="doc-footnote"] {
>   margin-inline-start: 1.5em;  /* マーカー領域の確保 */
> }
> aside[role="doc-footnote"]::footnote-marker {
>   content: counter(footnote) ". ";
>   list-style-position: outside;  /* DPUB-ARIA で必須 */
> }
> ```

### 6. 3つの認識メカニズムの比較

| メカニズム | 由来 | 認識パターン | テーマCSS |
|---|---|---|---|
| CSS GCPM | CSS Generated Content for Paged Media | `<span class="footnote">` | 必要 |
| EPUB | EPUB 3 | `epub:type="noteref"` / `epub:type="footnote"` | 不要 |
| DPUB-ARIA | W3C DPUB-ARIA 1.1 | `role="doc-noteref"` / `role="doc-footnote"` | 不要（v2.41.0） |

3つのメカニズムは同一ドキュメント内で共存できますが、実際にはソースに応じてどれか1つを採用するのが普通です。

### 7. 標準CSSの `@footnote` ルールサポート（[#1045](https://github.com/vivliostyle/vivliostyle.js/issues/1045)、[#1723](https://github.com/vivliostyle/vivliostyle.js/issues/1723)）

これまでVivliostyleはベンダー固有の `@-adapt-footnote-area` at-ruleを使っていましたが、v2.41.0は標準のCSS GCPM 3 `@footnote` ルールに対応します:

```css
@page {
  @footnote {
    border-top: 0.5pt solid black;
    padding-top: 4pt;
    font-size: 0.85em;
  }
}
```

`::before` コンテンツも描画されるので、ラベルを前置できます:

```css
@page {
  @footnote::before {
    content: "Notes:";
    display: block;
    font-weight: bold;
  }
}
```

### 8. `footnote-display` プロパティ（[#1825](https://github.com/vivliostyle/vivliostyle.js/issues/1825)）

脚注本体のレイアウト方式を切り替えます:

- `block`（デフォルト）— 各脚注を改行
- `inline` — 複数の脚注を同じ行にフロー
- `compact` — 短い脚注はインライン、長い脚注は改行

```css
@page {
  @footnote {
    footnote-display: compact;
  }
}
```

### 9. `::footnote-marker` の `list-style-position: outside`（[#1702](https://github.com/vivliostyle/vivliostyle.js/issues/1702)）

脚注マーカーが `list-style-position` を尊重するようになりました。マーカーを脚注本体の外側に配置することで、ぶら下げインデントの体裁が作れます:

```css
::footnote-marker {
  list-style-position: outside;
}
```

特に**DPUB-ARIA 由来の脚注（`<aside role="doc-footnote">`）では、author の `::footnote-marker` content を実際に描画させるための必須条件**となっています（GCPM の class 方式 `<span class="footnote">` では `inside` / `outside` どちらでも描画されます）。詳細は §5 の「マーカー表示について」を参照。

### 10. ページスコープリセットとクロススコープカウンタ

脚注カウンタをページグループ単位でリセットできるようになりました。章ごとに脚注番号を再開する書籍で便利です。`counter-reset` を、[ページグループガイド](./page-groups/)で扱う名前付きページの仕組みと組み合わせて使います。

### 11. VFMの3つの `footnote` モード（VFM [PR#226](https://github.com/vivliostyle/vfm/pull/226)、[PR#231](https://github.com/vivliostyle/vfm/pull/231)）

VFM v2.6.0は `footnote` オプションを導入しました:

- `'pandoc'`（デフォルト）— 後注（ドキュメント末尾の `<section role="doc-endnotes">`）
- `'gcpm'`（新機能）— `<span class="footnote">` による脚注（テーマCSS必要）
- `'dpub'`（新機能）— `<aside role="doc-footnote">` による脚注（**テーマCSS不要**、将来デフォルト化予定 — [#234](https://github.com/vivliostyle/vfm/issues/234)）

`vivliostyle.config.js` での設定:

```js
export default {
  vfm: {
    footnote: 'dpub',
  },
  // ...
};
```

### 12. VFM `footnote` オプションのオブジェクト形式

`footnote` はオブジェクト `{ mode, body }` の形でも指定でき、生成HTMLをカスタマイズできます:

```js
vfm: {
  footnote: {
    mode: 'gcpm',
    body: (h, props, children) =>
      h('span.footnote', props, h('span.footnote-wrap', ...children)),
  },
}
```

用途は、ぶら下げインデント用ラッパーのような**スタイリング目的のDOM変形をMarkdownソースから分離する**ことです。Markdownには素のままに脚注を書き、ビルド設定側でラッパーを適用します。

### 13. YAMLフロントマターによるファイル単位の設定

脚注モードはファイルごとにYAMLフロントマターで指定でき、グローバル設定を上書きできます:

```yaml
---
vfm:
  footnote: dpub  # | pandoc | gcpm
---
```

プロジェクト全体ではデフォルト設定を使いつつ、特定のファイルだけ別モードに切り替えたい場合に便利です。

### 14. CSS脚注プロパティのまとめ

| プロパティ・at-rule | 役割 |
|---|---|
| `float: footnote` | ブロックレベル要素をページ下部の脚注エリアに移動 |
| `@page { @footnote { ... } }` | 脚注エリア自体のスタイリング |
| `footnote-display` | `block` / `inline` / `compact` |
| `footnote-policy` | 注をページ間で分割するかを制御 |
| `::footnote-call` | 本文中の参照マーカーの擬似要素 |
| `::footnote-marker` | 注本体の横に表示されるマーカーの擬似要素 |

## Part 4 · まとめ

VFMで利用できる注の種類と、その記法・設定・CSSの対応:

| 注の種類 | VFMでの記法 | `vivliostyle.config.js` | テーマ・CSS | 備考 |
|---|---|---|---|---|
| **後注**（endnotes） | `[^1]` | `vfm: { footnote: 'pandoc' }`（デフォルト） | 不要（通常フローで `<section role="doc-endnotes">` 出力） | `@footnote` / `footnote-display` 非対応 |
| **脚注・CSSクラス方式**（footnotes） | `[^1]` | `vfm: { footnote: 'gcpm' }` | `.footnote { float: footnote }` を含むテーマが**必要**（theme-base / theme-techbook） | `<span class="footnote">` として出力。VFM v2.6.0新機能 |
| **脚注・DPUB-ARIA方式**（footnotes） | `[^1]` | `vfm: { footnote: 'dpub' }` | **不要**（v2.41.0のUAスタイルで自動適用）。カスタマイズは `@page { @footnote {} }` などで | `<aside role="doc-footnote">` として出力。VFM v2.6.0新機能。将来デフォルト化予定（[#234](https://github.com/vivliostyle/vfm/issues/234)） |
| **傍注**（sidenotes） | — | — | — | VFMの脚注モード（`pandoc` / `gcpm` / `dpub`）では**サポートされない**。傍注を実現するにはカスタムHTML+CSSによる独自実装が必要 |

> **gcpm と dpub の選択指針**:
>
> - **dpub推奨**: テーマCSS不要で手軽に脚注が使える。将来デフォルト化予定
> - **gcpm**: 既存テーマ（theme-base / theme-techbook）との互換性が必要な場合、またはオブジェクト形式の `body` コールバックでHTMLを変形したい場合

## 参照

- W3C [CSS GCPM 3 §2 Footnotes](https://www.w3.org/TR/css-gcpm-3/#footnotes)
- W3C [DPUB-ARIA 1.1](https://www.w3.org/TR/dpub-aria-1.1/)（`doc-noteref` / `doc-footnote` の定義）
- W3C [日本語組版処理の要件 §4.2 注の処理](https://www.w3.org/TR/jlreq/#processing-of-notes-in-japanese)
- Qiita: [@u1f992「Vivliostyle.js v2.41.0（CLI v10.5.0）の脚注機能をMarkdownで利用する」](https://qiita.com/u1f992/items/6466c03aa4f569a39572)
- テストケース: `vivliostyle.js/packages/core/test/files/footnotes/`
- VFMソース: `vfm/src/plugins/footnotes.ts`、[PR#226](https://github.com/vivliostyle/vfm/pull/226)、[PR#231](https://github.com/vivliostyle/vfm/pull/231)
- VFM [Issue #234](https://github.com/vivliostyle/vfm/issues/234)（dpubデフォルト化計画）
- テーマ: `themes/packages/@vivliostyle/theme-base/css/partial/footnote.css`、`theme-techbook/theme.css`
