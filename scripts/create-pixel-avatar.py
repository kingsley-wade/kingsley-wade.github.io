"""Create the site's cyberpunk pixel portrait directly via code without external photo dependencies."""

from pathlib import Path
from PIL import Image, ImageDraw

# ==============================================================================
# 0. Base Configuration & Canvas Setup
# ==============================================================================
# ROOT points to the repository root directory (assuming script is located at scripts/create-pixel-avatar.py)
ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT/ "public" / "images"

# Canvas resolution in pixels (128x128 grid)
GRID = 128

# ==============================================================================
# 1. Color Palette Configuration
# [CUSTOMIZATION TIP]: Modify RGB tuples here to adjust the global theme/colors.
# ==============================================================================

# --- Background & Cyber Grid ---
NAVY = (7, 24, 48)            # Canvas background base color (deep tech navy)
GRID_LINE = (14, 45, 82)      # Subtle background grid lines
GRID_TEXT = (20, 60, 105)     # Background floating binary & glyphs
CIRCUIT_CYAN = (20, 90, 125)  # Cyber circuit traces

# --- Skin Tones & Shading ---
SKIN = (252, 178, 108)        # Main facial skin tone (warm peach)
SKIN_SHADOW = (226, 142, 80)  # Cheeks, jawline, and ear shadows
SKIN_DARK = (185, 105, 55)    # Deep shadow under the chin / neck

# --- Hair Colors ---
HAIR = (28, 24, 34)           # Main hair color (obsidian black)
HAIR_SHADE = (18, 15, 24)     # Shadowed hair areas
HAIR_HIGHLIGHT = (50, 42, 60) # Hair highlights

# --- Cyber Glowing Elements (Bionic Eye & Cables) ---
CYAN = (45, 225, 218)         # Cyber neon cyan glow
ICE_BLUE = (195, 250, 255)    # Lens highlight / ice white-blue
CYAN_GLOW = (25, 135, 160)    # Subdued cyan border glow
CYBER_PURPLE = (120, 95, 210) # Neck cable bottom purple gradient

# --- Clothing & Outlines ---
OUTLINE = (18, 18, 22)        # Pixel outline black
WHITE = (248, 249, 252)       # T-shirt fabric white
SHIRT_SHADOW = (205, 216, 228)# Collar & fabric fold shadow

# --- T-Shirt Graphic (Keith Haring Style Heart & Figures) ---
HEART_RED = (222, 49, 49)     # Vibrant red heart
HEART_DARK = (175, 28, 28)    # Heart shadow edge


# ==============================================================================
# 2. Background & Grid Layer
# ==============================================================================
def draw_background(draw: ImageDraw.ImageDraw) -> None:
    """Draw the cybernetic background: grid, floating data code, and circuit traces."""
    # Fill background
    draw.rectangle((0, 0, GRID - 1, GRID - 1), fill=NAVY)

    # Draw subtle background grid lines (every 6 pixels)
    for x in range(0, GRID, 6):
        draw.line([(x, 0), (x, GRID - 1)], fill=GRID_LINE, width=1)
    for y in range(0, GRID, 6):
        draw.line([(0, y), (GRID - 1, y)], fill=GRID_LINE, width=1)

    # Floating binary digits and cyber glyphs
    glyphs = [
        (8, 20, ["0", "1"]),
        (6, 32, ["1", "0", "1"]),
        (6, 50, [":", "0", "1", "1"]),
        (6, 68, ["m"]),
        (6, 76, ["1", "0", "1", "f", "+"]),
        (6, 86, ["F", "e", "1", "4", "0"]),
        (104, 18, ["1", "0"]),
        (104, 28, ["1", "1", "0"]),
        (103, 38, ["K", "0"]),
        (104, 48, [">", "u"]),
        (104, 58, ["1"]),
        (94, 76, ["1", "0"]),
    ]
    for gx, gy, chars in glyphs:
        for idx, ch in enumerate(chars):
            px, py = gx + idx * 5, gy
            if ch in ("1", "e", "f", "K", "u"):
                draw.rectangle((px, py, px + 2, py + 4), fill=GRID_TEXT)
            elif ch in ("0", "4", "F"):
                draw.rectangle((px, py, px + 3, py + 4), outline=GRID_TEXT)
            elif ch == ":":
                draw.point([(px, py), (px, py + 3)], fill=GRID_TEXT)
            elif ch == "+":
                draw.line([(px, py + 2), (px + 4, py + 2)], fill=GRID_TEXT)
                draw.line([(px + 2, py), (px + 2, py + 4)], fill=GRID_TEXT)
            elif ch == ">":
                draw.point([(px, py), (px + 2, py + 2), (px, py + 4)], fill=GRID_TEXT)

    # Cyber circuit traces extending from the bionic eye to the right edge
    circuits = [
        [(88, 60), (98, 60), (105, 53), (120, 53)],
        [(96, 60), (96, 68), (110, 68), (116, 74), (122, 74)],
        [(102, 78), (106, 82), (106, 94)],
    ]
    for path in circuits:
        draw.line(path, fill=CIRCUIT_CYAN, width=1)
        end_x, end_y = path[-1]
        draw.rectangle((end_x - 1, end_y - 1, end_x + 1, end_y + 1), fill=CIRCUIT_CYAN)


# ==============================================================================
# 3. Body & White T-Shirt Layer
# ==============================================================================
def draw_body_and_shirt(draw: ImageDraw.ImageDraw) -> None:
    """Draw the shoulder outlines and white T-shirt body."""
    # Outer dark contour for shoulders and torso
    shirt_outline = [
        (14, 128), (14, 108), (20, 99), (28, 93), 
        (46, 88), (82, 88), (100, 93), (108, 99), 
        (114, 108), (114, 128)
    ]
    draw.polygon(shirt_outline, fill=OUTLINE)

    # White T-shirt fabric
    shirt_body = [
        (16, 128), (16, 110), (22, 101), (30, 95), 
        (46, 90), (82, 90), (98, 95), (106, 101), 
        (112, 110), (112, 128)
    ]
    draw.polygon(shirt_body, fill=WHITE)

    # Collar contour and subtle shadow
    draw.rectangle((44, 90, 84, 96), fill=SHIRT_SHADOW)
    draw.polygon([(46, 90), (82, 90), (74, 98), (54, 98)], fill=OUTLINE)
    draw.polygon([(48, 90), (80, 90), (72, 96), (56, 96)], fill=WHITE)

    # Arm crease lines
    draw.line([(31, 108), (31, 128)], fill=OUTLINE, width=2)
    draw.line([(97, 108), (97, 128)], fill=OUTLINE, width=2)


# ==============================================================================
# 4. Neck & Cyber Conduits Layer
# ==============================================================================
def draw_neck_and_cyber_cables(draw: ImageDraw.ImageDraw) -> None:
    """Draw neck base and bilateral glowing energy conduits."""
    # Neck skin base
    draw.rectangle((52, 78, 76, 94), fill=SKIN)
    # Cast shadow under chin
    draw.rectangle((52, 78, 76, 84), fill=SKIN_DARK)
    draw.rectangle((54, 85, 74, 88), fill=SKIN_SHADOW)

    # Outer neck boundary lines
    draw.rectangle((50, 78, 52, 94), fill=OUTLINE)
    draw.rectangle((76, 78, 78, 94), fill=OUTLINE)

    # Left glowing conduit (cyan to purple gradient)
    draw.line([(55, 82), (55, 93)], fill=CYAN, width=1)
    draw.line([(56, 84), (56, 93)], fill=ICE_BLUE, width=1)
    draw.point([(55, 93), (56, 93)], fill=CYBER_PURPLE)

    # Right glowing conduit
    draw.line([(72, 82), (72, 93)], fill=CYAN, width=1)
    draw.line([(73, 84), (73, 93)], fill=ICE_BLUE, width=1)
    draw.point([(72, 93), (73, 93)], fill=CYBER_PURPLE)


# ==============================================================================
# 5. Shirt Graphic: Keith Haring Style Heart & Dancing Figures
# [CUSTOMIZATION TIP - SHIRT GRAPHIC]:
# - To resize or move the heart: adjust the coordinates in `heart_outline` and `heart_fill`.
# - To replace the entire graphic (e.g. logo, text, or icon): edit or replace the drawing code in this function.
# ==============================================================================
def draw_shirt_pattern(draw: ImageDraw.ImageDraw) -> None:
    """Draw the chest graphic: Keith Haring inspired figures holding a glowing heart."""
    # 1. Radiating spark / energy tick marks above heart
    # [Tip]: Modify line endpoints [(x1, y1), (x2, y2)] to change spark directions or count.
    sparks = [
        [(48, 102), (46, 99)],
        [(51, 100), (50, 97)],
        [(56, 99), (56, 96)],
        [(64, 98), (64, 95)],
        [(72, 99), (72, 96)],
        [(77, 100), (78, 97)],
        [(80, 102), (82, 99)],
    ]
    for line in sparks:
        draw.line(line, fill=OUTLINE, width=2)

    # 2. Red Heart Polygon
    # [Tip]: To make heart larger: decrease min X (leftwards), increase max X (rightwards), decrease min Y (upwards).
    heart_outline = [
        (64, 122),  # Bottom tip
        (56, 116), (48, 108), (48, 104), (52, 101), (58, 101), (64, 106), # Left half
        (70, 101), (76, 101), (80, 104), (80, 108), (72, 116)             # Right half
    ]
    draw.polygon(heart_outline, fill=OUTLINE)

    heart_fill = [
        (64, 120),
        (57, 115), (50, 108), (50, 105), (53, 103), (57, 103), (64, 108),
        (71, 103), (75, 103), (78, 105), (78, 108), (71, 115)
    ]
    draw.polygon(heart_fill, fill=HEART_RED)

    # Heart shading accents
    draw.line([(68, 112), (64, 118)], fill=HEART_DARK, width=1)
    draw.line([(73, 108), (76, 107)], fill=HEART_DARK, width=1)

    # 3. Two Figures Supporting the Heart
    # Left figure head with smiley face
    draw.ellipse((45, 118, 53, 126), outline=OUTLINE, width=1)
    draw.point([(47, 121), (50, 121)], fill=OUTLINE)
    draw.line([(48, 123), (50, 123)], fill=OUTLINE)

    # Right figure head with smiley face
    draw.ellipse((75, 118, 83, 126), outline=OUTLINE, width=1)
    draw.point([(77, 121), (80, 121)], fill=OUTLINE)
    draw.line([(78, 123), (80, 123)], fill=OUTLINE)

    # Raised arms holding the heart
    draw.line([(43, 128), (43, 122), (48, 115), (54, 115)], fill=OUTLINE, width=2)
    draw.line([(51, 126), (55, 122), (58, 122)], fill=OUTLINE, width=2)
    draw.line([(85, 128), (85, 122), (80, 115), (74, 115)], fill=OUTLINE, width=2)
    draw.line([(77, 126), (73, 122), (70, 122)], fill=OUTLINE, width=2)

    # Hands under the heart
    draw.rectangle((55, 114, 58, 116), fill=OUTLINE)
    draw.rectangle((70, 114, 73, 116), fill=OUTLINE)
    draw.line([(58, 122), (70, 122)], fill=OUTLINE, width=2)


# ==============================================================================
# 6. Face & Ears Layer
# ==============================================================================
def draw_head_and_face(draw: ImageDraw.ImageDraw) -> None:
    """Draw head structure, skin fill, cheek shading, and ears."""
    # Outer black contour of face
    face_outline = [
        (35, 38), (93, 38),
        (93, 70), (88, 76), (78, 83), (50, 83), (40, 76), (35, 70)
    ]
    draw.polygon(face_outline, fill=OUTLINE)

    # Skin fill
    face_skin = [
        (37, 40), (91, 40),
        (91, 68), (86, 74), (76, 81), (52, 81), (42, 74), (37, 68)
    ]
    draw.polygon(face_skin, fill=SKIN)

    # Jawline and cheek shading
    draw.polygon([(42, 74), (86, 74), (76, 81), (52, 81)], fill=SKIN_SHADOW)
    draw.rectangle((85, 62, 90, 70), fill=SKIN_SHADOW)
    draw.rectangle((38, 62, 42, 70), fill=SKIN_SHADOW)

    # Left ear
    draw.rectangle((31, 50, 36, 64), fill=OUTLINE)
    draw.rectangle((33, 52, 36, 62), fill=SKIN)
    draw.rectangle((33, 56, 35, 60), fill=SKIN_SHADOW)

    # Right ear
    draw.rectangle((92, 50, 97, 64), fill=OUTLINE)
    draw.rectangle((92, 52, 95, 62), fill=SKIN)
    draw.rectangle((93, 56, 95, 60), fill=SKIN_SHADOW)


# ==============================================================================
# 7. Hair & Bangs Layer
# ==============================================================================
def draw_hair(draw: ImageDraw.ImageDraw) -> None:
    """Draw top hair silhouette, sideburns, and layered bangs."""
    # Top crown polygon
    hair_top = [
        (35, 38), (30, 32), (32, 20), (42, 14), (55, 11),
        (75, 11), (88, 14), (98, 20), (100, 32), (93, 38)
    ]
    draw.polygon(hair_top, fill=HAIR)

    # Sideburns
    draw.rectangle((26, 32, 34, 48), fill=HAIR)
    draw.rectangle((94, 32, 102, 48), fill=HAIR)
    draw.rectangle((28, 48, 33, 56), fill=HAIR_SHADE)
    draw.rectangle((95, 48, 100, 56), fill=HAIR_SHADE)

    # Layered bangs (x1, y1, x2, y2)
    # [Tip]: Adjust width and downward length of these boxes to restyle hairstyle.
    bangs = [
        (34, 36, 42, 44),  # Far left strand
        (42, 36, 48, 48),  # Left-mid long strand
        (48, 36, 54, 42),  # Center-left strand
        (54, 36, 61, 46),  # Forehead center strand
        (61, 36, 68, 40),  # Center-right gap
        (68, 36, 75, 47),  # Right-mid long strand
        (75, 36, 82, 42),  # Right strand
        (82, 36, 92, 45),  # Far right strand
    ]
    for b in bangs:
        draw.rectangle(b, fill=HAIR)

    # Hair shading accents
    draw.rectangle((38, 28, 45, 35), fill=HAIR_SHADE)
    draw.rectangle((85, 28, 92, 35), fill=HAIR_SHADE)
    draw.point([(65, 42), (66, 42)], fill=SKIN_SHADOW)


# ==============================================================================
# 8. Facial Features Layer (Eyes, Eyebrows, Mouth, Mole)
# [CUSTOMIZATION TIP - EYES & EXPRESSION]:
# - To make the eyes larger: see detailed notes in sections B and C below.
# - To alter facial expression: see section D for mouth and mole.
# ==============================================================================
def draw_facial_features(draw: ImageDraw.ImageDraw) -> None:
    """Draw eyebrows, winking eye, cybernetic bionic eye, mouth smirk, and beauty mark."""

    # --------------------------------------------------------------------------
    # A. Eyebrows
    # --------------------------------------------------------------------------
    # Left raised eyebrow
    draw.rectangle((44, 43, 53, 46), fill=OUTLINE)
    draw.rectangle((51, 45, 55, 48), fill=OUTLINE)

    # Right cyber eyebrow (with bionic gap / slit)
    draw.rectangle((71, 44, 80, 47), fill=OUTLINE)
    draw.rectangle((76, 44, 78, 47), fill=SKIN)     # Slit gap
    draw.rectangle((82, 45, 87, 47), fill=OUTLINE)

    # --------------------------------------------------------------------------
    # B. Left Eye: Winking Eye
    # [HOW TO MAKE WINKING EYE BIGGER]:
    #   Current span is roughly x: 43~56, y: 56~62.
    #   To enlarge: expand horizontal range (e.g. x: 41~58) and vertical thickness
    #   (e.g. increase top line from y=57..60 to y=56..61).
    # --------------------------------------------------------------------------
    draw.rectangle((45, 57, 54, 60), fill=OUTLINE)   # Horizontal arch bar
    draw.rectangle((43, 58, 46, 62), fill=OUTLINE)   # Left downward curve
    draw.rectangle((53, 58, 56, 62), fill=OUTLINE)   # Right downward curve
    draw.point([(48, 56), (49, 56), (50, 56)], fill=OUTLINE) # Upward curvature

    # --------------------------------------------------------------------------
    # C. Right Eye: Cybernetic Bionic Eye
    # [HOW TO MAKE CYBER EYE BIGGER]:
    #   1. HUD Frame: currently (72, 50, 89, 66) [width 17, height 16].
    #      Expand to e.g. (70, 48, 91, 68) [width 21, height 20].
    #   2. Pupil / Iris: currently (75, 54, 84, 63) [width 9, height 9].
    #      Enlarge to e.g. (73, 52, 86, 65) [width 13, height 13].
    #   3. Highlights: shift/scale the white highlight dot (76, 55, 78, 57)
    #      and the cyan scanline (83, 55) accordingly.
    # --------------------------------------------------------------------------
    # 1. Outer HUD bracket and reticle corners
    draw.rectangle((72, 50, 89, 66), outline=CYAN_GLOW, width=1)
    draw.line([(87, 51), (89, 51), (89, 53)], fill=CYAN, width=1)
    draw.line([(87, 65), (89, 65), (89, 63)], fill=CYAN, width=1)
    draw.line([(72, 51), (74, 51), (72, 53)], fill=CYAN, width=1)
    draw.line([(72, 65), (74, 65), (72, 63)], fill=CYAN, width=1)

    # 2. Eye socket base
    draw.rectangle((74, 53, 86, 64), fill=(16, 32, 52))

    # 3. Main dark pupil / lens matrix
    draw.rectangle((75, 54, 84, 63), fill=(8, 14, 24))

    # 4. Digital reflections & scanning highlight
    draw.rectangle((76, 55, 78, 57), fill=WHITE)     # Primary white reflection
    draw.point([(78, 58), (76, 58)], fill=ICE_BLUE)  # Soft cyan glare
    draw.line([(83, 55), (83, 62)], fill=CYAN, width=1)      # Vertical scanning glow
    draw.line([(84, 56), (84, 61)], fill=ICE_BLUE, width=1)  # Outer rim light
    draw.point([(81, 62), (82, 62)], fill=CYAN_GLOW)         # Bottom sub-reflection

    # 5. Right-side sensor module connector
    draw.rectangle((86, 55, 88, 62), fill=CYAN)
    draw.rectangle((87, 57, 88, 60), fill=ICE_BLUE)

    # --------------------------------------------------------------------------
    # D. Mouth & Beauty Mark (Mole)
    # [HOW TO MODIFY]:
    #   - Change smile width/curve by editing `(55, 72, 68, 74)` and corner points.
    #   - Remove mole by commenting out the two lines at (74, 73, 76, 75).
    # --------------------------------------------------------------------------
    draw.rectangle((55, 72, 68, 74), fill=OUTLINE)  # Main smirk line
    draw.rectangle((52, 70, 55, 73), fill=OUTLINE)  # Left corner upturn
    draw.rectangle((67, 69, 70, 72), fill=OUTLINE)  # Right corner upturn

    # Beauty mark / mole on the right cheek
    draw.rectangle((74, 73, 76, 75), fill=SKIN_DARK)
    draw.point([(75, 74)], fill=OUTLINE)


# ==============================================================================
# 9. Assembly Pipeline & Export Entrypoint
# ==============================================================================
def create_avatar() -> Image.Image:
    """Composite and render the full avatar in bottom-to-top layer order."""
    canvas = Image.new("RGB", (GRID, GRID), NAVY)
    draw = ImageDraw.Draw(canvas)

    draw_background(draw)            # Layer 1: Background grid & circuits
    draw_body_and_shirt(draw)        # Layer 2: Torso & white T-shirt
    draw_neck_and_cyber_cables(draw) # Layer 3: Neck & glowing cables
    draw_shirt_pattern(draw)         # Layer 4: Chest graphic
    draw_head_and_face(draw)         # Layer 5: Head shape & skin
    draw_hair(draw)                  # Layer 6: Hair & bangs
    draw_facial_features(draw)       # Layer 7: Eyes, mouth & details

    return canvas


def main() -> None:
    """Generate and export avatar images in requested sizes."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    avatar = create_avatar()

    # Must use Resampling.NEAREST to preserve crisp, unblurred pixel edges
    export_targets = [
        (384, "avatar-pixel.webp", "WEBP"),
        (768, "avatar-pixel@2x.webp", "WEBP"),
        (512, "avatar-pixel.png", "PNG"),
    ]

    for size, filename, fmt in export_targets:
        out_path = OUTPUT_DIR / filename
        scaled = avatar.resize((size, size), Image.Resampling.NEAREST)
        if fmt == "WEBP":
            scaled.save(out_path, format="WEBP", lossless=True, method=6)
        else:
            scaled.save(out_path, format="PNG")
        print(f"Exported avatar: {out_path} ({size}x{size})")


if __name__ == "__main__":
    main()