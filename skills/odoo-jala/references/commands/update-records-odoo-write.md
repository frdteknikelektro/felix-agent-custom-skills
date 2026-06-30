# Update records (`odoo.write`)

```python
models.execute_kw(db, uid, pwd,
    '<model>', 'write',
    [[<id>], {'field': new_value, ...}]
)
```

For multiple records, pass a list of IDs: `[[1, 2, 3], {...}]`
