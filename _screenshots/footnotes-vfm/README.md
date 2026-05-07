# 脚注ガイド スクリーンショット撮影環境（VFM版）

`content/{en,ja}/new-features/footnotes.md`に埋め込むスクリーンショットの
撮影元を、**VFMが`[^1]` Markdown記法から実際に生成するHTML**に
切り替えるための作業ディレクトリです。

旧`_screenshots/footnotes/`は手書きのHTML（vivliostyle.jsテスト
フィクスチャ風）であり、記事本文に「VFMのMarkdownソース」を
併記すると齟齬が出るため、**Markdownソース → VFM変換 → HTML →
スクリーンショット**の一気通貫フローに改めます。

## 設計方針

- 入力: `ja/{N}-name.md` / `en/{N}-name.md`（VFM Markdown）
- 変換: `build.mjs`が`@vivliostyle/vfm`の`stringify()`を呼んで
  HTML化
- スタイル: `styles/{N}-name.css`（共通分は`styles/_base.css`）
- 出力: `dist/{lang}/{N}-name.html`（CSSを`<style>`インラインで
  埋め込んだ自己完結HTML）
- 記事に埋め込むのは**`.md`ソース**と**生成された`.html`**
  の両方を`<details>`で並べる想定（各節2つの折りたたみ）

## ディレクトリ構成

```
_screenshots/footnotes-vfm/
├── README.md
├── build.mjs              ← VFM変換 → 自己完結HTML出力
├── styles/
│   ├── _base.css          ← @page (140mm×90mm), body typography
│   ├── 01-gcpm-class.css
│   ├── 02-pandoc-endnotes.css
│   ├── 03-dpub-default.css
│   ├── 04-page-footnote-styled.css
│   ├── 05-footnote-display-inline.css
│   ├── 06-footnote-display-compact.css
│   └── 07-footnote-marker-outside.css
├── ja/
│   └── 01-…07 .md   (VFM Markdownソース)
├── en/
│   └── 01-…07 .md
└── dist/
    └── (build.mjsが生成。コミット対象外推奨)
```

## ビルド手順

```sh
cd _screenshots/footnotes-vfm
node build.mjs
```

`dist/ja/01-gcpm-class.html` … `dist/en/07-footnote-marker-outside.html`
が生成される（CSSインライン済みで自己完結）。

## 撮影手順

```sh
# Vivliostyle CLIでプレビュー（推奨）
npx vivliostyle preview dist/ja/03-dpub-default.html
```

または:

```sh
npx http-server _screenshots/footnotes-vfm/dist -p 8080
# その後ブラウザで:
# http://localhost:4321経由で開いている記事から、
# https://vivliostyle.org/viewer/?src=https://docs2.vivliostyle.org/...
# のURLをデプロイ後に叩いてもよい
```

撮影解像度は旧`_screenshots/footnotes/`と同じ（短冊ページ全体を
1枚に収めてDPR 2x）。保存先は`public/new-features/footnotes/{ja,en}/`。

## サンプル一覧

| #  |ファイル|デモする内容| VFMモード|必要なViewer |対応する記事節|
|----|---------|-----------|----------|--------------|--------------|
| 01 | `01-gcpm-class` | `<span class="footnote">` + GCPMクラス方式| `gcpm` | 2.41+ | Part 2 §2 |
| 02 | `02-pandoc-endnotes` | VFM Pandoc形式の後注| `pandoc`（既定）| 2.41+ | Part 2 §3 |
| 03 | `03-dpub-default` | DPUB-ARIA `<aside role="doc-footnote">`、テーマCSSなし| `dpub` | **2.42+** | Part 3 §5 |
| 04 | `04-page-footnote-styled` | `@page { @footnote { … } }`と`::before` | `dpub` | **2.42+** | Part 3 §7 |
| 05 | `05-footnote-display-inline` | `footnote-display: inline` | `dpub` | **2.42+** | Part 3 §8 |
| 06 | `06-footnote-display-compact` | `footnote-display: compact` | `dpub` | **2.42+** | Part 3 §8 |
| 07 | `07-footnote-marker-outside` | `::footnote-marker`の`list-style-position: outside` | `dpub` | **2.42+** | Part 3 §9 |

> **Viewerバージョンについて**:ルート`package.json`の`overrides`
> で`@vivliostyle/viewer@^2.42.0`を強制済み。`npx vivliostyle preview`
> はそれを参照するので追加設定は不要。

## 旧`_screenshots/footnotes/`との違い

|観点|旧（手書きHTML）|新（VFM生成）|
|---|---|---|
|ソース| `.html`手書き| `.md`（VFM Markdown）|
| `<aside>`の`class` | `class="footnote"`等を手書きで付与| VFM既定の`class="footnote"`のみ（dpubモードでは付かない場合あり）|
| `<aside>`内マーカー| `<sup>n</sup>`を手書き挿入（v2.41互換）| author CSSの`::footnote-marker`で生成（v2.42+前提）|
|バックリンク|一部サンプルは`<a class="footnote-back" role="doc-backlink">`を手書き| VFMがemitするもののみ|
|本文の入れ子HTML |自由に書ける| Markdown経由のため一部は表現できない|

## 明日再開する作業者向けチェックリスト

1. `node build.mjs`を実行して`dist/`に14ファイルが生成されることを確認
2. 各`.md`のVFM出力HTMLをVivliostyle Viewerで実際にレンダリング確認:
   - 例: `npx vivliostyle preview dist/ja/03-dpub-default.html`
   - 旧スクリーンショットと比べて、想定どおり「VFM出力ベースの体裁」に
     なっているか、本文・脚注・マーカー・レイアウトを目視チェック
3. 必要なら`.md` / `styles/*.css`を調整して再ビルド
4. 14件のスクリーンショットを撮影し`public/new-features/footnotes/{ja,en}/`の
   PNGを**上書き**（同名で置換）
5. 記事`content/{ja,en}/new-features/footnotes.md`の各`<details>`を:
   - 「VFM Markdownソース」(`.md`の中身)と
   - 「生成されたHTML」(`.html`の中身)
   の**2つの`<details>`**に書き換え（または1つの`<details>`内に
   両方並べる）
6. 旧`_screenshots/footnotes/`を削除（または`_archive/`に退避）

## 残存する設計上のオープン項目

明日の判断ポイント:

1. **記事内の表示形式**:各節に`<details>`を2つ（Markdown / HTML）
   並べるか、1つの中に両方併記するか。前者は折りたたみ展開回数が
   増えるが情報がはっきり分離する。
2. **CSSの見せ方**:各`.md`用CSSをどこまで`<details>`に含めるか。
   VFM関係の`.md`ソースとは独立で、本来は外部CSS。記事の流れ次第で
   「Markdown / CSS / HTML出力」の3段にする選択肢もあり。
3. **例03のマーカー扱い**: VFMのdpub既定出力には`<aside>`内マーカーが
   ない。Viewer 2.42+ + author CSSの`::footnote-marker`で生成するか、
   v2.41互換のため何も表示しないかを統一する。本リポジトリはViewer
   2.42+をoverrideで使っているので前者が妥当。
4. **dpubモード`body`形式の使用**:例05〜07で必要な
   `class="footnote"`/`class="footnote-back"`付き出力にするには、
   `stringify`のオプションに`body`コールバックを渡す必要がある。
   build.mjsで個別に対応。
