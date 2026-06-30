# List recent sales orders

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
orders = models.execute_kw(db, uid, pwd, 'sale.order', 'search_read', [[['state','in',['sale','done']]]], {'fields':['name','partner_id','amount_total','state','date_order'], 'limit':20, 'order':'date_order desc'})
for o in orders:
    print(f\"{o['name']} | {o['partner_id'][1]} | {o['amount_total']} | {o['state']}\")
"
```
