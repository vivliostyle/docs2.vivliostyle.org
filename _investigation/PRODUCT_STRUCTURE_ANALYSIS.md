# プロダクトHTML構造分析レポート

## 調査日時
2026年1月19日

## 目的
各プロダクト（CLI, VFM, Themes, Viewer, Reference）のHTML構造の違いを明確化し、適切なTheme設計戦略を策定するための基礎資料とする。

## 調査対象
- dist/ja/cli/index.html
- dist/ja/vfm/index.html
- dist/ja/themes/index.html
- dist/ja/viewer/vivliostyle-viewer/index.html
- dist/ja/reference/index.html

## 構造比較表

| プロダクト | 行数 | H1タグ内容 | H2数 | H3数 | 画像数 | TOC | figure | table | pre | style付img |
|-----------|------|-----------|------|------|--------|-----|--------|-------|-----|-----------|
| **CLI** | 42 | "Vivliostyle CLI ドキュメント" | 0 | 3 | 0 | ✓ | 0 | 0 | 0 | 0 |
| **VFM** | 30 | "Vivliostyle Flavored Markdown" | 1 | 1 | 1 | - | 0 | 0 | 0 | 0 |
| **Themes** | 35 | "Vivliostyle Themes" | 0 | 2 | 1 | - | 1 | 0 | 0 | 0 |
| **Viewer** | **326** | "Vivliostyle Viewer" | **12** | **10** | **5** | ✓ | 0 | 0 | **10** | **2** |
| **Reference** | 34 | (なし/H2開始) | 1 | 3 | 0 | - | 0 | 0 | 0 | 0 |

## 各プロダクトの特徴

### 1. CLI
**特徴:**
- シンプルな目次ページ（TOC型）
- `role="doc-toc"`を持つナビゲーション構造
- 画像なし、純粋なテキストベース
- H3レベルまでの階層構造

**PDF化の課題:**
- 目次（TOC）のスタイリング
- サブページへのリンク表示

### 2. VFM
**特徴:**
- 非常にコンパクト（30行）
- 1枚の図解画像（/vfm/assets/ecosystem.drawio.svg）
- Principles（原則）セクションを持つ

**PDF化の課題:**
- SVG画像の適切な表示
- シンプルな構造のため、特別な対応は少ない

### 3. Themes
**特徴:**
- ロゴ画像を`<figure>`+`<figcaption>`で表示
- `/themes/assets/themes-logo.jpg`
- セマンティックなマークアップ

**PDF化の課題:**
- figure要素のスタイリング
- 画像キャプションの適切な配置

### 4. Viewer ⭐️最も複雑
**特徴:**
- **圧倒的な情報量**（326行、他の10倍以上）
- **12個のH2セクション**（設定パネルの詳細説明）
- **5つの画像**（うち2つがstyle属性付き）
  - `style="width: 1.5em;"` のインライン画像（設定ボタンアイコン）
  - `style="float: right; margin-left: 3rem"` のフロート画像（設定パネルスクリーンショット）
- **10個のコードブロック**（`<pre>`）
- **TOC構造**（`role="doc-toc"`）

**画像詳細:**
1. `/viewer/assets/vivliostyle-icon.png` (style="width: 1.5em") - インラインアイコン
2. `/viewer/assets/viewer-settings-panel.png` (float: right) - 大きなスクリーンショット
3. `/viewer/assets/vivliostyle-icon.png` (width="16" height="16") - 小アイコン×2
4. `/viewer/assets/toc-icon.png` (width="16" height="16") - TOCアイコン

**PDF化の課題:**
- **インライン画像**のサイズ調整（1.5em → 1em）
- **フロート画像**とテキストの回り込み処理（未解決）
- 長大な文書の適切な改ページ処理
- コードブロックの整形
- TOCの生成と表示

### 5. Reference
**特徴:**
- H1タグなし（H2から開始）
- 非常にシンプルな階層構造
- リンク集的な役割

**PDF化の課題:**
- H1なしの構造への対応
- シンプルなため、特別な対応は少ない

## 画像使用パターンの分類

### パターン1: 画像なし（CLI, Reference）
- 純粋なテキストベース
- 特別な画像処理不要

### パターン2: 通常画像（VFM, Themes）
- `<img src="...">` シンプルな記述
- 属性: width/height なし、styleなし
- VFM: SVG画像
- Themes: JPG画像 + `<figure>`

### パターン3: 複雑な画像（Viewer）
- **style属性付きインライン画像**
  ```html
  <img alt="Settings (S)" src="/viewer/assets/vivliostyle-icon.png" style="width: 1.5em;">
  ```
- **style属性付きフロート画像**
  ```html
  <img src="/viewer/assets/viewer-settings-panel.png" alt="設定パネル" 
       style="float: right; margin-left: 3rem">
  ```
- **width/height属性付き小画像**
  ```html
  <img src="/viewer/assets/vivliostyle-icon.png" width="16" height="16" alt="[Vivliostyle]">
  ```

## 構造的差異のまとめ

### 文書量による分類

**軽量級**（30-42行）
- VFM, Themes, CLI, Reference
- 1-2ページ程度のPDF
- シンプルな構造

**重量級**（326行）
- Viewer
- 10ページ以上の長大なPDF
- 複雑な構造（セクション、画像、コード、TOC）

### TOC（目次）の有無

**TOCあり**
- CLI: `role="doc-toc"`ナビゲーション
- Viewer: `role="doc-toc"`ナビゲーション + 12セクション

**TOCなし**
- VFM, Themes, Reference

### 画像配置の複雑度

**Level 0: 画像なし**
- CLI, Reference

**Level 1: シンプル画像**
- VFM: 1枚のSVG
- Themes: 1枚のJPG + figure

**Level 2: 複雑な画像**
- Viewer: 5枚、3種類のスタイリングパターン

## Theme設計への示唆

### 1. 共通Base Themeの必要性

すべてのプロダクトに共通する要素:
- ページ設定（A4, マージン）
- タイポグラフィ（h1-h3, p, ul/ol）
- Webコンポーネントの非表示（header, sidebar, nav, footer）
- ページ番号

### 2. プロダクト別の差異対応

**画像処理の階層化:**
```css
/* Base: すべてのプロダクト */
img {
  max-width: 100%;
  height: auto;
}

/* Viewer専用: インライン画像 */
img[style*="width: 1.5em"],
img[width],
img[height] {
  display: inline;
  height: 1em;
  vertical-align: text-bottom;
}

/* Viewer専用: フロート画像 */
img[style*="float"] {
  float: right;
  max-width: 50%;
  /* 未解決: テキスト回り込み */
}
```

**TOC処理:**
- CLI, Viewer: TOC専用のスタイリングが必要
- 他: 不要

**コードブロック:**
- Viewer: `<pre>`タグの整形が必要
- 他: 不要

**Figure要素:**
- Themes: `<figure>` + `<figcaption>`のスタイリング
- 他: 不要

### 3. 設計アプローチの提案

#### オプション A: 単一Theme + vivliostyle.config.js設定
```javascript
// vivliostyle.config-viewer-ja.js
{
  theme: './packages/theme-PDF',
  // Viewer特有の設定をconfig側で吸収
}
```

#### オプション B: Base Theme + プロダクト別拡張
```
packages/
  theme-PDF-base/      # 共通基盤
  theme-PDF-viewer/    # Viewer専用拡張
  theme-PDF-cli/       # CLI専用拡張
  ...
```

#### オプション C: Modular Theme（推奨）
```css
/* theme-PDF/theme.css */
@import './base.css';           /* 全プロダクト共通 */
@import './images-simple.css';  /* Level 1画像 */
@import './images-complex.css'; /* Level 2画像（Viewer） */
@import './toc.css';            /* TOC（CLI, Viewer）*/
@import './code.css';           /* コードブロック（Viewer） */
```

## 次のステップ

1. **Theme設計方針の策定**（Task 3）
   - オプションC（Modular Theme）を採用する方向で検討
   - 各モジュールの責任範囲を明確化

2. **プロトタイプ実装**（Task 4）
   - まずViewer用の完全なThemeを作成
   - 他のプロダクトで共通部分を抽出

3. **課題の解決**
   - **最優先**: Viewerのフロート画像問題
     - CSS Gridレイアウトの検討
     - HTML構造の見直し（Markdownレベル）
   - TOCの動的生成
   - 画像パスの統一

## 参考資料

- 現在のtheme-PDF: `/packages/theme-PDF/theme.css`
- Vivliostyle CLI設定: `/vivliostyle.config-*.js` (10ファイル)
- 生成されたPDF: `/public/downloads/vivliostyle-*-*.pdf`
