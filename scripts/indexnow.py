#!/usr/bin/env python3
"""Tell Bing (and every other IndexNow engine) which boothledger.com pages changed.

IndexNow gets new or edited pages crawled in hours instead of whenever Bing
next visits. Bing's index also feeds ChatGPT search, DuckDuckGo and Yahoo.

  scripts/indexnow.py --all             every URL in sitemap.xml
  scripts/indexnow.py --changed REV     pages changed between REV and HEAD
  scripts/indexnow.py /pricing /blog/   specific paths or full URLs

The .git/hooks/post-commit hook runs `--changed HEAD~1` after every commit,
so normal page edits need nothing extra. Only pages listed in sitemap.xml
are sent, plus deleted pages (so engines drop them), which keeps drafts,
backups and test pages out.

The key is public by design: engines check it against /<KEY>.txt.
"""
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HOST = "boothledger.com"
KEY = "9799f27f64abf415f03919096ff5524c"
ENDPOINT = "https://api.indexnow.org/indexnow"
ROOT = Path(__file__).resolve().parent.parent


def sitemap_urls() -> list[str]:
    xml = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    return re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)


def file_to_url(path: str) -> str | None:
    """index.html -> /, blog/index.html -> /blog/, a/b.html -> /a/b (the clean URLs nginx serves)."""
    if not path.endswith(".html"):
        return None
    stem = path[: -len(".html")]
    if stem == "index":
        stem = ""
    elif stem.endswith("/index"):
        stem = stem[: -len("index")]
    return f"https://{HOST}/{stem}"


def changed_urls(rev: str) -> list[str]:
    out = subprocess.run(["git", "diff", "--name-status", "--no-renames", rev, "HEAD"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    listed = set(sitemap_urls())
    urls = []
    for line in out.splitlines():
        status, _, path = line.partition("\t")
        url = file_to_url(path)
        # listed pages, plus deleted ones so engines drop them
        if url and (url in listed or status == "D"):
            urls.append(url)
    return urls


def normalise(arg: str) -> str:
    return arg if arg.startswith("http") else f"https://{HOST}/{arg.lstrip('/')}"


def submit(urls: list[str]) -> int:
    urls = list(dict.fromkeys(urls))
    if not urls:
        print("indexnow: nothing to submit")
        return 0
    body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"https://{HOST}/{KEY}.txt",
                       "urlList": urls}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, method="POST",
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            status = r.status
    except urllib.error.HTTPError as e:
        status = e.code
    except urllib.error.URLError as e:
        print(f"indexnow: request failed: {e.reason}")
        return 1
    # 200 = accepted, 202 = accepted while the key is still being checked
    meaning = {200: "accepted", 202: "accepted (key check pending)", 400: "bad request",
               403: "key not valid (is /KEY.txt reachable?)", 422: "URLs don't match host",
               429: "too many requests"}.get(status, "unexpected")
    print(f"indexnow: {status} {meaning} for {len(urls)} URL(s): {' '.join(urls)}")
    return 0 if status in (200, 202) else 1


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if argv[0] == "--all":
        return submit(sitemap_urls())
    if argv[0] == "--changed":
        return submit(changed_urls(argv[1] if len(argv) > 1 else "HEAD~1"))
    return submit([normalise(a) for a in argv])


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
