"""Stitches the slices from capture_overview.js and converts everything to WebP.
Run after:  node brand/source/capture_overview.js"""
import glob, json, os
from PIL import Image

d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ui-ux-overview", "img") + os.sep
slices = json.load(open(d + "_slices.json"))
groups = {}
for s in slices:
    groups.setdefault(s["name"], []).append(s["file"])
for name, files in groups.items():
    parts = [Image.open(d + f).convert("RGB") for f in files]
    out = Image.new("RGB", (parts[0].width, sum(p.height for p in parts)))
    y = 0
    for p in parts:
        out.paste(p, (0, y)); y += p.height
    out = out.resize((1440, round(out.height * 1440 / out.width)), Image.LANCZOS)
    out.save(d + name + ".webp", "WEBP", quality=80, method=6)
    for f in files:
        os.remove(d + f)
os.remove(d + "_slices.json")
for f in sorted(glob.glob(d + "*.png")):
    im = Image.open(f).convert("RGB"); n = os.path.basename(f)
    maxw = 780 if n.startswith("phone") else (984 if n.startswith("tablet") else 1440)
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(f[:-4] + ".webp", "WEBP", quality=80, method=6); os.remove(f)
files = sorted(glob.glob(d + "*.webp"))
print({os.path.basename(f)[:-5]: Image.open(f).size for f in files})
print("total KB", round(sum(os.path.getsize(f) for f in files) / 1024))
