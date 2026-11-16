# Elementum

**An interactive periodic table for the curious.**

[Live site](https://saifmahmud366.github.io/periodic-table/) · [Report an issue](https://github.com/SaifMahmud366/periodic-table/issues) · [Source code](https://github.com/SaifMahmud366/periodic-table)

Elementum is a responsive, single-page periodic table built with plain HTML, CSS, and JavaScript. It presents all 118 elements in a familiar eighteen-group layout, with separate inner-transition rows for the lanthanides and actinides. Search, filter by family, switch themes, and open any element for its full profile.

![HTML](https://img.shields.io/badge/HTML-5-e34f26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572b6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES5-f7df1e?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-AGPL--3.0-2ea44f)

## Features

- **All 118 elements** with atomic number, symbol, name, and atomic mass on every tile.
- **Live search** by name, symbol, or atomic number, with a `/` keyboard shortcut.
- **Family filtering** through the toolbar or the interactive color key. Non-matching tiles dim while the table keeps its shape.
- **Detailed element profiles** including atomic mass, group, period, block, category, electron configuration, electronegativity, melting and boiling points, density, discovery year and discoverer, and a curated fun fact.
- **Four visual themes** — Daylight, Dark, Cute & Cozy, and Professional. The selected theme is saved in `localStorage` and restored before first paint to avoid a flash of the wrong theme.
- **Responsive layout** for desktop, tablet, and phone. The table scrolls horizontally on narrow screens, with a visible swipe hint.
- **Accessible interactions** — keyboard-operable tiles, a focus-trapped modal, Escape-to-close, visible focus styles, ARIA labels, reduced-motion support, and a skip link. Lighthouse accessibility: **100**.
- **No build step and no backend.** The site runs directly from `index.html` or from GitHub Pages.

## Themes

| Theme | Character |
| --- | --- |
| **Daylight** | Bright, airy, and crisp with cool blue accents. |
| **Dark** | Deep navy surfaces, luminous accents, and low-glare category colors. |
| **Cute & Cozy** | Warm pastels, rounded Fredoka headings, and soft block-based colors without category coding. |
| **Professional** | Warm paper tones, restrained category colors, and editorial Fraunces headings. |

## Project structure

```text
periodic-table/
├── index.html
├── README.md
├── LICENSE
└── assets/
    ├── css/
    │   ├── style.css        # Layout, components, table, modal, motion
    │   ├── themes.css       # Theme palettes and category colors
    │   └── responsive.css   # Tablet and phone breakpoints
    ├── data/
    │   └── elements.json    # Portable 118-element dataset
    ├── fonts/
    │   ├── inter-latin.woff2
    │   ├── outfit-latin.woff2
    │   ├── fredoka-latin.woff2
    │   └── fraunces-latin.woff2
    ├── images/
    │   ├── logo.svg
    │   └── favicon.svg
    └── js/
        ├── data.js          # Runtime dataset (works from file://)
        ├── main.js          # Rendering, search, filtering, and modal
        └── theme.js         # Early theme restoration and switcher
```

## Run locally

There is nothing to install or build.

1. Clone the repository:

   ```bash
   git clone https://github.com/SaifMahmud366/periodic-table.git
   cd periodic-table
   ```

2. Open `index.html` in a browser.

For the most faithful preview, serve the folder over HTTP:

```bash
# Python 3
python -m http.server 8000

# then open http://localhost:8000/
```

The site was designed to work without a server as well. `assets/js/data.js` mirrors `assets/data/elements.json` so browsers that block local JSON requests can still render the table.

## Live demo

The site is published with GitHub Pages:

**https://saifmahmud366.github.io/periodic-table/**

To publish a fork, open **Settings → Pages**, set the source to **Deploy from a branch**, and choose the `main` branch and `/ (root)` folder.

## Data and credits

- Core element properties are adapted from [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON).
- Discovery years, discoverers, and fun facts were curated for this project.
- Fonts are self-hosted and licensed under the SIL Open Font License:
  - [Inter](https://fonts.google.com/specimen/Inter)
  - [Outfit](https://fonts.google.com/specimen/Outfit)
  - [Fredoka](https://fonts.google.com/specimen/Fredoka)
  - [Fraunces](https://fonts.google.com/specimen/Fraunces)
- Icons are inline SVG drawn for Elementum.

## License

Released under the [GNU Affero General Public License v3.0](LICENSE).

---

<div align="center">Powered by Coffee and made with love © 2026</div>
