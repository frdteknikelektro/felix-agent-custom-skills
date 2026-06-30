# Auth boilerplate

Every script needs this preamble (never print the password):

```python
import xmlrpc.client, os, json

url = os.environ.get('ODOO_JALA_URL', 'https://odoo.jala.tech')
db = os.environ['ODOO_JALA_DB']
user = os.environ['ODOO_JALA_USERNAME']
pwd = os.environ.get('ODOO_JALA_API_KEY') or os.environ.get('ODOO_JALA_PASSWORD')

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
```
