// Vivliostyle doc watch
// 指定リポジトリの doc/docs ディレクトリに前日（JST の暦日）入ったコミットを集め、Slack に1通で報告する。
// あわせて organization のリポジトリ増減（archived・fork を除く）を KNOWN_REPOS と比べて報告する。
//
// 環境変数
//   GITHUB_TOKEN       API のレート制限緩和用（Actions の GITHUB_TOKEN で足りる）
//   SLACK_WEBHOOK_URL  Slack Incoming Webhook。未設定なら標準出力にだけ出して exit 1
//   TARGET_DATE        対象日 YYYY-MM-DD（JST）。空なら実行時点の前日
//   DRY_RUN            "1" なら Slack に送らず標準出力のみ

import { appendFileSync } from 'node:fs';

const ORG = 'vivliostyle';

// path: API の path フィルタ。null はリポジトリ全体。
// path フィルタは「そのパス配下のファイルを1つでも変更したコミット」を返すので、
// コードと一緒に docs も直したコミットも拾える。
const TARGETS = [
  { repo: 'vivliostyle.js', paths: ['docs'] },
  { repo: 'vivliostyle-cli', paths: ['docs'] },
  { repo: 'themes', paths: ['docs'] },
  { repo: 'vfm', paths: ['docs'] },
  { repo: 'vivliostyle.org', paths: ['docs'] },
  { repo: 'vivliostyle.github.io', paths: ['docs'] },
  { repo: 'docs2.vivliostyle.org', paths: [null] },
];

// 2026-09-27 時点の organization のリポジトリ（archived・fork を除く）。
// 増減を報告したあと、ここを更新すれば次回から報告されなくなる。
const KNOWN_REPOS = [
  'action',
  'awesome-vivliostyle',
  'community',
  'docs-vivliostyle-pub',
  'docs2.vivliostyle.org',
  'test2.vivliostyle.org',
  'themes',
  'typedocs',
  'vfm',
  'vivliostyle-cli',
  'vivliostyle-cli-helper-doc',
  'vivliostyle-marker-plugin-example',
  'vivliostyle-pdf',
  'vivliostyle-print',
  'vivliostyle-pub',
  'vivliostyle-sitegen',
  'vivliostyle.com',
  'vivliostyle.github.io',
  'vivliostyle.js',
  'vivliostyle.org',
  'vivliostyle.pub',
  'vivliostyle_doc',
  'wpt-results',
];

const token = process.env.GITHUB_TOKEN;
const webhook = process.env.SLACK_WEBHOOK_URL;
const dryRun = process.env.DRY_RUN === '1';

function targetDate() {
  const given = (process.env.TARGET_DATE || '').trim();
  if (given) {
    // 形式だけでなく、2026-02-30 のような実在しない日付も弾く（Date は黙って翌月に繰り越すため）
    const d = new Date(`${given}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(given) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== given) {
      throw new Error(`TARGET_DATE が不正: ${given}`);
    }
    return given;
  }
  const jstNow = new Date(Date.now() + 9 * 3600 * 1000);
  jstNow.setUTCDate(jstNow.getUTCDate() - 1);
  return jstNow.toISOString().slice(0, 10);
}

async function gh(url) {
  const out = [];
  let next = url;
  while (next) {
    const res = await fetch(next, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    out.push(...(await res.json()));
    const link = res.headers.get('link') || '';
    next = (link.match(/<([^>]+)>;\s*rel="next"/) || [])[1];
  }
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function main() {
  const date = targetDate();
  const since = new Date(`${date}T00:00:00+09:00`);
  const until = new Date(since.getTime() + 24 * 3600 * 1000);

  const updated = [];
  const failed = [];

  for (const { repo, paths } of TARGETS) {
    const bySha = new Map();
    try {
      for (const path of paths) {
        const q = new URLSearchParams({
          since: since.toISOString(),
          until: until.toISOString(),
          per_page: '100',
        });
        if (path) q.set('path', path);
        const commits = await gh(`https://api.github.com/repos/${ORG}/${repo}/commits?${q}`);
        for (const c of commits) {
          const t = new Date(c.commit.committer?.date || c.commit.author?.date);
          if (t >= since && t < until) bySha.set(c.sha, c);
        }
      }
    } catch (e) {
      failed.push(`${repo}（${e.message}）`);
      continue;
    }
    if (bySha.size) {
      const label = paths[0] ? `${repo}（${paths.join(', ')}/）` : `${repo}（リポジトリ全体）`;
      updated.push({ label, commits: [...bySha.values()] });
    }
  }

  let added = [];
  let removed = [];
  let orgError = null;
  try {
    const repos = await gh(`https://api.github.com/orgs/${ORG}/repos?type=sources&per_page=100`);
    const current = repos.filter((r) => !r.archived).map((r) => r.name);
    added = current.filter((n) => !KNOWN_REPOS.includes(n));
    removed = KNOWN_REPOS.filter((n) => !current.includes(n));
  } catch (e) {
    orgError = e.message;
  }

  const lines = [`*Vivliostyle doc watch* 対象: ${date}（JST）`];
  if (updated.length) {
    for (const u of updated) {
      lines.push('', `*${esc(u.label)}*`);
      for (const c of u.commits) {
        const msg = c.commit.message.split('\n')[0];
        lines.push(`• <${c.html_url}|${esc(msg)}>`);
      }
    }
  } else if (failed.length === TARGETS.length) {
    lines.push('どのリポジトリも確認できなかった');
  } else if (failed.length) {
    lines.push('確認できたリポジトリの監視対象には更新なし');
  } else {
    lines.push('監視対象（各リポジトリの docs/、docs2.vivliostyle.org 全体）に更新なし');
  }
  if (failed.length) lines.push('', `確認できなかった: ${esc(failed.join('、'))}`);
  if (orgError) lines.push('', `リポジトリ増減は確認できなかった（${esc(orgError)}）`);
  if (added.length) lines.push('', `リポジトリ追加: ${esc(added.join(', '))}`);
  if (removed.length) lines.push('', `リポジトリ削除またはアーカイブ: ${esc(removed.join(', '))}`);

  const text = lines.join('\n');
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');

  if (dryRun) return;
  if (!webhook) {
    console.error('SLACK_WEBHOOK_URL が未設定のため送信しなかった');
    process.exit(1);
  }
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, unfurl_links: false, unfurl_media: false }),
  });
  if (!res.ok) {
    console.error(`Slack 送信失敗: HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
