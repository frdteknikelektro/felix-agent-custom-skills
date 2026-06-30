# Create a CRM lead

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
lead_id = models.execute_kw(db, uid, pwd, 'crm.lead', 'create', [{'name':'Website Inquiry - Pricing', 'type':'lead'}])
print(f'Created lead id={lead_id}')
"
```
