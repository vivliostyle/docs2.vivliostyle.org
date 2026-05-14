---
title: 活用ガイド
description: Vivliostyleの最近の追加機能を機能別・実践的に解説するガイド集
lang: ja
order: 1
---

# 活用ガイド

Vivliostyleの最近の追加機能について、プロダクト別ではなく機能別に、仕様レベルの記述ではなく**「何ができるか」「どう使うか」**に焦点を当てた実践的なガイドをまとめています。

各ガイドには対応バージョンが冒頭に明記されているため、自分の環境で記事の内容が利用できるか一目で判断できます。

## ガイド一覧

- **[脚注（フットノート）](./footnotes/)** — DPUB-ARIA脚注サポート、標準`@page { @footnote { } }`ルール、`footnote-display`、VFMの新しい`footnote`モード（`pandoc` / `gcpm` / `dpub`）。
  - 対象バージョン: Vivliostyle.js v2.42+ / CLI v10.6+

- **[CMYK変換](./cmyk/)** — CSSの`device-cmyk()`関数と、CLIのPDF CMYK出力（`pdfPostprocess.cmyk`）。
  - 対象バージョン: Vivliostyle.js v2.40+ / CLI v10.6+

- **[ページグループ](./page-groups/)** — 名前付きページ、`:nth(An+B of C)`ページセレクタによる章ごとのレイアウト。
  - 対象バージョン: Vivliostyle.js v2.39+

- **[VFM 拡張機能](./vfm-extensions/)** — `captionlessImagePolicy`、`editPlugins` フック、valibot プラグインオプションスキーマ。
  - 対象バージョン: `@vivliostyle/vfm` v2.7+

- **[レスポンシブ画像と CSS Nesting](./responsive-and-nesting/)** — CSS Nesting と `<picture>` / `<source media>` で 1 原稿から複数出力を作る。
  - 対象バージョン: Vivliostyle.js v2.42+（CSS Nesting）／v2.42+（`<picture>`）

## このセクションについて

ここで扱う機能は、Vivliostyleの複数のプロダクト（コアCSS、CLI、VFM、テーマ）にまたがることが多く、プロダクト別セクションには収まりにくいものです。「活用ガイド」では、プロダクト軸ではなく**機能軸**で整理しています。

仕様レベルのリファレンスは[サポートするCSS機能](/ja/reference/supported-css-features/)と[Core APIリファレンス](/ja/reference/api/)を参照してください。
