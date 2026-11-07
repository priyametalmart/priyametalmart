"""Slowly reads reference product pages into source-data/reference/scraped.json. Resumable; honours 429 Retry-After."""
import json,re,sys,time,pathlib,urllib.request,urllib.error
from urllib.parse import unquote
R=pathlib.Path(__file__).resolve().parent.parent; OUT=R/'source-data/reference/scraped.json'; DELAY=6
slug=lambda h:re.sub(r'-+','-',re.sub(r'[^a-z0-9-]','',unquote(h).lower())).strip('-')
num=lambda s:float(s.replace(',',''))
def parse(handle,h):
    i=h.index('class="price'); b=h[i:i+2500]
    reg=re.search(r'<s class="price-item price-item--regular">\s*Rs\.\s*([\d,.]+)',b)
    sale=re.search(r'price-item--sale[^>]*>\s*Rs\.\s*([\d,.]+)',b)
    offers=[]
    for m in re.finditer(r'<script type="application/ld\+json">\s*(.*?)</script>',h,re.S):
        try:d=json.loads(m[1])
        except ValueError: continue
        for g in ([d] if d.get('@type')=='Product' else d.get('hasVariant',[]) if d.get('@type')=='ProductGroup' else []):
            o=g.get('offers',[]); offers+=o if isinstance(o,list) else [o]
    if not offers: raise ValueError('no offers')
    v=[dict(price=f"{float(o['price']):.2f}",available='InStock' in o.get('availability',''),compare_at_price=None) for o in offers]
    if reg and sale:
        for x in v:
            if float(x['price'])==num(sale[1]): x['compare_at_price']=f"{num(reg[1]):.2f}"
    return dict(handle=handle,variants=v)
def main():
    live={p['handle'] for p in json.load(open(R/'web/src/data/catalog.json'))['products']}
    raw=[unquote(x) for x in re.findall(r'<loc>https://santhimetaleshop.in/products/([^<]+)</loc>',open(R/'source-data/raw/sitemap_products.xml').read())]
    from urllib.parse import quote
    todo=[x for x in raw if slug(x) in live]; done=json.load(open(OUT))['products'] if OUT.exists() else []
    seen={d['handle'] for d in done}; todo=[x for x in todo if slug(x) not in seen]; fails=[]; blocked=0
    print('todo',len(todo),flush=True)
    for x in todo:
        while True:
            try:
                h=urllib.request.urlopen('https://santhimetaleshop.in/products/'+quote(x),timeout=30).read().decode('utf8','ignore'); blocked=0
                done.append(parse(slug(x),h)); OUT.write_text(json.dumps(dict(products=done),ensure_ascii=False)); break
            except urllib.error.HTTPError as e:
                if e.code==429:
                    blocked+=1
                    if blocked>=3: print('stopped: repeated 429',len(done),flush=True); sys.exit(2)
                    time.sleep(int(e.headers.get('Retry-After') or 60)+5); continue
                fails.append((x,e.code)); break
            except Exception as e: fails.append((x,str(e))); break
        time.sleep(DELAY)
    print('done',len(done),'fails',fails,flush=True)
if __name__=='__main__': main()
