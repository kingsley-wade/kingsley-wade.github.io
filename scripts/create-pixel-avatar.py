"""Create the site's pixel portrait from local, ignored photo references."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PRIMARY_SOURCE = ROOT / "1.jpg"
OUTPUT_DIR = ROOT / "public" / "images"
GRID = 128
NAVY = (5, 20, 39)
GRID_BLUE = (10, 43, 72)
GRID_GLOW = (13, 57, 88)
HAIR = (26, 21, 30)
HAIR_SHADE = (18, 16, 24)
SKIN_SHADOW = (187, 116, 70)
FRAME = (7, 11, 19)
CYAN = (45, 225, 218)
ICE = (173, 250, 255)
SHIRT = (229, 239, 248)


def face_reference() -> tuple[Image.Image, Image.Image]:
    with Image.open(PRIMARY_SOURCE) as source:
        photo = ImageOps.exif_transpose(source).convert("RGB")
        crop = photo.crop((82, 62, 472, 500))
        face = ImageOps.fit(crop, (82, 65), method=Image.Resampling.LANCZOS, centering=(0.5, 0.47))
        face = ImageEnhance.Color(face).enhance(1.12)
        face = ImageEnhance.Contrast(face).enhance(1.08)
        face = face.quantize(colors=28, method=Image.Quantize.MEDIANCUT).convert("RGB")
        mask = Image.new("L", face.size, 255)
        pixels = face.load()
        mask_pixels = mask.load()
        for y in range(face.height):
            for x in range(face.width):
                red, green, blue = pixels[x, y]
                if min(red, green, blue) > 205 and max(red, green, blue) - min(red, green, blue) < 34:
                    mask_pixels[x, y] = 0
        return face, mask


def draw_grid(draw: ImageDraw.ImageDraw) -> None:
    draw.rectangle((0, 0, GRID - 1, GRID - 1), fill=NAVY)
    for x in range(0, GRID, 6):
        draw.rectangle((x, 0, x + 1, GRID - 1), fill=GRID_BLUE)
    for y in range(0, GRID, 6):
        draw.rectangle((0, y, GRID - 1, y + 1), fill=GRID_BLUE)
    for x, y, glyph in ((8, 35, "101"), (104, 22, "<>"), (8, 76, "+_"), (101, 81, "01")):
        for index, char in enumerate(glyph):
            if char == "1":
                draw.rectangle((x + index * 5, y, x + 2 + index * 5, y + 10), fill=GRID_GLOW)
            elif char == "+":
                draw.rectangle((x, y + 4, x + 10, y + 6), fill=GRID_GLOW)
                draw.rectangle((x + 4, y, x + 6, y + 10), fill=GRID_GLOW)
            else:
                draw.rectangle((x + index * 5, y, x + 2 + index * 5, y + 2), fill=GRID_GLOW)


def draw_bear(draw: ImageDraw.ImageDraw) -> None:
    outline, brown, tan, pink = (55, 33, 29), (147, 91, 57), (239, 178, 105), (244, 133, 146)
    draw.rectangle((53, 95, 59, 101), fill=outline)
    draw.rectangle((70, 95, 76, 101), fill=outline)
    draw.rectangle((54, 96, 58, 99), fill=brown)
    draw.rectangle((71, 96, 75, 99), fill=brown)
    draw.rectangle((51, 99, 78, 116), fill=outline)
    draw.rectangle((54, 101, 75, 114), fill=brown)
    draw.rectangle((57, 104, 72, 112), fill=tan)
    draw.rectangle((59, 106, 61, 108), fill=outline)
    draw.rectangle((68, 106, 70, 108), fill=outline)
    draw.rectangle((63, 109, 66, 111), fill=pink)
    draw.rectangle((61, 112, 68, 114), fill=outline)


def create_avatar() -> Image.Image:
    canvas = Image.new("RGB", (GRID, GRID), NAVY)
    draw = ImageDraw.Draw(canvas)
    draw_grid(draw)
    draw.polygon([(15, 128), (15, 108), (25, 100), (45, 93), (83, 93), (104, 100), (114, 108), (114, 128)], fill=FRAME)
    draw.polygon([(17, 128), (17, 110), (27, 102), (46, 96), (82, 96), (101, 102), (111, 110), (111, 128)], fill=SHIRT)
    draw.rectangle((54, 86, 73, 101), fill=SKIN_SHADOW)
    draw.rectangle((59, 88, 68, 102), fill=(211, 139, 85))
    draw_bear(draw)

    face, face_mask = face_reference()
    face = face.resize((82, 65), Image.Resampling.NEAREST)
    face_mask = face_mask.resize((82, 65), Image.Resampling.NEAREST)
    canvas.paste(face, (23, 29), face_mask)
    draw.rectangle((19, 39, 24, 68), fill=SKIN_SHADOW)
    draw.rectangle((104, 39, 109, 68), fill=SKIN_SHADOW)
    draw.rectangle((25, 24, 101, 35), fill=HAIR)
    draw.rectangle((31, 18, 95, 29), fill=HAIR)
    draw.rectangle((39, 12, 88, 22), fill=HAIR)
    draw.rectangle((25, 28, 36, 45), fill=HAIR_SHADE)
    draw.rectangle((91, 27, 102, 45), fill=HAIR_SHADE)
    draw.rectangle((42, 25, 47, 36), fill=HAIR)
    draw.rectangle((57, 23, 63, 34), fill=HAIR)
    draw.rectangle((77, 23, 82, 34), fill=HAIR)
    draw.rectangle((43, 52, 56, 55), fill=FRAME)
    draw.rectangle((70, 51, 84, 54), fill=FRAME)
    draw.rectangle((45, 56, 56, 65), fill=(2, 4, 8))
    draw.rectangle((47, 58, 54, 63), fill=(8, 10, 15))
    draw.rectangle((51, 58, 54, 60), fill=SHIRT)
    draw.rectangle((70, 55, 88, 65), fill=(76, 83, 96))
    draw.rectangle((73, 54, 86, 64), fill=(19, 39, 59))
    draw.rectangle((78, 57, 83, 60), fill=ICE)
    draw.rectangle((87, 53, 91, 64), fill=CYAN)
    draw.rectangle((90, 56, 92, 61), fill=ICE)
    draw.rectangle((56, 74, 71, 77), fill=FRAME)
    draw.rectangle((62, 67, 64, 69), fill=(148, 82, 57))
    draw.rectangle((4, 4, 123, 5), fill=GRID_GLOW)
    draw.rectangle((4, 4, 5, 123), fill=GRID_GLOW)
    return canvas


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    avatar = create_avatar()
    for size, filename in ((384, "avatar-pixel.webp"), (768, "avatar-pixel@2x.webp")):
        output = avatar.resize((size, size), Image.Resampling.NEAREST)
        output.save(OUTPUT_DIR / filename, format="WEBP", lossless=True, method=6, exif=b"", xmp=b"")


if __name__ == "__main__":
    main()
