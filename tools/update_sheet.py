"""Fills the client workbook with reference prices and flags products that have sizes."""
import json,re,pathlib,copy
from urllib.parse import unquote
from openpyxl import load_workbook
from openpyxl.styles import Font,PatternFill,Alignment
R=pathlib.Path(__file__).resolve().parent.parent; X=R/'Priya_Metal_Mart_Product_Sheet.xlsx'
slug=lambda h:re.sub(r'-+','-',re.sub(r'[^a-z0-9-]','',unquote(h).lower())).strip('-')
P={p['handle']:p for p in json.load(open(R/'web/src/data/catalog.json'))['products']}
V={p['handle']:p['variants'] for p in json.load(open(R/'source-data/reference/scraped.json'))['products']}
wb=load_workbook(X); s=wb['Products']
H=[('Reference MRP (Rs.)',13),('Reference prices by size (Rs.)',24),('Needs size list?',10),('Sold out on reference?',10)]
for i,(h,w) in enumerate(H,16):
    c=s.cell(1,i,h); c._style=copy.copy(s.cell(1,15)._style); s.column_dimensions[c.column_letter].width=w
RED=PatternFill('solid',fgColor='F8C9B8'); F=Font(name='Arial',size=10); n=sizes=off=0
for r in range(2,s.max_row+1):
    h=slug(s.cell(r,1).value or ''); p=P.get(h)
    if not p:
        off+=1; s.cell(r,10).value='No'; s.cell(r,11).value='Not on the website now. Change to Yes if you want to sell it.'; continue
    n+=1; pr=sorted({float(v['price']) for v in V[h]})
    s.cell(r,5).value=p['price']; s.cell(r,6).value=p['price']; s.cell(r,7).value=p['compare']
    many=len(pr)>1
    vals=[p['compare'],', '.join(f'{x:g}' for x in pr) if many else None,'Yes' if many else 'No','Yes' if p['soldOut'] else 'No']
    for i,x in enumerate(vals,16):
        c=s.cell(r,i,x); c.font=F; c.alignment=Alignment(wrap_text=True,vertical='center')
    s.cell(r,16).number_format='#,##0.00'
    if many: sizes+=1; s.cell(r,8).fill=RED; s.cell(r,18).fill=RED
s.auto_filter.ref=f'A1:S{s.max_row}'
g=wb['Instructions']
for r in range(1,g.max_row+1): g.cell(r,1).value=None
L=['Priya Metal Mart: product details to check and fill in','','Updated 7 November 2026. Selling price and MRP are already filled in from the reference site.','','What to do on the "Products" tab','1. Check the Selling price and MRP in each row. Change any that are wrong.','2. MRP must be a genuine price that you stand behind. It creates the crossed-out price and % off.',f'3. RED rows ({sizes} products) have several sizes. List every size with its own price in the Sizes / weights column.','4. Enter stock, shipping weight, GST % and HSN code in the yellow columns.','5. Set "Sell this?" to No for anything you do not sell. It will be removed from the website.',f'6. {off} rows are already set to No because they are not on the website. Change to Yes only if you sell them.','7. Mark "New photo sent?" as Yes once you send that product\'s own photo.','8. Fix a name or collection if it is wrong. Separate several collections with a semicolon ( ; ).','9. Do not change the Product ID column.','','Then fill in the "Store details" tab, save this file and send it back.','','Example for a RED row, in Sizes / weights:','8 inch - 400; 10 inch - 500; 12 inch - 700','','Notes:','Prices are in rupees, numbers only (no "Rs." or commas).','The Reference columns show what the reference site listed on 7 November 2026. They are not your prices.','Valid collection names are on the "Collections" tab.','Use the filter on "Needs size list?" to show only the RED rows.']
for i,t in enumerate(L,1):
    c=g.cell(i,1,t); c.font=Font(name='Arial',size=14 if i==1 else 11,bold=i in(1,5,16,18,21))
q=wb['Store details']
for r in range(1,q.max_row+1):
    a=q.cell(r,1).value or ''
    if a.startswith('PAN'): q.cell(r,1).value='PAN ready for payment setup? (Yes/No, do not enter the number)'
    if a.startswith('GST number'): q.cell(r,1).value='GST number ready for payment setup? (Yes/No, do not enter the number)'
wb.save(X); print('rows',n,'sizes',sizes,'off',off)
