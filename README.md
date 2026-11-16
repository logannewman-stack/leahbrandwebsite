# Leah Roling: Personal Brand Kit

Everything for Leah Roling's personal brand: a brand strategy, a full identity system,
a 31-page brand book, social templates and a fast personal website.

> **Become who you were made to be.**

## What's inside

| Path | What it is |
|---|---|
| `index.html` | The website (single page, no build step, no dependencies) |
| `assets/` | Site CSS, JS, self-hosted fonts, optimized photos, icons |
| `brand/Leah-Roling-Brand-Book.pdf` | **The brand book.** Print it or send it as-is |
| `brand/BRAND-STRATEGY.md` | Positioning, voice, bios, palette and type in plain text |
| `brand/logos/` | 18 logo files as outlined SVG, plus 2400px transparent PNGs in `png/` |
| `brand/social/` | Instagram post/story, book launch, podcast and LinkedIn templates |
| `brand/email-signature.html` | Paste-ready email signature |
| `brand/source/` | Source files and scripts that regenerate everything above |

## Preview the site

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Put it online (free)

**Netlify (easiest):** go to https://app.netlify.com/drop and drag this whole folder onto the page.
Then add her domain under *Domain settings*.

**GitHub Pages:** in the repository go to *Settings → Pages → Build and deployment*, pick
*Deploy from a branch*, choose the branch and `/ (root)`, then save.

**Vercel:** import the repository. There's no build command; the output directory is the root.

## Before launch: confirm with Leah

- [ ] **Faith section wording**, including the Ephesians 2:10 verse, and how public she wants it
- [ ] **Family details.** Husband's and sons' names are left out on purpose; add them if she wants
- [ ] **Contact email.** The site uses `leahtfl@gmail.com` (the address on her current site). A domain
      address such as `leah@leahrolingcoaching.com` would look more polished
- [ ] **Contact form.** By default it opens the visitor's email app. To receive messages straight to
      an inbox, create a free form at https://formspree.io and paste the endpoint into `formEndpoint` at
      the top of `assets/js/main.js`
- [ ] **Book links.** *Replaceable* and *No One Is Coming to Save You* link to their Amazon pages;
      *SHIFT* and *Return on Life* link to Amazon searches. Swap in direct links if she has them
- [ ] **Replaceable cover.** The site and templates use a designed stand-in cover. Drop in the final
      art when it's ready
- [ ] **Domain.** `canonical` and the brand book mockups use `leahrolingcoaching.com`
- [ ] **Speaking and results claims.** The stats come from her own published pages ($280K → $1M+,
      1 → 5 locations, 81% / 18%); double-check she's comfortable featuring them

## Editing

- **Words:** all copy lives in `index.html`, in clearly commented sections (HERO, ROLES, STORY…).
- **Email, form and social links:** the `CONFIG` block at the top of `assets/js/main.js`.
- **Colors and type:** CSS variables at the top of `assets/css/styles.css`.
- **Photos:** `assets/img/`. Keep the same filenames, or update the `src`/`srcset` in `index.html`.

## Rebuilding brand assets

```bash
pip install fonttools uharfbuzz brotli
python3 brand/source/build_logos.py          # logos → brand/logos/*.svg
node brand/source/export_png.js              # PNG logos + favicons
python3 -m http.server 8765 &                # (needed for the next step)
node brand/source/build_og_and_shots.js      # share image + website screenshots
node brand/source/build_book.js              # social PNGs + brand book PDF
```

Add `--pages` to the last command to also write page previews to `brand/source/preview/`.

## Credits

- Typefaces: [Fraunces](https://fonts.google.com/specimen/Fraunces),
  [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) and
  [Mrs Saint Delafield](https://fonts.google.com/specimen/Mrs+Saint+Delafield), all under the SIL Open Font License.
- Photography and the *SHIFT* / *Return on Life* covers come from Leah's existing websites.
