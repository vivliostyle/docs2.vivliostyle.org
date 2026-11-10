---
name: feedback-claude-like-writing
description: ユーザに「Claudeっぽい」と感じさせる時点で文章は失敗。技術的に正確でも違和感のある表現は避ける
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ba950285-9bae-4b7d-9b6a-2992e8b0aae0
---

ユーザがコンテンツを読んだときに「これは Claude が書いた表現だな」と感じさせた時点で、その文章は失敗。技術的な正確さよりも、自然で違和感のない日本語表現を優先する。

**Why**: ドキュメントは Vivliostyle プロジェクトのユーザ向けで、ユーザ自身の名義で公開される。「AI 翻訳っぽい」「不必要に詩的・技術的」な日本語があると、原稿の信頼性そのものが疑われる。具体例: `.footnote クラスを脚注として浮かせつつ` のような表現。「浮かせる」は CSS `float` の直訳として技術的には正しいが、日本語として違和感がある。`使用しつつ` のような自然な表現を選ぶ。

**How to apply**: 
- 動詞の選択で「直訳・直訳的な比喩」「いかにも辞書から拾った訳語」を避ける
- 「Xしつつ、Yができます」「Xすることで、Yを実現できます」のような構文を多用しない。自然な接続詞や文の切り方を使う
- 不安なときは、既存のサイト内記事のトーンを真似る（footnotes.md, page-groups.md 等のように、ユーザ自身が書いた記事を参照）
- 推敲時、自分が書いた段落を音読してみて「人間が書く文章として自然か」を自問する
- 訳語選びで判断がつかないときは、`[[feedback-japanese-terms]]` のとおり一般的な日本語訳を優先

関連: [[feedback-japanese-terms]]、[[feedback-user-signed-posts]]
