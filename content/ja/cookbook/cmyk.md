---
title: CMYK変換ガイド
description: device-cmyk()関数とCLIのPDF CMYK出力
lang: ja
order: 3
---

# CMYK変換ガイド

> **対象バージョン**: Vivliostyle.js v2.40.0+（2026-01-11リリース）、Vivliostyle CLI v10.6.0+
> **公開日**: 2026-05-05
> **最終更新日**: 2026-05-16

このガイドは、`device-cmyk()` CSS関数と `pdfPostprocess.cmyk` の仕組みと制約を説明します。

## この機能でできること・できないこと

Vivliostyle CLIはChromiumを制御してPDFを生成します。WebブラウザはCMYKカラースペースを原理的にサポートしないため、Chromiumが出力するPDFの色はすべてDeviceRGBです。この機能はその後段でMuPDFを使った後処理を行い、PDFコンテンツストリーム内のDeviceRGBカラー演算子（`rg`/`RG`）をDeviceCMYKカラー演算子（`k`/`K`）に置換します。

![CMYK変換フロー概念図](/cookbook/cmyk/flow-ja.svg)

変換の対象と対象外を整理します。

**変換される**（DeviceRGBカラー演算子として出力される箇所）:
- テキストの色（`color`プロパティ）
- 単色の背景色・ボーダー（`background-color`、`border-color`）
- SVGのベクター要素の単色塗り（`reserveMap` 経由）

**変換されない**（DeviceRGBカラー演算子以外の方法でPDFに書き込まれる箇所）:
- **ラスター画像**（JPEG・PNG等）— あらかじめCMYK変換した画像素材を用意し `replaceImage` で差し替えてください
- **グラデーション**（`linear-gradient()` 等）— ChromiumがPDFのShading Objectとして出力するため置換対象外
- **フィルタ・ブレンドモード等**— 透明グループ等の別機構で表現されるため置換対象外

つまり本機能は、画像など既存のソリューションが確立している領域は扱わず、**文字・ベクター単色塗りに限定した置換**を行う、割り切った実装です。実用にあたっては素直な単色指定のCSSを心がけ、加工済みの画像素材を用意することが前提になります。

なお、印刷会社がRGB入稿を受け付ける場合は、そちらを選択するほうが確実なケースも少なくありません。

## 前提知識：PDFのカラーオペレーター

この機能の動作を正しく理解するには、PDFのカラーオペレーターについての知識が必要です。

PDFのコンテンツストリームでは、色をオペレーター1語で指定するショートカット形式があります。オペレーター名自体がカラースペースを内包しているため、別途カラースペースの宣言を書く必要がありません。これを**暗黙型カラーオペレーター**と呼びます。

| オペレーター | カラースペース | 対象 |
|---|---|---|
| `rg`（小文字） | DeviceRGB | 塗り（fill） |
| `RG`（大文字） | DeviceRGB | 線（stroke） |
| `k`（小文字） | DeviceCMYK | 塗り（fill） |
| `K`（大文字） | DeviceCMYK | 線（stroke） |

Chromiumはテキスト・単色塗りを `rg`/`RG` オペレーターとしてPDFに出力します。Vivliostyle CLIの後処理はこの `rg` を `k` に、`RG` を `K` に置換します。引数の数がRGBの3値からCMYKの4値に変わるため、RGB→CMYKのマッピングが必要です。このマッピングを提供するのが `reserveMap` と `overrideMap` です。

## CSS関数 `device-cmyk()`

`device-cmyk()`は[CSS Color 5](https://drafts.csswg.org/css-color-5/#device-cmyk)で定義されています。

### 仕組み

VivliostyleはWebブラウザ上で動作するため、CSS処理段階では `device-cmyk()` を一旦 `color(srgb r g b)` に変換し、そのRGB値とCMYK値の対応をCmykStoreに記録します。実際のCMYK化はCLIの後処理で行われます。

### 基本構文

```css
color: device-cmyk(0 1 1 0);            /* プロセスレッド（M=Y=100%） */
color: device-cmyk(100% 0% 0% 0%);      /* プロセスシアン（パーセント表記） */
color: device-cmyk(0 0 0 1);            /* 純黒（K=100%） */
```

引数の順序は **C, M, Y, K**。各チャンネルは `0..1` の数値またはパーセント値（`0%..100%`）です。カンマ区切りのレガシー構文（CSS3時代の互換用）も受け付けます。

### 使用できる場所の制約

`device-cmyk()` は `<color>` 値が使える任意のCSSプロパティに記述できますが、CMYK変換が有効なのは変換後のRGB値がPDFコンテンツストリームの `rg`/`RG` オペレーターとして直接露出する箇所に限られます。単色の `color`・`background-color`・`border-color` は概ねこれに該当しますが、グラデーション（`linear-gradient()` 等）は対象外です。グラデーション内での `device-cmyk()` 使用は避けてください。

```css
/* ✅ CMYK変換される */
h1 { color: device-cmyk(0 0 0 1); }
.box { background-color: device-cmyk(0 0.1 0.2 0); }
.box { border: 1pt solid device-cmyk(0 0.5 1 0.1); }

/* ❌ CMYK変換されない（グラデーションはShading Objectになる） */
.box {
  background-image: linear-gradient(
    device-cmyk(1 0 0 0),
    device-cmyk(0 0 0 0)
  );
}
```

### アルファ値

末尾に `/` でアルファを指定できますが、アルファはカラーオペレーターとは別の仕組みで表現されるため、後処理での置換においてアルファは無視されます。

## プロセスカラーの実用例

| 用途 | CMYK | 備考 |
|---|---|---|
| リッチブラック（大面積のベタ用） | `device-cmyk(0.4 0.3 0.3 1)` | K単色がやや灰色に見える問題を回避 |
| プロセスレッド | `device-cmyk(0 1 1 0)` | M=Y=100% |
| プロセスグリーン | `device-cmyk(1 0 1 0)` | C=Y=100% |
| プロセスブルー | `device-cmyk(1 1 0 0)` | C=M=100% |
| 淡い塗り（囲み・ハイライト用） | `device-cmyk(0 0.1 0.2 0)` | 暖色系の淡いトーン |

## CLIによるCMYK PDF出力

### 有効化

```js
// vivliostyle.config.js
export default {
  pdfPostprocess: {
    cmyk: true,   // または cmyk: {} （等価）
  },
};
```

デフォルトは `false`。`false` のときは `device-cmyk()` で指定した色のCMYK置換も行われません。

### 内部動作

後処理はMuPDFで実行されます。PDFのコンテンツストリームを走査し、DeviceRGBカラーオペレーター（`rg`/`RG`）をDeviceCMYKカラーオペレーター（`k`/`K`）に置換します。置換に使うRGB→CMYKのマッピングは、`device-cmyk()` からCmykStoreに記録された値と、`reserveMap`・`overrideMap` で指定した値から構成されます。

## SVGなど、CSS外で生まれるRGB色への対応：`reserveMap`

SVGのベクター要素の塗り色はChromiumが直接RGB値としてPDFに出力するため、`device-cmyk()` では指定できません。これらのRGB→CMYKの対応を `reserveMap` でCSS処理前にCmykStoreへ登録します。

```js
pdfPostprocess: {
  cmyk: {
    reserveMap: [
      ['#FF6633', { c: 0, m: 7000, y: 9000, k: 0 }],
      ['#003366', { c: 10000, m: 8000, y: 2000, k: 4000 }],
    ],
  },
},
```

**エントリ形式**：`[rgb, { c, m, y, k }]` のタプル配列。

**値のスケール**：CMYK・RGB値ともに **0–10000 の整数**（10000 = 100%、最小単位 0.0001%）。JavaScriptの浮動小数点数の精度問題を避けるためこの表現が使われています。

**RGBのキー**：Hex文字列（`'#FF6633'`）も使用できます。Chromiumの内部実装をエミュレートした処理により0–10000のRGB値に正規化されます。

## 最後の手段：`overrideMap`

`overrideMap` は、`reserveMap` もCSSの `device-cmyk()` も届かない色が残存する場合の退避手段です。内部で生成される不可視要素など、ソース上に現れないRGB色が後処理後も残る場合に使います。後処理時にCmykStoreの最終マップに上書きマージされます。

エントリ形式・値スケールは `reserveMap` と同じです。`reserveMap` で登録済みの色は警告にも現れないため、同じ色を `overrideMap` に追加する必要はありません。

## マッピング漏れの検出：`warnUnmapped`

後処理後にPDFに残ったDeviceRGBオペレーターに対して警告します。PDFの段階ではCSS由来かSVG由来かを区別できないため、残存するすべてのRGB色が対象になります。

```js
pdfPostprocess: {
  cmyk: {
    warnUnmapped: true,
  },
},
```

警告に現れたRGB色を `reserveMap` に追加していくことが、実際のワークフローになります。

## 実用上のワークフロー

1. CSSは単色指定（`color`・`background-color`・`border`）に留め、`device-cmyk()` で色を指定する
2. ラスター画像はあらかじめCMYK変換した素材を用意する（`replaceImage` で差し替え）
3. SVGのベクター色を `reserveMap` に登録する
4. `warnUnmapped: true` を有効にして出力し、警告のRGB色を `reserveMap` に追加する
5. Ghostscriptの `inkcov` で最終的なインクカバレッジを確認する

## 画像の差し替え：`pdfPostprocess.replaceImage`

`replaceImage` は `cmyk` とは独立した機能で、`cmyk: false` の場合でも動作します。

```js
pdfPostprocess: {
  replaceImage: [
    { source: 'cover.jpg', replacement: 'cover-print.tiff' },
    { source: /^images\/web-(.+)\.jpg$/, replacement: 'images/print-$1.tiff' },
  ],
},
```

- `source`：文字列またはJavaScript正規表現
- `replacement`：差し替え先のパス
- 両者とも原稿ディレクトリ（`entryContextDir`、既定は `.`）を起点に解決されます

## 検証

生成PDFのインクカバレッジを確認するには、Ghostscriptの `inkcov` デバイスを使います:

```sh
gs -o - -sDEVICE=inkcov mybook.pdf
```

ページごとのインクカバレッジが4つの数値（C M Y K）として `0..1` の範囲で出力されます。K以外の値が出ているページには意図しないインクが乗っています。

## 参照

- W3C [CSS Color 5 — `device-cmyk()`](https://drafts.csswg.org/css-color-5/#device-cmyk)
- CLI例：[`vivliostyle-cli/examples/cmyk/`](https://github.com/vivliostyle/vivliostyle-cli/tree/main/examples/cmyk)
