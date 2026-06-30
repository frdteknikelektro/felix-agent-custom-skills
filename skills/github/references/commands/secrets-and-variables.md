# Secrets & Variables

**List secrets** (`github.read`):

```bash
gh secret list
gh secret list --repo [owner/repo]
gh secret list --org <org-name>
```

**List variables** (`github.read`):

```bash
gh variable list
gh variable list --repo [owner/repo]
gh variable list --org <org-name>
```

**Set a secret** (`github.write`):

```bash
gh secret set <key>
gh secret set <key> --repo [owner/repo]
gh secret set <key> --org <org-name>
gh secret set <key> --body "<value>"
gh secret set <key> < <file-containing-value>
```

Never print secret values in replies. Refer to them by key name only.

**Delete a secret** (`github.write`):

```bash
gh secret delete <key>
gh secret delete <key> --repo [owner/repo] --yes
gh secret delete <key> --org <org-name> --yes
```

This is destructive. Only run when the user explicitly asks.

**Set a variable** (`github.write`):

```bash
gh variable set <key>
gh variable set <key> --repo [owner/repo]
gh variable set <key> --org <org-name>
gh variable set <key> --body "<value>"
```

**Delete a variable** (`github.write`):

```bash
gh variable delete <key>
gh variable delete <key> --repo [owner/repo] --yes
gh variable delete <key> --org <org-name> --yes
```

This is destructive. Only run when the user explicitly asks.
