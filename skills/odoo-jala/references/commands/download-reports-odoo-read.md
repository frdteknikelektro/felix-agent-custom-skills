# Download reports (`odoo.read`)

```python
report = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/report')
result = report.render_report(db, uid, pwd,
    '<report_name>', [<ids>],
    {'<format>': {}, ...}
)
```

Write the PDF/base64 output to a file:

```python
import base64
pdf_data = base64.b64decode(result['result'])
with open('report.pdf', 'wb') as f:
    f.write(pdf_data)
```

Common report names:
- Invoices: `account.report_invoice` (single) / `account.report_invoice_with_payments` (with payment info)
- Sales orders: `sale.report_saleorder` (single) / `sale.report_saleorder_document` (quotation/order)
- Purchase orders: `purchase.report_purchasequotation` (RFQ) / `purchase.report_purchaseorder` (PO)
- Picking slips: `stock.report_picking`
- Products: `stock.report_product_template_label`
