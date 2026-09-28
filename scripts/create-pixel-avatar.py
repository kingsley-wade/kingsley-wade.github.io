from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PRIMARY_SOURCE = ROOT / "1.jpg"
SECONDARY_SOURCE = ROOT / "idphoto.jpg"
OUTPUT_DIR = ROOT / "public" / "images"

PIXEL_SIZE = 96
PORTRAIT_SIZE = 84
CYBER_VOID = (5, 12, 26)
CYBER_NAVY = (9, 27, 52)
CYBER_INK = (19, 43, 73)
CYBER_CYAN = (22, 214, 208)
CYBER_ICE = (138, 248, 255)
CYBER_VIOLET = (158, 91, 255)
CYBER_WHITE = (224, 251, 255)


def normalized_portrait(path: Path, crop: tuple[int, int, int, int]) -> Image.Image:
    with Image.open(path) as source:
        rgb = ImageOps.exif_transpose(source).convert("RGB")
        cropped = rgb.crop(crop)
        return ImageOps.fit(
            cropped,
            (PORTRAIT_SIZE, PORTRAIT_SIZE),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.42),
        )


def replace_studio_background(image: Image.Image) -> Image.Image:
    result = image.copy()
    pixels = result.load()
    for y in range(PORTRAIT_SIZE):
        for x in range(PORTRAIT_SIZE):
            red, green, blue = pixels[x, y]
            near_white = min(red, green, blue) > 212 and max(red, green, blue) - min(
                red, green, blue
            ) < 32
            edge_region = y < 58 and (x < 18 or x > 65 or y < 9)
            if near_white and edge_region:
                pixels[x, y] = CYBER_NAVY if ((x // 8) + (y // 8)) % 2 == 0 else CYBER_INK
    return result


def pixel_mask() -> Image.Image:
    mask = Image.new("L", (PORTRAIT_SIZE, PORTRAIT_SIZE), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(
        [
            (6, 0),
            (PORTRAIT_SIZE - 7, 0),
            (PORTRAIT_SIZE - 1, 6),
            (PORTRAIT_SIZE - 1, PORTRAIT_SIZE - 7),
            (PORTRAIT_SIZE - 7, PORTRAIT_SIZE - 1),
            (6, PORTRAIT_SIZE - 1),
            (0, PORTRAIT_SIZE - 7),
            (0, 6),
        ],
        fill=255,
    )
    return mask


def block_face_mask(size: int = 68) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rectangle((5, 0, size - 6, size - 1), fill=255)
    draw.rectangle((0, 7, size - 1, size - 9), fill=255)
    return mask


def cyber_grade(image: Image.Image) -> Image.Image:
    gray = ImageOps.grayscale(image)
    graded = ImageOps.colorize(gray, black=CYBER_INK, white=CYBER_WHITE)
    graded = Image.blend(graded, image, 0.18)
    return ImageEnhance.Contrast(graded).enhance(1.24)


def create_avatar() -> Image.Image:
    primary = normalized_portrait(PRIMARY_SOURCE, (48, 24, 504, 625))
    secondary = normalized_portrait(SECONDARY_SOURCE, (3, 0, 292, 374))
    blended = Image.blend(primary, secondary, 0.08)
    blended = replace_studio_background(blended)
    blended = cyber_grade(blended)
    blended = blended.quantize(colors=20, method=Image.Quantize.MEDIANCUT).convert("RGB")

    canvas = Image.new("RGB", (PIXEL_SIZE, PIXEL_SIZE), CYBER_VOID)
    draw = ImageDraw.Draw(canvas)
    # Minecraft-like shoulders and a stepped helmet silhouette.
    draw.rectangle((8, 76, 87, 93), fill=CYBER_INK)
    draw.rectangle((16, 70, 79, 93), fill=CYBER_NAVY)
    draw.rectangle((24, 82, 71, 95), fill=CYBER_CYAN)
    draw.rectangle((31, 82, 64, 95), fill=CYBER_INK)
    draw.rectangle((10, 8, 85, 75), fill=CYBER_CYAN)
    draw.rectangle((15, 12, 80, 72), fill=CYBER_NAVY)
    draw.rectangle((20, 17, 75, 69), fill=CYBER_INK)
    face = blended.resize((68, 68), Image.Resampling.NEAREST)
    canvas.paste(face, (14, 10), block_face_mask())

    # Visor, hair blocks, and energy bars keep the character readable at 96px.
    draw.rectangle((14, 10, 24, 18), fill=CYBER_CYAN)
    draw.rectangle((72, 10, 82, 18), fill=CYBER_CYAN)
    draw.rectangle((20, 25, 75, 37), fill=CYBER_INK)
    draw.rectangle((25, 28, 70, 31), fill=CYBER_ICE)
    draw.rectangle((31, 32, 39, 35), fill=CYBER_CYAN)
    draw.rectangle((57, 32, 65, 35), fill=CYBER_CYAN)
    draw.rectangle((21, 58, 75, 68), fill=CYBER_NAVY)
    draw.rectangle((29, 60, 67, 64), fill=CYBER_VIOLET)
    draw.rectangle((29, 60, 50, 62), fill=CYBER_ICE)
    draw.rectangle((4, 4, 12, 7), fill=CYBER_VIOLET)
    draw.rectangle((84, 88, 91, 91), fill=CYBER_VIOLET)
    draw.rectangle((2, 2, PIXEL_SIZE - 3, PIXEL_SIZE - 3), outline=CYBER_CYAN, width=2)
    draw.rectangle((6, 6, 9, 9), fill=CYBER_ICE)
    return canvas


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    avatar = create_avatar()
    for size, filename in (
        (384, "avatar-pixel.webp"),
        (768, "avatar-pixel@2x.webp"),
    ):
        output = avatar.resize((size, size), Image.Resampling.NEAREST)
        output.save(
            OUTPUT_DIR / filename,
            format="WEBP",
            lossless=True,
            method=6,
            exif=b"",
            xmp=b"",
        )


if __name__ == "__main__":
    main()
