# 리뷰 주제 분석: 주제별로 긍정 리뷰·부정 리뷰에서 언급되는 비율과 그 차이(lift)
import json, re, sys, glob, collections
D = sys.argv[1]
THEMES = {
 "pacing_wall":   r"\b(slow|grind(y|ing)?|wall|stuck|takes forever|too long|pacing|tedious|boring after|waiting)\b",
 "time_gate":     r"\b(timer|time.?gate|wait (for )?(hours|days)|real.?time|energy)\b",
 "prestige":      r"\b(prestige|reset|ascen\w*|rebirth|reincarnat\w*|transcend\w*)\b",
 "offline_idle":  r"\b(offline|afk|idle while|in the background|leave it running|while (i|you) (sleep|work))\b",
 "active_click":  r"\b(click(ing|s)?|tap(ping)?|carpal|mouse|auto.?click\w*)\b",
 "automation":    r"\b(automat\w*|auto.?buy|autobuy\w*|qol|quality of life)\b",
 "depth_choice":  r"\b(strateg\w*|choices?|decisions?|build(s)?|synerg\w*|optimi[sz]\w*|depth|complex\w*|layers?|mechanics)\b",
 "new_systems":   r"\b(new (mechanic|layer|feature|system)s?|unlock\w*|keeps? (adding|introducing)|surpris\w*|evolv\w*)\b",
 "numbers_up":    r"\b(numbers? go(ing)? up|big numbers|satisf\w*|dopamine|addict\w*)\b",
 "content_end":   r"\b(endgame|end game|ran out|run out|no content|finished|beat (it|the game)|ending|completed?)\b",
 "monetization":  r"\b(microtransaction\w*|p2w|pay.?to.?win|dlc|cash grab|paywall|gems?|premium|ads?|whale\w*|money)\b",
 "ui_clarity":    r"\b(ui|interface|confus\w*|unclear|clutter\w*|menu\w*|explain\w*|tutorial|readab\w*|hard to understand)\b",
 "bugs_save":     r"\b(bugs?|buggy|crash\w*|lost (my )?(save|progress)|save (got )?(wiped|deleted|corrupt\w*)|cloud save)\b",
 "art_music":     r"\b(art|graphics|music|soundtrack|visuals?|pixel|animations?|cute|beautiful)\b",
 "humor_story":   r"\b(funny|humou?r|jokes?|story|lore|writing|charm\w*|references?)\b",
 "learning":      r"\b(learn\w*|educational|science|history|facts?|real.?world)\b",
 "relaxing":      r"\b(relax\w*|chill|cozy|calm|casual|background game)\b",
 "achievements":  r"\b(achievements?|collect\w*|100%|completionist)\b",
 "dev_updates":   r"\b(dev(eloper)?s?|updates?|abandon\w*|support\w*|roadmap)\b",
 "length_value":  r"\b(\d+\s*(hours|hrs)|worth (it|the price)|value|cheap|free)\b",
}
TK = {"pacing_wall":r"(느리|지루|노가다|벽|막히|오래 걸)", "prestige":r"(환생|초기화|프레스티지|전생)", "monetization":r"(과금|현질|광고|돈)", "ui_clarity":r"(복잡|불친절|설명|UI|헷갈)", "offline_idle":r"(방치|오프라인|켜두)", "content_end":r"(엔딩|컨텐츠|콘텐츠 부족|할 게 없)", "depth_choice":r"(전략|선택|빌드)", "numbers_up":r"(중독|숫자)", "bugs_save":r"(버그|세이브|날아)", "learning":r"(역사|과학|배우|교육)"}
rx = {k: re.compile(v, re.I) for k, v in THEMES.items()}
rk = {k: re.compile(v) for k, v in TK.items()}
summ = json.load(open(f"{D}/summary.json"))
pos = collections.Counter(); neg = collections.Counter(); npos = nneg = 0
longneg = collections.Counter(); nlong = 0
per_game = {}
ko = collections.Counter(); nko = 0
for f in glob.glob(f"{D}/*.json"):
    if f.endswith("summary.json"): continue
    app = f.split("/")[-1][:-5]
    rows = json.load(open(f))
    g = collections.Counter(); gn = 0
    for r in rows:
        t = r["t"]
        if r["lang"] == "koreana":
            nko += 1
            for k, x in rk.items():
                if x.search(t): ko[(k, r["up"])] += 1
            continue
        hits = [k for k, x in rx.items() if x.search(t)]
        if r["up"]: npos += 1; pos.update(hits)
        else:
            nneg += 1; neg.update(hits); gn += 1; g.update(hits)
            if r["pt"] > 600: nlong += 1; longneg.update(hits)
    per_game[summ.get(app, {}).get("name", app)] = (gn, g.most_common(4))
print(f"English reviews: positive {npos}, negative {nneg} (negative after 10h+ play: {nlong}), Korean {nko}\n")
print(f"{'theme':14s} {'in +':>6s} {'in -':>6s} {'lift(-/+)':>9s} {'- after10h':>10s}")
rows = []
for k in THEMES:
    p = pos[k] / npos; n = neg[k] / nneg; l = longneg[k] / max(1, nlong)
    rows.append((n / max(p, 1e-3), k, p, n, l))
for lift, k, p, n, l in sorted(rows, reverse=True):
    print(f"{k:14s} {p*100:5.1f}% {n*100:5.1f}% {lift:8.2f}x {l*100:9.1f}%")
print("\nTop negative themes per game:")
for name, (gn, top) in sorted(per_game.items()):
    print(f"  {name:24s} n={gn:3d} " + ", ".join(f"{k} {c*100//max(1,gn)}%" for k, c in top))
print("\nKorean reviews (theme: positive / negative counts):")
for k in TK: print(f"  {k:14s} +{ko[(k, True)]} -{ko[(k, False)]}")
