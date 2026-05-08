#!/usr/bin/env python3
"""
NotoSansJP-Symbols.woff2 / NotoSansJP-Symbols-Bold.woff2 を再生成する。

使い方:
    python3 scripts/regenerate-symbol-fonts.py

カバーする文字は packages/theme-PDF/fonts/.symbol-chars.txt の 1 行目を読む。
新しい記号でトーフが出たらこのファイルに 1 文字足してこのスクリプトを再実行
すれば良い。

依存:
    fontTools, brotli (pip install fonttools brotli)

仕組み:
    Google Fonts の `text=` API で必要な文字だけを含む極小の Noto Sans JP
    woff2 を取得し、PDF テーマで使えるように 3 段階の後処理を加える:

      1) variable font の場合は `wght` 軸を 400 / 700 で固定して static 化
         （Chrome の PDF 出力は variable font を Type 3 で埋め込む）
      2) name table を 'NotoSansJP PDF Symbols' / 'NotoSansJPPDFSymbols-*' に
         書き換え（ユーザの local "Noto Sans JP Thin" 等と内部名衝突して
         Adobe Reader が誤って local font を呼び出すのを防ぐ）
      3) OS/2 usWeightClass を @font-face の宣言値（400 / 700）に揃える
         （variable→static にした側は元値が 100 のまま残るので明示的に直す）

詳細は packages/theme-PDF/fonts/README.md を参照。
"""

from __future__ import annotations

import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
except ImportError:
    sys.stderr.write(
        "fontTools が見つからない。pip install fonttools brotli\n"
    )
    sys.exit(1)


REPO_ROOT = Path(__file__).resolve().parent.parent
FONTS_DIR = REPO_ROOT / "packages" / "theme-PDF" / "fonts"
CHARS_FILE = FONTS_DIR / ".symbol-chars.txt"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

WEIGHTS = [
    # (font-weight, output filename, target subfamily)
    (400, "NotoSansJP-Symbols.woff2", "Regular"),
    (700, "NotoSansJP-Symbols-Bold.woff2", "Bold"),
]

FAMILY_NAME = "NotoSansJP PDF Symbols"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as resp:
        return resp.read()


def fetch_kit_url(chars: str, weight: int) -> str:
    """Google Fonts text= API を叩き、返ってきた CSS から kit URL を取り出す。"""
    encoded = urllib.parse.quote(chars)
    css_url = (
        f"https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@{weight}"
        f"&text={encoded}"
    )
    css = fetch(css_url).decode("utf-8")
    m = re.search(r"src:\s*url\((https://fonts\.gstatic\.com/[^)]+)\)", css)
    if not m:
        raise RuntimeError(f"kit URL を CSS から取得できなかった:\n{css}")
    return m.group(1)


def post_process(
    raw: bytes,
    output_path: Path,
    weight: int,
    family: str,
    subfamily: str,
    ps_name: str,
) -> None:
    """woff2 バイト列を受け取り、3 段階の後処理を施して保存する。"""
    output_path.write_bytes(raw)

    f = TTFont(str(output_path))

    # 1) variable font なら weight 軸を固定して static 化
    if "fvar" in f:
        f = instantiateVariableFont(f, {"wght": weight})

    # 2) name table を unique 名に書き換え
    full_name = f"{family} {subfamily}"
    name_pairs = {
        1: family,
        2: subfamily,
        4: full_name,
        6: ps_name,
        16: family,
        17: subfamily,
    }
    nt = f["name"]
    for name_id, value in name_pairs.items():
        # Windows Unicode BMP, en-US
        nt.setName(value, name_id, 3, 1, 0x409)
        # Macintosh Roman English
        nt.setName(value, name_id, 1, 0, 0)

    # 3) OS/2 usWeightClass を宣言値に合わせる
    f["OS/2"].usWeightClass = weight

    f.save(str(output_path))


def main() -> int:
    if not CHARS_FILE.exists():
        sys.stderr.write(f"{CHARS_FILE} が無い\n")
        return 1
    chars = CHARS_FILE.read_text(encoding="utf-8").splitlines()[0].strip()
    if not chars:
        sys.stderr.write(f"{CHARS_FILE} の 1 行目が空\n")
        return 1

    print(f"対象文字 ({len(chars)} 文字): {chars}")

    for weight, filename, subfamily in WEIGHTS:
        out = FONTS_DIR / filename
        ps_name = f"NotoSansJPPDFSymbols-{subfamily}"
        print(f"\n[wght={weight}] {filename}")
        kit = fetch_kit_url(chars, weight)
        print(f"  kit: {kit[:100]}...")
        raw = fetch(kit)
        print(f"  downloaded {len(raw)} bytes")
        post_process(raw, out, weight, FAMILY_NAME, subfamily, ps_name)
        size = out.stat().st_size
        print(f"  saved → {out.relative_to(REPO_ROOT)} ({size} bytes)")

        # 簡易検証: 必要文字を全部含んでいるか
        f = TTFont(str(out))
        cmap = set(c for table in f["cmap"].tables for c in table.cmap.keys())
        missing = [c for c in chars if ord(c) not in cmap]
        if missing:
            sys.stderr.write(
                f"  警告: cmap に欠落: {missing}\n"
            )
        else:
            print(f"  cmap OK ({len(cmap)} glyph)")

    print("\n完了。次に `npm run build:formats` でビルド検証してください。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
