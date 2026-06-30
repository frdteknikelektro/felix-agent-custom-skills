# Create records (`odoo.write`)

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
