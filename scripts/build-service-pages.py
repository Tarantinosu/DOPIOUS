"""Rebuild crawlable Retail / VM pages from shared index.html and curated public copy."""
import json,re,html
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
base=(ROOT/'index.html').read_text()
config=json.loads((ROOT/'service-pages.json').read_text())
for page in config:
 url='https://www.dopiousdesign.com'+page['path']
 output=base
 output=re.sub(r'<title>.*?</title>','<title>'+html.escape(page['title'])+'</title>',output,count=1)
 for attr,value in [('name="description"',page['description']),('property="og:title"',page['title']),('property="og:description"',page['description']),('property="og:url"',url),('name="twitter:title"',page['title']),('name="twitter:description"',page['description']),('property="og:image"',page['projects'][0]['image']),('name="twitter:image"',page['projects'][0]['image'])]:
  output=re.sub(r'(<meta '+attr+r' content=")[^"]*',lambda m:m[1]+html.escape(value,quote=True),output)
 output=re.sub(r'(<link rel="canonical" href=")[^"]*',lambda m:m[1]+url,output)
 output=output.replace('<body>','<body data-seo-category="'+html.escape(page['category'],quote=True)+'">')
 # The full app still handles CMS updates, localized copy, menus, and detail overlays.
 output=re.sub(r'((?:src|href)=")((?:app|patch|language|project-languages|project-copy-th|detail-copy-th|seo-pages)\.js|style\.css|favicon\.png)',r'\1/\2',output)
 output=output.replace("location.href='admin.html", "location.href='/admin.html")
 output=re.sub(r'<a class="logo" href="#" onclick="[^"]*"', '<a class="logo" href="/"', output, count=1)
 cards=''
 for project in page['projects']:
  cards+='<article class="seo-work"><a href="/?project='+project['id']+'#svc" data-project-id="'+project['id']+'"><img src="'+html.escape(project['image'],quote=True)+'" alt="'+html.escape(project['alt'],quote=True)+'" loading="lazy" width="960" height="640"><h3>'+html.escape(project['name'])+'</h3></a><p data-content-language="th" lang="th">'+html.escape(project['th'])+'</p><p data-content-language="en" lang="en">'+html.escape(project['en'])+'</p></article>'
 other=next(x for x in config if x['path']!=page['path'])
 intro='''<main class="seo-landing">
 <div class="seo-kicker">SPACE DESIGN / '''+html.escape(page['category'].upper())+'''</div>
 <h1 data-content-language="th" lang="th">'''+html.escape(page['heading'])+'''</h1>
 <h1 data-content-language="en" lang="en">'''+html.escape(page['headingEn'])+'''</h1>
 <p class="seo-lead" data-content-language="th" lang="th">'''+html.escape(page['description'])+'''</p>
 <p class="seo-lead" data-content-language="en" lang="en">'''+html.escape(page['descriptionEn'])+'''</p>
 <div class="seo-actions"><button class="btn br" onclick="oSt()"><span data-content-language="th">ส่งบรีฟ / ขอใบเสนอราคา</span><span data-content-language="en">Discuss your project</span></button><a class="btn bg2" href="#selected-work"><span data-content-language="th">ดูผลงานจริง</span><span data-content-language="en">Selected work</span></a></div>
 <section id="selected-work" class="seo-selected"><h2 data-content-language="th">ผลงานคัดสรร</h2><h2 data-content-language="en">Selected projects</h2><div class="seo-work-grid">'''+cards+'''</div></section>
 <aside class="seo-related"><a href="'''+other['path']+'''">'''+html.escape(other['heading'])+''' →</a></aside>
 </main>'''
 output=output.replace('<header class="hero"',intro+'\n<header class="hero"')
 graph={'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','@id':url+'#page','url':url,'name':page['title'],'description':page['description'],'inLanguage':['th','en'],'isPartOf':{'@id':'https://www.dopiousdesign.com/#website'},'about':{'@id':url+'#service'},'mainEntity':{'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'item':{'@type':'CreativeWork','name':p['name'],'image':p['image'],'description':p['th']}} for i,p in enumerate(page['projects'])]}},{'@type':'Service','@id':url+'#service','name':page['heading'],'serviceType':page['headingEn'],'description':page['description'],'provider':{'@type':'Organization','name':'DOPIOUS+','url':'https://www.dopiousdesign.com/'},'areaServed':{'@type':'City','name':'Bangkok','alternateName':'กรุงเทพมหานคร'}}]}
 output=re.sub(r'<script type="application/ld\+json">.*?</script>','<script type="application/ld+json">'+json.dumps(graph,ensure_ascii=False,indent=2)+'</script>',output,flags=re.S)
 target=ROOT/page['path'].strip('/')/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(output)
 print('Built',target.relative_to(ROOT))
