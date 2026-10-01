# Invoice Generator

A lightweight, zero-backend, client-side invoice generator built with Alpine.js and htmx.

## Features

- Dynamic line items with real-time calculation
- Tax and discount adjustments
- Live invoice preview
- Print / Save as PDF via browser print
- Auto-save to localStorage
- Responsive two-column layout
- Clean print stylesheet (A4 optimized)

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, `@media print`
- **Alpine.js 3.x** — Reactive state management
- **htmx 1.9.x** — UI event orchestration

## Getting Started

Open `index.html` in a browser. No build step required.

### Development

```bash
npm install
npx html-validate index.html
npx stylelint "css/**/*.css"
```

## CI/CD

GitHub Actions runs on every push and PR:
- **html-validate** — Validates HTML structure
- **stylelint** — Lints CSS
- **deploy** — Deploys to GitHub Pages on merge to `main`

## License

MIT
