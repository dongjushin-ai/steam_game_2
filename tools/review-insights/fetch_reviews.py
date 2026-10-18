# Steam 공개 리뷰 API로 방치형 게임 리뷰 수집 (긍정/부정 따로, 영어 + 한국어)
import json, sys, time, urllib.parse, urllib.request
OUT = sys.argv[1]
import os; os.makedirs(OUT, exist_ok=True)
GAMES = {1454400:"Cookie Clicker",1267910:"Melvor Idle",1147690:"NGU IDLE",1399720:"Antimatter Dimensions",610080:"Realm Grinder",363970:"Clicker Heroes",1468260:"Leaf Blower Revolution",1353300:"Idle Slayer",2763740:"Revolution Idle",2471100:"Unnamed Space Idle",1473350:"Gnorp Apologue",977400:"Cell to Singularity",3107330:"Nodebuster",627690:"Idle Champions",1593350:"Increlution",1690710:"Incremental Epic Hero 2",992070:"Idle Wizard",1097410:"Kittens Game"}
def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(url, timeout=30) as r: return json.load(r)
        except Exception as e:
            time.sleep(2 ** i)
    return {}
def fetch(app, rtype, lang, want):
    out, cursor = [], "*"
    while len(out) < want:
        q = urllib.parse.urlencode({"json":1,"filter":"all","language":lang,"review_type":rtype,"purchase_type":"all","num_per_page":100,"cursor":cursor})
        d = get(f"https://store.steampowered.com/appreviews/{app}?{q}")
        rs = d.get("reviews", [])
        if not rs: break
        for r in rs:
            out.append({"up": r["voted_up"], "pt": r["author"].get("playtime_at_review", 0), "t": r["review"], "lang": lang, "votes": r.get("votes_up", 0)})
        nc = d.get("cursor")
        if not nc or nc == cursor: break
        cursor = nc
        time.sleep(0.4)
    return out[:want]
summary = {}
for app, name in GAMES.items():
    s = get(f"https://store.steampowered.com/appreviews/{app}?json=1&language=all&num_per_page=0").get("query_summary", {})
    rows = fetch(app, "positive", "english", 300) + fetch(app, "negative", "english", 300) + fetch(app, "all", "koreana", 100)
    json.dump(rows, open(f"{OUT}/{app}.json", "w"))
    summary[app] = {"name": name, "score": s.get("review_score_desc"), "pos": s.get("total_positive"), "neg": s.get("total_negative"), "n": len(rows)}
    print(name, summary[app], flush=True)
json.dump(summary, open(f"{OUT}/summary.json", "w"), indent=1)
