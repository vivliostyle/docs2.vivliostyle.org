---
title: VFM 拡張機能ガイド
description: VFM 2.7 で追加された captionlessImagePolicy・editPlugins フック・valibot プラグインオプションスキーマ
lang: ja
order: 5
---

# VFM 拡張機能ガイド

> **対象バージョン**: `@vivliostyle/vfm` v2.7+
> **公開日**: 2026-05-14
> **最終更新日**: 2026-05-14
>
> このガイドは VFM をライブラリとしてプログラムから呼び出す利用者（独自ビルダ、Astro / カスタムローダ、CI パイプライン作者）向けです。Vivliostyle CLI 経由で Markdown → PDF/EPUB を生成するだけの読者は、本ガイド冒頭の **「いつ使うのか」** だけ確認すれば十分です。

VFM 2.7 では、外部から VFM の挙動を細かく制御するための拡張ポイントが 3 つ追加されました。

| 機能                          | 解決する課題                                                                                      | 影響範囲                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| `captionlessImagePolicy`      | `alt` が空の画像段落を `<figure>` にすべきか `<p><img></p>` のままにすべきか、ユーザーが選べる    | 図版周りの CSS スタイリング |
| `editPlugins` フック          | VFM が内部で組み立てる unified プラグイン配列に、後付けでプラグインを挿入・差し替え・削除できる   | 上級者向けカスタマイズ      |
| valibot プラグインオプションスキーマ | VFM のオプションが [valibot](https://valibot.dev/) スキーマで公開され、再利用可能になった | 設定検証・型生成            |

## いつ使うのか

- 装飾画像（罫線・アイコン）を多用する書籍で **figure 化を抑制したい** → `captionlessImagePolicy: 'paragraph'`
- 「キャプション無しの図版」にも `<figure>` で番号付けしたい → `captionlessImagePolicy: 'figure-with-figcaption'`
- VFM のパイプラインに自作 rehype プラグインを差し込みたい → `editPlugins`
- vivliostyle-cli のように VFM の設定スキーマを再利用したい → `SerializablePluginOptionsSchema` などの export

---

## 1. `captionlessImagePolicy` — キャプションなし画像の扱い

### 課題

VFM では従来、Markdown で **画像 1 枚だけの段落** を書くと自動的に `<figure>` に変換され、`alt` テキストが `<figcaption>` として埋め込まれていました。たとえば、

```markdown
![クマのイラスト](./img/bear.png)
```

は

```html
<figure>
  <img src="./img/bear.png" alt="クマのイラスト" />
  <figcaption aria-hidden="true">クマのイラスト</figcaption>
</figure>
```

になります。ところが **`alt` を空にした装飾画像**:

```markdown
![](./img/divider.svg)
```

の場合、figure 化するかどうかはバージョンや設定によって揺れがあり、CSS で `figure { counter-increment: figure; ... }` のように図版番号を増やすときに、装飾画像までカウントしてしまう問題がありました。

### 新オプション

VFM 2.7 では `captionlessImagePolicy` が追加され、`alt` が空のケースを 3 通りから選べます。

| 値                              | 出力                                            | 用途                                                                                   |
| ------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| `'paragraph'` *(既定)*          | `<p><img></p>`                                  | 装飾画像はそのまま段落として扱う。**互換のための既定値**                               |
| `'figure'`                      | `<figure><img></figure>`                        | figure としてレイアウトしたいが `<figcaption>` は要らない                              |
| `'figure-with-figcaption'`      | `<figure><img><figcaption></figcaption></figure>` | `<figcaption>` を空のまま付け、CSS カウンタや `imgFigcaptionOrder` を一貫して効かせる |

### 使い方

`stringify` / `VFM` プロセッサに渡します:

```js
import { stringify } from '@vivliostyle/vfm';

const html = stringify(markdown, {
  partial: true,
  captionlessImagePolicy: 'figure-with-figcaption',
});
```

YAML フロントマターからも指定できます:

```yaml
---
vfm:
  captionlessImagePolicy: figure
---
```

### マイグレーション注意

- 2.6 以前から 2.7 に上げただけでは挙動は変わりません（既定値 `'paragraph'` は従来動作と等価）。
- **CSS 側で `figure` セレクタを使ってきた既存テーマ**は、`captionlessImagePolicy: 'figure'` に切り替えるときに装飾画像も巻き込まないよう、`figure:has(figcaption)` などで絞り込みを再点検してください。

---

## 2. `editPlugins` — unified プラグイン配列を後から編集する

### 課題

VFM の `replace` オプションは「特定パターンを HAST ノードに置き換える」用途には便利ですが、**プラグイン全体の順序を変えたい**、**自前の rehype プラグインを footnote 処理の直前に挟みたい** といったケースには手が届きません。

### 新フック

VFM 2.7 から、プロセッサ構築の直前に呼ばれる `editPlugins(plugins)` フックが追加されました。

```ts
type EditPlugins = (plugins: BuiltinPlugins) => EditedPlugins;
```

引数 `plugins` には VFM 内部で組み立てられた配列がブランド型で渡され、戻り値は `mdastPlugins` / `mdastToHastHandlers` / `hastPlugins` を含む `EditedPlugins` です。**返した内容がそのまま unified プロセッサに渡る** ため、自由に splice/filter/concat できます。

### 使い方

例: rehype-autolink-headings を `hastPlugins` の末尾に挿入

```js
import { VFM } from '@vivliostyle/vfm';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const processor = VFM({
  editPlugins(plugins) {
    return {
      ...plugins,
      hastPlugins: [
        ...plugins.hastPlugins,
        [rehypeAutolinkHeadings, { behavior: 'append' }],
      ],
    };
  },
});
```

例: 特定の組み込みプラグインを除外

```js
const processor = VFM({
  editPlugins(plugins) {
    return {
      ...plugins,
      mdastPlugins: plugins.mdastPlugins.filter(
        (p) => !Array.isArray(p) || p[0]?.name !== 'remarkAttr',
      ),
    };
  },
});
```

### 注意

- `editPlugins` は **VFM が組み立てた既定パイプラインを上書きする能力** を持ちます。`mdastToHastHandlers` 内のキー（例: `paragraph`, `footnoteReference`）を差し替えると、図版変換・脚注処理など VFM のコア機能が動かなくなる可能性があります。
- フックが戻すオブジェクトは `BuiltinPlugins` のブランド型から **緩い `EditedPlugins`** に広がります。これは「自由な編集」を許すための意図的な設計です。テストでパイプライン出力 HTML を必ず確認してください。

---

## 3. valibot プラグインオプションスキーマ

VFM 2.7.0 ではオプション検証が [valibot](https://valibot.dev/) に統一され、**スキーマと TypeScript 型の両方が公開**されました。

```ts
import {
  StringifyMarkdownOptionsSchema,
  FigureOptionsSchema,
  FootnoteOptionsSchema,
  ReplaceOptionsSchema,
  SerializablePluginOptionsSchema,
} from '@vivliostyle/vfm';
```

### 何ができるか

#### a. 設定ファイルの実行時バリデーション

ユーザーが書いた `vivliostyle.config.js` の VFM セクションを起動時に検証できます。

```js
import * as v from 'valibot';
import { StringifyMarkdownOptionsSchema } from '@vivliostyle/vfm';

const parsed = v.parse(StringifyMarkdownOptionsSchema, userOptions);
```

スキーマ違反は `valibot` の `ValiError` で詳細な経路付きで報告されます。

#### b. 独自プラグインで「設定ミスを起動時に止める」

```js
import * as v from 'valibot';

const MyPluginOptionsSchema = v.object({
  mode: v.picklist(['inline', 'block']),
  prefix: v.optional(v.string(), 'fn'),
});

export function myPlugin(rawOptions) {
  const options = v.parse(MyPluginOptionsSchema, rawOptions);
  // ...
}
```

#### c. 下流ツールが VFM のスキーマを再利用

Vivliostyle CLI v10.6 は自身の設定スキーマを VFM の `SerializablePluginOptionsSchema` から派生させており、CLI 側で VFM オプションのドキュメントや JSON Schema を自動生成しています。同じパターンを自作ツールでも採用できます。

### 設計メモ

- スキーマは **`v.intersect`** で組み合わさっており、`FigureOptionsSchema` などの**個別スキーマも別個に export** されています。サブ機能だけ取り出して再利用できます。
- 型は `v.InferInput<typeof ...Schema>` 経由で取得できますが、`StringifyMarkdownOptions` は安定した nominal interface としても export されているので、d.ts に `.pnpm/...` の絶対パスが漏れることはありません。

---

## 関連ガイド

- [脚注（フットノート）](../footnotes/) — VFM の `footnote` オプションも valibot スキーマで定義されています
- [CMYK 変換](../cmyk/)
- [ページグループ](../page-groups/)
- [レスポンシブ画像と CSS Nesting](../responsive-and-nesting/) — Vivliostyle.js 側の新機能

## 参考リンク

- [VFM リポジトリ](https://github.com/vivliostyle/vfm)
- [valibot 公式サイト](https://valibot.dev/)
