import json, re, sys, glob
D, theme_rx, up, n = sys.argv[1], sys.argv[2], sys.argv[3] == "1", int(sys.argv[4])
only = sys.argv[5] if len(sys.argv) > 5 else None
rx = re.compile(theme_rx, re.I); out = []
summ = json.load(open(f"{D}/summary.json"))
for f in glob.glob(f"{D}/*.json"):
    if f.endswith("summary.json"): continue
    app = f.split("/")[-1][:-5]; name = summ[app]["name"]
    if only and only not in name: continue
    for r in json.load(open(f)):
        if r["up"] != up or r["lang"] != "english": continue
        for s in re.split(r"(?<=[.!?])\s+|\n+", r["t"]):
            if rx.search(s) and 30 < len(s) < 260: out.append((r["votes"], name, int(r["pt"]/60), s.strip())); break
for v, name, h, s in sorted(out, reverse=True)[:n]: print(f"[{name} · {h}h · 👍{v}] {s}")
