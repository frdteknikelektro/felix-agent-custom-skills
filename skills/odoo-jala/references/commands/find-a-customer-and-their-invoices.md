# Find a customer and their invoices

```bash
python3 -c "
import xmlrpc.client, os, json
url = os.environ.get('ODOO_JALA_URL', 'https://odoo.jala.tech')
db = os.environ['ODOO_JALA_DB']
user = os.environ['ODOO_JALA_USERNAME']
pwd = os.environ.get('ODOO_JALA_API_KEY') or os.environ.get('ODOO_JALA_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
# Find partner
partners = models.execute_kw(db, uid, pwd, 'res.partner', 'search_read', [[['name','ilike','Acme']]], {'fields':['id','name'], 'limit':5})
if partners:
    pid = partners[0]['id']
    print(f\"Partner: {partners[0]['name']} (id={pid})\")
    invoices = models.execute_kw(db, uid, pwd, 'account.move', 'search_read', [[['partner_id','=',pid],['move_type','=','out_invoice']]], {'fields':['name','invoice_date','amount_total','state'], 'limit':10})
    for inv in invoices:
        print(f\"  {inv['name']} | {inv['invoice_date']} | {inv['amount_total']} | {inv['state']}\")
"
```
