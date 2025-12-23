# Vivliostyle Themes 調査レポート

## 調査目的

docs2.vivliostyle.org のCSS実装において、Tailwind CSSの代わりにVivliostyle Themesを使用できるかを調査する。

## 調査日

2025年12月23日

---

## 1. Vivliostyle Themesの概要

### 1.1 設計目的

Vivliostyle Themesは**印刷・PDF出力**を主目的として設計されたCSSテーマシステムである。

主な用途：
- 書籍・同人誌の組版
- 技術ドキュメントのPDF化
- アカデミック論文のフォーマット

### 1.2 公式テーマ一覧

| テーマ名 | 用途 | 特徴 |
|---------|------|------|
| `@vivliostyle/theme-techbook` | 技術書 | A4/B5サイズ、コードブロック対応 |
| `@vivliostyle/theme-academic` | 学術論文 | 二段組、参考文献、脚注 |
| `@vivliostyle/theme-slide` | スライド | 16:9アスペクト比 |
| `@vivliostyle/theme-gutenberg` | 文芸書 | クラシックな書籍スタイル |
| `@vivliostyle/theme-bunko` | 文庫本 | 縦書き、日本語組版 |
| `@vivliostyle/theme-base` | ベース | 他テーマの基盤 |

---

## 2. テーマの技術構造

### 2.1 ファイル構成

```
@vivliostyle/theme-techbook/
├── package.json
├── theme.css          # メインCSS
├── scss/              # SCSSソース（一部テーマ）
│   ├── _variables.scss
│   ├── _base.scss
│   └── theme.scss
└── vivliostyle.config.js
```

### 2.2 CSSの特徴

#### 印刷専用プロパティの多用

```css
/* ページサイズ指定 */
@page {
  size: A4;
  margin: 20mm 15mm;
  
  @top-center {
    content: string(title);
  }
  
  @bottom-center {
    content: counter(page);
  }
}

/* 改ページ制御 */
h1 {
  break-before: page;
}

section {
  break-inside: avoid;
}
```

#### CSS変数による設定

```css
:root {
  --vs-theme--basic-font-size: 10pt;
  --vs-theme--line-height: 1.7;
  --vs-theme--font-family: 'Noto Serif JP', serif;
  --vs-theme--color-primary: #333;
}
```

### 2.3 theme-baseの役割

`@vivliostyle/theme-base` は以下を提供：

- 基本的なタイポグラフィリセット
- Markdown要素の基本スタイル（h1-h6, p, ul, ol, blockquote, code）
- 印刷用デフォルト設定

**含まれないもの：**
- ナビゲーション
- レスポンシブデザイン
- インタラクティブ要素
- UIコンポーネント

---

## 3. Webサイト適用の評価

### 3.1 適用可能な部分

| 要素 | 適用可否 | 備考 |
|------|----------|------|
| 本文テキスト | ◯ | タイポグラフィは流用可能 |
| 見出し (h1-h6) | ◯ | フォントサイズ・余白は調整が必要 |
| リスト (ul, ol) | ◯ | 基本スタイルは使用可能 |
| コードブロック | △ | シンタックスハイライトは別途必要 |
| テーブル | △ | 印刷向けスタイルの調整が必要 |
| 画像 | △ | レスポンシブ対応が必要 |

### 3.2 新規実装が必要な部分

| 要素 | 必要な作業 |
|------|-----------|
| ナビゲーション | 完全に新規作成 |
| サイドバー | 完全に新規作成 |
| TOC (目次) | インタラクティブ機能追加 |
| 検索UI | 完全に新規作成 |
| レスポンシブ | 全面的に新規作成 |
| ダークモード | 完全に新規作成 |
| ボタン・フォーム | 完全に新規作成 |
| フッター | 新規作成 |
| パンくずリスト | 新規作成 |
| 言語切替UI | 新規作成 |

### 3.3 問題となるCSSプロパティ

以下のプロパティはブラウザ表示で無視または問題を起こす：

```css
/* ブラウザでは無効 */
@page { ... }
size: A4;
marks: crop cross;

/* 意図しない動作の可能性 */
break-before: page;
break-after: page;
break-inside: avoid;

/* 印刷用の固定単位 */
font-size: 10pt;
margin: 20mm;
```

---

## 4. 実装コスト比較

### 4.1 Tailwind CSS使用時

| 作業項目 | 工数 |
|---------|------|
| Tailwind設定 | 2-4時間 |
| @tailwindcss/typography設定 | 1-2時間 |
| カスタムテーマ調整 | 4-8時間 |
| **合計** | **7-14時間** |

### 4.2 Vivliostyle Themes使用時

| 作業項目 | 工数 |
|---------|------|
| theme-base統合 | 2-4時間 |
| 印刷用CSS除去/調整 | 8-12時間 |
| ナビゲーション実装 | 8-12時間 |
| レスポンシブ実装 | 12-16時間 |
| ダークモード実装 | 4-8時間 |
| UIコンポーネント | 8-12時間 |
| **合計** | **42-64時間** |

### 4.3 工数差

Vivliostyle Themesのみでの実装は、Tailwind CSS使用時と比較して **+35-50時間** の追加工数が見込まれる。

---

## 5. 結論と推奨

### 5.1 評価サマリー

| 評価項目 | Tailwind | Themes | 
|---------|----------|--------|
| Web UI適性 | ◎ | △ |
| 開発効率 | ◎ | △ |
| Vivliostyleブランド整合 | △ | ◎ |
| 本文タイポグラフィ | ◯ | ◎ |
| メンテナンス性 | ◎ | ◯ |

### 5.2 推奨アプローチ

**ハイブリッド方式を推奨：**

1. **UI/レイアウト**: Tailwind CSS + @tailwindcss/typography
2. **本文エリア**: Vivliostyle Themes のタイポグラフィ変数を部分的に採用

```css
/* 本文エリアのみThemesの設定を活用 */
.prose {
  --vs-font-family: 'Noto Sans JP', sans-serif;
  --vs-line-height: 1.8;
  font-family: var(--vs-font-family);
  line-height: var(--vs-line-height);
}
```

### 5.3 Themesフル採用が適切なケース

以下の場合はThemesフル採用も検討可能：

- PDF出力機能を同時に提供する場合
- 印刷用CSSとの一貫性が強く求められる場合
- 開発期間に十分な余裕がある場合

---

## 6. 参考リンク

- [Vivliostyle Themes GitHub](https://github.com/vivliostyle/themes)
- [Create Book](https://github.com/vivliostyle/create-book)
- [Vivliostyle CLI](https://github.com/vivliostyle/vivliostyle-cli)
