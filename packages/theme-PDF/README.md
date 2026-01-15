# Vivliostyle PDF Theme

Vivliostyle Documentation用のPDF生成専用テーマです。ドキュメントサイトからPDFを生成する際に、Web専用要素を自動的に除外し、印刷に適したレイアウトを提供します。

## 特徴

- **A4サイズに最適化**: PDFの標準サイズで読みやすいレイアウト
- **ページ番号**: 下中央に配置（左右のマージンに重複なし）
- **Web要素の自動除外**: ヘッダー、サイドバー、ナビゲーション、検索ボックス等を自動的に非表示
- **画像の最適化**: floatスタイルを無効化し、ページ内に収まるよう調整
- **タイポグラフィ**: 読みやすいフォントサイズと行間
- **コードブロック**: シンタックスハイライト対応でページ分割を回避
- **テーブル**: ページ内に収まるよう最適化
- **ページブレーク制御**: 見出し後の改ページを回避

## 使用方法

vivliostyle.config.jsで以下のように指定：

```javascript
export default {
  theme: './packages/theme-PDF',
  // または npm公開後
  // theme: '@vivliostyle/theme-PDF',
  entry: ['dist/ja/viewer/vivliostyle-viewer/index.html'],
  output: 'public/downloads/output.pdf',
  // ...
};
```

## ライセンス

AGPL-3.0
