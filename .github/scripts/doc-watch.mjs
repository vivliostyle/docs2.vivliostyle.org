// Vivliostyle doc watch
// docs2.vivliostyle.org のサブモジュールについて、いま固定しているコミットより新しいリリースが
// 上流に出ていないかを調べ、取り込みどきかどうかを Slack に1通で報告する。
// あわせて organization のリポジトリ増減（archived・fork を除く）を KNOWN_REPOS と比べて報告する。
//
// 判定のしかた
//   - サブモジュールの一覧は、このリポジトリの既定ブランチの .gitmodules から読む（増減に自動で追随する）。
//   - 固定しているコミットは、既定ブランチ上のサブモジュールのパスが指す SHA。
//   - 上流の GitHub Releases（下書きとプレリリースを除く）のうち、固定コミットより先にあるもの
//     （compare API の status が ahead か diverged）を「取り込み待ち」とする。
//   - Releases を1件も出していないリポジトリは、固定コミットより後に既定ブランチへ入ったコミット数を示す。
//
// 環境変数
//   GITHUB_TOKEN       API のレート制限緩和用（Actions の GITHUB_TOKEN で足りる）
//   SLACK_WEBHOOK_URL  Slack Incoming Webhook。未設定なら標準出力にだけ出して exit 1
//   TARGET_DATE        「新着」とみなす日 YYYY-MM-DD（JST）。空なら実行時点の前日
//   DRY_RUN            "1" なら Slack に送らず標準出力のみ

import { appendFileSync } from 'node:fs';

const ORG = 'vivliostyle';
const SELF = 'docs2.vivliostyle.org';

// Releases は新しい順に何件まで見るか。モノレポは1回のリリースで複数のタグを打つので多めにとる。
const RELEASES_TO_SCAN = 30;

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

async function request(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url.replace('https://api.github.com', '')}`);
  return res;
}

const api = async (path) => (await request(`https://api.github.com${path}`)).json();

// ページ送りつき（配列を返す API 用）
async function apiAll(path) {
  const out = [];
  let next = `https://api.github.com${path}`;
  while (next) {
    const res = await request(next);
    out.push(...(await res.json()));
    const link = res.headers.get('link') || '';
    next = (link.match(/<([^>]+)>;\s*rel="next"/) || [])[1];
  }
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const jstDay = (iso) => new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const short = (sha) => sha.slice(0, 7);

// 本体のタグか（v1.2.3 か、リポジトリ名と同じパッケージ名のもの。例: @vivliostyle/vfm@2.7.2）
const mainTag = (repo) => (tag) =>
  /^v\d/.test(tag) || tag.startsWith(`@${ORG}/${repo}@`) || tag.startsWith(`${repo}@`);

// .gitmodules から path と GitHub 上の owner/repo を取り出す
function parseGitmodules(text) {
  const mods = [];
  let cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('[submodule')) {
      cur = {};
      mods.push(cur);
    } else if (cur) {
      const m = line.match(/^(path|url)\s*=\s*(.+)$/);
      if (m) cur[m[1]] = m[2].trim();
    }
  }
  return mods
    .map((m) => {
      const gh = (m.url || '').match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?\/?$/);
      return gh ? { path: m.path, owner: gh[1], repo: gh[2] } : { path: m.path, url: m.url };
    })
    .filter((m) => m.path);
}

// base（固定コミット）から head（タグや SHA）を見たときの関係
async function compare(owner, repo, base, head) {
  const c = await api(`/repos/${owner}/${repo}/compare/${base}...${encodeURI(head)}`);
  return c;
}

async function checkSubmodule(mod, selfBranch, date) {
  const { owner, repo, path } = mod;
  const entry = await api(`/repos/${ORG}/${SELF}/contents/${encodeURI(path)}?ref=${selfBranch}`);
  if (entry.type !== 'submodule' || !entry.sha) throw new Error(`${path} がサブモジュールとして読めない`);
  const pin = entry.sha;
  const isMain = mainTag(repo);

  const releases = (await api(`/repos/${owner}/${repo}/releases?per_page=${RELEASES_TO_SCAN}`))
    .filter((r) => !r.draft && !r.prerelease)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  // Releases を出していないリポジトリ（awesome-vivliostyle など）
  if (!releases.length) {
    const info = await api(`/repos/${owner}/${repo}`);
    const c = await compare(owner, repo, pin, info.default_branch);
    return { mod, pin, kind: 'no-release', ahead: c.ahead_by, branch: info.default_branch, url: c.html_url };
  }

  const pending = [];
  let base = null; // 固定コミットに含まれている最新のリリース
  for (const r of releases) {
    const c = await compare(owner, repo, pin, r.tag_name);
    if (c.status === 'ahead' || c.status === 'diverged') {
      pending.push({ r, c });
      continue;
    }
    // identical か behind（＝そのリリースは固定コミットに含まれている）
    base = { r, same: c.status === 'identical' };
    break;
  }

  // モノレポは1回のリリースで複数パッケージのタグを打つ。表示には本体のタグを優先する。
  // 固定位置の表示は、見つかったリリースと同じ回（前後1時間）のものに限って置き換える。
  if (base && !isMain(base.r.tag_name)) {
    const t0 = new Date(base.r.published_at).getTime();
    const alt = releases.find(
      (r) => isMain(r.tag_name) && Math.abs(new Date(r.published_at).getTime() - t0) < 3600 * 1000,
    );
    if (alt) {
      const c = await compare(owner, repo, pin, alt.tag_name);
      if (c.status === 'identical' || c.status === 'behind') base = { r: alt, same: c.status === 'identical' };
    }
  }

  // 見出しにする取り込み待ち: 本体のタグのうち最新。本体のタグが無ければ最新のもの
  const head = pending.find((p) => isMain(p.r.tag_name)) || pending[0];
  let docsFiles = null;
  if (head) {
    // そこまでの差分で docs/ と doc/ の変更ファイル数を数える（compare API は300ファイルで打ち切る）
    docsFiles = (head.c.files || []).filter((f) => /^docs?\//.test(f.filename)).length;
  }
  return { mod, pin, kind: 'release', pending, head, isMain, base, docsFiles, date };
}

function formatResult(x) {
  const name = `${x.mod.owner}/${x.mod.repo}`;
  const lines = [];
  if (x.kind === 'no-release') {
    if (x.ahead) {
      lines.push(
        `*${esc(name)}*（Releases なし）固定 \`${short(x.pin)}\` より後に ${x.branch} へ ${x.ahead} コミット <${x.url}|差分>`,
      );
    }
    return { pending: x.ahead > 0, lines, summary: x.ahead ? `${x.mod.repo}（${x.ahead} コミット）` : null };
  }
  const where = x.base
    ? x.base.same
      ? `${esc(x.base.r.tag_name)} と同じ`
      : `${esc(x.base.r.tag_name)} より後の \`${short(x.pin)}\``
    : `\`${short(x.pin)}\`（直近 ${RELEASES_TO_SCAN} 件のリリースより前）`;
  if (!x.pending.length) return { pending: false, lines, summary: null, upToDate: `${x.mod.repo}: ${where}` };

  lines.push(`*${esc(name)}*　いまの固定: ${where}`);
  // 本体のタグがあればそれだけを並べ、ほかのパッケージのタグは件数だけ示す
  const shown = x.pending.some((p) => x.isMain(p.r.tag_name))
    ? x.pending.filter((p) => x.isMain(p.r.tag_name))
    : x.pending;
  for (const { r } of shown) {
    const fresh = jstDay(r.published_at) === x.date ? '【新着】' : '';
    lines.push(`• ${fresh}<${r.html_url}|${esc(r.tag_name)}>（${jstDay(r.published_at)} 公開）`);
  }
  const others = x.pending.length - shown.length;
  if (others) lines.push(`• ほかのパッケージのリリース ${others} 件`);
  const head = x.head;
  const docs = x.docsFiles === null ? '' : `、うち docs/ は ${x.docsFiles} ファイル`;
  lines.push(`  固定位置から ${esc(head.r.tag_name)} まで ${head.c.ahead_by} コミット${docs} <${head.c.html_url}|差分>`);
  return { pending: true, lines, summary: `${x.mod.repo} ${head.r.tag_name}` };
}

async function main() {
  const date = targetDate();

  const self = await api(`/repos/${ORG}/${SELF}`);
  const branch = self.default_branch;
  const gm = await api(`/repos/${ORG}/${SELF}/contents/.gitmodules?ref=${branch}`);
  const mods = parseGitmodules(Buffer.from(gm.content, 'base64').toString('utf8'));

  const blocks = [];
  const summaries = [];
  const upToDate = [];
  const failed = [];
  for (const mod of mods) {
    if (!mod.repo) {
      failed.push(`${mod.path}（GitHub 以外の URL: ${mod.url}）`);
      continue;
    }
    try {
      const f = formatResult(await checkSubmodule(mod, branch, date));
      if (f.pending) {
        blocks.push(f.lines);
        summaries.push(f.summary);
      } else if (f.upToDate) {
        upToDate.push(f.upToDate);
      } else {
        upToDate.push(`${mod.repo}: 固定位置が ${mod.repo} の最新`);
      }
    } catch (e) {
      failed.push(`${mod.repo}（${e.message}）`);
    }
  }

  let added = [];
  let removed = [];
  let orgError = null;
  try {
    const repos = await apiAll(`/orgs/${ORG}/repos?type=sources&per_page=100`);
    const current = repos.filter((r) => !r.archived).map((r) => r.name);
    added = current.filter((n) => !KNOWN_REPOS.includes(n));
    removed = KNOWN_REPOS.filter((n) => !current.includes(n));
  } catch (e) {
    orgError = e.message;
  }

  const lines = [];
  if (summaries.length) {
    lines.push(`*Vivliostyle doc watch* サブモジュールの取り込み待ち: ${esc(summaries.join('、'))}`);
    for (const b of blocks) lines.push('', ...b);
  } else if (failed.length === mods.length) {
    lines.push('*Vivliostyle doc watch* どのサブモジュールも確認できなかった');
  } else {
    lines.push('*Vivliostyle doc watch* 取り込み待ちのリリースなし');
  }
  if (upToDate.length) lines.push('', `最新のリリースまで取り込み済み: ${esc(upToDate.join('／'))}`);
  if (failed.length) lines.push('', `確認できなかった: ${esc(failed.join('、'))}`);
  if (orgError) lines.push('', `リポジトリ増減は確認できなかった（${esc(orgError)}）`);
  if (added.length) lines.push('', `リポジトリ追加: ${esc(added.join(', '))}`);
  if (removed.length) lines.push('', `リポジトリ削除またはアーカイブ: ${esc(removed.join(', '))}`);
  lines.push('', `（【新着】は ${date}（JST）に公開されたもの。プレリリースは対象外）`);

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
