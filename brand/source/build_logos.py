"""
Leah Roling — logo suite generator ("The Open Door").

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
INK = "#17161B"
PAPER = "#FFFDF8"
SUN = "#FFC933"
LILAC = "#C8B6FF"
BUTTER = "#FFF0BF"
LAVENDER = "#F0EBFF"

# ---- Font instancing -----------------------------------------------------
_cache = {}


def font(name, **axes):
    key = (name, tuple(sorted(axes.items())))
    if key in _cache:
        return _cache[key]
    path = os.path.join(FONTS, name)
    if not os.path.exists(path):
        path = os.path.join(ROOT, "brand", "source", name)
    tt = TTFont(path)
    if "fvar" in tt and axes:
        tt = instancer.instantiateVariableFont(tt, axes)
    buf = io.BytesIO()
    tt.flavor = None
    tt.save(buf)
    data = buf.getvalue()
    tt = TTFont(io.BytesIO(data))
    _cache[key] = (tt, hb.Font(hb.Face(data)))
    return _cache[key]


class Run:
    """A shaped run of text that can be drawn as SVG path data."""

    def __init__(self, text, fnt, size, tracking=0.0):
        self.tt, self.hb = fnt
        self.upm = self.tt["head"].unitsPerEm
        self.scale = size / self.upm
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {"kern": True, "liga": True})
        order = self.tt.getGlyphOrder()
        self.glyphs = []
        x = 0
        track = tracking * self.upm
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            self.glyphs.append((order[info.codepoint], x + pos.x_offset, pos.y_offset, pos.x_advance))
            x += pos.x_advance + track
        self.width = (x - (track if self.glyphs else 0)) * self.scale

    def _draw(self, pen, x0, y0):
        gs = self.tt.getGlyphSet()
        for name, gx, gy, _ in self.glyphs:
            gs[name].draw(TransformPen(pen, (self.scale, 0, 0, -self.scale, x0 + gx * self.scale, y0 - gy * self.scale)))

    def path(self, x0, y0):
        pen = SVGPathPen(self.tt.getGlyphSet())
        self._draw(pen, x0, y0)
        return pen.getCommands()

    def bounds(self, x0, y0):
        bp = BoundsPen(self.tt.getGlyphSet())
        self._draw(bp, x0, y0)
        return bp.bounds

    def glyph_paths(self):
        gs = self.tt.getGlyphSet()
        for name, _, _, adv in self.glyphs:
            pen = SVGPathPen(gs)
            gs[name].draw(TransformPen(pen, (self.scale, 0, 0, -self.scale, 0, 0)))
            yield pen.getCommands(), adv * self.scale


def display(w=700):
    return font("bricolage-grotesque.woff2", wght=w, opsz=96, wdth=100)


def sans(w=600):
    return font("instrument-sans-roman.woff2", wght=w, wdth=100)


def script():
    return font("script-mrs-saint-delafield.woff2")


# ---- SVG helpers ---------------------------------------------------------
def svg(w, h, body, title, defs=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" '
        f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">\n'
        f"<title>{title}</title>\n{('<defs>' + defs + '</defs>') if defs else ''}{body}\n</svg>\n"
    )


def save(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)
    print("  wrote", name)


def union(*bs):
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))


# ---- The Open Door mark ---------------------------------------------------
# A doorway (arch) with the sun rising inside it: a new day, the becoming self.
MW, MH = 200, 260
DOOR = "M10 260V100a90 90 0 0 1 180 0v160z"
SUN_CX, SUN_CY, SUN_R = 100, 212, 60
_uid = [0]


def mark_body(door, sun, cutout=False):
    """Returns (defs, body). cutout=True punches the sun out of the door (one-color use)."""
    _uid[0] += 1
    cid = f"door{_uid[0]}"
    defs = f'<clipPath id="{cid}"><path d="{DOOR}"/></clipPath>'
    if cutout:
        circle = f"M{SUN_CX - SUN_R} {SUN_CY}a{SUN_R} {SUN_R} 0 1 0 {2 * SUN_R} 0a{SUN_R} {SUN_R} 0 1 0 {-2 * SUN_R} 0z"
        body = f'<g clip-path="url(#{cid})"><path fill-rule="evenodd" fill="{door}" d="{DOOR} {circle}"/></g>'
    else:
        body = (
            f'<path d="{DOOR}" fill="{door}"/>'
            f'<g clip-path="url(#{cid})"><circle cx="{SUN_CX}" cy="{SUN_CY}" r="{SUN_R}" fill="{sun}"/></g>'
        )
    return defs, body


def mark(door, sun, fname, title, cutout=False):
    defs, body = mark_body(door, sun, cutout)
    save(fname, svg(MW, MH, body, title, defs))


# ---- Wordmark: "leah roling." -------------------------------------------
def wordmark_parts(size=100):
    run = Run("leah roling", display(700), size, tracking=-0.032)
    b = run.bounds(0, size)
    dot_r = size * 0.105
    dot_cx = b[2] + size * 0.035 + dot_r
    dot_cy = size - dot_r  # sits on the baseline
    return run, b, (dot_cx, dot_cy, dot_r)


def wordmark(text_color, dot_color, fname, title, pad=0.07):
    size = 100
    run, b, (dx_, dy_, r) = wordmark_parts(size)
    bx = union(b, (dx_ - r, dy_ - r, dx_ + r, dy_ + r))
    p = size * pad
    w, h = bx[2] - bx[0] + 2 * p, bx[3] - bx[1] + 2 * p
    tx, ty = -bx[0] + p, -bx[1] + p
    body = (
        f'<g transform="translate({tx:.2f} {ty:.2f})">'
        f'<path fill="{text_color}" d="{run.path(0, size)}"/>'
        f'<circle cx="{dx_:.2f}" cy="{dy_:.2f}" r="{r:.2f}" fill="{dot_color}"/></g>'
    )
    save(fname, svg(w, h, body, title))


def wordmark_stacked(text_color, dot_color, desc_color, fname, title, descriptor="COACH  ·  AUTHOR  ·  SPEAKER"):
    size = 100
    run, b, (dx_, dy_, r) = wordmark_parts(size)
    wb = union(b, (dx_ - r, dy_ - r, dx_ + r, dy_ + r))
    desc = Run(descriptor, sans(600), size * 0.15, tracking=0.3)
    dbase = wb[3] + size * 0.36
    dxd = wb[0] + ((wb[2] - wb[0]) - desc.width) / 2
    bx = union(wb, desc.bounds(dxd, dbase))
    p = size * 0.08
    w, h = bx[2] - bx[0] + 2 * p, bx[3] - bx[1] + 2 * p
    tx, ty = -bx[0] + p, -bx[1] + p
    body = (
        f'<g transform="translate({tx:.2f} {ty:.2f})">'
        f'<path fill="{text_color}" d="{run.path(0, size)}"/>'
        f'<circle cx="{dx_:.2f}" cy="{dy_:.2f}" r="{r:.2f}" fill="{dot_color}"/>'
        f'<path fill="{desc_color}" d="{desc.path(dxd, dbase)}"/></g>'
    )
    save(fname, svg(w, h, body, title))


# ---- Lockup: mark + wordmark ---------------------------------------------
def lockup(door, sun, text_color, dot_color, fname, title):
    size = 100
    run, b, (dx_, dy_, r) = wordmark_parts(size)
    # mark height matches cap-to-baseline of the wordmark (x-height + ascender ≈ b height)
    text_h = b[3] - b[1]
    s = (text_h * 1.05) / MH
    mw = MW * s
    gap = size * 0.26
    x0 = mw + gap
    mark_top = b[1] + (text_h - MH * s) / 2 - text_h * 0.02
    defs, mb = mark_body(door, sun)
    bx = union((0, mark_top, mw, mark_top + MH * s), (x0 + b[0], b[1], x0 + dx_ + r, b[3]))
    p = 6
    w, h = bx[2] - bx[0] + 2 * p, bx[3] - bx[1] + 2 * p
    tx, ty = -bx[0] + p, -bx[1] + p
    body = (
        f'<g transform="translate({tx:.2f} {ty:.2f})">'
        f'<g transform="translate(0 {mark_top:.2f}) scale({s:.5f})">{mb}</g>'
        f'<path fill="{text_color}" d="{run.path(x0, size)}"/>'
        f'<circle cx="{x0 + dx_:.2f}" cy="{dy_:.2f}" r="{r:.2f}" fill="{dot_color}"/></g>'
    )
    save(fname, svg(w, h, body, title, defs))


# ---- Seal ---------------------------------------------------------------
def seal(ring, text_color, door, sun, fname, title,
         text="LEAH ROLING  •  COACH  •  AUTHOR  •  SPEAKER  •  "):
    size = 400
    c = size / 2
    r_text = 158
    run = Run(text, sans(650), 22)
    glyphs = list(run.glyph_paths())
    natural = sum(a for _, a in glyphs)
    extra = (2 * math.pi * r_text - natural) / len(glyphs)
    parts, phi = [], -math.pi / 2
    for d, adv in glyphs:
        step = adv + extra
        mid = phi + (step / 2) / r_text
        gx, gy = c + r_text * math.cos(mid), c + r_text * math.sin(mid)
        if d:
            parts.append(f'<path fill="{text_color}" transform="translate({gx:.2f} {gy:.2f}) rotate({math.degrees(mid) + 90:.2f}) translate({-adv / 2:.2f} 0)" d="{d}"/>')
        phi += step / r_text
    ring_svg = f'<circle cx="{c}" cy="{c}" r="{c - 4}" fill="none" stroke="{ring}" stroke-width="3"/>'
    ms = 0.82
    defs, mb = mark_body(door, sun)
    mono = f'<g transform="translate({c - MW * ms / 2:.2f} {c - MH * ms / 2:.2f}) scale({ms})">{mb}</g>'
    save(fname, svg(size, size, ring_svg + "".join(parts) + mono, title, defs))


# ---- Signature ----------------------------------------------------------
def signature(color, fname, title, text="Leah"):
    run = Run(text, script(), 200)
    b = run.bounds(0, 200)
    p = 12
    w, h = b[2] - b[0] + 2 * p, b[3] - b[1] + 2 * p
    body = f'<path fill="{color}" transform="translate({-b[0] + p:.2f} {-b[1] + p:.2f})" d="{run.path(0, 200)}"/>'
    save(fname, svg(w, h, body, title))


if __name__ == "__main__":
    print("Building Leah Roling logo suite →", OUT)
    for f in os.listdir(OUT):
        if f.endswith(".svg"):
            os.remove(os.path.join(OUT, f))
    # Wordmark
    wordmark(INK, SUN, "leah-roling-wordmark.svg", "leah roling")
    wordmark(PAPER, SUN, "leah-roling-wordmark-reverse.svg", "leah roling")
    wordmark(INK, INK, "leah-roling-wordmark-ink.svg", "leah roling")
    wordmark(PAPER, PAPER, "leah-roling-wordmark-white.svg", "leah roling")
    wordmark_stacked(INK, SUN, INK, "leah-roling-wordmark-stacked.svg", "leah roling — coach, author, speaker")
    wordmark_stacked(PAPER, SUN, PAPER, "leah-roling-wordmark-stacked-reverse.svg", "leah roling — coach, author, speaker")
    # The Open Door mark
    mark(LILAC, SUN, "leah-roling-mark.svg", "Leah Roling mark")
    mark(INK, SUN, "leah-roling-mark-ink.svg", "Leah Roling mark")
    mark(INK, None, "leah-roling-mark-mono.svg", "Leah Roling mark", cutout=True)
    mark(PAPER, None, "leah-roling-mark-white.svg", "Leah Roling mark", cutout=True)
    # Lockups
    lockup(LILAC, SUN, INK, SUN, "leah-roling-lockup.svg", "leah roling")
    lockup(LILAC, SUN, PAPER, SUN, "leah-roling-lockup-reverse.svg", "leah roling")
    # Seal
    seal(INK, INK, LILAC, SUN, "leah-roling-seal.svg", "Leah Roling seal")
    seal(PAPER, PAPER, LILAC, SUN, "leah-roling-seal-reverse.svg", "Leah Roling seal")
    # Signature
    signature(INK, "leah-signature.svg", "Leah signature")
    signature(PAPER, "leah-signature-white.svg", "Leah signature")
    print("done")
