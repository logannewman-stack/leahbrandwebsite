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
| `brand/COPY-SOURCES.md` | **Where every line of site copy comes from**, and what Leah should approve |
| `brand/logos/` | 16 logo files as outlined SVG, plus 2400px transparent PNGs in `png/` |
| `brand/social/` | Instagram post/story, book launch, podcast and LinkedIn templates |
| `brand/email-signature.html` | Paste-ready email signature |
| `brand/ui-ux-overview/` | **UI & UX overview.** A walkthrough of how the site works and why (open `index.html`) |
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

The site speaks in Leah's first-person voice and uses her own published wording
wherever it could. `brand/COPY-SOURCES.md` lists every line and marks it as hers,
edited, or written for her.

- [ ] **Lines written for her.** Read the rows marked *Written for her* in
      `brand/COPY-SOURCES.md` and approve or replace them
- [ ] **Her story.** The story section uses what she published about her father on her
      own site. Confirm she wants it here too
- [ ] **Faith section**, including the Ephesians 2:10 verse. These lines were written
      and chosen for her
- [ ] **Family details.** Husband's and sons' names are left out on purpose
- [ ] **Numbers.** Her own pages disagree on years of experience and client counts.
      The site uses "15+ years coaching" and "8+ coach certifications" from her
      coaching page
- [ ] **Client quotes.** Three quotes with initials come from the "Client Stories" on
      her current About page. Confirm she still has permission to use them
- [ ] **Contact email.** The site uses `leahtfl@gmail.com` (the address on her current
      site). A domain address would look more polished
- [ ] **Contact form.** By default it opens the visitor's email app. To receive messages
      straight to an inbox, create a free form at https://formspree.io and paste the
      endpoint into `formEndpoint` at the top of `assets/js/main.js`
- [ ] **Book links.** *Replaceable* and *No One Is Coming to Save You* link to their
      Amazon pages; *SHIFT* and *Return on Life* link to Amazon searches
- [ ] **Domain.** `canonical` uses `leahrolingcoaching.com`

## Out of date

The website is now black and white with one violet accent. These still show the earlier yellow and lilac
look and the earlier wording, and have not been rebuilt:

- `brand/Leah-Roling-Brand-Book.pdf` and `brand/source/brand-book.html`
- `brand/social/` and `brand/source/social.html`
- `brand/email-signature.html`
- `brand/ui-ux-overview/`
- `brand/BRAND-STRATEGY.md` (the color and type sections)

## Editing

- **Words:** all copy lives in `index.html`, in clearly commented sections (HERO, ROLES, STORY…).
- **Email, form and social links:** the `CONFIG` block at the top of `assets/js/main.js`.
- **Colors and type:** CSS variables at the top of `assets/css/styles.css`. Each section sets a few
  context variables (`--fg`, `--muted`, `--card`…) and the parts inside read from them.
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

To refresh the UI & UX overview after changing the site:

```bash
node brand/source/capture_overview.js && python3 brand/source/stitch_overview.py
```

```bash
python3 brand/source/build_overview.py
```

Add `--pages` to the brand book command to also write page previews to `brand/source/preview/`.

## Credits

- Website typefaces: [Geist and Geist Mono](https://fonts.google.com/specimen/Geist) and
  [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif), all under the SIL Open Font License.
  The logo wordmark is drawn in [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque),
  and the signature in [Mrs Saint Delafield](https://fonts.google.com/specimen/Mrs+Saint+Delafield).
- Photography and the *SHIFT* / *Return on Life* covers come from Leah's existing websites.
