# Quick inline patterns

**One-liner to fetch data** (read-only):

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
result = models.execute_kw(db, uid, pwd, '<model>', 'search_read', [[('state','=','sale')]], {'fields':['name','partner_id','amount_total'], 'limit':10})
print(json.dumps(result, indent=2))
"
```

**One-liner to create** (write):

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
rid = models.execute_kw(db, uid, pwd, '<model>', 'create', [{'name':'<value>'}])
print(f'Created record id={rid}')
"
```
