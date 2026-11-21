# Leah Roling: Personal Brand Kit

Everything for Leah Roling's personal brand: a brand strategy, a full identity system,
a 31-page brand book, social templates and a fast personal website.

> **Learn it. Live it. Lead it.**

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

## The site at a glance

A speaker-style single page on charcoal and black, with one violet accent and a wide,
heavy headline typeface. From top to bottom:

1. **Hero:** "Learn it. Live it. Lead it." beside her portrait
2. **Client quote** over a darkened room photo
3. **Seen and heard at:** the stages and shows that list her
4. **Scroll lines:** six of her lines that fade in one at a time as you scroll
5. **"There are tools for this."**
6. **Hi, I'm Leah:** her story
7. **Stage band:** three of her beliefs under stage lights
8. **Proof:** her numbers and three results
9. **How I work:** four blocks and a strategy call button
10. **The Becoming You Show**
11. **STEAR:** her five-part self-leadership model, one block per letter
12. **Speaking topics:** four talks, each with a "Check availability" button
13. **Second client quote**
14. ***Replaceable*** and the other three books
15. **Work with me:** four doorways
16. **Free guides**
17. **Contact form**, then a closing call-to-action band and the footer

## Earlier versions

Two earlier looks are saved in the project history at commit `3837032`: the black and
white site with floating cards, and an emerald green colour mockup of it. Ask Claude
to bring either one back.

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
- [ ] **Her story.** A shortened version of what she published on her own site. The
      part about her father is left out
- [ ] **STEAR.** The five names are hers. The one-line description under each letter
      was written for her
- [ ] **Faith.** It appears only as the word "Believer" under her story. Add more if
      she wants it
- [ ] **Family details.** Husband's and sons' names are left out on purpose
- [ ] **Numbers.** Her own pages disagree on years of experience and client counts.
      The site uses "15+ years" from her coaching page
- [ ] **Client quotes.** Two quotes with initials come from the "Client Stories" on
      her current About page. Confirm she still has permission to use them
- [ ] **"Seen and heard at."** The five names are set as plain text. Swap in real
      logos only with permission
- [ ] **Episodes.** Three recent episodes are named in the show section. Update them
      now and then
- [ ] **Contact email.** The site uses `leahtfl@gmail.com` (the address on her current
      site). A domain address would look more polished
- [ ] **Contact form.** By default it opens the visitor's email app. To receive messages
      straight to an inbox, create a free form at https://formspree.io and paste the
      endpoint into `formEndpoint` at the top of `assets/js/main.js`
- [ ] **Book links.** *Replaceable* and *No One Is Coming to Save You* link to their
      Amazon pages; *SHIFT* and *Return on Life* link to Amazon searches
- [ ] **Domain.** `canonical` uses `leahrolingcoaching.com`

## Out of date

The website is now a charcoal and violet speaker-style page. These still show the earlier yellow and lilac
look and the earlier wording, and have not been rebuilt:

- `brand/Leah-Roling-Brand-Book.pdf` and `brand/source/brand-book.html`
- `brand/social/` and `brand/source/social.html`
- `brand/email-signature.html`
- `brand/ui-ux-overview/`
- `brand/BRAND-STRATEGY.md` (the color and type sections)
- `brand/logos/` (the site header now sets her name in the headline typeface instead of using these files)

## Editing

- **Words:** all copy lives in `index.html`. Each section has a plain class name
  (`hero`, `quote`, `seen`, `pin`, `meet`, `proof`, `show`, `stear`, `talks`, `book`,
  `work`, `guides`, `contact`).
- **Email and form:** the `CONFIG` block at the top of `assets/js/main.js`. Social links
  are in the footer of `index.html`.
- **Colors and type:** the variables in `:root` near the top of `assets/css/styles.css`.
  Change `--violet` and `--violet-hi` to try another accent.
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

- Website typefaces: [Archivo](https://fonts.google.com/specimen/Archivo) (the expanded
  extra-bold cut, for headlines) and [Geist](https://fonts.google.com/specimen/Geist),
  both under the SIL Open Font License. The brand kit files also use Geist Mono,
  Instrument Serif, [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)
  and [Mrs Saint Delafield](https://fonts.google.com/specimen/Mrs+Saint+Delafield).
- Photography and the *SHIFT* / *Return on Life* covers come from Leah's existing websites.
