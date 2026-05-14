---
title: CMYK変換ガイド
description: device-cmyk()関数とCLIのPDF CMYK出力
lang: ja
order: 3
---

# CMYK変換ガイド

> **対象バージョン**: Vivliostyle.js v2.40.0+（2026-01-11リリース）、Vivliostyle CLI v10.6.0+
> **公開日**: 2026-05-05
> **最終更新日**: 2026-05-05

このガイドは、CSS側の`device-cmyk()`によるCMYK色指定と、CLI側の`pdfPostprocess.cmyk`によるCMYK PDF出力を扱います。

## 1.印刷用PDFでなぜCMYKが必要か

商業オフセット印刷では、**Cyan**・**Magenta**・**Yellow**・**Key（黒）**の4色のプロセスインキを使います。印刷所は、色がCMYKカラースペースで直接指定されたPDFを要求します。RGB→CMYK変換はワークフローごとに結果が異なるため、最初からCMYKでPDFを作るのが結果を確定的にコントロールする唯一の方法だからです。

v2.39.xまではVivliostyleはRGBしか出力できませんでしたが、v2.40.0で次の2つが導入されました:

- CSSで直接CMYKを指定するための関数`device-cmyk()`
- CLIの後処理（`pdfPostprocess.cmyk`）で、生成されたRGB PDFをCMYK PDFに変換する仕組み。RGB→CMYKのカスタムマッピングにも対応

これにより、印刷入稿可能なPDFをVivliostyleだけで一貫して制作できるようになりました。

## 2. CSS関数`device-cmyk()`

`device-cmyk()`は[CSS Color 5](https://drafts.csswg.org/css-color-5/#device-cmyk)で定義されています。

### 基本構文

```css
color: device-cmyk(0 1 1 0);            /* M=Y=100% のプロセスレッド */
color: device-cmyk(100% 0% 0% 0%);      /* C=100% のプロセスシアン（パーセント表記） */
color: device-cmyk(0 0 0 1);            /* K=100%（純黒） */
```

引数の順序は**C, M, Y, K**。各チャンネルは`0..1`の数値またはパーセント値（`0%..100%`）です。

### レガシー構文（カンマ区切り）

CSS3時代のレガシー構文との互換性のため、カンマ区切りも受け付けます:

```css
color: device-cmyk(0, 1, 1, 0);
```

### アルファ値

末尾に`/`でアルファを付加できます:

```css
background-color: device-cmyk(0 1 1 0 / 0.5);
```

## 3.さまざまなCSSプロパティでの使用

`device-cmyk()`は`<color>`値が許される任意の場所で使えます:

```css
h1 { color: device-cmyk(0 0 0 1); }                     /* テキスト色 */
.callout {
  background-color: device-cmyk(0 0.1 0.2 0);           /* 背景色 */
  border: 1pt solid device-cmyk(0 0.5 1 0.1);           /* ボーダー */
  background-image: linear-gradient(
    device-cmyk(1 0 0 0),
    device-cmyk(0 0 0 0)
  );                                                     /* グラデーション */
}
@page {
  background: device-cmyk(0 0 0.05 0);                  /* ページ背景 */
}
```

## 4.プロセスカラーの実用例

|用途| CMYK |備考|
|---|---|---|
|リッチブラック（大面積のベタ用の深い黒）| `device-cmyk(0.4 0.3 0.3 1)` |コート紙でK単色がやや灰色に見える問題を回避|
|プロセスレッド| `device-cmyk(0 1 1 0)` | M=Y=100% |
|プロセスグリーン| `device-cmyk(1 0 1 0)` | C=Y=100% |
|プロセスブルー| `device-cmyk(1 1 0 0)` | C=M=100% |
|淡い塗り（囲み・ハイライト用）| `device-cmyk(0 0.1 0.2 0)` |暖色系の淡いトーン|

## 5. CLIによるCMYK PDF出力

`device-cmyk()`は、CSS著者が制御するレベルでカラースペースオブジェクトがCMYKのPDFを生成します。ただしVivliostyle CLIはそれ以外の要素（ページ背景、埋め込み画像など）はデフォルトでRGB出力です。PDF全体をCMYK PDFに変換するには、CLIの後処理を設定します:

```js
// vivliostyle.config.js
export default {
  // ...
  pdfPostprocess: {
    cmyk: {
      // Vivliostyle が PDF を生成した後に CMYK 変換を実行
      enabled: true,
    },
  },
};
```

内部ではGhostscriptを色変換デバイスで起動し、PDF内のすべてのカラースペースオブジェクトをDeviceCMYKに変換します。

## 6. RGB→CMYKカスタムマッピング（`overrideMap`）

デフォルトのRGB→CMYK変換は汎用プロファイルを使うので、印刷所が期待する色とは違うことがほとんどです。CLIは、特定のRGB色を手調整したCMYK値で上書きできます:

```js
pdfPostprocess: {
  cmyk: {
    enabled: true,
    overrideMap: [
      // ブランドオレンジ (#FF6633) を調整済みの CMYK に変換
      { from: '#FF6633', to: 'cmyk(0, 70, 90, 0)' },
      // ブランドの主要色を網羅
      { from: '#003366', to: 'cmyk(100, 80, 20, 40)' },
    ],
  },
},
```

特に有効な場面:

- **SVGコンテンツ**がRGBで作られている場合
- **ロゴやスポットカラーを含むラスター画像**
- **`device-cmyk()`で書かれていないCSS値**（サードパーティ製テーマなど）

## 7.デバッグ用カラーマップ出力（`mapOutput`）

どの色が変換されたかを監査するため、マップをファイルに書き出せます:

```js
pdfPostprocess: {
  cmyk: {
    enabled: true,
    mapOutput: './cmyk-map.txt',
  },
},
```

ソースPDF中で見つかった一意のRGB色と、変換後のCMYK値が対応付けて記録されます。

## 8.画像の差し替え（`replaceImage`）

ワークフローによってはWeb用と印刷用で画像を分けることがあります（Web用はRGB JPEG、印刷用はCMYK変換済みTIFFなど）。CLIはPDF後処理時に画像を差し替えられます:

```js
pdfPostprocess: {
  cmyk: {
    enabled: true,
    replaceImage: [
      { match: 'cover.jpg', with: 'cover-print.tiff' },
    ],
  },
},
```

## 9.制限事項と注意点

- **グラデーションや画像エフェクト**:色のグラデーションや一部の画像フィルター効果は、CMYK変換でロスレスにラウンドトリップしないことがあります。入稿前に視覚的に確認してください。
- **スポットカラー**: `device-cmyk()`はスポットインキ（Pantone、DICなど）には対応しません。スポットカラー分版が必要な場合は、印刷所側または別のPDF後処理ステップで扱います。
- **ソフトプルーフ**:結果は*device-cmyk* PDFです。実際の印刷物が画面と一致するかは印刷所のCMYKプロファイルに依存し、Vivliostyleの責任範囲外です。

## 10.ビルドと検証

生成PDFのインクカバレッジを確認するには、Ghostscriptの`inkcov`デバイスを使います:

```sh
gs -o - -sDEVICE=inkcov mybook.pdf
```

ページごとのインクカバレッジが4つの数値（C M Y K）として`0..1`の範囲で表示され、印刷時のチャンネルごとのインキ量を事前に確認できます。

## 参照

- W3C [CSS Color 5 — `device-cmyk()`](https://drafts.csswg.org/css-color-5/#device-cmyk)
- CLI例: `vivliostyle-cli/examples/cmyk/`
- テストケース: `vivliostyle.js/packages/core/test/files/device-cmyk/test.html`
