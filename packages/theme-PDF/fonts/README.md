# theme-PDF/fonts

Vivliostyle CLI が PDF / EPUB を生成する際に同梱して埋め込むフォント。

| ファイル | 用途 | 出所 | ライセンス |
|---|---|---|---|
| `NotoSansJP-Regular.woff2` | 本文の日本語（regular） | fontsource `@fontsource/noto-sans-jp@5` の `noto-sans-jp-japanese-400-normal.woff2` | SIL OFL 1.1（`LICENSE.txt`） |
| `NotoSansJP-Bold.woff2` | 本文の日本語（bold） | 同上 `noto-sans-jp-japanese-700-normal.woff2` | SIL OFL 1.1 |
| `NotoSansJP-Symbols.woff2` | 丸付き数字 ❶❿、▶、◉ などのシンボル（regular） | Google Fonts `text=` API | SIL OFL 1.1 |
| `NotoSansJP-Symbols-Bold.woff2` | 同上（bold） | Google Fonts `text=` API | SIL OFL 1.1 |
| `Twemoji.Mozilla.ttf` | 絵文字（🔵🙅✅⚠️ など） | [mozilla/twemoji-colr v0.7.0](https://github.com/mozilla/twemoji-colr/releases/tag/v0.7.0) | Apache-2.0 + CC-BY 4.0（`LICENSE-Twemoji.md`） |

`theme.css` 内の `@font-face` 宣言と `body { font-family }` がこれらに対応している。

## なぜ Symbols 用に別ファイルが必要なのか

fontsource の `noto-sans-jp` の `japanese` subset は約 6900 字で、常用漢字・人名用漢字・JIS X 0208 などを概ね網羅するが、**Dingbats（U+2776–277F = ❶❿）と Geometric Shapes（U+25B6 = ▶, U+25C9 = ◉）は含まれない**。これらが本文に出るとローカルの Hiragino にフォールバックして Type 3 として PDF に埋め込まれ、Adobe Reader でトーフ表示になる。

そこで Google Fonts の `text=` API を使い、必要な文字だけを含む極小 woff2（数 KB）を Noto Sans JP から切り出してバンドルしている。

## 文字を追加したいとき

1. `packages/theme-PDF/fonts/.symbol-chars.txt` の 1 行目に必要な文字を追加
2. 再生成:
   ```bash
   npm run regenerate:symbol-fonts
   ```
3. `npm run build:formats` で PDF / EPUB を再生成して目視確認
4. CI が Type 3 残存をチェックしているので、想定外のフォールバックが起きていれば deploy が止まる

## なぜ後処理が必要なのか（regenerate-symbol-fonts.py の中身）

Google Fonts `text=` API が返す woff2 をそのまま `@font-face` に流すと Chrome の PDF 出力で **依然として Type 3 化する**。原因は次の 3 つで、`scripts/regenerate-symbol-fonts.py` がそれぞれを修正している。

### (1) variable font の static 化

`text=` API は variable font（`fvar`/`gvar`/`HVAR`/`avar` テーブル付き、`wght` 軸 100–900）を返すことがある。Chrome の PDF 出力は variable font を CID TrueType で埋め込めず Type 3 にする。

**対処**: `fontTools.varLib.instancer.instantiateVariableFont(f, {"wght": 400})` で wght 軸を 400 に固定して static font に変換。bold 側は 700 で固定。

### (2) 内部フォント名の衝突回避

API が返す woff2 の内部 family 名は `Noto Sans JP Thin`、PostScript 名は `NotoSansJP-Thin` のまま（Google が thin マスターを基にサブセット化しているため）。ユーザの環境にローカル `Noto Sans JP Thin` がインストールされていると、Chrome が **embedded font よりも local font を優先**してしまい、結局 Type 3 化する（local が PostScript の場合）。

**対処**: `name` テーブルを以下の値に書き換え。

| nameID | 値 |
|---|---|
| 1 (Family) | `NotoSansJP PDF Symbols` |
| 2 (Subfamily) | `Regular` / `Bold` |
| 4 (Full name) | `NotoSansJP PDF Symbols Regular` / `Bold` |
| 6 (PostScript) | `NotoSansJPPDFSymbols-Regular` / `-Bold` |

これでシステム上の他のフォントと name 衝突しない。`theme.css` の `@font-face { font-family: 'NotoSansJP PDF Symbols' }` 宣言と一致。

### (3) OS/2 usWeightClass の不一致

variable font を 400 で固定した側は、内部の `OS/2.usWeightClass` が元の Thin マスター由来の `100` のまま残る。`@font-face { font-weight: 400 }` の宣言と食い違う状態は Chrome の PDF 出力で問題を起こす場合があり実害として確認済み。

**対処**: `f["OS/2"].usWeightClass = 400`（bold は 700）に明示的にセット。

## トラブルシュート

### `pip install fonttools brotli` が必要

スクリプトは `fontTools` と `brotli`（woff2 圧縮）に依存。

### 既存ビルドで Type 3 が残ったら

`pdffonts public/downloads/<file>.pdf | grep "Type 3"` で確認。`TwemojiMozilla` 以外が出ているなら、その文字が現在の subset に入っていない可能性が高い。`.symbol-chars.txt` に追加して再生成する。

### CI のチェック

`.github/workflows/deploy.yml` の `Check for unexpected Type 3 fonts` ステップで、`TwemojiMozilla` 以外の Type 3 が PDF に混じっていれば deploy が止まる。新しく Hiragino 系が混入した場合の早期検知用。
