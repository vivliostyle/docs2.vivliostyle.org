# docs2.vivliostyle.org CSS実装オプション分析

## 評価の観点

**Vivliostyleの最大のメリット:**
> 1つのソースからWeb用、PDF・印刷用、EPUB用のファイルが出力できること

本ドキュメントでは、この「**Single Source Multi Output（SSMO）**」の観点を中心に、各CSSオプションのメリット・デメリットを分析する。

ドキュメントサイト自身がこの機能を活用していることは、ページ来訪者に対する最も説得力のあるデモンストレーションとなる。

---

## オプション一覧

| オプション | 概要 | SSMO適性 | 推奨度 |
|-----------|------|----------|--------|
| A | Tailwind CSS + @tailwindcss/typography | ✗ | ⭐⭐ |
| B | ハイブリッド（Tailwind + Themes） | △ | ⭐⭐⭐ |
| C | Vivliostyle Themes ベース | ◎ | ⭐⭐⭐⭐⭐ |
| D | Plain CSS（SSMO設計） | ◯ | ⭐⭐⭐⭐ |
| E | 他のCSSフレームワーク | ✗ | ⭐⭐ |

---

## SSMO（Single Source Multi Output）とは

### 概念図

```
                    ┌─────────────────┐
                    │  Markdown Source │
                    │  (単一ソース)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Web CSS  │  │ PDF CSS  │  │ EPUB CSS │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  HTML    │  │   PDF    │  │   EPUB   │
        │ (Browser)│  │ (Print)  │  │ (Reader) │
        └──────────┘  └──────────┘  └──────────┘
```

### SSMO実現のためのCSS要件

1. **共通のセマンティックHTML**: 出力形式に依存しないマークアップ
2. **CSS変数による統一設計**: フォント、色、余白の一元管理
3. **メディアクエリによる分岐**: `@media screen` / `@media print`
4. **@page ルールの活用**: PDF/印刷用のページ設定

---

## オプションA: Tailwind CSS

### SSMO観点での評価: ✗ 不適合

### 構成

- Tailwind CSS v4
- @tailwindcss/typography（prose クラス）

### メリット

1. **Web開発効率**: ユーティリティクラスによる高速開発
2. **レスポンシブ**: 組み込みのブレークポイントシステム
3. **ダークモード**: `dark:` プレフィックスで簡単実装
4. **エコシステム**: 豊富なドキュメント・事例

### デメリット（SSMO観点）

1. **PDF出力に非対応**: Tailwindのクラスは印刷/PDF用に設計されていない
2. **ユーティリティクラス問題**: `lg:ml-64` などはPDF/EPUBで無意味
3. **別CSS必須**: PDF出力には完全に別のCSSを書く必要がある
4. **Vivliostyleの価値を示せない**: 来訪者に「1ソースマルチ出力」をデモできない

### 工数見積もり

| 項目 | 工数 |
|------|------|
| Web版のみ | 60-88時間 |
| PDF版追加時 | +40-60時間（別CSS作成） |
| **SSMO実現時合計** | **100-148時間** |

### 結論

Webサイトとしては効率的だが、**Vivliostyleの価値を示すデモンストレーションにならない**。PDF版を提供する場合、結局別のCSSが必要になり、SSMOのメリットを活かせない。

---

## オプションB: ハイブリッド（Tailwind + Themes）

### SSMO観点での評価: △ 部分的対応

### 構成

- Tailwind CSS: UI/レイアウト（Web専用）
- Vivliostyle Themes: 本文タイポグラフィ（共通）
- メディアクエリで分岐

### メリット

1. **Web開発効率**: Tailwindの生産性を維持
2. **本文の統一**: 本文エリアはWeb/PDFで同一スタイル
3. **段階的移行**: 将来的にSSMO強化が可能

### デメリット（SSMO観点）

1. **不完全なSSMO**: UIレイアウトはWeb専用のまま
2. **2つのシステム管理**: 複雑性が増す
3. **中途半端な印象**: 「部分的にSSMO」は説得力に欠ける
4. **PDF版のUI**: ナビゲーション等をPDF用に別途設計必要

### 工数見積もり

| 項目 | 工数 |
|------|------|
| Web版 | 64-96時間 |
| PDF版追加時 | +20-30時間（部分的に共通化） |
| **SSMO実現時合計** | **84-126時間** |

### 実装アプローチ

```css
/* 共通部分（本文） */
.prose {
  font-family: var(--vs-font-family);
  line-height: var(--vs-line-height);
}

/* Web専用（Tailwindで記述） */
@media screen {
  .nav { /* Tailwindクラス使用 */ }
}

/* PDF専用 */
@media print {
  .nav { display: none; }
  @page { size: A4; margin: 20mm; }
}
```

### 結論

Web開発効率とSSMOのバランスを取るアプローチ。ただし、**Vivliostyleの価値を100%示すデモにはならない**。「一部だけSSMO」という中途半端さが残る。

---

## オプションC: Vivliostyle Themes ベース（推奨）

### SSMO観点での評価: ◎ 完全対応

### 構成

- @vivliostyle/theme-base またはカスタムテーマ
- CSS変数による統一設計
- メディアクエリでWeb/Print分岐
- 最小限のWeb拡張（レスポンシブ、ダークモード）

### メリット（SSMO観点）

1. **完全なSSMO実現**: 1つのCSSでWeb/PDF/EPUB対応
2. **最高のデモンストレーション**: 来訪者に「これがVivliostyleの実力」と示せる
3. **ドッグフーディング**: 自社製品を自社で使う説得力
4. **ブランド統一**: Vivliostyle製品群との一貫性
5. **PDF版が「おまけ」ではない**: 同等品質のPDFを提供可能

### デメリット

1. **Web UI自作**: ナビゲーション、サイドバーを独自実装
2. **レスポンシブ追加**: Themes本来の用途外の拡張が必要
3. **学習コスト**: チームがThemes構造を理解する必要
4. **開発工数**: Web専用フレームワークより時間がかかる

### 工数見積もり

| 作業項目 | 工数 | 備考 |
|---------|------|------|
| テーマ基盤設計 | 8-12時間 | CSS変数、共通スタイル |
| 本文スタイル | 4-8時間 | Web/PDF共通 |
| Web用レイアウト | 16-24時間 | ナビ、サイドバー、フッター |
| レスポンシブ対応 | 12-16時間 | モバイル対応 |
| ダークモード | 6-10時間 | CSS変数切替 |
| PDF/EPUB調整 | 8-12時間 | @page、改ページ制御 |
| コンテンツ統合 | 24-36時間 | 各製品ドキュメント |
| テスト・調整 | 8-12時間 | 3形式での検証 |
| **合計** | **86-130時間** | Web+PDF+EPUB |

### Web専用との比較

| 比較項目 | Tailwind（Web専用） | Themes（SSMO） |
|---------|---------------------|----------------|
| Web版工数 | 60-88時間 | 70-100時間 |
| PDF版追加工数 | +40-60時間 | +8-12時間 |
| EPUB版追加工数 | +30-50時間 | +4-8時間 |
| **3形式合計** | **130-198時間** | **86-130時間** |

**SSMOアプローチは、3形式出力を前提とすると実は効率的。**

### 実装アプローチ

```css
/* src/styles/theme.css */

/* ===== 共通設定（Web/PDF/EPUB） ===== */
:root {
  --vs-font-family: 'Noto Sans JP', sans-serif;
  --vs-font-family-mono: 'Source Code Pro', monospace;
  --vs-line-height: 1.8;
  --vs-color-text: #333;
  --vs-color-heading: #1a1a1a;
  --vs-color-link: #0066cc;
  --vs-color-code-bg: #f5f5f5;
}

/* 本文スタイル（共通） */
article {
  font-family: var(--vs-font-family);
  line-height: var(--vs-line-height);
  color: var(--vs-color-text);
}

h1, h2, h3 {
  color: var(--vs-color-heading);
  margin-top: 2em;
  margin-bottom: 0.5em;
}

pre, code {
  font-family: var(--vs-font-family-mono);
  background: var(--vs-color-code-bg);
}

/* ===== Web専用 ===== */
@media screen {
  :root {
    --header-height: 64px;
    --sidebar-width: 280px;
  }

  body {
    padding-top: var(--header-height);
  }

  .site-header {
    position: fixed;
    top: 0;
    width: 100%;
    height: var(--header-height);
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(8px);
  }

  .sidebar {
    position: fixed;
    left: 0;
    width: var(--sidebar-width);
    height: calc(100vh - var(--header-height));
    overflow-y: auto;
  }

  main {
    margin-left: var(--sidebar-width);
    padding: 2rem;
  }

  /* レスポンシブ */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    main { margin-left: 0; }
  }

  /* ダークモード */
  @media (prefers-color-scheme: dark) {
    :root {
      --vs-color-text: #e0e0e0;
      --vs-color-heading: #fff;
      --vs-color-code-bg: #2d2d2d;
    }
    body { background: #1a1a1a; }
  }
}

/* ===== PDF/印刷専用 ===== */
@media print {
  .site-header,
  .sidebar,
  .nav-buttons { 
    display: none; 
  }

  @page {
    size: A4;
    margin: 20mm 15mm;
    
    @top-center {
      content: "Vivliostyle Documentation";
      font-size: 9pt;
    }
    
    @bottom-center {
      content: counter(page);
    }
  }

  h1 {
    break-before: page;
  }

  pre, figure, table {
    break-inside: avoid;
  }
}
```

### 来訪者へのアピール例

```markdown
## このドキュメントについて

本ドキュメントは **Vivliostyle** を使用して作成されています。

- 📱 **Web版**: 今ご覧のページ
- 📄 **PDF版**: [ダウンロード](/docs.pdf) - 印刷に最適化
- 📚 **EPUB版**: [ダウンロード](/docs.epub) - 電子書籍リーダー用

**すべて同一のMarkdownソースから生成されています。**
これがVivliostyleの「Single Source Multi Output」です。
```

### 結論

開発工数は増えるが、**Vivliostyleの価値を最も効果的に示せる**選択肢。3形式出力を前提とすると、実は総工数は他のオプションより効率的になる可能性がある。

---

## オプションD: Plain CSS（SSMO設計）

### SSMO観点での評価: ◯ 対応可能

### 構成

- CSS Custom Properties（変数）
- CSS Grid / Flexbox
- メディアクエリでWeb/Print分岐
- フレームワークなし

### メリット

1. **完全な制御**: SSMO設計を自由に最適化
2. **依存なし**: 外部ライブラリ不要
3. **軽量**: 必要最小限のCSS
4. **学習不要**: 標準CSSのみ

### デメリット

1. **全て自作**: 基本機能も実装が必要
2. **Themesの知見を活かせない**: 既存資産を使わない
3. **ブランド整合**: Vivliostyle製品との一貫性を自分で担保

### 工数見積もり

| 項目 | 工数 |
|------|------|
| SSMO対応CSS設計・実装 | 90-130時間 |
| **合計** | **90-130時間** |

### 結論

SSMOは実現可能だが、**Vivliostyle Themesの知見を活かせない**のがもったいない。車輪の再発明になりやすい。

---

## オプションE: 他のCSSフレームワーク

### SSMO観点での評価: ✗ 不適合

UnoCSS、Open Props、Pico CSS、Bulma 等はいずれもWeb専用であり、PDF/EPUB出力を考慮した設計ではない。オプションAと同じ問題を抱える。

---

## 比較マトリクス

| 評価項目 | A: Tailwind | B: Hybrid | C: Themes | D: Plain |
|---------|-------------|-----------|-----------|----------|
| **SSMO対応** | ✗ | △ | ◎ | ◯ |
| **デモ効果** | ✗ | △ | ◎ | ◯ |
| **Web開発効率** | ◎ | ◎ | ◯ | △ |
| **PDF品質** | 別CSS必要 | 部分共通 | 高品質 | 要設計 |
| **ブランド整合** | △ | ◯ | ◎ | ◯ |
| **Web版工数** | 60-88h | 64-96h | 70-100h | 70-100h |
| **3形式合計工数** | 130-198h | 84-126h | 86-130h | 90-130h |

---

## 推奨事項

### 第1推奨: オプションC（Vivliostyle Themes ベース）

**理由:**

1. **Vivliostyleの価値を最大限に示せる**
   - 「1ソースからWeb/PDF/EPUBを出力」を自社ドキュメントで実践
   - 来訪者への最も説得力あるデモンストレーション

2. **ドッグフーディングの説得力**
   - 自社製品を自社で使っていることの信頼性
   - 「本当に実用的」というメッセージ

3. **3形式出力を前提とすると効率的**
   - Web専用フレームワーク + 別PDF CSS より総工数が少ない
   - メンテナンスも1つのCSSで完結

4. **差別化**
   - 他のOSSドキュメントサイトとの明確な違い
   - 「これがVivliostyleだからできること」

### 第2推奨: オプションD（Plain CSS）

Themes を使わずSSMO設計したい場合の選択肢。ただしThemesの知見を活かせないデメリットあり。

### 条件付き: オプションB（ハイブリッド）

PDF/EPUB出力を当面行わない場合は検討可能。ただし、**Vivliostyleの価値を示すデモにはならない**点を認識の上で選択すること。

### 非推奨: オプションA, E

Web専用フレームワークは、**Vivliostyleのコア価値を示せない**。一般的なドキュメントサイトと差別化できず、来訪者へのアピールが弱い。

---

## 実装ロードマップ（オプションC選択時）

### Phase 1: 基盤構築（2-3週間）

1. SSMO対応CSSの設計
2. 共通CSS変数の定義
3. Web用レイアウト実装
4. レスポンシブ対応

### Phase 2: 本文スタイル（1週間）

1. タイポグラフィ調整
2. コードブロック、テーブル等
3. PDF用の改ページ制御

### Phase 3: コンテンツ統合（2-3週間）

1. 各製品ドキュメントの統合
2. ナビゲーション構造
3. 3形式での出力テスト

### Phase 4: 公開（1週間）

1. PDF/EPUB生成のCI設定
2. ダウンロードリンク設置
3. デプロイ

---

## 次のステップ

1. **方針決定**: SSMO重視でオプションCを選択するか確認
2. **開発計画更新**: DEVELOPMENT_PLAN をSSMO対応版に更新
3. **CSS設計**: 共通CSS変数とメディアクエリ構造の詳細設計
4. **実装開始**: Phase 1 から着手

---

## 付録: 参考リソース

- [Vivliostyle Themes](https://github.com/vivliostyle/themes)
- [Vivliostyle CLI](https://github.com/vivliostyle/vivliostyle-cli)
- [CSS Paged Media Module](https://www.w3.org/TR/css-page-3/)
- [CSS @page Rule](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
