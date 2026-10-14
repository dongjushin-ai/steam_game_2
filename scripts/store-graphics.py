"""스토어 대표 이미지(1024×500)를 스크린샷에서 만든다.

    python3 scripts/store-graphics.py

store/scenes/eraNN.png(게임 엔진이 그린 시대별 장면) 네 장을 붙이고 제목을 얹는다.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "node_modules/galmuri/dist"
TEXT = {
    "ko": ("AI 키우기", "톱니바퀴에서 특이점까지"),
    "en": ("GROW YOUR AI", "From clockwork gears to the singularity"),
}

ERAS = [0, 3, 6, 9]

for lang, (title, sub) in TEXT.items():
    W, H = 1024, 500
    img = Image.new("RGB", (W, H), "#000000")
    col = W // len(ERAS)
    for i, era in enumerate(ERAS):
        # store/scenes/eraNN.png: 게임 엔진이 그린 192×120 장면. 정수배(5)로 키우고 AI가 있는 쪽을 자른다.
        scene = Image.open(ROOT / f"store/scenes/era{era:02d}.png").convert("RGB")
        scene = scene.resize((scene.width * 5, scene.height * 5), Image.NEAREST)
        cx = 146 * 5
        img.paste(scene.crop((cx - col // 2, 40, cx + col // 2, 40 + H)), (i * col, 0))
    d = ImageDraw.Draw(img)
    for i in range(1, len(ERAS)):
        d.rectangle([i * col - 2, 0, i * col + 1, H], fill="#000000")
    # 제목 띠
    d.rectangle([0, 330, W, 460], fill="#000000")
    d.rectangle([0, 330, W, 334], fill="#ffe600")
    d.rectangle([0, 456, W, 460], fill="#ffe600")
    big = ImageFont.truetype(str(FONT / "Galmuri11-Bold.ttf"), 66)
    small = ImageFont.truetype(str(FONT / "Galmuri11.ttf"), 26)
    d.text((W // 2, 375), title, font=big, fill="#ffffff", anchor="mm")
    d.text((W // 2, 428), sub, font=small, fill="#ffe600", anchor="mm")
    img.save(ROOT / f"store/feature-{lang}.png")
print("ok")
