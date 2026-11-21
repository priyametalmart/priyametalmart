"""Reads the filled workbook into source-data/client_data.json. Usage: python3 tools/import_sheet.py file.xlsx [output.json]"""
import json,sys,pathlib
from openpyxl import load_workbook
R=pathlib.Path(__file__).resolve().parent.parent
C=json.load(open(R/'source-data/catalog.json')); T={c['title'].lower():c['handle'] for c in C['collections']}
s=load_workbook(sys.argv[1],data_only=True)['Products']; O={}; miss=[]
for r in s.iter_rows(min_row=2,values_only=True):
    h,_,name,cols,_,price,mrp,sizes,stock,sell,notes=r[:11]
    if not h: continue
    if str(sell or 'Yes').strip().lower()=='no': O[h]={'hide':True}; continue
    v={'title':name,'price':float(price) if price not in(None,'') else None,'compare':float(mrp) if mrp not in(None,'') and float(mrp)>float(price or 0) else None}
    c=[]
    for x in str(cols or '').split(';'):
        x=x.strip()
        if x:
            if x.lower() in T: c.append(T[x.lower()])
            else: miss.append(x)
    if c: v['cols']=c
    if sizes: v['sizes']=str(sizes)
    if stock not in(None,''): v['stock']=stock
    if notes: v['desc']=str(notes)
    O[h]=v
out=pathlib.Path(sys.argv[2]) if len(sys.argv)>2 else R/'source-data/client_data.json'
out.write_text(json.dumps(O,ensure_ascii=False,indent=0))
print('rows',len(O),'priced',sum(1 for v in O.values() if v.get('price')),'hidden',sum(1 for v in O.values() if v.get('hide')),'unknown collections',sorted(set(miss)))
