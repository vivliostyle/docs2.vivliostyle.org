# Phase 5: PDF/EPUB生成・公開

## 概要

Phase 5では、Vivliostyleの最大の特徴である「Single Source Multi Output (SSMO)」を実践します。
現在Webサイトとして公開されているMarkdownドキュメントから、PDF版およびEPUB版を自動生成し、ユーザーに提供します。

これにより、docs.vivliostyle.orgは「1つのソースからWeb/PDF/EPUBを出力できる」というVivliostyleの価値を実証するショーケースとなります。

## 主要タスク

### 0. スマホ表示の修正 (1〜2時間)

**優先度: 高** - PDF/EPUB生成前に解決すべき残存UI問題

- [ ] ヘッダー要素のレスポンシブ対応
  - 現状: スマホでダークモードトグルボタンと言語スイッチが画面幅からはみ出している
  - 問題: 右スクロールしないとボタンにアクセスできない
  - 対応方針: **スマホ表示時はハンバーガーメニュー内に移動**
  - 実装内容:
    1. スマホ表示時（モバイルビュー）のみ、ダークモードトグルと言語スイッチをメニュー上部に配置
    2. PC/タブレット表示時は現状維持（ヘッダーに表示）
    3. メニュー内での配置: メニュー上部にスペースを確保し、2つのスイッチを横並びで配置
    4. メニューを開いた時にすぐアクセスできるよう、ナビゲーションリンクの上に配置

### 1. PDF生成の設定 (8〜12時間)

- [ ] `vivliostyle.config.js`の作成
  - 各言語（en/ja）ごとの設定
  - 各プロダクト（CLI/VFM/Themes/Viewer等）ごとの設定オプション
- [ ] Vivliostyle CLIでのPDF生成確認
  - ローカル環境でのビルドテスト
  - 生成されるPDFの品質確認
- [ ] PDF版の表紙・目次設計
  - 各プロダクトドキュメントの表紙デザイン
  - 目次の自動生成設定
  - ページ番号・ヘッダー・フッターのスタイリング

### 2. EPUB生成の設定 (4〜6時間)

- [ ] EPUBビルドスクリプトの作成
  - Vivliostyle CLI の EPUB 出力オプション設定
  - 各言語・各プロダクトごとのビルドスクリプト
- [ ] メタデータ設定
  - title, author, publisher, language等
  - 表紙画像の指定
  - 目次（NCX/Navigation Document）の設定

### 3. CI/CD設定 (4〜6時間)

- [ ] GitHub ActionsでのWeb/PDF/EPUB自動生成
  - `.github/workflows/build-all-formats.yml`の作成
  - Webサイト、PDF、EPUBを並行ビルド
  - 成果物のアップロード設定
- [ ] ダウンロードリンクの設置
  - 各ページにPDF/EPUBダウンロードボタンを追加
  - `public/downloads/`ディレクトリへの配置
  - 各言語・各プロダクトごとのダウンロードページ

### 4. 最終調整・公開準備 (4〜6時間)

- [ ] 全ページの表示確認（Web/PDF/EPUB）
- [ ] リンク切れチェック
- [ ] SEO対策の最終確認
  - メタタグの確認
  - OGP画像の設定
  - `sitemap.xml`の生成
  - `robots.txt`の設定
- [ ] パフォーマンス最適化
  - 画像の最適化
  - CSS/JSの最小化確認
  - Core Web Vitals の確認
- [ ] 本番公開
  - `docs2.vivliostyle.org` → `docs.vivliostyle.org`への移行準備
  - リダイレクト設定の確認

## 期待される成果

1. **ドキュメントの3形式提供**: Web、PDF、EPUB形式でドキュメントを提供
2. **SSMOの実証**: Vivliostyleの「Single Source Multi Output」を体現
3. **オフライン利用**: PDF/EPUBによりオフラインでのドキュメント閲覧が可能
4. **印刷最適化**: PDF版により印刷に最適化されたドキュメントを提供
5. **自動化**: CI/CDによる自動ビルド・デプロイ

## 参考資料

- [Vivliostyle CLI Documentation](https://github.com/vivliostyle/vivliostyle-cli)
- [vivliostyle.config.js Reference](https://github.com/vivliostyle/vivliostyle-cli#configuration-file)
- [DEVELOPMENT_PLAN-2.md - Phase 5](https://github.com/vivliostyle/docs.vivliostyle.org/blob/main/_investigation/DEVELOPMENT_PLAN-2.md#phase-5-pdfepub生成機能)

## 見積もり工数

**合計: 13〜20時間**

- **スマホ表示の修正: 1〜2時間** ⚠️ 優先
- PDF生成の設定: 8〜12時間
- EPUB生成の設定: 4〜6時間  
- CI/CD設定: 4〜6時間
- 最終調整・公開準備: 4〜6時間

※実際の工数は、生成されるPDFの品質調整や、各プロダクトドキュメントの量に応じて変動する可能性があります。

## 関連Issue

- Phase 4完了: #6 (merged)
