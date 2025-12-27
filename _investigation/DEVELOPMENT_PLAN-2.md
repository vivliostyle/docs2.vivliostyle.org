# docs2.vivliostyle.org 開発計画（案2: VFM組み込み）

## 1. プロジェクト概要

### 1.1 目的

散在する Vivliostyle のドキュメントを統合し、一貫したURL体系のもとで公開する新しいドキュメントサイト `https://docs2.vivliostyle.org/` を構築する。

### 1.2 背景・現状の課題

参照: https://github.com/vivliostyle/docs.vivliostyle.org/issues/25

#### サイトの問題点
- Vivliostyle の各ドキュメントの正式な URL と、Google 検索で表示される URL が異なる
- サイト（vivliostyle.org）とドキュメントの制作システム（docs.vivliostyle.org）が統合されていない
- 公式サイトのドキュメントページとは別に複数のトップページが存在する

#### Docute の問題点
- JavaScript ファイルであって HTML ファイルではない（SEO に弱い）
- H4 相当以上の見出しが使えない（実質的には H1〜H3 相当まで）
- VFM が使えない

#### ドキュメントの散在
現在、以下のようにプロダクトごとにドキュメントが散在している：

| # | プロダクト | 現在の場所 |
|---|-----------|-----------|
| 1 | VFM | https://vivliostyle.github.io/vfm/#/ja/vfm |
| 2 | Vivliostyle Viewer 等 | https://docs.vivliostyle.org/#/ |
| 3 | Vivliostyle CLI | https://github.com/vivliostyle/vivliostyle-cli/tree/main/docs |
| 4 | Vivliostyle Themes | https://github.com/vivliostyle/themes/tree/main/docs |

### 1.3 解決方針

- すべてのドキュメントを Astro で Markdown から HTML に変換
- GitHub Pages を使ってホスティング
- 全体があたかも各プロダクトを章とした1冊の本であるかのように、一貫した URL で公開

---

## 2. 技術仕様

### 2.1 技術スタック

| 項目 | 採用技術 |
|------|----------|
| 静的サイトジェネレータ | Astro |
| Markdown パーサー | VFM (@vivliostyle/vfm) |
| コンテンツ統合 | Astro Content Collections + カスタムローダー |
| CSS | Vivliostyle Themes ベース（SSMO対応） |
| PDF/EPUB生成 | Vivliostyle CLI |
| ホスティング | GitHub Pages |
| コンテンツ管理 | Git submodule |
| ソース形式 | Markdown (VFM記法対応) |

### 2.1.1 SSMO（Single Source Multi Output）

Vivliostyleの最大のメリットである「**1つのソースからWeb/PDF/EPUB出力**」を自社ドキュメントで実践する。

```
                    ┌─────────────────┐
                    │  Markdown Source │
                    │  (単一ソース)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Web (HTML)│  │   PDF    │  │   EPUB   │
        └──────────┘  └──────────┘  └──────────┘
```

これにより来訪者に対し、Vivliostyleの価値を実証できる。

### 2.2 URL 構造

ルート（`/`）へのアクセス時、ブラウザの `Accept-Language` ヘッダーを確認し：
- `ja` が含まれていれば → `/ja/` にリダイレクト
- それ以外 → `/en/` にリダイレクト

```
https://docs2.vivliostyle.org/
├── /                           # ルート → 言語検出してリダイレクト
│
├── /en/                        # 英語トップページ
│   ├── /en/viewer/             # Vivliostyle Viewer
│   ├── /en/cli/                # Vivliostyle CLI
│   │   ├── /en/cli/getting-started/
│   │   ├── /en/cli/config/
│   │   └── ...
│   ├── /en/vfm/                # VFM
│   ├── /en/themes/             # Themes
│   ├── /en/api/                # Core API Reference
│   ├── /en/css-features/       # Supported CSS Features
│   └── /en/contribution/       # Contribution Guide
│
└── /ja/                        # 日本語トップページ
    ├── /ja/viewer/
    ├── /ja/cli/
    │   ├── /ja/cli/getting-started/
    │   └── ...
    └── ...（英語と同じ構造）
```

### 2.3 コンテンツ取得方法（Git submodule）

各プロダクトのリポジトリに `docs/` ディレクトリを作成し、そこにドキュメントを配置。docs2.vivliostyle.org リポジトリから submodule として参照する。

```
docs2.vivliostyle.org/
├── submodules/
│   ├── vfm/                    # vivliostyle/vfm
│   ├── vivliostyle-cli/        # vivliostyle/vivliostyle-cli
│   ├── themes/                 # vivliostyle/themes
│   └── vivliostyle.js/         # vivliostyle/vivliostyle.js
├── src/
├── astro.config.mjs
└── ...
```

### 2.4 統合対象ドキュメント

| プロダクト | リポジトリ | docs パス | 備考 |
|-----------|-----------|-----------|------|
| VFM | vivliostyle/vfm | docs/ | 既存 |
| Vivliostyle CLI | vivliostyle/vivliostyle-cli | docs/ | 既存 |
| Vivliostyle Themes | vivliostyle/themes | docs/ | 既存 |
| Vivliostyle Viewer | vivliostyle/vivliostyle.js | docs/ | **新規作成** |
| Core API Reference | vivliostyle/vivliostyle.js | docs/ | **新規作成** |
| Supported CSS Features | vivliostyle/vivliostyle.js | docs/ | **新規作成** |
| Contribution Guide | vivliostyle/vivliostyle.js | docs/ | **新規作成** |

### 2.5 対象外

- **Create Book**: メンテナンスモードのため、新サイトには含めない

### 2.6 Markdown パーサー（VFM）

#### 採用理由

Astro 標準の remark/rehype ではなく、Vivliostyle 独自の VFM (Vivliostyle Flavored Markdown) を採用する。

| 観点 | Astro 標準 | VFM |
|------|-----------|-----|
| ルビ記法 `{漢字\|かんじ}` | ✗ | ✓ |
| セクション自動生成 | ✗ | ✓ |
| 数式 `$...$` | プラグイン必要 | ✓ |
| Vivliostyle との一貫性 | ✗ | ✓ |

#### 統合方法

Astro Content Collections のカスタムローダーを実装し、VFM で Markdown を HTML に変換する。

```typescript
// src/loaders/vfm-loader.ts
import type { Loader } from 'astro/loaders';
import { stringify } from '@vivliostyle/vfm';

export function vfmLoader({ pattern, base }): Loader {
  return {
    name: 'vfm-loader',
    async load({ store, parseData }) {
      // Markdown ファイルを取得し、VFM で HTML に変換
      // store.set() でコレクションに格納
    },
  };
}
```

### 2.7 工数見積もり（SSMO対応版）

#### Phase 別工数

| Phase | 内容 | 見積もり時間 |
|-------|------|-------------|
| Phase 1 | 基盤構築（VFM + SSMO CSS） | 32〜48時間 |
| Phase 2 | CLI ドキュメント統合 | 8〜12時間 |
| Phase 3 | 他プロダクト統合 | 16〜24時間 |
| Phase 4 | UI/UX 改善 | 12〜16時間 |
| Phase 5 | PDF/EPUB生成・公開 | 12〜18時間 |
| **合計** | | **80〜118時間** |

#### Phase 1 詳細（VFM + SSMO CSS）

| タスク | 見積もり時間 |
|--------|-------------|
| Astro プロジェクトセットアップ | 1〜2時間 |
| **SSMO対応CSS設計・実装** | **12〜18時間** |
| ├─ CSS変数・共通スタイル設計 | 2〜3時間 |
| ├─ Web用レイアウト（ナビ、サイドバー） | 4〜6時間 |
| ├─ レスポンシブ対応 | 3〜4時間 |
| ├─ ダークモード | 2〜3時間 |
| └─ @media print スタイル | 1〜2時間 |
| **VFM カスタムローダー実装** | **8〜16時間** |
| ├─ ローダー本体の実装 | 2〜3時間 |
| ├─ Frontmatter 抽出処理 | 1〜2時間 |
| ├─ 多言語対応（en/ja 振り分け） | 1〜2時間 |
| ├─ submodule パス対応 | 1時間 |
| └─ テスト・デバッグ | 2〜4時間 |
| 基本レイアウトコンポーネント | 4〜6時間 |
| 言語検出・リダイレクト実装 | 2〜4時間 |
| GitHub Actions 設定 | 2〜4時間 |
| テスト・調整 | 3〜4時間 |
| **小計** | **32〜48時間** |

#### 他アプローチとの比較（SSMO観点）

| 項目 | Tailwind（Web専用） | 本案（SSMO対応） |
|------|---------------------|------------------|
| Web版工数 | 60〜88時間 | 70〜100時間 |
| PDF版追加工数 | +40〜60時間（別CSS） | +8〜12時間 |
| EPUB版追加工数 | +30〜50時間 | +4〜6時間 |
| **3形式合計** | **130〜198時間** | **80〜118時間** |
| VFM記法対応 | ✗ | ✓ |
| Vivliostyle価値デモ | ✗ | ✓ |
| ドッグフーディング | ✗ | ✓ |

#### 備考

- **SSMO対応は3形式出力を前提とすると実は効率的**
- 来訪者に「1ソースからWeb/PDF/EPUB」をデモンストレーション可能
- VFM 記法をそのまま使用でき、既存ドキュメントの変換不要

---

## 3. 開発フェーズ

### Phase 1: 基盤構築

- [ ] Astro プロジェクトのセットアップ
- [ ] **SSMO対応CSSの実装**
  - [ ] CSS変数・共通スタイル設計
  - [ ] Web用レイアウト（ナビ、サイドバー）
  - [ ] レスポンシブ対応
  - [ ] ダークモード
  - [ ] @media print スタイル
- [ ] **VFM カスタムローダーの実装**
  - [ ] @vivliostyle/vfm パッケージのインストール
  - [ ] vfm-loader.ts の作成
  - [ ] Content Collections 設定 (src/content.config.ts)
  - [ ] Frontmatter 抽出・スキーマ定義
- [ ] 基本レイアウトコンポーネント作成
- [ ] 言語検出・リダイレクト機能の実装
- [ ] GitHub Pages デプロイ設定（GitHub Actions）

### Phase 2: CLI ドキュメントの統合（優先）

- [ ] vivliostyle-cli を submodule として追加
- [ ] CLI ドキュメントの表示確認
- [ ] サイドバーナビゲーション実装
- [ ] 言語切り替え機能実装

### Phase 3: 他プロダクトのドキュメント統合

- [ ] VFM を submodule として追加・統合
- [ ] Themes を submodule として追加・統合
- [ ] vivliostyle.js を submodule として追加
- [ ] Viewer 等のドキュメントを vivliostyle.js/docs/ に移動・統合

### Phase 4: UI/UX 改善

- [ ] 検索機能の実装
- [ ] 前後ページナビゲーション
- [ ] パンくずリスト
- [ ] レスポンシブデザイン調整

### Phase 5: PDF/EPUB生成・公開

- [ ] **PDF生成の設定**
  - [ ] vivliostyle.config.js の作成
  - [ ] Vivliostyle CLI でのPDF生成確認
  - [ ] PDF版の表紙・目次設計
- [ ] **EPUB生成の設定**
  - [ ] EPUBビルドスクリプト
  - [ ] メタデータ設定
- [ ] **CI/CD設定**
  - [ ] GitHub ActionsでWeb/PDF/EPUB自動生成
  - [ ] ダウンロードリンクの設置
- [ ] 全ページの表示確認
- [ ] リンク切れチェック
- [ ] SEO 対策（メタタグ、OGP、sitemap.xml）
- [ ] パフォーマンス最適化
- [ ] 本番公開

---

## 4. 移行計画

### 4.1 docs.vivliostyle.org からの移行

1. Viewer、API Reference、CSS Features、Contribution Guide のコンテンツを `vivliostyle/vivliostyle.js` リポジトリの `docs/` ディレクトリにコピー
2. 新サイト（docs2.vivliostyle.org）の完成・公開
3. 旧サイト（docs.vivliostyle.org）から新サイトへのリダイレクト設定
4. 一定期間後、旧サイトのコンテンツを削除

### 4.2 既存リンクへの対応

旧 URL から新 URL へのリダイレクトマッピングを作成し、SEO への影響を最小化する。

---

## 5. ディレクトリ構造（予定）

```
docs2.vivliostyle.org/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # GitHub Pages デプロイ用
│       └── build-pdf-epub.yml  # PDF/EPUB 自動生成
├── submodules/
│   ├── vfm/
│   ├── vivliostyle-cli/
│   ├── themes/
│   └── vivliostyle.js/
├── src/
│   ├── content.config.ts       # Content Collections 設定
│   ├── loaders/
│   │   └── vfm-loader.ts       # VFM カスタムローダー
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Sidebar.astro
│   │   ├── Footer.astro
│   │   └── LanguageSwitcher.astro
│   ├── layouts/
│   │   └── DocsLayout.astro
│   ├── pages/
│   │   ├── index.astro         # 言語検出・リダイレクト
│   │   ├── en/
│   │   │   ├── index.astro
│   │   │   ├── cli/
│   │   │   ├── vfm/
│   │   │   └── ...
│   │   └── ja/
│   │       ├── index.astro
│   │       ├── cli/
│   │       ├── vfm/
│   │       └── ...
│   └── styles/
│       ├── global.css          # 共通CSS変数
│       ├── web.css             # @media screen
│       └── print.css           # @media print
├── public/
│   ├── favicon.ico
│   ├── docs.pdf            # 生成されるPDF
│   └── docs.epub           # 生成されるEPUB
├── vivliostyle.config.js   # Vivliostyle CLI 設定
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 6. 参考リンク

- [Astro Documentation](https://docs.astro.build/)
- [Astro Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)
- [VFM (Vivliostyle Flavored Markdown)](https://github.com/vivliostyle/vfm)
- [Tailwind CSS](https://tailwindcss.com/)
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- [GitHub Pages](https://docs.github.com/en/pages)
- [Issue #25: docs.vivliostyle.org の問題点](https://github.com/vivliostyle/docs.vivliostyle.org/issues/25)

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2025-12-23 | 初版作成 |
| 2025-12-23 | VFM カスタムローダー方式を追加（セクション 2.6）|
| 2025-12-23 | 工数見積もりを独立セクション（2.7）に移動、全体工数を追加 |
