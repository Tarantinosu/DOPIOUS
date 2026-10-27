# Service SEO pages

Run `python3 scripts/build-service-pages.py` after changing `index.html` or
`service-pages.json`. Commit the generated service directories, `index.html`
and `sitemap.xml`; GitHub Pages serves these files directly.

The manifest defines all 13 main services and subcategories with published work.
Each page has its own Thai/English copy, title, canonical URL, Service schema,
service scope and optional curated public projects. Do not invent portfolio
entries or copy drafts into the public selection. Only populated subcategories
get their own routes; other services can describe their actual service scope.

The live grid reads CMS posts and filters by the manifest's service and optional
subcategory via `seo-pages.js`. New posts within an existing category appear in
that grid without rebuilding the curated selection. The static selection is
editorial; update it in the manifest and rebuild when needed. A newly populated
subcategory needs a manifest entry and rebuild to gain its own indexable URL.

Navigation and sitemap are generated from the same manifest. Keep existing paths
stable. Rebuild twice to check repeatability; do not edit generated pages by hand.

With the static server on port 8000, run `node tests/seo-pages.cjs` using Playwright
and Chromium. Also run the existing language and bilingual-project browser checks.
