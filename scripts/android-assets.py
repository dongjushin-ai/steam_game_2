"""public/icon.svg(20×20 도트)로 안드로이드 런처 아이콘·스플래시를 찍는다.

    python3 scripts/android-assets.py

도트를 정수배로만 키워서 흐려지지 않게 한다. 결과는 android/app/src/main/res 아래에 덮어쓴다.
"""
import re
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "android/app/src/main/res"
FRAME, BG = "#2b2bff", "#14142a"


def grid():
    svg = (ROOT / "public/icon.svg").read_text()
    cells = {}
    for x, y, w, h, fill in re.findall(r'<rect (?:x="(\d+)" y="(\d+)" )?width="(\d+)" height="(\d+)" fill="([^"]+)"', svg):
        x, y, w, h = int(x or 0), int(y or 0), int(w), int(h)
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                cells[(xx, yy)] = fill
    return cells


CELLS = grid()


def paint(size, *, skip=(), scale=None, bg=None):
    """20×20 격자를 size 정사각형 가운데에 정수배로 그린다."""
    scale = scale or size // 20
    img = Image.new("RGBA", (size, size), bg or (0, 0, 0, 0))
    off = (size - 20 * scale) // 2
    d = ImageDraw.Draw(img)
    for (x, y), c in CELLS.items():
        if c in skip:
            continue
        d.rectangle([off + x * scale, off + y * scale, off + (x + 1) * scale - 1, off + (y + 1) * scale - 1], fill=c)
    return img


def legacy(size):
    return paint(size, scale=max(1, size // 20), bg=FRAME)


def round_icon(size):
    img = legacy(size)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def foreground(size):
    # 적응형 아이콘: 108dp 중 가운데 66dp만 안전 영역. 로봇만 그 안에 넣는다.
    return paint(size, skip=(FRAME, BG), scale=max(1, int(size * 66 / 108) // 14))


DENS = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}

for name, k in DENS.items():
    d = RES / f"mipmap-{name}"
    d.mkdir(exist_ok=True)
    legacy(round(48 * k)).save(d / "ic_launcher.png")
    round_icon(round(48 * k)).save(d / "ic_launcher_round.png")
    foreground(round(108 * k)).save(d / "ic_launcher_foreground.png")

(RES / "values/ic_launcher_background.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">%s</color>\n</resources>\n' % BG.upper())

# 스플래시: 검은 바탕 가운데 아이콘
for p in RES.glob("drawable*/splash.png"):
    w, h = Image.open(p).size
    img = Image.new("RGB", (w, h), "#000000")
    icon = legacy(max(20, min(w, h) // 4 // 20 * 20))
    img.paste(icon, ((w - icon.width) // 2, (h - icon.height) // 2), icon)
    img.save(p)

# 스토어 아이콘 512×512 (32비트 PNG)
legacy(512).save(ROOT / "store/icon-512.png")
print("ok")
