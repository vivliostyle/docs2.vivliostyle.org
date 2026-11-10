---
name: project_dependabot_lockfile_npm_mismatch
description: Dependabot 生成の package-lock.json が CI の npm 10 系で npm ci に失敗する件と、その直し方
metadata: 
  node_type: memory
  type: project
  originSessionId: 2375b27b-9c17-456b-9cde-9a031c70e926
  modified: 2026-09-17T08:57:57.511Z
---

Dependabot が生成する `package-lock.json` は、CI（deploy.yml の Node 22.12 系に同梱される
npm 10 系）で `npm ci` が `Missing: esbuild@0.28.2 from lock file` のように失敗することがある。
lockfile の中身が欠けているのではなく、Dependabot がより新しい npm で生成するため、
入れ子の配置が npm 10 系の期待と食い違う。`@dependabot recreate` では直らない。

**Why:** 2026-09-17、PR #73（dompurify 3.4.13 + @vivliostyle/cli 11.3.3）で発生。
手元の npm 12.0.2 では `npm ci` が通るため、ローカル検証だけでは再現しない。

**How to apply:** マージ前に必ず `npx -y npm@10.9.0 ci` を当てる。Dependabot の PR は
lockfile だけを触るので、ブランチの package.json と package-lock.json を作業外の
ディレクトリへ取り出して試せば、リポジトリを汚さずに CI の失敗を再現できる。

直し方は2通り。まず `@dependabot rebase` を試す。main の依存ツリー自体が原因のときは、
それを解消する PR を先にマージしてからリベースさせると残りも直る。それでも駄目なら
ブランチ上で `npx -y npm@10.9.0 install --package-lock-only` を実行し、package.json は
触らずに lockfile だけ差し替えて Dependabot のブランチへ push する。どちらの場合も
npm 10.9.0 と手元の npm の双方で `npm ci` が通ることを確認してからマージする。
コミットには [[feedback_change_approval]] の承認を得たうえで `Assisted-by:` を付ける。

**2026-09-17 の実例:** main の lockfile が esbuild を最上位（0.25.12）と astro 配下
（0.28.2）に二重に持っていたのが根本原因だった。この状態に Dependabot が小さな差分を
当てると npm 10 系が別の配置を導き、`npm ci` が拒否する。vite を 8.3.0 に上げる PR #77 が
最上位の esbuild を消して一本化したところ、残り3件はリベースだけで通るようになった。
手で作り直す前に、ツリーを整理する PR が他に出ていないか見ること。

関連: deploy.yml は `on: push: branches: ['**']` かつ `concurrency: group: "pages"` なので、
待機中の実行枠は1つしかない。Dependabot ブランチへの push が main のキュー待ちデプロイを
キャンセルするため、PR を連続マージするときは main の検証実行が消えていないか確認する。
消えていれば `gh workflow run "Deploy to GitHub Pages" --ref main` で再起動できる。
