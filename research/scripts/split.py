"""obscura scrape JSON 결과를 페이지별 markdown 파일로 나눈다."""
import json, re, sys

src, out = sys.argv[1], sys.argv[2]
data = json.load(open(src))
results = next(v for v in data.values() if isinstance(v, list))
bad = []
for r in results:
    url, text = r.get("url"), r.get("eval") or ""
    if not isinstance(text, str) or len(text) < 500:
        bad.append(url)
        continue
    key = url.split("/wiki/")[-1] if "/wiki/" in url else url.split("//")[1]
    name = re.sub(r"[^A-Za-z0-9_]+", "_", key)
    with open(f"{out}/{name}.md", "w") as f:
        f.write(f"Source: {url}\n{text}")
print(f"saved {len(results) - len(bad)}/{len(results)}; failed: {bad}")
