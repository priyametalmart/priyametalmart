"""Cuts white backgrounds out of hero product photos. Rerun after swapping in the client's own photos."""
import pathlib,sys
from PIL import Image,ImageDraw,ImageFilter,ImageChops
R=pathlib.Path(__file__).resolve().parent.parent; out=R/'web/public/brand'; out.mkdir(exist_ok=True)
J={'hero-kadai2':'3-c0337fb7-c81b-4ede-9d6c-9da14a','hero-tawa':'Untitleddesign_3_97a73db9-6b4a-4'}
for name,pre in J.items():
    f=next((R/'web/public/images').glob(pre+'*')); im=Image.open(f).convert('RGB').resize((1400,1400),Image.LANCZOS) if Image.open(f).width<1400 else Image.open(f).convert('RGB')
    w,h=im.size; g=im.convert('L').point(lambda v:255 if v>238 else 0)
    m=g.copy()
    for xy in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
        if m.getpixel(xy)==255: ImageDraw.floodfill(m,xy,128)
    alpha=m.point(lambda v:0 if v==128 else 255).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.4))
    a=im.copy(); a.putalpha(alpha); b=a.getbbox(); a=a.crop(alpha.getbbox()); 
    seeds={'hero-kadai2':[(.075,.34),(.91,.34)]}.get(name,[])
    if seeds:
        W,H=a.size; g2=a.convert('L').point(lambda v:255 if v>225 else 0)
        for sx,sy in seeds: ImageDraw.floodfill(g2,(int(sx*W),int(sy*H)),128)
        hole=g2.point(lambda v:255 if v==128 else 0).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
        a.putalpha(ImageChops.subtract(a.getchannel('A'),hole))
    a.save(out/f'{name}.png',optimize=True); print(name,a.size)
