---
title: 脚注ガイド
description: Vivliostyle.jsの脚注サポート — 従来できたこととv2.41の新機能
lang: ja
order: 2
---

# 脚注ガイド

> **対象バージョン**: Vivliostyle.js v2.41+（2026-04-11リリース）、Vivliostyle CLI v10.5+
> **公開日**: 2026-05-05
> **最終更新日**: 2026-05-14
>
> - **v2.41で追加**: DPUB-ARIA脚注への対応（`float: footnote`の自動適用）

このガイドでは、Vivliostyle.js（およびVFM）で脚注を扱うための**手段**と、脚注の**カスタマイズ方法**を解説します。

## 概要

Vivliostyleで脚注を実現する手段と、その設定・必要なCSSの対応:

|やりたいこと| `vivliostyle.config.js` |テーマ・CSS |結果|
|---|---|---|---|
|後注（文末）| `vfm: { footnote: 'pandoc' }`（デフォルト）|不要|文末の後注セクション|
|HTMLで直接記述する脚注（CSSクラス方式）| —（HTML直書き）| theme-base / theme-techbook | `float: footnote`による脚注|
|脚注（VFM→GCPM変換）| `vfm: { footnote: 'gcpm' }` | theme-base / theme-techbook | CSSクラスベースの脚注|
|脚注（VFM→DPUB変換）| `vfm: { footnote: 'dpub' }` | **不要**（v2.41で自動対応）| DPUB-ARIAベースの脚注|

### 脚注認識メカニズムについて

Vivliostyleが脚注として認識するHTMLマークアップには、由来の異なる2つの方式があります。

**CSS GCPM（CSS Generated Content for Paged Media）** は、W3CがページメディアのCSS組版向けに策定した仕様です（[CSS GCPM 3](https://www.w3.org/TR/css-gcpm-3/)）。この仕様で定義された`float: footnote`を含むCSSクラスをHTMLに適用することで、脚注フロートを実現します。Vivliostyleはtheme-base / theme-techbookにこのスタイルを同梱しており、v2.41以前から対応しています。

**DPUB-ARIA**（Digital Publishing WAI-ARIA）は、W3CがEPUBなどの電子出版物のアクセシビリティ向けに策定したARIAロールの拡張仕様です（[DPUB-ARIA 1.1](https://www.w3.org/TR/dpub-aria-1.1/)）。`role="doc-noteref"` / `role="doc-footnote"`というHTMLの`role`属性で注の参照元と注本文をマークアップします。Vivliostyle.js v2.41で対応し、テーマCSSなしで脚注が使えるようになりました。

|メカニズム|由来|HTMLパターン|テーマCSS|
|---|---|---|---|
| **CSS GCPM** | CSS Generated Content for Paged Media | `<span class="footnote">` | `.footnote { float: footnote }`を含むテーマが**必要**（theme-base / theme-techbook）|
| **DPUB-ARIA**（v2.41新規）| W3C DPUB-ARIA 1.1 | `<a role="doc-noteref">` → `<aside role="doc-footnote">` | **不要**（v2.41で自動対応）|

## 脚注を実現する手段

### CSS直書き方式（GCPMクラス方式）

最も直接的な記法は、HTMLでマークアップする方法です:

```html
<p>本文<span class="footnote">脚注の本文。</span>はここに続く。</p>
```

`.footnote { float: footnote }`を含むテーマ（theme-base / theme-techbookなど）を使うと、`<span class="footnote">`の内容がレイアウト時にページ下部の脚注エリアに移動されます。本文中の参照番号と脚注エリアのマーカーは、`::footnote-call`および`::footnote-marker`擬似要素を介して生成されます。

![GCPMクラス方式の脚注。本文中の上付き番号と、ページ下部の脚注エリアにマーカー番号付きで自動配置される](/cookbook/footnotes/ja/01-html-class-themebase.png)

<details>
<summary>VFM Markdownソース</summary>

```markdown
---
title: "例1: HTML直書き脚注（GCPMクラス方式）"
vfm:
  footnote: gcpm
---

HTML中に`<span class="footnote">`として記述した脚注[^1]は、テーマCSS（theme-base / theme-techbookなど）の`.footnote { float: footnote }`によってページ下部の脚注エリアに送られる。

本文中に複数の参照を入れた場合[^2]でも、マーカーは`::footnote-call`と`::footnote-marker`擬似要素で連番つきに生成される。

[^1]: 脚注の本文。`float: footnote`によりレイアウト時にページ下部に移動される。

[^2]: もう一つの注。連番は自動的に振られる。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p>HTML中に<code>&#x3C;span class="footnote"></code>として記述した脚注<span class="footnote" id="fn-1" role="doc-footnote">脚注の本文。<code>float: footnote</code>によりレイアウト時にページ下部に移動される。</span>は、テーマCSS（theme-base / theme-techbookなど）の<code>.footnote { float: footnote }</code>によってページ下部の脚注エリアに送られる。</p>
<p>本文中に複数の参照を入れた場合<span class="footnote" id="fn-2" role="doc-footnote">もう一つの注。連番は自動的に振られる。</span>でも、マーカーは<code>::footnote-call</code>と<code>::footnote-marker</code>擬似要素で連番つきに生成される。</p>
```

</details>

### DPUB-ARIAロール方式（[#1700](https://github.com/vivliostyle/vivliostyle.js/issues/1700)、[PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703)）

Vivliostyle.js v2.41は、DPUB-ARIAロールから直接脚注を認識します:

```html
<p>本文<a role="doc-noteref" href="#fn1">1</a>はここに続く。</p>
<aside id="fn1" role="doc-footnote">注の本文。</aside>
```

Vivliostyle.jsが`[role="doc-footnote"]`に対して`float: footnote`を適用するため、これは**テーマCSSなしで**動作します。注はページ下部に表示され、本文中の参照番号（`::footnote-call`）も自動生成されます。

![DPUB-ARIA脚注。テーマCSSを一切書かなくてもページ下部の脚注エリアに自動配置される](/cookbook/footnotes/ja/03-dpub-aria-default.png)

<details>
<summary>VFM Markdownソース</summary>

```markdown
---
title: "例3: DPUB-ARIA脚注（テーマCSSなし）"
vfm:
  footnote: dpub
---

本文中に`[^1]`と書くと、VFM dpubモードは`<a role="doc-noteref">`[^1]と`<aside role="doc-footnote">`を出力する。

Vivliostyle.js v2.41+が`float: footnote`を自動で適用するため、テーマCSSなしでもページ下部の脚注エリアに配置される[^2]。

[^1]: 脚注の本文。CSSは何も書いていない。

[^2]: もう一つの注。連番は自動。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p>本文中に<code>[^1]</code>と書くと、VFM dpubモードは<code>&#x3C;a role="doc-noteref"></code><a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>と<code>&#x3C;aside role="doc-footnote"></code>を出力する。</p>
<p>Vivliostyle.js v2.41+が<code>float: footnote</code>を自動で適用するため、テーマCSSなしでもページ下部の脚注エリアに配置される<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>。</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>脚注の本文。CSSは何も書いていない。</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>もう一つの注。連番は自動。</aside>
```

</details>

### 2つの認識メカニズムの比較

|メカニズム|由来|認識パターン|テーマCSS |
|---|---|---|---|
| CSS GCPM | CSS Generated Content for Paged Media | `<span class="footnote">` |必要|
| DPUB-ARIA | W3C DPUB-ARIA 1.1 | `role="doc-noteref"` / `role="doc-footnote"` |不要（v2.41）|

2つのメカニズムは同一ドキュメント内で共存できますが、実際にはソースに応じてどれか1つを採用するのが普通です。

### VFMによる変換（`[^1]`記法）

VFM v2.6は`footnote`オプションを導入しました（[PR#226](https://github.com/vivliostyle/vfm/pull/226)、[PR#231](https://github.com/vivliostyle/vfm/pull/231)）。Markdownの`[^1]`記法から生成されるHTMLが、モードによって異なります:

- **`'pandoc'`（デフォルト）** — **後注**を生成します。`<section role="doc-endnotes">`としてドキュメント末尾に配置されます。`float: footnote`の対象にはならず、`@footnote`スタイリングも影響しません。
- **`'gcpm'`** — `<span class="footnote">`を生成します。`float: footnote`を含むテーマCSS（theme-base / theme-techbookなど）が必要です。
- **`'dpub'`** — `<aside role="doc-footnote">`を生成します。Vivliostyle.js v2.41+が`float: footnote`を適用するため、**テーマCSS不要**です。将来デフォルト化予定（[#234](https://github.com/vivliostyle/vfm/issues/234)）。

`vivliostyle.config.js`での設定:

```js
export default {
  vfm: {
    footnote: 'dpub',
  },
  // ...
};
```

#### `pandoc`モード（後注）の例

VFM v2.5.x以前では、Markdownの`[^1]`記法はPandoc出力スタイルの**後注**を生成しました:

```markdown
本文。[^1]

[^1]: 注の本文。
```

VFMはこれを`<section role="doc-endnotes">`に変換し、**ドキュメント本文の末尾**に配置します。後注は本文と同じフローに置かれるため、**`float: footnote`の対象にはなりません**。組み込みの`@footnote`スタイリングも後注には影響しません。

![VFM Pandoc形式の後注。本文末尾に`<section role="doc-endnotes">`がフローし、各注に戻るリンクが付く](/cookbook/footnotes/ja/02-vfm-pandoc-endnotes.png)

<details>
<summary>VFM Markdownソース</summary>

```markdown
---
title: "例2: VFM Pandoc形式の後注"
vfm:
  footnote: pandoc
---

VFMのデフォルト設定（`footnote: 'pandoc'`）では、`[^1]`記法は`<section role="doc-endnotes">`として本文末尾に追加される[^1]。

本文と通常フローでつながるため、`float: footnote`や`@page { @footnote { } }`の対象にならない[^2]点に注意。

[^1]: 最初の後注の本文。

[^2]: 次の後注の本文。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p>VFMのデフォルト設定（<code>footnote: 'pandoc'</code>）では、<code>[^1]</code>記法は<code>&#x3C;section role="doc-endnotes"></code>として本文末尾に追加される<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>。</p>
<p>本文と通常フローでつながるため、<code>float: footnote</code>や<code>@page { @footnote { } }</code>の対象にならない<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>点に注意。</p>
<section class="footnotes" role="doc-endnotes">
  <hr>
  <ol>
    <li id="fn1" role="doc-endnote">最初の後注の本文。<a href="#fnref1" class="footnote-back" role="doc-backlink">↩</a></li>
    <li id="fn2" role="doc-endnote">次の後注の本文。<a href="#fnref2" class="footnote-back" role="doc-backlink">↩</a></li>
  </ol>
</section>
```

</details>

#### `footnote`オプションのオブジェクト形式

`footnote`はオブジェクト`{ mode, body }`の形でも指定でき、生成HTMLをカスタマイズできます:

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

#### YAMLフロントマターによるファイル単位の設定

脚注モードはファイルごとにYAMLフロントマターで指定でき、グローバル設定を上書きできます:

```yaml
---
vfm:
  footnote: dpub  # | pandoc | gcpm
---
```

プロジェクト全体ではデフォルト設定を使いつつ、特定のファイルだけ別モードに切り替えたい場合に便利です。

## 脚注のカスタマイズ

### ページスコープリセットとクロススコープカウンタ

脚注カウンタをページグループ単位でリセットできるようになりました。章ごとに脚注番号を新規に採番する書籍で便利です。`counter-reset`を、[ページグループガイド](./page-groups/)で扱う名前付きページの仕組みと組み合わせて使います。

### CSSプロパティ一覧

|プロパティ・at-rule |役割|
|---|---|
| `float: footnote` |ブロックレベル要素をページ下部の脚注エリアに移動|
| `footnote-policy` |注をページ間で分割するかを制御|

## まとめ

VFMで利用できる注の種類と、その記法・設定・CSSの対応:

|注の種類| VFMでの記法| `vivliostyle.config.js` |テーマ・CSS |備考|
|---|---|---|---|---|
| **後注**（endnotes）| `[^1]` | `vfm: { footnote: 'pandoc' }`（デフォルト）|不要（通常フローで`<section role="doc-endnotes">`出力）| `@footnote`非対応|
| **脚注・CSSクラス方式**（footnotes）| `[^1]` | `vfm: { footnote: 'gcpm' }` | `.footnote { float: footnote }`を含むテーマが**必要**（theme-base / theme-techbook）| `<span class="footnote">`として出力。VFM v2.6新機能|
| **脚注・DPUB-ARIA方式**（footnotes）| `[^1]` | `vfm: { footnote: 'dpub' }` | **不要**（v2.41で自動対応）| `<aside role="doc-footnote">`として出力。VFM v2.6新機能。将来デフォルト化予定（[#234](https://github.com/vivliostyle/vfm/issues/234)）|
| **傍注**（sidenotes）| — | — | — | VFMの脚注モード（`pandoc` / `gcpm` / `dpub`）では**サポートされない**。傍注を実現するにはカスタムHTML+CSSによる独自実装が必要|

> **gcpmとdpubの選択指針**:
>
> - **dpub推奨**:テーマCSS不要で手軽に脚注が使える。将来デフォルト化予定
> - **gcpm**:既存テーマ（theme-base / theme-techbook）との互換性が必要な場合、またはオブジェクト形式の`body`コールバックでHTMLを変形したい場合

## 参照

- W3C [CSS GCPM 3 §2 Footnotes](https://www.w3.org/TR/css-gcpm-3/#footnotes)
- W3C [DPUB-ARIA 1.1](https://www.w3.org/TR/dpub-aria-1.1/)（`doc-noteref` / `doc-footnote`の定義）
- W3C [日本語組版処理の要件 §4.2注の処理](https://www.w3.org/TR/jlreq/#processing-of-notes-in-japanese)
- Qiita: [@u1f992「Vivliostyle.js v2.41（CLI v10.5）の脚注機能をMarkdownで利用する」](https://qiita.com/u1f992/items/6466c03aa4f569a39572)
- テストケース: [`vivliostyle.js/packages/core/test/files/footnotes/`](https://github.com/vivliostyle/vivliostyle.js/tree/master/packages/core/test/files/footnotes/)
- VFMソース: [`vfm/src/plugins/footnotes.ts`](https://github.com/vivliostyle/vfm/blob/main/packages/vfm/src/plugins/footnotes.ts)、[PR#226](https://github.com/vivliostyle/vfm/pull/226)、[PR#231](https://github.com/vivliostyle/vfm/pull/231)
- VFM [Issue #234](https://github.com/vivliostyle/vfm/issues/234)（dpubデフォルト化計画）
- テーマ: [`theme-base/css/partial/footnote.css`](https://github.com/vivliostyle/themes/blob/main/packages/%40vivliostyle/theme-base/css/partial/footnote.css)、[`theme-techbook/theme.css`](https://github.com/vivliostyle/themes/blob/main/packages/%40vivliostyle/theme-techbook/theme.css)
