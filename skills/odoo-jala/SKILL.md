---
name: odoo-jala
description: Jala Odoo 16.0 ERP interaction via XML-RPC — search, read, create, update, delete records, download reports, inspect models. Supports all standard and custom modules (including Jala-specific modules). Uses ODOO_JALA_* environment variables. Uses text-based read/write permission guidance.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: odoo.read, odoo.write
  match: odoo, odoo jala, jala odoo, erp, sale order, invoice, product, stock, crm, hr, purchase, partner, report, quotation, bill, lead, employee, inventory, accounting
env:
  - key: ODOO_JALA_URL
    description: Jala Odoo server URL (default https://odoo.jala.tech)
    required: true
  - key: ODOO_JALA_DB
    description: Jala Odoo database name
    required: true
  - key: ODOO_JALA_USERNAME
    description: Login username or email for XML-RPC authentication
    required: true
  - key: ODOO_JALA_API_KEY
    description: Odoo 16 API key (preferred over password for XML-RPC auth)
    required: false
  - key: ODOO_JALA_PASSWORD
    description: Plain password for XML-RPC authentication (fallback if no API key)
    required: false
---

# Odoo Jala ERP Management

## Purpose

Operate Jala's Odoo 16.0 instance through XML-RPC calls. This skill covers reading and writing records across all modules (Sales, Inventory, Accounting, CRM, HR, Purchase, and Jala-specific custom modules), downloading reports, and inspecting model schemas — equivalent to what a user can do through the Odoo web UI.

**Default target**: `https://odoo.jala.tech`. Override via `ODOO_JALA_URL`.

Uses Python 3 stdlib `xmlrpc.client` — no extra packages required. All calls are made from inline Python or standalone scripts, depending on task complexity.

Use text-based permission judgment. Do not add or rely on hardcoded TypeScript command detection for Odoo read/write classification.

## When to use

Activate when the user asks to interact with Jala's Odoo ERP — query records, create or update data, download reports, or inspect model fields. Trigger words include "odoo", "jala odoo", "erp", "sale order", "invoice", "product", "stock/inventory", "crm/lead", "hr/employee", "purchase/po", "partner", "quotation", "report", "bill", "accounting".

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

Request the bare permission shown below; Felix stores grants under this skill id.

- `odoo.read` — searching, reading, counting, inspecting fields, downloading reports, and operations whose purpose is to observe existing data. Methods: `search_read`, `read`, `search_count`, `fields_get`, `render_report`.
- `odoo.write` — create, update, delete, and any operation that can change Odoo state. Methods: `create`, `write`, `unlink`.

If an operation is ambiguous, treat it as `odoo.write` unless the user is only asking to inspect or view current data.

Destructive operations are allowed only when the user explicitly asks for the specific destructive intent: `unlink` (delete records) or `write` that removes data.

## Execution

1. Classify the requested work as read or write using the permission policy above.
2. Export Odoo connection variables from `ODOO_JALA_*` env vars. Verify the connection by calling `authenticate()` without printing secrets.
3. Run the appropriate XML-RPC operation via Python. Use inline `python3 -c` for simple lookups; write a temporary `.py` script for multi-step or complex logic (then clean it up).
4. For read tasks, return confirmed Odoo facts. Include the model, domain used, and result summary.
5. For write tasks, perform only the requested change. Echo back the created/updated record ID(s). For destructive work, proceed only when the user explicitly names the destructive intent.
6. Report outcomes concisely, including model, record IDs, and any Odoo errors. Never print credential values.

## Environment

Use credentials from the `ODOO_JALA_*` environment variables. Do not use credential files.

Required variables:
- `ODOO_JALA_URL` — Jala Odoo server URL (default: `https://odoo.jala.tech`)
- `ODOO_JALA_DB` — database name
- `ODOO_JALA_USERNAME` — login username or email

One of:
- `ODOO_JALA_API_KEY` — Odoo 16 API key (preferred, used as password in XML-RPC auth)
- `ODOO_JALA_PASSWORD` — plain password (fallback if no API key)

Command pattern:

```bash
export ODOO_URL="$ODOO_JALA_URL"
export ODOO_DB="$ODOO_JALA_DB"
export ODOO_USERNAME="$ODOO_JALA_USERNAME"
if [ -n "${ODOO_JALA_API_KEY:-}" ]; then export ODOO_API_KEY="$ODOO_JALA_API_KEY"; fi
if [ -n "${ODOO_JALA_PASSWORD:-}" ]; then export ODOO_PASSWORD="$ODOO_JALA_PASSWORD"; fi
```

Verify the connection before any real work:

```bash
python3 -c "
import xmlrpc.client, os
url = os.environ.get('ODOO_JALA_URL', 'https://odoo.jala.tech')
db = os.environ['ODOO_JALA_DB']
user = os.environ['ODOO_JALA_USERNAME']
pwd = os.environ.get('ODOO_JALA_API_KEY') or os.environ.get('ODOO_JALA_PASSWORD')
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, user, pwd, {})
print(f'Authenticated as uid={uid}')
"
```

Never print credential values. Refer to connection details by their env var names only.

## Operation references

Keep this file for routing, permission policy, environment setup, output rules, and completion checks. Load only the reference needed for the requested branch:

- **Auth boilerplate** — read [auth-boilerplate](references/commands/auth-boilerplate.md).
- **Search and read records (`odoo.read`)** — read [search-and-read-records-odoo-read](references/commands/search-and-read-records-odoo-read.md).
- **Create records (`odoo.write`)** — read [create-records-odoo-write](references/commands/create-records-odoo-write.md).
- **Update records (`odoo.write`)** — read [update-records-odoo-write](references/commands/update-records-odoo-write.md).
- **Delete records (`odoo.write`, destructive)** — read [delete-records-odoo-write-destructive](references/commands/delete-records-odoo-write-destructive.md).
- **Download reports (`odoo.read`)** — read [download-reports-odoo-read](references/commands/download-reports-odoo-read.md).
- **Quick inline patterns** — read [quick-inline-patterns](references/commands/quick-inline-patterns.md).
- **Quick Examples** — read [quick-examples](references/commands/quick-examples.md).
- **List recent sales orders** — read [list-recent-sales-orders](references/commands/list-recent-sales-orders.md).
- **Find a customer and their invoices** — read [find-a-customer-and-their-invoices](references/commands/find-a-customer-and-their-invoices.md).
- **Create a CRM lead** — read [create-a-crm-lead](references/commands/create-a-crm-lead.md).
- **Update a sales order line price** — read [update-a-sales-order-line-price](references/commands/update-a-sales-order-line-price.md).
- **Download an invoice PDF** — read [download-an-invoice-pdf](references/commands/download-an-invoice-pdf.md).
- **Inspect model fields** — read [inspect-model-fields](references/commands/inspect-model-fields.md).
- **Discover available models (including Jala custom modules)** — read [discover-available-models-including-jala-custom-modules](references/commands/discover-available-models-including-jala-custom-modules.md).
- **Key Odoo Models** — read [key-odoo-models](references/commands/key-odoo-models.md).
- **Report Names** — read [report-names](references/commands/report-names.md).

For any mutating branch, completion requires the requested remote state to be observed directly or by a follow-up read when the platform exposes one.

## Output

- Keep replies concise and operational.
- Include the model name, domain used, record ID(s) created/updated, and result count.
- When listing records, use compact format: one line per record with key fields.
- Redact credential values, env var values, and API keys.
- Include the exact python3 -c command run (with redacted auth boilerplate).
- Report Odoo errors with the fault code and message.
- Separate confirmed Odoo facts from assumptions.
- If blocked by missing env vars, authentication failure, or Odoo API errors, state the blocker and the smallest next step.
- Default target is `https://odoo.jala.tech` unless `ODOO_JALA_URL` overrides it.
- For custom Jala modules, discover model names at runtime via `ir.model` search rather than guessing.

## Constraints

- Always export `ODOO_JALA_*` env vars before any XML-RPC call.
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
