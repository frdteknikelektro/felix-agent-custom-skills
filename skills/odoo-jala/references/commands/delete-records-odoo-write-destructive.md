# Delete records (`odoo.write`, destructive)

```python
models.execute_kw(db, uid, pwd,
    '<model>', 'unlink',
    [[<id>]]
)
```

Only run when the user explicitly asks to delete. Confirm the record ID and model before proceeding.
