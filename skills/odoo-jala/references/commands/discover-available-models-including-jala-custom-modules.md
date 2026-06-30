# Discover available models (including Jala custom modules)

```bash
python3 -c "
import xmlrpc.client, os
url = os.environ.get('ODOO_JALA_URL', 'https://odoo.jala.tech')
db = os.environ['ODOO_JALA_DB']
user = os.environ['ODOO_JALA_USERNAME']
pwd = os.environ.get('ODOO_JALA_API_KEY') or os.environ.get('ODOO_JALA_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
matches = models.execute_kw(db, uid, pwd, 'ir.model', 'search_read', [[['model','ilike','<search_term>']]], {'fields':['model','name'], 'limit':10})
for m in matches:
    print(f\"{m['model']}: {m['name']}\")
"
```
