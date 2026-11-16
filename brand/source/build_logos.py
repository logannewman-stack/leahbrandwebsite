"""
Leah Roling — logo suite generator.

Builds every logo as outlined SVG paths (no font dependency), so files work
in any tool: print vendors, Canva, Figma, embroidery, signage.

Run:  python3 brand/source/build_logos.py
Needs: pip install fonttools uharfbuzz brotli
"""
import io
import math
import os

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONTS = os.path.join(ROOT, "assets", "fonts")
OUT = os.path.join(ROOT, "brand", "logos")
os.makedirs(OUT, exist_ok=True)

# ---- Brand palette -------------------------------------------------------
INK = "#1C1815"
LINEN = "#F6F0E7"
GARNET = "#7E1F2C"
BRASS = "#B08D57"
EMBER = "#C8553D"

# ---- Font instancing -----------------------------------------------------
_cache = {}


def font(name, **axes):
    key = (name, tuple(sorted(axes.items())))
    if key in _cache:
        return _cache[key]
    path = os.path.join(FONTS, name) if os.path.exists(os.path.join(FONTS, name)) else os.path.join(ROOT, "brand", "source", name)
    tt = TTFont(path)
    if "fvar" in tt and axes:
        tt = instancer.instantiateVariableFont(tt, axes)
    buf = io.BytesIO()
    tt.flavor = None
    tt.save(buf)
    data = buf.getvalue()
    tt = TTFont(io.BytesIO(data))
    face = hb.Face(data)
    hbfont = hb.Font(face)
    _cache[key] = (tt, hbfont)
    return _cache[key]


class Run:
    """A shaped run of text that can be drawn as SVG path data."""

    def __init__(self, text, fnt, size, tracking=0.0, features=None):
        self.tt, self.hb = fnt
        self.upm = self.tt["head"].unitsPerEm
        self.size = size
        self.scale = size / self.upm
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, features or {"kern": True, "liga": True})
        self.glyphs = []
        x = 0
        order = self.tt.getGlyphOrder()
        track_units = tracking * self.upm
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            self.glyphs.append((order[info.codepoint], x + pos.x_offset, pos.y_offset, pos.x_advance))
            x += pos.x_advance + track_units
        self.advance_units = x - (track_units if self.glyphs else 0)
        self.width = self.advance_units * self.scale

    def path(self, x0, y0):
        gs = self.tt.getGlyphSet()
        pen = SVGPathPen(gs)
        for name, gx, gy, _ in self.glyphs:
            t = TransformPen(pen, (self.scale, 0, 0, -self.scale, x0 + gx * self.scale, y0 - gy * self.scale))
            gs[name].draw(t)
        return pen.getCommands()

    def bounds(self, x0, y0):
        gs = self.tt.getGlyphSet()
        bp = BoundsPen(gs)
        for name, gx, gy, _ in self.glyphs:
            t = TransformPen(bp, (self.scale, 0, 0, -self.scale, x0 + gx * self.scale, y0 - gy * self.scale))
            gs[name].draw(t)
        return bp.bounds  # xmin, ymin, xmax, ymax in SVG space

    def glyph_paths(self):
        """Yield (svg_path_at_origin, advance_px) per glyph — used for the circular seal."""
        gs = self.tt.getGlyphSet()
        for name, _, _, adv in self.glyphs:
            pen = SVGPathPen(gs)
            t = TransformPen(pen, (self.scale, 0, 0, -self.scale, 0, 0))
            gs[name].draw(t)
            yield pen.getCommands(), adv * self.scale


# Type settings for the brand -------------------------------------------
def serif_roman():
    return font("fraunces-roman.woff2", wght=340, opsz=144, SOFT=100, WONK=0)


def serif_italic():
    return font("fraunces-italic.woff2", wght=330, opsz=144, SOFT=100, WONK=1)


def sans(w=560):
    return font("instrument-sans-roman.woff2", wght=w, wdth=100)


def script():
    return font("script-mrs-saint-delafield.woff2")


# ---- SVG helpers ---------------------------------------------------------
def svg(w, h, body, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" '
        f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">\n'
        f"<title>{title}</title>\n{body}\n</svg>\n"
    )


def save(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)
    print("  wrote", name)


def union(*bs):
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))


# ---- Wordmark ------------------------------------------------------------
def wordmark_parts(size=100):
    leah = Run("Leah", serif_italic(), size, tracking=-0.012)
    roling = Run("Roling", serif_roman(), size, tracking=-0.018)
    gap = size * 0.2
    return leah, roling, gap


def wordmark(color_first, color_second, fname, title, pad=0.06):
    size = 100
    leah, roling, gap = wordmark_parts(size)
    base = size
    b1 = leah.bounds(0, base)
    b2 = roling.bounds(leah.width + gap, base)
    bx = union(b1, b2)
    p = size * pad
    w = bx[2] - bx[0] + 2 * p
    h = bx[3] - bx[1] + 2 * p
    dx, dy = -bx[0] + p, -bx[1] + p
    body = (
        f'<g transform="translate({dx:.2f} {dy:.2f})">'
        f'<path fill="{color_first}" d="{leah.path(0, base)}"/>'
        f'<path fill="{color_second}" d="{roling.path(leah.width + gap, base)}"/></g>'
    )
    save(fname, svg(w, h, body, title))


def wordmark_stacked(c1, c2, c3, fname, title, descriptor="COACH  ·  AUTHOR  ·  SPEAKER"):
    size = 100
    leah, roling, gap = wordmark_parts(size)
    base = size
    b1 = leah.bounds(0, base)
    b2 = roling.bounds(leah.width + gap, base)
    wb = union(b1, b2)
    wm_w = wb[2] - wb[0]
    desc = Run(descriptor, sans(540), size * 0.17, tracking=0.32)
    dbase = wb[3] + size * 0.42
    dx_desc = wb[0] + (wm_w - desc.width) / 2
    db = desc.bounds(dx_desc, dbase)
    bx = union(wb, db)
    p = size * 0.08
    w = bx[2] - bx[0] + 2 * p
    h = bx[3] - bx[1] + 2 * p
    dx, dy = -bx[0] + p, -bx[1] + p
    body = (
        f'<g transform="translate({dx:.2f} {dy:.2f})">'
        f'<path fill="{c1}" d="{leah.path(0, base)}"/>'
        f'<path fill="{c2}" d="{roling.path(leah.width + gap, base)}"/>'
        f'<path fill="{c3}" d="{desc.path(dx_desc, dbase)}"/></g>'
    )
    save(fname, svg(w, h, body, title))


# ---- Monogram: the Doorway arch ------------------------------------------
# Arch geometry lives in a 200 x 260 box. Keystone sits in a gap at the apex.
AW, AH = 200, 262
CX, CY, R = 100, 102, 82
LEG_BOTTOM = 252
STROKE = 4.2
GAP_DEG = 7.5


def arch_paths():
    t = math.radians(GAP_DEG)
    lx, ly = CX - R * math.sin(t), CY - R * math.cos(t)
    rx, ry = CX + R * math.sin(t), CY - R * math.cos(t)
    left = f"M{CX - R:.2f} {LEG_BOTTOM} V{CY} A{R} {R} 0 0 1 {lx:.2f} {ly:.2f}"
    right = f"M{rx:.2f} {ry:.2f} A{R} {R} 0 0 1 {CX + R:.2f} {CY} V{LEG_BOTTOM}"
    ky = CY - R
    kw, kh = 6.2, 9.5
    keystone = f"M{CX} {ky - kh:.2f} L{CX + kw} {ky:.2f} L{CX} {ky + kh:.2f} L{CX - kw} {ky:.2f} Z"
    return left, right, keystone


def monogram_letters(base=214):
    """Italic L and roman R share a baseline; the L's foot runs into the R's stem."""
    L = Run("L", serif_italic(), 138)
    Rr = Run("R", serif_roman(), 114)
    lb, rb = L.bounds(0, 0), Rr.bounds(0, 0)
    overlap = (lb[2] - lb[0]) * 0.26
    total = (lb[2] - lb[0]) - overlap + (rb[2] - rb[0])
    lx = CX - total / 2 - lb[0]
    rx = lx + lb[0] + (lb[2] - lb[0]) - overlap - rb[0]
    return (L, lx, base), (Rr, rx, base)


def monogram_body(arch_color, l_color, r_color, key_color):
    left, right, key = arch_paths()
    (L, lx, lb), (Rr, rx, rb) = monogram_letters()
    return (
        f'<path d="{left}" fill="none" stroke="{arch_color}" stroke-width="{STROKE}" stroke-linecap="butt"/>'
        f'<path d="{right}" fill="none" stroke="{arch_color}" stroke-width="{STROKE}" stroke-linecap="butt"/>'
        f'<path d="{key}" fill="{key_color}"/>'
        f'<path fill="{r_color}" d="{Rr.path(rx, rb)}"/>'
        f'<path fill="{l_color}" d="{L.path(lx, lb)}"/>'
    )


def monogram(arch, lc, rc, kc, fname, title):
    body = monogram_body(arch, lc, rc, kc)
    save(fname, svg(AW, AH, body, title))


def monogram_filled(bg, fg, fname, title):
    """Solid arch tile — favicon / app icon / social avatar."""
    top = 18
    r = 82
    d = f"M{CX - r} {AH} V{CY} A{r} {r} 0 0 1 {CX + r} {CY} V{AH} Z"
    (L, lx, lb), (Rr, rx, rb) = monogram_letters(base=222)
    body = (
        f'<path d="{d}" fill="{bg}"/>'
        f'<path fill="{fg}" opacity="0.6" d="{Rr.path(rx, rb)}"/>'
        f'<path fill="{fg}" d="{L.path(lx, lb)}"/>'
    )
    save(fname, svg(AW, AH, body, title))


# ---- Horizontal lockup: monogram + wordmark ------------------------------
def lockup(c_arch, c_l, c_r, c_key, c1, c2, fname, title):
    size = 100
    leah, roling, gap = wordmark_parts(size)
    s = 0.62  # monogram scale relative to its 200x262 box
    mono_w, mono_h = AW * s, AH * s
    space = 34
    base = mono_h * 0.68
    x0 = mono_w + space
    b1 = leah.bounds(x0, base)
    b2 = roling.bounds(x0 + leah.width + gap, base)
    wb = union((0, 0, mono_w, mono_h), b1, b2)
    p = 8
    w = wb[2] - wb[0] + 2 * p
    h = wb[3] - wb[1] + 2 * p
    dx, dy = -wb[0] + p, -wb[1] + p
    body = (
        f'<g transform="translate({dx:.2f} {dy:.2f})">'
        f'<g transform="scale({s})">{monogram_body(c_arch, c_l, c_r, c_key)}</g>'
        f'<path fill="{c1}" d="{leah.path(x0, base)}"/>'
        f'<path fill="{c2}" d="{roling.path(x0 + leah.width + gap, base)}"/></g>'
    )
    save(fname, svg(w, h, body, title))


# ---- Seal ---------------------------------------------------------------
def seal(ring, text_color, arch, lc, rc, kc, fname, title,
         text="LEAH ROLING  ✦  COACH  ✦  AUTHOR  ✦  SPEAKER  ✦  "):
    size = 400
    c = size / 2
    r_text = 160
    text = text.replace("✦", "•")
    run = Run(text, sans(600), 21, tracking=0.0)
    glyphs = list(run.glyph_paths())
    natural = sum(a for _, a in glyphs)
    circumference = 2 * math.pi * r_text
    extra = (circumference - natural) / len(glyphs)
    parts = []
    phi = -math.pi / 2
    for d, adv in glyphs:
        step = adv + extra
        mid = phi + (step / 2) / r_text
        gx = c + r_text * math.cos(mid)
        gy = c + r_text * math.sin(mid)
        deg = math.degrees(mid) + 90
        if d:
            parts.append(
                f'<path fill="{text_color}" transform="translate({gx:.2f} {gy:.2f}) rotate({deg:.2f}) translate({-adv / 2:.2f} 0)" d="{d}"/>'
            )
        phi += step / r_text
    rings = (
        f'<circle cx="{c}" cy="{c}" r="{c - 6}" fill="none" stroke="{ring}" stroke-width="2"/>'
        f'<circle cx="{c}" cy="{c}" r="{r_text - 18}" fill="none" stroke="{ring}" stroke-width="1"/>'
    )
    ms = 0.9
    mono = (
        f'<g transform="translate({c - AW * ms / 2:.2f} {c - AH * ms / 2 + 4:.2f}) scale({ms})">'
        f"{monogram_body(arch, lc, rc, kc)}</g>"
    )
    save(fname, svg(size, size, rings + "".join(parts) + mono, title))


# ---- Signature ----------------------------------------------------------
def signature(color, fname, title, text="Leah"):
    run = Run(text, script(), 200)
    b = run.bounds(0, 200)
    p = 12
    w = b[2] - b[0] + 2 * p
    h = b[3] - b[1] + 2 * p
    body = f'<path fill="{color}" transform="translate({-b[0] + p:.2f} {-b[1] + p:.2f})" d="{run.path(0, 200)}"/>'
    save(fname, svg(w, h, body, title))


if __name__ == "__main__":
    print("Building Leah Roling logo suite →", OUT)
    # Primary wordmark
    wordmark(GARNET, INK, "leah-roling-wordmark-primary.svg", "Leah Roling")
    wordmark(INK, INK, "leah-roling-wordmark-ink.svg", "Leah Roling")
    wordmark(LINEN, LINEN, "leah-roling-wordmark-linen.svg", "Leah Roling")
    wordmark(BRASS, LINEN, "leah-roling-wordmark-reverse.svg", "Leah Roling")
    # Stacked w/ descriptor
    wordmark_stacked(GARNET, INK, INK, "leah-roling-wordmark-stacked.svg", "Leah Roling — Coach, Author, Speaker")
    wordmark_stacked(BRASS, LINEN, LINEN, "leah-roling-wordmark-stacked-reverse.svg", "Leah Roling — Coach, Author, Speaker")
    # Monogram
    monogram(INK, GARNET, INK, BRASS, "leah-roling-monogram.svg", "Leah Roling monogram")
    monogram(LINEN, BRASS, LINEN, BRASS, "leah-roling-monogram-reverse.svg", "Leah Roling monogram")
    monogram(GARNET, GARNET, GARNET, GARNET, "leah-roling-monogram-garnet.svg", "Leah Roling monogram")
    monogram_filled(GARNET, LINEN, "leah-roling-icon.svg", "Leah Roling icon")
    monogram_filled(INK, LINEN, "leah-roling-icon-ink.svg", "Leah Roling icon")
    # Lockup
    lockup(INK, GARNET, INK, BRASS, GARNET, INK, "leah-roling-lockup.svg", "Leah Roling")
    lockup(LINEN, BRASS, LINEN, BRASS, BRASS, LINEN, "leah-roling-lockup-reverse.svg", "Leah Roling")
    # Seal
    seal(GARNET, GARNET, INK, GARNET, INK, BRASS, "leah-roling-seal.svg", "Leah Roling seal")
    seal(BRASS, LINEN, LINEN, BRASS, LINEN, BRASS, "leah-roling-seal-reverse.svg", "Leah Roling seal")
    # Signature
    signature(INK, "leah-signature.svg", "Leah signature")
    signature(GARNET, "leah-signature-garnet.svg", "Leah signature")
    signature(LINEN, "leah-signature-linen.svg", "Leah signature")
    print("done")
