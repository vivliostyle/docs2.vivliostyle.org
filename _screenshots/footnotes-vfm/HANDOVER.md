# 引き継ぎノート（脚注ガイドのVFM由来サンプル化/ 2026-05-07）

## ここまでで完了している作業

- `_screenshots/footnotes-vfm/`配下を整備
  - `README.md`:設計方針・ディレクトリ構成・撮影手順・`_archive/footnotes-handwritten/`との差分
  - `build.mjs`: VFM `stringify()`を使い`ja/`・`en/`の各`.md`を読んで`dist/{lang}/{N}-name.html`を生成（CSSは`<style>`インライン）
  - `styles/_base.css`:短冊ページ寸法(140mm × 90mm)と共通タイポグラフィ
  - `styles/{01-07}…css`:各例固有の脚注CSS
    - 04のみ`04-page-footnote-styled.ja.css` / `…en.css`の2ファイル
      （`@footnote ::before`の見出しテキストが言語ごとに違うため）
  - `ja/{01-07}-{name}.md` × 7 / `en/{01-07}-{name}.md` × 7: VFM Markdownソース
- `node build.mjs`実行確認済み: 14ファイルを`dist/{ja,en}/`に出力

## 未着手（明日やるべきこと）

### 1.各HTMLの組版確認

```sh
cd _screenshots/footnotes-vfm
node build.mjs   #念のため再ビルド
npx vivliostyle preview dist/ja/01-gcpm-class.html
# jaの01〜07、enの01〜07を順に開く
```

確認ポイント:

- `_archive/footnotes-handwritten/{ja,en}/*`のスクリーンショットと比較
- 各例の意図どおりに脚注が見えるか:
  - 01:ページ下部の脚注エリアに上罫線つきで番号付きで配置
  - 02:本文末尾に`<section role="doc-endnotes">`が境界線つきで表示
  - 03:ページ下部の脚注エリアに番号+本文（バックリンク`<sup>`がそのまま番号として見える）
  - 04:上罫線・「脚注:」/ "Notes"見出し付きの脚注エリア
  - 05:短い注3件が同じ行にインラインで並ぶ
  - 06:短い注はインライン、長い注はブロックにフォールバック
  - 07:マーカー番号がぶら下げインデントで本文の左に張り出す

### 2.スクリーンショット撮影

- ページ全体（短冊サイズ）を1枚に収める
- 解像度: DPR 2x (Retina相当)
- 保存先: `public/cookbook/footnotes/{ja,en}/{N}-name.png`
  - **ファイル名は旧来と完全一致**（`01-html-class-themebase.png`等）にすると
    記事側の`![…](…)`を書き換えずに済む。VFM版に合わせて変えるなら
    記事側の参照も同時更新が必要

> 旧PNGファイル名（参考）:
> - `01-html-class-themebase.png` ← 新`01-gcpm-class.html`に対応
> - `02-vfm-pandoc-endnotes.png` ← 新`02-pandoc-endnotes.html`
> - `03-dpub-aria-default.png` ← 新`03-dpub-default.html`
> - `04-page-footnote-styled.png` ← 新`04-page-footnote-styled.html`
> - `05-footnote-display-inline.png` ← 新`05-footnote-display-inline.html`
> - `06-footnote-display-compact.png` ← 新`06-footnote-display-compact.html`
> - `07-footnote-marker-outside.png` ← 新`07-footnote-marker-outside.html`
>
> ファイル名はリネームしないほうが工数が小さいのでおすすめ。

### 3.記事`content/{ja,en}/cookbook/footnotes.md`の`<details>`書き換え

現在は手書きHTML全文が入っている`<details>`を、以下の内容に置換:

```markdown
<details>
<summary>VFM Markdownソース</summary>

```markdown
（_screenshots/footnotes-vfm/{lang}/{N}-name.mdの本文）
```

</details>

<details>
<summary>VFMが生成するHTML</summary>

```html
（_screenshots/footnotes-vfm/dist/{lang}/{N}-name.htmlの本文。
 必要なら<style>セクションを除いて<body>内のみに絞ってもよい）
```

</details>
```

明日の判断ポイント:
- **2つの`<details>`を並べる**か、**1つにまとめる**か
- HTML全文（`<style>`含む）を貼るか、`<body>`の中身だけ抽出して貼るか
- CSSを別の`<details>`で分けるか

### 4.`_archive/footnotes-handwritten/`の処理

VFM版で齟齬なくスクリーンショット撮影が完了した時点で、旧ディレクトリは
役目を終える。判断:

- 削除するか
- `_archive/footnotes-handwritten/`に退避するか（履歴保存）
- そのまま残すか（再生成元として将来も使う可能性があるなら残す）

## 設計上のメモ

### VFM出力構造のおさらい（既に検証済み）

|モード|本文中|脚注本体|
|---|---|---|
| pandoc | `<a class="footnote-ref" role="doc-noteref"><sup>n</sup></a>` | `<section class="footnotes" role="doc-endnotes"><hr><ol>…</ol></section>` |
| gcpm |（参照はinline展開せず脚注本体が文中に埋め込まれる）| `<span class="footnote" id="fn-N" role="doc-footnote">本文</span>` |
| dpub | `<a class="footnote-ref" role="doc-noteref"><sup>n</sup></a>` | `<aside class="footnote" role="doc-footnote"><a class="footnote-back"><sup>n</sup></a>本文</aside>` |

これは`_screenshots/footnotes-vfm/`直下のサンプル`.md`を`node build.mjs`
すれば実物が`dist/{lang}/*.html`に出るので、書き換え時に転記元として使える。

### 旧サンプルとの主要な違い

- **02 (Pandoc)**: VFMは`<hr>`を入れる。CSSで`display: none`にして
  旧サンプルと同じ罫線の見た目を保持している
- **03 (dpub default)**:旧サンプルはaside内にマーカー`<sup>n</sup>`を
  手書きしていた。VFMはバックリンク`<a class="footnote-back"><sup>n</sup></a>`
  として同じ視覚効果を生むので、見た目は近い
- **05〜07 (dpub + display/marker系)**:クラス名（`footnote-ref`, `footnote`,
  `footnote-back`）がVFM出力と既存CSSで一致しているので、CSSは
  旧サンプルからほぼそのまま流用できた

### 今後の保守性

`build.mjs`は依存関係:
- `@vivliostyle/vfm` (リポジトリ依存に既存)
- `gray-matter` (リポジトリ依存に既存)

なので`npm install`不要、`node build.mjs`だけで再生成できる。
記事の文言や脚注の内容を変える場合は`.md`を編集 → 再ビルド → 該当
スクリーンショットを撮り直す。
