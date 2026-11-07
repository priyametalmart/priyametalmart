"""Creates the client fill-in workbook from source-data/catalog.json."""
import json,io,pathlib
from openpyxl import Workbook
from openpyxl.styles import Font,PatternFill,Alignment,Border,Side
from openpyxl.drawing.image import Image as XI
from openpyxl.worksheet.datavalidation import DataValidation
from PIL import Image
R=pathlib.Path(__file__).resolve().parent.parent; C=json.load(open(R/'source-data/catalog.json'))
F='Arial'; titles={c['handle']:c['title'] for c in C['collections'] if c['handle']!='frontpage'}
m={}
for k,v in C['members'].items():
    if k in titles:
        for h in v: m.setdefault(h,[]).append(titles[k])
wb=Workbook(); g=wb.active; g.title='Instructions'
L=['Priya Metal Mart: product details to fill in','','1. Go to the "Products" tab. There is one row per product.','2. Fill in the YELLOW columns. Selling price is required for a product to be sold.','3. Set "Sell this?" to No for any product you do not sell. It will be removed.','Also fill in the "Store details" tab. Mark "New photo sent?" as Yes once you send a product\'s own photo.','4. Fix the name or collection if it is wrong. Separate several collections with a semicolon ( ; ).','5. Do not change or delete the Product ID column.','6. Save this file and send it back.','','Example of a filled row:','Selling price: 499   |   MRP: 799   |   Sizes/weights: 8 inch - 800 g; 10 inch - 1 kg   |   Sell this?: Yes','','Notes:','Prices are in rupees, numbers only (no "Rs." or commas).','The "Reference price" column is the price seen on the original site, for 18 products only. It is not your price.','Valid collection names are on the "Collections" tab.','Collections are auto-suggested from product names, so please check them.']
for i,t in enumerate(L,1):
    c=g.cell(i,1,t); c.font=Font(name=F,size=14 if i==1 else 11,bold=i in(1,10,13))
g.column_dimensions['A'].width=115
s=wb.create_sheet('Products')
H=['Product ID','Photo','Product name','Collections','Reference price (Rs.)','Selling price (Rs.)','MRP (Rs.)','Sizes / weights','Stock quantity','Sell this?','Description / notes','New photo sent?','Weight for shipping (g)','GST %','HSN code']
W=[12,13,55,34,13,13,13,26,10,9,40,10,11,8,10]
Y=PatternFill('solid',fgColor='FFF2A8'); HF=PatternFill('solid',fgColor='5F9598'); B=Border(*(Side(style='thin',color='CCCCCC'),)*4)
for i,(h,w) in enumerate(zip(H,W),1):
    c=s.cell(1,i,h); c.font=Font(name=F,bold=True,color='FFFFFF'); c.fill=HF; c.alignment=Alignment(wrap_text=True,vertical='center',horizontal='center')
    s.column_dimensions[c.column_letter].width=w
s.row_dimensions[1].height=36
for r,p in enumerate(C['products'],2):
    v=[p['handle'],None,p['title'],'; '.join(m.get(p['handle'],[])),p['price'],None,None,None,None,'Yes',None,'No',None,None,None]
    for i,x in enumerate(v,1):
        c=s.cell(r,i,x); c.font=Font(name=F,size=10); c.border=B; c.alignment=Alignment(wrap_text=True,vertical='center')
        if i in(6,7,8,9,10,12,13,14,15): c.fill=Y
    for i in(5,6,7): s.cell(r,i).number_format='#,##0.00'
    s.row_dimensions[r].height=62
    f=R/'site'/p['image'].lstrip('/')
    if p['image'] and f.exists():
        try:
            im=Image.open(f).convert('RGB'); im.thumbnail((78,78)); b=io.BytesIO(); im.save(b,'JPEG',quality=70); b.seek(0)
            x=XI(b); s.add_image(x,f'B{r}')
        except Exception as e: print('thumb',f,e)
n=len(C['products'])+1
d=DataValidation(type='list',formula1='"Yes,No"',allow_blank=False); s.add_data_validation(d); d.add(f'J2:J{n}')
d2=DataValidation(type='decimal',operator='greaterThanOrEqual',formula1='0',allow_blank=True,showErrorMessage=True,error='Enter a number only'); s.add_data_validation(d2); d2.add(f'F2:G{n}')
s.freeze_panes='D2'; s.auto_filter.ref=f'A1:O{n}'; d.add(f'L2:L{n}'); s.column_dimensions['A'].hidden=True
t=wb.create_sheet('Collections'); t['A1']='Collection name'; t['A1'].font=Font(name=F,bold=True); t.column_dimensions['A'].width=50
for i,x in enumerate(titles.values(),2): t.cell(i,1,x).font=Font(name=F)
q=wb.create_sheet('Store details')
Q=[('Shop details',None),('Shop name shown on the website','Priya Metal Mart'),('Registered business name',None),('Owner / contact person',None),('Short description of the shop (2 or 3 lines)',None),('Year started',None),
('Contact',None),('Phone number',None),('WhatsApp number',None),('Email',None),('Shop address',None),('City and PIN code',None),('Opening hours',None),
('Business and tax',None),('GST number (GSTIN)',None),('PAN (needed by the payment gateway)',None),('Bank account ready for payouts? (Yes/No)',None),
('Website',None),('Domain name wanted, e.g. priyametalmart.in',None),('Logo file sent? (Yes/No)',None),('Facebook link',None),('Instagram link',None),('YouTube link',None),
('Payments',None),('Accept UPI, cards and net banking? (Yes/No)',None),('Accept Cash on Delivery? (Yes/No)',None),('Areas or order limit for Cash on Delivery',None),('Extra charge for Cash on Delivery',None),
('Shipping',None),('Courier used',None),('Shipping charge: Tamil Nadu',None),('Shipping charge: other states',None),('Free shipping above (Rs.)',None),('Delivery days: Tamil Nadu',None),('Delivery days: other states',None),('Order cutoff time for same-day dispatch',None),
('Returns',None),('Return period (days)',None),('Conditions for returns',None),('Who pays return shipping',None),('Refund method and time',None)]
HD={'Shop details','Contact','Business and tax','Website','Payments','Shipping','Returns'}
q.column_dimensions['A'].width=48; q.column_dimensions['B'].width=60
for i,(a,b) in enumerate(Q,1):
    x=q.cell(i,1,a); x.font=Font(name=F,bold=a in HD,color='FFFFFF' if a in HD else '000000')
    if a in HD: x.fill=HF; q.cell(i,2).fill=HF
    else:
        y=q.cell(i,2,b); y.fill=Y; y.font=Font(name=F); y.alignment=Alignment(wrap_text=True); y.border=B
wb.active=1; wb.save(R/'Priya_Metal_Mart_Product_Sheet.xlsx'); print(len(C['products']))
