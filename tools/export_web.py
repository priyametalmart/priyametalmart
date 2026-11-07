"""Exports catalog and home layout data for the Next.js storefront."""
import json,re,html,shutil,pathlib
R=pathlib.Path(__file__).resolve().parent.parent; C=json.load(open(R/'source-data/catalog.json'))
h=(R/'site/index.html').read_text(); m=h[h.find('<main'):h.find('</main>')]
def sec(k):
    i=m.find('__'+k); j=m.find('shopify-section-template',i+10); return m[i:j if j>0 else None]
hs=lambda s:list(dict.fromkeys(re.findall(r'href="/products/([^"/]+)/',s)))
raw=json.load(open(R/'source-data/raw/collections.json'))['collections']; img={}
for c in raw:
    if c.get('image'): img[c['handle']]='/images/'+re.sub(r'(?i)santhi','p',re.sub(r'[^\w.\-]','_',c['image']['src'].split('?')[0].split('/')[-1]))
for c in C['collections']: c['image']=img.get(c['handle'],'')
OWN=re.search(r"OWN=(\{.*?\n?\})\n",(R/'tools/build.py').read_text(),re.S)[1]
OWN=eval(OWN)
P=[('about-us','About Us'),('faq','FAQ'),('delivery-time','Delivery Time'),('payment-delivery-information','Payment & Delivery Information')]
out=dict(products=C['products'],collections=C['collections'],members=C['members'],
 home=dict(featured=hs(sec('featured_collection')),cutters=hs(sec('16578875054dcf567a'))),
 pages=[dict(handle=k,title=t,html=OWN[k]) for k,t in P])
from urllib.parse import unquote
slug=lambda h:re.sub(r'-+','-',re.sub(r'[^a-z0-9-]','',unquote(h).lower())).strip('-')
for p in out['products']: p['handle']=slug(p['handle'])
assert len({p['handle'] for p in out['products']})==len(out['products'])
out['members']={k:[slug(x) for x in v] for k,v in out['members'].items()}
for k in('featured','cutters'): out['home'][k]=[slug(x) for x in out['home'][k]]
out['home']['featured'].sort(key=lambda h:'cleaver' in h)
sold=[slug(re.search(r'href="/products/([^"/]+)/',c)[1]) for c in m.split('card-wrapper product-card-wrapper')[1:] if re.search(r'href="/products/',c) and re.search(r'>\s*Sold out\s*<',c[:9000])]
for p in out['products']: p['soldOut']=p['handle'] in sold
homeImg={};fromP=set()
for c in m.split('card-wrapper product-card-wrapper')[1:]:
    k=re.search(r'href="/products/([^"/]+)/',c)
    im=re.search(r'<img[^>]*src="(/images/[^"]+)"',c)
    if k and im: homeImg[slug(k[1])]=im[1]
    if k and re.search(r'From\s+Rs\.',c): fromP.add(slug(k[1]))
for p in out['products']:
    p['image']=homeImg.get(p['handle'],p['image'])
    if p['handle'] in fromP: p['fromPrice']=True
(R/'web/src/data/catalog.json').write_text(json.dumps(out,ensure_ascii=False))
# TRUTH: drop listings with another shop's branding, and correct collections and misleading names
hidden={slug(h) for h in json.load(open(R/'source-data/hidden_products.json'))}
out['products']=[p for p in out['products'] if p['handle'] not in hidden and p['image']]
live={p['handle'] for p in out['products']}
RULES={'knife':('knife|cleaver','vegetable c|scrap|flesh|chopper|coconut'),'brass-product-collection':('^brass','.'),'pooja-items':('pooja|puja|lamp|deepam|diya|agarbatti|incense|dhoop|manai|chowki|mukkali','murukku|chakli|idiyappam|sancha|sev |noodle|press|ammikal|grinder|aruvamanai|vegetable|cutter|chopper|ladle|karandi|spoon|scrap|boti'),'baby-products':('cradle|thottil|walker|nadavandi|toy|kids|jhula','slingshot|turmeric|grinder|ammikal'),'paniyaram-pan-paddu-pan':('paniyaram|paddu|appam|appe\\b|kuzhi','')}
tmap={p['handle']:p for p in out['products']}
for k,(inc,exc) in RULES.items():
    out['members'][k]=[h for h in out['members'].get(k,[])+[p['handle'] for p in out['products']] if h in tmap and re.search(inc,tmap[h]['title'],re.I) and not (exc and re.search(exc,tmap[h]['title'],re.I))]
    out['members'][k]=list(dict.fromkeys(out['members'][k]))
out['members']={k:[h for h in v if h in live] for k,v in out['members'].items()}
EXC={'paniyaram-pan-paddu-pan':r'murukku|chakli|janthikulu|sancha|\bsev\b|idiyappam|noodle|brush|skewer|kadai|wok|lemon|squeezer|tawa|stick',
     'iron-tawa':r'brush|grill|combo|phulka|roaster|masher|lemon|vegetable|press'}
for k,rx in EXC.items():
    out['members'][k]=[h for h in out['members'][k] if not re.search(rx,tmap[h]['title'],re.I) or (k=='paniyaram-pan-paddu-pan' and re.search('paniyaram|paddu|appe',tmap[h]['title'],re.I) and not re.search('murukku|chakli|sancha|idiyappam|noodle',tmap[h]['title'],re.I) and not re.search('brush|stick|skewer',tmap[h]['title'],re.I))]
for p in out['products']:
    if p['handle'].startswith('loha-lokhand-iron-tadka'): p['title']='Iron Tadka Ladle / Thalippu Karandi with Long Handle (480 g, 40 cm), Big Size'
out['home']['featured']=[h for h in out['home']['featured'] if h in live]
# REFERENCE PRICES: saved Shopify products.json pages in source-data/reference override the price, compare price and stock
ref={}
for f in sorted((R/'source-data/reference').glob('*.json')):
    for r in json.load(open(f))['products']: ref[slug(r['handle'])]=r
for p in out['products']:
    r=ref.get(p['handle'])
    if not r: continue
    v=r['variants']; a=[x for x in v if x.get('available',True)] or v; low=min(a,key=lambda x:float(x['price']))
    p['price']=float(low['price']); c=float(low.get('compare_at_price') or 0); p['compare']=c if c>p['price'] else None
    p['soldOut']=not any(x.get('available',True) for x in v)
    p.pop('fromPrice',None)
    if len({x['price'] for x in a})>1: p['fromPrice']=True
if ref: print('reference prices',sum(p['handle'] in ref for p in out['products']),'of',len(out['products']),'unmatched',len(set(ref)-{p['handle'] for p in out['products']}))
# STOCK-FREE: collections use their own product photos, and only product photos ship
byh={p['handle']:p for p in out['products']}
BEST={'iron-tawa':'dosa-tawa|iron-tawa','paniyaram-pan-paddu-pan':'paniyaram','pooja-items':'mukkali|chowki','knife':'kitchen-knife|knife-for-home|banana-knife','vegetable-cutter':'vegetable-cutter|scrap','baby-products':'nadavandi|walker','kitchen-essentials':'ladle|spoon|tong|tadka','sieve':'sieve|strainer','gardening-tool':'garden|hoe|spade','billhook':'billhook|aruval','mortar-and-pestle':'mortar','brass-product-collection':'brass','iron-kadai':'kadai','rat-trap':'trap'}
used=set()
for c in out['collections']:
    m_=[byh[h] for h in out['members'].get(c['handle'],[]) if byh.get(h,{}).get('image')]
    rx=BEST.get(c['handle'],'$^')
    pool=[p for p in m_ if re.search(rx,p['handle']) and p['image'] not in used] or [p for p in m_ if p['image'] not in used] or m_
    pick=next((p for p in pool if p['price']),pool[0] if pool else None)
    c['image']=pick['image'] if pick else ''; used.add(c['image'])
(R/'web/src/data/catalog.json').write_text(json.dumps(out,ensure_ascii=False))
d=R/'web/public/images'; shutil.rmtree(d,ignore_errors=True); d.mkdir()
for p in out['products']:
    if p['image']: shutil.copy(R/'site'/p['image'].lstrip('/'),d)
print(len(out['products']),sum(1 for c in out['collections'] if c['image']),len(list(d.iterdir())))
