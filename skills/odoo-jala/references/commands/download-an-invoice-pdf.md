# Download an invoice PDF

```bash
python3 -c "
import xmlrpc.client, os, base64
url = os.environ.get('ODOO_JALA_URL', 'https://odoo.jala.tech')
db = os.environ['ODOO_JALA_DB']
user = os.environ['ODOO_JALA_USERNAME']
pwd = os.environ.get('ODOO_JALA_API_KEY') or os.environ.get('ODOO_JALA_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
report = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/report')
result = report.render_report(db, uid, pwd, 'account.report_invoice', [<invoice_id>], {})
pdf = base64.b64decode(result['result'])
with open('invoice.pdf', 'wb') as f:
    f.write(pdf)
print(f'Wrote invoice.pdf ({len(pdf)} bytes)')
"
```
