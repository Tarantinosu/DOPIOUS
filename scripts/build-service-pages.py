"""Generate indexable service pages, navigation and sitemap for GitHub Pages.
Run after editing index.html, shared assets, or service-pages.json.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://www.dopiousdesign.com'
pages = json.loads((ROOT / 'service-pages.json').read_text())
main_pages = [p for p in pages if not p.get('category')]
paths = [p['path'] for p in pages]
assert len(paths) == len(set(paths)), 'Duplicate canonical routes'
assert len({p['title'] for p in pages}) == len(pages), 'Duplicate page titles'


def esc(value):
    return html.escape(str(value), quote=True)


def bilingual(th, en, tag='span'):
    return f'<{tag} data-content-language="th" lang="th">{esc(th)}</{tag}><{tag} data-content-language="en" lang="en">{esc(en)}</{tag}>'


# Genuine crawlable links to every main service and populated subcategory.
groups = []
for parent in main_pages:
    children = [p for p in pages if p.get('category') and p['service'] == parent['service']]
    links = ''.join(f'<a href="{esc(p["path"])}">{bilingual(p["heading"], p["headingEn"])}</a>' for p in children)
    groups.append(f'<div class="seo-service-group"><a class="seo-service-head" href="{esc(parent["path"])}">{bilingual(parent["heading"], parent["headingEn"])}</a>{links}</div>')
directory = '<!-- SERVICE DIRECTORY START -->\n<div class="seo-category-links seo-service-directory">' + ''.join(groups) + '</div>\n<!-- SERVICE DIRECTORY END -->'
index_path = ROOT / 'index.html'
base = index_path.read_text()

for page in pages:
    url = ORIGIN + page['path']
    projects = page['projects']
    image = projects[0]['image'] if projects else ORIGIN + '/favicon.png'
    output = re.sub(r'<title>.*?</title>', lambda _: '<title>' + esc(page['title']) + '</title>', base, count=1)
    metadata = [('name="description"', page['description']), ('property="og:title"', page['title']), ('property="og:description"', page['description']), ('property="og:url"', url), ('name="twitter:title"', page['title']), ('name="twitter:description"', page['description']), ('property="og:image"', image), ('name="twitter:image"', image)]
    for attr, value in metadata:
        output = re.sub(r'(<meta ' + attr + r' content=")[^"]*', lambda m: m[1] + esc(value), output)
    output = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m[1] + url, output)
    output = output.replace('<body>', f'<body data-seo-service="{esc(page["service"])}" data-seo-category="{esc(page.get("category") or "")}">')
    output = re.sub(r'((?:src|href)=")((?:app|patch|language|project-languages|project-copy-th|detail-copy-th|seo-pages)\.js|style\.css|favicon\.png)', r'\1/\2', output)
    output = output.replace("location.href='admin.html", "location.href='/admin.html")
    output = re.sub(r'<a class="logo" href="#" onclick="[^"]*"', '<a class="logo" href="/"', output, count=1)

    cards = ''
    for project in projects:
        cards += f'<article class="seo-work"><a href="/?project={esc(project["id"])}#svc" data-project-id="{esc(project["id"])}"><img src="{esc(project["image"])}" alt="{esc(project["alt"])}" loading="lazy" width="960" height="640"><h3>{esc(project["name"])}</h3></a>{bilingual(project["th"], project["en"], "p")}</article>'
    selected = f'<section id="selected-work" class="seo-selected">{bilingual("ผลงานคัดสรร", "Selected projects", "h2")}<div class="seo-work-grid">{cards}</div></section>' if cards else ''
    topics = page.get('topics', [])
    scope = '<section class="seo-scope">' + bilingual('บริการในหมวดนี้', 'Service scope', 'h2') + '<ul>' + ''.join('<li>' + bilingual(t['th'], t['en']) + '</li>' for t in topics) + '</ul></section>' if topics else ''
    related = [p for p in pages if p['service'] == page['service'] and p['path'] != page['path']]
    related_html = '<aside class="seo-related">' + ''.join(f'<a href="{p["path"]}">{bilingual(p["heading"], p["headingEn"])} →</a>' for p in related) + '</aside>' if related else ''
    works_anchor = '#selected-work' if cards else '#svc'
    intro = f'''<main class="seo-landing">
<div class="seo-kicker">{esc(page['service'])}{(' / ' + esc(page['category'])) if page.get('category') else ''}</div>
{bilingual(page['heading'], page['headingEn'], 'h1')}
<div class="seo-lead">{bilingual(page['description'], page['descriptionEn'], 'p')}</div>
<div class="seo-actions"><button class="btn br" onclick="oSt()">{bilingual('ส่งบรีฟ / ขอใบเสนอราคา', 'Discuss your project')}</button><a class="btn bg2" href="{works_anchor}">{bilingual('ดูผลงานและบริการ', 'Explore work and services')}</a></div>
{scope}{selected}{related_html}
</main>'''
    output = output.replace('<header class="hero"', intro + '\n<header class="hero"')
    output = output.replace('  <div id="sG"></div>', directory + '\n  <div id="sG"></div>')
    page_schema = {'@type': 'CollectionPage' if projects else 'WebPage', '@id': url + '#page', 'url': url, 'name': page['title'], 'description': page['description'], 'inLanguage': ['th', 'en'], 'isPartOf': {'@id': ORIGIN + '/#website'}, 'about': {'@id': url + '#service'}}
    if projects:
        page_schema['mainEntity'] = {'@type': 'ItemList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'item': {'@type': 'CreativeWork', 'name': p['name'], 'image': p['image'], 'description': p['th']}} for i, p in enumerate(projects)]}
    schema = {'@context': 'https://schema.org', '@graph': [page_schema, {'@type': 'Service', '@id': url + '#service', 'name': page['heading'], 'serviceType': page['headingEn'], 'description': page['description'], 'provider': {'@type': 'Organization', 'name': 'DOPIOUS+', 'url': ORIGIN + '/'}, 'areaServed': {'@type': 'City', 'name': 'Bangkok', 'alternateName': 'กรุงเทพมหานคร'}}]}
    output = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda _: '<script type="application/ld+json">' + json.dumps(schema, ensure_ascii=False, indent=2).replace('<', '\\u003c') + '</script>', output, flags=re.S)
    target = ROOT / page['path'].strip('/') / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(output)

urls = ['/'] + paths
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{ORIGIN}{p}</loc><lastmod>2026-10-27</lastmod><changefreq>weekly</changefreq></url>\n' for p in urls) + '</urlset>\n'
(ROOT / 'sitemap.xml').write_text(sitemap)
print(f'Built {len(pages)} service pages, service directory and sitemap ({len(urls)} URLs)')
