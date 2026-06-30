# Inspect model fields

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
fields = models.execute_kw(db, uid, pwd, '<model>', 'fields_get', [], {'attributes':['type','string','required','relation','selection']})
for fname, finfo in sorted(fields.items()):
    print(f\"{fname}: {finfo['type']} ({finfo['string']})\")
"
```
