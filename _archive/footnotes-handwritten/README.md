# 脚注ガイド スクリーンショット撮影環境

`content/{en,ja}/new-features/footnotes.md` に埋め込むスクリーンショットを
撮影するためのソース HTML を置く作業ディレクトリです。

## 設計方針

- **ページサイズを意図的に小さく設定**（140mm × 90mm 程度の短冊型）して、
  「本文の参照位置 + 脚注エリア」だけが 1 ページに収まるようにしてある。
  撮影時は **ページ全体** を撮るだけで OK。トリミング作業が不要になり、
  ファイルサイズも自然に抑えられる。
- 各 HTML は完全自己完結（CSS は `<style>` 内にインライン）。Vivliostyle.js
  v2.41.0+ で開けば、ガイド記事に対応する見え方を確認できる。

## ディレクトリ構成

```
_screenshots/footnotes/
├── README.md             ← このファイル
├── en/                   ← 英語サンプル本文の HTML
│   ├── 01-html-class-themebase.html
│   ├── 02-vfm-pandoc-endnotes.html
│   ├── 03-dpub-aria-default.html
│   ├── 04-page-footnote-styled.html
│   ├── 05-footnote-display-inline.html
│   ├── 06-footnote-display-compact.html
│   └── 07-footnote-marker-outside.html
└── ja/                   ← 日本語サンプル本文の HTML
    └── (same 7 files)
```

## 撮影手順

### 1. ローカルで開く

#### a) Vivliostyle CLI で個別プレビュー（推奨）

```sh
# 例: 日本語版の例 1 を開く
npx vivliostyle preview _screenshots/footnotes/ja/01-html-class-themebase.html
```

ブラウザが自動で開く。プレビュー画面で「単ページ」表示にする。

#### b) HTTP サーバ + Vivliostyle Viewer

```sh
npx http-server _screenshots/footnotes -p 8080
```

そのうえで Vivliostyle Viewer を以下の URL で開く:

```
https://vivliostyle.org/viewer/?src=http://localhost:8080/ja/01-html-class-themebase.html
```

### 2. 撮影

- 短冊型のページ全体（本文 + 脚注エリア）を 1 枚に収める
- 推奨フォーマット: **PNG**
- 解像度: Retina 相当（DPR 2x）程度

### 3. 保存先

```
public/new-features/footnotes/
├── en/
│   ├── 01-html-class-themebase.png
│   ├── …
└── ja/
    ├── 01-html-class-themebase.png
    └── …
```

`public/` 以下に置くことで Astro のデプロイに含まれる。

### 4. 記事への組み込み

`content/{en,ja}/new-features/footnotes.md` の該当セクションに以下のように
追記:

```markdown
![Footnote rendered with theme-base CSS](/new-features/footnotes/en/01-html-class-themebase.png)
```

```markdown
![theme-base で描画された脚注](/new-features/footnotes/ja/01-html-class-themebase.png)
```

Markdown への画像挿入作業は別ステップとして依頼してください。

## サンプル一覧

| #  | ファイル | デモする内容 | 対応する記事節 |
|----|---------|-----------|--------------|
| 01 | `01-html-class-themebase.html` | `<span class="footnote">` + GCPM クラス方式 | Part 2 §2 |
| 02 | `02-vfm-pandoc-endnotes.html` | VFM Pandoc 形式の後注 | Part 2 §3 |
| 03 | `03-dpub-aria-default.html` | DPUB-ARIA `<aside role="doc-footnote">`、テーマ CSS なし | Part 3 §5 |
| 04 | `04-page-footnote-styled.html` | `@page { @footnote { … } }` と `::before` | Part 3 §7 |
| 05 | `05-footnote-display-inline.html` | `footnote-display: inline` | Part 3 §8 |
| 06 | `06-footnote-display-compact.html` | `footnote-display: compact` | Part 3 §8 |
| 07 | `07-footnote-marker-outside.html` | `::footnote-marker` の `list-style-position: outside` | Part 3 §9 |

## ページ寸法について

各サンプルは以下で統一:

```css
@page {
  size: 140mm 90mm;
  margin: 12mm 14mm;
}
```

A5 などより明らかに小さいので、撮影された画像も自然と小さく仕上がる。
記事内に並べたときに本文を圧迫しないサイズを目指している。

## 注意

- これらの HTML は **記事内の文言と完全一致しません**。短冊サイズに収まる
  量の本文に絞ってあります。
- フォントは `Noto Serif JP` 系（日本語）/ `Source Serif Pro` 系（英語）を
  指定。インストールされていない場合は OS 既定の serif にフォールバック
  します。
