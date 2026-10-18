// Vivliostyle doc watch
// 対象リポジトリで前日（JST の暦日）に公開されたリリースのうち、docs/（または doc/）の変更を
// 含むものがあれば Slack に1通で報告する。該当が無い日は何も送らない。
// 個々のコミットの通知は Slack の #github-notify に任せ、ここではリリースだけを見る。
//
// 「docs の変更を含む」とは、同じパッケージの1つ前のリリースからそのリリースまでの差分に、
// docs/ か doc/ の下のファイルが1つでもあること。
//
// 環境変数
//   GITHUB_TOKEN       API のレート制限緩和用（Actions の GITHUB_TOKEN で足りる）
//   SLACK_WEBHOOK_URL  Slack Incoming Webhook。送るものがあるのに未設定なら exit 1
//   TARGET_DATE        対象日 YYYY-MM-DD（JST）。空なら実行時点の前日
//   DRY_RUN            "1" なら Slack に送らず標準出力のみ

import { appendFileSync } from 'node:fs';

const ORG = 'vivliostyle';

// GitHub Releases を出していないリポジトリは、載せておいても何も報告されない。
const REPOS = [
  'vivliostyle.js',
  'vivliostyle-cli',
  'themes',
  'vfm',
  'vivliostyle.org',
  'vivliostyle.github.io',
  'docs2.vivliostyle.org',
];

const DOC_PATH = /^docs?\//;

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

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// タグ名から版番号を除いた部分（モノレポで同じパッケージの前のリリースを探すのに使う）
// 例: v2.45.2 → "v"、@vivliostyle/vfm@2.7.2 → "@vivliostyle/vfm@"
const pkgOf = (tag) => tag.replace(/\d+\.\d+\.\d+.*$/, '');

async function main() {
  const date = targetDate();
  const since = new Date(`${date}T00:00:00+09:00`);
  const until = new Date(since.getTime() + 24 * 3600 * 1000);

  const hits = [];
  const failed = [];

  for (const repo of REPOS) {
    try {
      // 新しい順。1日に出るリリースはこの件数に十分収まる
      const releases = (await api(`/repos/${ORG}/${repo}/releases?per_page=100`)).filter((r) => !r.draft);
      for (const [i, r] of releases.entries()) {
        const t = new Date(r.published_at);
        if (r.prerelease || t < since || t >= until) continue;
        const prev = releases.slice(i + 1).find((p) => !p.prerelease && pkgOf(p.tag_name) === pkgOf(r.tag_name));
        if (!prev) {
          hits.push({ repo, r, note: '前のリリースが見つからず docs の変更は未確認' });
          continue;
        }
        const c = await api(`/repos/${ORG}/${repo}/compare/${encodeURI(prev.tag_name)}...${encodeURI(r.tag_name)}`);
        const docs = (c.files || []).filter((f) => DOC_PATH.test(f.filename));
        if (docs.length) hits.push({ repo, r, prev, docs, url: c.html_url });
      }
    } catch (e) {
      failed.push(`${repo}（${e.message}）`);
    }
  }

  if (!hits.length && !failed.length) {
    console.log(`${date}（JST）: docs の変更を含むリリースなし。送信しない`);
    return;
  }

  const lines = [
    hits.length
      ? `*Vivliostyle doc watch* ${date}（JST）に公開された、docs の変更を含むリリース`
      : `*Vivliostyle doc watch* ${date}（JST）: 確認できたリポジトリには docs の変更を含むリリースなし`,
  ];
  for (const h of hits) {
    lines.push('', `*${esc(h.repo)}* <${h.r.html_url}|${esc(h.r.tag_name)}>`);
    if (h.note) {
      lines.push(`  ${h.note}`);
      continue;
    }
    const names = h.docs.slice(0, 10).map((f) => esc(f.filename));
    const more = h.docs.length > 10 ? ` ほか ${h.docs.length - 10} ファイル` : '';
    lines.push(`  ${esc(h.prev.tag_name)} からの docs の変更: ${names.join('、')}${more} <${h.url}|差分>`);
  }
  if (failed.length) lines.push('', `確認できなかった: ${esc(failed.join('、'))}`);

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
