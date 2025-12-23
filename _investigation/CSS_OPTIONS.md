# docs2.vivliostyle.org CSS実装オプション分析

## 概要

本ドキュメントでは、docs2.vivliostyle.org のCSS実装について、考えられる全てのオプションを比較分析する。

---

## オプション一覧

| オプション | 概要 | 推奨度 |
|-----------|------|--------|
| A | Tailwind CSS + @tailwindcss/typography | ⭐⭐⭐⭐ |
| B | ハイブリッド（Tailwind + Themes部分採用） | ⭐⭐⭐⭐⭐ |
| C | Vivliostyle Themes フル採用 | ⭐⭐ |
| D | Plain CSS（フレームワークなし） | ⭐⭐⭐ |
| E | 他のCSSフレームワーク | ⭐⭐⭐ |

---

## オプションA: Tailwind CSS

### 構成

- Tailwind CSS v4
- @tailwindcss/typography（prose クラス）
- カスタムテーマ設定

### メリット

1. **開発効率**: ユーティリティクラスによる高速開発
2. **レスポンシブ**: 組み込みのブレークポイントシステム
3. **ダークモード**: `dark:` プレフィックスで簡単実装
4. **エコシステム**: Astro との統合が成熟
5. **ドキュメント**: 豊富な公式ドキュメント

### デメリット

1. Vivliostyle製品との直接的な関連性がない
2. HTML にクラスが多くなる
3. カスタマイズには Tailwind の知識が必要

### 工数見積もり

| フェーズ | 工数 |
|---------|------|
| Phase 1: 基盤構築 | 16-24時間 |
| Phase 2: コンテンツ統合 | 24-36時間 |
| Phase 3: 機能追加 | 16-24時間 |
| Phase 4: 公開準備 | 4-8時間 |
| **合計** | **60-88時間** |

### 実装例

```astro
---
// src/layouts/DocsLayout.astro
import '@/styles/globals.css';
---
<html class="dark">
<body class="bg-white dark:bg-gray-900">
  <nav class="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur">
    <!-- ナビゲーション -->
  </nav>
  <aside class="hidden lg:block fixed left-0 w-64 h-screen overflow-y-auto">
    <!-- サイドバー -->
  </aside>
  <main class="lg:ml-64 pt-16">
    <article class="prose dark:prose-invert max-w-none">
      <slot />
    </article>
  </main>
</body>
</html>
```

---

## オプションB: ハイブリッド（推奨）

### 構成

- Tailwind CSS: UI/レイアウト
- Vivliostyle Themes: 本文タイポグラフィ（CSS変数のみ）
- カスタムCSS: ブランド調整

### メリット

1. **効率性**: Tailwind の開発効率を維持
2. **ブランド整合**: Vivliostyle のタイポグラフィ哲学を反映
3. **将来性**: PDF出力機能追加時の拡張が容易
4. **バランス**: 実用性とブランドの両立

### デメリット

1. 2つのシステムの知識が必要
2. CSS変数の管理が複雑化する可能性

### 工数見積もり

| フェーズ | 工数 |
|---------|------|
| Phase 1: 基盤構築 | 18-26時間（Themes統合含む） |
| Phase 2: コンテンツ統合 | 24-36時間 |
| Phase 3: 機能追加 | 18-28時間 |
| Phase 4: 公開準備 | 4-8時間 |
| **合計** | **64-96時間** |

### 実装例

```css
/* src/styles/typography.css */

/* Vivliostyle Themes から継承するCSS変数 */
:root {
  /* theme-base 由来 */
  --vs-font-family-serif: 'Noto Serif JP', serif;
  --vs-font-family-sans: 'Noto Sans JP', sans-serif;
  --vs-font-family-mono: 'Source Code Pro', monospace;
  --vs-line-height: 1.8;
  --vs-letter-spacing: 0.05em;
  
  /* docs2用カスタム */
  --docs-prose-font: var(--vs-font-family-sans);
  --docs-code-font: var(--vs-font-family-mono);
}

/* Tailwind typography のオーバーライド */
.prose {
  font-family: var(--docs-prose-font);
  line-height: var(--vs-line-height);
  letter-spacing: var(--vs-letter-spacing);
}

.prose code {
  font-family: var(--docs-code-font);
}

/* 日本語組版の調整 */
.prose :where(p, li) {
  text-align: justify;
  word-break: auto-phrase; /* Chrome 119+ */
}
```

```javascript
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--vs-color-text)',
            '--tw-prose-headings': 'var(--vs-color-heading)',
            lineHeight: 'var(--vs-line-height)',
          },
        },
      },
    },
  },
};
```

---

## オプションC: Vivliostyle Themes フル採用

### 構成

- @vivliostyle/theme-base
- カスタムWeb用CSS（大規模）
- レスポンシブ/UIを全て自作

### メリット

1. **ブランド統一**: Vivliostyle製品との完全な一貫性
2. **将来のPDF**: Web/PDF同一CSSの可能性
3. **独自性**: 他のドキュメントサイトとの差別化

### デメリット

1. **工数大**: UI/レスポンシブを全て自作
2. **メンテナンス**: 独自実装の保守コスト
3. **学習曲線**: チーム全体がThemes構造を理解する必要

### 工数見積もり

| 作業項目 | 工数 |
|---------|------|
| theme-base統合・調整 | 8-12時間 |
| 印刷用CSS除去/Web最適化 | 12-16時間 |
| ナビゲーション実装 | 8-12時間 |
| サイドバー実装 | 8-12時間 |
| レスポンシブ実装 | 16-24時間 |
| ダークモード実装 | 8-12時間 |
| UIコンポーネント | 12-16時間 |
| コンテンツ統合 | 24-36時間 |
| テスト・調整 | 4-8時間 |
| **合計** | **100-148時間** |

### 実装例

```css
/* src/styles/web-theme.css */

/* theme-base をインポート（印刷プロパティは除外） */
@import '@vivliostyle/theme-base/theme.css' layer(base);

/* 印刷用プロパティを上書き無効化 */
@layer overrides {
  @page { all: unset; }
  
  * {
    break-before: auto !important;
    break-after: auto !important;
    break-inside: auto !important;
  }
}

/* Web用レスポンシブ追加 */
@layer layout {
  .site-header {
    position: sticky;
    top: 0;
    /* ... 全て手書き ... */
  }
  
  @media (max-width: 768px) {
    .sidebar { display: none; }
    /* ... */
  }
}
```

---

## オプションD: Plain CSS

### 構成

- CSS Custom Properties (変数)
- CSS Grid / Flexbox
- メディアクエリ
- フレームワークなし

### メリット

1. **依存なし**: 外部ライブラリ不要
2. **軽量**: 最小限のCSS
3. **完全制御**: 全てを把握可能
4. **学習不要**: 標準CSSのみ

### デメリット

1. **開発速度**: ユーティリティなしで遅い
2. **一貫性**: 規約がないとバラつく
3. **車輪の再発明**: 基本機能も全て実装

### 工数見積もり

| 作業項目 | 工数 |
|---------|------|
| デザインシステム設計 | 8-12時間 |
| 基本スタイル実装 | 12-16時間 |
| レイアウトシステム | 12-16時間 |
| コンポーネント実装 | 16-24時間 |
| レスポンシブ実装 | 8-12時間 |
| ダークモード | 4-8時間 |
| コンテンツ統合 | 24-36時間 |
| **合計** | **76-112時間** |

---

## オプションE: 他のCSSフレームワーク

### 候補

| フレームワーク | 特徴 | Astro統合 |
|---------------|------|-----------|
| UnoCSS | Tailwind互換、高速 | ◎ |
| Open Props | CSS変数ベース | ◎ |
| Pico CSS | クラスレス | ◯ |
| Bulma | コンポーネント指向 | ◯ |

### 評価

いずれもTailwindと同等かそれ以下の工数で実装可能だが、特にTailwindを避ける理由がない限り、エコシステムの成熟度からTailwindが優位。

---

## 比較マトリクス

| 評価項目 | A: Tailwind | B: Hybrid | C: Themes | D: Plain |
|---------|-------------|-----------|-----------|----------|
| 開発効率 | ◎ | ◎ | △ | ◯ |
| ブランド整合 | △ | ◎ | ◎ | ◯ |
| メンテナンス性 | ◎ | ◎ | ◯ | ◯ |
| 学習コスト | ◯ | ◯ | △ | ◎ |
| 将来の拡張性 | ◎ | ◎ | ◯ | ◯ |
| **工数（時間）** | 60-88 | 64-96 | 100-148 | 76-112 |

---

## 推奨事項

### 第1推奨: オプションB（ハイブリッド）

**理由:**
1. Tailwind の開発効率を維持しつつ、Vivliostyle のタイポグラフィを活かせる
2. 追加工数は +4-8時間 程度と最小限
3. 将来のPDF出力機能追加時に拡張しやすい
4. ブランドとしての一貫性を示せる

### 第2推奨: オプションA（Tailwind のみ）

**理由:**
1. 最もシンプルで確実な選択
2. ドキュメント・事例が豊富
3. 将来のメンテナンス者が理解しやすい

### 非推奨: オプションC（Themes フル採用）

**理由:**
1. 工数が大幅に増加（+40-60時間）
2. Web UI実装の大部分が独自開発になる
3. 得られるメリットに対してコストが大きすぎる

---

## 次のステップ

1. **内部レビュー**: 本ドキュメントをチームで確認
2. **方針決定**: A, B, C, D いずれかを選択
3. **開発計画更新**: 選択に応じてDEVELOPMENT_PLAN を更新
4. **実装開始**: Phase 1 から着手

---

## 付録: 参考リソース

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- [Vivliostyle Themes](https://github.com/vivliostyle/themes)
- [Astro + Tailwind Integration](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
