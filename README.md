# Florian Kämpf - Personal Scientific Website

A minimal, dark-themed personal academic website with a sliding drawer navigation pattern.

## Structure

```
website/
├── index.html      # Main HTML structure
├── styles.css      # All styling (CSS variables, layout, components)
├── script.js       # Drawer interaction logic
├── portrait.jpg    # Profile photo (add your own)
└── README.md       # This file
```

## Design Decisions

### Layout
- **Profile card** (left): Fixed, always visible. Contains photo, name, social links, and navigation.
- **Content drawer** (right): Slides in when a nav item is clicked. Single drawer pattern — only one section visible at a time.

### Colors
- Dark background: `#0d0d0d` / `#1a1a1a`
- Moss green accent: `#6b7a5c` (used for active states, links, section headers)
- All colors defined as CSS variables in `:root` for easy customization

### Typography
- IBM Plex Sans (body) + IBM Plex Serif (headings)
- Loaded from Google Fonts

### Interaction
- Click nav item → drawer slides open with that section
- Click same nav item again → drawer closes
- Click × or press Escape → drawer closes
- Click outside drawer → drawer closes

## To Do / Customization

### Content to update:
1. **portrait.jpg** — Add your profile photo
2. **Research section** — Update research description
3. **Publications** — Add your actual publications with correct titles, authors, journals, DOIs
4. **Talks** — Add conference talks
5. **CV** — Fill in education, experience, awards, etc.
6. **Social links** — Update href attributes with actual profile URLs
7. **Page title** — Already set to "Florian Kämpf | Neuroscience Research"

### Potential enhancements:
- [ ] Add a subtle background image/pattern behind profile card (microscope imagery?)
- [ ] Add Google Scholar link to social icons
- [ ] Add ORCID link
- [ ] Implement PDF viewer for CV or link to downloadable PDF
- [ ] Add publication abstracts as expandable accordions
- [ ] Add dark/light mode toggle (though dark fits the aesthetic)
- [ ] Add subtle hover animations on publications
- [ ] Mobile navigation refinements

### Deployment options:
- GitHub Pages (free, easy)
- Netlify (free tier available)
- Personal domain via any static host

## Development

Just open `index.html` in a browser. No build step required.

For local development with live reload, you can use:
```bash
# Python
python -m http.server 8000

# Node.js (if you have it)
npx serve
```

## Color Customization

To change the accent color, modify `--accent` and `--accent-hover` in the `:root` block of `styles.css`:

```css
:root {
    --accent: #6b7a5c;           /* Change this */
    --accent-hover: #7d8f6b;     /* And this */
    --accent-subtle: rgba(107, 122, 92, 0.15);  /* Update RGB values */
}
```

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). Uses CSS Grid, Flexbox, and CSS custom properties.
# website
