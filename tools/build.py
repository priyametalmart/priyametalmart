"""Generates the static local preview in site/ from source-data/. Run: python3 -I tools/build.py"""
import re,json,html,shutil,pathlib,urllib.request,concurrent.futures as cf
R=pathlib.Path(__file__).resolve().parent.parent; RAW=R/'source-data/raw'; OUT=R/'site'; CACHE=R/'source-data/images'
BRAND='Priya Metal Mart'; EMAIL='hello@example.com'; CDN='https://cdn.shopify.com/s/files/1/0650/7128/4452/'
CACHE.mkdir(exist_ok=True); shutil.rmtree(OUT,ignore_errors=True); (OUT/'assets').mkdir(parents=True); (OUT/'images').mkdir()
for f in (R/'source-data/assets').iterdir():
    if f.suffix in('.css','.js'): shutil.copy(f,OUT/'assets')
shutil.copy(R/'tools/app.js',OUT/'assets')
need={}
def local(path):
    """path like files/x.png -> /images/x.png, queued for download"""
    path=html.unescape(path).split('?')[0]; n=re.sub(r'(?i)santhi','p',re.sub(r'[^\w.\-]','_',path.split('/')[-1])); need[n]=path; return '/images/'+n
def fetch(i):
    n,p=i; t=CACHE/n
    if not t.exists() or not t.stat().st_size:
        try:
            q=urllib.request.Request(CDN+p+'?width=1000',headers={'User-Agent':'priyametalmart-site-analysis/1.0'})
            t.write_bytes(urllib.request.urlopen(q,timeout=40).read())
        except Exception as e: print('img fail',p,e); return
    shutil.copy(t,OUT/'images'/n)
def clean(s):
    s=re.sub(r'<img\b[^>]*?>',lambda m:re.sub(r'\ssrcset="[^"]*"','',m[0],flags=re.S),s,flags=re.S)
    s=re.sub(r'\ssrcset="[^"]*"','',s,flags=re.S)
    s=re.sub(r'(?:https?:)?//(?:santhimetaleshop\.in/cdn/shop|cdn\.shopify\.com/s/files/1/0650/7128/4452)/((?:files|products|collections)/[^"\'\s)&?]+)(?:\?[^"\'\s)]*)?',lambda m:local(m[1]),s)
    s=re.sub(r'(?:https?:)?//santhimetaleshop\.in/cdn/shop/t/12/assets/([\w.\-]+)(\?[^"\'\s)]*)?',r'/assets/\1',s)
    s=re.sub(r'https?://santhimetaleshop\.in','',s)
    s=re.sub(r'https?://(?:www\.)?(?:facebook|youtube|instagram|twitter|x)\.com/[^"]*','#',s)
    s=re.sub(r'(?i)santhi\s*metal\s*e?-?\s*shop',BRAND,s); s=re.sub(r'(?i)santhimetaleshop',BRAND.replace(' ','').lower(),s); s=re.sub(r'(?i)santhi',"Priya",s)
    s=re.sub(r'[\w.+-]+@[\w-]+\.[\w.]+',EMAIL,s)
    s=re.sub(r'(?:\+91[\s-]*)?\b[6-9]\d{4}[\s-]?\d{5}\b','+91 00000 00000',s)
    s=re.sub(r'(?<!\d)(?:\+?91[\s-]*)?[6-9]\d{9}(?!\d)','+91 00000 00000',s)
    s=re.sub(r'54/1, Market Lane.*?(?:\(Near Nattu Marunthu kadai\))','[Priya Metal Mart shop address]',s,flags=re.S)
    s=s.replace('Priya Metal hello@','hello@')
    s=re.sub(r'<link[^>]*section-main-page\.css[^>]*>','',s)
    s=re.sub(r'/collections/brass-product-collection/Brass/?','/collections/brass-product-collection/',s)
    s=re.sub(r'\bErode\b','Your City',s)
    # internal links get trailing slash for the static server
    s=re.sub(r'href="(/(?:collections|pages|products|policies)(?:/[\w\-]+)*)(?:/Brass)?(?:\?[^"]*)?"',r'href="\1/"',s).replace('href="/cart"','href="/cart/"')
    return s
h=(RAW/'pages/home.html').read_text()
def strip_scripts(s):
    def k(m):
        g=re.search(r'assets/(constants|pubsub|global|details-disclosure|details-modal|search-form)\.js',m[0])
        return f'<script src="/assets/{g[1]}.js" defer></script>' if g else ''
    return re.sub(r'<script\b.*?</script>',k,s,flags=re.S)
def parts(doc):
    doc=strip_scripts(doc)
    return doc[:doc.find('<main')], doc[doc.find('<main'):doc.find('</main>')+7], doc[doc.find('</main>')+7:]
head,home_main,foot=parts(h)
head=re.sub(r'<(?:meta property|meta name="(?:twitter|description)|link rel="(?:canonical|preconnect|alternate|dns-prefetch)|link rel="preload"(?! )?)[^>]*>','',head)
head=re.sub(r'<link[^>]*(?:icon)[^>]*>','',head)
head=re.sub(r'<script\b.*?</script>',lambda m:m[0] if 'src="/assets' in m[0] else '',head,flags=re.S)
# fonts: keep Shopify's copies locally
fonts=sorted(set(re.findall(r'url\("?(//santhimetaleshop\.in/cdn/fonts/[^"\)]+)',head)))
(OUT/'fonts').mkdir()
for f in fonts:
    n=f.split('/')[-1].split('?')[0]; t=CACHE/n
    try:
        if not t.exists(): t.write_bytes(urllib.request.urlopen(urllib.request.Request('https:'+f,headers={'User-Agent':'priyametalmart-site-analysis/1.0'}),timeout=30).read())
        shutil.copy(t,OUT/'fonts'/n); head=head.replace(f,'/fonts/'+n)
    except Exception as e: print('font fail',n,e)
head=re.sub(r'<link[^>]*well-known/ucp[^>]*>','',clean(head)); foot=clean(foot)
# the logo image carries the old brand, so it becomes text
head=re.sub(r'<div class="header__heading-logo-wrapper">.*?</div>|<img[^>]*header__heading-logo[^>]*>',f'<span class="h2">{BRAND}</span>',head,flags=re.S)
head=re.sub(r'<div class="announcement-bar.*?</div>',lambda m:m[0],head,flags=re.S)
head=re.sub(r'<title>.*?</title>','<title>@@T@@</title>',head,flags=re.S)
EXTRA='''<style>.pmm-page{max-width:1200px;margin:0 auto;padding:40px 20px}.pmm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;list-style:none;padding:0}@media(max-width:989px){.pmm-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:749px){.pmm-grid{grid-template-columns:repeat(2,1fr)}}
.pmm-link{text-decoration:none;color:inherit;display:block}.pmm-link img{width:100%;aspect-ratio:1;object-fit:cover;background:#f3f3f3}.pmm-link span{display:block;margin-top:8px}
.pmm-p{display:grid;grid-template-columns:55% 1fr;gap:40px}.pmm-p img{width:100%}@media(max-width:749px){.pmm-p{grid-template-columns:1fr}}.pmm-qty button{width:40px;height:40px}.pmm-qty input{width:50px;height:40px;text-align:center}.pmm-p .button{width:100%;margin-top:12px}
.pmm-cart{width:100%;border-collapse:collapse}.pmm-cart td{padding:12px;border-bottom:1px solid #ddd;vertical-align:top}.pmm-total{text-align:right}
#pmm-toast{position:fixed;top:16px;right:16px;background:#121212;color:#fff;padding:12px 18px;opacity:0;pointer-events:none;transition:.2s;z-index:99;max-width:320px}#pmm-toast.show{opacity:1}</style>'''
TAIL='<div id="pmm-toast" role="status"></div><script>window.routes={cart_url:"/cart/"};window.Shopify=window.Shopify||{};</script><script src="/assets/app.js" defer></script>'
foot=foot.replace('</body>',TAIL+'</body>')
head=head.replace('</head>',EXTRA+'</head>')
def page(url,title,main):
    p=OUT/url.strip('/')/'index.html' if url!='/' else OUT/'index.html'
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(head.replace('@@T@@',html.escape(title))+main+foot)
def shell(inner): return f'<main id="MainContent" class="content-for-layout" role="main"><div class="pmm-page">{inner}</div></main>'
# catalogue: sitemap + prices from homepage cards
s=(RAW/'sitemap_products.xml').read_text(); P={}
for u in re.findall(r'<url>(.*?)</url>',s,re.S):
    m=re.search(r'/products/([^<]+)</loc>',u)
    if not m: continue
    im=re.search(r'<image:loc>(.*?)</image:loc>',u); ti=re.search(r'<image:title>(.*?)</image:title>',u)
    t=html.unescape(ti[1]) if ti else m[1].replace('-',' ').title()
    P[m[1]]=dict(handle=m[1],title=clean(t),image=local(im[1].split('4452/')[1]) if im else '',price=None,compare=None,front=False)
for c in h.split('card-wrapper product-card-wrapper')[1:]:
    m=re.search(r'href="/products/([^"?]+)',c)
    if not m or m[1] not in P: continue
    a=[float(x.replace(',','')) for x in re.findall(r'Rs\. ([\d,]+\.\d\d)',c[:9000])]
    P[m[1]]['front']=True
    if a: P[m[1]]['price']=min(a); P[m[1]]['compare']=max(a) if max(a)>min(a) else None
cols=json.load(open(RAW/'collections.json'))['collections']
OV=R/'source-data/client_data.json'
if OV.exists():
    for k,v in json.loads(OV.read_text()).items():
        if k in P:
            if v.get('hide'): del P[k]; continue
            P[k].update(v)
KW={'baby-products':'baby|kids|toy|cradle|children','brass-product-collection':'brass','billhook':'billhook|aruval|sickle|koyta','iron-tawa':'tawa|dosa|roti|chapati|tava','gardening-tool':'garden|spade|shovel|hoe|trowel|rake|axe','iron-kadai':'kadai|karai|kadhai|kerahi','knife':'knife|cleaver|chopper','mortar-and-pestle':'mortar|pestle|ammikal|grinding stone|kharal','paniyaram-pan-paddu-pan':'paniyaram|paddu|appam|appe','pooja-items':'pooja|puja|lamp|diya|kamakshi|deepam','rat-trap':'rat trap|mouse|rodent|rat ','sieve':'sieve|strainer|channi|jalli','vegetable-cutter':'cutter|slicer|grater|peeler|chopper','kitchen-essentials':'ladle|spoon|tong|pan|turner|spatula|masher|pot|pressure|stand|grill'}
def card(p):
    pr=f'<s>Rs. {p["compare"]:,.2f}</s> ' if p['compare'] else ''
    pr+=f'Rs. {p["price"]:,.2f}' if p['price'] else 'Price to be confirmed'
    return f'<li><a class="pmm-link" href="/products/{p["handle"]}/"><img src="{p["image"]}" alt="" loading="lazy"><span class="h5">{html.escape(p["title"])}</span><span>{pr}</span></a></li>'
def grid(l): return '<ul class="pmm-grid">'+''.join(map(card,l))+'</ul>'
all_p=list(P.values()); bycol={}
for c in cols:
    k=c['handle']
    l=[p for p in all_p if p['front']] if k=='frontpage' else [p for p in all_p if (k in p['cols'] if p.get('cols') else re.search(KW.get(k,'$^'),p['title'],re.I))]
    bycol[k]=l; img=c['image']['src'].split('4452/')[1] if c.get('image') else ''; c['img']=local(img) if img else ''
    page(f'/collections/{k}/',clean(c['title'])+' | '+BRAND,shell(f'<h1 class="h1">{html.escape(clean(c["title"]))}</h1><p>{len(l)} products</p>'+grid(l)))
(R/'source-data/catalog.json').write_text(json.dumps(dict(products=all_p,collections=[dict(handle=c['handle'],title=clean(c['title'])) for c in cols],members={k:[p['handle'] for p in v] for k,v in bycol.items()}),ensure_ascii=False))
page('/collections/all/','All products | '+BRAND,shell(f'<h1 class="h1">Products</h1><p>{len(all_p)} products</p>'+grid(all_p)))
page('/collections/','Collections | '+BRAND,shell('<h1 class="h1">Collections</h1><ul class="pmm-grid">'+''.join(f'<li><a class="pmm-link" href="/collections/{c["handle"]}/"><img src="{c["img"]}" alt="" loading="lazy"><span class="h4">{html.escape(clean(c["title"]))} →</span></a></li>' for c in cols)+'</ul>'))
for p in all_p:
    d=json.dumps(dict(handle=p['handle'],title=p['title'],price=p['price'],image=p['image'])).replace("'",'&#39;')
    if p['price']:
        price=(f'<s>Rs. {p["compare"]:,.2f}</s> ' if p['compare'] else '')+f'Rs. {p["price"]:,.2f}'
        btn=f'''<div class="pmm-qty"><label>Quantity</label><br><button data-qty="-1" aria-label="Decrease">−</button><input id="Quantity" value="1" inputmode="numeric" aria-label="Quantity"><button data-qty="1" aria-label="Increase">+</button></div><button class="button button--secondary" data-add='{d}'>Add to cart</button><button class="button" data-add='{d}' data-buy>Buy it now</button>'''
    else:
        price='Price to be confirmed'; btn='<button class="button" disabled>Price to be confirmed</button>'
    extra='<div class="rte" style="margin-top:20px">'
    if p.get('sizes'): extra+='<p><b>Sizes / weights:</b> '+html.escape(p['sizes'])+'</p>'
    if p.get('stock') is not None: extra+='<p><b>In stock:</b> '+html.escape(str(p['stock']))+'</p>'
    extra+='<p>'+html.escape(p.get('desc') or 'Add this traditional piece to your kitchen. Priya Metal Mart delivers across India.')+'</p></div>'
    page(f'/products/{p["handle"]}/',p['title']+' | '+BRAND,shell(f'<div class="pmm-p"><div><img src="{p["image"]}" alt=""></div><div><p class="caption">{BRAND.upper()}</p><h1 class="h1">{html.escape(p["title"])}</h1><p class="h3">{price}</p><p class="caption">Tax included.</p>{btn}{extra}</div></div>'))
page('/cart/','Your cart | '+BRAND,shell('<div id="pmm-cart"></div>'))
page('/search/','Search | '+BRAND,shell('<h1 class="h1">Search results</h1><p><span id="pmm-n">0</span> results for “<span id="pmm-q"></span>”</p><ul class="pmm-grid" id="pmm-results"></ul>'))
(OUT/'search-index.json').write_text(json.dumps([{k:p[k] for k in('handle','title','image')} for p in all_p]))
page('/',BRAND,clean(home_main))

OWN={'about-us':'<p>Priya Metal Mart brings traditional Indian kitchenware to homes across India. From iron and cast iron cookware to everyday kitchen tools, we choose products that are built to last.</p><p>Good quality, friendly service and honest pricing are what we care about most. Have a question? We are always happy to hear from you.</p>',
'faq':'<h3>How do I order?</h3><p>Pick your products, add them to your cart, then go to checkout and enter your delivery address and payment choice.</p><h3>Do I need an account?</h3><p>No. You can check out as a guest or sign in to your account.</p><h3>How will my order reach me?</h3><p>We ship to the address you enter at checkout and send you tracking details by email.</p><h3>What payment options are there?</h3><p>[Confirm with client: UPI, cards, net banking, Cash on Delivery.]</p><h3>Can I return a product?</h3><p>[Confirm with client: return and refund terms.]</p>',
'delivery-time':'<p>[Confirm with client: order cutoff time and delivery days for Tamil Nadu and other states.]</p><p>Once your order ships, you will get an email with your tracking number.</p>',
'payment-delivery-information':'<p>[Confirm with client: accepted payment methods and Cash on Delivery areas.]</p><p>Every order ships with tracking. For delivery questions, write to hello@example.com.</p>'}
for x in json.load(open(RAW/'pages.json'))['pages']:
    if x['handle'].startswith('pushdaddy'): continue
    f=RAW/f'pages/pages_{x["handle"]}.html'
    if x['handle'] in OWN: x['body_html']=OWN[x['handle']]; f=pathlib.Path('/nonexistent')
    main=clean(parts(f.read_text())[1]) if f.exists() else shell(f'<h1 class="h1">{html.escape(clean(x["title"]))}</h1><div class="rte">{clean(x["body_html"] or "")}</div>')
    page(f'/pages/{x["handle"]}/',clean(x['title'])+' | '+BRAND,main)
for k,t in dict(zip('contact-information privacy-policy refund-policy shipping-policy terms-of-service'.split(),'Contact information|Privacy policy|Refund policy|Shipping policy|Terms of service'.split('|'))).items():
    page(f'/policies/{k}/',t+' | '+BRAND,shell(f'<h1 class="h1">{t}</h1><p>To be written for {BRAND}.</p>'))
with cf.ThreadPoolExecutor(4) as ex: list(ex.map(fetch,need.items()))
print('products',len(P),'priced',sum(1 for p in all_p if p['price']),'images',len(need),{k:len(v) for k,v in bycol.items()})
