---
id: odoo
name: Odoo ERP Management
description: Full Odoo 16.0 ERP interaction via XML-RPC — search, read, create, update, delete records, download reports, inspect models. Supports all standard and custom modules. Uses ODOO_* environment variables. Uses text-based read/write permission guidance.
version: 1
enabled: true
kind: operational
permissions:
  - odoo.read
  - odoo.write
env:
  - key: ODOO_URL
    description: Odoo server URL (e.g. https://erp.example.com or http://localhost:8069)
    required: true
  - key: ODOO_DB
    description: Odoo database name
    required: true
  - key: ODOO_USERNAME
    description: Login username or email for XML-RPC authentication
    required: true
  - key: ODOO_API_KEY
    description: Odoo 16 API key (preferred over password for XML-RPC auth)
    required: false
  - key: ODOO_PASSWORD
    description: Plain password for XML-RPC authentication (fallback if no API key)
    required: false
match:
  - odoo
  - erp
  - sale order
  - invoice
  - product
  - stock
  - crm
  - hr
  - purchase
  - partner
  - report
  - quotation
  - bill
  - lead
  - employee
  - inventory
  - accounting
---

# Odoo ERP Management

## Purpose

Operate an Odoo 16.0 instance through XML-RPC calls. This skill covers reading and writing records across all modules (Sales, Inventory, Accounting, CRM, HR, Purchase, custom modules), downloading reports, and inspecting model schemas — equivalent to what a user can do through the Odoo web UI.

Uses Python 3 stdlib `xmlrpc.client` — no extra packages required. All calls are made from inline Python or standalone scripts, depending on task complexity.

Use text-based permission judgment. Do not add or rely on hardcoded TypeScript command detection for Odoo read/write classification.

## When to use

Activate when the user asks to interact with the company Odoo ERP — query records, create or update data, download reports, or inspect model fields. Trigger words include "odoo", "erp", "sale order", "invoice", "product", "stock/inventory", "crm/lead", "hr/employee", "purchase/po", "partner", "quotation", "report", "bill", "accounting".

## Out of scope

- Module development (writing `__manifest__.py`, Python model classes, XML views, security files)
- Database administration (backup, restore, PostgreSQL management)
- Odoo server operations (restart, upgrade, config file changes)
- Odoo UI-only features with no XML-RPC counterpart
- Odoo Studio / drag-and-drop customizations
- Website / eCommerce frontend modifications

## Use cases

- **List records**: user asks "show me all confirmed sales orders" → `search_read` on `sale.order` with domain filter
- **Get one record**: user asks "show me invoice INV/2024/001" → `search_read` or `read` by ID
- **Create a record**: user asks "create a new lead for Acme Corp" → `create` on `crm.lead`
- **Update a record**: user asks "change the price on quotation Q00042 line 3" → `write` on `sale.order.line`
- **Count records**: user asks "how many pending purchase orders" → `search_count` with domain
- **Download report**: user asks "get the PDF for invoice INV/2024/001" → `render_report` via Odoo report system
- **Inspect model**: user asks "what fields does sale.order have" → `fields_get` on any model
- **Find model**: user asks "what model is used for stock moves" → search `ir.model`

## Permissions

Use the requested intent and the likely Odoo effect to choose the required permission:

- `odoo:odoo.read` — searching, reading, counting, inspecting fields, downloading reports, and operations whose purpose is to observe existing data. Methods: `search_read`, `read`, `search_count`, `fields_get`, `render_report`.
- `odoo:odoo.write` — create, update, delete, and any operation that can change Odoo state. Methods: `create`, `write`, `unlink`.

If an operation is ambiguous, treat it as `odoo:odoo.write` unless the user is only asking to inspect or view current data.

Destructive operations are allowed only when the user explicitly asks for the specific destructive intent: `unlink` (delete records) or `write` that removes data.

## Workflow

1. Classify the requested work as read or write using the permission policy above.
2. Export Odoo connection variables from `ODOO_*` env vars. Verify the connection by calling `authenticate()` without printing secrets.
3. Run the appropriate XML-RPC operation via Python. Use inline `python3 -c` for simple lookups; write a temporary `.py` script for multi-step or complex logic (then clean it up).
4. For read tasks, return confirmed Odoo facts. Include the model, domain used, and result summary.
5. For write tasks, perform only the requested change. Echo back the created/updated record ID(s). For destructive work, proceed only when the user explicitly names the destructive intent.
6. Report outcomes concisely, including model, record IDs, and any Odoo errors. Never print credential values.

## Environment

Use credentials from the environment before every Odoo XML-RPC call. Do not use credential files.

Required variables:
- `ODOO_URL` — Odoo server URL (e.g. `https://erp.example.com` or `http://localhost:8069`)
- `ODOO_DB` — database name
- `ODOO_USERNAME` — login username or email

One of:
- `ODOO_API_KEY` — Odoo 16 API key (preferred, used as password in XML-RPC auth)
- `ODOO_PASSWORD` — plain password (fallback if no API key)

Optional variables:
- `ODOO_COMPANY_ID` — default company ID for multi-company setups

Verify the connection before any real work:

```bash
python3 -c "
import xmlrpc.client, os
url = os.environ['ODOO_URL']
db = os.environ['ODOO_DB']
user = os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
print(f'Authenticated as uid={uid}')
"
```

Never print credential values. Refer to connection details by their env var names only.

## Operations

All operations use Python `xmlrpc.client`. The Odoo 16 XML-RPC endpoints are:

| Endpoint | Path | Purpose |
|---|---|---|
| Common | `/xmlrpc/2/common` | Authentication, version check |
| Object | `/xmlrpc/2/object` | Model CRUD operations |
| Report | `/xmlrpc/2/report` | Report generation and download |

### Auth boilerplate

Every script needs this preamble (never print the password):

```python
import xmlrpc.client, os, json

url = os.environ['ODOO_URL']
db = os.environ['ODOO_DB']
user = os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
```

### Search and read records (`odoo:odoo.read`)

**search_read** — fetch records with a domain filter:

```python
result = models.execute_kw(db, uid, pwd,
    '<model>', 'search_read',
    [[<domain>]],
    {'fields': [<field_list>], 'limit': <n>, 'offset': <m>}
)
```

Domain format: list of tuples `[('field', 'operator', value)]`. Common operators: `=`, `!=`, `>`, `<`, `>=`, `<=`, `like`, `ilike`, `in`, `not in`, `child_of`, `parent_of`.

Examples:
- Confirmed sales orders: `[('state', '=', 'sale')]`
- Invoices for a partner: `[('partner_id', '=', 42), ('move_type', '=', 'out_invoice')]`
- Products with stock below 10: `[('qty_available', '<', 10)]`
- Records created this month: `[('create_date', '>=', '2024-01-01'), ('create_date', '<', '2024-02-01')]`

**read** — get a specific record by ID:

```python
result = models.execute_kw(db, uid, pwd,
    '<model>', 'read',
    [[<id>]],
    {'fields': [<field_list>]}
)
```

**search_count** — count records matching a domain:

```python
count = models.execute_kw(db, uid, pwd,
    '<model>', 'search_count',
    [[<domain>]]
)
```

**fields_get** — inspect model fields:

```python
fields = models.execute_kw(db, uid, pwd,
    '<model>', 'fields_get',
    [],
    {'attributes': ['type', 'string', 'required', 'readonly', 'relation', 'selection']}
)
```

### Create records (`odoo:odoo.write`)

```python
record_id = models.execute_kw(db, uid, pwd,
    '<model>', 'create',
    [{'field': value, ...}]
)
```

Example — create a CRM lead:

```python
lead_id = models.execute_kw(db, uid, pwd,
    'crm.lead', 'create',
    [{'name': 'New Opportunity', 'partner_id': 42, 'type': 'opportunity'}]
)
```

### Update records (`odoo:odoo.write`)

```python
models.execute_kw(db, uid, pwd,
    '<model>', 'write',
    [[<id>], {'field': new_value, ...}]
)
```

For multiple records, pass a list of IDs: `[[1, 2, 3], {...}]`

### Delete records (`odoo:odoo.write`, destructive)

```python
models.execute_kw(db, uid, pwd,
    '<model>', 'unlink',
    [[<id>]]
)
```

Only run when the user explicitly asks to delete. Confirm the record ID and model before proceeding.

### Download reports (`odoo:odoo.read`)

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

### Quick inline patterns

**One-liner to fetch data** (read-only):

```bash
python3 -c "
import xmlrpc.client, os, json
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
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
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
rid = models.execute_kw(db, uid, pwd, '<model>', 'create', [{'name':'<value>'}])
print(f'Created record id={rid}')
"
```

## Quick Examples

Every example includes the required env setup. Copy the full sequence.

### List recent sales orders

```bash
export ODOO_URL="$ODOO_URL" ODOO_DB="$ODOO_DB" ODOO_USERNAME="$ODOO_USERNAME" ODOO_API_KEY="$ODOO_API_KEY"
python3 -c "
import xmlrpc.client, os, json
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
orders = models.execute_kw(db, uid, pwd, 'sale.order', 'search_read', [[['state','in',['sale','done']]]], {'fields':['name','partner_id','amount_total','state','date_order'], 'limit':20, 'order':'date_order desc'})
for o in orders:
    print(f\"{o['name']} | {o['partner_id'][1]} | {o['amount_total']} | {o['state']}\")
"
```

### Find a customer and their invoices

```bash
export ODOO_URL="$ODOO_URL" ODOO_DB="$ODOO_DB" ODOO_USERNAME="$ODOO_USERNAME" ODOO_API_KEY="$ODOO_API_KEY"
python3 -c "
import xmlrpc.client, os, json
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
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

### Create a CRM lead

```bash
export ODOO_URL="$ODOO_URL" ODOO_DB="$ODOO_DB" ODOO_USERNAME="$ODOO_USERNAME" ODOO_API_KEY="$ODOO_API_KEY"
python3 -c "
import xmlrpc.client, os
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
lead_id = models.execute_kw(db, uid, pwd, 'crm.lead', 'create', [{'name':'Website Inquiry - Pricing', 'type':'lead'}])
print(f'Created lead id={lead_id}')
"
```

### Update a sales order line price

```bash
export ODOO_URL="$ODOO_URL" ODOO_DB="$ODOO_DB" ODOO_USERNAME="$ODOO_USERNAME" ODOO_API_KEY="$ODOO_API_KEY"
python3 -c "
import xmlrpc.client, os
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
models.execute_kw(db, uid, pwd, 'sale.order.line', 'write', [[<line_id>], {'price_unit': <new_price>}])
print('Updated')
"
```

### Download an invoice PDF

```bash
export ODOO_URL="$ODOO_URL" ODOO_DB="$ODOO_DB" ODOO_USERNAME="$ODOO_USERNAME" ODOO_API_KEY="$ODOO_API_KEY"
python3 -c "
import xmlrpc.client, os, base64
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
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

### Inspect model fields

```bash
export ODOO_URL="$ODOO_URL" ODOO_DB="$ODOO_DB" ODOO_USERNAME="$ODOO_USERNAME" ODOO_API_KEY="$ODOO_API_KEY"
python3 -c "
import xmlrpc.client, os, json
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
fields = models.execute_kw(db, uid, pwd, '<model>', 'fields_get', [], {'attributes':['type','string','required','relation','selection']})
for fname, finfo in sorted(fields.items()):
    print(f\"{fname}: {finfo['type']} ({finfo['string']})\")
"
```

### Find which model to use

```bash
export ODOO_URL="$ODOO_URL" ODOO_DB="$ODOO_DB" ODOO_USERNAME="$ODOO_USERNAME" ODOO_API_KEY="$ODOO_API_KEY"
python3 -c "
import xmlrpc.client, os
url, db, user = os.environ['ODOO_URL'], os.environ['ODOO_DB'], os.environ['ODOO_USERNAME']
pwd = os.environ.get('ODOO_API_KEY') or os.environ.get('ODOO_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
matches = models.execute_kw(db, uid, pwd, 'ir.model', 'search_read', [[['model','ilike','<search_term>']]], {'fields':['model','name'], 'limit':10})
for m in matches:
    print(f\"{m['model']}: {m['name']}\")
"
```

## Key Odoo Models

Common model names to use in XML-RPC calls:

| Model | Name | Common Fields |
|---|---|---|
| `res.partner` | Contacts | `name`, `email`, `phone`, `company_type`, `vat` |
| `sale.order` | Sales Orders | `name`, `partner_id`, `amount_total`, `state`, `date_order` |
| `sale.order.line` | Sales Order Lines | `order_id`, `product_id`, `product_uom_qty`, `price_unit` |
| `account.move` | Journal Entries / Invoices | `name`, `partner_id`, `amount_total`, `move_type`, `state` |
| `account.move.line` | Journal Items | `move_id`, `account_id`, `debit`, `credit`, `partner_id` |
| `purchase.order` | Purchase Orders | `name`, `partner_id`, `amount_total`, `state`, `date_order` |
| `stock.move` | Stock Moves | `product_id`, `product_uom_qty`, `state`, `location_id`, `location_dest_id` |
| `stock.quant` | Stock On Hand | `product_id`, `quantity`, `location_id` |
| `stock.picking` | Transfers | `name`, `picking_type_id`, `state`, `move_ids` |
| `product.product` | Product Variants | `name`, `default_code`, `lst_price`, `qty_available` |
| `product.template` | Product Templates | `name`, `list_price`, `type`, `categ_id` |
| `crm.lead` | CRM Leads/Opportunities | `name`, `partner_id`, `type` (lead/opportunity), `stage_id`, `probability` |
| `hr.employee` | Employees | `name`, `department_id`, `job_id`, `work_email` |
| `hr.attendance` | Attendance | `employee_id`, `check_in`, `check_out` |
| `ir.model` | Model Registry | `model`, `name` |

## Report Names

Common Odoo 16 report references:

| Report Technical Name | What It Generates |
|---|---|
| `account.report_invoice` | Single invoice PDF |
| `account.report_invoice_with_payments` | Invoice with payment info |
| `sale.report_saleorder` | Sale order / quotation PDF |
| `purchase.report_purchaseorder` | Purchase order PDF |
| `purchase.report_purchasequotation` | Purchase RFQ PDF |
| `stock.report_picking` | Delivery slip / picking PDF |
| `stock.report_deliveryslip` | Delivery slip PDF |
| `stock.report_picking_operations` | Picking operations (detailed) |
| `stock.report_product_template_label` | Product barcode labels |

## Output

- Keep replies concise and operational.
- Include the model name, domain used, record ID(s) created/updated, and result count.
- When listing records, use compact format: one line per record with key fields.
- Redact credential values, env var values, and API keys.
- Include the exact python -c command run (with redacted auth boilerplate).
- Report Odoo errors with the fault code and message.
- Separate confirmed Odoo facts from assumptions.
- If blocked by missing env vars, authentication failure, or Odoo API errors, state the blocker and the smallest next step.

## Checks

- Always export `ODOO_*` env vars before any XML-RPC call.
- Always verify the connection by calling `authenticate()` before doing real work.
- Never print credential values, API keys, passwords, or auth tokens.
- If Python 3 is not available, tell the user to install it first.
- If an operation is ambiguous, treat it as write.
- Destructive operations (unlink) must be explicitly requested by the user before proceeding.
- Clean up temporary `.py` script files after execution.
- When using inline Python, ensure complex strings are properly escaped.
- For multi-record writes, confirm the operation scope with the user if it affects more than 10 records.

## Cross-skill convention

Other skills that need Odoo data or reports should not embed their own XML-RPC calls. Route Odoo work through this skill.
