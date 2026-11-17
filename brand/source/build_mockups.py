"""Builds colour mockups of the site from index.html, so content only lives in one place.

  emerald.html  — index.html with the emerald theme (assets/css/theme-emerald.css).
                  Open emerald.html#mint or emerald.html#violet to see the other accents.

Run:  python3 brand/source/build_mockups.py
Re-run after editing index.html to refresh the mockup.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def build_emerald():
    h = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()

    def rep(a, b, n=1):
        nonlocal h
        assert h.count(a) == n, (h.count(a), a[:70])
        h = h.replace(a, b)

    rep('<html lang="en">', '<html lang="en" data-theme="emerald">')
    rep(
        '  <link rel="stylesheet" href="assets/css/styles.css">\n',
        '  <link rel="stylesheet" href="assets/css/styles.css">\n'
        '  <link rel="stylesheet" href="assets/css/theme-emerald.css">\n'
        '  <meta name="robots" content="noindex">\n'
        "  <script>/* mockup only: emerald.html#mint or #violet shows the other accents */"
        '(function(){var a=location.hash.slice(1);if(a==="mint"||a==="violet")document.documentElement.setAttribute("data-accent",a);})();</script>\n',
    )
    rep('<meta name="theme-color" content="#060607">', '<meta name="theme-color" content="#043629">')
    # logo variants that carry the emerald mockup's colours
    rep('src="assets/img/leah-roling-lockup-violet-reverse.svg"', 'src="assets/img/leah-roling-lockup-emerald-reverse.svg"')
    rep('src="assets/img/leah-roling-seal-violet-reverse.svg"', 'src="assets/img/leah-roling-seal-emerald-reverse.svg"')
    rep('src="assets/img/leah-roling-wordmark-violet-reverse.svg"', 'src="assets/img/leah-roling-wordmark-emerald-reverse.svg"')
    rep('src="assets/img/leah-roling-mark-violet.svg"', 'src="assets/img/leah-roling-mark-emerald.svg"', n=2)
    out = os.path.join(ROOT, "emerald.html")
    open(out, "w", encoding="utf-8").write(h)
    print("wrote emerald.html", round(len(h) / 1024), "KB")


if __name__ == "__main__":
    build_emerald()
