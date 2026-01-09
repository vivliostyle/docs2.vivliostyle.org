# サブモジュール自動更新システム設計

## 概要

各プロダクトリポジトリの `docs/` フォルダに変更があった際、docs2.vivliostyle.org を自動的に更新・デプロイするGitHub Actionsワークフローの設計書。

## 目標

- 各プロダクト（CLI、VFM、Themes、Viewer）のドキュメント更新を自動的に反映
- 手動作業を最小化
- 常に最新のドキュメントを提供

## アーキテクチャ

### 方式A: Repository Dispatch（推奨）
各プロダクトリポジトリ → トリガー送信 → docs2.vivliostyle.org が更新

### 方式B: Scheduled（補助）
定期的に（毎日）サブモジュールをチェックして更新

## 実装計画

### 1. docs2.vivliostyle.org 側のワークフロー

#### ファイル: `.github/workflows/update-submodules.yml`

```yaml
name: Update Submodules

on:
  # 各プロダクトからのトリガー
  repository_dispatch:
    types: [docs-updated]
  
  # 定期実行（毎日午前3時JST）
  schedule:
    - cron: '0 18 * * *'  # UTC 18:00 = JST 03:00
  
  # 手動実行も可能
  workflow_dispatch:

jobs:
  update-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: true
          token: ${{ secrets.SUBMODULE_UPDATE_TOKEN }}
      
      - name: Update submodules
        run: |
          git submodule update --remote --merge
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
      
      - name: Check for changes
        id: changes
        run: |
          git diff --quiet submodules/ || echo "changed=true" >> $GITHUB_OUTPUT
      
      - name: Commit and push if changed
        if: steps.changes.outputs.changed == 'true'
        run: |
          git add submodules/
          git commit -m "chore: Update submodules to latest versions"
          git push
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to production
        # デプロイ先に応じて設定（Cloudflare Pages/Vercel/GitHub Pages等）
        run: npm run deploy
```

### 2. 各プロダクトリポジトリ側のワークフロー

#### 例: vivliostyle-cli の `.github/workflows/notify-docs-update.yml`

```yaml
name: Notify Docs Update

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
      - 'assets/**'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger docs2.vivliostyle.org update
        uses: peter-evans/repository-dispatch@v3
        with:
          token: ${{ secrets.DOCS_REPO_ACCESS_TOKEN }}
          repository: vivliostyle/docs2.vivliostyle.org
          event-type: docs-updated
          client-payload: |
            {
              "repository": "vivliostyle-cli",
              "ref": "${{ github.ref }}",
              "sha": "${{ github.sha }}"
            }
```

#### 対象リポジトリ

以下の4つのリポジトリに同様のワークフローを追加：

1. **vivliostyle/vivliostyle-cli**
   - パス: `docs/**`, `assets/**`
2. **vivliostyle/vfm**
   - パス: `docs/**`, `assets/**`
3. **vivliostyle/themes**
   - パス: `docs/**`, `assets/**`
4. **vivliostyle/vivliostyle.js**
   - パス: `docs/**`, `assets/**`

## 必要な設定

### 1. GitHub Personal Access Token (PAT)

#### docs2.vivliostyle.org に追加
- **Secret名**: `SUBMODULE_UPDATE_TOKEN`
- **権限**: `repo` (サブモジュール更新・プッシュ用)
- **用途**: サブモジュールの更新とコミット

#### 各プロダクトリポジトリに追加
- **Secret名**: `DOCS_REPO_ACCESS_TOKEN`
- **権限**: `repo` (repository_dispatch 送信用)
- **用途**: docs2.vivliostyle.org へのトリガー送信

### 2. サブモジュール設定

```bash
# vivliostyle.js を サブモジュールとして追加（Phase 3-3 完了後）
cd /Users/ogwata/dev/vivliostyle/docs2.vivliostyle.org
git submodule add https://github.com/vivliostyle/vivliostyle.js.git submodules/vivliostyle.js
git commit -m "chore: Add vivliostyle.js as submodule"
```

### 3. .gitmodules の設定

```ini
[submodule "submodules/vivliostyle-cli"]
    path = submodules/vivliostyle-cli
    url = https://github.com/vivliostyle/vivliostyle-cli.git
    branch = main

[submodule "submodules/vfm"]
    path = submodules/vfm
    url = https://github.com/vivliostyle/vfm.git
    branch = main

[submodule "submodules/themes"]
    path = submodules/themes
    url = https://github.com/vivliostyle/themes.git
    branch = main

[submodule "submodules/vivliostyle.js"]
    path = submodules/vivliostyle.js
    url = https://github.com/vivliostyle/vivliostyle.js.git
    branch = master
```

## デプロイ先別の設定

### Cloudflare Pages

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages publish dist --project-name=docs-vivliostyle
```

**必要なSecrets:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Vercel

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

**必要なSecrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### GitHub Pages

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

**必要なSecrets:**
- なし（`GITHUB_TOKEN` は自動提供）

## 実装ステップ

### Phase 1: 基本自動化（優先度: HIGH）

1. **docs2.vivliostyle.org に `update-submodules.yml` 追加**
   - 定期実行（Scheduled）を設定
   - 手動実行（workflow_dispatch）をテスト
   - サブモジュール更新ロジックの実装

2. **PAT の作成と設定**
   - docs2.vivliostyle.org に `SUBMODULE_UPDATE_TOKEN` を追加
   - 権限確認とテスト

3. **デプロイ設定の追加**
   - デプロイ先を決定（Cloudflare Pages/Vercel/GitHub Pages）
   - 必要なSecretsを設定

### Phase 2: トリガーベース（優先度: MEDIUM）

4. **各プロダクトリポジトリに `notify-docs-update.yml` 追加**
   - vivliostyle-cli
   - vfm
   - themes
   - vivliostyle.js

5. **PAT の配布**
   - 各リポジトリに `DOCS_REPO_ACCESS_TOKEN` を追加

6. **repository_dispatch のテスト**
   - ドキュメント変更 → トリガー → ビルド → デプロイの流れを確認

### Phase 3: 最適化（優先度: LOW）

7. **変更検知の最適化**
   - 特定ファイルのみを監視
   - 不要なビルドをスキップ

8. **ビルドキャッシュの活用**
   - npm キャッシュ
   - ビルド成果物のキャッシュ

9. **通知機能の追加**
   - Slack/Discord への通知
   - エラー時のアラート

## 動作フロー

### パターンA: repository_dispatch（リアルタイム更新）

```
1. プロダクトリポジトリの docs/ に変更
   ↓
2. GitHub Actions が変更を検知
   ↓
3. docs2.vivliostyle.org へ repository_dispatch 送信
   ↓
4. docs2.vivliostyle.org が受信
   ↓
5. サブモジュールを更新
   ↓
6. ビルド実行
   ↓
7. 本番環境にデプロイ
```

### パターンB: Scheduled（定期更新）

```
1. 毎日午前3時（JST）に実行
   ↓
2. 全サブモジュールを最新版に更新
   ↓
3. 変更があればコミット
   ↓
4. ビルド実行
   ↓
5. 本番環境にデプロイ
```

## メリット・デメリット

### メリット

- ✅ ドキュメント更新が自動化される
- ✅ 手動作業が不要になる
- ✅ 常に最新の状態を維持できる
- ✅ ヒューマンエラーを削減
- ✅ 複数リポジトリの変更を一元管理

### デメリット

- ⚠️ PAT（Personal Access Token）の管理が必要
- ⚠️ デプロイコストの増加（ビルド回数が増える）
- ⚠️ 予期しない変更の自動反映リスク
- ⚠️ GitHub Actions の利用制限（無料枠）
- ⚠️ トラブル時のデバッグが複雑

## リスク管理

### リスク1: 破壊的変更の自動反映

**対策:**
- main ブランチへのマージ時のみトリガー
- Pull Request でのプレビュー機能
- ロールバック手順の整備

### リスク2: PAT の漏洩

**対策:**
- 最小権限の原則（必要な権限のみ）
- 定期的なトークンのローテーション
- GitHub Secrets の適切な管理

### リスク3: ビルド失敗

**対策:**
- エラー通知の設定
- 手動実行オプションの提供
- ビルドログの保存

## コスト見積もり

### GitHub Actions の無料枠
- Public リポジトリ: 無制限
- Private リポジトリ: 月 2,000分

### 予想される使用量
- repository_dispatch: 1日あたり 0-10回（ドキュメント更新頻度による）
- Scheduled: 1日あたり 1回
- 1回のビルド時間: 約 3-5分

**月間予想:**
- 最大: (10 + 1) × 5分 × 30日 = 1,650分
- 平均: (3 + 1) × 4分 × 30日 = 480分

→ Public リポジトリのため、コストは発生しない

## 推奨事項

1. **段階的な導入**
   - まずは定期実行（Scheduled）から開始
   - 動作確認後、repository_dispatch を追加

2. **監視体制の整備**
   - ビルド状況の定期確認
   - エラー時の通知設定

3. **ドキュメント化**
   - トラブルシューティングガイドの作成
   - 運用手順書の整備

4. **セキュリティ**
   - PAT の定期的な更新
   - 最小権限の維持

5. **テスト**
   - 本番適用前に十分なテスト
   - ロールバック手順の確認

## 次のアクション

### 優先度: HIGH
- [ ] docs2.vivliostyle.org に `.github/workflows/update-submodules.yml` 作成
- [ ] PAT の作成と設定
- [ ] デプロイ先の決定と設定
- [ ] 手動実行でのテスト

### 優先度: MEDIUM
- [ ] 各プロダクトリポジトリに `.github/workflows/notify-docs-update.yml` 追加
- [ ] repository_dispatch のテスト
- [ ] エラー通知の設定

### 優先度: LOW
- [ ] ビルドキャッシュの最適化
- [ ] 通知機能の追加（Slack/Discord）
- [ ] 運用ドキュメントの作成

## 参考リンク

- [GitHub Actions - Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [peter-evans/repository-dispatch](https://github.com/peter-evans/repository-dispatch)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

---

**作成日:** 2026年1月9日  
**バージョン:** 1.0  
**ステータス:** 計画段階
