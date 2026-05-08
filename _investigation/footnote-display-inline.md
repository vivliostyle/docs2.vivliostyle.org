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
> v2.41.0 で `footnote-display: inline` が DPUB-ARIA 脚注の本文を視覚的に
> 1 行に流し込まない

本文（日本語、起票時に確認・調整）:

```
### 概要

`<aside role="doc-footnote">`（または `.footnote` クラス）に対して
`footnote-display: inline` を指定しても、脚注エリアでは各脚注本文が
それぞれ別の行にブロック積みされ、デフォルトの
`footnote-display: block` と視覚的に区別がつきません。

同じ現象がリポジトリ内蔵のテストファイル
`packages/core/test/files/footnotes/dpub-footnote-display.html` でも
観察され、「footnote-display: inline」セクションは
「footnote-display: block」セクションと同じ見た目になります。

### 環境

- `@vivliostyle/cli` 10.5.0
- `@vivliostyle/viewer` 2.41.0
- `@vivliostyle/core` 2.42.0
- macOS、`vivliostyle preview` 経由（Chromium 系ブラウザ）

### 再現方法

最小再現の HTML を以下に置いています（参照リンク参照）:
`docs2.vivliostyle.org/_screenshots/footnotes/{en,ja}/05-footnote-display-inline.html`

簡略な再現コード:

(ja/05 を縮めたインライン HTML を貼る)

### 期待される挙動

CSS GCPM 3 §2.4 footnote-display およびドキュメントサイトの
[脚注ガイド](https://docs.vivliostyle.org/ja/cookbook/footnotes/)
（対象バージョン Vivliostyle.js v2.41.0+）に従えば、3 件の短い脚注本文は
脚注エリアで 1 行（または 1 つの inline run として折り返しを含むひとつの
連続）に流れるはずです。

### 実際の挙動

3 件の脚注が縦積みされ、`footnote-display: block` と区別がつきません。
スクリーンショット添付。

### 試したパターン

- `.footnote { footnote-display: inline }`
- `.footnote-display-inline .footnote { footnote-display: inline }`
  （`dpub-footnote-display.html` テストと同じ書き方）
- `aside[role="doc-footnote"] { footnote-display: inline }`
- フォールバックとして `display: inline` を併記
  → `display: inline` 自体は反映され aside が本文中にもインライン表示
  されてしまった（UA の `display: none` を上書き）。脚注エリア側は
  依然として block 表示のまま。
- ページサイズの拡大（148×210 / 180×110）

### 補足

- `semantic-footnote.ts` の `getFootnoteDisplayOverride` は
  `footnote-display: inline` をソースから読み取るコードになっており、
  cascade の段階では正しく拾われています。にもかかわらず最終的な
  レイアウトに変化が見えないため、後段のレイアウト処理側で適用が
  落ちている可能性があります。
- この問題は、Vivliostyle ドキュメントサイト v2.41.0 向け脚注ガイドの
  スクリーンショット撮影中に発見しました。

### 関連リンク

- docs2.vivliostyle.org Issue #15
- docs2.vivliostyle.org ブランチ `feat/issue-15-new-features-section`
- 再現用 HTML: `_screenshots/footnotes/{en,ja}/05-footnote-display-inline.html`
```

## 次のステップ

1. **本ファイルをコミット**して投稿前のメモとして残す
2. ユーザの確認のうえ、`gh issue create` で Vivliostyle.js リポジトリに
   起票（または手動投稿）
3. 起票後、記事 `content/{en,ja}/cookbook/footnotes.md` の §8
   `footnote-display` 節に「v2.41.0 で視覚的に確認できない（[Issue
   #XXXX](URL)）」と注記を入れる
