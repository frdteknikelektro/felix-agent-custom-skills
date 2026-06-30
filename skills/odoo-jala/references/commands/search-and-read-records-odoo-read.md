# Search and read records (`odoo.read`)

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
