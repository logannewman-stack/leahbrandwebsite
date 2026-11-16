"""Wraps brand/ui-ux-overview/page.html (the page body, also published as an artifact)
into a standalone brand/ui-ux-overview/index.html that opens in any browser.
Run: python3 brand/source/build_overview.py"""
import os

here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ui-ux-overview")
src = open(os.path.join(here, "page.html"), encoding="utf-8").read()
head, body = src.split("<!-- /head -->", 1)
html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<style>:root{{color-scheme:light}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
{head.strip()}
</head>
<body>
{body.strip()}
</body>
</html>
"""
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(html)
print("wrote brand/ui-ux-overview/index.html", round(len(html) / 1024), "KB")
