# EPUB 内部リンク破損の修正計画

## Context

`public/downloads/vivliostyle-cli-ja.epub` を Books（macOS）で開くと、本来 EPUB 内で完結するはずの内部リンクが、外部 URL（`https://docs.vivliostyle.org/.../themes-and-css.md#…`）として書き換えられてしまっている。さらにサイト CSS（`a[href^="http"]::after`）が、書き換え後の絶対 URL をリンク文字列の後ろに括弧書きで表示するため、本文中に「（…/.md#%E3%83…）」のような長大な URL が並ぶ見栄え崩壊も同時に発生している。

具体例（[submodules/vivliostyle-cli/docs/ja/using-config-file.md:35](submodules/vivliostyle-cli/docs/ja/using-config-file.md#L35)）：

| | href |
|---|---|
| MD ソース | `[ページサイズの指定](./themes-and-css.md#ページサイズの指定)` |
| EPUB 出力（バグ） | `https://docs.vivliostyle.org/ja/cli/using-config-file/themes-and-css.md#%E3%83%9A…` |
| 期待する EPUB 出力 | `./themes-and-css/#ページサイズの指定`（または `../themes-and-css/#…` 相当の同一 EPUB 内相対 XHTML リンク） |

修正の意図：単一プロダクトの EPUB に閉じる相対リンクは EPUB 内部リンクのまま残し、別プロダクト・外部だけが `https://docs.vivliostyle.org/...` や生 URL に展開されるようにする。

## リンク全貌（インベントリ）

`submodules/{vivliostyle-cli,vfm,themes,vivliostyle.js,awesome-vivliostyle}/docs/...` 以下の Markdown を走査して得た「ソース MD のリンク形」と、それぞれが EPUB でどう振る舞うべきか。

| # | ソース形 | 例 | EPUB 内ルート（プロダクト跨ぎ無し） | EPUB 出力（あるべき姿） | 現状 |
|---|---|---|---|---|---|
| A | 同一ページ内アンカー | `[X](#anchor)` | – | `#anchor` | OK（[vfm-loader.ts:388](src/loaders/vfm-loader.ts#L388) `rewriteFragmentLinks` で正規化済） |
| B | 同一ディレクトリの兄弟 .md | `[X](./foo.md)` | 同 EPUB 内 | `./foo/` | OK（[vfm-loader.ts:361](src/loaders/vfm-loader.ts#L361)） |
| **B'** | **同左 + フラグメント** | `[X](./foo.md#a)` | 同 EPUB 内 | `./foo/#a` | **BUG**（regex がフラグメント未対応 → fix-epub-paths が外部 URL に書き換え） |
| C | 親ディレクトリの .md（en） | `[X](../foo.md)` | 同 EPUB 内 | `../foo/` | OK（[vfm-loader.ts:382](src/loaders/vfm-loader.ts#L382)） |
| **C'** | **同左 + フラグメント（en）** | `[X](../foo.md#a)` | – | `../foo/#a` | **BUG**（同上） |
| D | 親ディレクトリ .md（ja） | `[X](../config.md)` | 同 EPUB 内 | `/ja/cli/config/` → fix-epub-paths が `../config/` に相対化（同 EPUB 内なら相対化、別なら外部 URL） | OK（[vfm-loader.ts:379](src/loaders/vfm-loader.ts#L379)） |
| **D'** | **同左 + フラグメント** | `[X](../config.md#a)` | – | 同上 + `#a` | **BUG**（同上） |
| E | クロスプロダクト（viewer↔reference） | `[X](./api.md)` (viewer 配下) | 別 EPUB | `https://docs.vivliostyle.org/{lang}/reference/api/`（外部に逃がす） | OK（[vfm-loader.ts:337-338](src/loaders/vfm-loader.ts#L337-L338)） |
| **E'** | **同左 + フラグメント** | `[X](./api.md#a)` | 別 EPUB | `https://docs.vivliostyle.org/{lang}/reference/api/#a` | **BUG**（同上） |
| F | クロスプロダクト（viewer 逆参照） | `[X](./vivliostyle-viewer.md)` (reference 配下) | 別 EPUB | `https://docs.vivliostyle.org/{lang}/viewer/vivliostyle-viewer/` | OK（[vfm-loader.ts:343](src/loaders/vfm-loader.ts#L343)） |
| **F'** | **同左 + フラグメント** | – | 別 EPUB | `…/#a` | **BUG**（同上） |
| G | themes-contributing 専用 | `[X](./docs/spec.md)` | 同 EPUB 内 | `/{lang}/themes/spec/` | OK（[vfm-loader.ts:318](src/loaders/vfm-loader.ts#L318)） |
| **G'** | **同左 + フラグメント** | `[X](./docs/spec.md#a)` | – | `…/#a` | **BUG**（同上） |
| H | 言語スイッチャー | `[X](./ja/index.md)` | – | （削除） | OK（[vfm-loader.ts:311](src/loaders/vfm-loader.ts#L311)） |
| I | 旧 viewer 拠点の絶対 URL（MD ソースに literal） | `[X](https://docs.vivliostyle.org/#/vivliostyle-viewer)` | 別サイト | 旧サイトのまま（暫定） | アップストリームへ要 PR、当面パススルー（**本計画外**） |
| J | 外部 URL（GitHub / MDN 等） | `[X](https://github.com/…)` | 外部 | そのまま | OK |
| K | 画像／アセット | `<img src="../assets/x.svg">` | 同 EPUB 内 | EPUB 内相対パス（fix-epub-paths が処理） | OK |

太字行が今回のバグ。**「`.md` の直後に `"` を要求」する 6 箇所の正規表現**がフラグメント付きリンクを取り逃しているのが共通原因。

### EPUB 内のリンク種別（再分類）

実 EPUB の中身を `unzip` で確認した結果、リンクは下記 4 種に大別され、本バグが影響するのは「本文 XHTML」のみであることが分かった：

| 種別 | 格納先 | 生成元 | 例 | 本バグの影響 |
|---|---|---|---|---|
| **論理ナビゲーション**（EPUB 3 nav） | `EPUB/index.xhtml`（`properties="nav"`） | Vivliostyle CLI が `vivliostyle.config-*.js` の **`toc: true` 設定**により、エントリ HTML の見出し（h1〜h6）から **ビルド時に自動生成** | `<a href="ja/cli/getting-started/index.xhtml">` | 影響なし（vfm-loader を通らない、`.md` も `#frag` も含まない） |
| **package document** | `EPUB/content.opf` | Vivliostyle CLI 自動生成 | `<item href="ja/cli/index.xhtml" .../>` | 影響なし |
| **本文埋め込み TOC**（`extractedToc`） | 一部 viewer/reference ページの本文中 | [vfm-loader.ts:208-281](src/loaders/vfm-loader.ts#L208-L281) で **MD ソースに既に文字列としてコミット済みの TOC**（後述 2 形式）を抽出し、別途 `stringify()` した HTML を `data.extractedToc` に格納、Astro 側で `set:html={extractedToc}` で挿入 | `<a href="index.xhtml#constantspageprogression">` 等 | **書き換えブロックを迂回しているが、現コンテンツの TOC はすべて `#anchor` のみで `.md` を含まないため実害なし**。将来コンテンツが `./X.md#a` を含むようになったら再発する潜在リスクあり |
| **本文 XHTML**（各章のページ本体） | `EPUB/{lang}/{product}/{slug}/index.xhtml` | vfm-loader が MD → HTML 変換し、書き換えブロックを通す | `<a href="../themes-and-css/#ページサイズの指定">` | **本バグが直撃**（regex が `.md#a` を取り逃す）|

### `extractedToc` 経路の現状確認

vfm-loader.ts:208-239 が抽出する **「ソース MD に文字列として既にコミットされている TOC」** には 2 形式ある：

| 形式 | 識別子 | 由来 |
|---|---|---|
| **doctoc 形式** | `<!-- START doctoc generated TOC -->` ... `<!-- END doctoc generated TOC -->` の HTML コメントマーカーで囲まれたブロック | doctoc ツールで自動生成された結果が upstream MD にコミットされている |
| **`## 目次` 形式** | `## 目次` または `## Table of Contents` 見出し直下の箇条書きリスト（doctoc マーカー無し） | upstream の文書執筆者が **人手で書いて維持している** |

両形式を含む MD を `submodules/{themes,vfm,vivliostyle.js}/docs/...` で全件洗い出した結果：

| ファイル | 形式 | TOC 内のリンク |
|---|---|---|
| `submodules/themes/docs/spec.md` | doctoc | `#spec-of-vivliostyle-theme` 等 **pure-fragment のみ** |
| `submodules/themes/docs/ja/spec.md` | doctoc | pure-fragment のみ |
| `submodules/themes/docs/ja/development.md` | doctoc | pure-fragment のみ |
| `submodules/vfm/docs/vfm.md` | doctoc | pure-fragment のみ |
| `submodules/vfm/docs/ja/vfm.md` | `## 目次` 形式 | pure-fragment のみ |
| `submodules/vivliostyle.js/docs/api.md` | `## Table of Contents` 形式 | pure-fragment のみ |
| `submodules/vivliostyle.js/docs/ja/api.md` | `## 目次` 形式 | pure-fragment のみ |

**したがって本計画の修正対象は「本文 XHTML 内の cross-page `.md#a` リンク」のみで十分**。`extractedToc` 経路（doctoc 形式・`## 目次` 形式とも）は今回触らず、grep ガード（後述）で将来の混入を検知する方針とする。

## 根本原因

[src/loaders/vfm-loader.ts](src/loaders/vfm-loader.ts) の以下 6 か所のいずれも `\.md"` という閉じ引用符を直前に要求しているため、`./X.md#anchor` 形式のリンクにマッチしない。

| # | 行 | 現在の regex |
|---|---|---|
| 1 | [318](src/loaders/vfm-loader.ts#L318) | `/href="\.\/docs\/([^"]+)\.md"/g` |
| 2 | [337-338](src/loaders/vfm-loader.ts#L337-L338) | `new RegExp(\`href="\\\\.\\\\/${f}\\\\.md"\`, 'g')` (loop) |
| 3 | [343](src/loaders/vfm-loader.ts#L343) | `/href="\.\/vivliostyle-viewer\.md"/g` |
| 4 | [361](src/loaders/vfm-loader.ts#L361) | `/href="\.\/([^"]+)\.md"/g` |
| 5 | [379](src/loaders/vfm-loader.ts#L379) | `/href="\.\.\/([^"]+)\.md"/g` |
| 6 | [382](src/loaders/vfm-loader.ts#L382) | `/href="\.\.\/([^"]+)\.md"/g` |

書き換えに失敗したフラグメント付きリンクは [scripts/fix-epub-paths.mjs:105-131](scripts/fix-epub-paths.mjs#L105-L131) の「EPUB 内に解決できない相対リンクは `SITE_ORIGIN` 配下の URL に書き換える」フォールバックに掴まり、`https://docs.vivliostyle.org/ja/cli/using-config-file/themes-and-css.md#…` のような壊れた外部 URL に化ける。

なお [scripts/fix-epub-paths.mjs:111-112](scripts/fix-epub-paths.mjs#L111-L112) は既に `existsSync(\`${resolved}/index.xhtml\`)` で「末尾 `/` 形式の内部リンク」を解決可能リンクと判定するロジックを持っているため、**vfm-loader 側で `.md → /` 変換さえ通せば fix-epub-paths は無修正で正しく動作する**。

## 修正方針（最小・確実）

### 1. 6 箇所の `.md` 正規表現をフラグメント対応にする

各マッチで `(#[^"]*)?` をオプショナルキャプチャとして加え、コールバック形式で書き換え後の文字列にそのまま流す。パスのキャプチャは `[^"#]+?`（`#` を含まない・lazy）にして「パス自体が `#` を含む」誤マッチを防ぐ。

例（[src/loaders/vfm-loader.ts:361](src/loaders/vfm-loader.ts#L361)）：

```ts
// before
html = html.replace(/href="\.\/([^"]+)\.md"/g, 'href="./$1/"');

// after
html = html.replace(
  /href="\.\/([^"#]+?)\.md(#[^"]*)?"/g,
  (_m, p: string, frag = '') => `href="./${p}/${frag}"`,
);
```

同様に行 318／337-338／343／379／382 を修正。とくに **2 (337-338) はループ中の文字列テンプレート `href="/${lang}/reference/${f}/"` のままだとフラグメントを取りこぼす**ので、コールバック形式に書き換え必須。

### 2. 修正対象ロジックを純粋関数に切り出す

`vfm-loader.ts` 内の link 書き換えブロック（行 296-388 のうち href 系）を `rewriteRelativeLinks(html, { lang, collectionName })` に切り出して export する。これにより Vitest からテスト可能になる。Astro のフルビルドを動かさずに回帰検出できる最小単位。

### 3. ユニットテストを追加（Vitest）

`src/loaders/vfm-loader.test.ts` を新設し、以下 8 ケース程度を網羅：

- B/B': `./foo.md` / `./foo.md#anchor`
- C/D': `../foo.md`（en） / `../foo.md#anchor`（ja）
- E': viewer→reference の `./api.md#anchor`
- F': reference→viewer の `./vivliostyle-viewer.md#anchor`
- G': themes-contributing の `./docs/spec.md#anchor`
- 純粋アンカー `#foo` が誤マッチしないこと
- パーセントエンコード済フラグメント（`#%E3%83%9A…`）も保持されること
- `[ ](./foo.md)` で fragment 無し時に `#` を付けないこと（`./foo/` のみ）

### 4. EPUB 用 CSS から外部リンクの URL 表示ルールを除外する

#### 何を直すか

[public/styles/global.css:555-671](public/styles/global.css#L555-L671) の `@media print { ... }` ブロック内 633 行に、以下のルールがある：

```css
@media print {
  ...
  .prose a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: var(--color-text-muted);
  }
  ...
}
```

媒体ごとの挙動：

| 媒体 | URL 表示 | 理由 |
|---|---|---|
| Web 画面 | **表示しない** | `@media print` の中なので画面表示時は発火しない |
| PDF | 表示する | PDF 生成時は print コンテキストなので発火（意図通り） |
| EPUB | **表示してしまう（バグ）** | EPUB リーダー（Books 等）が自身を print メディアと解釈するため、意図せず発火 |

PDF 印刷向けの「紙ではクリックできないので URL を本文に出す」という意図は妥当だが、クリック可能な EPUB では冗長で見栄えを損なう。

#### 方針：EPUB ビルド用に CSS を分岐する

採用する案は **(a) EPUB ビルド時にこのルールを打ち消す override CSS を追加読み込みさせる**。具体的な実装：

1. **EPUB 専用の override スタイルシート**を新設（例：`public/styles/epub.css`）。元のルールと同じセレクタ・同じメディアクエリ内に対する打ち消しを 1 つ：

   ```css
   @media print {
     .prose a[href^="http"]::after { content: none !important; }
   }
   ```

   元のルールが `@media print` 内・セレクタ `.prose a[href^="http"]::after` で出力していたので、同じコンテキストで `!important` 付きの打ち消しを行う。

2. 既存の `global.css` 側はそのまま（Web は元々 URL 表示無し・PDF はこれまで通り URL 表示）。

3. **EPUB ビルド時のみ** この override CSS を XHTML に注入する。注入方法は 2 案：

   - (i) `vivliostyle.config-*.js` の `theme` 配列に `./public/styles/epub.css` を追加（vivliostyle CLI が EPUB 出力時にも load してくれるかは要確認。ただし PDF 出力時にも同じ config を使っているので、PDF 側にもこの override が漏れて URL 表示が消える可能性がある）
   - (ii) [scripts/fix-epub-paths.mjs](scripts/fix-epub-paths.mjs) の post-process で **EPUB 化された XHTML に対してのみ** `<head>` に `<link rel="stylesheet" href="...epub.css">` を挿入する（EPUB だけに適用されることを確実にできる）

4. (i) は PDF 出力にも override が漏れて URL 表示が消えてしまうリスクがあるため、**第一選択は (ii)** とする。

#### なぜ本計画に取り込むか

- 主バグ修正（link 書き換え regex）と CSS 分岐は **「EPUB の見栄え崩壊を解消する」という同じユーザー体験目標** に向いており、別タスクに切るとリリース粒度が分散する
- 実装規模が小さい（CSS 1 行 + 注入 1 〜数行）
- 検証手順を本計画と一括で回せる（同じ EPUB を Books / Thorium で開いて確認）

#### 検証

- 本計画 §「検証手順」#5 の Books / Thorium 確認時に「外部リンクの後ろに URL が表示されないこと」を併せて確認
- PDF (`vivliostyle-cli-ja.pdf` 等) を開き、外部リンクの URL 表示が **従来通り残っている** ことも確認（PDF を壊していないことを保証）

### 5. ビルド時の防御線（grep ガード）

[scripts/fix-epub-paths.mjs](scripts/fix-epub-paths.mjs) のループ末尾に簡易チェックを足し、書き換え後の **EPUB 内全 XHTML**（`EPUB/index.xhtml` ナビ文書を含む `listXhtmlFiles(contentBase)` の全対象）に対して以下の 2 パターンが残っていたら **process.exit(1) で失敗させる**：

1. `https?://docs\.vivliostyle\.org/[^"]*\.md` — 今回のバグそのもの。本文 XHTML を主に守る。
2. `href="[^"]*\.md(#|")` — 拡大版。`extractedToc` 経路を含むあらゆる経路で `.md` 拡張子付きリンクが残った場合に検知する。将来 doctoc 形式・`## 目次` 形式の TOC に cross-page `.md#a` リンクが混入した場合の再発も拾える。

論理ナビゲーション（`index.xhtml`）は現状 `.xhtml` パスのみで構成されるため #2 は通るが、将来 vivliostyle CLI 側の挙動変化があった場合の保険になる。コストは XHTML 1 ファイルあたり 2 grep。

## 影響範囲・互換性

- vfm-loader を通る全プロダクト・全言語の EPUB（5 プロダクト × 2 言語 = 10 EPUB）に作用するが、**変更は「正規表現の対象範囲を広げてフラグメントを保持する」だけ**。フラグメントを持たない既存リンクの挙動は変わらない（既存 regex がマッチしていたケースは新 regex でも同一結果）。
- Web ビルド（Astro `dist/`）も同じ書き換えを通すため、Web 側でフラグメント付きリンクの挙動も改善する副次効果あり（負の副作用は見当たらない）。
- PDF 出力は内部的に WebPub と同じ XHTML を使うため、PDF 側のリンク挙動も同様に改善する。

## 検証手順（ローカル）

1. `npm run build` で Astro Web ビルド。`dist/ja/cli/using-config-file/index.html` を grep し、`href=".\/themes-and-css\/#`（末尾スラッシュ + アンカー）になっていることを確認。
2. `npm run build:formats` で PDF + EPUB 一括ビルド。
3. **全 EPUB の全 XHTML を一括検査**（論理ナビ `EPUB/index.xhtml` も含む）：
   ```sh
   for f in public/downloads/*.epub; do
     unzip -p "$f" '*.xhtml' | grep -nE 'href="[^"]*\.md(#|")' && { echo "FAIL: $f"; exit 1; }
   done
   echo "OK: no .md links remaining in any EPUB"
   ```
   `0` 件で通過すること。これで本文 XHTML・論理ナビ・`extractedToc` 経由の TOC をまとめて検証できる。
4. `unzip -p public/downloads/vivliostyle-cli-ja.epub EPUB/index.xhtml | head -20` で論理ナビが従来通り `.xhtml` パスで構成されていることを目視確認（既存の動作を壊していないこと）。
5. EPUB を Books / Thorium で開き、`vivliostyle-cli-ja.epub` の「構成ファイル」ページから「ページサイズの指定」「Vivliostyle Themes」リンクをクリックして `themes-and-css` ページの該当見出しに飛ぶこと（フラグメント遷移込み）を確認。論理目次（左サイドバーの章リスト）から各章へのナビゲーションも引き続き機能することを確認。
6. `npm test`（Vitest 追加後）が緑。

## クリティカルファイル

- [src/loaders/vfm-loader.ts](src/loaders/vfm-loader.ts) — 6 箇所の regex 修正・関数抽出
- [scripts/fix-epub-paths.mjs](scripts/fix-epub-paths.mjs) — grep ガード追加 + EPUB override CSS の `<link>` 注入（注入方式 (ii) を採用する場合）
- `src/loaders/vfm-loader.test.ts` — 新規（Vitest）
- `public/styles/epub.css` — 新規（EPUB 用 CSS override。`a[href^="http"]::after` を打ち消す 1 行）
- `vivliostyle.config-*.js`（10 ファイル）— 注入方式 (i) を採用する場合に `theme` 配列を更新
- `package.json` — `test` スクリプト・Vitest 依存追加（未導入なら）
- [submodules/vivliostyle-cli/docs/ja/using-config-file.md](submodules/vivliostyle-cli/docs/ja/using-config-file.md) — 回帰確認用フィクスチャ（コードは変更しない）

## 本計画外（別タスク）

今回の主目的は「本文 XHTML の cross-page `.md#anchor` リンクが外部 URL 化するバグを止める」こと。これと地続きだが、性格・優先度・修正範囲が違うため意図的に外した改善が 3 件ある。それぞれ「何が問題か／なぜ今やらないか／いつ・どう対処するか」を以下に詳述する。

---

### 1. アップストリーム MD ソースに literal で埋め込まれた旧サイト URL（**upstream に委任済**）

submodule 配下の MD（`submodules/vivliostyle-cli/docs/{,ja/}getting-started.md` および `themes-and-css.md` の計 4 件）に、旧 Jekyll サイト時代の `https://docs.vivliostyle.org/#/...` 形式 URL が literal で残っており、新サイトでは「クリックしてもホームページに着地し何も起きない」状態だった。

**対応状況**：[vivliostyle/vivliostyle-cli#789](https://github.com/vivliostyle/vivliostyle-cli/pull/789) として upstream に PR 提出済み（4 件すべての URL 置換）。**以後は upstream のレビュー・マージ判断に委ねる**。本リポジトリ側で暫定処置（vfm-loader.ts 内の `.replace` で吸収）は行わない。

PR がマージされれば、本リポジトリで `git submodule update --remote` を実行した時点で自動的に最新内容が取り込まれる。

---

### 2. vfm-loader の HTML 書き換えを parse5/cheerio 等の構造化処理に置き換え

#### 何が気になるか

今回のバグは突き詰めると **「正規表現で HTML を書き換える素朴さ」** に起因する。`/href="\.\/([^"]+)\.md"/g` はぱっと見正しく見えるが、`#anchor` が後ろに続くと閉じ引用符が合わず空振りする──というような落とし穴は regex ベースだといくらでも増殖する。HTML を AST レベルで扱う parse5 や cheerio を使えば、`<a>` 要素を一意に取り出して `href` 属性を確実に書き換えられる。

#### なぜ本計画で置き換えないか

- **ROI が小さい**：vfm-loader の書き換えは 6 箇所だが、それぞれ条件（`lang === 'ja'`／`collectionName.startsWith('vivliostyle-viewer-')`／themes-contributing 専用、など）が違う。AST に変えても、その条件分岐そのものは消えない。「regex を `if` 文＋ AST 操作に書き直す」だけになり、行数は減らない
- **挙動の互換性検証が大変**：6 箇所の regex 置換は副作用が局所的なので、一括テストしやすい。AST 方式は HTML パース→修正→シリアライズの過程で空白・属性順・自己終了タグ等が微妙に変わる場合がある。Astro で生成した既存ページに差分が出ない保証を取るのにそれなりの労力がかかる
- **本バグの再発防止は grep ガードで足りる**：本計画 §4 で導入する build-time の grep（`href=".*\.md(#|")` を許さない）が CI で常時走る限り、新しい regex 漏れが起きても出荷前に止まる

#### いつ着手すべきか

次にこの種のバグが再発したとき、または regex の数が「これ以上増やすと管理しきれない」と感じたとき。今回の修正後でも regex 数は変わらない（フラグメント対応にしただけ）ので、まだ閾値ではない。

---

### 3. `extractedTocHtml` 経路の link 書き換え対応

#### 状況の再掲

vfm-loader.ts には Markdown→HTML 変換が **2 経路** ある：

| 経路 | 対象 | link 書き換え（行 296-388）を通すか |
|---|---|---|
| 本文（`html`） | 各ページ本文の MD 全体 | **通す**（今回 fix する） |
| 抽出 TOC（`extractedTocHtml`） | ソース MD にコミット済の TOC ブロック（doctoc 形式 / `## 目次` 形式の 2 種、§「extractedToc 経路の現状確認」参照） | **通さない**（[273-281 行目](src/loaders/vfm-loader.ts#L273-L281)で別途 `stringify()` するだけ） |

つまり「TOC の中身は link 書き換えを経由しない」ので、もし TOC 内に `[X](./foo.md#a)` のような cross-page 相対 .md リンクがあれば、本文と同じバグが TOC でも発生する。

#### 今回の調査で確認したこと

doctoc 形式・`## 目次` 形式の TOC を持つ MD 計 7 ファイルを全件 grep した結果（プラン §「extractedToc 経路の現状確認」参照）、**現状すべての TOC は pure-fragment（`#anchor`）のみ**で、`.md` を含むリンクは一つも入っていない。したがって今のコンテンツでは実害ゼロ。

#### なぜ今直さないか

- **実害が出ていない箇所に修正を入れると、修正の副作用で今動いている TOC 表示を壊すリスクだけが増える**（特に `set:html={extractedToc}` で挿入されるので、Astro 側のレンダラーとの相互作用も検証する必要がある）
- **将来の混入を grep ガードが拾う**：本計画 §4 の build-time check（`href=".*\.md(#|")` パターンの全 XHTML 走査）は extractedToc 経由で挿入された TOC リンクも当然対象に含むので、もし upstream の doctoc 結果や `## 目次` 形式 TOC に cross-page `.md` リンクが入った瞬間に `process.exit(1)` でビルドが止まる
- **検知後の対処コストが小さい**：grep ガードが発火したら、vfm-loader.ts の `extractedTocHtml = stringify(...)` の **直後**に、本計画 §2 で抽出する `rewriteRelativeLinks(extractedTocHtml, { lang, collectionName })` を 1 行加えるだけで対応できる。修正コストは数分

#### つまり

「現状は無害／検知の網は張ってある／網に掛かったら数行で直せる」という三点セットで、今は触らないほうが合理的。網に掛からなければ永久に触らずに済む可能性も高い。
