# `footnote-display: inline` が author CSS から効かない件

Vivliostyle.js のドキュメントサイトで脚注ガイド記事のスクリーンショットを
撮影中に発見した問題のメモ。

## 環境

- `@vivliostyle/cli` **10.5.0**
- `@vivliostyle/viewer` **2.41.0**
- `@vivliostyle/core` **2.42.0**（CLI が依存）
- macOS / Chrome 経由 `vivliostyle preview`

## 期待する挙動（CSS GCPM 3）

```css
.footnote {
  footnote-display: inline;
}
```

を指定すると、複数の DPUB-ARIA 脚注（`<aside role="doc-footnote">`）が
**脚注エリア内で 1 行（または最小限の行数）にインラインで流し込まれる**。

参考: [CSS GCPM 3 §2.4 footnote-display](https://www.w3.org/TR/css-gcpm-3/#footnote-display)

## 実際の挙動

`@vivliostyle/cli@10.5.0` 環境で `vivliostyle preview` を実行すると、
**`footnote-display: inline` を author CSS で指定しても、脚注エリアでは
各注がブロックレベルで縦積みされる**（block 表示と区別がつかない）。

## 試したパターン（すべて未動作）

### 1. 最小構成

```html
<style>
  .footnote { footnote-display: inline; }
</style>
<aside class="footnote" role="doc-footnote">注1</aside>
<aside class="footnote" role="doc-footnote">注2</aside>
<aside class="footnote" role="doc-footnote">注3</aside>
```

### 2. テストファイル `dpub-footnote-display.html` と同じセクションラップ

```html
<style>
  .footnote-display-inline .footnote { footnote-display: inline; }
</style>
<section class="footnote-display-inline">
  <p>...<a role="doc-noteref" href="#fn1">1</a>...</p>
  <aside id="fn1" class="footnote" role="doc-footnote">注1</aside>
</section>
```

### 3. テストファイル完全一致パターン（footnote-ref class、backlink つき）

```html
<a id="ref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>
...
<aside id="fn1" class="footnote" role="doc-footnote">
  <a href="#ref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>
  注1
</aside>
```

### 4. 属性セレクタ

```css
aside[role="doc-footnote"] { footnote-display: inline; }
```

### 5. `display: inline` フォールバック

```css
.footnote { footnote-display: inline; display: inline; }
```

→ `display: inline` 自体は反映され、aside が **本文中に** インライン表示
されてしまった（UA の `display: none` を上書き）。脚注エリアの方は依然
として block 表示のまま。

### 6. ページサイズ拡大

180×110mm でも 148×210mm（A5）でも、結果は同じ。

## 観察

### テストファイル自体の挙動

`submodules/vivliostyle.js/packages/core/test/files/footnotes/dpub-footnote-display.html`
を `vivliostyle preview` で開くと、「footnote-display: inline」セクション
の脚注エリアでも 3 件の注が**別々の行**に表示される（block と視覚的に
区別がつかない）。

つまり**テストが通っている挙動 = 視覚的にインラインに見える**ではない
可能性がある（テストはピクセル比較かもしれず、内部状態のみ正しければ
通るのかも）。

### 関連ソース

`packages/core/src/vivliostyle/semantic-footnote.ts` の
`getFootnoteDisplayOverride`:

```typescript
const footnoteDisplay = styleAccess.getProp(style, "footnote-display");
if (footnoteDisplay) {
  return footnoteDisplay;
}
const display = styleAccess.getProp(style, "display");
if (display?.value === Css.ident.inline) {
  return styleAccess.createCascadeValue(Css.ident.inline, display.priority);
}
return null;
```

`footnote-display` プロパティは元の脚注要素のスタイルから読まれる
仕様。読まれているのに視覚効果に出ない、ということは、後続のレイアウト
処理側で適用が落ちている可能性が高い。

## 切り分けに必要そうな情報

- v2.41.0 で `footnote-display: inline` が視覚的にインライン流し込みする
  サンプルが存在するか（テスト以外で）
- もし「内部状態のみ」のサポートだとしたら、それは仕様？それともバグ？
- `supported-css-features.md` には `footnote-display` の `block` /
  `inline` / `compact` がサポート済と記載あり

## Issue 草案

タイトル候補:
> `footnote-display: inline` does not visually flow DPUB-ARIA footnote
> bodies on the same line in v2.41.0

本文（英語、起票時に確認・調整）:

```
### Description

When `footnote-display: inline` is set on `<aside role="doc-footnote">`
footnote elements (or their `.footnote` class), the resulting
@footnote area still renders each footnote body on its own line
visually, with no observable difference from the default
`footnote-display: block`.

The same is observed when running the in-tree test file
`packages/core/test/files/footnotes/dpub-footnote-display.html` —
the "footnote-display: inline" section renders identically to the
"footnote-display: block" section.

### Environment

- `@vivliostyle/cli` 10.5.0
- `@vivliostyle/viewer` 2.41.0
- `@vivliostyle/core` 2.42.0
- macOS / Chromium-based browser via `vivliostyle preview`

### Reproduction

A minimal HTML reproducer is at
`docs2.vivliostyle.org/_screenshots/footnotes/{en,ja}/05-footnote-display-inline.html`
(see Refs).

Quick repro:

(Insert a small inline HTML similar to ja/05.)

### Expected

Per CSS GCPM 3 §2.4 footnote-display and the docs site
[Footnotes guide](https://docs.vivliostyle.org/en/new-features/footnotes/)
(target Vivliostyle.js v2.41.0+), the three short footnote bodies
should flow inline on a single line (or wrap as one inline run).

### Actual

Three footnotes render block-stacked, identical to
`footnote-display: block`. Screenshot attached.

### Patterns tried

- `.footnote { footnote-display: inline }`
- `.footnote-display-inline .footnote { footnote-display: inline }`
  (matches `dpub-footnote-display.html` test)
- `aside[role="doc-footnote"] { footnote-display: inline }`
- adding `display: inline` as a fallback (this leaks the aside into
  the body flow but does not change the @footnote area)
- larger page sizes (148×210, 180×110)

### Notes

- `getFootnoteDisplayOverride` in `semantic-footnote.ts` does pick up
  `footnote-display: inline` per the source, so the cascade works,
  but the resulting layout is unchanged.
- This was discovered while preparing screenshots for the
  Vivliostyle docs site Footnotes guide for v2.41.0.

### Refs

- docs2.vivliostyle.org Issue #15
- docs2.vivliostyle.org branch `feat/issue-15-new-features-section`
- Sample HTML files: `_screenshots/footnotes/{en,ja}/05-footnote-display-inline.html`
```

## 次のステップ

1. **本ファイルをコミット**して投稿前のメモとして残す
2. ユーザの確認のうえ、`gh issue create` で Vivliostyle.js リポジトリに
   起票（または手動投稿）
3. 起票後、記事 `content/{en,ja}/new-features/footnotes.md` の §8
   `footnote-display` 節に「v2.41.0 で視覚的に確認できない（[Issue
   #XXXX](URL)）」と注記を入れる
