# Priya Metal Mart: local UI preview
Run: `python3 -I tools/build.py`, then `cd site && python3 -m http.server 4173`, and open http://localhost:4173

Client sheet: `Priya_Metal_Mart_Product_Sheet.xlsx`. Load it back with
`.venv/bin/python tools/import_sheet.py <file.xlsx>`, then `python3 -I tools/build.py`.

## Storefront (from scratch, no Dawn code)
`web/` is the Next.js site. Data comes from `tools/export_web.py`.
Run: `cd web && npm run build && cd out && python3 -m http.server 3000`, then open http://localhost:3000
