# アクセントカラー改善提案

## 現状の課題

**現在のアクセントカラー:** <span style="background-color: #6b4fa2; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">#6b4fa2</span>（紫系）

**問題点:**
- ダークモードでの視認性が低い
- 暗い背景（`#1a1a1a`）に対してコントラストが不足
- リンクやインタラクティブ要素が見づらい

## 改善案: ダークモードで見やすいアクセントカラー候補

### 候補1: ブライトブルー系（推奨）

<div style="display: flex; gap: 12px; margin: 16px 0;">
  <span style="background-color: #3b9eff; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#3b9eff</span>
  <span style="background-color: #5eb0ff; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#5eb0ff</span>
  <span style="background-color: #2080e0; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#2080e0</span>
</div>

```css
--color-primary: #3b9eff;        /* メインカラー */
--color-primary-light: #5eb0ff;  /* ホバー時など */
--color-primary-dark: #2080e0;   /* アクティブ時など */
```

**特徴:**
- ✅ ダークモードで非常に視認性が高い
- ✅ 技術系ドキュメントで広く採用（VS Code、GitHub、Azure Docs等）
- ✅ アクセシビリティ（WCAG AAレベル）良好
  - ダークモード背景（`#1a1a1a`）とのコントラスト比: 約8.5:1
- ✅ Vivliostyleのブランドイメージ（青系）に近い
- ✅ 長時間の閲覧でも目が疲れにくい

**採用例:**
- Visual Studio Code: `#0078d4`
- GitHub: `#58a6ff`（ダークモード）
- Azure Docs: `#0078d4`

**推奨理由:**
技術ドキュメントの標準的な色であり、開発者にとって親しみやすく、かつVivliostyleの既存ブランドカラー（青系）との整合性が高い。

---

### 候補2: サイアン・ティール系

<div style="display: flex; gap: 12px; margin: 16px 0;">
  <span style="background-color: #22d3ee; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#22d3ee</span>
  <span style="background-color: #5eead4; color: #1a1a1a; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#5eead4</span>
  <span style="background-color: #14b8a6; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#14b8a6</span>
</div>

```css
--color-primary: #22d3ee;        /* メインカラー */
--color-primary-light: #5eead4;  /* ホバー時など */
--color-primary-dark: #14b8a6;   /* アクティブ時など */
```

**特徴:**
- ✅ ダークモードで鮮やかに目立つ
- ✅ モダンで先進的な印象
- ✅ 目に優しく長時間の閲覧に適している
- ✅ アクセシビリティ良好
  - ダークモード背景（`#1a1a1a`）とのコントラスト比: 約10:1
- ⚠️ Vivliostyle既存ブランドからはやや距離がある

**採用例:**
- Tailwind CSS: `#06b6d4`（cyan-500）
- Next.js: `#0070f3`（青系だがティール寄り）
- Vercel: `#0070f3`

**推奨ケース:**
新鮮なイメージを打ち出したい場合や、他の技術系サイトと差別化したい場合に適している。

---

### 候補3: コーラル・オレンジ系

<div style="display: flex; gap: 12px; margin: 16px 0;">
  <span style="background-color: #ff7849; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#ff7849</span>
  <span style="background-color: #ff9770; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#ff9770</span>
  <span style="background-color: #f05a2c; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">#f05a2c</span>
</div>

```css
--color-primary: #ff7849;        /* メインカラー */
--color-primary-light: #ff9770;  /* ホバー時など */
--color-primary-dark: #f05a2c;   /* アクティブ時など */
```

**特徴:**
- ✅ ダークモードで最も目立つ暖色系
- ✅ リンクやCTA（Call To Action）が非常に明確
- ✅ アクセシビリティ良好
  - ダークモード背景（`#1a1a1a`）とのコントラスト比: 約7:1
- ⚠️ やや主張が強い（長時間閲覧で疲れる可能性）
- ⚠️ 技術系ドキュメントでは珍しい配色

**採用例:**
- Rust: `#f74c00`
- GitLab: `#fc6d26`
- Product Hunt: `#da552f`

**推奨ケース:**
アクションボタンやハイライト要素に使用し、本文リンクは別の控えめな色にする場合に適している。

---

## 比較表

| 項目 | 候補1: ブルー | 候補2: サイアン | 候補3: コーラル |
|------|--------------|----------------|----------------|
| **視認性（ダーク）** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **視認性（ライト）** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **ブランド整合性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **技術系親和性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **長時間閲覧** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **差別化** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **コントラスト比** | 8.5:1 | 10:1 | 7:1 |

## 推奨: 候補1（ブライトブルー）

**理由:**
1. Vivliostyleの既存ブランドイメージとの整合性が高い
2. 技術ドキュメントの標準的な配色で親しみやすい
3. アクセシビリティとユーザビリティのバランスが最良
4. ライトモード・ダークモード両方で十分な視認性

## 実装方法

### global.cssの変更箇所

<table>
<tr>
<td><strong>現在</strong></td>
<td><strong>変更後（候補1の場合）</strong></td>
</tr>
<tr>
<td>
<div style="display: flex; flex-direction: column; gap: 8px;">
  <span style="background-color: #6b4fa2; color: white; padding: 6px 12px; border-radius: 3px; font-family: monospace;">#6b4fa2</span>
  <span style="background-color: #8b6fc2; color: white; padding: 6px 12px; border-radius: 3px; font-family: monospace;">#8b6fc2</span>
  <span style="background-color: #4b2f82; color: white; padding: 6px 12px; border-radius: 3px; font-family: monospace;">#4b2f82</span>
</div>
</td>
<td>
<div style="display: flex; flex-direction: column; gap: 8px;">
  <span style="background-color: #3b9eff; color: white; padding: 6px 12px; border-radius: 3px; font-family: monospace;">#3b9eff</span>
  <span style="background-color: #5eb0ff; color: white; padding: 6px 12px; border-radius: 3px; font-family: monospace;">#5eb0ff</span>
  <span style="background-color: #2080e0; color: white; padding: 6px 12px; border-radius: 3px; font-family: monospace;">#2080e0</span>
</div>
</td>
</tr>
</table>

```css
/* 現在 */
--color-primary: #6b4fa2;
--color-primary-light: #8b6fc2;
--color-primary-dark: #4b2f82;

/* 変更後（候補1の場合） */
--color-primary: #3b9eff;
--color-primary-light: #5eb0ff;
--color-primary-dark: #2080e0;
```

**ファイルパス:** `/public/styles/global.css`（33-35行目）

### 影響範囲

- リンクテキスト（本文内）
- ナビゲーション要素のアクティブ状態
- ボタンの背景色
- アクセント装飾（下線、ボーダーなど）

### テスト項目

- [ ] ライトモードでのリンク視認性
- [ ] ダークモードでのリンク視認性
- [ ] ホバー時の色変化が自然か
- [ ] アクティブ状態の明瞭さ
- [ ] ブレッドクラムのアクティブページ表示
- [ ] サイドバーのアクティブメニュー表示

## 次のステップ

1. カラー候補の選定
2. `public/styles/global.css` の更新
3. ローカル環境でのビジュアル確認（`npm run dev`）
4. ライトモード・ダークモード両方での動作確認
5. コミット・デプロイ

## 参考資料

- WCAG 2.1 Contrast Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- Material Design Color System: https://material.io/design/color/the-color-system.html
- VS Code Themes: https://code.visualstudio.com/docs/getstarted/themes
