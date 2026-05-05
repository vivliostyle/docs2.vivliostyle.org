---
title: 新機能ガイド
description: Vivliostyle の最近の新機能を機能別・実践的に解説するガイド集
lang: ja
order: 1
---

# 新機能ガイド

Vivliostyle の最近の新機能について、プロダクト別ではなく機能別に、仕様レベルの記述ではなく**「何ができるか」「どう使うか」**に焦点を当てた実践的なガイドをまとめています。

各ガイドには対応バージョンが冒頭に明記されているため、自分の環境で記事の内容が利用できるか一目で判断できます。

## ガイド一覧

- **[脚注（フットノート）](./footnotes/)** — DPUB-ARIA 脚注サポート、標準 `@page { @footnote { } }` ルール、`footnote-display`、VFM の新しい `footnote` モード（`pandoc` / `gcpm` / `dpub`）。
  - 対象バージョン: Vivliostyle.js v2.41.0+ / CLI v10.5.0+

- **[CMYK 変換](./cmyk/)** — CSS の `device-cmyk()` 関数と、CLI の PDF CMYK 出力（`pdfPostprocess.cmyk`）。
  - 対象バージョン: Vivliostyle.js v2.40.0+ / CLI v10.5.0+

- **[ページグループ](./page-groups/)** — 名前付きページ、`:nth(An+B of C)` ページセレクタによる章ごとのレイアウト。
  - 対象バージョン: Vivliostyle.js v2.39.0+

## このセクションについて

ここで扱う機能は、Vivliostyle の複数のプロダクト（コア CSS、CLI、VFM、テーマ）にまたがることが多く、プロダクト別セクションには収まりにくいものです。「新機能ガイド」では、プロダクト軸ではなく**機能軸**で整理しています。

仕様レベルのリファレンスは[サポートする CSS 機能](/ja/reference/supported-css-features/)と [Core API リファレンス](/ja/reference/api/)を参照してください。
