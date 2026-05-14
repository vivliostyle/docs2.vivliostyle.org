---
title: 脚注ガイド
description: Vivliostyle.jsの脚注サポート — 従来できたこととv2.41.0の新機能
lang: ja
order: 2
---

# 脚注ガイド

> **対象バージョン**: Vivliostyle.js v2.41.0+（2026-04-11リリース）／v2.42.0+（2026-04-25リリース、機能による）、Vivliostyle CLI v10.6.0+（Viewer 2.42.1同梱）
> **公開日**: 2026-05-05
> **最終更新日**: 2026-05-14
>
> - **v2.41.0で追加**: DPUB-ARIA脚注の自動認識（`float: footnote`のビルトイン適用）、`@page { @footnote { … } }`ルールと`@footnote ::before`コンテンツ
> - **v2.42.0で追加**: DPUB-ARIA由来の脚注に対するCSS footnoteプロパティ／擬似要素（`footnote-display`、`::footnote-call`、`::footnote-marker`のcontent/list-style-positionなど、[#1884](https://github.com/vivliostyle/vivliostyle.js/issues/1884)）
>
> Vivliostyle CLI 10.6.0以降はViewer 2.42.1を同梱しているため、追加の`overrides`設定なしで本ガイドのv2.42.0機能を`vivliostyle preview` / `vivliostyle build`からそのまま利用できます。

このガイドでは、Vivliostyle.js（およびVFM）で脚注を扱う方法を、**v2.41.0以前から提供されていた機能**と**v2.41.0 / v2.42.0で新たに加わった機能**に分けて解説します。

## Part 1 · 概要

Vivliostyle.js v2.41.0で追加された脚注関連の新機能:

- **DPUB-ARIA脚注サポート**（[#1700](https://github.com/vivliostyle/vivliostyle.js/issues/1700)、[PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703)）— `role="doc-noteref"` / `role="doc-footnote"`属性による脚注認識。ビルトインUAスタイルにより**テーマ不要で自動的に`float: footnote`が適用**される
- **CSS `@footnote`ルール**（[#1045](https://github.com/vivliostyle/vivliostyle.js/issues/1045)、[#1723](https://github.com/vivliostyle/vivliostyle.js/issues/1723)）— CSS GCPM 3標準の`@page { @footnote { ... } }`による脚注エリアのスタイリング。`::before`コンテンツレンダリングにも対応
- **`footnote-display`プロパティ**（[#1825](https://github.com/vivliostyle/vivliostyle.js/issues/1825)）— `block` / `inline` / `compact`の指定で脚注のインライン表示が可能に
- **`list-style-position: outside` for `::footnote-marker`**（[#1702](https://github.com/vivliostyle/vivliostyle.js/issues/1702)）
- **ページスコープ脚注リセット** — ページグループ間でのカウンタ連携

### Vivliostyle.js v2.41.0で対応する脚注認識メカニズム

|メカニズム| HTMLパターン|テーマCSS |備考|
|---|---|---|---|
| **CSS GCPM**（既存）| `<span class="footnote">` | `.footnote { float: footnote }`を含むテーマが**必要** | theme-base / theme-techbookで対応|
| **EPUB**（既存）| `epub:type="noteref"` / `epub:type="footnote"` |不要（ビルトインで認識）| |
| **DPUB-ARIA**（v2.41.0新規）| `<a role="doc-noteref">` → `<aside role="doc-footnote">` | **不要**（ビルトインUAスタイルで自動適用）| [PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703) |

### 早見表（v2.41.0の脚注機能）

|新|やりたいこと| `vivliostyle.config.js` |テーマ・CSS |結果|
|:---:|---|---|---|---|
| |後注（文末）| `vfm: { footnote: 'pandoc' }`（デフォルト）|不要|文末の後注セクション|
| | HTMLで直接記述する脚注（CSSクラス方式）| —（HTML直書き）| theme-base / theme-techbook | `float: footnote`による脚注|
| ★ |脚注（VFM→GCPM変換）| `vfm: { footnote: 'gcpm' }` | theme-base / theme-techbook | CSSクラスベースの脚注|
| ★ |脚注（VFM→DPUB変換）| `vfm: { footnote: 'dpub' }` | **不要**（v2.41.0のUAスタイルで自動適用）| DPUB-ARIAベースの脚注|
| ★ |脚注エリアのスタイリング| `gcpm` / `dpub`またはHTML直書き| `@page { @footnote { ... } }` | v2.41.0で標準CSS対応|
| ★ |インライン脚注表示| `gcpm` / `dpub`またはHTML直書き| `footnote-display: inline` | v2.41.0新機能|

### 用語について

本ガイドの注に関する用語は、W3C [日本語組版処理の要件（JLReq）§4.2「注の処理」](https://www.w3.org/TR/jlreq/#processing-of-notes-in-japanese)の定義に基づきます。

- **脚注**（footnotes）:ページ下部（横組では版面の地側）に配置される注（[JLReq §4.2.5](https://www.w3.org/TR/jlreq/#processing_of_footnotes_in_horizontal_writing_mode)）
- **後注**（endnotes）:段落・節・章・本文全体の後ろに配置される注（[JLReq §4.2.4](https://www.w3.org/TR/jlreq/#processing_of_endnotes_in_vertical_writing_mode_or_horizontal_writing_mode)）
- **傍注**（sidenotes）:小口側に配置される注（[JLReq §4.2.6](https://www.w3.org/TR/jlreq/#processing_of_sidenote_in_vertical_writing_mode)）

**VFMの脚注モードと傍注**: VFMの3つのモード（`pandoc` / `gcpm` / `dpub`）はいずれも傍注（sidenotes）を直接サポートしません。`dpub`モードは`<aside role="doc-footnote">`を生成しますが、Vivliostyle.jsのビルトインUAスタイルにより`float: footnote`が自動適用されるため、結果として**ページ脚注**として表示されます。

**CSS `@footnote`の適用範囲**: CSS GCPM 3の`@page { @footnote { ... } }`および`footnote-display`は、`float: footnote`でページ下部に配置される**脚注（footnotes）のみ**に適用されます。後注（endnotes）には影響しません。

## Part 2 · 従来の脚注サポート

### 1. CSS組版における注の役割

注（脚注・後注）は書籍出版に欠かせない要素です。CSS Generated Content for Paged Media（GCPM）Module 3は、ブロックレベルの要素を本文フローから取り出してページ下部の脚注エリアに流し込むメカニズムとして`float: footnote`を定義しています。

### 2. HTMLで直接記述する方法

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

### 3. VFMのPandoc形式後注（従来のデフォルト）

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

### 4. theme-techbookの画面表示と印刷表示

theme-techbookは`@media screen`と`@media print`で別々のスタイルを提供しているため、画面プレビューと印刷PDFで注の見た目が異なります。印刷時の見た目を確認するにはVivliostyle Viewerを使ってください。

## Part 3 · v2.41.0の新しい脚注機能

### 5. DPUB-ARIA脚注サポート（[#1700](https://github.com/vivliostyle/vivliostyle.js/issues/1700)、[PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703)）

Vivliostyle.js v2.41.0は、DPUB-ARIAロールから直接脚注を認識します:

```html
<p>本文<a role="doc-noteref" href="#fn1">1</a>はここに続く。</p>
<aside id="fn1" role="doc-footnote">注の本文。</aside>
```

ビルトインUAスタイルが`[role="doc-footnote"]`に対して`float: footnote`を適用するため、これは**テーマCSSなしで**動作します。注はページ下部に表示され、本文中の参照番号（`::footnote-call`）も自動生成されます。

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

Vivliostyle.js v2.41.0+のビルトインUAスタイルが`float: footnote`を自動で適用するため、テーマCSSなしでもページ下部の脚注エリアに配置される[^2]。

[^1]: 脚注の本文。CSSは何も書いていない。

[^2]: もう一つの注。連番は自動。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p>本文中に<code>[^1]</code>と書くと、VFM dpubモードは<code>&#x3C;a role="doc-noteref"></code><a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>と<code>&#x3C;aside role="doc-footnote"></code>を出力する。</p>
<p>Vivliostyle.js v2.41.0+のビルトインUAスタイルが<code>float: footnote</code>を自動で適用するため、テーマCSSなしでもページ下部の脚注エリアに配置される<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>。</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>脚注の本文。CSSは何も書いていない。</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>もう一つの注。連番は自動。</aside>
```

</details>

> **マーカー表示について（v2.42.0+）**:脚注エリア側のマーカー（`::footnote-marker`）のcontentをauthor CSSから指定して番号を出すには、**Vivliostyle.js v2.42.0+**が必要です（[#1884](https://github.com/vivliostyle/vivliostyle.js/issues/1884)で追加）。さらにVivliostyleのDPUB-ARIA実装では、`::footnote-marker`の`content`プロパティを**`list-style-position: outside`**とセットで指定したときに描画されます（`outside`でなければauthorの`content`は描画されません）:
>
> ```css
> aside.footnote { margin-inline-start: 1.5em; }  /* マーカー領域の確保 */
> aside.footnote::footnote-marker {
>   content: counter(footnote) ". ";
>   list-style-position: outside;  /* DPUB-ARIA で必須 */
> }
> ```
>
> v2.41.0環境で同等の見た目にしたい場合は、asideの中に`<sup>n</sup>`を直接書くなどHTML側で番号を持たせる方法でも代用できます。

### 6. 3つの認識メカニズムの比較

|メカニズム|由来|認識パターン|テーマCSS |
|---|---|---|---|
| CSS GCPM | CSS Generated Content for Paged Media | `<span class="footnote">` |必要|
| EPUB | EPUB 3 | `epub:type="noteref"` / `epub:type="footnote"` |不要|
| DPUB-ARIA | W3C DPUB-ARIA 1.1 | `role="doc-noteref"` / `role="doc-footnote"` |不要（v2.41.0）|

3つのメカニズムは同一ドキュメント内で共存できますが、実際にはソースに応じてどれか1つを採用するのが普通です。

### 7.標準CSSの`@footnote`ルールサポート（[#1045](https://github.com/vivliostyle/vivliostyle.js/issues/1045)、[#1723](https://github.com/vivliostyle/vivliostyle.js/issues/1723)）

これまでVivliostyleはベンダー固有の`@-adapt-footnote-area` at-ruleを使っていましたが、v2.41.0は標準のCSS GCPM 3 `@footnote`ルールに対応します:

```css
@page {
  @footnote {
    border-top: 0.5pt solid black;
    padding-top: 4pt;
    font-size: 0.85em;
  }
}
```

`::before`コンテンツも描画されるので、ラベルを前置できます。**正しい構文はスペース1つを挟む`@footnote ::before`**（スペースなしでは`@page`ブロック全体が無効化されるので注意）:

```css
@page {
  @footnote ::before {
    content: "Notes:";
    display: block;
    font-weight: bold;
  }
}
```

![`@page { @footnote { ... } @footnote ::before { ... } }`で脚注エリアに上罫線・「Notes」見出しを与えた例](/cookbook/footnotes/ja/04-page-footnote-styled.png)

<details>
<summary>VFM Markdownソース</summary>

```markdown
---
title: "例4: @page { @footnote { … } }によるカスタムスタイル"
vfm:
  footnote: dpub
---

`@page { @footnote { … } }`で脚注エリアにスタイルを与える例[^1]。上罫線・字下げ・`::before`による「脚注:」見出しを生成している。

複数の注がある場合[^2]、見出しはエリア全体に対して1度だけ表示される。

[^1]: スタイル付きの脚注。

[^2]: もう一つのスタイル付き脚注。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p><code>@page { @footnote { … } }</code>で脚注エリアにスタイルを与える例<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>。上罫線・字下げ・<code>::before</code>による「脚注:」見出しを生成している。</p>
<p>複数の注がある場合<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>、見出しはエリア全体に対して1度だけ表示される。</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>スタイル付きの脚注。</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>もう一つのスタイル付き脚注。</aside>
```

</details>

### 8. `footnote-display`プロパティ（[#1825](https://github.com/vivliostyle/vivliostyle.js/issues/1825)）

> **DPUB-ARIA脚注に適用するにはVivliostyle.js v2.42.0+が必要**（[#1884](https://github.com/vivliostyle/vivliostyle.js/issues/1884)で追加）。GCPMのclass方式`<span class="footnote">`にはv2.41.0以前から適用可能です。

脚注本体のレイアウト方式を切り替えます。指定先は`@footnote`ルールの中ではなく**脚注要素自身**です:

- `block`（デフォルト）— 各脚注を改行
- `inline` — 複数の脚注を同じ行にフロー
- `compact` — 短い脚注はインライン、長い脚注は自動的にブロックへフォールバック

```css
.footnote { footnote-display: inline; }
```

`inline`の表示例:

![`footnote-display: inline`で3件の短い脚注が同じ行に流れ込む](/cookbook/footnotes/ja/05-footnote-display-inline.png)

<details>
<summary>VFM Markdownソース</summary>

```markdown
---
title: "例5: footnote-display: inline"
vfm:
  footnote: dpub
---

`footnote-display: inline`を指定すると、複数の脚注が同じ行に流れ込む[^1]。本文中の参照を3つ並べた場合[^2]でも、脚注エリアの縦方向のスペース消費が抑えられる[^3]。

[^1]: 短い注。

[^2]: もう一つの短い注。

[^3]: 別の短い注。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p><code>footnote-display: inline</code>を指定すると、複数の脚注が同じ行に流れ込む<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>。本文中の参照を3つ並べた場合<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>でも、脚注エリアの縦方向のスペース消費が抑えられる<a id="fnref3" href="#fn3" class="footnote-ref" role="doc-noteref"><sup>3</sup></a>。</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>短い注。</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>もう一つの短い注。</aside>
<aside id="fn3" class="footnote" role="doc-footnote"><a href="#fnref3" class="footnote-back" role="doc-backlink"><sup>3</sup></a>別の短い注。</aside>
```

</details>

`compact`の表示例（短い注はインライン、長い注はブロックフォールバック）:

![`footnote-display: compact`で短い注3件がインラインに、長い注がブロックにフォールバック](/cookbook/footnotes/ja/06-footnote-display-compact.png)

<details>
<summary>VFM Markdownソース</summary>

```markdown
---
title: "例6: footnote-display: compact"
vfm:
  footnote: dpub
---

`footnote-display: compact`は、短い脚注はインライン[^1]でまとまって流れ[^2]、続く短い注も同じ行に並ぶ[^3]。一方で1行に収まらない長い注は自動でブロック扱いになる[^4]。

[^1]: 短い注。

[^2]: もう一つの短い注。

[^3]: 別の短い注。

[^4]: こちらは1行に収まらない長めの注で、compactでは自動的にブロック表示にフォールバックする挙動を確認する。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p><code>footnote-display: compact</code>は、短い脚注はインライン<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>でまとまって流れ<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>、続く短い注も同じ行に並ぶ<a id="fnref3" href="#fn3" class="footnote-ref" role="doc-noteref"><sup>3</sup></a>。一方で1行に収まらない長い注は自動でブロック扱いになる<a id="fnref4" href="#fn4" class="footnote-ref" role="doc-noteref"><sup>4</sup></a>。</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>短い注。</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>もう一つの短い注。</aside>
<aside id="fn3" class="footnote" role="doc-footnote"><a href="#fnref3" class="footnote-back" role="doc-backlink"><sup>3</sup></a>別の短い注。</aside>
<aside id="fn4" class="footnote" role="doc-footnote"><a href="#fnref4" class="footnote-back" role="doc-backlink"><sup>4</sup></a>こちらは1行に収まらない長めの注で、compactでは自動的にブロック表示にフォールバックする挙動を確認する。</aside>
```

</details>

### 9. `::footnote-marker`の`list-style-position: outside`（[#1702](https://github.com/vivliostyle/vivliostyle.js/issues/1702)）

> **DPUB-ARIA脚注に対してauthor CSSの`::footnote-marker`を適用するにはVivliostyle.js v2.42.0+が必要**（[#1884](https://github.com/vivliostyle/vivliostyle.js/issues/1884)）。GCPMのclass方式ではv2.41.0以前から適用可能です。

脚注マーカーが`list-style-position`を尊重するようになりました。マーカーを脚注本体の外側に配置することで、ぶら下げインデントの体裁が作れます:

```css
aside.footnote { margin-inline-start: 1.5em; }
aside.footnote::footnote-marker {
  content: counter(footnote) ". ";
  list-style-position: outside;
}
```

![`::footnote-marker`の`list-style-position: outside`でマーカーが本文左にぶら下がり、継続行が本文左端に揃うハンギングインデント](/cookbook/footnotes/ja/07-footnote-marker-outside.png)

<details>
<summary>VFM Markdownソース</summary>

```markdown
---
title: "例7: ::footnote-markerのlist-style-position: outside"
vfm:
  footnote: dpub
---

`::footnote-marker`に`list-style-position: outside`を指定すると、マーカーが本文の外側にぶら下がる[^1]。複数行にわたる脚注の継続行が、番号の下ではなく本文の左端に揃って読みやすくなる[^2]のが利点。

[^1]: この注の番号はぶら下げインデントで本文の左側に張り出し、複数行に渡る場合の継続行は番号の下ではなく本文の左端に揃う。

[^2]: もう一つの注。同じくぶら下げインデントが適用される。
```

</details>

<details>
<summary>VFMが生成するHTML（body部）</summary>

```html
<p><code>::footnote-marker</code>に<code>list-style-position: outside</code>を指定すると、マーカーが本文の外側にぶら下がる<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>。複数行にわたる脚注の継続行が、番号の下ではなく本文の左端に揃って読みやすくなる<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>のが利点。</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>この注の番号はぶら下げインデントで本文の左側に張り出し、複数行に渡る場合の継続行は番号の下ではなく本文の左端に揃う。</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>もう一つの注。同じくぶら下げインデントが適用される。</aside>
```

</details>

なおVivliostyleのDPUB-ARIA実装では、`::footnote-marker`のcontentを**`list-style-position: outside`**とセットで指定したときに描画されます。`inside`（CSSのデフォルト）ではauthorのcontentが描画されないので注意してください（GCPMのclass方式`<span class="footnote">`ではどちらでも描画されます）。詳細は §5の「マーカー表示について」を参照。

### 10.ページスコープリセットとクロススコープカウンタ

脚注カウンタをページグループ単位でリセットできるようになりました。章ごとに脚注番号を新規に採番する書籍で便利です。`counter-reset`を、[ページグループガイド](./page-groups/)で扱う名前付きページの仕組みと組み合わせて使います。

### 11. VFMの3つの`footnote`モード（VFM [PR#226](https://github.com/vivliostyle/vfm/pull/226)、[PR#231](https://github.com/vivliostyle/vfm/pull/231)）

VFM v2.6.0は`footnote`オプションを導入しました:

- `'pandoc'`（デフォルト）— 後注（ドキュメント末尾の`<section role="doc-endnotes">`）
- `'gcpm'`（新機能）— `<span class="footnote">`による脚注（テーマCSS必要）
- `'dpub'`（新機能）— `<aside role="doc-footnote">`による脚注（**テーマCSS不要**、将来デフォルト化予定 — [#234](https://github.com/vivliostyle/vfm/issues/234)）

`vivliostyle.config.js`での設定:

```js
export default {
  vfm: {
    footnote: 'dpub',
  },
  // ...
};
```

### 12. VFM `footnote`オプションのオブジェクト形式

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

|プロパティ・at-rule |役割|
|---|---|
| `float: footnote` |ブロックレベル要素をページ下部の脚注エリアに移動|
| `@page { @footnote { ... } }` |脚注エリア自体のスタイリング|
| `footnote-display` | `block` / `inline` / `compact` |
| `footnote-policy` |注をページ間で分割するかを制御|
| `::footnote-call` |本文中の参照マーカーの擬似要素|
| `::footnote-marker` |注本体の横に表示されるマーカーの擬似要素|

## Part 4 · まとめ

VFMで利用できる注の種類と、その記法・設定・CSSの対応:

|注の種類| VFMでの記法| `vivliostyle.config.js` |テーマ・CSS |備考|
|---|---|---|---|---|
| **後注**（endnotes）| `[^1]` | `vfm: { footnote: 'pandoc' }`（デフォルト）|不要（通常フローで`<section role="doc-endnotes">`出力）| `@footnote` / `footnote-display`非対応|
| **脚注・CSSクラス方式**（footnotes）| `[^1]` | `vfm: { footnote: 'gcpm' }` | `.footnote { float: footnote }`を含むテーマが**必要**（theme-base / theme-techbook）| `<span class="footnote">`として出力。VFM v2.6.0新機能|
| **脚注・DPUB-ARIA方式**（footnotes）| `[^1]` | `vfm: { footnote: 'dpub' }` | **不要**（v2.41.0のUAスタイルで自動適用）。カスタマイズは`@page { @footnote {} }`などで| `<aside role="doc-footnote">`として出力。VFM v2.6.0新機能。将来デフォルト化予定（[#234](https://github.com/vivliostyle/vfm/issues/234)）|
| **傍注**（sidenotes）| — | — | — | VFMの脚注モード（`pandoc` / `gcpm` / `dpub`）では**サポートされない**。傍注を実現するにはカスタムHTML+CSSによる独自実装が必要|

> **gcpmとdpubの選択指針**:
>
> - **dpub推奨**:テーマCSS不要で手軽に脚注が使える。将来デフォルト化予定
> - **gcpm**:既存テーマ（theme-base / theme-techbook）との互換性が必要な場合、またはオブジェクト形式の`body`コールバックでHTMLを変形したい場合

## 参照

- W3C [CSS GCPM 3 §2 Footnotes](https://www.w3.org/TR/css-gcpm-3/#footnotes)
- W3C [DPUB-ARIA 1.1](https://www.w3.org/TR/dpub-aria-1.1/)（`doc-noteref` / `doc-footnote`の定義）
- W3C [日本語組版処理の要件 §4.2注の処理](https://www.w3.org/TR/jlreq/#processing-of-notes-in-japanese)
- Qiita: [@u1f992「Vivliostyle.js v2.41.0（CLI v10.5.0）の脚注機能をMarkdownで利用する」](https://qiita.com/u1f992/items/6466c03aa4f569a39572)
- テストケース: `vivliostyle.js/packages/core/test/files/footnotes/`
- VFMソース: `vfm/src/plugins/footnotes.ts`、[PR#226](https://github.com/vivliostyle/vfm/pull/226)、[PR#231](https://github.com/vivliostyle/vfm/pull/231)
- VFM [Issue #234](https://github.com/vivliostyle/vfm/issues/234)（dpubデフォルト化計画）
- テーマ: `themes/packages/@vivliostyle/theme-base/css/partial/footnote.css`、`theme-techbook/theme.css`
