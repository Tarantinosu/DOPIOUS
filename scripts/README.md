# Service SEO pages

Run `python3 scripts/build-service-pages.py` after changing the shared `index.html`
or the curated copy in `service-pages.json`. Commit the generated
`space-design/retail/index.html` and `space-design/vm-display/index.html` files:
GitHub Pages serves them directly, with crawlable Thai text and selected work.

The live works grid reads the CMS and filters to each page's category through
`seo-pages.js`. New posts in Space Design / Retail or VM / Display appear in that
grid without rebuilding the curated selection. The selection is editorial and
is updated in `service-pages.json`. Never edit project IDs or fabricate projects.

Check locally with the static server on port 8000 and `node tests/seo-pages.cjs`.
The test uses Playwright and Chromium, as do the other browser checks.
