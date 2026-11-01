#!/usr/bin/env python3
"""Slow second-pass website verification for URLs the fast pass marked dead.

The fast pass (GET, 10s) produced ~660 ReadTimeout verdicts that a spot check
proved unreliable (24/30 were alive via HEAD with a 25s timeout). This pass
re-verifies each dead URL with HEAD + 25s timeout and only confirms dead what
definitively fails. Writes audit/recheck_slow.json.

Run: python3 scripts/verify_dead_slow.py   (background; ~15 min for ~700 URLs)
"""
import json
import os
from concurrent.futures import ThreadPoolExecutor

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIT = os.path.join(BASE, "audit")


def check(url):
    import requests
    headers = {"User-Agent": "Mozilla/5.0 (huddleco data-QA; contact: ops@huddleco.work)"}
    try:
        resp = requests.head(url, headers=headers, timeout=25, allow_redirects=True)
        if resp.status_code == 405:  # HEAD not allowed; fall back to GET
            resp = requests.get(url, headers=headers, timeout=25,
                                allow_redirects=True, stream=True)
            resp.close()
        if resp.status_code < 400:
            return True, resp.url, resp.status_code
        return False, resp.url, resp.status_code
    except Exception as e:
        return False, url, type(e).__name__


def main():
    report = json.load(open(os.path.join(AUDIT, "recheck_report.json")))
    dead = report.get("dead", [])
    print("re-verifying %d dead URLs (HEAD, 25s timeout, 20 workers)..." % len(dead),
          flush=True)

    def work(d):
        ok, final, status = check(d["url"])
        return d, ok, final, status

    confirmed, revived = [], []
    with ThreadPoolExecutor(max_workers=20) as ex:
        for d, ok, final, status in ex.map(work, dead):
            d = dict(d)
            d["slow_status"] = str(status)
            if ok:
                revived.append(d)
            else:
                confirmed.append(d)

    out = {
        "fast_dead": len(dead),
        "slow_confirmed_dead": len(confirmed),
        "slow_revived": len(revived),
        "confirmed_dead": confirmed,
        "revived": revived,
    }
    with open(os.path.join(AUDIT, "recheck_slow.json"), "w") as f:
        json.dump(out, f, indent=1)
        f.write("\n")
    print("confirmed_dead=%d revived=%d" % (len(confirmed), len(revived)))


if __name__ == "__main__":
    main()
