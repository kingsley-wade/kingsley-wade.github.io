from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PRIMARY_SOURCE = ROOT / "1.jpg"
SECONDARY_SOURCE = ROOT / "idphoto.jpg"
OUTPUT_DIR = ROOT / "public" / "images"

PIXEL_SIZE = 96
PORTRAIT_SIZE = 84
PASTEL_BLUE = (221, 239, 252)
PASTEL_MINT = (221, 244, 232)
PASTEL_LAVENDER = (233, 225, 247)
INK = (24, 50, 74)


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
                pixels[x, y] = (
                    PASTEL_MINT if ((x // 8) + (y // 8)) % 2 == 0 else PASTEL_LAVENDER
                )
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


def create_avatar() -> Image.Image:
    primary = normalized_portrait(PRIMARY_SOURCE, (48, 24, 504, 625))
    secondary = normalized_portrait(SECONDARY_SOURCE, (3, 0, 292, 374))
    blended = Image.blend(primary, secondary, 0.08)
    blended = replace_studio_background(blended)
    blended = ImageEnhance.Color(blended).enhance(0.92)
    blended = ImageEnhance.Contrast(blended).enhance(1.16)
    blended = blended.quantize(colors=24, method=Image.Quantize.MEDIANCUT).convert("RGB")

    canvas = Image.new("RGB", (PIXEL_SIZE, PIXEL_SIZE), PASTEL_BLUE)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((2, 2, PIXEL_SIZE - 3, PIXEL_SIZE - 3), outline=INK, width=2)
    canvas.paste(blended, (6, 6), pixel_mask())
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
