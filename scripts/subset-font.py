# 게임 글꼴(본문 Pretendard, 공유 카드용 Galmuri 도트)을 게임에 쓰는 글자만 남겨 가볍게 만든다.
#   python3 scripts/subset-font.py   (fonttools, brotli 필요)
# 포함: 소스·데이터에 나오는 모든 글자 + ASCII + 자주 쓰는 한글 2,350자(KS X 1001, AI 이름 입력용)
import pathlib
from fontTools import subset

root = pathlib.Path(__file__).resolve().parent.parent
chars = set(chr(c) for c in range(0x20, 0x7F))
for p in list((root / "src").rglob("*.ts")) + [root / "index.html"]:
    chars |= set(p.read_text(encoding="utf-8"))
for hi in range(0xB0, 0xC9):
    for lo in range(0xA1, 0xFF):
        try:
            chars.add(bytes([hi, lo]).decode("euc-kr"))
        except UnicodeDecodeError:
            pass
chars = {c for c in chars if c.isprintable() or c == " "}
text = "".join(sorted(chars))

out = root / "src/assets/fonts"
out.mkdir(parents=True, exist_ok=True)
fonts = [(root / "node_modules/galmuri/dist" / f"{n}.ttf", n) for n in ["Galmuri11", "Galmuri11-Bold"]]
fonts += [(root / "node_modules/pretendard/dist/public/static/alternative" / f"{n}.ttf", n) for n in ["Pretendard-Regular", "Pretendard-Bold"]]
for path, name in fonts:
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    font = subset.load_font(str(path), opts)
    s = subset.Subsetter(opts)
    s.populate(text=text)
    s.subset(font)
    dst = out / f"{name.lower()}.woff2"
    subset.save_font(font, str(dst), opts)
    print(f"{dst.relative_to(root)}: {dst.stat().st_size // 1024} KB")
print(f"글자 수 {len(text)}")
