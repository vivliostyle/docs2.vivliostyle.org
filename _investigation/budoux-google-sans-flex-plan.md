# BudouX と Google Sans Flex 導入計画

## プロジェクト概要

Vivliostyle ドキュメントサイトに以下の2つの機能を追加します:

1. **BudouX** - 様々なデバイスに対応した日本語の改行位置の改良
2. **Google Sans Flex** - 欧文表示の改善のためのバリアブルフォント

## 現在の構成

- **フレームワーク**: Astro 5.16.6 (静的サイトジェネレーター)
- **コンテンツ処理**: VFM Loader → VFM → HTML変換
- **現在のフォント**: Noto Sans JP (Google Fonts CDN)
- **ビルドプロセス**: 静的HTML生成 → Pagefind検索インデックス → Vivliostyle CLI でPDF生成

## 推奨アプローチ

### BudouX: ビルド時統合

**理由**:
- 静的サイトなので、ビルド時に処理するのが最適
- クライアント側のJavaScript不要 → パフォーマンス向上
- PDF生成でも同じ改行位置が適用される
- ゼロ幅スペース (U+200B) はWeb/PDF/EPUB全てで有効

**実装場所**: `/src/loaders/vfm-loader.ts` の196-200行目
- VFMからHTML変換後、BudouXを適用
- 日本語コンテンツのみ処理 (`lang === 'ja'` の場合)

### Google Sans Flex: CSSバリアブルフォント

**理由**:
- 1つのフォントファイルで全ウェイト・幅をカバー
- 複数の静的フォントより軽量
- Noto Sans JPと組み合わせて使用
- Vivliostyle のPDF生成でもサポート

**実装場所**: `/public/styles/global.css`
- `@import` でフォント読み込み (13行目)
- `--font-sans` CSS変数を更新 (52行目)

## 実装ステップ

### ステップ1: 依存関係のインストール

```bash
npm install budoux --save
```

### ステップ2: VFM Loaderの更新

**ファイル**: `/src/loaders/vfm-loader.ts`

**追加するコード**:

```typescript
// ファイル先頭にインポート追加
import { loadDefaultJapaneseParser } from 'budoux';

// パーサーを初期化（1回のみ、関数外で）
const budouXParser = loadDefaultJapaneseParser();

// 196-200行目の stringify() 呼び出し後に追加
html = stringify(processedMarkdownBody, {
  hardLineBreaks: false,
  disableFormatHtml: false,
});

// 日本語コンテンツの場合、BudouXを適用
if (lang === 'ja') {
  html = budouXParser.translateHTMLString(html);
}
```

**動作**:
- `translateHTMLString()` はHTMLタグを保持しながら、テキストノードにゼロ幅スペースを挿入
- コードブロック (`<pre>`, `<code>`) は自動的にスキップ
- 自然な文節位置で改行できるようになる

### ステップ3: フォントCSSの更新

**ファイル**: `/public/styles/global.css`

**13行目を更新**:

```css
/* Google Sans Flex - 欧文用バリアブルフォント */
@import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@8..144,100..1000&display=swap');

/* Noto Sans JP - 日本語フォント */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
```

**52行目を更新**:

```css
--font-sans: "Google Sans Flex", "Noto Sans JP", "Circled Numbers", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**フォント選択ロジック**:
- 欧文文字 (a-z, 数字, 記号) → Google Sans Flex
- 日本語文字 (ひらがな, カタカナ, 漢字) → Noto Sans JP
- 丸数字 → Circled Numbers
- ブラウザが文字コードに応じて自動選択

### ステップ4: 開発ビルドでテスト

```bash
npm run dev
```

**確認項目**:
- [ ] 日本語テキストが狭い画面で自然に改行される
- [ ] 欧文見出しがGoogle Sans Flexで表示される
- [ ] 日本語本文がNoto Sans JPで表示される
- [ ] コードブロックが正しく表示される
- [ ] ダークモードで正常に動作する

### ステップ5: 本番ビルドでテスト

```bash
npm run build
```

**確認項目**:
- [ ] ビルドがエラーなく完了する
- [ ] 生成されたHTMLにゼロ幅スペースが含まれる
- [ ] Pagefind検索が正常に機能する

### ステップ6: PDF生成のテスト

```bash
npm run build:pdf:cli-ja
npm run build:pdf:vfm-ja
```

**確認項目**:
- [ ] PDFが正常に生成される
- [ ] フォントがPDFに埋め込まれている
- [ ] 日本語の改行位置が適切
- [ ] PDFファイルサイズが許容範囲内 (200-500KB増加は想定内)

### ステップ7: クロスブラウザテスト

**テスト環境**:
- Chrome, Firefox, Safari
- デスクトップとモバイル
- ライトモードとダークモード

### ステップ8: パフォーマンステスト

**測定項目**:
- ビルド時間 (想定: +20-30秒)
- ページロード時間
- フォントロード時間
- Largest Contentful Paint (LCP)

## 変更が必要な重要ファイル

1. **`/src/loaders/vfm-loader.ts`**
   - BudouX統合のコアファイル
   - 196-200行目: VFMのHTML生成後にBudouX処理を追加

2. **`/public/styles/global.css`**
   - フォント統合ファイル
   - 13行目: `@import` の更新
   - 52行目: `--font-sans` 変数の更新

3. **`/package.json`**
   - budoux 依存関係の追加

4. **`/src/pages/ja/cli/[...slug].astro`**
   - 動作確認用の日本語ページテンプレート
   - 147行目: `set:html` で処理済みHTMLをレンダリング

5. **`/vivliostyle.config-cli-ja.js`**
   - PDF生成設定ファイル
   - フォント埋め込みの確認用

## リスクと対策

### リスク1: BudouXがコードブロックを壊す可能性

**対策**: BudouXの `translateHTMLString()` は `<pre>` と `<code>` タグを自動スキップ

### リスク2: Pagefind検索インデックスへの影響

**対策**: ゼロ幅スペースは空白文字として扱われるため、通常は問題なし
**確認**: 実装後に検索機能をテスト

### リスク3: PDFフォント埋め込みの失敗

**対策**: Google Fonts CDNはChromiumで十分サポートされている
**フォールバック**: 必要に応じて `/public/fonts/` にローカルホスト

### リスク4: PDFファイルサイズの増加

**対策**: バリアブルフォントは複数の静的フォントより効率的
**許容範囲**: PDF1つあたり200-500KB増加は許容範囲

### リスク5: ビルド時間の増加

**対策**: パーサー初期化は1回のみ、処理は高速
**許容範囲**: 全体で20-30秒増加は許容範囲

## ロールバック戦略

問題が発生した場合:

1. **BudouXのロールバック**:
   - vfm-loader.tsからimportと関数呼び出しを削除
   - `npm uninstall budoux`

2. **フォントのロールバック**:
   - `/public/styles/global.css` を元に戻す
   - Google Sans Flexの `@import` を削除
   - `--font-sans` 変数を元の値に戻す

## 検証手順

### Web (ブラウザ)
1. `npm run dev` で開発サーバー起動
2. 日本語ページを開く
3. ブラウザ幅を狭くして改行位置を確認
4. DevToolsでフォントをチェック
5. ダークモード切り替えをテスト

### PDF (Vivliostyle CLI)
1. `npm run build:pdf:cli-ja` で日本語CLIドキュメントPDF生成
2. PDFを開いて見た目を確認
3. PDFのプロパティでフォント埋め込みを確認
4. ファイルサイズをチェック

### 検索 (Pagefind)
1. `npm run build` で本番ビルド
2. `npm run preview` でプレビュー
3. 日本語キーワードで検索
4. 検索結果が正しく表示されることを確認

## 想定所要時間

- BudouXインストール: 1分
- VFM Loader更新: 30分
- フォントCSS更新: 10分
- 開発ビルドテスト: 15分
- 本番ビルドテスト: 20分
- PDFテスト: 30分
- クロスブラウザテスト: 20分
- パフォーマンステスト: 15分

**合計**: 2.5-3時間

## 将来の改善案

1. BudouXキャッシング: ビルド時間短縮のため処理済みHTMLをキャッシュ
2. 選択的BudouX: フロントマターでページ単位で無効化
3. フォントサブセット化: パフォーマンス改善
4. オプティカルサイズの調整: ブレークポイント別に最適化
5. A/Bテスト: 改行品質の測定

## 参考リソース

- [BudouX npm package](https://www.npmjs.com/package/budoux)
- [BudouX GitHub](https://github.com/google/budoux)
- [Google Sans Flex on Google Fonts](https://fonts.google.com/specimen/Google+Sans+Flex)
