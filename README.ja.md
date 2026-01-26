# Vivliostyle Documentation Site

このリポジトリは [Vivliostyle](https://vivliostyle.org/) の公式ドキュメントサイト（次世代版）のソースです。

## 概要

- Astro + VFM (Vivliostyle Flavored Markdown) による静的サイト生成
- SSMO (Single Source Multi Output) 対応CSS
- 多言語対応（日本語・英語）
- GitHub Actionsによる自動デプロイ（GitHub Pages）

## 主な技術

- [Astro](https://astro.build/) v5
- [@vivliostyle/vfm](https://github.com/vivliostyle/vfm)（Markdown→HTML変換）
- [gray-matter](https://github.com/jonschlinkert/gray-matter)（frontmatter抽出）

## ディレクトリ構成

```
/
├── content/           # ドキュメント本文（Markdown）
│   ├── en/
│   └── ja/
├── public/            # 静的ファイル（そのまま配信されるアセット）
│   ├── styles/
│   ├── themes/
│   ├── vfm/
│   └── viewer/
├── src/               # Astroソース（コンポーネント、ページ、スタイル等）
│   ├── components/
│   ├── layouts/
│   ├── loaders/
│   ├── pages/
│   └── styles/
├── _investigation/    # 調査・検討メモ、計画ドキュメント
├── packages/          # ローカルパッケージ
├── submodules/        # Git submodule群
├── .github/workflows/ # CI/CDワークフロー
├── astro.config.mjs
├── tsconfig.json
├── vivliostyle.config-*.js
└── package.json
```

## 開発・ビルド・デプロイ

| コマンド              | 説明                                   |
|----------------------|----------------------------------------|
| `npm install`        | 依存パッケージのインストール           |
| `npm run dev`        | 開発サーバー起動（http://localhost:4321）|
| `npm run build`      | 静的サイトを `./dist/` にビルド         |
| `npm run preview`    | ビルド成果物のローカルプレビュー       |

GitHub Actions により `astro-Install`/`main` ブランチへの push で自動デプロイされます。

公開URL: https://docs.vivliostyle.org/


## コントリビュート・参考

- [Vivliostyle公式サイト](https://vivliostyle.org/)
- [Astro公式ドキュメント](https://docs.astro.build)
- [VFM (Vivliostyle Flavored Markdown)](https://github.com/vivliostyle/vfm)
